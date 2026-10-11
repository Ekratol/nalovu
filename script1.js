let questions = new Array();
let currentQIndex = 0;
let isAnswerRevealed = false;
let playerNames = {};
let gameState = {
    1: { player: 3, hunter: 0, active: true },
    2: { player: 3, hunter: 0, active: true },
    3: { player: 3, hunter: 0, active: true },
    4: { player: 3, hunter: 0, active: true }
};

function playSound(audioElement) {
    if (!audioElement) return;
    audioElement.currentTime = 0;
    audioElement.play().catch(e => console.log("Audio block"));
}

async function loadQuestionsFromFile() {
    try {
        const response = await fetch(`otazky.txt?t=${new Date().getTime()}`);
        const text = await response.text();
        questions = text.split('\n').map(line => {
            const p = line.split(';');
            return p.length >= 5 ? { q: p[0].trim(), a: p[1].trim(), b: p[2].trim(), c: p[3].trim(), correct: p[4].trim().toUpperCase() } : null;
        }).filter(q => q !== null);
        if (questions.length === 0) document.getElementById('question-text').innerText = "Chyba v otazky.txt.";
    } catch (error) {
        document.getElementById('question-text').innerText = "Chyba načítání otazky.txt.";
    }
}

function startGame() {
    playSound(document.getElementById('audio-znelka'));
    for(let i=1; i<=4; i++) playerNames[i] = document.getElementById(`p${i}-name`).value || `Žák ${i}`;
    document.getElementById('setup-container').style.display = 'none';
    document.getElementById('main-game-layout').style.display = 'flex';
    createBoard();
    loadQuestion();
}

function createBoard() {
    const board = document.getElementById('game-board');
    board.innerHTML = '';
    for (let p = 1; p <= 4; p++) {
        let html = `<div class="lane"><div class="lane-header" id="lane-header-${p}">${playerNames[p]}</div>`;
        for (let c = 0; c <= 7; c++) {
            let cls = "cell" + (c===0 ? " hunter-zone" : c===7 ? " bank-zone" : "");
            html += `<div class="${cls}" id="l-${p}-c-${c}">${c===0?"START L":c===7?"BANK":""}</div>`;
        }
        html += `<div class="manual-controls" style="justify-content: center; background: none; padding: 5px 0;"><button id="btn-correct-${p}" onclick="movePawn(${p}, 'player', 1)" style="background-color: #2ecc71; color: white; border: none; padding: 8px 12px; font-weight: bold; border-radius: 5px; cursor: pointer; width: 100%; font-size: 0.8rem;">✓ SPRÁVNĚ</button></div></div>`;
        board.innerHTML += html;
    }
    renderPawns();
}
