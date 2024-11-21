// Load the CSV file
Papa.parse("assets/cards.csv", {
    download: true,
    header: true,
    dynamicTyping: true,
    complete: function(results) {
        console.log(results);
        generateCards(results.data);
    }
});

function generateCards(cards) {
    const cardContainer = document.getElementById('card-container');
    cards.forEach(card => {
        const cardElement = document.createElement('div');
        cardElement.classList.add('card');
        
        const cardDescription = document.createElement('p');
        cardDescription.innerText = card.Description;

        const option1Button = document.createElement('button');
        option1Button.innerText = card.Option1;
        option1Button.onclick = () => handleOptionClick(card.Option1);

        const option2Button = document.createElement('button');
        option2Button.innerText = card.Option2;
        option2Button.onclick = () => handleOptionClick(card.Option2);

        cardElement.appendChild(cardDescription);
        cardElement.appendChild(option1Button);
        cardElement.appendChild(option2Button);

        cardContainer.appendChild(cardElement);
    });
}
function handleOptionClick(option) {
    // Parse the change (e.g., +5 Industry)
    const match = option.match(/\(\+(\d+) (\w+)\)/);
    if (match) {
        const value = parseInt(match[1]);
        const sliderId = match[2].toLowerCase();

        const slider = document.getElementById(sliderId);
        slider.value = Math.min(100, Math.max(0, parseInt(slider.value) + value));
    }
}

// Close popup
function closePopup() {
  popup.style.display = "none";
}
