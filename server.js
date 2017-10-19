var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var fs = require('fs');
var url = require('url');
var blackjack = require('./lib/blackjack');
var player = require('./lib/player');

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html')
});

app.use('/scripts', express.static(__dirname + '/scripts'));
app.use('/css', express.static(__dirname + '/css'));
app.use('/img', express.static(__dirname + '/img'));

var playerSockets = [];
var playerCount = -1;
var game;
var players = [];

io.on('connection', function (socket) {
    socket.on('deal', function (data) {
        game = blackjack.newGame(players);
        game.start();
        deal(socket, data);
    });

    socket.on('hit', function (data) {
        hit(socket, data);
    });

    socket.on('stand', function (data) {
        stand(socket, data);
    });

    socket.on('disconnect', function () {
        removePlayer(this.id);
    });

    addPlayer(socket);
});

http.listen(3000);

var addPlayer = function (socket) {
    var mayBeNewPlayer = players[socket.id];
    if(mayBeNewPlayer) {
        console.log(`${mayBeNewPlayer.name} -> RECONNECTED`)
    } else {
        ++playerCount;
        socket.id = playerCount;

        mayBeNewPlayer = player.newPlayer(playerCount, "Player " + playerCount);
        console.log(`${mayBeNewPlayer.name} -> CONNECTED`);
    }

    playerSockets[playerCount] = socket;
    players[playerCount] = mayBeNewPlayer;
    socket.emit('id', {
        id: playerCount,
        players: playersJson(players, playerCount)
    });
    sendPlayerUpdates('newPlayer', players);
};

var removePlayer = function(playerId) {
    console.log('User ' + playerId + ' disconnected');
    playerSockets.splice(playerId, 1);
    players.splice(playerId, 1);
    if (game) {
        game.removePlayer(playerId);
    }
    playerCount--;
    sendPlayerUpdates('drop', players);
};

var playersJson = function (players, currentPlayerId) {
    var json = [];
    for (var i = 0; i < players.length; i++) {
        json.push(players[i].toJson(currentPlayerId))
    }
    return json;
};

var sendGameUpdate = function (event, game) {
    if (playerSockets && playerSockets.length > 0) {
        for (var i = 0; i < playerSockets.length; i++) {
            if (playerSockets[i]) {
                playerSockets[i].emit(event, game.toJson(i));
            }
        }
    }
};

var sendPlayerUpdates = function (event, players) {
    if (playerSockets && playerSockets.length > 0) {
        for (var i = 0; i < playerSockets.length; i++) {
            if (playerSockets[i]) {
                playerSockets[i].emit(event, { players: playersJson(players, i)});
            }
        }
    }
};

var deal = function (socket, data) {
    console.log('deal');
    if (!game.isInProgress()) {
        game.start();
    }
    sendGameUpdate("deal", game)
};

var hit = function (socket, data) {
    console.log('hit');
    game.hit(socket.id);
    sendGameUpdate("hit", game)
};

var stand = function (socket, data) {
    console.log('stand');
    game.stand(socket.id);
    sendGameUpdate("stand", game);
};

