///<reference path="board.ts"/>
///<reference path="..\typings\firebase\firebase.d.ts"/>
///<reference path="..\typings\toastr\toastr.d.ts"/>

/**
 * Created by thanhquanky on 4/8/15.
 */
'use strict';


module Game {

    enum State {INIT, WAIT, PLAY, WIN, LOSE};
    enum Mode {OFFLINE, ONLINE};
    var fbUrl:string = "https://gomoku.firebaseio.com/game";
    var fbRef : Firebase;

    export class Gomuku {
        gameState:State;
        gameMode: Mode;
        fbRef: Firebase;
        gameRef: Firebase;
        movesRef: Firebase;
        user: string;
        isX: boolean;
        cellWidth: number;
        board: Board;
        boardMap: number[][];

        constructor(user: string, mountTo: HTMLElement) {
            this.fbRef = new Firebase(fbUrl);
            this.user = user;
            var canvas = <HTMLCanvasElement> document.createElement("canvas");
            canvas.width = 801;
            canvas.height = 801;
            canvas.addEventListener('mousedown', (e) => {
                this.checkCell(e);
            });
            mountTo.appendChild(canvas);
            this.cellWidth = 20;
            this.board = new Board(canvas, this.cellWidth);
            this.boardMap = [];
            for (var i=0; i<this.board.nRows; i++) {
                var arr : number[] = [];
                for (var j=0; j<this.board.nCols; j++) {
                    arr.push(0);
                }
                this.boardMap.push(arr);
            }
            this.gameState = State.PLAY;
        }

        create() : string {
            this.gameRef = this.fbRef.push({
                user: this.user
            });
            var gameId: string = this.gameRef.key();
            this.isX = true;

            this.gameRef.on('value', (gameSnapshot) => {
                var game = gameSnapshot.val();
                if (game.guess != null) {
                    toastr.info(game.guess + ' has joined');
                    this.gameRef.off('value');
                }
            });

            this.movesRef = new Firebase(fbUrl + "/" + gameId + "/moves");

            return gameId;
        }

        join(gameId: string) : void {
            this.isX = false;
            this.gameRef = new Firebase(fbUrl + "/" + gameId);
            this.movesRef = new Firebase(fbUrl + "/" + gameId + "/moves");
            this.gameRef.update({
                guess: this.user
            });
        }

        checkBoardMap(row, col) : number {
            var dRows : number[] = [1,0, 1, 1];
            var dCols : number[] = [0,-1, 1, -1];

            for (var i=0; i<dRows.length; i++) {
                var count :number = 0;
                var nextRow = row;
                var nextCol = col;
                var target = this.boardMap[row][col];
                var k = 0;
                // check one direction
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

                if (count >= 5) {
                    if (this.isX && target > 0 || !this.isX && target < 0) {
                        return 1;
                    }
                    else {
                        return -1;
                    }
                }
            }
            return 0;
        }

        checkCell(mouseEvent) : void {
            if (this.gameState == State.PLAY) {
                this.gameState = State.WAIT;
                var canvas : HTMLCanvasElement = <HTMLCanvasElement> mouseEvent.currentTarget;
                var x = mouseEvent.clientX - canvas.offsetLeft;
                var y = mouseEvent.clientY - canvas.offsetTop;
                var col:number = Math.floor(x / this.cellWidth);
                var row:number = Math.floor(y / this.cellWidth);
                if (this.boardMap[row][col] != 0) {
                    toastr.error("Invalid move");
                    this.gameState = State.PLAY;
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
        }

        start() : void {
            this.board.clear();
        }

        gameloop() : void {
            var that = this;
            this.movesRef.on('child_added', (moveSnapShot) => {
                var newMove = moveSnapShot.val();
                if (this.gameState != State.WIN && this.gameState != State.LOSE) {
                    if (newMove.player !== that.user) {
                        that.gameState = State.PLAY;
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
        }
    }
}