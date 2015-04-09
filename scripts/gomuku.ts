/**
 * Created by thanhquanky on 4/8/15.
 */
'use strict';
/// <reference path="../typings/firebase/firebase.d.ts" />

module Gomuku {

    enum State {INIT, WAIT, PLAY, WIN, LOSE};
    var fbUrl:string = "https://gomoku.firebaseio.com/game";
    var fbRef : Firebase;

    export class Game {
        board:boolean[][];
        gameState:State;
        fbRef: Firebase;
        gameRef: Firebase;

        constructor() {
            fbRef = new Firebase(fbUrl);
        }

        create() : string {
            gameRef = fbRef.push();
        }

        join(gameId: string) {
            gameRef : Firebase = new Firebase(fbUrl + "/" + gameId);
        }
    }

    (function () {
        var container = document.querySelector('#container');

        var canvas:HTMLCanvasElement;

        canvas = <HTMLCanvasElement> document.createElement("canvas");
        container.appendChild(canvas);

        canvas.id = "gameCanvas";
        canvas.width = 801;
        canvas.height = 801;
        var context:CanvasRenderingContext2D = canvas.getContext("2d");
        var cellHeight:number = 20;
        var cellWidth:number = 20;
        var nRows:number = canvas.height / cellHeight;
        var nCols:number = canvas.width / cellWidth;

        var isX = false;


        var drawBoard = () => {
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

        var drawX = (row, col) => {
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
        }

        var drawO = (row, col) => {
            context.beginPath();
            context.strokeStyle = '#BB0012';
            context.lineWidth = 2;
            var radius = cellHeight / 3;
            var centerRow = (row * cellHeight) + cellHeight / 2;
            var centerCol = (col * cellWidth) + cellWidth / 2;
            context.arc(centerCol, centerRow, radius, 0, Math.PI * 2);
            context.stroke();
            context.closePath();
        }

        var checkCell = (mouseEvent) => {
            var col:number = Math.floor(mouseEvent.clientX / cellWidth) - 1;
            var row:number = Math.floor(mouseEvent.clientY / cellHeight) - 1;
            if (isX) {
                drawX(row, col);
            }
            else {
                drawO(row, col);
            }
            isX = !isX;
        }

        canvas.addEventListener('mousedown', checkCell);

        drawBoard();
    }())
}