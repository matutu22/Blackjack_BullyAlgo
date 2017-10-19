var cards = require('./cards');
var player = require('./player');
var hand = require('./hand');
// Blackjack game.
function BlackjackGame(players) {
    this.players = players;
    this.dealer = null;
    this.result = 'None';
    this.cards = cards.createPlayingCards();
}

BlackjackGame.prototype.removePlayer = function (playerId) {
    this.players.splice(playerId, 1);
};

BlackjackGame.prototype.start = function () {
    for (var i = 0; i < this.players.length; i++) {
        var player = this.players[i];
        player.hand = hand.newHand();
        if (i === 0) {
            player.isDealer = true;
            player.addCard(this.cards.dealNextCard());
            this.dealer = player;
        } else {
            player.addCard(this.cards.dealNextCard());
            player.addCard(this.cards.dealNextCard());
        }
    }
};

BlackjackGame.prototype.isInProgress = function () {
    return (this.result === 'None') && (this.dealer && this.dealer.hasCards());
};

BlackjackGame.prototype.playersJson = function (playerId) {
    var json = [];
    if (this.players) {
        for (var i = 0; i < this.players.length; i++) {
            json.push(this.players[i] ? this.players[i].toJson(playerId) : '');
        }
    }
    return json;
};

BlackjackGame.prototype.toJson = function (playerId) {
    return {
        players: this.playersJson(playerId),
        result: this.result
    };
};


BlackjackGame.prototype.hit = function (playerId) {
    if (this.isGameInProgress()) {
        this.players[playerId].addCard(this.cards.dealNextCard());
        this.result = this.getResultForPlayer(playerId);
    }
};

BlackjackGame.prototype.isGameInProgress = function () {
    return this.result === 'None';
};

BlackjackGame.prototype.getResultForPlayer = function (playerId) {
    var score = this.players[playerId].getScore();
    if (score > 21) {
        return 'Bust';
    }
    return 'None';
};

BlackjackGame.prototype.stand = function (playerId) {
    if (this.isGameInProgress()) {
        while (this.dealer.getScore() < 17) {
            this.dealer.addCard(this.cards.dealNextCard());
        }
        this.result = this.getResult(playerId);
    }
};

BlackjackGame.prototype.getResult = function (playerId) {
    var playerScore = this.players[playerId].getScore();
    var dealerScore = this.dealer.getScore();

    if (this.players[playerId].hand.isBust()) {
        return 'Bust';
    } else if (this.dealer.hand.isBust()) {
        return 'Win';
    }

    if (playerScore > dealerScore) {
        return 'Win';
    } else if (playerScore === dealerScore) {
        return 'Push';
    }
    return 'Lose';
}

exports.newGame = function (players) {
    return new BlackjackGame(players);
};