# CAELIX Chatbot Integration Section

## Add this section to the main CAELIX project README.md

---

## 🤖 AI Chatbot Support - CAELIX ASSIST
   *Intelligent conversational assistant for seamless customer support and administrative guidance*

**CAELIX ASSIST** is an integrated AI-powered chatbot system built with **Rasa Framework** that provides dual-mode conversational support for both customers and store administrators. The chatbot leverages **Firebase integration** for real-time data access and offers contextual assistance throughout the shopping experience.

### ✨ Chatbot Features

- **🎯 Dual-Mode Operations**  
  Separate specialized bots for **User Support** and **Admin Management** with role-based responses.

- **🔄 Real-Time Data Integration**  
  Direct **Firebase connectivity** for live cart monitoring, sales data, and inventory alerts.

- **📱 Web-Based Chat Interface**  
  Responsive chatbot UI that integrates seamlessly with existing CAELIX web interfaces.

- **🚨 Smart Alert System**  
  Proactive notifications for theft detection, low inventory, and cart anomalies.

- **💬 Natural Language Processing**  
  Advanced **NLU pipeline** with intent recognition, entity extraction, and contextual responses.

- **🔧 Extensible Architecture**  
  Modular design allowing easy addition of new intents, actions, and integrations.

### 🗂️ Chatbot Architecture

```
CAELIX_Smart_Cart/
├── CAELIX_ASSIST/                   # AI Chatbot system
│   ├── admin_bot/                   # Administrator chatbot
│   │   ├── config.yml              # Rasa NLU/Core configuration for admin
│   │   ├── domain.yml              # Admin intents, responses, and actions
│   │   ├── credentials.yml         # Authentication for admin bot
│   │   ├── endpoints.yml           # Action server endpoints
│   │   ├── serviceAccountKey.json  # Firebase service account
│   │   ├── actions/                # Custom admin actions
│   │   │   ├── __init__.py
│   │   │   └── actions.py         # Firebase-connected admin actions
│   │   ├── data/                   # Training data for admin bot
│   │   │   ├── nlu.yml            # Admin intent training examples
│   │   │   ├── rules.yml          # Admin conversation rules
│   │   │   └── stories.yml        # Admin conversation flows
│   │   └── models/                # Trained admin bot model
│   │       └── admin_model.tar.gz
│   │
│   ├── user_bot/                    # Customer support chatbot
│   │   ├── config.yml              # Rasa configuration for user bot
│   │   ├── domain.yml              # User intents, responses, and actions
│   │   ├── credentials.yml         # User bot authentication
│   │   ├── endpoints.yml           # User bot action endpoints
│   │   ├── actions/                # Custom user actions
│   │   │   ├── __init__.py
│   │   │   └── actions.py         # User wallet and cart actions
│   │   ├── data/                   # User bot training data
│   │   │   ├── nlu.yml            # User intent examples
│   │   │   ├── rules.yml          # User conversation rules
│   │   │   └── stories.yml        # User conversation stories
│   │   └── models/                # Trained user bot model
│   │       └── user_model.tar.gz
│   │
│   ├── chatbot_site/               # Web interface for chatbot
│   │   ├── index.html             # Main chatbot UI
│   │   ├── script.js              # Chatbot interaction logic
│   │   └── style.css              # Chatbot UI styling
│   │
│   ├── requirements.txt            # Python dependencies for chatbots
│   └── README.md                   # Chatbot setup instructions
```

### 🎯 Chatbot Capabilities

#### 👥 **User Support Bot**
- **🛒 Shopping Assistance**: Cart management, product scanning help, checkout guidance
- **💳 Wallet Support**: Balance inquiries, payment assistance, transaction history
- **🔧 Technical Help**: Scanner troubleshooting, app navigation, feature explanations
- **📋 Order Management**: Invoice viewing, order history, profile updates
- **🔐 Security Guidance**: Platform safety information, logout procedures

#### 🛠️ **Admin Management Bot**
- **📊 Sales Analytics**: Real-time sales data, transaction summaries, revenue insights
- **📦 Inventory Management**: Stock updates, low inventory alerts, product management
- **🔍 Cart Monitoring**: Live cart tracking, theft detection alerts, user session monitoring
- **🚨 Alert System**: Proactive notifications for anomalies, cart discrepancies, system alerts
- **💰 Discount Management**: Promotional campaign assistance, pricing updates

### ⚙️ Chatbot Setup & Integration

#### 🔧 **Backend Setup**

1. **Install Chatbot Dependencies**
   ```bash
   cd CAELIX_Smart_Cart/CAELIX_ASSIST
   pip install -r requirements.txt
   ```

2. **Configure Firebase for Chatbots**
   - Use the same **serviceAccountKey.json** from the main CAELIX project
   - Copy it to:
     ```plaintext
     CAELIX_ASSIST/admin_bot/serviceAccountKey.json
     ```

3. **Train the Chatbot Models**
   ```bash
   # Train Admin Bot
   cd admin_bot
   rasa train
   
   # Train User Bot
   cd ../user_bot
   rasa train
   ```

4. **Start the Chatbot Servers**
   ```bash
   # Terminal 1: Admin Bot Actions Server
   cd admin_bot
   rasa run actions --port 5055
   
   # Terminal 2: Admin Bot Rasa Server
   rasa run --port 5005 --cors "*"
   
   # Terminal 3: User Bot Actions Server
   cd ../user_bot
   rasa run actions --port 5056
   
   # Terminal 4: User Bot Rasa Server
   rasa run --port 5006 --cors "*"
   ```

#### 🌐 **Frontend Integration**

1. **Integrate Chatbot UI**
   - The chatbot interface can be embedded in any CAELIX page
   - Include the chatbot widget in your HTML:
     ```html
     <!-- Add to any CAELIX page -->
     <script src="CAELIX_ASSIST/chatbot_site/script.js"></script>
     <link rel="stylesheet" href="CAELIX_ASSIST/chatbot_site/style.css">
     ```

2. **Configure Bot Selection**
   - User pages (dashboard, cart, checkout) → Connect to **User Bot** (port 5006)
   - Admin pages (dashboard, monitoring) → Connect to **Admin Bot** (port 5005)

### 🔄 Chatbot Integration Points

```
CAELIX System Integration Flow:

User Dashboard → User Bot → Firebase → Real-time Responses
     ↓              ↓           ↓
Cart Scanner → Shopping Help → Live Assistance
     ↓              ↓           ↓
Checkout → Payment Support → Transaction Guidance

Admin Dashboard → Admin Bot → Firebase → System Insights  
      ↓               ↓          ↓
Cart Monitoring → Alert Bot → Proactive Notifications
      ↓               ↓          ↓
Inventory → Stock Bot → Management Assistance
```

### 🎛️ Customization & Extensions

#### 📝 **Adding New Intents**
1. Update `data/nlu.yml` with new training examples
2. Add responses in `domain.yml`
3. Create custom actions in `actions/actions.py` if needed
4. Retrain the model: `rasa train`

#### 🔗 **Firebase Data Integration**
- Chatbots automatically sync with existing Firebase collections
- **Cart data**, **user information**, and **sales analytics** are readily accessible
- Custom actions can be created to fetch any Firebase data

#### 🎨 **UI Customization**
- Modify `chatbot_site/style.css` for visual branding
- Update `script.js` for enhanced functionality
- Integrate with existing CAELIX design system

*The CAELIX ASSIST chatbot seamlessly integrates with your smart cart ecosystem, providing intelligent support that grows with your retail operations.* 🤖✨

---

## Updated Navigation Flow (Including Chatbot)

```
landing_page.html  (🔐 Login Page)
├── User Login → user_dash.html  (👤 User Dashboard) [+ 🤖 User Chat Support]
│   ├── Add Money → wallet_gateway.html  (💳 Digital Wallet) [+ 💬 Wallet Help]
│   └── Start Shopping → barcode.html  (🛒 Live Cart Scanner) [+ 📱 Scanning Help]
│       └── Scan Items (YOLOv8 + Load Cell) [+ 🔧 Technical Support]
│       └── Proceed to Checkout → checkout.html  (🧾 View & Confirm Cart) [+ 💳 Payment Help]
│           └── Pay via Wallet → Transaction Complete [+ 📋 Receipt Support]
└── Admin Login → dashboard.html  (🛠️ Admin Control Panel) [+ 🤖 Admin Assistant]
    ├── Live Cart Monitoring [+ 🚨 Alert Bot]
    ├── Sales Overview [+ 📊 Analytics Assistant]  
    ├── Inventory Management [+ 📦 Stock Bot]
    └── System Alerts [+ 🔔 Proactive Notifications]
```

## 🔧 Updated System Components (Including Chatbot)

### 🧠 Backend Intelligence
────────────────────────────────

#### 🤖 `CAELIX_ASSIST/admin_bot/actions.py` — Admin Intelligence Hub
- Fetches **real-time cart alerts** from Firebase for theft detection
- Provides **sales analytics** and **inventory insights** to administrators  
- **Proactive notification system** for anomaly detection and system monitoring

#### 💬 `CAELIX_ASSIST/user_bot/actions.py` — Customer Support Engine  
- **Dynamic wallet balance** integration with Firebase user data
- **Shopping assistance** for cart management and checkout processes
- **Technical support** for scanner issues and app navigation

#### 🌐 `CAELIX_ASSIST/chatbot_site/` — Conversational Interface
- **Responsive chat widget** that integrates with all CAELIX pages
- **Context-aware responses** based on user location within the app
- **Real-time Firebase synchronization** for live data access

*AI-powered conversational support that understands your retail ecosystem and grows smarter with every interaction.* 🚀

---

## 🛠️ Updated Installation & Setup (Including Chatbot)

### 📦 Prerequisites
⸻⸻⸻⸻⸻

Ensure the following are ready before you begin:

- ✅ **Python 3.8 or higher**
- ✅ **Rasa Framework 3.6+ **
- ✅ **Modern Web Browser** (Chrome, Firefox, Safari, or Edge)
- ✅ **Firebase Project** with Firestore & Realtime Database enabled
- ✅ **Webcam or USB Camera** for object detection

### ⚙️ Updated Backend Setup
⸻⸻⸻⸻⸻⸻⸻⸻⸻

4. **Configure Firebase** (Updated)
   - Go to the [Firebase Console](https://console.firebase.google.com) and **create a new project**.
   - Navigate to **Project Settings → Service Accounts** and click **Generate new private key**.
   - Download the `.json` file and save it as:
     ```plaintext
     CAELIX_Theft_Detectors/Weight Sensor/SmartCart/serviceAccountKey.json
     CAELIX_ASSIST/admin_bot/serviceAccountKey.json  # ← New addition
     ```

7. **Setup AI Chatbot System**
   ```bash
   cd CAELIX_Smart_Cart/CAELIX_ASSIST
   pip install -r requirements.txt
   
   # Train the chatbot models
   cd admin_bot && rasa train
   cd ../user_bot && rasa train
   
   # Start chatbot services (run in separate terminals)
   # Terminal 1: Admin Actions
   cd admin_bot && rasa run actions --port 5055
   
   # Terminal 2: Admin Bot
   cd admin_bot && rasa run --port 5005 --cors "*"
   
   # Terminal 3: User Actions  
   cd user_bot && rasa run actions --port 5056
   
   # Terminal 4: User Bot
   cd user_bot && rasa run --port 5006 --cors "*"
   ```

### 🌐 Updated Frontend Setup
⸻⸻⸻⸻⸻⸻⸻⸻⸻

1. **Launch the Web Interface** (Updated)
   - Open this file in your browser:
     ```plaintext
     CAELIX_Smart_Cart/CAELIX_UI/landing_page.htm
     ```
   - *The chatbot will automatically be available on all pages once the backend is running*

2. **Chatbot Integration**
   - The chatbot interface is automatically embedded in all CAELIX pages
   - **User pages** connect to the User Support Bot (port 5006)
   - **Admin pages** connect to the Admin Management Bot (port 5005)
   - Chat widget appears as a floating button on all interfaces

_You're now ready to explore the complete smart cart ecosystem with intelligent conversational support!_ 🛒🤖✨
