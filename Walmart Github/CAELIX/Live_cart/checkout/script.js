import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js";
import {
  getFirestore,collection,getDocs,getDoc,doc,updateDoc,increment,serverTimestamp,setDoc,deleteDoc, query, orderBy
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";

import {
  getAuth, onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";

// Firebase config
const firebaseConfig = {
  // Your Firebase configuration
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const userId = localStorage.getItem("uid");

if (!userId) {
  alert("User not logged in. Please return to the dashboard.");
  window.location.href = "../../User_Dashboard/user_dash.html";
}


// DOM Elements
const cartItemsContainer = document.getElementById('cartItems');
const cartTotalElement = document.getElementById('cartTotal');
const totalItemsElement = document.getElementById('totalItems');
const totalAmountElement = document.getElementById('totalAmount');
const savingsAmountElement = document.getElementById('savingsAmount');
const proceedButton = document.getElementById('proceedButton');
const notification = document.getElementById('notification');
const loyaltyPopup = document.getElementById('loyaltyPopup');
const closePopup = document.getElementById('closePopup');
const backToDashboard = document.getElementById('backToDashboard');

// Cart data
const cartData = {
  items: [],
  total: 0,
  savings: 0
};

// Read cart ID from URL
const urlParams = new URLSearchParams(window.location.search);
const cartId = urlParams.get('cartId');

(async () => {
  const cartRef = doc(db, "carts", cartId);
  await updateDoc(cartRef, {
    checkoutInProgress: true
  });

  if (!cartId) {
    alert("Invalid cart. Please start over.");
    window.location.href = "../scanner/barcode.html";
    return;
  }

  await fetchCartItems(); // Starts UI updates
})();

document.addEventListener("DOMContentLoaded", async () => {
  const backButton = document.getElementById("backToCartBtn");

  backButton.addEventListener("click", async () => {
    const cartRef = doc(db, "carts", cartId);
    await updateDoc(cartRef, {
      checkoutInProgress: false
    });
    window.location.href = `../scanner/barcode.html?cartId=${cartId}`;
  });
});

// Fetch cart items from Firestore
async function fetchCartItems() {
  try {
    const cartRef = doc(db, "carts", cartId);
    const cartSnap = await getDoc(cartRef);
    console.log("📦 Cart fetched:", cartSnap.exists(), cartSnap.data());


    if (!cartSnap.exists()) {
      alert("Cart not found.");
      window.location.href = "../scanner/barcode.html";
      return;
    }

    const cartDataMeta = cartSnap.data();
    if (cartDataMeta.status === "completed") {
      alert("This cart has already been used for checkout.");
      window.location.href = "../scanner/barcode.html";
      return;
    }

    const itemsRef = collection(db, "carts", cartId, "items");
    const snapshot = await getDocs(itemsRef);

    cartData.items = [];
    cartData.total = 0;

    snapshot.forEach((doc) => {
      const item = doc.data();
      cartData.items.push({
        id: doc.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity
      });
      cartData.total += item.price * item.quantity;
      console.log("📦 Item fetched:", item);

    });

    // Calculate savinggs
    cartData.savings = Math.floor(cartData.total * 0.1);

    if (cartData.items.length === 0) {
      console.warn("⚠️ Cart is empty or item fetch failed.");
      alert("Your cart is empty. Please add products before checkout.");
      window.location.href = "../scanner/barcode.html";
      return;
    }

    renderCart();
    updateUI();

  } catch (error) {
    console.error("Error fetching cart items:", error);
    alert("Failed to load cart. Please try again.");
  }
}

// Render cart items
function renderCart() {
  cartItemsContainer.innerHTML = '';
  
  cartData.items.forEach(item => {
    const itemElement = document.createElement('div');
    itemElement.className = 'cart-item';
    itemElement.innerHTML = `
      <p><strong>${item.name}</strong></p>
      <p>Quantity: ${item.quantity}</p>
      <p>Price: ₹${item.price} x ${item.quantity} = ₹${item.price * item.quantity}</p>
    `;
    cartItemsContainer.appendChild(itemElement);
  });
}

// Update all UI elements
function updateUI() {
  // Calculate total item count (sum of all quantities)
  const totalItemCount = cartData.items.reduce((total, item) => total + item.quantity, 0);
  
  totalItemsElement.textContent = totalItemCount;
  totalAmountElement.textContent = `₹${cartData.total}`;
  cartTotalElement.textContent = `₹${cartData.total}`;
  savingsAmountElement.textContent = `₹${cartData.savings}`;
  
  // Update cart count in header
  document.getElementById('cartCount').textContent = totalItemCount;
}

//Handle Payment Submission
async function handlePayment() {
  try {
    proceedButton.disabled = true;
    proceedButton.classList.add('processing');
    proceedButton.innerHTML = "Processing...";

    const backToCartBtn = document.getElementById("backToCartBtn");
    if (backToCartBtn) {
      backToCartBtn.disabled = true;
      backToCartBtn.style.opacity = "0.5";
      backToCartBtn.style.cursor = "not-allowed";
    }

    // Simulate payment processing (2 seconds)
    await new Promise(resolve => setTimeout(resolve, 2000));

    const itemsRef = collection(db, "carts", cartId, "items");
    const snapshot = await getDocs(itemsRef);

    const purchasedItems = [];
    for (const docSnap of snapshot.docs) {
      const item = docSnap.data();
      const barcode = docSnap.id;
      purchasedItems.push({ ...item, barcode });
    }

    // Generate a readable receipt ID
    const timestamp = new Date();
    const invoiceNumber = `INV-${timestamp.toISOString().slice(0,10).replace(/-/g, '')}-${Math.floor(Math.random() * 900 + 100)}`;


    // Store receipt in Firestore
    const receiptRef = doc(db, "purchase_history", userId, "receipts", invoiceNumber);
    await setDoc(receiptRef, {
      items: purchasedItems,
      totalAmount: cartData.total,
      timestamp: serverTimestamp()
    });

    // Keep only latest 3 receipts
    const receiptsRef = collection(db, "purchase_history", userId, "receipts");
    const q = query(receiptsRef, orderBy("timestamp", "desc"));
    const snapshot2 = await getDocs(q);
    if (snapshot2.size > 3) {
      const extras = snapshot2.docs.slice(3);
      for (const docSnap of extras) {
        await deleteDoc(docSnap.ref);
      }
    }

    // Generate and download PDF
    const { jsPDF } = window.jspdf;
    function generatePDF(purchasedItems, total) {
      const doc = new jsPDF();
      doc.setFontSize(16);
      doc.text("Caelix - Smart Checkout Receipt", 20, 20);
      let y = 35;
      doc.setFontSize(12);
      purchasedItems.forEach((item, index) => {
        const itemLabel = `${item.name} x${item.quantity}`;
        const itemAmount = `₹${item.price * item.quantity}`;
        doc.text(itemLabel, 20, y);
        doc.text(itemAmount, 190, y, { align: "right" });
        y += 8;
      });

      y += 10;
      doc.setFontSize(13);
      doc.text("Total:", 20, y);
      doc.text(`₹${total}`, 190, y, { align: "right" });

      y += 15;
      doc.setFontSize(13);
      doc.text("Thank you for shopping!", 20, y + 20);

      return doc;
    }

    const pdfDoc = generatePDF(purchasedItems, cartData.total);

    document.getElementById("downloadBillBtn").addEventListener("click", () => {
      const pdfDoc = generatePDF(purchasedItems, cartData.total);
      pdfDoc.save(`Caelix_Receipt_${invoiceNumber}.pdf`);
    });

    // Update Inventory
    for (const item of purchasedItems) {
      const productRef = doc(db, "products", item.barcode);
      await updateDoc(productRef, {
        quantity: increment(-item.quantity)
      });
    }

    // DELETE all cart items
    const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);

    // RESET the cart metadata
    await setDoc(doc(db, "carts", cartId), {
      ownerId: null,
      createdAt: serverTimestamp(),
      active: false,
      status: "completed",
      checkoutInProgress : false,
      ip_stream_url:"http://192.138.177.133:8080/video",
    });

    // Show success notification
    notification.classList.add('show');
    proceedButton.classList.remove('processing');
    proceedButton.style.display = "none";

    // Generate invoice HTML inside #eBill
    function generateBillHTML(items, total, invoiceNumber, timestamp) {
      const dateStr = timestamp.toLocaleDateString("en-IN", {
        year: "numeric", month: "short", day: "numeric"
      });

      let html = `
        <div class="bill-title">CAELIX E-Bill</div>
          <div class="bill-meta">
            <strong>Invoice No:</strong> ${invoiceNumber}<br/>
            <strong>Date:</strong> ${dateStr}
          </div>
        </div>
        <table style="width: 100%; border-collapse: collapse; margin-top: 1rem;">
          <thead>
            <tr>
              <th style="text-align:left; border-bottom: 1px solid #ccc;">Item</th>
              <th style="text-align:right; border-bottom: 1px solid #ccc;">Qty</th>
              <th style="text-align:right; border-bottom: 1px solid #ccc;">Price</th>
              <th style="text-align:right; border-bottom: 1px solid #ccc;">Total</th>
            </tr>
          </thead>
          <tbody>
    `;

      items.forEach(item => {
        html += `
          <tr>
            <td>${item.name}</td>
            <td style="text-align:right;">${item.quantity}</td>
            <td style="text-align:right;">₹${item.price}</td>
            <td style="text-align:right;">₹${item.price * item.quantity}</td>
          </tr>`;
      });

      if (!items || items.length === 0) {
        html += `<tr><td colspan="4">⚠️ No items found in bill</td></tr>`;
      }
      
      html += `
          </tbody>
        </table>`;

      html+=`
        <div class="bill-total" style="text-align:right; margin-top: 1rem;">
          Total: ₹${total}
        </div>`;

      return html;
    }



    // Show the bill on screen
    setTimeout(() => {
      notification.classList.remove('show');
      document.querySelector('.layout-container').classList.add('checkout-blur');

      // SHOW BILL AFTER notification fades
      document.getElementById("eBill").innerHTML = generateBillHTML(purchasedItems, cartData.total, invoiceNumber, timestamp);
      document.getElementById("eBillOverlay").classList.remove("hidden");

    }, 3000);

    // Close bill => show loyalty popup
    document.getElementById("closeBillBtn").addEventListener("click", () => {
      document.getElementById("eBillOverlay").classList.add("hidden");
      document.querySelector('.layout-container').classList.remove('checkout-blur');

      setTimeout(() => {
        document.getElementById('loyaltyPoints').textContent = cartData.savings * 10;
        loyaltyPopup.classList.remove('hidden');
      }, 300);
    });

  } catch (error) {
    console.error("Payment failed:", error);
    alert("Payment failed. Please try again.");
    proceedButton.disabled = false;
    proceedButton.classList.remove('processing');
    proceedButton.innerHTML = "<span>Proceed to Payment</span>";
  }
}

// Event Listeners
proceedButton.addEventListener('click', handlePayment);

backToDashboard.addEventListener('click', () => {
  window.location.href = "../../User_Dashboard/user_dash.html";
});

document.addEventListener("click", (event) => {
  const cartPopup = document.getElementById("cartPopup");
  const cartButton = document.getElementById("cartButton");

  if (
    cartPopup.classList.contains("visible") &&
    !cartPopup.contains(event.target) &&
    !cartButton.contains(event.target)
  ) {
    cartPopup.classList.remove("visible");
  }
});

// Toggle cart popup visibility
document.getElementById('cartButton').addEventListener('click', () => {
  const popup = document.getElementById('cartPopup');
  popup.classList.toggle('visible');
  console.log("🛍 Cart popup toggled. Current visibility:", popup.classList.contains("visible"));
  console.log("Cart items currently rendered:", cartData.items.length);
});