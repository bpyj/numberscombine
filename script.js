let targetSum = 0;
let selectedCards = []; // Stores the actual card elements selected
let selectedValues = []; // Stores the number values selected (the hidden values)

const TARGET_RANGE = [5, 10]; // Target sums will be between 5 and 10
const CARD_POOL_SIZE = 6;     // Total number of cards displayed

document.addEventListener('DOMContentLoaded', startGame);

/**
 * Helper function to convert a number (1-10) into a visual dot representation.
 */
function getDotRepresentation(value) {
    // Using a non-breaking space and line breaks for visual separation
    let dotsHTML = '';
    for (let i = 0; i < value; i++) {
        dotsHTML += '•'; 
        if (i % 2 === 1 && i < value - 1) { // Simple attempt to break up dots visually
            dotsHTML += '<br>';
        } else {
             dotsHTML += '&nbsp;'; 
        }
    }
    return dotsHTML;
}

/**
 * Generates a new game state (Target Sum and Card Pool).
 */
function startGame() {
    // 1. Reset state
    selectedCards = [];
    selectedValues = [];
    document.getElementById('card-container').innerHTML = '';
    document.getElementById('feedback').innerHTML = 'Select two cards to combine!';

    // 2. Determine Target Sum
    targetSum = Math.floor(Math.random() * (TARGET_RANGE[1] - TARGET_RANGE[0] + 1)) + TARGET_RANGE[0];
    // Display target using only dots
    document.getElementById('target-sum').innerHTML = getDotRepresentation(targetSum);

    // 3. Generate Correct Pair (Addends A and B)
    let A = Math.floor(Math.random() * (targetSum - 2)) + 1; 
    let B = targetSum - A;
    
    // 4. Create Card Pool Array
    let cardPool = [A, B];
    
    // Add distractors until the pool is full
    while (cardPool.length < CARD_POOL_SIZE) {
        let distractor = Math.floor(Math.random() * 9) + 1; 
        if (!cardPool.includes(distractor) && distractor < targetSum && distractor > 0) {
            cardPool.push(distractor);
        }
    }

    // Shuffle the card pool
    cardPool.sort(() => Math.random() - 0.5);

    // 5. Render Cards
    renderCards(cardPool);
}

/**
 * Renders the clickable card elements in the container, showing only dots.
 */
function renderCards(pool) {
    const container = document.getElementById('card-container');
    pool.forEach(value => {
        const card = document.createElement('div');
        card.className = 'card';
        // CRITICAL: Inner HTML is the DOTS, not the number
        card.innerHTML = getDotRepresentation(value); 
        // We store the number value in a data attribute for JavaScript use
        card.setAttribute('data-value', value); 
        card.onclick = () => handleCardClick(card, value);
        container.appendChild(card);
    });
}

/**
 * Manages the click interaction logic.
 */
function handleCardClick(cardElement, value) {
    // Prevent interaction if a card is already selected and it's not the one being deselected
    if (selectedCards.length === 2 && !cardElement.classList.contains('selected')) {
         document.getElementById('feedback').innerHTML = 'Two numbers selected! Deselect one to change your choice.';
         return;
    }

    // Deselection Logic
    if (cardElement.classList.contains('selected')) {
        cardElement.classList.remove('selected');
        const index = selectedCards.indexOf(cardElement);
        if (index > -1) {
            selectedCards.splice(index, 1);
            selectedValues.splice(index, 1);
        }
        document.getElementById('feedback').innerHTML = 'Deselected. Choose two cards!';
        return;
    }

    // Selection Logic
    if (selectedCards.length < 2) {
        selectedCards.push(cardElement);
        selectedValues.push(value);
        cardElement.classList.add('selected');

        if (selectedCards.length === 2) {
            evaluateAnswer();
        } else {
             document.getElementById('feedback').innerHTML = 'One set selected. Choose the second set!';
        }
    }
}

/**
 * Checks the sum of the two selected cards against the target.
 */
function evaluateAnswer() {
    const sum = selectedValues[0] + selectedValues[1];
    
    if (sum === targetSum) {
        // SUCCESS PATH (The feedback here is simplified for the prototype)
        document.getElementById('feedback').innerHTML = `CORRECT! You combined the two sets to match the big set! Click 'Next Round' for a new challenge.`;
        // Lock the cards visually (Green highlight)
        selectedCards.forEach(card => card.style.backgroundColor = '#8bc34a'); 
        
    } else {
        // FAILURE PATH
        document.getElementById('feedback').innerHTML = `Oops! That combined set is too big (or too small). Try selecting a different pair!`;
        
        // Simple visual reset for failure
        selectedCards.forEach(card => card.classList.remove('selected'));
        selectedCards = [];
        selectedValues = [];
    }
}