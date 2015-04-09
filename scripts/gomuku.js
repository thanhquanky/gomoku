/**
 * Created by thanhquanky on 4/8/15.
 */
'use strict';
/// <reference path="../typings/firebase/firebase.d.ts" />
var Game;
(function (Game) {
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
    var Gomuku = (function () {
        function Gomuku(user) {
            var _this = this;
            this.fbRef = new Firebase(fbUrl);
            this.user = user;
            this.canvas = document.querySelector('#canvas');
            this.canvas.id = "gameCanvas";
            this.canvas.width = 801;
            this.canvas.height = 801;
            this.context = this.canvas.getContext("2d");
            this.cellHeight = 20;
            this.cellWidth = 20;
            this.nRows = this.canvas.height / this.cellHeight;
            this.nCols = this.canvas.width / this.cellWidth;
            this.canvas.addEventListener('mousedown', function (e) {
                _this.checkCell(e);
            });
            this.gameState = 2 /* PLAY */;
        }
        Gomuku.prototype.create = function () {
            this.gameRef = this.fbRef.push();
            var gameId = this.gameRef.key();
            this.isX = true;
            this.gameRef.set({
                user: this.user
            });
            this.movesRef = new Firebase(fbUrl + "/" + gameId + "/moves");
            return gameId;
        };
        Gomuku.prototype.join = function (gameId) {
            this.isX = false;
            this.gameRef = new Firebase(fbUrl + "/" + gameId);
            this.movesRef = new Firebase(fbUrl + "/" + gameId + "/moves");
            this.gameRef.update({
                guess: this.user
            });
        };
        Gomuku.prototype.drawBoard = function () {
            this.context.beginPath();
            for (var i = 0; i < this.nRows; i++) {
                this.context.moveTo(0, this.cellHeight * i);
                this.context.lineTo(this.canvas.width, this.cellHeight * i);
            }
            for (var j = 0; j < this.nCols; j++) {
                this.context.moveTo(this.cellWidth * j, 0);
                this.context.lineTo(this.cellWidth * j, this.canvas.height);
            }
            this.context.closePath();
            this.context.stroke();
        };
        Gomuku.prototype.drawX = function (row, col) {
            this.context.beginPath();
            this.context.strokeStyle = '#00BB12';
            this.context.lineWidth = 2;
            var offset = this.cellWidth / 6;
            this.context.moveTo(col * this.cellWidth + offset, row * this.cellHeight + offset);
            this.context.lineTo((col + 1) * this.cellWidth - offset, (row + 1) * this.cellHeight - offset);
            this.context.stroke();
            this.context.moveTo(col * this.cellWidth + offset, (row + 1) * this.cellHeight - offset);
            this.context.lineTo((col + 1) * this.cellWidth - offset, row * this.cellHeight + offset);
            this.context.stroke();
            this.context.closePath();
        };
        Gomuku.prototype.drawO = function (row, col) {
            this.context.beginPath();
            this.context.strokeStyle = '#BB0012';
            this.context.lineWidth = 2;
            var radius = this.cellHeight / 3;
            var centerRow = (row * this.cellHeight) + this.cellHeight / 2;
            var centerCol = (col * this.cellWidth) + this.cellWidth / 2;
            this.context.arc(centerCol, centerRow, radius, 0, Math.PI * 2);
            this.context.stroke();
            this.context.closePath();
        };
        Gomuku.prototype.checkCell = function (mouseEvent) {
            if (this.gameState == 2 /* PLAY */) {
                this.gameState = 1 /* WAIT */;
                var x = mouseEvent.clientX - this.canvas.offsetLeft;
                var y = mouseEvent.clientY - this.canvas.offsetTop;
                var col = Math.floor(x / this.cellWidth);
                var row = Math.floor(y / this.cellHeight);
                if (this.isX) {
                    this.drawX(row, col);
                }
                else {
                    this.drawO(row, col);
                }
                this.movesRef.push({
                    player: this.user,
                    position: {
                        row: row,
                        col: col
                    },
                    playAt: Date.now()
                });
            }
            else {
                alert("Wait for other player to make move");
            }
        };
        Gomuku.prototype.start = function () {
            this.drawBoard();
        };
        Gomuku.prototype.gameloop = function () {
            var that = this;
            this.movesRef.on('child_added', function (moveSnapShot) {
                var newMove = moveSnapShot.val();
                if (newMove.player !== that.user) {
                    that.gameState = 2 /* PLAY */;
                    if (that.isX)
                        that.drawO(newMove.position.row, newMove.position.col);
                    else
                        that.drawX(newMove.position.row, newMove.position.col);
                }
            });
        };
        return Gomuku;
    })();
    Game.Gomuku = Gomuku;
})(Game || (Game = {}));
//# sourceMappingURL=gomuku.js.map