
let sliders = {
  agrarian: 50,
  industry: 50,
  religion: 50,
  officials: 50,
  education: 50,
  commerce: 50,
  influence: 50,
  military: 50,
};

let cards = [];
let gameStarted = false;
let card = null;
let descriptionEl = null;
let option1Btn = null;
let option2Btn = null;

let drawnCards = []; // Tracks already drawn cards
let cardsDrawnCount = 0; // Counts the number of cards drawn
const WINNING_CARD_COUNT = 10; // Change this to the number of cards required to win


async function fetchCards() {
  const response = await fetch(
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vQRK-SaMmIiSA3Oxfjp0d3lvhAZBZMIYuaNoWQ3A231H8DS7ysnKRX3RT5ibBa5Pmlw0v6I-_AV0tQi/pub?output=csv"
  );
  const text = await response.text();
  const rows = text.split("\n").slice(1); // Skip header row
  return rows.map((row) => {
    const [
      CardID,
      Description,
      Option1,
      Option2,
      Agrarian_Effect1,
      Industry_Effect1,
      Religion_Effect1,
      Officials_Effect1,
      Education_Effect1,
      Commerce_Effect1,
      Influence_Effect1,
      Military_Effect1,
      Agrarian_Effect2,
      Industry_Effect2,
      Religion_Effect2,
      Officials_Effect2,
      Education_Effect2,
      Commerce_Effect2,
      Influence_Effect2,
      Military_Effect2,
    ] = row.split(",");

    return {
      id: CardID.trim(), // Use this ID to track drawn cards
      description: Description,
      option1: {
        text: Option1,
        effects: {
          agrarian: parseInt(Agrarian_Effect1),
          industry: parseInt(Industry_Effect1),
          religion: parseInt(Religion_Effect1),
          officials: parseInt(Officials_Effect1),
          education: parseInt(Education_Effect1),
          commerce: parseInt(Commerce_Effect1),
          influence: parseInt(Influence_Effect1),
          military: parseInt(Military_Effect1),
        },
      },
      option2: {
        text: Option2,
        effects: {
          agrarian: parseInt(Agrarian_Effect2),
          industry: parseInt(Industry_Effect2),
          religion: parseInt(Religion_Effect2),
          officials: parseInt(Officials_Effect2),
          education: parseInt(Education_Effect2),
          commerce: parseInt(Commerce_Effect2),
          influence: parseInt(Influence_Effect2),
          military: parseInt(Military_Effect2),
        },
      },
    };
  });
}

function beginGame() {
  if (!gameStarted) {
    document.getElementById('start-popup').style.display = 'none';
    startGame();
    gameStarted = true;
  }
}

async function startGame() {
  cards = await fetchCards();
  card = document.getElementById("card");
  descriptionEl = document.getElementById("description");
  option1Btn = document.getElementById("option1");
  option2Btn = document.getElementById("option2");

  card.addEventListener("click", handleCardClick);
  updateAllSliders();
}

function handleCardClick() {
  if (!card.classList.contains("flipped")) {
    drawCard();
    card.classList.add("flipped");
  }
}

function drawCard() {
  const availableCards = cards.filter(c => !drawnCards.includes(c.id));
  if (availableCards.length === 0) {
    // Reshuffle if all cards have been drawn
    drawnCards = [];
  }
  
  const cardData = availableCards[Math.floor(Math.random() * availableCards.length)];
  drawnCards.push(cardData.id);
  
  descriptionEl.textContent = cardData.description;
  option1Btn.textContent = cardData.option1.text;
  option2Btn.textContent = cardData.option2.text;

  option1Btn.onclick = () => handleOptionClick(cardData.option1.effects);
  option2Btn.onclick = () => handleOptionClick(cardData.option2.effects);
}

function handleOptionClick(effects) {
  updateSliders(effects);

  // Add a slight delay before flipping back for visual smoothness
  setTimeout(() => {
    card.classList.remove("flipped");
  }, 150);
}

function updateSliders(effects) {
  for (const [key, value] of Object.entries(effects)) {
    if (sliders[key] !== undefined) {
      sliders[key] += value;
      sliders[key] = Math.max(0, Math.min(100, sliders[key]));
    }
  }
  updateAllSliders();
  checkGameOver();
}

function updateAllSliders() {
  for (const key in sliders) {
    const sliderElement = document.getElementById(key);
    sliderElement.value = sliders[key];
    const circle = document.getElementById(key + '-circle');
    circle.textContent = sliders[key];

    // Reposition circle based on slider value
    positionValueCircle(sliderElement, circle);

    // Update slider color
    if (sliders[key] <= 20 || sliders[key] >= 80) {
      sliderElement.style.background = "red";
    } else if (sliders[key] <= 40 || sliders[key] >= 60) {
      sliderElement.style.background = "yellow";
    } else {
      sliderElement.style.background = "green";
    }
  }
}

function positionValueCircle(sliderElement, circleElement) {
  const val = parseInt(sliderElement.value);
  const min = parseInt(sliderElement.min);
  const max = parseInt(sliderElement.max);
  const percentage = (val - min) / (max - min);
  const sliderWidth = sliderElement.offsetWidth;
  const circleWidth = circleElement.offsetWidth;

  const leftPos = percentage * (sliderWidth - circleWidth) + (circleWidth / 2);
  circleElement.style.left = (leftPos - (circleWidth / 2)) + 'px';
}

function checkGameOver() {
  for (const [key, value] of Object.entries(sliders)) {
    if (value <= 0) {
      showPopup("Game Over", `The foolish people care too much about ${key} needs, they have ruined what would have been a perfect nation!`);
      return;
    } else if (value >= 100) {
      showPopup("Game Over", `In all your time, ${key} needs seemed to be your passion if only their new coup felt the same about you...`);
      return;
    }
  }
}

function checkWinCondition() {
  if (cardsDrawnCount >= WINNING_CARD_COUNT) {
    const score = calculateFinalScore();
    showPopup("You Win!", `Congratulations! Your final score is ${score}.`);
  }
}

function calculateFinalScore() {
  let score = 0;
  for (const key in sliders) {
    score += Math.abs(sliders[key] - 50);
  }
  return 400 - score; // 400 is the max score if all sliders are at 50
}

function showPopup(title, message) {
  const popup = document.createElement("div");
  popup.className = "popup";
  popup.innerHTML = `
    <div class="popup-content">
      <h2>${title}</h2>
      <p>${message}</p>
    </div>
  `;
  document.body.appendChild(popup);
}
