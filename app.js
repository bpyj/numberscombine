let targetSum = 0;
let selectedCards = []; 
let selectedValues = []; 

const TARGET_RANGE = [5, 10]; 
const CARD_POOL_SIZE = 3;     
const CAR_EMOTICON = '🚃'; 
const LOCOMOTIVE_EMOTICON = '🚂'; 
const STORY_CHARACTER = 'Timmy the Conductor'; 
const ITEM_NAME = 'carriages'; 

document.addEventListener('DOMContentLoaded', startGame);

/**
 * Helper function to convert a number (1-10) into a visual railway car emoticon representation
 * AND includes the numeral itself.
 */
function getDotRepresentation(value) {
    let carsHTML = '';
    
    // 1. Add the Numeral (large and centered)
    let numeralDisplay = `<div style="font-size: 1.5em; font-weight: bold; margin-bottom: 5px;">${value}</div>`;
    
    // 2. Add the Emoticons (horizontal)
    let emoticons = '';
    for (let i = 0; i < value; i++) {
        emoticons += CAR_EMOTICON + '&nbsp;'; 
    }
    
    // Combine both elements
    return numeralDisplay + `<div style="font-size: 1.2em;">${emoticons.trim()}</div>`;
}

/**
 * Generates a new game state (Target Sum and Card Pool).
 */
function startGame() {
    // 1. Reset state
    selectedCards = [];
    selectedValues = [];
    document.getElementById('card-container').innerHTML = '';
    
    // 2. Determine Target Sum
    targetSum = Math.floor(Math.random() * (TARGET_RANGE[1] - TARGET_RANGE[0] + 1)) + TARGET_RANGE[0];
    document.getElementById('target-sum').innerHTML = getDotRepresentation(targetSum);

    // 3. Generate Cards and Pool (Logic remains the same)
    let A = Math.floor(Math.random() * (targetSum - 2)) + 1; 
    let B = targetSum - A;
    let cardPool = [A, B];
    
    while (cardPool.length < CARD_POOL_SIZE) {
        let distractor = Math.floor(Math.random() * 9) + 1; 
        if (
            !cardPool.includes(distractor) && 
            distractor + A !== targetSum && 
            distractor + B !== targetSum && 
            distractor < targetSum &&
            distractor > 0
        ) {
            cardPool.push(distractor);
        }
    }

    // Shuffle the card pool
    cardPool.sort(() => Math.random() - 0.5);

    // 4. Render Cards
    renderCards(cardPool);
    
    // 5. STORY INTRODUCTION PROMPT
    document.getElementById('feedback').innerHTML = `Help **${STORY_CHARACTER}** pick up **${targetSum} ${ITEM_NAME}**! Which two piles equal the required length?`;
}

/**
 * Renders the clickable card elements in the container.
 */
function renderCards(pool) {
    const container = document.getElementById('card-container');
    pool.forEach(value => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = getDotRepresentation(value); 
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
         document.getElementById('feedback').innerHTML = `You've already picked two! Deselect one to change your choice.`;
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
        document.getElementById('feedback').innerHTML = `Deselected. Help ${STORY_CHARACTER} find his ${targetSum} ${ITEM_NAME}!`;
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
             document.getElementById('feedback').innerHTML = `You picked one group! Now find the second group needed to make ${targetSum}!`;
        }
    }
}

/**
 * Checks the sum of the two selected cards against the target.
 */
function evaluateAnswer() {
    const sum = selectedValues[0] + selectedValues[1];
    
    if (sum === targetSum) {
        // SUCCESS PATH 
        
        // 1. Construct the final train reward string (Locomotive + Carriages)
        let rewardTrainCarriages = '';
        for (let i = 0; i < targetSum; i++) {
            rewardTrainCarriages += CAR_EMOTICON + '&nbsp;'; 
        }
        
        // Use a span for the locomotive and ensure it is spaced correctly
        const locomotive = `<span style="margin-right: 5px;">${LOCOMOTIVE_EMOTICON}</span>`;
        const finalTrain = `${locomotive}${rewardTrainCarriages.trim()}`;

        // 2. Display the reward train above the feedback text
        // CRITICAL FIX: Applying font-size: 1.2em to the final train display to match the card carriage size.
        // The numeral is left at 1.5em for boldness.
        document.getElementById('target-sum').innerHTML = 
            `<div style="font-size: 1.5em; font-weight: bold; margin-bottom: 5px;">${targetSum} Carriages Ready!</div>
            <div style="font-size: 1.2em;">${finalTrain}</div>`; 
        
        // 3. Update Text Feedback
        document.getElementById('feedback').innerHTML = `🎉 **All Aboard!** You helped ${STORY_CHARACTER} hook up ${targetSum} ${ITEM_NAME}! (${selectedValues[0]} + ${selectedValues[1]} = ${targetSum}). Click 'Next Round' for a new route!`;
        
        // 4. Highlight cards
        selectedCards.forEach(card => card.style.backgroundColor = '#8bc34a'); 
        
    } else {
        // FAILURE PATH 
        document.getElementById('feedback').innerHTML = `Oops! That only makes ${sum} ${ITEM_NAME}. ${STORY_CHARACTER} still needs ${targetSum} ${ITEM_NAME}! Try a different pair.`;
        
        // Simple visual reset for failure
        selectedCards.forEach(card => card.classList.remove('selected'));
        selectedCards = [];
        selectedValues = [];
    }
}