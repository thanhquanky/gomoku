/**
 * Created by thanhquanky on 4/9/15.
 */
/// <reference path="./gomuku.ts" />
var name = prompt("Enter your name");
var gomuku = new Game.Gomuku(name);
gomuku.start();
$('#createBtn').click(function () {
    var gameId = gomuku.create();
    $('#gameId').html(gameId);
    gomuku.gameloop();
});
$('#joinBtn').click(function () {
    var gameId = prompt("Enter game id");
    gomuku.join(gameId);
    gomuku.gameloop();
});
//# sourceMappingURL=main.js.map