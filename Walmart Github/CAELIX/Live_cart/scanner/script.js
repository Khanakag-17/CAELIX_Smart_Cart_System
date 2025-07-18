import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js";
import {
  getFirestore, collection, doc, getDoc, getDocs, setDoc, serverTimestamp, updateDoc, increment, deleteDoc,query,arrayUnion,where,onSnapshot
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";

import {
  getAuth, onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";

// Firebase config
const firebaseConfig = {
  // Your Firebase configuration
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Globals
const userId = localStorage.getItem("uid");
let currentUserUid = null;

if (!userId) {
  alert("User not logged in. Please return to the dashboard.");
  window.location.href = "../../User_Dashboard//user_dash.html";
}

let phase = "link";
let cartId = null;
let total = 0;
const cart = {};
let scanner;
let userGroupId = null;
let userRole = null;
let checkoutInitiated = false;

// Firestore product fetch
async function getProductDetails(barcode) {
  const docRef = doc(db, "products", barcode);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? docSnap.data() : null;
}

function listenToCartItems(cartId) {
  const itemsRef = collection(db, "carts", cartId, "items");

  onSnapshot(itemsRef, (snapshot) => {
    const updatedItems = [];

    snapshot.forEach((doc) => {
      const data = doc.data();
      updatedItems.push({ ...data, barcode: doc.id });
    });

    console.log("🛒 Live cart updated:", updatedItems);
    renderLiveCart(updatedItems);
  });
}

// Product scanner logic'
const scanCooldown = new Set();
async function handleProductScan(barcode) {
  if (phase !== "scan-items") return;

  if (!cartId || phase !== "scan-items") {
    console.warn("Scan ignored: cart not linked yet.");
    return;
  }

  if (scanCooldown.has(barcode)) return;
  scanCooldown.add(barcode);
  setTimeout(() => scanCooldown.delete(barcode), 2500);

  try {
    const product = await getProductDetails(barcode);
    if (!product) {
      alert("Product not found");
      return;
    }

    // Create reference to cart item document
    const itemRef = doc(db, "carts", cartId, "items", barcode);

    if (cart[barcode]) {
      // Update existing item
      cart[barcode].quantity += 1;
      const itemEl = cart[barcode].element;
      itemEl.querySelector(".item-quantity").textContent = `x${cart[barcode].quantity}`;
      itemEl.querySelector(".item-price").textContent = `₹${cart[barcode].quantity * product.price}`;
      total += product.price
      document.getElementById("total-amount").textContent = total;
      // Update Firestore
      await updateDoc(itemRef, {
        quantity: increment(1)
      });
      const weightToAdd = product.weight || 0;
      await updateDoc(doc(db, "carts", cartId), {
        lastUpdated: serverTimestamp(),
        expectedWeight: increment(weightToAdd)
      });
    } 
    else {
      // Create new item
      const item = {
        name: product.name,
        price: product.price,
        quantity: 1
      };
      renderCartItem(item, barcode);

      await setDoc(itemRef, item);
      const weightToAdd = product.weight || 0;
      await updateDoc(doc(db, "carts", cartId), {
        lastUpdated: serverTimestamp(),
        expectedWeight: increment(weightToAdd)
      });

      // ✅ Unhide recommendation UI
      const inlineSuggestions = document.getElementById("inline-suggestions");
      if (inlineSuggestions && inlineSuggestions.classList.contains("hidden")) {
        inlineSuggestions.classList.remove("hidden");
      }
    }

    // ✅ Only scroll the cart items list, not the full page
    const itemsList = document.getElementById("cart-items");
    itemsList.scrollTop = itemsList.scrollHeight;

  } catch (error) {
    console.error("Error handling product scan:", error);
    alert("Failed to update cart. Please try again.");
  } 

}

function renderCartItem(item, barcode) {
  const li = document.createElement("li");
  li.innerHTML = `
    <div class="item-row">
      <div class="item-info">
        <span class="item-name">${item.name}</span>
        <span class="item-quantity">x${item.quantity}</span>
      </div>
      <div class="item-controls">
        <span class="item-price">₹${item.quantity * item.price}</span>
        <button class="minus-btn">➖</button>
      </div>
    </div>
  `;
  document.getElementById("cart-items").appendChild(li);

  cart[barcode] = {
    ...item,
    element: li
  };

  // total += item.quantity * item.price;
  document.getElementById("total-amount").textContent = total;

  li.querySelector(".minus-btn").addEventListener("click", async () => {
    const currentItem = cart[barcode];

    if (currentItem.quantity > 1) {
      currentItem.quantity -= 1;
      li.querySelector(".item-quantity").textContent = `x${currentItem.quantity}`;
      li.querySelector(".item-price").textContent = `₹${currentItem.quantity * currentItem.price}`;

      total -= currentItem.price;
      document.getElementById("total-amount").textContent = total;

      await updateDoc(doc(db, "carts", cartId, "items", barcode), {
        quantity: increment(-1)
      });
      await updateDoc(doc(db, "carts", cartId), {
        expectedWeight: increment(-currentItem.weight || 0)
      });

    } else {
      // Remove item completely
      total -= currentItem.price;
      document.getElementById("total-amount").textContent = total;

      li.remove();
      delete cart[barcode];

      await deleteDoc(doc(db, "carts", cartId, "items", barcode));
      await updateDoc(doc(db, "carts", cartId), {
        expectedWeight: increment(-currentItem.weight || 0)
      });
    }
    console.log("🔄 Rendering item:", item.name, "x" + item.quantity);

  });

}

function renderLiveCart(items) {
  const cartContainer = document.getElementById("cart-items");
  cartContainer.innerHTML = "";  // Clear existing UI
  total = 0;
  Object.keys(cart).forEach(key => delete cart[key]);

  items.forEach((item) => {
    renderCartItem(item, item.barcode);
    total += item.price * item.quantity;
  });

  document.getElementById("total-amount").textContent = total;
}

async function restoreCartFromFirestore(cartId) {
  const itemsRef = collection(db, "carts", cartId, "items");
  const snapshot = await getDocs(itemsRef);

  snapshot.forEach(docSnap => {
    const item = docSnap.data();
    const barcode = docSnap.id;
    renderCartItem(item, barcode);
  });
}

function setupScanner() {
  scanner.start(
    { facingMode: "environment" },
    {
      fps: 10,
      qrbox: { width: 280, height: 200 },
      aspectRatio: 1.5,
      supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA]
    },
    handleProductScan,
    (err) => {}
  );
}

function attachCheckoutListener(cartId, userRole, scanner) {
  const checkoutBtn = document.getElementById("checkout-btn");

  // Avoid double-adding the listener
  if (!checkoutBtn) return;
  if (checkoutBtn.dataset.listenerAttached === "true") return;

  checkoutBtn.addEventListener("click", async () => {
    if (!cartId || Object.keys(cart).length === 0) {
      alert("❗ Your cart is empty. Please scan some products before checking out.");
      return;
    }

    if (userRole == "Member") {
      alert("Only the group owner can proceed to checkout.");
      return;
    }

    // Mark as checkout started so unload warning is skipped
    checkoutInitiated = true;

    // Remove the beforeunload listener safely
    window.removeEventListener("beforeunload", beforeUnloadHandler);

    //Update cart state in Firestore
    const cartRef = doc(db, "carts", cartId);
    await updateDoc(cartRef, {
      checkoutInProgress: true,
      initiatedBy: currentUserUid
    });

    //Stop scanner and redirect
    await scanner.stop();
    window.location.href = `/Live_cart/checkout/checkout.html?cartId=${cartId}`;
  });

  checkoutBtn.dataset.listenerAttached = "true";
  console.log("✅ Checkout button listener attached");
}

function beforeUnloadHandler(e) {
  if (!checkoutInitiated) {
    e.preventDefault();
    e.returnValue = '';
  }
}


// DOM Setup

document.addEventListener("DOMContentLoaded", () => {
  let scannedOnce = false;
  const overlay = document.getElementById("link-overlay");
  const urlParams = new URLSearchParams(window.location.search);
  const passedCartId = urlParams.get("cartId");

  scanner = new Html5Qrcode("barcode-scanner"); 
  //  If cart ID passed in URL, restore it and skip QR/group logic
  if (passedCartId) {
    (async () => {
      try {
        checkoutInitiated = false;
        cartId = passedCartId;
        phase = "scan-items";
        overlay.style.display = "none";
        document.getElementById("cart-id").textContent = cartId;
        document.getElementById("cart-id-container").classList.remove("hidden");

        // ✅ Fetch user role BEFORE anything else
        const userSnap = await getDoc(doc(db, "users", userId));
        if (userSnap.exists()) {
          const data = userSnap.data();
          userRole = data.role;
          userGroupId = data.groupId;
        }

        await restoreCartFromFirestore(cartId);
        listenToCartItems(cartId);

        // ✅ Start scanner only after cart and userRole are ready
        setupScanner();
        attachCheckoutListener(cartId, userRole, scanner);

        const cartDocRef = doc(db, "carts", cartId);
        onSnapshot(cartDocRef, (docSnap) => {
          const cartData = docSnap.data();
          const overlay = document.getElementById("checkout-lock-overlay");

          if (
            cartData.checkoutInProgress &&
            cartData.status !== "completed" &&
            cartData.initiatedBy !== currentUserUid
          ) {
            overlay.classList.remove("hidden");
            if (scanner) scanner.stop();
          } else {
            overlay.classList.add("hidden");
            if (scanner) scanner.start();
          }

          if (cartData.status === "completed") {
            alert("🧾 This cart session has already been completed. Please scan a new cart.");
            return;
          }
        });

      } catch (e) {
        alert("Could not restore cart from link.");
        console.error(e);
      }
    })();
    return;
  }


  (async () => {
    try {
      // Fetch user info from Firestore
      const userRef = doc(db, "users", userId);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) throw new Error("User doc not found");

      const userData = userSnap.data();
      userGroupId = userData.groupId;
      userRole = userData.role;

      if (userGroupId) {
        console.log("Current user groupId:", userGroupId);
        const cartsRef = collection(db, "carts");
        const q = query(
          cartsRef,
          where("groupId", "==", userGroupId),
          where("status", "==", "in_use")
        );
        const querySnap = await getDocs(q);
        console.log("Matching carts found:", querySnap.size);
        querySnap.forEach(doc => {
          console.log("Matched cart data:", doc.data());
        });

        if (!querySnap.empty) {
          const activeCart = querySnap.docs[0];
          const cartData = activeCart.data();
          cartId = activeCart.id;
          console.log(" Listening to live cart changes for:", cartId);  
          phase = "scan-items";
          overlay.style.display = "none";
          // document.getElementById("link-overlay").style.display = "none";
          document.getElementById("cart-id").textContent = cartId;
          document.getElementById("cart-id-container").classList.remove("hidden");

          await restoreCartFromFirestore(cartId);
          listenToCartItems(cartId); //real-time updates when joining existing cart
          const cartDocRef = doc(db, "carts", cartId);

          onSnapshot(cartDocRef, (docSnap) => {
            const cartData = docSnap.data();
            const overlay = document.getElementById("checkout-lock-overlay");

            if (
              cartData.checkoutInProgress &&
              cartData.status !== "completed" &&
              cartData.initiatedBy !== currentUserUid
            ) {
              // Show overlay to other group members
              overlay.classList.remove("hidden");
              if (scanner) scanner.stop();
            } else {
              // Hide overlay if checkout is not in progress or this user is the initiator
              overlay.classList.add("hidden");
              if (scanner) scanner.start();
            }

            // Show alert if cart session is already completed
            if (cartData.status === "completed") {
              alert("🧾 This cart session has already been completed. Please scan a new cart.");
            }
          });

          console.log("Listening to real-time updates for cart:", cartId);

          // If user is owner but not in owners[], add them
          if (
            userRole === "owner" &&
            (!cartData.owners || !cartData.owners.includes(userId))
          ) {
            await updateDoc(doc(db, "carts", cartId), {
              owners: arrayUnion(userId)
            });
          }
          setupScanner();
          return; // no need to scan QR
        }
      }
      // No active group cart found — wait for QR scan
      if (!passedCartId) {
        overlay.style.display = "flex";
      }
    } 
    catch (err) {
      console.error("Error checking for active group cart:", err);
      alert("Failed to auto-join group cart.");
    }
  })();

  const scanCartBtn = document.getElementById("scan-cart-btn");

  //  Prevent tab close
  window.addEventListener("beforeunload", beforeUnloadHandler);

  // Prevent browser back
  history.pushState(null, null, location.href);
  window.addEventListener("popstate", (e) => {
    const confirmLeave = confirm("⚠️ You're about to leave this page. Your live cart session will be lost. Continue?");
    if (!confirmLeave) {
      history.pushState(null, null, location.href);
    }
  });

  // QR scan startup setup
  const config = {
    fps: 10,
    qrbox: { width: 280, height: 200 },
    aspectRatio: 1.5,
    supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA]
  };

  scanCartBtn.addEventListener("click", async () => {
    overlay.style.display = "none";
    try {
      await scanner.start(
        { facingMode: "environment" },
        config,
        async (decodedText) => {
          if (scannedOnce) return;
          scannedOnce = true;
          if (phase === "link") {
            cartId = decodedText.trim();
            const cartRef = doc(db, "carts", cartId);
            const cartSnap = await getDoc(cartRef);

            if (cartSnap.exists()) {
              const status = cartSnap.data().status;
              console.log("🚨 STATUS READ FROM FIRESTORE:", status);

              if (status !== "completed") {
                alert("This cart is already in use. Please try another one.");
                return;
              }
            }
            const cartUpdate = {
              active: true,
              createdAt: serverTimestamp(),
              status: "in_use",
              lastUpdated: serverTimestamp(),
              ip_stream_url : "http://192.138.177.133:8080/video"
            };

            if (userGroupId) {
              cartUpdate.groupId = userGroupId;
            }

            if (userRole === "owner") {
              cartUpdate.owners = [userId];
            }

            await setDoc(cartRef, cartUpdate);
            listenToCartItems(cartId); // real-time updates after creating new cart
            console.log("✅ Listening to real-time updates for cart:", cartId);

            //Listen to cart document for checkoutInProgress / status changes
            const cartDocRef = doc(db, "carts", cartId);

            onSnapshot(cartDocRef, (docSnap) => {
              const cartData = docSnap.data();
              const overlay = document.getElementById("checkout-lock-overlay");

              if (
                cartData.checkoutInProgress &&
                cartData.status !== "completed" &&
                cartData.initiatedBy !== currentUserUid
              ) {
                // Show overlay to other group members
                overlay.classList.remove("hidden");
                if (scanner) scanner.stop();
              } else {
                overlay.classList.add("hidden");
                if (scanner) scanner.start();
              }

              // Show alert if cart session is already completed
              if (cartData.status === "completed") {
                alert("🧾 This cart session has already been completed. Please scan a new cart.");
              }
            });

            const itemsRef = collection(db, "carts", cartId, "items");
            const snapshot = await getDocs(itemsRef);
            const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
            await Promise.all(deletePromises);

            document.getElementById("cart-id").textContent = cartId;
            document.getElementById("cart-id-container").classList.remove("hidden");

            const statusMsg = document.getElementById("link-status-msg");
            statusMsg.classList.add("visible");

            setTimeout(() => {
              statusMsg.classList.remove("visible");
            }, 3000);

            phase = "scan-items";
            overlay.style.display = "none";

            attachCheckoutListener(cartId, userRole, scanner);

            await scanner.stop();
            await scanner.start(
              { facingMode: "environment" },
              config,
              handleProductScan,
              (err) => {}
            );
          }
        },
        (err) => {}
      );
    } catch (err) {
      console.error("Scanner start error:", err);
    }
  });
  const auth = getAuth();
  onAuthStateChanged(auth, (user) => {
    if (user) {
      currentUserUid = user.uid;
    }
  }); 
});