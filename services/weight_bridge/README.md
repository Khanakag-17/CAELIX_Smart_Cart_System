# Weight bridge

Receives weight readings from the cart's ESP32 over Wi-Fi and writes them to
Firestore. Runs on any machine on the same network as the cart.

## Setup

```bash
pip install -r requirements.txt
```

Copy `serviceAccountKey.example.json` to `serviceAccountKey.json` and fill in
your Firebase service account details. The app resolves it relative to its own
location, so you can run it from anywhere.

## Run

```bash
python app.py
```

It listens on `0.0.0.0:5000` and accepts `POST /weight` with:

```json
{ "weight": 1234.56 }
```

## Point the cart at this server

Note the LAN IP the server prints, then set `serverName` in
[`firmware/cart_scale/cart_scale.ino`](../../firmware/cart_scale/cart_scale.ino)
to `http://<that-ip>:5000/weight` and reflash the ESP32.

The ESP32 and this machine must be on the same network. Wiring, pin map and
calibration: [`docs/hardware.md`](../../docs/hardware.md).

## Known limitation

Every reading is written to a single hardcoded cart document, `CART001`. The
firmware sends no cart identifier, so two carts on one instance would overwrite
each other.
