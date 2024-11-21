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
let usedCards = [];

// Fetch and parse CSV file
const sheetURL = 'https://docs.google.com/spreadsheets/d/e/your-sheet-id/pub?output=csv';

fetch(sheetURL)
  .then((response) => response.text())
  .then((data) => {
    cards = parseCSV(data);
  });

function parseCSV(csv) {
  const rows = csv.split('\n').map((row) => row.split(','));
  const headers = rows.shift(); // First row is the header
  return rows.map((row) => {
    const card = {};
    headers.forEach((header, index) => {
      card[header.trim()] = row[index]?.trim();
    });
    return card;
  });
}

// Update sliders on the UI
function updateSliders() {
  for (let key in sliders) {
    document.getElementById(key).innerText = sliders[key];
    if (sliders[key] <= 0) {
      alert('Game Over! One of your sliders reached 0.');
      resetGame();
    }
  }
}

// Draw a card
document.getElementById('draw-card').addEventListener('click', () => {
  if (cards.length === usedCards.length) {
    alert('You win! All cards have been used.');
    resetGame();
    return;
  }

  let card;
  do {
    card = cards[Math.floor(Math.random() * cards.length)];
  } while (usedCards.includes(card.CardID));

  usedCards.push(card.CardID);

  document.getElementById('card-description').innerText = card.Description;
  document.getElementById('option1').innerText = card.Option1;
  document.getElementById('option2').innerText = card.Option2;

  document.getElementById('modal').classList.remove('hidden');

  document.getElementById('option1').onclick = () => {
    applyEffect(card.Option1);
    closeModal();
  };

  document.getElementById('option2').onclick = () => {
    applyEffect(card.Option2);
    closeModal();
  };
});

function applyEffect(option) {
  const matches = option.match(/([+-]\d+) (\w+)/);
  if (matches) {
    const [_, value, stat] = matches;
    sliders[stat.toLowerCase()] += parseInt(value, 10);
    updateSliders();
  }
}

function closeModal() {
  document.getElementById('modal').classList.add('hidden');
}

function resetGame() {
  sliders = {
    agrarian: 50,
    industry: 50,
    religion: 50,
    officials: 50,
    education: 50,
    commerce: 50,
    influence: 50,
    military: 50,
  };
  usedCards = [];
  updateSliders();
}
