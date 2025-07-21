import firebase_admin
from rasa_sdk import Action, Tracker
from rasa_sdk.executor import CollectingDispatcher
from firebase_admin import credentials, firestore, initialize_app
import os

# Initialize Firebase (only once)
if not firebase_admin._apps:
    cred = credentials.Certificate("serviceAccountKey.json")
    initialize_app(cred)

db = firestore.client()

class ActionFetchCartAlerts(Action):
    def name(self) -> str:
        return "action_fetch_cart_alerts"

    def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: dict):
        cart_logs_ref = db.collection("cart_logs")
        query = cart_logs_ref.order_by("timestamp", direction=firestore.Query.DESCENDING).limit(1)

        results = query.stream()

        found = False

        for doc in results:
            found = True
            data = doc.to_dict()
            cart_id = data.get("cart_id", "Unknown")
            user_email = data.get("user_email", "N/A")
            timestamp = data.get("timestamp", "N/A")
            missing_items = data.get("missing_scanned_items", [])
            unscanned_items = data.get("unscanned_detected_items", [])

            total_faulty = len(missing_items) + len(unscanned_items)

            message = f"🚨 *Cart Alert for {cart_id}*\n"
            message += f"👤 *User:* {user_email}\n"
            message += f"🕒 *Timestamp:* {timestamp}\n\n"
            if missing_items:
                message += f"❌ *Missing Scanned Items:* {', '.join(missing_items)}\n"
            if unscanned_items:
                message += f"⚠️ *Unscanned Detected Items:* {', '.join(unscanned_items)}\n"
            message += f"\n📦 *Total Faulty Items:* {total_faulty}"

            dispatcher.utter_message(text=message)
            break

        if not found:
            dispatcher.utter_message(text="✅ No recent faulty carts detected.")

        return []
