'use strict';

var EMPTY = ' ';
var MINE = '💣';
var FLAG = '🚩';


var BEGINNER = { size: 4, mines: 2 };
var MEDIUM = { size: 8, mines: 12 };
var EXPERT = { size: 12, mines: 30 };

var gLevel;
var gBoard = [];

var gSecPassedInterval;
var gSecondsPassed = 0;
var gFirstClick = 0;
// Elements
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
    console.log(gSecondsPassed);
    
}

function buildBoard(level) {
    var board = [];
    var size = level.size; // gLevel: size 4, mines 2
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
            var gameOver = (cell.isOpened && cell.isWithMine) ?  MINE : '';

            strHTML += `\t<td data-id="cell-${i}-${j}" class="cell ${className}" 
                                                        oncontextmenu="toggleFlagged(event, ${i}, ${j})" 
                                                        onclick="cellClicked(this, ${i}, ${j})">
                        <span class="flag-${i}-${j}" hidden>${FLAG}</span>
                        <span class="span-${i}-${j}" hidden>${MINE}</span>
                        ${gameOver}</td>\n`
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
            elCell.innerText = MINE;
            
            gameOver();
        } else {
            elCell.innerText = (cell.minesAroundCount !== 0) ? cell.minesAroundCount : '';
        }
    }
    return;
}

function gameOver() {
    console.log('game over you stepped on a mine');    
    elEmoji.innerText = '😵';
    
    clearInterval(gSecPassedInterval);
    gSecondsPassed = 0;
    gSecPassedInterval = null;
    
    revealAllMines();
    
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
    console.log(minesCounter);
    return minesCounter;
}

function findEmptyCellAndPutMine(gLevel, board) {
    var randomRowLoc = getRandomNum(gLevel.size);
    var randomColLoc = getRandomNum(gLevel.size);
    var randomCell = board[randomRowLoc][randomColLoc];
    
    if (randomCell.isWithMine === false) {
        randomCell.isWithMine = true;
        randomCell.value = MINE;
        
        // var elMine = document.querySelector(`span-${randomRowLoc}-${randomColLoc}`);
        // elMine.innerText = MINE;
    }
}

// function findAllMines() {
//     // change in board data -
//     var minedCells = [];
//     for (var i = 0; i < gBoard.length; i++) {
//         for (var j = 0; j < gBoard[i].length; j++) {
//             var cell = gBoard[i][j];
//             if (cell.isWithMine){
//                 cell.isOpened = true;
//                 cell.value = MINE;
//                 minedCells.push(cell);
//                 gBoard[i][j] = MINE;
//             }
//         }
//     }
//     return minedCells;
// }

function revealAllMines() {
    var mines = document.querySelectorAll('.mine');
    for (var i = 0; i < mines.length; i++) {
        var mine = mines[i];
    
        console.log(mine);
        mine = MINE;
        
    }
}
