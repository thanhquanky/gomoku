/**
 * Created by thanhquanky on 4/8/15.
 */
'use strict';
/// <reference path="../typings/firebase/firebase.d.ts" />
var Gomuku;
(function (Gomuku) {
    var State;
    (function (State) {
        State[State["INIT"] = 0] = "INIT";
        State[State["WAIT"] = 1] = "WAIT";
        State[State["PLAY"] = 2] = "PLAY";
        State[State["WIN"] = 3] = "WIN";
        State[State["LOSE"] = 4] = "LOSE";
    })(State || (State = {}));
    ;
    var fbUrl = "https://gomoku.firebaseio.com/game";
    var fbRef;
    var Game = (function () {
        function Game() {
            fbRef = new Firebase(fbUrl);
        }
        Game.prototype.create = function () {
            gameRef = fbRef.push();
        };
        Game.prototype.join = function (gameId) {
            gameRef: Firebase = new Firebase(fbUrl + "/" + gameId);
        };
        return Game;
    })();
    Gomuku.Game = Game;
    (function () {
        var container = document.querySelector('#container');
        var canvas;
        canvas = document.createElement("canvas");
        container.appendChild(canvas);
        canvas.id = "gameCanvas";
        canvas.width = 801;
        canvas.height = 801;
        var context = canvas.getContext("2d");
        var cellHeight = 20;
        var cellWidth = 20;
        var nRows = canvas.height / cellHeight;
        var nCols = canvas.width / cellWidth;
        var isX = false;
        var drawBoard = function () {
            context.beginPath();
            for (var i = 0; i < nRows; i++) {
                context.moveTo(0, cellHeight * i);
                context.lineTo(canvas.width, cellHeight * i);
            }
            for (var j = 0; j < nCols; j++) {
                context.moveTo(cellWidth * j, 0);
                context.lineTo(cellWidth * j, canvas.height);
            }
            context.closePath();
            context.stroke();
        };
        var drawX = function (row, col) {
            context.beginPath();
            context.strokeStyle = '#00BB12';
            context.lineWidth = 2;
            var offset = cellWidth / 6;
            context.moveTo(col * cellWidth + offset, row * cellHeight + offset);
            context.lineTo((col + 1) * cellWidth - offset, (row + 1) * cellHeight - offset);
            context.stroke();
            context.moveTo(col * cellWidth + offset, (row + 1) * cellHeight - offset);
            context.lineTo((col + 1) * cellWidth - offset, row * cellHeight + offset);
            context.stroke();
            context.closePath();
        };
        var drawO = function (row, col) {
            context.beginPath();
            context.strokeStyle = '#BB0012';
            context.lineWidth = 2;
            var radius = cellHeight / 3;
            var centerRow = (row * cellHeight) + cellHeight / 2;
            var centerCol = (col * cellWidth) + cellWidth / 2;
            context.arc(centerCol, centerRow, radius, 0, Math.PI * 2);
            context.stroke();
            context.closePath();
        };
        var checkCell = function (mouseEvent) {
            var col = Math.floor(mouseEvent.clientX / cellWidth) - 1;
            var row = Math.floor(mouseEvent.clientY / cellHeight) - 1;
            if (isX) {
                drawX(row, col);
            }
            else {
                drawO(row, col);
            }
            isX = !isX;
        };
        canvas.addEventListener('mousedown', checkCell);
        drawBoard();
    }());
})(Gomuku || (Gomuku = {}));
//# sourceMappingURL=gomuku.js.map