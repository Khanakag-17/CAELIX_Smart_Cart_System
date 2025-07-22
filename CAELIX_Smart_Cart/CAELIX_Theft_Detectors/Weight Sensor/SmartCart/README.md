# ✅ Smart Cart - Setup & Run Guide (for New Laptop)

This guide explains how to set up the **SmartCart Flask server** and run it on a new laptop to receive weight data from an ESP32 microcontroller over Wi-Fi.

---

## 📁 Folder Contents

You should have the following files in a folder (say `SmartCart_Server/`):

```
SmartCart_Server/
├── flask_server_app.py          # Python server that receives ESP32 weight data
├── serviceAccountKey.json       # Firebase Admin SDK credentials
```

**serviceAccountKey.json Format**

```
{
  "type": "service_account",
  "project_id": "PROJECT_ID",
  "private_key_id": "PRIVATE_KEY_ID",
  "private_key": "PRIVATE_KEY",
  "client_email": "CLIENT_EMAIL",
  "client_id": "CLIENT_ID",
  "auth_uri": "AUTH_URI",
  "token_uri": "TOKEN_URI",
  "auth_provider_x509_cert_url": "AUTH_CERTS",
  "client_x509_cert_url": "SLIENT_CERT_URL",
  "universe_domain": "DOMAIN"
}
```
*This file can be installed from Firebase post web app creation*

---

## ⚙️ Step-by-Step Setup

### 🔹 1. Install Python 3.x (if not already installed)
- Download and install from https://www.python.org/downloads/
- During installation, **check the box** that says “Add Python to PATH”

---

### 🔹 2. Open Terminal / CMD / PowerShell

Navigate to the project directory:

```bash
cd path/to/SmartCart_Server
```

---

### 🔹 3. Ensure Installation of Required Python Libraries

```bash
pip install flask firebase-admin
```

---

### 🔹 4. Run the Flask Server

```bash
python flask_server_app.py
```

You should see:
```
✅ Firebase initialized.
 * Running on http://<your-ip>:5000
```

✅ Keep this terminal open and running while the system is active.

---

### 🔹 5. Set ESP32 to Send Data to This Server

1. Get the IP address shown in the Flask server output (e.g., `http://192.168.1.10:5000`)
2. In the ESP32 Arduino sketch, look for the line:

```cpp
const char* serverName = "http://192.168.X.X:5000/weight";
```

3. Replace it with your server’s IP.
4. Upload the updated sketch **once** from any laptop.

---

## 🔌 Powering the ESP32

Once the sketch is uploaded:

- You **don’t need to connect the ESP32 to any laptop anymore**
- Just **power the ESP32 with a power bank** (or mobile charger) via USB
- It will automatically:
  - Connect to Wi-Fi (`SSID: SmartCart`, `Password: smartcart123`)
  - Begin sending weight data to the server

📌 **Important**:
- Ensure the phone/laptop hosting the server and the ESP32 are connected to the same Wi-Fi network (`SmartCart`)
- Make sure the Flask server is running before powering on ESP32

---

## ✅ Firebase Notes

- The Python server automatically writes data to Firestore
- No manual Firebase setup needed (except the `serviceAccountKey.json`)

---

## 🛠️ Troubleshooting

| Issue | Fix |
|-------|-----|
| `ModuleNotFoundError` | Run `pip install flask firebase-admin` |
| Flask server doesn't start | Check Python is installed and you’re in the correct folder |
| ESP32 not sending data | Make sure Wi-Fi is on, correct IP is in sketch, Flask server is running |
| Weights are wrong | Recalibrate using the `calibration` sketch on any laptop |

---
