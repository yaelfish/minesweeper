'use strict';

function getRandomNum(max) {
    return Math.floor(Math.random() * Math.floor(max));
}

function countSeconds(){
    gSecPassed++;
    return gSecPassed;
}

function mapAllMines(board) {
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[i].length; j++) {
            var cell = board[i][j];
            cell.minesAroundCount = setCellMinesNegsCount(board, i, j);
        }
    }
    return board;
}


function setCellMinesNegsCount(board, cellPosI, cellPosJ) {
    var cell = board[cellPosI][cellPosJ];
    var minesNeighbors = 0;
    for (var i = cellPosI - 1; i <= cellPosI + 1; i++) {
        if (i < 0 || i >= board.length) continue;
        for (var j = cellPosJ - 1; j <= cellPosJ + 1; j++) {
            if (j < 0 || j >= board[i].length) continue;
            if (i === cellPosI && j === cellPosJ) continue;
            if (board[i][j].isWithMine)
                minesNeighbors++
        }
    }
    cell.minesAroundCount = minesNeighbors;
    return minesNeighbors;
}

function openNeighbors(board, cellPosI, cellPosJ){
    var cell = board[cellPosI][cellPosJ];  
    for (var i = cellPosI - 1; i <= cellPosI + 1; i++) {
        if (i < 0 || i >= board.length) continue;
        for (var j = cellPosJ - 1; j <= cellPosJ + 1; j++) {
            if (j < 0 || j >= board[i].length) continue;
            if (i === cellPosI && j === cellPosJ) continue; 
            if (!board[i][j].isOpened){
                    board[i][j].isOpened = true;
                    gGame.openedCount++;
            }
        }
    }
    renderBoard();
}     

// HINTS

function searchForEmptyCells(board) {
    var matchingCells = [];
    for (var i = 0; i < board.length; i++) {
        var row = board[i];
        for (var j = 0; j < row.length; j++) {
            var cell = row[j];
            if(!cell.isWithMine && !cell.isOpened) {
            var coords = { i, j };
                matchingCells.push(coords);
            }
        }
    }
    return matchingCells;
}

function findRandomEmptyCell(board) {
    var emptyCells = searchForEmptyCells(board);
    if (emptyCells.length >= 2) {
        var randomNum = getRandomNum(emptyCells.length);
        var emptyCell = emptyCells[randomNum];
        return (emptyCell);
    }
    return null;
}


function displayHintOnBoard(board) {
    var cellCoords = findRandomEmptyCell(board)
    var elHintedCell = document.getElementById(`cell-${cellCoords.i}-${cellCoords.j}`);
    elHintedCell.classList.add('hint');
    setTimeout(() => {
        elHintedCell.classList.remove('hint');
    }, 1000);
}

// SAFE CLICKS

function searchForEmptySafeCells(board) {
    var matchingCells = [];
    for (var i = 0; i < board.length; i++) {
        var row = board[i];
        for (var j = 0; j < row.length; j++) {
            var cell = row[j];
            if (!cell.isWithMine && !cell.isOpened && cell.minesAroundCount < 2) {
                var coords = { i, j };
                matchingCells.push(coords);
            }
        }
    }
    return matchingCells;
}

function findRandomEmptySafeCell(board) {
    var emptyCells = searchForEmptySafeCells(board);
    if (emptyCells.length >= 2) {
        var randomNum = getRandomNum(emptyCells.length);
        var emptyCell = emptyCells[randomNum];
        return (emptyCell);
    }
    return null;
}


function displaySafeClkOnBoard(board) {
    var cellCoords = findRandomEmptySafeCell(board)
    var elHintedCell = document.getElementById(`cell-${cellCoords.i}-${cellCoords.j}`);
    elHintedCell.classList.add('hint');
    setTimeout(() => {
        elHintedCell.classList.remove('hint');
    }, 1000);
}