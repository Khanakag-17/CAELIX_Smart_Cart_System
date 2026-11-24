# CAELIX — Evaluation Notes and Data Provenance

## Summary

Two different things are true here, and keeping them apart is the point of this document.

**The detector has recorded metrics, but they are likely inflated.** A validation run of the fine-tuned YOLOv8s reports **0.962 precision, 0.959 recall, 0.987 mAP@50, 0.814 mAP@50-95** on an 834-image split, at 8.5 ms inference. Those are real outputs of a real run, but the way the run was set up (§3) means many validation images were probably seen in training, so they are an upper bound, not a result.

**The assembled system was not evaluated.** No structured test protocol was run against the physical cart. No end-to-end mismatch detection rate, false-alarm rate, weight accuracy, or alert latency was ever recorded, and the hardware is no longer available to produce them. The system was validated by demonstration.

What follows separates what was measured from what was not, and records how each figure was obtained.

---

## 1. What the deployed backend still contains

**Method.** Direct inspection of the project's Cloud Firestore instance through the Firebase console, 24 August 2026. These are development and demonstration records written by the system during 2025 — not the output of any designed experiment.

**Deployment facts.** Project `livecart-1407`, Firestore in `asia-south1`, Spark (free) plan, four registered web apps (`admin-dashboard`, `carya-landing`, `live-cart-frontend`, `user-dashboard`). Seven top-level collections.

| Collection | Documents observed | Contents |
|---|---|---|
| `carts` | 7 | Cart state records under two naming conventions — `CART001`–`CART003` and `cart_001`, `cart_002`, plus `default_cart` and `test_cart` |
| `products` | 9 | Catalogue keyed by EAN-13 barcode |
| `users` | 9 | Account records, user and admin roles |
| `purchase_history` | 7 | One entry per user ID, each a container for a `receipts` subcollection |
| `groups` | 2 | Group-shopping records |
| `alerts` | 1 | A single record — no code in this repository writes to this collection (see below) |
| `admins` | not inspected | — |
| `cart_logs` | **absent** | The collection the vision pipeline writes to. It does not exist (see below) |

> **Caveat on counts.** These are documents visible in the console listing at the time of inspection. The console paginates large collections; for these sizes the listings appeared complete, but the numbers should be treated as "observed", not as an audited total. All seven `purchase_history` entries are shown as non-existent parent documents — they hold subcollections but carry no fields of their own, so they will not appear in a collection query.

### The missing `cart_logs` collection — and what its absence indicates

This is the most informative single observation available, and it is a negative result.

The vision pipeline's output channel is **`cart_logs`**, not `alerts`. `detection_worker.py:145` writes a snapshot document to `cart_logs/{cartId}` every two seconds while a cart is active; `manager.py:40` clears it when the cart goes inactive; the admin dashboard subscribes to it (`dashboard.html:391, 497`); and the admin chatbot queries its most recent entry (`admin_bot/actions/actions.py:19`). Four components across three subsystems depend on it.

**`cart_logs` does not exist in the live Firestore instance.** The project has seven collections and that is not one of them.

The straightforward reading is that the detection worker, in the version committed here, never completed a successful write. That is consistent with a defect visible in the source: `detection_worker.py:39` and `:83` subscript a Firestore `DocumentReference` directly (`cart_ref["expected_weight"]`, `cart_ref["weight"]`) rather than the fetched document snapshot — line 41 performs the correct `.get()` two lines later. Subscripting a `DocumentReference` raises `TypeError`, which would abort `start_detection_thread` before any frame is processed. A second defect at `:129` and `:131` applies the bitwise `&` operator between a `set` and a boolean comparison, which raises `TypeError` on any frame where a mismatch is found.

This should be verified by running the code against a Firestore instance before being relied upon. If it holds, the honest characterisation is that **the committed vision pipeline is not in a working state**, and the multi-modal verification described in the project report was demonstrated with earlier code that is not what this repository contains.

### The one alert record

The `alerts` collection holds exactly one document, `test_cart`:

| Field | Value |
|---|---|
| `cartID` | `test_cart` |
| `lat` / `lon` | `23.202730980553024`, `77.45992644743241` |
| `timestamp` | `1751903707383` → 7 July 2025, 21:25 IST |

**Nothing in this repository writes to `alerts`.** A search across all Python, JavaScript, and HTML sources returns no write to that collection. (The `alertsRef` variable in `dashboard.html:391` is misleadingly named — it points at `cart_logs`.) This record was produced by code not present here, or entered by hand.

The coordinates are worth noting: at fifteen decimal places they have the signature of a live browser `Geolocation` reading rather than a typed value, and they place the cart 31.2 m from the geofence centre defined in `script_new.js` — 1.2 m outside the 30 m boundary. So a real location capture almost certainly happened once, from a device, using code that never reached this repository. The record carries no mismatch detail (no expected-versus-measured weight, no detected class), so it supports no conclusion about detection behaviour.

### The cart tracker is a static demonstration

The admin dashboard's Cart Tracker renders a Leaflet map with a 30 m circular geofence, cart markers, and an inside/outside-premises status with distance to the boundary. The geofence mathematics are real. The positions are not:

```js
const geofenceCenter = [23.20250, 77.46010];
const cart1Location  = [23.20258, 77.46003];   // hardcoded
const cart2Location  = [23.20261, 77.460413];  // hardcoded
```

| Marker | Distance from centre | Status |
|---|---|---|
| CART001 | 11.4 m | 18.6 m **inside** — always |
| CART002 | 34.2 m | 4.2 m **outside** — always |

There is **no GPS module in the cart hardware** (the assembled rig is ESP32 + 2× HX711 + 2× load cell + power bank, and the firmware contains no location code) and **no location source anywhere in the backend**. The "Outside Premises" alert visible in dashboard screenshots is that second hardcoded constant rendering, identically, on every page load.

The project flowchart presents "GPS Live Location Tracking Starts" and a cart-exit alert as pipeline stages. That is a design intent, not an implemented capability. The honest description is: **geofence evaluation logic implemented and working; position input not implemented.** Anyone citing this feature — on a CV, in an SOP, in an interview — should describe it that way, because `script_new.js` is nine lines from the top of the file and trivially checkable.

### Inferred data model

| Collection | Fields observed |
|---|---|
| `carts/{cartId}` | `active` (bool), `checkoutInProgress` (bool), `createdAt` (timestamp), `ip_stream_url` (string), `ownerId` (string / null), `status` (string: `completed`, …) |
| `products/{ean13}` | `name`, `price`, `quantity` |
| `users/{uid}` | `createdAt`, `email`, `username`, `role`, `login_role` |
| `groups/{groupCode}` | `groupCode`, `groupName`, `createdAt`, `createdBy`, `members[]` and `allowedMembers[]` (each `{email, role, uid}`) |
| `alerts/{cartId}` | `cartID`, `lat`, `lon`, `timestamp` (epoch ms) |
| `purchase_history/{uid}/receipts/…` | receipt records |

**Schema observations worth recording:**

- **Cart IDs are inconsistent.** `CART001` and `cart_001` coexist as separate documents under different conventions, alongside `default_cart` and `test_cart`. Live records and test fixtures share one collection with nothing distinguishing them.
- **`role` and `login_role` are duplicated** on user documents with no documented precedence between them.
- **Group shopping is undocumented.** The `groups` collection implements a multi-user shared-cart feature that appears nowhere in the project report or the README's feature list.
- **`alerts` is keyed by cart ID**, meaning a second alert for the same cart overwrites the first. The collection cannot accumulate an alert history as currently designed.

---

## 2. What the firmware documents

**Method.** Read directly from committed source. See [`hardware.md`](hardware.md) for full detail.

Calibration factors `SCALE1 = 100.585037` and `SCALE2 = 118.054420`, boot-time taring across ten samples per channel, ten-sample averaging per transmitted reading, 1 Hz transmission.

These are **evidence that a calibration procedure was carried out** on the assembled cart, and they record its outcome. They are not accuracy measurements: no reference-mass comparison was performed, so the error of the calibrated system is unknown.

---

## 3. What the vision model documents

**Method.** Read from committed source and from the linked public training artefacts (Roboflow workspace `PRODUCTCV`, Kaggle notebook).

The detector is a **fine-tuned YOLOv8s** recognising four classes — `maggi-noodles`, `nevia-cream`, `tide-detergent`, `taaza-tea-leaves` — mapped in `detection_worker.py` to Maggi, Nivea, Tide, and Taaza Tea Leaves. Weights are committed as `model_final.pt`.

**Dataset.** Purpose-built and annotated on Roboflow, grown across three versions:

| Version | Generated | Images | Resolution |
|---|---|---|---|
| v1 | 22 Jun 2025 | 515 | 640×640 |
| v2 | 23 Jun 2025 | 1,545 | 640×640 |
| v3 | 5 Jul 2025 | **4,173** | 640×640, stretch-to |

Roboflow reports 1,391 source images in the dataset, so v3's 4,173 reflects augmentation. No model was trained inside Roboflow — v3 shows "This version doesn't have a model" — so all training happened in the Kaggle notebook.

### Detector metrics — measured

**Method.** `model.val()` in the published training notebook, Ultralytics 8.3.168, PyTorch 2.6.0+cu124, Tesla T4. Validation set: **834 images, 1,404 labelled instances.** In that notebook the training cells (YOLOv8s, 50 epochs, 640×640) are commented out: the run loads `model_final.pt` from an earlier session and only validates it.

| Class | Instances | Precision | Recall | F1 | mAP@50 | mAP@50-95 |
|---|---|---|---|---|---|---|
| maggi-noodles | 371 | 0.944 | 0.965 | 0.954 | 0.982 | 0.786 |
| nevia-cream | 407 | 0.977 | 0.975 | 0.976 | 0.992 | 0.862 |
| taaza-tea-leaves | 249 | 0.956 | 0.958 | 0.957 | 0.988 | 0.805 |
| tide-detergent | 377 | 0.973 | 0.939 | 0.955 | 0.985 | 0.802 |
| **all** | **1,404** | **0.962** | **0.959** | — | **0.987** | **0.814** |

Additional thresholds: **mAP@75 = 0.950**.

**Inference speed.** 8.5 ms per image during batched validation on a T4 (plus 0.5 ms preprocess, 1.2 ms postprocess). Single-image inference measured separately at 12.1 ms warm, 43.7 ms on first call.

**Sample predictions.** Three test images, all detections correct:

| Image | Detections | Confidences |
|---|---|---|
| `image0.jpeg` | maggi-noodles, taaza-tea-leaves | 0.898, 0.839 |
| `image4.jpeg` | maggi-noodles, nevia-cream, taaza-tea-leaves | 0.873, 0.867, 0.865 |
| `image3.jpeg` | maggi-noodles, taaza-tea-leaves | 0.809, 0.546 |

### Four caveats that must accompany those numbers

**1. The validation set was not held out from training.** The notebook re-creates the 70/20/10 split with `random.shuffle` and no fixed seed, then validates weights that were trained in a separate, earlier session on a different shuffle. Most of the 834 validation images were therefore very likely in that model's training set. This alone makes the figures an upper bound, and it is the biggest reason they should not be quoted as the detector's accuracy.

**2. Probable augmentation leakage — treat the metrics as an upper bound.** The notebook splits `final-grocery-data` 70/20/10 by shuffling at the *image file* level. The Roboflow export contains 4,173 images generated from **1,391 source photographs** — exactly three output images per source. A random file-level shuffle therefore almost certainly places augmented variants of the same photograph in both the training and validation splits. When that happens, validation performance is measured partly on images the model has effectively already seen, and the resulting figures are optimistic by an unknown margin.

This is worth raising proactively rather than defending under questioning. The correct fix is a **group-aware split** — partition by source photograph, then augment each partition independently — and re-running it would produce the honest number. Until that is done, "0.987 mAP@50 on a randomly split augmented dataset" is the accurate way to state the result.

**3. These are detector metrics, not system metrics.** They measure YOLOv8s against a curated dataset of four products. They say nothing about CAELIX end to end: nothing about cart-mounted camera imagery, store lighting, occlusion from stacked items, or the barcode-weight-vision cross-check that is the actual contribution. Restating 0.987 as "CAELIX is 98.7% accurate" would be false.

**4. The test split was never used.** The notebook carves out a 10% test partition (~418 images) and then evaluates only on validation. A genuinely held-out test number does not exist.

> **Note on the notebook's title.** It is published as "…95% Precision", but the measured overall precision is **0.962**. The figure closest to 95% is mAP@75 (0.950). Anyone citing this work should quote the specific metric rather than the title.

**Route to a real in-situ number, still available without the cart:** re-run the committed weights against archived photographs of the loaded basket and report the resulting per-class confidences, clearly labelled as **offline re-evaluation on archived images**. This has not been done.

---

## 4. What was never measured

For completeness, the metrics a reader might reasonably expect — none of which exist:

| Metric | Status |
|---|---|
| Detector precision / recall / mAP on the curated dataset | **Recorded, but likely inflated** — see §3 |
| Detector inference speed | **Measured** — 8.5 ms/image on a T4 |
| Detector performance on cart-mounted camera imagery | Never measured |
| Detector performance on a group-aware (leak-free) split | Never measured |
| Load-cell error against reference masses | Never measured |
| End-to-end mismatch true-positive rate | Never measured |
| False-alarm rate on honest shopping sessions | Never measured |
| Alert latency, event → dashboard | Never measured |
| Throughput / concurrent cart capacity | Never measured |

---

## 5. Protocol for anyone extending this work

If the rig is rebuilt, this is what should be captured — recorded here so the gap is at least specified:

1. **Load-cell accuracy.** Reference masses across the cart's working range (0–10 kg), ten trials each, at a minimum of five positions on the cart floor. Report mean absolute error, linearity, and positional sensitivity — the last being the specific claim the dual-cell design makes.
2. **Detector performance in situ.** A held-out set of cart-mounted camera frames under store lighting, annotated. Report per-class precision and recall, with the confusion matrix — the four-class vocabulary makes this cheap.
3. **End-to-end verification.** Scripted sessions across four conditions: honest scan, unscanned item, scanned-then-removed, and barcode swap. At least 30 trials per condition. Report true-positive and false-positive rates per condition; the false-positive rate on honest sessions is the number that decides whether the system is deployable at all.
4. **Latency.** Timestamp the physical event and the dashboard alert; report the distribution, not the mean.
5. **Occlusion sensitivity.** Repeat condition 2 with progressively stacked items. This is the known weak point of a single-camera design and the most likely reason a deployment would fail.
