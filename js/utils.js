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

