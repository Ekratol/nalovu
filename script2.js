function renderPawns() {
    document.querySelectorAll('.pawn').forEach(el => el.remove());
    for (let p = 1; p <= 4; p++) {
        let s = gameState[p];
        if (s.active && s.hunter < 7) document.getElementById(`l-${p}-c-${s.hunter}`).innerHTML += `<div class="pawn hunter">L</div>`;
        if (s.active && s.player < 7) document.getElementById(`l-${p}-c-${s.player}`).innerHTML += `<div class="pawn player">${p}</div>`;
        let h = document.getElementById(`lane-header-${p}`);
        let b = document.getElementById(`btn-correct-${p}`);
        if (h) {
            if (!s.active) { h.style.color = '#e74c3c'; h.innerText = `Chycen`; if(b) b.style.display='none'; }
            else if (s.player === 7) { h.style.color = '#2ecc71'; h.innerText = `Utekl`; if(b) b.style.display='none'; }
            else { h.style.color = 'var(--gold)'; h.innerText = playerNames[p]; }
        }
    }
    checkGameEnd();
}

function movePawn(playerNum, role, dir) {
    let s = gameState[playerNum];
    if (!s.active || s.player === 7) return;
    if (role === 'player') {
        s.player = Math.max(1, Math.min(7, s.player + dir));
        if (s.player === 7) playSound(document.getElementById('audio-spravne'));
    } else {
        s.hunter = Math.max(0, Math.min(7, s.hunter + dir));
    }
    if (s.hunter >= s.player && s.player < 7) { s.active = false; playSound(document.getElementById('audio-chyba')); }
    renderPawns();
}

function checkGameEnd() {
    let active = false;
    for (let p = 1; p <= 4; p++) if (gameState[p].active && gameState[p].player < 7) active = true;
    if (!active) {
        let sv = new Array();
        let cg = new Array();
        for (let p = 1; p <= 4; p++) (gameState[p].player === 7 ? sv : cg).push(playerNames[p]);
        document.querySelector('.quiz-container').innerHTML = `<div style="text-align: center; padding: 20px;"><h2 style="color: var(--gold);">Konec Hry!</h2><p style="font-size: 1.1rem; margin-top: 20px;">💰 <strong>Zachránění:</strong><br> ${sv.length ? sv.join(', ') : 'Nikdo'}</p><p style="font-size: 1.1rem; margin-top: 20px; color: #e74c3c;">🏹 <strong>Chyceni Lovcem:</strong><br> ${cg.length ? cg.join(', ') : 'Nikdo'}</p><button onclick="window.location.reload()" style="margin-top: 30px; background-color: var(--accent); color: white; border: none; padding: 12px 25px; font-weight: bold; border-radius: 6px; cursor: pointer;">Hrát znovu</button></div>`;
        playSound(document.getElementById('audio-znelka'));
    }
}

function loadQuestion() {
    if (questions.length === 0) { document.getElementById('question-text').innerText = "Všechny otázky byly vyčerpány!"; return; }
    isAnswerRevealed = false;
    document.querySelectorAll('.option-btn').forEach(b => b.classList.remove('correct-ans'));
    let q = questions[currentQIndex];
    document.getElementById('question-counter').innerText = `Zbývá otázek: ${questions.length}`;
    document.getElementById('hunter-status').style.color = '#ffd700';
    document.getElementById('hunter-status').innerText = "Čekám na odpověď žáků...";
    document.getElementById('question-text').innerText = q.q;
    document.getElementById('opt-A').innerText = `A) ${q.a}`;
    document.getElementById('opt-B').innerText = `B) ${q.b}`;
    document.getElementById('opt-C').innerText = `C) ${q.c}`;
}

function revealAnswer(chosenOption) {
    if (isAnswerRevealed || questions.length === 0) return;
    isAnswerRevealed = true;
    let q = questions[currentQIndex];
    document.getElementById(`opt-${q.correct}`).classList.add('correct-ans');
    const hs = document.getElementById('hunter-status');
    const soundSpravne = document.getElementById('audio-spravne');
    const soundChyba = document.getElementById('audio-chyba');

    if (chosenOption === q.correct) {
        playSound(soundSpravne);
        hs.style.color = '#2ecc71';
        hs.innerText = "Žáci: SPRÁVNĚ (Lovec jde také)";
    } else {
        playSound(soundChyba);
        hs.style.color = '#e74c3c';
        hs.innerText = "Žáci: CHYBNĚ (Lovec jde stále)";
    }
    setTimeout(() => { for (let p = 1; p <= 4; p++) movePawn(p, 'hunter', 1); }, 1200);
    questions.splice(currentQIndex, 1);
    if (currentQIndex >= questions.length && questions.length > 0) currentQIndex = questions.length - 1;
}

function nextQuestion() { loadQuestion(); }
function prevQuestion() { if (questions.length > 0) { currentQIndex = (currentQIndex + 1) % questions.length; loadQuestion(); } }

window.onload = function() { loadQuestionsFromFile(); };
