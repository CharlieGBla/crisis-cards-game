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
const sheetURL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQRK-SaMmIiSA3Oxfjp0d3lvhAZBZMIYuaNoWQ3A231H8DS7ysnKRX3RT5ibBa5Pmlw0v6I-_AV0tQi/pub?output=csv';

fetch(sheetURL)
  .then((response) => response.text())
  .then((data) => {
    cards = parseCSV(data);
    if (cards.length === 0) {
      alert('No valid cards found in the CSV file. Check the data.');
    } else {
      console.log(`Successfully loaded ${cards.length} cards.`); // Debugging info
    }
  })
  .catch((error) => {
    console.error('Error fetching or parsing the CSV file:', error);
    alert('Failed to load the card data. Please try again later.');
  });

function parseCSV(csv) {
  const rows = csv.split('\n').map((row) => row.split(','));
  const headers = rows.shift(); // First row is the header
  return rows
    .filter((row) => row.length >= 4) // Ensure the row has at least 4 columns (CardID, Description, Option1, Option2)
    .map((row) => {
      const card = {};
      headers.forEach((header, index) => {
        card[header.trim()] = row[index]?.trim();
      });
      return card;
    })
    .filter((card) => card.Description && card.Option1 && card.Option2); // Only include valid cards
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
  if (cards.length === 0) {
    alert('No cards available. Please check the data source.');
    return;
  }

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

  // Display card content
  document.getElementById('card-description').innerText = card.Description || 'No description available.';
  document.getElementById('option1').innerText = card.Option1 || 'Option not available.';
  document.getElementById('option2').innerText = card.Option2 || 'Option not available.';

  document.getElementById('modal').classList.remove('hidden');

  // Handle button clicks
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
  const matches = option.match(/([+-]\d+)\s(\w+)/);
  if (matches) {
    const [_, value, stat] = matches;
    if (sliders.hasOwnProperty(stat.toLowerCase())) {
      sliders[stat.toLowerCase()] += parseInt(value, 10);
      updateSliders();
    } else {
      console.error(`Invalid stat: ${stat}`);
    }
  } else {
    console.error(`Invalid effect format: ${option}`);
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

  // Re-fetch the cards to reset
  fetch(sheetURL)
    .then((response) => response.text())
    .then((data) => {
      cards = parseCSV(data);
      console.log(`Game reset. Loaded ${cards.length} cards.`);
    })
    .catch((error) => {
      console.error('Error fetching or parsing the CSV file during reset:', error);
    });
}
