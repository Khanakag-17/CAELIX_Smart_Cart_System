# Smart Cart System 🛒

[![Python](https://img.shields.io/badge/Python-3.8+-blue.svg)](https://python.org)
[![YOLOv8](https://img.shields.io/badge/YOLOv8-Object%20Detection-green.svg)](https://github.com/ultralytics/ultralytics)
[![Firebase](https://img.shields.io/badge/Firebase-Backend-orange.svg)](https://firebase.google.com)
[![HTML5](https://img.shields.io/badge/HTML5-Frontend-red.svg)](https://html.spec.whatwg.org/)
[![CSS3](https://img.shields.io/badge/CSS3-Styling-blue.svg)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/JavaScript-Frontend-yellow.svg)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![IoT](https://img.shields.io/badge/IoT-Embedded-lightgrey.svg)](https://en.wikipedia.org/wiki/Internet_of_things)
[![Arduino](https://img.shields.io/badge/Arduino-ESP32-00979D.svg)](https://www.arduino.cc/)
[![Flask](https://img.shields.io/badge/Flask-Microframework-black.svg)](https://flask.palletsprojects.com/)


## 🚀 CAELIX: The Next-Gen Smart Cart System
   *Say goodbye to long queues, manual billing, and retail theft.*

**CAELIX** is an intelligent, IoT-powered retail cart system that combines real-time object detection, weight verification, and interactive dashboards to revolutionize the in-store shopping experience. Built using YOLOv8, Firebase, and ESP32 sensors, CAELIX empowers both customers and store managers with seamless checkout, theft detection, and insightful cart analytics — all in one sleek ecosystem.

## ✨ Key Features

- **⚡ Instant Product Detection**  
  YOLOv8-powered object detection for fast, accurate recognition of store products.

- **🧠 Smart Cart Management**  
  Multi-threaded system that manages multiple carts with integrated theft detection.

- **🔐 Role-Based Authentication**  
  Firebase-secured login system with user and admin access levels.

- **💳 Seamless Checkout Experience**  
  Integrated digital wallet and payment gateway for hassle-free billing.

- **📊 Dynamic Admin Dashboard**  
  Real-time cart monitoring, usage analytics, and activity logs for store administrators.

- **📱 Responsive UI Design**  
  Mobile-optimized web interfaces for users, admins, and the live cart view.

- **☁️ Firebase Cloud Backend**  
  Real-time database syncing and secure data storage with Firestore.

- **🤖 AI Chatbot Support**  
  Built-in conversational assistant for customer support and guidance.


## 🧩 Codebase Layout

```
CAELIX_Smart_Cart/
├── CAELIX_Theft_Detectors/             # Modules for theft detection (product & weight-based)
│   ├── Product Detector/               # Object detection using YOLO
│   │   ├── Detection scripts/          # Python scripts for managing detection threads
│   │   │   ├── detection_worker_2.py   # Worker script that performs object detection using camera
│   │   │   └── manager.py              # Manages multiple detection sessions for active carts
│   │   └── model_final.pt              # Trained YOLOv8 model weights for product detection
│   │
│   └── Weight Sensor/                   # Weight-based validation to detect under-scanning
│       └── SmartCart/
│           ├── sketch_final/            # Arduino code for interfacing load cell via HX711
│           │   └── sketch_final.ino     # Final Arduino sketch code for ESP32 + HX711 + Load Cell
│           ├── flask_server_app.py      # Flask app that interfaces with Arduino to send data
│           └── serviceAccountKey.json   # Firebase credentials for backend communication
│
├── CAELIX_UI/                       # Frontend UI for users and admins
│   ├── Admin_Dashboard/             # Admin monitoring dashboard
│   │   ├── dashboard.html           # Main admin interface for cart logs and alerts
│   │   ├── script_new.js            # JS logic for fetching logs, real-time alerts
│   │   └── style.css                # Styling for the admin dashboard
│   │
│   ├── Live_cart/                   # Modules related to live user cart interface
│   │   ├── checkout/                # Checkout page for users
│   │   │   ├── checkout.html        # User-facing checkout interface
│   │   │   ├── script.js            # JS for handling scanned item list
│   │   │   └── styles.css           # Styling for checkout page
│   │   │
│   │   └── scanner/                 # Barcode scanner UI and assets
│   │       ├── COCA-COLA-1.jpg      # Sample product image
│   │       ├── KFTKB-201906...jpg   # Sample product image
│   │       ├── adv-pack-blue.png    # Sample product image
│   │       ├── colin-glass...jpeg   # Sample product image
│   │       ├── profile-1.png        # Avatar image used in UI
│   │       ├── barcode.html         # UI for barcode scanning
│   │       ├── script.js            # JS for barcode scanner logic
│   │       └── style.css            # Styling for scanner UI
│   │
│   ├── User_Dashboard/            # Dashboard for normal users
│   │   ├── imgcards.png           # Product card image
│   │   ├── profile-1.png          # Avatar icon
│   │   ├── gateway_style.css      # Gateway page styling
│   │   ├── user_dash.html         # Main user dashboard
│   │   ├── user_script.js         # Logic for user interactions
│   │   ├── user_style.css         # Styling for user dashboard
│   │   └── wallet_gateway.html    # Wallet gateway interface
│   │
│   ├── logos/                     # Brand logos used across pages
│   │   ├── complete_logo.png      # Full CAELIX logo
│   │   └── dashboard_logo.png     # Logo for dashboards
│   │
│   ├── background.jpg             # UI background image
│   ├── bg.jpg                     # Alternate background image
│   ├── cart.png                   # Cart icon used in UI
│   ├── footer.jpg                 # Footer image for landing page
│   ├── landing_page.htm           # Initial landing page for the CAELIX system
│   ├── script.js                  # General UI logic for landing page
│   └── style.css                  # Shared styles for landing page

```
## 🔧 CAELIX | Components Breakdown

  *Explore the heartbeat of CAELIX – where intelligent hardware, real-time vision models, and sleek interfaces converge to deliver seamless smart cart shopping.*

### 🧠 Backend Intelligence
────────────────────────────

#### 📦 `detection_worker.py` — Cart Vision in Motion  
- Powers **real-time object detection** using **YOLOv8**
- **Multithreaded** to handle multiple carts simultaneously  
- Fuses **visual data with weight sensor input** for fraud-proof detection


#### 🔁 `manager.py` — Cart Orchestrator  
- Monitors the **state of every cart**
- Dynamically manages **detection threads** based on cart usage  
- Designed for **scalable multi-cart deployments**


#### 🌐 `flask_server_app.py` — Arduino Link & Firebase Relay  
- Interfaces with **ESP32/Arduino-based cart hardware**  
- Captures **live weight data** from **load cells** via serial input  
- Sends validated readings to **Firebase** for centralized monitoring


### ⚙️ Embedded Hardware Layer
────────────────────────────

#### 🛠️ `sketch.ino` — Cart-Embedded Brain  
- Interfaces with **load cells via HX711** modules  
- Transmits **live weight readings** to the backend  
- Handles **calibration, taring**, and **hardware fault detection**


### 🖥️ Frontend Interfaces
────────────────────────────


#### 🚪 `landing_page.html` — Your Entry to CAELIX  
- Dual login for **Users** and **Admins**  
- Clean, **responsive UI** with animated transitions  
- Enables **smart cart pairing via QR scan**


#### 👤 `user_dash.html` — Shopper Control Center  
- Displays **wallet balance**, current cart, and history  
- Shows **scanned product list** in real-time  
- One-click access to **digital receipts**


#### 📷 `barcode.html` — Cart-Side Scanner  
- Scans **item barcodes** using the cart’s embedded scanner  
- Sends data to backend for **YOLOv8 vision + weight fusion validation**  
- Designed for **kiosk displays** and responsive updates


#### 💳 `checkout.html` — Exit Protocol  
- Shows a **final list of all scanned items** with pricing  
- Starts **secure checkout** via wallet or UPI  
- Automatically generates and stores **digital receipts**


#### 💰 `wallet_gateway.html` — Add Money Interface  
- Allows users to **top up their balance** via multiple methods  
- Logs every transaction for **audit and transparency**  
- Supports **cards, UPI, and offline integration** if needed


#### 🧭 `dashboard.html` — Admin Mission Control  
- Displays **real-time cart activity** and scanned item logs  
- Alerts admins for **possible theft or item mismatch**  
- Offers **analytics** on product trends and cart usage


*Modular by design. CAELIX grows with your store — scale carts, plug in new detection models, or sync with ERP systems effortlessly.*


## 🛠️ Installation & Setup

Set up **CAELIX Smart Cart System** locally with the following steps.  
*This guide assumes you're using **Python for the backend**, **Firebase for data handling**, and **HTML for the frontend interface**.*


### 📦 Prerequisites
⸻⸻⸻⸻⸻

Ensure the following are ready before you begin:

- ✅ **Python 3.8 or higher**
- ✅ **Modern Web Browser** (Chrome, Firefox, Safari, or Edge)
- ✅ **Firebase Project** with Firestore & Realtime Database enabled
- ✅ **Webcam or USB Camera** for object detection


### ⚙️ Backend Setup
⸻⸻⸻⸻⸻⸻


1. **Clone the Repository**
    ```bash
    git clone https://github.com/Khanakag-17/CAELIX_Smart_Cart_System.git
    cd CAELIX_Smart_Cart_System
    ```

2. **Install Required Python Libraries**
    ```bash
    pip install requirements.txt
    ```

3. **Configure Firebase**
    - Go to the [Firebase Console](https://console.firebase.google.com) and **create a new project**.
    - Navigate to **Project Settings → Service Accounts** and click **Generate new private key**.
    - Download the `.json` file and save it as:
      ```plaintext
      CAELIX_Theft_Detectors/Weight Sensor/SmartCart/serviceAccountKey.json
      ```
    - Replace **// Your Firebase configuration** with the generated API.

4. **Model Setup**
    - The **default YOLOv8n model** (`yolov8n.pt`) will be automatically downloaded at runtime.
    - To use our **custom-trained grocery model**, download it from:  
      👉 [Custom Model (Kaggle)](https://www.kaggle.com/models/khanakagrawal/grocery-detector)
    - Save it in:
      ```plaintext
      CAELIX_Theft_Detectors/Product Detector/model_final.pt
      ```
    - *If required, update model paths in your detection scripts accordingly.*

5. **Object Detection Dataset & Training Code**
    - 📂 Dataset used: [Grocery Items Dataset on Roboflow](https://universe.roboflow.com/productcv/grocery-items-rvvcm)
    - 📘 Model training: [Multi-Class Grocery Detector – 95% Precision (Kaggle)](https://www.kaggle.com/code/khanakagrawal/multi-class-grocery-detector-95-precision)
  
6. **Weight Tracking with Load Cell & Arduino (ESP32)**
    - A dedicated Python script (`flask_server_app.py`) handles **Wi-Fi communication** with an **ESP32** board connected to **HX711 and Load Cells**.
    - The script:
        - Receives **real-time weight data** from ESP32 over Wi-Fi.
        - Sends updates to the **Firebase Realtime Database**.
    - Ensure you:
        - Flash your ESP32 with the correct `sketch.ino` that sends weight via Wi-Fi.
        - Connect ESP32 and your local machine (running `flask_server_app.py`) to the **same Wi-Fi network**.
        - Run the script after powering the ESP32 to start syncing weight data.

    - 📍 Sample wiring:
      ```plaintext
      Load Cell      → HX711 → ESP32
      -----------------------------------
      Red (E+)       → E+    → 3.3V
      Black (E-)     → E-    → GND
      Green (A+)     → A+    → 
      White (A-)     → A-    → 
                     → DT   → GPIO 4
                     → SCK  → GPIO 5
      ```


### 🌐 Frontend Setup
⸻⸻⸻⸻⸻⸻


1. **Launch the Web Interface**
    - Open this file in your browser:
      ```plaintext
      CAELIX_Smart_Cart/CAELIX_UI/landing_page.htm
      ```
    - *This will allow access to both **User** and **Admin** dashboards.*

2. **(Optional) Development Mode**
    - Use **Live Server** extension in VS Code or a local HTTP server for live previews.
    - Ensure **CORS settings** are correctly configured in Firebase to support local testing.


_You're now ready to explore the smart cart ecosystem — real-time vision meets seamless shopping!_ 🛒✨


## 🧭 How to Use CAELIX

### 👤 For Customers

#### 🔐 Sign In  
Access the system via `landing_page.html`  
→ Select **User Login** to enter your personalized dashboard.

#### 🛒 Pick Your Smart Cart  
Scan the **QR code** on your chosen smart cart using your mobile device.  
→ This links the physical cart to your digital profile.

#### 📦 Start Shopping  
Scan product **barcodes** using the built-in cart scanner (`barcode.html`).  
→ The system validates items using **YOLOv8 object detection** + **load cell weight verification**.

#### 💼 Wallet Management  
Add funds securely via the **Add Money** option (`wallet_gateway.html`).  
→ Track your available balance and past top-ups on your dashboard.

#### 💳 Checkout & Payment  
Once done shopping, tap **Proceed to Payment**.  
→ The system automatically verifies that all items are scanned and paid for.

#### 🧾 Get Receipt  
A **digital receipt** is generated immediately post-payment.  
→ View all transaction history directly from your User Dashboard.

────────────────────────────────────────────────────────

### 🛠️ For Administrators

#### 🔐 Admin Login  
Log in via `landing_page.html` using admin credentials.  
→ This grants access to the Admin Dashboard (`dashboard.html`).

#### 📡 Live Cart Monitoring  
Track **real-time activity** of all smart carts:  
→ Item scans, total weight, and shopping session duration.

#### 💲 Sales Overview  
Access **detailed analytics** including:  
→ Daily, weekly, and monthly sales data  
→ Cart-wise revenue distribution

#### 🚨 Theft Detection Alerts  
Get **instant alerts** triggered by potential theft behavior:  
→ YOLOv8 + weight mismatch detection flags unauthorized actions.

#### 📊 Cart Status Overview  
Monitor the **operational status** of all carts:  
→ Active, idle, under maintenance, or disconnected.

#### 📦 Live Inventory  
View and manage live product inventory:  
→ Critical stock alerts, category-wise breakdowns, and refill recommendations.

#### 📷 Camera Monitor  
Access **live cart camera feeds** in real-time:  
→ Visual monitoring of cart content and user interaction.


## 🔄 Navigation Flow

```
landing_page.html  (🔐 Login Page)
├── User Login → user_dash.html  (👤 User Dashboard)
│   ├── Add Money → wallet_gateway.html  (💳 Digital Wallet)
│   └── Start Shopping → barcode.html  (🛒 Live Cart Scanner)
│       └── Scan Items (YOLOv8 + Load Cell)
│       └── Proceed to Checkout → checkout.html  (🧾 View & Confirm Cart)
│           └── Pay via Wallet → Loyalty Points & Tier updation  (💰 Transaction)
│           └── Redirect → user_dash.html  (🏠 Dashboard)
└── Admin Login → dashboard.html  (🛠️ Admin Control Panel)
    ├── Live Cart Monitoring  (📡 Real-time cart activity)
    ├── Sales Overview  (💲 Monthly/Weekly/Daily Analytics)
    ├── Theft Detection Alerts  (🚨 YOLOv8 + Weight-based detection)
    ├── Cart Status Overview  (📊 Active/Idle cart metrics)
    ├── Live Inventory  (📦 Critical stock flagging & Complete overview)
    └── Camera Monitor  (📷 Cart camera response monitor)
```

## 📊 System Architecture

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Backend**: Python with OpenCV and YOLOv8
- **Database**: Firebase Firestore
- **AI/ML**: YOLOv8 for object detection
- **Payment**: Integrated wallet system

## 🔒 Security Features

- Secure user authentication
- Encrypted payment processing
- Firebase security rules
- Input validation and sanitization
- Session management

## 🤖 AI/ML Components

- **YOLOv8 Object Detection**: Real-time product identification
- **Custom Model Training**: Specific to retail products
- **Multi-object Tracking**: Handles multiple items simultaneously
- **Confidence Scoring**: Accuracy thresholds for reliable detection

## 🎨 UI/UX Features

- **Responsive Design**: Works on desktop, tablet, and mobile
- **Modern Interface**: Clean, intuitive user experience
- **Real-time Updates**: Live cart status and notifications
- **Interactive Chatbot**: Customer support integration

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the root directory:
```
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_STORAGE_BUCKET=your-storage-bucket
MODEL_PATH=backend/models/model_single.pt
CONFIDENCE_THRESHOLD=0.5
```

### Firebase Configuration
Update Firebase configuration in JavaScript files with your project credentials.

## 🐛 Troubleshooting

### Common Issues

1. **Model Loading Errors**
   - Ensure model files are in the correct directory
   - Check file permissions and paths

2. **Firebase Connection Issues**
   - Verify service account key is properly configured
   - Check internet connectivity and Firebase project status

3. **Camera Access Problems**
   - Grant camera permissions in browser
   - Ensure camera is not being used by other applications
