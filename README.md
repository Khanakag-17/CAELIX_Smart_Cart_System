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

## 🔧 Components Overview

### Backend Services

#### `detection_worker.py`
- Handles real-time object detection for individual shopping carts
- Implements multithreading for concurrent cart monitoring
- Integrates with YOLOv8 models for product identification

#### `manager.py`
- Manages multiple detection threads based on cart activity
- Coordinates resource allocation across active carts
- Handles cart lifecycle management

#### `smart_cart_detection.py`
- Standalone detection script for testing and development
- Contains core detection algorithms and image processing logic
- Supports both single and batch processing modes

### Frontend Pages

#### `landing_page.html`
- Main entry point with user authentication
- Supports both customer and administrator login
- Responsive design with modern UI elements

#### `dashboard.html`
- Comprehensive admin dashboard for system monitoring
- Real-time analytics and cart activity visualization
- User management and system configuration tools

#### `user_dash.html`
- Customer interface for cart management
- Wallet balance display and transaction history
- Interactive product scanning interface

#### `wallet_gateway.html`
- Secure payment processing interface
- Multiple payment method support
- Transaction confirmation and receipt generation

## 🛠️ Installation & Setup

### Prerequisites
- Python 3.8 or higher
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Firebase account with Firestore database
- Webcam or camera for product detection

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd smart-cart-system
   ```

2. **Install Python dependencies**
   ```bash
   pip install opencv-python ultralytics firebase-admin scikit-learn numpy torch torchvision
   ```

3. **Configure Firebase**
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com)
   - Generate a service account key
   - Download the JSON file and save it as `backend/config/serviceAccountKey.json`

4. **Model Setup**
   - The `yolov8n.pt` model will be downloaded automatically
   - Place your custom trained model as `model_single.pt` in the `backend/models/` directory
   - Update model paths in configuration files if needed

### Frontend Setup

1. **Start the application**
   - Open `frontend/pages/landing_page.html` in your web browser
   - No additional server setup required for basic functionality

2. **For development with live server**
   - Use a local development server (Live Server extension in VS Code recommended)
   - Ensure proper CORS settings for Firebase integration

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

---

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
