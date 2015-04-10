/**
 * Created by thanhquanky on 4/9/15.
 */
/// <reference path="./gomuku.ts" />
var name = prompt("Enter your name");
var container = document.querySelector("#gameContainer ");
var gomuku = new Game.Gomuku(name, container);
gomuku.start();
document.querySelector('#createBtn').addEventListener('click', function (e) {
    var gameId = gomuku.create();
    var gameIdSpan = document.querySelector('#gameId');
    gameIdSpan.textContent = gameId;
    gomuku.gameloop();
});
document.querySelector('#joinBtn').addEventListener('click', function (e) {
    var gameId = prompt("Enter game id");
    gomuku.join(gameId);
    gomuku.gameloop();
});
//# sourceMappingURL=main.js.map