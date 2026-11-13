from rasa_sdk import Action, Tracker
from rasa_sdk.executor import CollectingDispatcher
from rasa_sdk.events import SlotSet

class ActionSetWalletBalance(Action):
    def name(self):
        return "action_set_wallet_balance"

    def run(self, dispatcher, tracker, domain):
        message = tracker.latest_message.get('text')
        if ":" in message:
            try:
                _, amount = message.split(":")
                return [SlotSet("wallet_amount", amount)]
            except:
                pass
        return [SlotSet("wallet_amount", "1200")]
