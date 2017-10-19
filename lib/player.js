var hand = require('./hand');

function Player(id, name) {
    this.id = id;
    this.name = name;
    this.hand = hand.newHand();
    this.isDealer = false;
    this.score = 0;
}
Player.prototype.hasCards = function () {
    if(this.hand){
        return this.hand.hasCards();
    }
    return false;
};

Player.prototype.toJson = function (otherPlayerId) {
    return {
        name: this.name,
        cards: this.hand ? this.hand.toJson(this.id !== otherPlayerId): {},
        isDealer: this.isDealer,
        score: this.getScore()
    }
};

Player.prototype.getScore = function () {
    return this.hand.getScore();
};

Player.prototype.addCard = function (nextCard) {
    this.hand.addCard(nextCard);
};

Player.prototype.isBusted = function () {
    return this.hand.isBust();
};

exports.newPlayer = function (id, name) {
    return new Player(id, name);
};