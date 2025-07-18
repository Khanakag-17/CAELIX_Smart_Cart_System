# detection_worker.py
import cv2
import time
from ultralytics import YOLO
from datetime import datetime
from sklearn.cluster import KMeans

# Store state for cart threads
cart_thread_states = {}

# Map YOLO class labels to product names
CLASS_TO_PRODUCT = {
    "maggi-noodles": "Maggi",
    "nevia-cream": "Nivea",
    "tide-detergent": "Tide",
    "taaza-tea-leaves": "Taaza Tea Leaves",
}

def detect_color(image, k=2):
    image = cv2.resize(image, (50, 50))
    image = image.reshape((-1, 3))
    kmeans = KMeans(n_clusters=k, n_init=10)
    kmeans.fit(image)
    dominant = kmeans.cluster_centers_[0].astype(int)
    r, g, b = dominant
    if r > 150 and g < 100 and b < 100:
        return "Red"
    elif b > 150 and r < 100:
        return "Blue"
    elif g > 150 and r < 100:
        return "Green"
    elif r > 150 and g > 150 and b < 100:
        return "Yellow"
    else:
        return "Other"

def start_detection_thread(cart_id, db):
    cart_ref = db.collection("carts").document(cart_id)
    expected_weight = cart_ref["expected_weight"]

    cart_doc = cart_ref.get()
    if not cart_doc.exists:
        print(f"[{cart_id}] Cart doc missing")
        return

    cart_data = cart_doc.to_dict()
    ip_url = cart_data["ip_stream_url"]
    # session_id = cart_data["session_id"]

    # session_doc = db.collection("sessions").document(session_id).get()
    # if not session_doc.exists:
    #     print(f"[{cart_id}] Session doc missing")
    #     return

    # session_data = session_doc.to_dict()
    # scanned_items = session_data.get("scanned_items", [])
    # user_email = session_data.get("email")  # use email instead of user_id

    # 🔁 NEW: Fetch scanned items from carts/{cart_id}/items subcollection

    # Optional: fetch user email if stored in the cart doc
    owner_id = cart_data.get("ownerId")
    user_email = "unknown"

    if owner_id:
        user_doc = db.collection("users").document(owner_id).get()
        if user_doc.exists:
            user_email = user_doc.to_dict().get("email", "unknown")

    print(f"[{cart_id}] Starting webcam detection...")
    cap = cv2.VideoCapture(ip_url)
    if not cap.isOpened():
        print(f"[{cart_id}] Webcam not accessible.")
        return

    model = YOLO("model_final.pt")
    detected_items = set()
    last_log_time = time.time()
    CONF_THRESHOLD = 0.80
    

    while True:
        current_weight = cart_ref["weight"]
        # Check if cart still active
        cart_data = cart_ref.get().to_dict()
        if not cart_data.get("active", False):
            print(f"[{cart_id}] Stopping detection (inactive cart).")
            break

        ret, frame = cap.read()
        if not ret:
            continue

        items_ref = db.collection("carts").document(cart_id).collection("items").stream()
        scanned_items = []
        for doc in items_ref:
            data = doc.to_dict()
            name = data.get("name")
            if name:  # avoid None values
                scanned_items.append(name)
        print(f"[{cart_id}] Scanned items from Firestore: {scanned_items}")

        results = model(frame)[0]
        current_frame_detections = set()

        for box in results.boxes:
            if box.conf[0] < CONF_THRESHOLD:
                continue
            x1, y1, x2, y2 = map(int, box.xyxy[0])
            cls_id = int(box.cls[0])
            label = model.names[cls_id]
            product_name = CLASS_TO_PRODUCT.get(label, label)

            color = detect_color(frame[y1:y2, x1:x2])
            
            current_frame_detections.add(product_name)
            detected_items = current_frame_detections

            # === UI Hook: Admin/User Alert ===
            # Replace this with socket event or Firestore flag later
            # print(f"[{cart_id}] Detected {product_name}-{color}")

        # Theft detection: compare sets
        unscanned = current_frame_detections - set(scanned_items)
        missing = set(scanned_items) - current_frame_detections

        if unscanned or missing:
            print(f"[{cart_id}] ⚠️ Theft Alert:")
            if unscanned & (current_weight > expected_weight):
                print(f"  - Unscanned items: {unscanned}")
            if missing & (current_weight < expected_weight):
                print(f"  - Scanned but missing: {missing}")

        if time.time() - last_log_time >= 2:
            log = {
                "timestamp": datetime.now().isoformat(),
                "user_email": user_email,
                "detected_items": list(detected_items),
                "missing_scanned_items": list(missing),
                "unscanned_detected_items": list(unscanned),
                "cart_id": cart_id
            }

            try:
                log_ref = db.collection("cart_logs").document(cart_id)
                log_ref.set(log)  # overwrite if exists
                print(f"[{cart_id}] ✅ Updated cart_logs document.")
            except Exception as e:
                print(f"[{cart_id}] ❌ Firestore log failed: {e}")

            last_log_time = time.time()  # move this inside the if-block



        cv2.waitKey(1)

    cap.release()
    print(f"[{cart_id}] Detection thread closed.")