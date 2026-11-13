# CAELIX 🛒

**Frictionless Checkout Smart Cart** — a multi-modal self-checkout system that cross-verifies barcode scans, cart weight, and computer-vision detections to catch mis-scans and shrinkage.

[![Python](https://img.shields.io/badge/Python-3.9--3.10-blue.svg)](https://python.org)
[![YOLOv8](https://img.shields.io/badge/YOLOv8-Object%20Detection-green.svg)](https://github.com/ultralytics/ultralytics)
[![Firebase](https://img.shields.io/badge/Firebase-Firestore%20%2B%20Auth-orange.svg)](https://firebase.google.com)
[![ESP32](https://img.shields.io/badge/ESP32-HX711%20Load%20Cells-00979D.svg)](https://www.arduino.cc/)
[![Flask](https://img.shields.io/badge/Flask-Middleware-black.svg)](https://flask.palletsprojects.com/)
[![Rasa](https://img.shields.io/badge/Rasa-3.6-5A17EE.svg)](https://rasa.com/)
[![License](https://img.shields.io/badge/License-Apache%202.0-lightgrey.svg)](LICENSE)

> **Project status:** university team prototype, built and demonstrated in 2025. The vision model is evaluated with real metrics; the assembled system is not, and the physical cart is no longer available to change that. See [Evaluation](#-evaluation) and [Limitations](#limitations) for exactly what was and was not measured.

---

## The problem

Physical retail loses time and money at the same place: the checkout lane. Queues form at peak hours, staff are tied up supervising transactions, and unattended self-checkout is a well-known shrinkage vector — an item can be left unscanned, swapped for a cheaper barcode, or simply dropped in the bag. The established fix is item-level RFID, which works but requires tagging every unit in the store, and that cost is what keeps it out of most mid-market retail.

CAELIX takes the opposite approach: leave the products alone and instrument the **cart**. A shopper scans a barcode with their phone, and the cart independently checks that claim two other ways — what it weighs and what it sees. Agreement means the scan was honest. Disagreement raises an alert on the store's admin dashboard. The hardware to do this is commodity: an ESP32, two load cells, and a camera.

---

## How it works

The verification logic is a three-way cross-check on a single source of truth in Firestore:

| Signal | Source | What it establishes |
|---|---|---|
| **Declared** | Barcode scanned by the shopper's phone | What the customer says is in the cart |
| **Measured** | Dual load cells → HX711 → ESP32 → Flask → Firestore | What the cart physically holds |
| **Observed** | Cart-mounted phone streaming MJPEG → YOLOv8 inference | What is visibly in the cart |

A detection worker runs per active cart and compares the three. Two mismatch classes are distinguished (`detection_worker.py`):

- **Unscanned item** — an object is detected that is not on the scanned list, and the measured weight exceeds the expected weight for that list.
- **Missing item** — an item was scanned but is not detected, and the measured weight falls below what that list should weigh.

Every two seconds the worker writes a snapshot document to `cart_logs/{cartId}` carrying the detected items, the unscanned set, and the missing set. The admin dashboard (`dashboard.html`) subscribes to that collection in real time, and the admin chatbot reads its most recent entry. `manager.py` clears a cart's log document when the cart goes inactive.

Session binding uses a QR code on the cart: scanning it links that physical cart to the shopper's account for the duration of the session, moving the cart document through `activate → active → checkout → completed`.

Checkout awards loyalty points and a membership tier, and generates a PDF receipt via jsPDF into the shopper's purchase history.

### Cart location tracking — read this before citing it

The admin dashboard includes a **Cart Tracker** view: a Leaflet/OpenStreetMap map with a 30-metre circular geofence around the store, cart markers, and an inside/outside-premises status with the distance to the boundary.

**The cart positions are hardcoded.** `script_new.js` defines `cart1Location` and `cart2Location` as two fixed coordinate pairs. There is no GPS module in the cart hardware and no location source anywhere in the firmware or backend. CART001 therefore always renders 18.6 m inside the boundary and CART002 always renders 4.2 m outside it, on every page load.

What is genuinely implemented is the **geofence logic** — the haversine distance calculation, the boundary comparison, and the status rendering are all real and would work unchanged against live coordinates. What does not exist is anything that produces those coordinates. Treat this feature as a working UI demonstration of an unimplemented capability, and describe it that way.

---

## Architecture

```
  Shopper's phone                Cart hardware           Cart-mounted phone
  (barcode scan)             (2× load cell + HX711)    (IP-camera app, MJPEG)
        │                            │                          │
        │                            ▼                          │
        │                     ESP32 firmware                    │
        │                  tare, calibrate, avg×10              │
        │                            │  HTTP POST {weight}      │
        │                            ▼                          │
        │                 weight_bridge/app.py                  │
        │                            │                          │
        ▼                            ▼                          ▼
  ┌─────────────────────────────────────────────────────────────────┐
  │                      Cloud Firestore                            │
  │   carts · products · users · alerts · purchase_history · groups │
  └─────────────────────────────────────────────────────────────────┘
        │                            │                          │
        ▼                            ▼                          ▼
   User dashboard            Admin dashboard            manager.py
   wallet, receipts          alerts, analytics       spawns 1 detection
                                                      thread per active cart
```

`manager.py` polls the `carts` collection and starts or stops a detection thread as carts go active or idle, so one process serves multiple carts.

---

## Tech stack

| Layer | Technology |
|---|---|
| Embedded | ESP32, 2× load cell, 2× HX711 amplifier, Arduino/C++ firmware |
| Computer vision | YOLOv8s fine-tuned (Ultralytics), OpenCV, scikit-learn (k-means colour heuristic) |
| Middleware | Flask, `firebase-admin` |
| Cloud | Cloud Firestore, Firebase Authentication, Firebase Hosting |
| Frontend | HTML5, CSS3, vanilla JavaScript, Chart.js, Leaflet + OpenStreetMap, `html5-qrcode`, jsPDF |
| Conversational AI | Rasa 3.6 (dual user/admin bots) |

### Prototype form factor

The build is a **hand-carried plastic shopping basket**, not a supermarket trolley. Two bar-type load cells sit under a rigid platform at opposite edges of the basket floor; the ESP32 and both HX711 amplifiers are soldered to a single perfboard between them, powered by a USB power bank. The camera is an **Android phone running an IP-camera app**, clamped to the basket rim on a tripod arm, serving MJPEG on port 8080 — which is what the `ip_stream_url` field in each cart document points at. Everything scales conceptually to a trolley; nothing here has been built at that size.

---

## 🧩 Repository layout

```
caelix/
├── firmware/
│   └── cart_scale/
│       └── cart_scale.ino        # ESP32 firmware — dual HX711, Wi-Fi telemetry
│
├── services/
│   ├── vision/                   # YOLOv8 detection + mismatch logic
│   │   ├── manager.py            # one detection thread per active cart
│   │   ├── detection_worker.py   # per-cart inference, writes cart_logs/{cartId}
│   │   └── models/model_final.pt # fine-tuned YOLOv8s, 4 product classes
│   │
│   ├── weight_bridge/            # ESP32 -> Firestore middleware
│   │   ├── app.py                # Flask, POST /weight
│   │   └── serviceAccountKey.example.json
│   │
│   └── assistant/                # CAELIX Assist — Rasa chatbots
│       ├── admin_bot/
│       ├── user_bot/
│       └── web_widget/           # browser chat widget
│
├── web/                          # deployed frontend (Firebase Hosting)
│   ├── landing_page.htm          # entry point, user/admin login
│   ├── Admin_Dashboard/
│   ├── User_Dashboard/
│   ├── Live_cart/scanner/        # barcode scanning
│   ├── Live_cart/checkout/       # checkout + receipt generation
│   └── logos/
│
├── docs/
│   ├── hardware.md               # wiring, pin map, calibration
│   └── evaluation.md             # what was measured, and what wasn't
│
├── CITATION.cff
├── LICENSE                       # Apache 2.0
└── README.md
```

Each service under `services/` has its own `README.md` and `requirements.txt`.
Install only the one you need — the vision service and the chatbots have
incompatible Python requirements.

---

## 🛠️ Setup

### Prerequisites

- **Python 3.9 or 3.10.** The chatbots pin `rasa==3.6.20`, which will not install on 3.11+. If you are skipping the chatbots, any Python ≥3.9 works for the vision and weight services.
- A **Firebase project** with **Cloud Firestore** enabled. *(Realtime Database is not used anywhere in this codebase.)*
- A **camera reachable over HTTP serving an MJPEG stream** — in the original build, an Android phone running an IP-camera app at `http://<phone-ip>:8080/video`. The vision service opens a per-cart stream URL read from Firestore; it does **not** use a locally attached webcam.
- An **ESP32** with two load cells and two HX711 amplifiers, for the weight path. See [`docs/hardware.md`](docs/hardware.md).

### 1. Clone

```bash
git clone https://github.com/Khanakag-17/CAELIX_Smart_Cart_System.git
cd CAELIX_Smart_Cart_System
```

There is no repo-wide `requirements.txt`. Each service declares its own, because
the vision service and the Rasa chatbots have conflicting dependencies. Install
per service, ideally into separate virtual environments.

### 2. Firebase credentials

1. In the [Firebase Console](https://console.firebase.google.com), create a project and enable Cloud Firestore.
2. **Project Settings → Service Accounts → Generate new private key**.
3. Save the JSON as `serviceAccountKey.json` in whichever services you are running:
   - `services/weight_bridge/` — a filled-in template is provided as `serviceAccountKey.example.json`
   - `services/vision/`
   - `services/assistant/admin_bot/`

   Each service resolves the key relative to its own directory, so you can run
   from any working directory. The root `.gitignore` excludes `serviceAccountKey.json`
   so a real key cannot be committed by accident.
4. Replace the `// Your Firebase configuration` block in the frontend JavaScript under `web/` with your project's web config.

### 3. Weight bridge

```bash
cd services/weight_bridge
pip install -r requirements.txt
python app.py                    # listens on 0.0.0.0:5000
```

Before flashing the ESP32, change these three values in
[`firmware/cart_scale/cart_scale.ino`](firmware/cart_scale/cart_scale.ino) —
they are hardcoded to the original demo rig:

| Constant | Committed value | Change to |
|---|---|---|
| `ssid` / `password` | `SmartCart` / `smartcart123` | your network |
| `serverName` | `http://192.168.177.90:5000/weight` | your server's LAN IP |
| `SCALE1` / `SCALE2` | `100.585037` / `118.054420` | your own calibration factors |

The ESP32 and the server must be on the same network. Full wiring diagram, pin
map and calibration procedure: **[`docs/hardware.md`](docs/hardware.md)**.

> **Note:** `app.py` writes to a single hardcoded cart document, `CART001`.
> Multi-cart weight routing was not implemented.

### 4. Vision service

```bash
cd services/vision
pip install -r requirements.txt
python manager.py
```

Weights ship at `services/vision/models/model_final.pt`, or download them from
[Kaggle](https://www.kaggle.com/models/khanakagrawal/grocery-detector). Each cart
document in Firestore needs an `ip_stream_url` field pointing at its camera.

Training dataset: [Roboflow](https://universe.roboflow.com/productcv/grocery-items-rvvcm).
Training notebook: [Kaggle](https://www.kaggle.com/code/khanakagrawal/multi-class-grocery-detector-95-precision).

### 5. CAELIX Assist (optional)

```bash
cd services/assistant
pip install -r requirements.txt          # needs Python 3.8-3.10

cd admin_bot && rasa train && cd ..
cd user_bot  && rasa train && cd ..
```

Each bot needs its own action server alongside it. See
[`services/assistant/README.md`](services/assistant/README.md).

### 6. Frontend

Open `web/landing_page.htm` in a browser, or serve the `web/` directory over a
local HTTP server (VS Code Live Server works). Both user and admin entry points
are reached from this page.

---

## 🧭 Using the system

**As a shopper:** log in from `landing_page.htm` → scan the QR code on a cart to bind it to your session → scan product barcodes in `barcode.html` → top up in `wallet_gateway.html` → complete payment in `checkout.html` and receive a generated receipt.

**As an administrator:** log in from `landing_page.htm` → `dashboard.html` shows live cart state, mismatch alerts, sales analytics, per-cart status, inventory levels, and camera feeds.

```
landing_page.htm
├── User  → user_dash.html
│            ├── wallet_gateway.html      (add funds)
│            └── barcode.html             (scan → weight + CV verification)
│                 └── checkout.html       (pay → receipt → back to dashboard)
└── Admin → dashboard.html
             ├── live cart monitoring     ├── theft/mismatch alerts
             ├── sales overview           ├── cart status
             └── inventory                └── camera monitor
```

---

## 📊 Evaluation

Two things are true here and are kept apart deliberately: **the detector was evaluated properly; the assembled system was not.**

### Detector — measured

YOLOv8s fine-tuned for 50 epochs at 640×640 on a purpose-built four-class grocery dataset, evaluated on an 834-image validation split (1,404 instances):

| Class | Instances | Precision | Recall | mAP@50 | mAP@50-95 |
|---|---|---|---|---|---|
| maggi-noodles | 371 | 0.944 | 0.965 | 0.982 | 0.786 |
| nevia-cream | 407 | 0.977 | 0.975 | 0.992 | 0.862 |
| taaza-tea-leaves | 249 | 0.956 | 0.958 | 0.988 | 0.805 |
| tide-detergent | 377 | 0.973 | 0.939 | 0.985 | 0.802 |
| **all** | **1,404** | **0.962** | **0.959** | **0.987** | **0.814** |

mAP@75 = 0.950. Inference: **8.5 ms per image** on a Tesla T4 (12.1 ms single-image, warm).

**Read these as an upper bound.** The dataset's 4,173 images were generated from 1,391 source photographs — three per source — and the notebook splits them by shuffling at the file level, so augmented variants of the same photograph very likely appear in both training and validation. A group-aware split partitioned by source photograph would give the honest figure; it has not been run. These are also **detector** metrics on a curated dataset, not end-to-end system accuracy, and the 10% test partition the notebook creates was never evaluated. Full detail and the reasoning in [`docs/evaluation.md`](docs/evaluation.md).

### System — not measured

**No structured test protocol was ever run against the assembled cart**, and it is no longer available to produce one. No end-to-end mismatch detection rate, false-alarm rate, weight accuracy, or alert latency exists. The system was validated by working demonstration. Rather than paper over that, the rest of this section states what remains verifiable.

**Verifiable from the deployed backend.** The Firestore project remained live and queryable as of 24 August 2026, holding the development records written during 2025: cart documents with session lifecycle state, a product catalogue keyed by EAN-13 barcode, per-user purchase-history receipt subcollections, and group-shopping records. Notably, the `cart_logs` collection that the vision pipeline writes its mismatch snapshots to **does not exist** in that instance — which, together with two defects visible in `detection_worker.py`, indicates the committed detection worker is not in a working state. Observed collection contents, the inferred schema, and that analysis are recorded in **[`docs/evaluation.md`](docs/evaluation.md)**.

**Verifiable from the firmware.** The load-cell calibration factors (`SCALE1 = 100.585037`, `SCALE2 = 118.054420`), boot-time taring, 10-sample averaging per reading, and 1 Hz transmission interval are documented parameters, evidence that a calibration procedure was carried out. They are not accuracy measurements. See [`docs/hardware.md`](docs/hardware.md).

**Verifiable from the model.** The [dataset](https://universe.roboflow.com/productcv/grocery-items-rvvcm) was built and annotated for this project, growing across three Roboflow versions — 515 images (22 Jun 2025) → 1,545 (23 Jun) → 4,173 at 640×640 (5 Jul 2025). The [training notebook](https://www.kaggle.com/code/khanakagrawal/multi-class-grocery-detector-95-precision) is public and carries the full evaluation summarised above, plus precision–recall, F1-confidence, precision-confidence and recall-confidence curves and a confusion matrix.

**What would still need measuring.** Detector performance on cart-mounted camera imagery under store lighting, and on a leak-free group-aware split; load-cell error against reference masses across the working range; end-to-end mismatch true-positive and false-positive rates across scripted scan / no-scan / barcode-swap scenarios; and alert latency from event to dashboard. None were captured, and none are reconstructible from what survives. A protocol for each is specified in [`docs/evaluation.md`](docs/evaluation.md) for anyone extending the work.

---

## Limitations

Stated plainly, because a prototype with no listed downsides is less trustworthy than one that is honest about its edges.

- **The system was never quantitatively evaluated**, only the detector. Demonstration is not measurement.
- **Detector metrics are an upper bound**, not a final result — the train/validation split shuffles augmented images at file level, so variants of the same source photograph likely span both splits.
- **The committed detection worker does not appear to run.** `detection_worker.py` subscripts a Firestore `DocumentReference` where it should use the fetched snapshot (lines 39 and 83), and applies a bitwise operator between a set and a boolean (lines 129 and 131). Both raise `TypeError`. The absence of any `cart_logs` collection in the deployed Firestore is consistent with this. Documented in [`docs/evaluation.md`](docs/evaluation.md) rather than quietly fixed, so the record stays accurate.
- **Four-class vocabulary.** The detector recognises `maggi-noodles`, `nevia-cream`, `tide-detergent`, and `taaza-tea-leaves` — enough to prove the pipeline, nowhere near a store catalogue. Unpackaged and visually similar goods were never addressed.
- **Single-cart weight path.** `services/weight_bridge/app.py` writes to a hardcoded `CART001`; the multi-cart claim holds for the vision layer, not the weight layer.
- **Unauthenticated LAN transport.** The ESP32 POSTs plain HTTP to a hardcoded local IP with no authentication, and Wi-Fi credentials are compiled into the firmware.
- **Not security-hardened.** This is a coursework prototype. Firestore security rules, credential handling, and session-token validation were never reviewed or hardened for production use, and the wallet is a **simulated** payment flow — no payment processor is integrated.
- **Occlusion is unhandled.** Stacked or overlapping items in a real cart will defeat a single top-down camera; this was never tested under realistic loading.
- **Crude colour heuristic.** `detect_color()` uses k-means with hardcoded RGB thresholds as a secondary signal. It is a heuristic, not a validated classifier.
- **Mismatch records are overwritten, not accumulated.** `cart_logs` is keyed by cart ID and written with `set()`, so each cart holds only its latest snapshot. There is no alert history to audit or analyse after the fact.
- **Cart location is not tracked.** The geofence map runs on two hardcoded coordinate pairs; no GPS hardware or location source exists. See [Cart location tracking](#cart-location-tracking--read-this-before-citing-it).
- **Basket-scale prototype.** Built on a hand-carried shopping basket. Load distribution, camera coverage, and occlusion all behave differently on a full trolley, and none of that was tested.
- **Calibration drift and connectivity.** Load cells need periodic recalibration, and the whole design assumes continuous Wi-Fi coverage. Neither was tested over time.

---

## 👥 Team

Built by a four-person team at LNCT University, Bhopal:

**Aashman Singh Verma** · **Abhishree Soni** · **Ashutosh Singh** · **Khanak Agrawal**

Who wrote what is recorded in the
[commit history](https://github.com/Khanakag-17/CAELIX_Smart_Cart_System/graphs/contributors)
and in the authorship notes on individual documents under `docs/`.

---

## 🔗 Links

| | |
|---|---|
| Live site | [livecart-1407.web.app](https://livecart-1407.web.app) |
| Model training notebook | [Kaggle](https://www.kaggle.com/code/khanakagrawal/multi-class-grocery-detector-95-precision) |
| Trained weights | [Kaggle Models](https://www.kaggle.com/models/khanakagrawal/grocery-detector) |
| Dataset | [Roboflow](https://universe.roboflow.com/productcv/grocery-items-rvvcm) |

## 📄 License

Apache License 2.0 — see [LICENSE](LICENSE).
