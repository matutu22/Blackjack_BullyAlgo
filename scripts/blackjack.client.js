var socket = io();
var myId = -1;

socket.on('stand', function (game) {
    standResult(game);
});
socket.on('deal', function (game) {
    dealResult(game);
});
socket.on('hit', function (game) {
    hitResult(game);
});

socket.on('id', function (data) {
    myId = data.id;
    init();
    updatePlayers(data.players);
});

socket.on('drop', function (players) {
    removePlayers(players);
});

socket.on('newPlayer', function (data) {
    updatePlayers(data.players);
});

var deal = function () {
    socket.emit('deal');
};

var hit = function () {
    socket.emit('hit');
};

var stand = function () {
    socket.emit('stand');
};

var getSuit = function (suit) {
    if (suit === 'H') {
        return 'hearts'
    } else if (suit === 'S') {
        return 'spades';
    } else if (suit === 'D') {
        return 'diamonds'
    } else if (suit === 'C') {
        return 'clubs'
    }

    return suit;
};

var getRank = function (rank) {
    if (rank === 1) {
        return 'ace';
    } else if (rank === 11) {
        return 'jack';
    } else if (rank === 12) {
        return 'queen';
    } else if (rank === 13) {
        return 'king';
    }
    return rank;
};

var getCardImg = function (card) {
    var image = new Image();
    image.src = '../img/' + getRank(card.rank) + "_of_" + getSuit(card.suit) + '.svg?d=' + Date.now();
    return image;
};

var updatePlayers = function (players) {
    if (players) {
        removePlayers(players);
        for (var i = 0; i < players.length; i++) {
            var player = players[i];
            $('#player' + i + 'Score').empty();
            if (player.isDealer) {
                $('#player' + i + 'Score').append(player.name + " (DEALER) <span class='badge'>" + player.score + "</span>");
                $('#player' + i + 'deal').removeAttr('hidden');
            } else {
                $('#player' + i + 'Score').append(player.name + " <span class='badge'>" + player.score + "</span>");
            }
            $('#player' + i + 'Cards').empty();
            loadCardImages('player' + i + 'Cards', player.cards);
            if (myId === i) {
                $('#player' + i + 'Buttons').removeAttr('hidden');
            }
            $('#player' + i).removeAttr('hidden');
        }
    }
};

var removePlayers = function (players) {
    for (var i = 0; i < 5; i++) {
        if (!players[i]) {
            $('#player' + i).attr('hidden');
        }
    }
};

var loadCardImages = function (divId, cards) {
    var loaded = 0;
    var images = [];
    if (cards && cards.length > 0) {
        for (var i = 0; i < cards.length; i++) {
            images[i] = getCardImg(cards[i]);
            images[i].onload = function () {
                if (++loaded === cards.length) {
                    drawCards(divId, images);
                }
            };
        }
    }

};

var drawCards = function (divId, images) {
    var canvas = document.getElementById(divId)
    var ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, 500, 150);
    for (var i = 0; i < images.length; i++) {
        ctx.drawImage(images[i], i * 20, 0, 100, 150);
    }
};

var updateDealer = function (dealer) {
    $('#dealerCards').empty();
    loadCardImages('dealerCards', dealer.cards);
    $('#dealerScore').text(dealer.score);
};

var updateResult = function (result) {
    var displayResult = result;
    if (result != 'None') {
        $('#resultModal').modal();
    } else {
        displayResult = '';
    }
    $('#result').text(displayResult);
};

var disableButton = function (id) {
    $(id).attr('disabled', 'disabled');
};

var enableButton = function (id) {
    $(id).removeAttr('disabled');
};

var disableDeal = function () {
    disableButton('#player'+myId+'deal');
    enableButton('#player'+myId+'hit');
    enableButton('#player'+myId+'stand');
};

var enableDeal = function () {
    enableButton('#player'+myId+'deal');
    disableButton('#player'+myId+'hit');
    disableButton('#player'+myId+'stand');
};

var enableDealIfGameFinished = function (result) {
    if (result !== 'None') {
        enableDeal();
    }
};

var dealResult = function (game) {
    disableDeal();
    updatePlayers(game.players);
    updateResult(game.result);
};

var hitResult = function (game) {
    updatePlayers(game.players);
    updateResult(game.result);
    enableDealIfGameFinished(game.result);
};

var standResult = function (game) {
    updatePlayers(game.players);
    updateResult(game.result);
    enableDealIfGameFinished(game.result);
};


var registerClientActions = function () {

    $('#player'+myId+'deal').click(function () {
        deal();
    });

    $('#restart').click(function () {
        deal();
    });

    $('#player'+myId+'hit').click(function () {
        hit();
    });

    $('#player'+myId+'stand').click(function () {
        stand();
    });
};

var init = function () {
    registerClientActions();
    enableDeal();
};