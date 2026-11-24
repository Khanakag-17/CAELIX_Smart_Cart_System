# CAELIX — Hardware Reference

Weight-sensing subsystem: ESP32 with two load cells and two HX711 amplifiers, mounted in the cart chassis.

*Authored by Aashman Singh Verma, who built and integrated this subsystem. Every value below is read directly from the committed firmware at `firmware/cart_scale/cart_scale.ino` — nothing here is estimated or reconstructed.*

---

## Why two load cells

A single load cell under a cart floor measures accurately only when the load sits over it. Groceries do not: they land wherever the shopper drops them, and a single-point measurement reads differently for the same item depending on where it lands. Two cells spanning the cart floor, summed, flatten most of that positional sensitivity — the total stays stable even as the distribution shifts.

The cost is that each cell needs its own amplifier and its own calibration factor, since no two cells and no two mounting points share a gain. That is why the firmware carries two independent scale constants rather than one.

---

## Physical build

The prototype is a **hand-carried plastic shopping basket**, not a supermarket trolley — a deliberate choice to get the sensing right at a size one person could assemble, carry, and demonstrate.

Two bar-type load cells are mounted at opposite edges of the basket floor, beneath a rigid platform that spans them and takes the load. Between them sits a single perfboard carrying the ESP32 and both HX711 amplifiers, hand-soldered, with a USB power bank alongside. The camera is an Android phone on a tripod arm clamped to the basket rim, running an IP-camera app and serving MJPEG on port 8080 — the address stored per cart as `ip_stream_url` in Firestore.

Nothing about the electronics changes at trolley scale; the platform, the cell spacing, and the camera's field of view all would.

## Bill of materials

| Component | Qty | Role |
|---|---|---|
| ESP32 development board | 1 | Sampling, calibration, Wi-Fi transmission |
| Bar-type load cell | 2 | Force sensing across the basket floor |
| HX711 24-bit ADC / amplifier | 2 | Bridge amplification and digitisation |
| USB power bank | 1 | Untethered power |
| Perfboard | 1 | Carries the ESP32 and both amplifiers |
| Android phone + tripod clamp | 1 | MJPEG camera stream over the basket |

> There is **no GPS module** in this build. The admin dashboard's cart-tracker map runs on hardcoded coordinates; see `evaluation.md`.

---

## Pin map

Each HX711 uses two GPIO lines — a data line (`DOUT`) and a clock line (`SCK`). The firmware initialises them as `scale.begin(DOUT, SCK)`:

| Amplifier | `DOUT` → ESP32 | `SCK` → ESP32 | Firmware call |
|---|---|---|---|
| HX711 #1 | GPIO 21 | GPIO 22 | `scale1.begin(21, 22)` |
| HX711 #2 | GPIO 19 | GPIO 23 | `scale2.begin(19, 23)` |

Both amplifiers take `VCC` from the ESP32 3V3 rail and share its `GND`.

### Load cell → HX711

Standard four-wire strain-gauge bridge, wired identically on both channels:

| Load-cell lead | HX711 terminal | Function |
|---|---|---|
| Red | `E+` | Bridge excitation + |
| Black | `E−` | Bridge excitation − |
| Green | `A+` | Differential signal + |
| White | `A−` | Differential signal − |

> Green and white carry the differential measurement and terminate at the **amplifier**, not at the ESP32 — only the HX711's `DT`/`SCK` lines run onward to the microcontroller. Swapping green and white inverts the sign of that channel's reading.

```
  Load cell 1 ──(R/B/G/W)──> HX711 #1 ──DOUT──> GPIO 21
                                      └─SCK───> GPIO 22
                                                            ESP32 ──Wi-Fi──> Flask :5000
  Load cell 2 ──(R/B/G/W)──> HX711 #2 ──DOUT──> GPIO 19
                                      └─SCK───> GPIO 23
```

---

## Calibration

Each channel carries an independently determined scale factor, applied at startup:

| Constant | Value | Channel |
|---|---|---|
| `SCALE1` | `100.585037` | HX711 #1 |
| `SCALE2` | `118.054420` | HX711 #2 |

These are the factors from the last calibration performed on the assembled cart. The ~17% spread between them reflects the real difference in cell gain and mounting geometry — it is exactly why the two channels cannot share a constant.

**Deriving your own factors.** The HX711 library's scale factor converts raw ADC counts to grams. For each channel independently: tare with the cart empty, place a reference mass of known weight, then divide the raw reading by the known mass. The result is that channel's factor. Recalibrate after any change to mounting, cell position, or chassis rigidity — and periodically regardless, since load cells drift.

**Taring.** The firmware calls `tare()` on both channels during `setup()`, averaging ten readings each, so the cart's own empty weight is zeroed out at every power-on. This means the cart **must be empty when it boots** — powering up with items already inside silently zeroes their weight out of every subsequent reading.

---

## Runtime behaviour

Per loop iteration, once Wi-Fi is connected:

1. Read each channel with `get_units(10)` — the average of ten samples, which suppresses the high-frequency noise a raw HX711 reading carries.
2. Sum both channels into a single total in grams.
3. Print the total to serial at 115200 baud, for bench debugging.
4. POST it as JSON to the Flask middleware:
   ```json
   { "weight": 1234.56 }
   ```
5. Sleep 1000 ms.

Effective sample rate is therefore **1 Hz**, with each transmitted value already the mean of ten underlying reads per channel.

---

## Network configuration

Three values are hardcoded in the firmware and must be changed for any new deployment:

| Constant | Committed value | Meaning |
|---|---|---|
| `ssid` | `SmartCart` | Demo access point SSID |
| `password` | `smartcart123` | Demo access point passphrase |
| `serverName` | `http://192.168.177.90:5000/weight` | Flask middleware endpoint |

> These are the credentials of a temporary demonstration hotspot that no longer exists. They are not a live secret. They are also a genuine design weakness: credentials compiled into firmware cannot be rotated without reflashing every cart, and the payload itself is unauthenticated plain HTTP. A production build would provision credentials at runtime and authenticate the cart to the middleware.

The ESP32 and the Flask host must share a network. Once flashed, the cart needs no host connection at all — a USB power bank is sufficient, and the board reconnects and resumes transmitting on power-up.

---

## Known limitations of this subsystem

- **Single-cart routing.** `services/weight_bridge/app.py` writes every incoming reading to the hardcoded document `carts/CART001`. The firmware sends no cart identifier, so two carts on one middleware instance would overwrite each other.
- **No fault signalling.** A disconnected or failed HX711 returns readings that the firmware forwards without any sanity check; there is no bad-sensor state distinguishable from a genuine zero.
- **Boot-time tare only.** Drift accumulating during a long session is never re-zeroed.
- **No transport security or retry.** A failed POST is logged to serial and the reading is discarded — there is no buffering, so readings taken during a network outage are lost.
- **Not evaluated against reference masses.** No accuracy, linearity, or repeatability figures were recorded for the assembled rig, and the hardware is no longer available to obtain them.
