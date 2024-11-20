// Elements
const drawCardButton = document.getElementById("draw-card");
const popup = document.getElementById("popup");
const cardDescription = document.getElementById("card-description");
const option1Button = document.getElementById("option1");
const option2Button = document.getElementById("option2");

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
        }
    }
}

function drawCard() {
    if (cards.length === 0) {
        alert("No cards loaded yet!");
        return;
    }

    const card = cards[Math.floor(Math.random() * cards.length)];
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

function loadExcel(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json(sheet);

        cards = rows.map(row => ({
            description: row.Description,
            option1: {
                text: row.Option1,
                effects: parseEffects(row.Option1),
            },
            option2: {
                text: row.Option2,
                effects: parseEffects(row.Option2),
            },
        }));
        alert("Cards loaded successfully!");
    };
    reader.readAsArrayBuffer(file);
}

// Event Listeners
drawCardButton.addEventListener("click", drawCard);

document.getElementById("file-input").addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (file) {
        loadExcel(file);
    }
});
