///<reference path="board.ts"/>
///<reference path="..\typings\firebase\firebase.d.ts"/>
///<reference path="..\typings\toastr\toastr.d.ts"/>
/**
 * Created by thanhquanky on 4/8/15.
 */
'use strict';
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
    var Mode;
    (function (Mode) {
        Mode[Mode["OFFLINE"] = 0] = "OFFLINE";
        Mode[Mode["ONLINE"] = 1] = "ONLINE";
    })(Mode || (Mode = {}));
    ;
    var fbUrl = "https://gomoku.firebaseio.com/game";
    var fbRef;
    var Gomuku = (function () {
        function Gomuku(user, mountTo) {
            var _this = this;
            this.fbRef = new Firebase(fbUrl);
            this.user = user;
            var canvas = document.createElement("canvas");
            canvas.width = 801;
            canvas.height = 801;
            canvas.addEventListener('mousedown', function (e) {
                _this.checkCell(e);
            });
            mountTo.appendChild(canvas);
            this.cellWidth = 20;
            this.board = new Game.Board(canvas, this.cellWidth);
            this.boardMap = [];
            for (var i = 0; i < this.board.nRows; i++) {
                var arr = [];
                for (var j = 0; j < this.board.nCols; j++) {
                    arr.push(0);
                }
                this.boardMap.push(arr);
            }
            this.gameState = 2 /* PLAY */;
        }
        Gomuku.prototype.create = function () {
            var _this = this;
            this.gameRef = this.fbRef.push({
                user: this.user
            });
            var gameId = this.gameRef.key();
            this.isX = true;
            this.gameRef.on('value', function (gameSnapshot) {
                var game = gameSnapshot.val();
                if (game.guess != null) {
                    toastr.info(game.guess + ' has joined');
                    _this.gameRef.off('value');
                }
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
        Gomuku.prototype.checkBoardMap = function (row, col) {
            var dRows = [1, 0, 1, 1];
            var dCols = [0, -1, 1, -1];
            for (var i = 0; i < dRows.length; i++) {
                var count = 0;
                var nextRow = row;
                var nextCol = col;
                var target = this.boardMap[row][col];
                var k = 0;
                while (nextRow >= 0 && nextCol >= 0 && nextRow < this.board.nRows && nextCol < this.board.nCols) {
                    nextRow += dRows[i];
                    nextCol += dCols[i];
                    k++;
                    if (this.boardMap[nextRow][nextCol] == target) {
                        count++;
                    }
                    else {
                        break;
                    }
                }
                // check other direction
                nextRow = row;
                nextCol = col;
                while (nextRow >= 0 && nextCol >= 0 && nextRow < this.board.nRows && nextCol < this.board.nCols) {
                    nextRow += dRows[i] * -1;
                    nextCol += dCols[i] * -1;
                    k++;
                    if (this.boardMap[nextRow][nextCol] == target) {
                        count++;
                    }
                    else {
                        break;
                    }
                }
                console.log("Checked " + k + " steps");
                if (count >= 4) {
                    if (this.isX && target > 0 || !this.isX && target < 0) {
                        return 1;
                    }
                    else {
                        return -1;
                    }
                }
            }
            return 0;
        };
        Gomuku.prototype.checkCell = function (mouseEvent) {
            if (this.gameState == 2 /* PLAY */) {
                this.gameState = 1 /* WAIT */;
                var canvas = mouseEvent.currentTarget;
                var x = mouseEvent.clientX - canvas.offsetLeft;
                var y = mouseEvent.clientY - canvas.offsetTop;
                var col = Math.floor(x / this.cellWidth);
                var row = Math.floor(y / this.cellWidth);
                if (this.boardMap[row][col] != 0) {
                    toastr.error("Invalid move");
                    this.gameState = 2 /* PLAY */;
                }
                else {
                    if (this.isX) {
                        this.board.drawX(row, col);
                        this.boardMap[row][col] = 1;
                    }
                    else {
                        this.board.drawO(row, col);
                        this.boardMap[row][col] = -1;
                    }
                    var result = this.checkBoardMap(row, col);
                    switch (result) {
                        case 1:
                            this.board.clear();
                            toastr.options.showDuration = 3000;
                            toastr.success("You've won", "Gomoku");
                            break;
                        case -1:
                            this.board.clear();
                            toastr.options.showDuration = 3000;
                            toastr.error("You've lost.", "Gomoku");
                            break;
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
            }
            else {
                alert("Wait for other player to make move");
            }
        };
        Gomuku.prototype.start = function () {
            this.board.clear();
        };
        Gomuku.prototype.gameloop = function () {
            var _this = this;
            var that = this;
            this.movesRef.on('child_added', function (moveSnapShot) {
                var newMove = moveSnapShot.val();
                if (_this.gameState != 3 /* WIN */ && _this.gameState != 4 /* LOSE */) {
                    if (newMove.player !== that.user) {
                        that.gameState = 2 /* PLAY */;
                        if (that.isX) {
                            that.board.drawO(newMove.position.row, newMove.position.col);
                            that.boardMap[newMove.position.row][newMove.position.col] = -1;
                        }
                        else {
                            that.board.drawX(newMove.position.row, newMove.position.col);
                            that.boardMap[newMove.position.row][newMove.position.col] = 1;
                        }
                    }
                }
            });
        };
        return Gomuku;
    })();
    Game.Gomuku = Gomuku;
})(Game || (Game = {}));
//# sourceMappingURL=gomuku.js.map