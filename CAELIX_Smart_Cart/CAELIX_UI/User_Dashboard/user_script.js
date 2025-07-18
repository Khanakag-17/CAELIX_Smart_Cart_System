
const  sideMenu = document.querySelector('aside');
const menuBtn = document.querySelector('#menu_bar');
const closeBtn = document.querySelector('#close_btn');
const profileBtn = document.getElementById("profileBtn");
const profileInfo = document.getElementById("profileInfo");
const mainSection = document.getElementById("mainSection");
const walletGateway = document.querySelector('.gateway-btn')
const themeToggler = document.querySelector('.theme-toggler');
const dashboardLink = document.getElementById("dashboard-link");
const upplanLink = document.getElementById("upplan-link");
const dashboardSection = document.getElementById("dashboard-section");
const upplanSection = document.getElementById("upplan-section");

// Import Firebase SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-analytics.js";
import { getFirestore, collection, query, orderBy, limit, onSnapshot, where, getDocs, getDoc, doc,setDoc,updateDoc,serverTimestamp,deleteDoc,deleteField }from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";
import { getAuth, signOut, onAuthStateChanged  } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";

// Firebase config
const firebaseConfig = {
  // Your Firebase configuration
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
        
const auth = getAuth(app);

// Listen for login state and load user data
document.addEventListener("DOMContentLoaded", () => {
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      const uid = user.uid;
      const userDocRef = doc(db, "users", uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists() ) {
        const userData = userDocSnap.data();

        console.log("Logged in as:", userData.username);

        // Show username in UI
        document.getElementById("welcome-name").innerText = `Welcome, ${userData.username}`;
        document.getElementById("user-role").innerText = `${userData.role}`;
        document.getElementById("user-mail").innerText = `Email: ${userData.email}`;
        document.getElementById("loyalty-points").innerText = `${userData.loyaltyPoints}`;
        document.getElementById("user-tier").innerText = `Current Tier: ${userData.tier}`;
        const createdDate = userData.createdAt.toDate().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
        document.getElementById("created-at").innerText = `Created on: ${createdDate}`;
        //Group button
        const myGroupBtn = document.getElementById("openMyGroupBtn");
        console.log("My Group Btn found:", myGroupBtn);

        if (userData.groupId) {
          console.log("User is in group:", userData.groupId);
          if (myGroupBtn) {
            myGroupBtn.classList.remove("hidden");
            console.log("📋 My Group button shown");
          } else {
            console.log("❌ My Group button not found in DOM!");
          }
        } else {
          console.log("User is not in a group");
        }

        //Fetch last 3 bills and add to recent purchases table
        const receiptRef = collection(db, "purchase_history", uid, "receipts");
        const q = query(receiptRef, orderBy("timestamp", "desc"), limit(3));
        const snapshot = await getDocs(q);

        const recentPurchasesContainer = document.getElementById("recentPurchases");
        recentPurchasesContainer.innerHTML = "";

        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          const invoiceNumber = docSnap.id;
          const date = data.timestamp.toDate().toLocaleDateString("en-IN");
          const total = data.totalAmount;

          const row = document.createElement("tr");
          row.innerHTML = `
            <td class="date-cell"><strong>${date}</strong></td>
            <td class="total-cell"><strong>₹${total}</strong></td>
            <td class="action-cell">
              <button class="view-bill-btn" data-invoice="${invoiceNumber}">
                <span class="material-symbols-sharp" style="font-size: 18px;">search</span>
                View Bill
              </button>
            </td>
          `;
          recentPurchasesContainer.appendChild(row);
        });

      } else {
          alert("User data not found.");
      }
    } else {
        // Not logged in redirect
        window.location.href = "../landing_page.htm";
    }
  });
});

// Logout with Firebase Auth
const logoutBtn = document.querySelector('.logout-btn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', function (e) {
        e.preventDefault();

        // Check if Firebase is loaded
        if (typeof firebase !== 'undefined' && firebase.auth) {
            firebase.auth().signOut().then(() => {
                window.location.href = "../landing_page.htm";
            }).catch((error) => {
                console.error('Logout failed:', error);
                alert('Logout failed. Please try again.');
            });
        } else {
            // Fallback if Firebase not used
            window.location.href = "../landing_page.htm";
        }
    });
}

const walletElement = document.getElementById("wallet-balance");

// Load from localStorage or fallback to default
const storedBalance = localStorage.getItem("walletBalance");
walletElement.innerText = `INR ${storedBalance ? parseFloat(storedBalance).toFixed(2) : "1200.00"}`;

if(dashboardLink && upplanLink){

  dashboardLink.addEventListener('click', (e) =>{
    e.preventDefault();
    dashboardSection.style.display = 'block';
    upplanSection.style.display = 'none';
  });

  upplanLink.addEventListener('click', (e) => {
    e.preventDefault;
    upplanSection.style.display = 'block';
    dashboardSection.style.display = 'none';
  })
}


menuBtn.addEventListener('click',()=>{
       sideMenu.style.display = "block"
})
closeBtn.addEventListener('click',()=>{
    sideMenu.style.display = "none"
})

themeToggler.addEventListener('click',()=>{
     document.body.classList.toggle('dark-theme-variables')
     themeToggler.querySelector('span:nth-child(1').classList.toggle('active')
     themeToggler.querySelector('span:nth-child(2').classList.toggle('active')
})

profileBtn.addEventListener("click", () => {
  profileInfo.classList.toggle("show");
});

if(walletGateway){
  walletGateway.addEventListener('click', function (e) {
    e.preventDefault();
    window.location.href = 'wallet_gateway.html';
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const startShoppingBtn = document.getElementById("startShoppingBtn");

  if (startShoppingBtn) {
    startShoppingBtn.addEventListener("click", () => {
      const auth = getAuth();
      onAuthStateChanged(auth, (user) => {
        if (user) {
          localStorage.setItem("uid", user.uid);
          window.location.href = "../Live_cart//scanner//barcode.html";  // correct relative path
        } else {
          alert("Please log in first.");
        }
      });
    });
  } else {
    console.warn("Start Shopping button not found.");
  }
});

function generateBillHTML(items, total, invoiceNumber, timestamp) {
  const dateStr = timestamp.toLocaleDateString("en-IN", {
    year: "numeric", month: "short", day: "numeric"
  });

  let html = `
    <div class="bill-title">Caelix E-Bill</div>
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
  console.log("ITEMS inside bill render loop:", items);
  console.log("First item:", items[0]);

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
document.getElementById("closeBillBtn").addEventListener("click", () => {
  document.getElementById("eBillOverlay").classList.add("hidden");
});

document.addEventListener("click", async (event) => {
  if (event.target.classList.contains("view-bill-btn")) {
    const invoiceId = event.target.dataset.invoice;
    const uid = localStorage.getItem("uid");

    const receiptDoc = await getDoc(doc(db, "purchase_history", uid, "receipts", invoiceId));

    if (receiptDoc.exists()) {
      const data = receiptDoc.data();
      const billHTML = generateBillHTML(data.items, data.totalAmount, invoiceId, data.timestamp.toDate());
      document.getElementById("eBillContent").innerHTML = billHTML;
      document.getElementById("eBillOverlay").classList.remove("hidden");
    } else {
      alert("Could not load the bill. Please try again.");
    }
  }
});

// Modal Element References
const createModal = document.getElementById("createGroupModal");
const joinModal = document.getElementById("joinGroupModal");
const dashboard = document.getElementById("dashboardWrapper");

// Button Triggers
const openCreateGroupBtn = document.getElementById("openCreateGroupBtn");
const openJoinGroupBtn = document.getElementById("openJoinGroupBtn");
const closeModalBtns = document.querySelectorAll(".close-modal");
const addMemberBtn = document.getElementById("addMemberBtn");
const allowedMembersList = document.getElementById("allowedMembersList");

// Open Create Group Modal
openCreateGroupBtn.addEventListener("click", () => {
  createModal.classList.remove("hidden");
  dashboard.classList.add("blur");
});

addMemberBtn.addEventListener("click", () => {
  const memberRow = document.createElement("div");
  memberRow.classList.add("member-input");
  memberRow.innerHTML = `
    <input type="email" placeholder="Member Email" class="member-email" />
    <select class="member-role">
      <option value="member">Member</option>
      <option value="owner">Owner</option>
    </select>
  `;
  allowedMembersList.appendChild(memberRow);
});

// Open Join Group Modal
openJoinGroupBtn.addEventListener("click", () => {
  joinModal.classList.remove("hidden");
  dashboard.classList.add("blur");
});

// Close Modals
closeModalBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    createModal.classList.add("hidden");
    joinModal.classList.add("hidden");
    dashboard.classList.remove("blur");
  });
});


const submitCreateGroupBtn = document.getElementById("submitCreateGroupBtn");

submitCreateGroupBtn.addEventListener("click", async () => {
  const groupNameInput = document.getElementById("groupNameInput");
  const groupName = groupNameInput.value.trim();

  if (!groupName) {
    alert("Please enter a group name.");
    return;
  }

  const allowedMembers = [];
  const memberInputs = document.querySelectorAll(".member-input");

  for (let row of memberInputs) {
    const email = row.querySelector(".member-email").value.trim().toLowerCase();
    const role = row.querySelector(".member-role").value;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      alert(`Invalid email: ${email}`);
      return;
    }

    allowedMembers.push({ email, role });
  }

  const groupCode = Math.random().toString(36).substring(2, 8).toUpperCase();

  try {
    const uid = auth.currentUser.uid;
    const userRef = doc(db, "users", uid);
    const userSnap = await getDoc(userRef);
    const userData = userSnap.data();

    const groupData = {
      groupName: groupName,
      groupCode: groupCode,
      createdBy: uid,
      createdAt: serverTimestamp(),
      allowedMembers: allowedMembers,
      members: [
        { uid: uid, email: userData.email, role: "owner" }
      ]
    };

    await setDoc(doc(db, "groups", groupCode), groupData);
    await updateDoc(userRef, {
      groupId: groupCode,
      role: "owner"
    });

    // Fetch latest user data after update
    const updatedUserSnap = await getDoc(doc(db, "users", uid));
    const updatedUserData = updatedUserSnap.data();

    if (updatedUserData.groupId) {
      document.getElementById("openMyGroupBtn").classList.remove("hidden");
    }

    //Cleanup if Firestore write succeed
    document.getElementById("createGroupModal").classList.add("hidden");
    document.getElementById("dashboardWrapper").classList.remove("blur");
    groupNameInput.value = "";

    const membersContainer = document.getElementById("allowedMembersList");
    membersContainer.innerHTML = `
      <div class="member-input">
        <input type="email" placeholder="Member Email" class="member-email" />
        <select class="member-role">
          <option value="member">Member</option>
          <option value="owner">Owner</option>
        </select>
      </div>
    `;

    submitCreateGroupBtn.disabled = true;
    setTimeout(() => {
      submitCreateGroupBtn.disabled = false;
    }, 2000);
    //Success Toast
    const toast = document.getElementById("successToast");
    toast.classList.remove("hidden");
    setTimeout(() => {
      toast.classList.add("hidden");
    }, 3000);

    // Show popup with group code
    document.getElementById("popupGroupName").innerText = groupName;
    document.getElementById("popupGroupCode").innerText = groupCode;
    document.getElementById("groupSuccessPopup").classList.remove("hidden");

    //hide popup
    setTimeout(() => {
      document.getElementById("groupSuccessPopup").classList.add("hidden");
    }, 7000);
  } 
  catch (err) {
    console.error("Group creation failed:", err);
    alert("❌ Something went wrong while creating the group. Please try again.");
  }
});

const copyBtn = document.getElementById("copyGroupCodeBtn");
copyBtn.addEventListener("click", () => {
  const code = document.getElementById("popupGroupCode").innerText;
  navigator.clipboard.writeText(code).then(() => {
    copyBtn.innerText = "✅ Copied!";
    setTimeout(() => {
      copyBtn.innerText = "📋 Copy Code";
    }, 2000);
  });
});

// Joining Group
const submitJoinGroupBtn = document.getElementById("submitJoinGroupBtn");

submitJoinGroupBtn.addEventListener("click", async () => {
  const groupCode = document.getElementById("joinGroupCodeInput").value.trim().toUpperCase();
  if (!groupCode) {
    alert("Please enter a group code.");
    return;
  }

  try {
    const groupRef = doc(db, "groups", groupCode);
    const groupSnap = await getDoc(groupRef);

    if (!groupSnap.exists()) {
      alert("❌ Group not found.");
      return;
    }

    const groupData = groupSnap.data();

    const uid = auth.currentUser.uid;
    const userSnap = await getDoc(doc(db, "users", uid));
    const userEmail = userSnap.data().email;

    // Check if email is in allowedMembers
    const allowed = groupData.allowedMembers.find(m => m.email.toLowerCase() === userEmail.toLowerCase());

    if (!allowed) {
      alert("❌ You're not authorized to join this group.");
      return;
    }

    //Add user to group.members[] (if not already in)
    const alreadyIn = groupData.members.find(m => m.uid === uid);
    if (!alreadyIn) {
      const updatedMembers = [...groupData.members, { uid, email: userEmail, role: allowed.role }];
      await updateDoc(groupRef, { members: updatedMembers });
    }

    //Update user document
    await updateDoc(doc(db, "users", uid), {
      groupId: groupCode,
      role: allowed.role
    });

    // Close modal and clear field
    document.getElementById("joinGroupModal").classList.add("hidden");
    document.getElementById("dashboardWrapper").classList.remove("blur");
    document.getElementById("joinGroupCodeInput").value = "";

    alert(`✅ You've joined the group "${groupData.groupName}" as ${allowed.role}.`);
    
    document.getElementById("openMyGroupBtn").classList.remove("hidden");
  } 
  catch (err) {
    console.error("Join failed:", err);
    alert("Something went wrong. Please try again.");
  }
});

// const openMyGroupBtn = document.getElementById("openMyGroupBtn");
const myGroupModal = document.getElementById("myGroupModal");
const myGroupName = document.getElementById("myGroupName");
const myGroupCode = document.getElementById("myGroupCode");
const myGroupRole = document.getElementById("myGroupRole");
const myGroupMembers = document.getElementById("myGroupMembers");
const deleteGroupBtn = document.getElementById("deleteGroupBtn");
const leaveGroupBtn = document.getElementById("leaveGroupBtn");

openMyGroupBtn.addEventListener("click", async () => {
  try {
    const uid = auth.currentUser.uid;
    const userRef = doc(db, "users", uid);
    const userSnap = await getDoc(userRef);
    const userData = userSnap.data();

    if (!userData.groupId) {
      alert("You're not in a group.");
      return;
    }

    const groupRef = doc(db, "groups", userData.groupId);
    const groupSnap = await getDoc(groupRef);

    if (!groupSnap.exists()) {
      alert("Group no longer exists.");
      return;
    }

    const groupData = groupSnap.data();

    //Fill group info
    myGroupName.innerText = groupData.groupName;
    myGroupCode.innerText = groupData.groupCode;
    myGroupRole.innerText = userData.role;

    //List members
    myGroupMembers.innerHTML = "";
    groupData.members.forEach((member) => {
      const li = document.createElement("li");
      li.textContent = `${member.email} (${member.role})`;
      myGroupMembers.appendChild(li);
    });

    // Show/Hide delete or leave
    if (userData.role === "owner") {
      deleteGroupBtn.classList.remove("hidden");
      leaveGroupBtn.classList.add("hidden");
    } else {
      deleteGroupBtn.classList.add("hidden");
      leaveGroupBtn.classList.remove("hidden");
    }

    // Show modal blur
    myGroupModal.classList.remove("hidden");
    document.getElementById("dashboardWrapper").classList.add("blur");

  } catch (err) {
    console.error("Error opening group modal:", err);
    alert("Something went wrong while loading your group.");
  }
});

//Delete Group 
deleteGroupBtn.addEventListener("click", async () => {
  if (!confirm("Are you sure you want to delete this group for everyone?")) return;

  try {
    const uid = auth.currentUser.uid;
    const userRef = doc(db, "users", uid);
    const userSnap = await getDoc(userRef);
    const { groupId } = userSnap.data();

    const groupRef = doc(db, "groups", groupId);
    const groupSnap = await getDoc(groupRef);
    const groupData = groupSnap.data();

    // 🧼 Step 1: Remove groupId from all member user docs
    const promises = groupData.members.map((member) =>
      updateDoc(doc(db, "users", member.uid), {
        groupId: deleteField(),
        role: deleteField()
      })
    );

    await Promise.all(promises);

    // 🗑️ Step 2: Delete the group
    await deleteDoc(groupRef);

    // ✅ Step 3: Close modal and clean up
    myGroupModal.classList.add("hidden");
    document.getElementById("dashboardWrapper").classList.remove("blur");

    alert("✅ Group deleted successfully.");

  } catch (err) {
    console.error("Error deleting group:", err);
    alert("❌ Failed to delete the group.");
  }
});
// Leave Group
leaveGroupBtn.addEventListener("click", async () => {
  if (!confirm("Leave this group?")) return;

  try {
    const uid = auth.currentUser.uid;

    // 🔁 Remove groupId + role from user doc
    await updateDoc(doc(db, "users", uid), {
      groupId: deleteField(),
      role: deleteField()
    });

    // ✅ Close modal
    myGroupModal.classList.add("hidden");
    document.getElementById("dashboardWrapper").classList.remove("blur");

    alert("✅ You have left the group.");
  } catch (err) {
    console.error("Error leaving group:", err);
    alert("❌ Could not leave the group.");
  }
});
// Close Modal
// const closeModalBtns = document.querySelectorAll(".close-modal");
closeModalBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    document.getElementById("createGroupModal")?.classList.add("hidden");
    document.getElementById("joinGroupModal")?.classList.add("hidden");
    document.getElementById("myGroupModal")?.classList.add("hidden");
    document.getElementById("dashboardWrapper").classList.remove("blur");
  });
});

