# CAELIX Assist

Two Rasa assistants: one for shoppers, one for store administrators. The admin
bot reads live cart state from Firestore.

## Layout

| Path | Role |
|---|---|
| `admin_bot/` | Administrator assistant — cart status, alerts, inventory |
| `user_bot/` | Shopper assistant — cart help, wallet, checkout |
| `web_widget/` | Browser chat widget that talks to a running bot |

## Requirements

Rasa 3.6 needs **Python 3.8-3.10**. It will not install on 3.11 or newer.

```bash
pip install -r requirements.txt
```

The admin bot needs a Firebase service account key at
`admin_bot/serviceAccountKey.json`.

## Train

```bash
cd admin_bot && rasa train && cd ..
cd user_bot  && rasa train && cd ..
```

## Run

Each bot needs two processes — the bot itself and its action server.

```bash
# admin bot
cd admin_bot
rasa run --port 5005 --cors "*"
rasa run actions --port 5065     # separate terminal

# user bot
cd user_bot
rasa run --port 5006 --cors "*"
rasa run actions --port 5055     # separate terminal
```

Action server ports come from each bot's `endpoints.yml`.

## Web widget

`web_widget/script.js` has the bot URL hardcoded at the top:

```js
const rasaURL = "http://localhost:5006/webhooks/rest/webhook";
```

Point it at 5005 for the admin bot, 5006 for the user bot.
