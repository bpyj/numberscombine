let targetSum = 0;
let selectedCards = []; 
let selectedValues = []; 

// TARGET RANGE IS CORRECT: The target sum will be randomly chosen between 2 and 10.
const TARGET_RANGE = [2, 10]; 
const CARD_POOL_SIZE = 3;     
const MAX_ADDEND_SIZE = 7; 

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

// --- Game Logic ---

/**
 * Generates a new game state (Target Sum and Card Pool).
 */
function startGame() {
    // 1. Reset state
    selectedCards = [];
    selectedValues = [];
    document.getElementById('card-container').innerHTML = '';
    
    // 2. Determine Target Sum (Randomly between 2 and 10)
    targetSum = Math.floor(Math.random() * (TARGET_RANGE[1] - TARGET_RANGE[0] + 1)) + TARGET_RANGE[0];
    console.log("New Target Sum generated:", targetSum); // Debugging log
    
    document.getElementById('target-sum').innerHTML = getDotRepresentation(targetSum);

    // 3. Generate Correct Pair (Addends A and B)
    let A = 0;
    let B = 0;
    
    // Loop until we find a valid pair (A and B must be >= 1 and <= MAX_ADDEND_SIZE)
    while (A < 1 || A > MAX_ADDEND_SIZE || B < 1 || B > MAX_ADDEND_SIZE) {
        // A is chosen between 1 and Target - 1
        A = Math.floor(Math.random() * (targetSum - 1)) + 1; 
        B = targetSum - A;
    }
    
    // 4. Create Card Pool Array
    let cardPool = [A, B];
    
    // 5. Add only ONE distractor until the pool is exactly 3 cards
    let distractorFound = false;
    while (!distractorFound) {
        // Distractor can be any small number between 1 and MAX_ADDEND_SIZE (7)
        let distractor = Math.floor(Math.random() * MAX_ADDEND_SIZE) + 1; 
        
        // --- CRITICAL FIX: Simplified Distractor Logic ---
        // 1. Must not be A or B (unique value in the card pool)
        // 2. Must not equal the target sum
        if (
            !cardPool.includes(distractor) && 
            distractor !== targetSum 
        ) {
            // Check if D + A or D + B = Target. Only add if it does NOT create the target sum.
            if ((distractor + A !== targetSum) && (distractor + B !== targetSum)) {
                cardPool.push(distractor);
                distractorFound = true;
            } 
            // If the simple distractor check fails (e.g., target=5, A=2, B=3, distractor=4, 4+A=6, 4+B=7. OK)
            // But if target=8, A=3, B=5, distractor=3 is already in the pool. distractor=4, 4+5=9. OK. distractor=6, 6+2=8! FAIL.
            // Let's use the simplest condition that prevents infinite loop for small numbers:
            // Ensure the distractor is not A or B, and doesn't match the target sum.
            // The original logic was causing the hang, let's stick to the simplest unique check:
            
            // Reverting to the logic that worked for 5-10, but ensuring the distractor is small
             if (
                !cardPool.includes(distractor) && 
                distractor < targetSum && // Keep distractor small
                distractor + A !== targetSum && 
                distractor + B !== targetSum
            ) {
                cardPool.push(distractor);
                distractorFound = true;
            }
        }
    }
    // Note: The loop should no longer hang because targetSum is at least 2, A and B are at least 1, and MAX_ADDEND_SIZE is 7.
    // The previous constraints were mathematically correct but too restrictive for low random number generation, leading to too many retries.

    // 6. Shuffle the card pool
    cardPool.sort(() => Math.random() - 0.5);

    // 7. Render Cards
    renderCards(cardPool);
    
    // 8. STORY INTRODUCTION PROMPT
    document.getElementById('feedback').innerHTML = `Help **${STORY_CHARACTER}** pick up **${targetSum} ${ITEM_NAME}**! Which two piles equal the required length?`;
}

// --- (renderCards, handleCardClick, evaluateAnswer functions are unchanged) ---
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