# Smart Cart System 🛒

[![Python](https://img.shields.io/badge/Python-3.8+-blue.svg)](https://python.org)
[![YOLOv8](https://img.shields.io/badge/YOLOv8-Object%20Detection-green.svg)](https://github.com/ultralytics/ultralytics)
[![Firebase](https://img.shields.io/badge/Firebase-Backend-orange.svg)](https://firebase.google.com)
[![HTML5](https://img.shields.io/badge/HTML5-Frontend-red.svg)](https://html.spec.whatwg.org/)

A comprehensive smart shopping cart system designed for Walmart retail environments, featuring real-time object detection, user management, and integrated payment gateway solutions.

## 🚀 Features

- **Real-time Object Detection**: Advanced YOLOv8-based product recognition
- **Multi-threaded Cart Management**: Concurrent handling of multiple shopping carts
- **User Authentication**: Secure login system for customers and administrators
- **Payment Integration**: Digital wallet and payment gateway functionality
- **Admin Dashboard**: Comprehensive analytics and monitoring interface
- **Responsive Design**: Mobile-friendly web interface
- **Firebase Integration**: Cloud-based data storage and real-time synchronization
- **Chatbot Support**: Interactive customer assistance

## 📁 Project Structure

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

## 🚀 Usage Guide

### For Customers

1. **Login**: Access the system through the landing page
2. **Cart Selection**: Choose an available smart cart
3. **Shopping**: Add items to your cart - they'll be detected automatically
4. **Payment**: Use the integrated wallet system for seamless checkout
5. **Receipt**: View transaction history and receipts

### For Administrators

1. **Admin Login**: Use administrator credentials on the landing page
2. **Dashboard**: Monitor active carts and system performance
3. **User Management**: Add/remove users and manage permissions
4. **Analytics**: View sales data and system usage statistics
5. **Configuration**: Adjust detection sensitivity and system settings

## 🔄 Navigation Flow

```
landing_page.html (Login)
    ├── User Login → user_dash.html
    │   └── Add Money → wallet_gateway.html
    └── Admin Login → dashboard.html
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
