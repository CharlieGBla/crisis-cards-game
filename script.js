document.addEventListener("DOMContentLoaded", () => {
    const drawCardButton = document.getElementById("draw-card");
    const popup = document.getElementById("popup");
    const cardDescription = document.getElementById("card-description");
    const option1Button = document.getElementById("option1");
    const option2Button = document.getElementById("option2");
    const message = document.getElementById("message");

    // Sliders
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

    let cards = [];
    let usedCards = new Set();

    // Load cards from CSV
    fetch("assets/cards.csv")
        .then(response => response.text())
        .then(data => {
            const rows = data.split("\n").slice(1); // Skip the header row
            cards = rows.map(row => {
                const [id, description, option1, option2] = row.split(",");
                return { id, description, option1, option2 };
            });
        })
        .catch(err => console.error("Error loading cards:", err));

    // Hide popup initially
    popup.classList.add("hidden");

    // Draw a card
    drawCardButton.addEventListener("click", () => {
        if (cards.length === 0 || usedCards.size === cards.length) {
            message.textContent = "Game Over! You ran out of cards!";
            drawCardButton.disabled = true;
            return;
        }

        // Get a random card that hasn't been used
        let randomIndex;
        do {
            randomIndex = Math.floor(Math.random() * cards.length);
        } while (usedCards.has(randomIndex));

        const card = cards[randomIndex];
        usedCards.add(randomIndex);

        // Update popup content
        cardDescription.textContent = card.description;
        option1Button.textContent = card.option1;
        option2Button.textContent = card.option2;

        // Show the popup
        popup.classList.remove("hidden");

        // Handle option 1
        option1Button.onclick = () => {
            applyEffect(card.option1);
            closePopup();
        };

        // Handle option 2
        option2Button.onclick = () => {
            applyEffect(card.option2);
            closePopup();
        };
    });

    // Function to apply an effect from an option
    function applyEffect(effect) {
        const match = effect.match(/([+-]\d+)\s(\w+)/);
        if (match) {
            const [_, value, stat] = match;
            const slider = sliders[stat.toLowerCase()];
            if (slider) {
                slider.value = Math.min(Math.max(parseInt(slider.value) + parseInt(value), 0), 100);
                document.getElementById(`${stat.toLowerCase()}-value`).textContent = slider.value;

                // Check for losing condition
                if (slider.value === 0) {
                    message.textContent = `Game Over! ${stat} has reached 0.`;
                    drawCardButton.disabled = true;
                }
            }
        }
    }

    // Close the popup
    function closePopup() {
        popup.classList.add("hidden");
    }
});
