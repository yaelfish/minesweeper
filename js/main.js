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

var gSecPassedInterval;
var gSecondsPassed = 0;
var gFirstClick = 0;

var elEmoji = document.querySelector('.emoji');
var elTimer = document.querySelector('.timer');

var gGame = {
    isOn: false,
    openedCount: 0,
    flaggedCount: 0,
    secsPassed: gSecondsPassed
};

function initGame() {
    gGame.isOn = true;
    gFirstClick = 0;
    elEmoji.innerText = '🙂';
    elTimer.innerText = 0;
    gLevel = BEGINNER;
    gMinesLocations = [];
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


            strHTML += `\t<td data-id="cell-${i}-${j}" class="cell ${className}" 
                        oncontextmenu="toggleFlagged(event, ${i}, ${j})" 
                        onclick="cellClicked(this, ${i}, ${j})">${(cell.isOpened && !cell.isWithMine) ? cell.minesAroundCount : (cell.isOpened && cell.isWithMine) ? MINE : ''}
                        <span class="flag-${i}-${j}" hidden>${FLAG}</span></td>\n`
        }
        strHTML += '</tr>\n'
    }
    strHTML += '</table></tbody>';
    var elGameContainer = document.querySelector('.gameContainer');
    elGameContainer.innerHTML = strHTML;
}

function cellClicked(elCell, cellPosI, cellPosJ) { 
    if(gFirstClick === 0){
        resetTimer();
        gFirstClick++;
    }
    var cell = gBoard[cellPosI][cellPosJ];
    if (!cell.isOpened) {    
        cell.isOpened = true;
        gGame.openedCount++;
        elCell.classList.add('opened');
        
        if (cell.isWithMine) {
            revealAllMines();
            gameOver(0);
        } else {
            elCell.innerText = (cell.minesAroundCount !== 0) ? cell.minesAroundCount : '';
        }
    }
    return;
}

function gameOver(win) { 
    if (!win) elEmoji.innerText = '😵';
    else elEmoji.innerText = '😎';
    clearInterval(gSecPassedInterval);
    gSecondsPassed = 0;
    gSecPassedInterval = null;
}

function toggleFlagged(event, cellPosI, cellPosJ) {
    event.preventDefault();
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
    var minesAmount = gMinesLocations.length;
    var cellsAmount = gLevel.size * gLevel.size;
    var emptyAmount = gGame.openedCount;
  
    if ((cellsAmount - minesAmount) === emptyAmount){
        gameOver(1);
    }
}

function restart() {
    gGame.isOn = true;
    gFirstClick = 0;
    elEmoji.innerText = '🙂';
    elTimer.innerText = 0;
    gMinesLocations = [];
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