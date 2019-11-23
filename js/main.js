'use strict';

var EMPTY = ' ';
var MINE = '💣';
var FLAG = '🚩';


var BEGINNER = { size: 4, mines: 2 };
var MEDIUM = { size: 8, mines: 12 };
var EXPERT = { size: 12, mines: 30 };

var gLevel;
var gBoard = [];
var gMinesLocations = [];

var gSecPassedInterval,
    gSecondsPassed = 0,
    gClickCounter = 0,
    gIntervalHint;

var gBestTime = 0,
    gCurrentScore = 0,
    gSavedScore = localStorage.getItem('highscore') ? localStorage.getItem('highscore') : '0';

var elEmoji = document.querySelector('.emoji');
var elTimer = document.querySelector('.timer');

var gGame = {
    isOn: false,
    openedCount: 0,
    flaggedCount: 0,
    secsPassed: gSecondsPassed,
    hints: 3,
    lives: 3,
    safeClicks: 3
};

function initGame() {
    gGame.isOn = true;
    gGame.hints = 3;
    gGame.lives = 3;
    gGame.safeClicks = 3;
    gClickCounter = 0;
    elEmoji.innerText = '🙂';
    elTimer.innerText = 0;
    gLevel = BEGINNER;
    gMinesLocations = [];
    localStoragUser();
    presentScore();
    gBoard = buildBoard(gLevel);  
    renderBoard();
}

function resetTimer() {
    if (!gSecPassedInterval){
        gSecPassedInterval = setInterval(countSeconds, 1000);
    }
    else {
        gSecPassedInterval = null;
        gSecPassedInterval = setInterval(countSeconds, 1000);
    }
}

function countSeconds(){
    gSecondsPassed++;
    elTimer.innerText = gSecondsPassed;
}

function buildBoard(level) {
    var board = [];
    var size = level.size; 
    var mines = level.mines;

    for (var i = 0; i < size; i++) {
        board[i] = [];
        for (var j = 0; j < size; j++) {

            var cell = {
                minesAroundCount: 0,
                isOpened: false,
                isWithMine: false,
                isFlagged: false,
                isHintUsed: false,
                value: EMPTY
            };
            board[i][j] = cell;
        }
    }

    plantMines(gLevel, board);
    mapAllMines(board);

    return board;
}

function renderBoard() {
    var strHTML = '<table><tbody>';
    for (var i = 0; i < gBoard.length; i++) {
        strHTML += '<tr>\n'
        for (var j = 0; j < gBoard[i].length; j++) {
            var cell = gBoard[i][j];
            
            var className = (cell.isOpened) ? 'opened ' : '';
            className += (cell.isWithMine) ? 'mine ' : '';
            className += (cell.minesAroundCount === 1) ? 'one ' : '';
            className += (cell.minesAroundCount === 2) ? 'two ' : '';
            className += (cell.minesAroundCount === 3) ? 'three ' : '';
            className += (cell.minesAroundCount === 4) ? 'four ' : '';
            className += (cell.minesAroundCount === 5) ? 'five ' : '';
            
            strHTML += `\t<td id="cell-${i}-${j}" class="cell ${className}" 
                        oncontextmenu="toggleFlagged(event, ${i}, ${j})" 
                        onclick="cellClicked(this, ${i}, ${j})">
                        ${(cell.isOpened && cell.isWithMine) ? MINE : (cell.isOpened && cell.minesAroundCount !== 0) ? cell.minesAroundCount : EMPTY}
                        <span class="flag-${i}-${j}" hidden>${FLAG}</span>
                        </td>\n`
        }
        strHTML += '</tr>\n'
    }
    strHTML += '</table></tbody>';
    var elGameContainer = document.querySelector('.gameContainer');
    elGameContainer.innerHTML = strHTML;
}

function renderCell(i, j, value) {
    var elCell = document.querySelector(`#cell-${i}-${j}`);
    elCell.innerHTML = value;
}

function cellClicked(elCell, cellPosI, cellPosJ) { 
    if(gGame.isOn){
        if (gClickCounter === 0) {
            resetTimer();
            gClickCounter++;
        }
        var cell = gBoard[cellPosI][cellPosJ];
        if (!cell.isOpened && !cell.isFlagged) {
            if (cell.minesAroundCount === 0){
                cell.isOpened = true;
                gGame.openedCount++;
                elCell.classList.add('opened');
                openNeighbors(gBoard, cellPosI, cellPosJ);            
            } 

            if (cell.isWithMine) {
                gGame.lives--;
                if (gGame.lives === 0) {
                    cell.isOpened = true;
                    gGame.openedCount++;
                    elCell.classList.add('opened');

                    revealAllMines();
                    gameOver(0);
                }
                
                cell.isOpened = false;
                if (elCell.classList.contains('opened')){
                    elCell.classList.remove('opened');
                }
                alert(`You hit a mine! You have ${gGame.lives} lives left`);
                elCell.innerText = EMPTY;
            } 
            else if(cell.minesAroundCount !== 0) {
                cell.isOpened = true;
                gGame.openedCount++;
                elCell.classList.add('opened');
                elCell.innerText = cell.minesAroundCount ;
            } else EMPTY;
        }
        else if (cell.isOpened && cell.minesAroundCount === 0 && !cell.isWithMine) {
            openNeighbors(gBoard, cellPosI, cellPosJ);
        }
    }
    checkIfGameOver();
    return;
}

function gameOver(isWon) { 
    localStoragUser();
    isHighScore(gSecondsPassed);

    gGame.isOn = false;
    if (!isWon) elEmoji.innerText = '😵';
    else elEmoji.innerText = '😎';
    clearInterval(gSecPassedInterval);
    gSecondsPassed = 0;
    gSecPassedInterval = null;
    gGame.openedCount = 0;
}

function toggleFlagged(event, cellPosI, cellPosJ) {
    if (gGame.isOn){
        event.preventDefault();
        if (gClickCounter === 0) {
            resetTimer();
            gClickCounter++;
        }
        var elFlagSpan = document.querySelector(`.flag-${cellPosI}-${cellPosJ}`);
        var cell = gBoard[cellPosI][cellPosJ];
        if (!cell.isOpened) {
            if (cell.isFlagged) {
                cell.isFlagged = false;
                if (gGame.flaggedCount > 0) gGame.flaggedCount--;
                elFlagSpan.hidden = true;
            } else {
                cell.isFlagged = true;
                gGame.flaggedCount++;
                elFlagSpan.hidden = false;
                checkIfGameOver();
            }
        }
        else if (cell.isOpened) return;
    }
    return;
}

function plantMines(gLevel, board) {
    var minesCounter = 0;
    while (minesCounter < gLevel.mines) {
        findEmptyCellAndPutMine(gLevel, board);
        minesCounter++;
    }
    renderBoard();
    return minesCounter;
}

function findEmptyCellAndPutMine(gLevel, board) {
    var i = getRandomNum(gLevel.size);
    var j = getRandomNum(gLevel.size);
    var randomCell = board[i][j];
    
    if (randomCell.isWithMine === false) {
        randomCell.isWithMine = true;
        randomCell.value = MINE;
        gMinesLocations.push({ i, j});
    }
}

function revealAllMines() {
    for (var i = 0; i < gMinesLocations.length; i++) {
        var mineLocation = gMinesLocations[i];
        gBoard[mineLocation.i][mineLocation.j].value = MINE;
        gBoard[mineLocation.i][mineLocation.j].isOpened = true;
    }
    renderBoard();
}

function checkIfGameOver() {
    var cellsAmount = gLevel.size * gLevel.size;
    if ((gGame.flaggedCount + gGame.openedCount) === cellsAmount) return gameOver(1);
    return;
}

function restart() {
    gGame.isOn = true;
    gGame.hints = 3;
    gGame.lives = 3;
    gGame.safeClicks = 3;
    gClickCounter = 0;
    elEmoji.innerText = '🙂';
    elTimer.innerText = 0;
    gMinesLocations = [];
    retrieveElHintsBtns();
    localStoragUser();
    presentScore();
    gBoard = buildBoard(gLevel);
    renderBoard();
}

function beginner() {
    gLevel = BEGINNER;
    restart()
}

function medium() {
    gLevel = MEDIUM;
    restart()
}

function expert() {
    gLevel = EXPERT;
    restart()
}

function clickedHint(elHint){
    if(gGame.isOn){
        displayHintOnBoard(gBoard);
        gGame.hints--
        elHint.hidden = true;
    }
}

function retrieveElHintsBtns(){
    document.querySelector('.hintBtn1').hidden = false;
    document.querySelector('.hintBtn2').hidden = false;
    document.querySelector('.hintBtn3').hidden = false;
}

function clickedSafeBtn(elSafeBtn) {
    if (gGame.isOn) {
        if(gGame.safeClicks > 0){
            displaySafeClkOnBoard(gBoard);
            gGame.safeClicks--

        }
        else {
            elSafeBtn.hidden = true;
        }
    }
}



function localStoragUser() {
    if (!localStorage.getItem('highscore')) {
        setHighscore();
    } else {
        var highscore = localStorage.getItem('highscore');
        document.getElementById("highscore").innerHTML = highscore;
    }
}

function setHighscore() {
    localStorage.setItem('highscore', gSecondsPassed);
    document.getElementById("highscore").innerHTML = gSecondsPassed;
}

function isHighScore(currentScore) {
    if (!localStorage.getItem('highscore')) {
        debugger
        localStorage.setItem('highscore', currentScore);
        presentScore()

    } else {
        gSavedScore = JSON.parse(localStorage.getItem('highscore'));
        var currentScore = currentScore;

        if (currentScore > gSavedScore) {
            localStorage.setItem('highscore', gCurrentScore);
            presentScore()
        }
    }
}

function presentScore() {
    if (localStorage.getItem('highscore')) {
        document.getElementById("highscore").innerText = localStorage.getItem('highscore');
    } else {
        document.getElementById("highscore").innerText = "00";
    }
}