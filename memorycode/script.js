document.addEventListener("DOMContentLoaded", () => {
    const startButton = document.querySelector(".startButton");
    const box = document.querySelector(".box");
    const buttons = Array.from(box.querySelectorAll("button"));

    let score = 0;
    let flippedButtons = [];
    let lockBoard = false;
    let matchedCount = 0;

    const scoreDisplay = document.createElement("p");
    scoreDisplay.id = "scoreDisplay";
    scoreDisplay.style.fontWeight = "bold";
    scoreDisplay.style.fontSize = "18px";
    scoreDisplay.textContent = "Score: 0";
    box.parentNode.insertBefore(scoreDisplay, box);

    const gameOverMessage = document.createElement("p");
    gameOverMessage.id = "gameOverMessage";
    gameOverMessage.style.fontWeight = "bold";
    gameOverMessage.style.fontSize = "20px";
    gameOverMessage.style.color = "#2e7d32";
    gameOverMessage.style.display = "none";
    box.parentNode.insertBefore(gameOverMessage, box.nextSibling);

    

    function updateScoreDisplay() {
        scoreDisplay.textContent = `Score: ${score}`;
    }

    function makeExpression(result) {
        const useAddition = Math.random() < 0.5;

        if (useAddition) {
            const a = Math.floor(Math.random() * (result - 1)) + 1; 
            const b = result - a;
            return `${a} + ${b}`;
        }

        const b = Math.floor(Math.random() * 15) + 1; 
        const a = result + b;
        return `${a} - ${b}`;
    }


    function generateProblems(pairCount) {
        const problems = [];
        const usedResults = new Set();

        while (problems.length < pairCount * 2) {
            let result;
            do {
                result = Math.floor(Math.random() * 26) + 5; 
            } while (usedResults.has(result));
            usedResults.add(result);

            let expr1 = makeExpression(result);
            let expr2 = makeExpression(result);
            while (expr2 === expr1) {
                expr2 = makeExpression(result); 
            }

            const pairId = problems.length / 2;
            problems.push({ pairId, label: expr1, answer: result });
            problems.push({ pairId, label: expr2, answer: result });
        }
        return problems;
    }

    function shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    function resetButton(btn) {
        btn.textContent = "";
        btn.disabled = false;
        btn.style.backgroundColor = "";
        btn.classList.remove("revealed");
        delete btn.dataset.pairId;
        delete btn.dataset.label;
        delete btn.dataset.answer;
    }

    function setupGame() {
        score = 0;
        matchedCount = 0;
        flippedButtons = [];
        lockBoard = false;
        updateScoreDisplay();
        gameOverMessage.style.display = "none";
        box.style.opacity = "1";

        const cards = shuffle(generateProblems(buttons.length / 2));

        buttons.forEach((btn, index) => {
            resetButton(btn);
            const card = cards[index];
            btn.dataset.pairId = card.pairId;
            btn.dataset.label = card.label;
            btn.dataset.answer = card.answer;
        });
    }

    function flipBack() {
        flippedButtons.forEach((btn) => {
            btn.textContent = "";
            btn.style.backgroundColor = "";
            btn.classList.remove("revealed");
        });
        flippedButtons = [];
        lockBoard = false;
    }

    function handleMatch() {
        const [first, second] = flippedButtons;

        const userAnswer = window.prompt(
            `Koppel gevonden: "${first.dataset.label}" en "${second.dataset.label}".\nWat is de uitkomst?`
        );

        if (userAnswer !== null && parseInt(userAnswer, 10) === parseInt(first.dataset.answer, 10)) {
            score++;
            matchedCount++;
            updateScoreDisplay();

            [first, second].forEach((btn) => {
                btn.disabled = true;
                btn.style.backgroundColor = "#a3d9a5";
            });
            flippedButtons = [];
            lockBoard = false;

            if (matchedCount === buttons.length / 2) {
                setTimeout(() => {
                    alert(`Gefeliciteerd! Je hebt alle koppels gevonden met een score van ${score} punten.`);
                }, 200);
            }
        } else {
            alert("Helaas, dat is niet correct. Geen punt voor dit koppel, probeer het later opnieuw.");
            setTimeout(flipBack, 400);
        }
    }

    function handleCardClick(e) {
        const btn = e.target;

        if (lockBoard || flippedButtons.includes(btn) || btn.disabled || btn.textContent !== "") {
            return;
        }

        btn.textContent = btn.dataset.label;
        btn.style.backgroundColor = "#ffffff";
        btn.classList.add("revealed");
        flippedButtons.push(btn);

        if (flippedButtons.length === 2) {
            lockBoard = true;
            const [first, second] = flippedButtons;
            const isPair = first.dataset.pairId === second.dataset.pairId;

            if (isPair) {
                setTimeout(handleMatch, 300);
            } else {
                setTimeout(flipBack, 700);
            }
        }
    }

    buttons.forEach((btn) => btn.addEventListener("click", handleCardClick));

    startButton.addEventListener("click", setupGame);

    setupGame();
});

