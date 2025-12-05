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
 * Convert number into numeral + wrapped emoji lines
 */
function getDotRepresentation(value) {

    // 1️⃣ Numeral
    let numeralDisplay = `
        <div style="font-size: 1.4em; font-weight: bold; margin-bottom: 5px;">
            ${value}
        </div>
    `;

    // 2️⃣ Car emojis WITH normal spaces (WRAPS allowed)
    let emoticons = "";
    for (let i = 0; i < value; i++) {
        emoticons += CAR_EMOTICON + " ";
    }

    // 3️⃣ Wrap in a .emoji-line div (CSS handles wrapping)
    return numeralDisplay + `
        <div class="emoji-line">${emoticons.trim()}</div>
    `;
}

/**
 * Generates a new game state (Target Sum + 3 cards)
 */
function startGame() {
    selectedCards = [];
    selectedValues = [];
    document.getElementById('card-container').innerHTML = '';
    
    // Target
    targetSum = Math.floor(Math.random() * (TARGET_RANGE[1] - TARGET_RANGE[0] + 1)) + TARGET_RANGE[0];
    document.getElementById('target-sum').innerHTML = getDotRepresentation(targetSum);

    // Addends A + B
    let A = 0, B = 0;

    while (A < 1 || A > MAX_ADDEND_SIZE || B < 1 || B > MAX_ADDEND_SIZE) {
        A = Math.floor(Math.random() * (targetSum - 1)) + 1;
        B = targetSum - A;
    }

    // Build pool with one distractor
    let cardPool = [A, B];

    let distractorFound = false;
    while (!distractorFound) {
        let distractor = Math.floor(Math.random() * MAX_ADDEND_SIZE) + 1;

        if (
            !cardPool.includes(distractor) &&
            distractor !== targetSum &&
            distractor + A !== targetSum &&
            distractor + B !== targetSum
        ) {
            cardPool.push(distractor);
            distractorFound = true;
        }
    }

    // Shuffle & render
    cardPool.sort(() => Math.random() - 0.5);
    renderCards(cardPool);

    // Story
    document.getElementById('feedback').innerHTML =
        `Help <b>${STORY_CHARACTER}</b> pick up <b>${targetSum} ${ITEM_NAME}</b>! Which two groups match the total?`;
}

/**
 * Render each card
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
 * Handles selecting / deselecting cards
 */
function handleCardClick(cardElement, value) {

    if (selectedCards.length === 2 && !cardElement.classList.contains('selected')) {
        document.getElementById('feedback').innerHTML =
            `You've already picked two! Deselect one to change your choice.`;
        return;
    }

    // Deselect
    if (cardElement.classList.contains('selected')) {
        cardElement.classList.remove('selected');

        const index = selectedCards.indexOf(cardElement);
        if (index > -1) {
            selectedCards.splice(index, 1);
            selectedValues.splice(index, 1);
        }

        document.getElementById('feedback').innerHTML =
            `Deselected. Help ${STORY_CHARACTER} find the correct groups to make ${targetSum}.`;

        return;
    }

    // Select
    if (selectedCards.length < 2) {
        cardElement.classList.add('selected');
        selectedCards.push(cardElement);
        selectedValues.push(value);

        if (selectedCards.length === 2) {
            evaluateAnswer();
        } else {
            document.getElementById('feedback').innerHTML =
                `Great! Pick one more group to make ${targetSum}.`;
        }
    }
}

/**
 * Validate answer
 */
function evaluateAnswer() {
    const sum = selectedValues[0] + selectedValues[1];
    
    if (sum === targetSum) {

        // Build reward train
        let rewardTrainCarriages = "";
        for (let i = 0; i < targetSum; i++) {
            rewardTrainCarriages += CAR_EMOTICON + " ";
        }

        const locomotive = `<span style="margin-right:5px;">${LOCOMOTIVE_EMOTICON}</span>`;

        // Auto-shrink long trains
        let trainFontSizeEm =
            targetSum <= 5 ? 1.3 :
            targetSum <= 8 ? 1.1 :
                             0.9;

        const finalTrain = `
            <div class="train-track">
                <div class="train-drive" style="font-size:${trainFontSizeEm}em; white-space:nowrap;">
                    ${locomotive}${rewardTrainCarriages.trim()}
                </div>
            </div>
        `;

        document.getElementById('target-sum').innerHTML = `
            <div style="font-size: 1.5em; font-weight:bold; margin-bottom:5px;">
                ${targetSum} Carriages Ready!
            </div>
            ${finalTrain}
        `;

        document.getElementById('feedback').innerHTML =
            `🎉 <b>All Aboard!</b> You helped ${STORY_CHARACTER} connect ${targetSum} ${ITEM_NAME}! 
            (${selectedValues[0]} + ${selectedValues[1]} = ${targetSum}).`;

        selectedCards.forEach(card => card.style.backgroundColor = '#8bc34a');
        
    } else {
        document.getElementById('feedback').innerHTML =
            `Oops! That makes <b>${sum}</b>. Timmy still needs <b>${targetSum}</b>! Try again.`;

        selectedCards.forEach(card => card.classList.remove('selected'));
        selectedCards = [];
        selectedValues = [];
    }
}
