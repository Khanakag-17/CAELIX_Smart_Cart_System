from flask import Flask, request
from firebase_admin import credentials, firestore, initialize_app
import datetime
import json

app = Flask(__name__)

# Firebase setup
cred = credentials.Certificate("serviceAccountKey.json")
initialize_app(cred)
db = firestore.client()

@app.route('/weight', methods=['POST'])
def receive_weight():
    try:
        data = request.get_json()
        weight = data.get("weight", None)

        if weight is not None:
            cart_ref = db.collection("carts").document("CART001")
            cart_ref.update({
                "weight": weight,
                "lastUpdated": datetime.datetime.utcnow()
            })
            print(f"✅ Weight received: {weight}g and updated to Firestore.")
            return {"message": "Weight updated"}, 200
        else:
            return {"error": "Missing weight"}, 400
    except Exception as e:
        print("❌ Error:", e)
        return {"error": str(e)}, 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
