// Elements
const drawCardButton = document.getElementById("draw-card");
const popup = document.getElementById("popup");
const cardDescription = document.getElementById("card-description");
const option1Button = document.getElementById("option1");
const option2Button = document.getElementById("option2");
const message = document.getElementById("message");

// Slider Elements
const sliders = {
    agrarian: document.getElementById("agrarian"),
    industry: document.getElementById("industry"),
    religion: document.getElementById("religion"),
    officials: document.getElementById("officials"),
    education: document.getElementById("education"),
    commerce: document.getElementById("commerce"),
    influence: document.getElementById("influence"),
    military: document.getElementById("military"),
};
const sliderValues = {
    agrarian: document.getElementById("agrarian-value"),
    industry: document.getElementById("industry-value"),
    religion: document.getElementById("religion-value"),
    officials: document.getElementById("officials-value"),
    education: document.getElementById("education-value"),
    commerce: document.getElementById("commerce-value"),
    influence: document.getElementById("influence-value"),
    military: document.getElementById("military-value"),
};

// Card Data
let cards = [];
let usedCards = [];

// Functions
function parseEffects(optionText) {
    const effectRegex = /\(([-+]\d+)\s(\w+)\)/;
    const match = effectRegex.exec(optionText);
    if (match) {
        const [, value, category] = match;
        return { [category.toLowerCase()]: parseInt(value, 10) };
    }
    return {};
}

function updateSliders(effects) {
    for (const [key, value] of Object.entries(effects)) {
        if (sliders[key]) {
            sliders[key].value = Math.max(0, Math.min(100, parseInt(sliders[key].value) + value));
            sliderValues[key].textContent = sliders[key].value;

            if (sliders[key].value === 0) {
                endGame(false);
            }
        }
    }
}

function drawCard() {
    if (cards.length === 0) {
        endGame(true);
        return;
    }

    const randomIndex = Math.floor(Math.random() * cards.length);
    const card = cards.splice(randomIndex, 1)[0];
    usedCards.push(card);

    cardDescription.textContent = card.description;

    option1Button.textContent = card.option1.text;
    option2Button.textContent = card.option2.text;

    option1Button.onclick = () => {
        updateSliders(card.option1.effects);
        popup.classList.add("hidden");
    };

    option2Button.onclick = () => {
        updateSliders(card.option2.effects);
        popup.classList.add("hidden");
    };

    popup.classList.remove("hidden");
}

function loadCards() {
    fetch("assets/cards.csv")
        .then((response) => response.text())
        .then((data) => {
            const rows = data.split("\n").slice(1); // Skip the header row
            cards = rows.map((row) => {
                const [id, description, option1, option2] = row.split(",");
                return {
                    description: description.trim(),
                    option1: {
                        text: option1.trim(),
                        effects: parseEffects(option1),
                    },
                    option2: {
                        text: option2.trim(),
                        effects: parseEffects(option2),
                    },
                };
            });
            alert("Cards loaded successfully!");
        })
        .catch((err) => {
            console.error("Error loading cards:", err);
        });
}

function endGame(won) {
    message.textContent = won ? "You win! All cards used!" : "You lose! A slider reached 0.";
    drawCardButton.disabled = true;
    popup.classList.add("hidden");
}

// Event Listeners
drawCardButton.addEventListener("click", drawCard);

// Load Cards on Page Load
window.onload = loadCards;
