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

function updateSliders(effects) {
  for (const [key, value] of Object.entries(effects)) {
    if (sliders[key] !== undefined) {
      sliders[key] += value;
      sliders[key] = Math.max(0, Math.min(100, sliders[key])); // Clamp between 0 and 100
      document.getElementById(key).textContent = sliders[key];
    }
  }
}

async function fetchCards() {
  const response = await fetch(
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vQRK-SaMmIiSA3Oxfjp0d3lvhAZBZMIYuaNoWQ3A231H8DS7ysnKRX3RT5ibBa5Pmlw0v6I-_AV0tQi/pub?output=csv"
  );
  const text = await response.text();
  const rows = text.split("\n").slice(1); // Remove header
  return rows.map(row => {
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

async function startGame() {
  const cards = await fetchCards();
  const card = document.getElementById("card");
  const descriptionEl = document.getElementById("description");
  const option1Btn = document.getElementById("option1");
  const option2Btn = document.getElementById("option2");

  card.addEventListener("click", () => {
    if (card.classList.contains("front")) {
      drawCard();
      card.classList.remove("front");
      card.classList.add("back");
    }
  });

  function drawCard() {
    const cardData = cards[Math.floor(Math.random() * cards.length)];
    descriptionEl.textContent = cardData.description;
    option1Btn.textContent = cardData.option1.text;
    option2Btn.textContent = cardData.option2.text;

    const handleOptionClick = effects => {
      updateSliders(effects);
      card.classList.remove("back");
      card.classList.add("front");
    };

    option1Btn.onclick = () => handleOptionClick(cardData.option1.effects);
    option2Btn.onclick = () => handleOptionClick(cardData.option2.effects);
  }
}

startGame();
