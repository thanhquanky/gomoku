/**
 * Created by Thanh on 4/9/2015.
 */

module Game {
    export class Board {
        nRows : number;
        nCols : number;
        cellWidth: number;
        context: CanvasRenderingContext2D;
        canvas: HTMLCanvasElement;

        constructor(canvas: HTMLCanvasElement, cellWidth: number) {
            this.context = canvas.getContext('2d');
            this.canvas = canvas;
            this.nRows = Math.floor(this.canvas.height / cellWidth);
            this.nCols = Math.floor(this.canvas.width / cellWidth);
            this.cellWidth = cellWidth;
        }

        draw() {
            this.context.strokeStyle = '#000000';
            this.context.beginPath();
            for (var i = 0; i < this.nRows; i++) {
                this.context.moveTo(0, this.cellWidth * i);
                this.context.lineTo(this.canvas.width, this.cellWidth * i);
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

            this.context.moveTo(col * this.cellWidth + offset, row * this.cellWidth + offset);
            this.context.lineTo((col + 1) * this.cellWidth - offset, (row + 1) * this.cellWidth - offset);
            this.context.stroke();
            this.context.moveTo(col * this.cellWidth + offset, (row + 1) * this.cellWidth - offset);
            this.context.lineTo((col + 1) * this.cellWidth - offset, row * this.cellWidth + offset);
            this.context.stroke();
            this.context.closePath();
        }

        drawO (row, col) : void {
            this.context.beginPath();
            this.context.strokeStyle = '#BB0012';
            this.context.lineWidth = 2;
            var radius = this.cellWidth / 3;
            var centerRow = (row * this.cellWidth) + this.cellWidth / 2;
            var centerCol = (col * this.cellWidth) + this.cellWidth / 2;
            this.context.arc(centerCol, centerRow, radius, 0, Math.PI * 2);
            this.context.stroke();
            this.context.closePath();
        }

        clear() {
            this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.draw();
        }
    }
}