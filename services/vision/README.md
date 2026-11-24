# Vision service

Per-cart YOLOv8 inference. Compares what the camera sees against the cart's
scanned item list and its measured weight, and writes a mismatch snapshot to
Firestore.

## Files

| File | Role |
|---|---|
| `manager.py` | Polls the `carts` collection; starts and stops one detection thread per active cart |
| `detection_worker.py` | Runs inference on one cart's camera stream and writes to `cart_logs/{cartId}` |
| `models/model_final.pt` | Fine-tuned YOLOv8s weights, four product classes |

## Setup

```bash
pip install -r requirements.txt
```

Place your Firebase service account key in this directory as
`serviceAccountKey.json`. Both scripts resolve it relative to their own
location, so you can run them from anywhere.

Each cart document in Firestore needs an `ip_stream_url` field pointing at a
camera serving MJPEG over HTTP — in the original build, a phone running an
IP-camera app at `http://<phone-ip>:8080/video`.

## Run

```bash
python manager.py
```

## Classes

`maggi-noodles`, `nevia-cream`, `taaza-tea-leaves`, `tide-detergent`.

Training notebook and dataset are linked from the root README. Measured
detector performance and its caveats are in [`docs/evaluation.md`](../../docs/evaluation.md).

## Known issues

`detection_worker.py` has unresolved runtime errors — see
[`docs/evaluation.md`](../../docs/evaluation.md). Verify before relying on it.
