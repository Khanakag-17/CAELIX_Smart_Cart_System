const rasaURL = "http://localhost:5006/webhooks/rest/webhook"; // Change to 5005 for UserBot
const senderID = "admin_user"; // You can change this dynamically per session

function toggleChat() {
  const chat = document.getElementById("chatPopup");
  if (chat.style.display === "flex") {
  chat.style.display = "none";
} else {
  chat.style.display = "flex";
  chat.style.flexDirection = "column";  // Ensure messages stack vertically
}

}

function handleKey(e) {
  if (e.key === "Enter") sendMessage();
}

function sendMessage() {
  const input = document.getElementById("userInput");
  const msg = input.value.trim();
  if (msg === "") return;

  appendMessage("You", msg, "user");
  input.value = "";

  fetch(rasaURL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      sender: senderID,
      message: msg,
    }),
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.length === 0) {
        appendMessage("Bot", "Sorry, I didn't understand that.", "bot");
      } else {
        data.forEach((res) =>
          appendMessage("Bot", res.text || "[No text response]", "bot")
        );
      }
    })
    .catch((err) => {
      appendMessage("Bot", "Error connecting to chatbot.", "bot");
      console.error(err);
    });
}

function appendMessage(sender, text, type) {
  const chatBody = document.getElementById("chatBody");
  const msgDiv = document.createElement("div");
  msgDiv.className = type === "user" ? "user-msg" : "bot-msg";
  msgDiv.textContent = `${sender}: ${text}`;
  chatBody.appendChild(msgDiv);
  chatBody.scrollTop = chatBody.scrollHeight;
}
