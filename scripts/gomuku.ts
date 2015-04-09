/**
 * Created by thanhquanky on 4/8/15.
 */
'use strict';
/// <reference path="../typings/firebase/firebase.d.ts" />

module Game {

    enum State {INIT, WAIT, PLAY, WIN, LOSE};
    var fbUrl:string = "https://gomoku.firebaseio.com/game";
    var fbRef : Firebase;

    export class Gomuku {
        board:boolean[][];
        gameState:State;
        fbRef: Firebase;
        gameRef: Firebase;
        movesRef: Firebase;
        user: string;
        isX: boolean;
        canvas: HTMLCanvasElement;
        nRows: number;
        nCols: number;
        cellWidth: number;
        cellHeight: number;
        context: CanvasRenderingContext2D;

        constructor(user: string) {
            this.fbRef = new Firebase(fbUrl);
            this.user = user;
            this.canvas = <HTMLCanvasElement> document.querySelector('#canvas');
            this.canvas.id = "gameCanvas";
            this.canvas.width = 801;
            this.canvas.height = 801;
            this.context = this.canvas.getContext("2d");
            this.cellHeight = 20;
            this.cellWidth = 20;
            this.nRows = this.canvas.height / this.cellHeight;
            this.nCols = this.canvas.width / this.cellWidth;
            this.canvas.addEventListener('mousedown', (e) => {
                this.checkCell(e);
            });
            this.gameState = State.PLAY;
        }

        create() : string {
            this.gameRef = this.fbRef.push();
            var gameId: string = this.gameRef.key();
            this.isX = true;
            this.gameRef.set({
                user: this.user
            })
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

        drawBoard() : void {
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
        }

        drawX(row, col) : void {
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
        }

        drawO (row, col) : void {
            this.context.beginPath();
            this.context.strokeStyle = '#BB0012';
            this.context.lineWidth = 2;
            var radius = this.cellHeight / 3;
            var centerRow = (row * this.cellHeight) + this.cellHeight / 2;
            var centerCol = (col * this.cellWidth) + this.cellWidth / 2;
            this.context.arc(centerCol, centerRow, radius, 0, Math.PI * 2);
            this.context.stroke();
            this.context.closePath();
        }

        checkCell(mouseEvent) : void {
            if (this.gameState == State.PLAY) {
                this.gameState = State.WAIT;
                var x = mouseEvent.clientX - this.canvas.offsetLeft;
                var y = mouseEvent.clientY - this.canvas.offsetTop;
                var col:number = Math.floor(x / this.cellWidth);
                var row:number = Math.floor(y / this.cellHeight);
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
                })
            }
            else {
                alert("Wait for other player to make move");
            }
        }

        start() : void {
            this.drawBoard();
        }

        gameloop() : void {
            var that = this;
            this.movesRef.on('child_added', function(moveSnapShot) {
                var newMove = moveSnapShot.val();
                if (newMove.player !== that.user) {
                    that.gameState = State.PLAY;
                    if (that.isX)
                        that.drawO(newMove.position.row, newMove.position.col);
                    else
                        that.drawX(newMove.position.row, newMove.position.col);
                }
            });
        }
    }
}