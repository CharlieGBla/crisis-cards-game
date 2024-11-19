// Card data
const cards = [
  "A drought has led to water shortages. Ration or import?",
  "A foreign group has moved into the city. Ban or welcome?",
  "Economic collapse is imminent. Cut taxes or invest in public programs?",
  "Your advisors suggest exploiting a minority group. Do you agree?"
];

// Elements
const popup = document.getElementById("popup");
const popupText = document.getElementById("popup-text");

// Draw a random card
function drawCard() {
  const randomCard = cards[Math.floor(Math.random() * cards.length)];
  popupText.textContent = randomCard;
  popup.style.display = "flex";
}

// Close popup
function closePopup() {
  popup.style.display = "none";
}
