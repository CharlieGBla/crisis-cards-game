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
let adviseBtn = null;

let drawnCards = []; // Tracks already drawn cards
let cardsDrawnCount = 0; // Counts the number of cards drawn
const WINNING_CARD_COUNT = 10; 

// New variables for advising mechanic
let advisedActive = false; // Whether hints are currently enabled
let isLying = false; // Whether current advice is lying
let lieChanceBase = 10; // Base 10% chance
// Each 4 points of discontent = +1% lying chance.

// Calculate discontent:
function calculateDiscontent() {
  let total = 0;
  for (const key in sliders) {
    total += Math.abs(sliders[key] - 50);
  }
  return total; // e.g., if all at 10, each is 40 away from 50 => 40*8=320
}

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
      id: CardID.trim(),
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
    document.getElementById('top-info').style.display = 'block';
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
  adviseBtn = document.getElementById("adviseBtn");

  card.addEventListener("click", handleCardClick);
  updateAllSliders();
  updateTopInfo();
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

  // Only show indicators if advisedActive is true
  option1Btn.onmouseover = () => {
    if (advisedActive) showIndicators(cardData.option1.effects);
  };
  option1Btn.onmouseout = hideIndicators;
  
  option2Btn.onmouseover = () => {
    if (advisedActive) showIndicators(cardData.option2.effects);
  };
  option2Btn.onmouseout = hideIndicators;

  // Advise Me button logic
  adviseBtn.onclick = () => advise();

  cardsDrawnCount++;
  updateTopInfo();
  checkWinCondition();
}

function handleOptionClick(effects) {
  updateSliders(effects);

  // End advising after choosing an option
  advisedActive = false;
  isLying = false;

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
  updateTopInfo();
}

function updateAllSliders() {
  for (const key in sliders) {
    const sliderElement = document.getElementById(key);
    sliderElement.value = sliders[key];
    const circle = document.getElementById(key + '-circle');
    circle.textContent = sliders[key];

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

function showIndicators(effects) {
  // Determine if we should show false info
  const displayedEffects = {};
  for (const [key, value] of Object.entries(effects)) {
    displayedEffects[key] = value;
  }

  // If lying, invert the signs of non-zero effects
  if (isLying) {
    for (const [key, value] of Object.entries(displayedEffects)) {
      // Flip sign if not zero
      if (value !== 0) displayedEffects[key] = -value;
    }
  }

  for (const [key, value] of Object.entries(displayedEffects)) {
    const indicator = document.getElementById(`${key}-indicator`);
    if (!indicator) continue;
    
    if (value === 0) {
      // No effect
      indicator.style.display = 'none';
      indicator.className = 'slider-indicator';
      continue;
    }

    // Determine direction and color based on displayed (possibly flipped) effects
    let directionClass = value > 0 ? 'right-arrow' : 'left-arrow';
    let severityColor;
    const absVal = Math.abs(value);
    if (absVal <= 15) {
      severityColor = 'yellow';
    } else if (absVal <= 30) {
      severityColor = 'orange';
    } else {
      severityColor = 'red';
    }

    indicator.className = `slider-indicator ${directionClass}`;
    // Positioning
    const circle = document.getElementById(`${key}-circle`);
    const circleRect = circle.getBoundingClientRect();
    const parentRect = circle.parentElement.getBoundingClientRect();
    let leftPos;
    if (value > 0) {
      // Right arrow
      leftPos = circleRect.right - parentRect.left + 10;
      indicator.style.borderWidth = '5px 0 5px 10px';
      indicator.style.borderColor = `transparent transparent transparent ${severityColor}`;
    } else {
      // Left arrow
      leftPos = circleRect.left - parentRect.left - 20;
      indicator.style.borderWidth = '5px 10px 5px 0';
      indicator.style.borderColor = `transparent ${severityColor} transparent transparent`;
    }

    indicator.style.left = leftPos + 'px';
    indicator.style.display = 'block';
    indicator.style.borderStyle = 'solid';
    indicator.style.width = '0';
    indicator.style.height = '0';
  }
}

function hideIndicators() {
  const indicators = document.querySelectorAll('.slider-indicator');
  indicators.forEach(indicator => {
    indicator.style.display = 'none';
  });
}

function checkGameOver() {
  for (const [key, value] of Object.entries(sliders)) {
    if (value <= 0) {
      showPopup("A Silent Revolt",
        `Your Grace, it seems the masses have confused 'majority opinion' with 'correct opinion.' Foolish as ever. 
        They didn’t like how you managed the kingdom's ${key}, their audacity! To think they know better than you?
        No need to struggle, Your Grace. I’ll make sure you’re remembered fondly.`);
      return;
    } else if (value >= 100) {
      showPopup("The Overbearing Faction",
        `Your Grace, look what you’ve done. The kingdom’s ${key} is stronger than ever, But therein lies the problem.
        Power has a habit of outgrowing its master, and the council has already made its decision. 
        I offered to handle it personally, as a gesture of loyalty. It’s the least I can do for you.`);
      return;
    }
  }
}

function checkWinCondition() {
  if (cardsDrawnCount >= WINNING_CARD_COUNT) {
    const score = calculateFinalScore();
    showPopup("A Fragile Peace", 
              `You see, Majesty? This is what happens when you trust yourself. 
              The kingdom is balanced, the people are loyal, and power rests comfortably in your hands.
              No one did this but you and they’ll always remember that! After all, the victory is yours.
              Your perfect score: ${score}`);
  }
}

function calculateFinalScore() {
  let score = 0;
  for (const key in sliders) {
    score += Math.abs(sliders[key] - 50);
  }
  const finalScore = 800 - score; 
  return finalScore;
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

// Update months and score display
function updateTopInfo() {
  document.getElementById('months').textContent = cardsDrawnCount;
  document.getElementById('score').textContent = calculateFinalScore();
}

// Advise mechanic
function advise() {
  if (advisedActive) {
    // Already advised, do nothing or show a message if you want
    return;
  }

  // Determine cost (1-10)
  const cost = Math.floor(Math.random() * 10) + 1;
  if (sliders.influence < cost) {
    // Not enough influence
    // Could show a message if desired
    return;
  }

  // Pay cost
  sliders.influence -= cost;
  updateAllSliders();

  advisedActive = true;
  // Calculate lying chance
  const discontent = calculateDiscontent(); 
  // Each 4 points = +1% lie chance
  const additionalChance = discontent / 4; 
  const totalLieChance = lieChanceBase + additionalChance; // base 10% + discontent factor
  // totalLieChance is in percent, e.g., if discontent=320, additionalChance=80%, total=90%
  
  // Random check
  const rand = Math.random() * 100; // 0 to 100
  isLying = rand < totalLieChance; 
}
