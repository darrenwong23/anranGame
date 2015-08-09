
var Game = function(player1id, player2id) {
	this.gameSet = [];
	this.players = [player1id,player2id];
	this.player1Turn = true;

	this.generateRandomGame();

}

Game.prototype.generateRandomGame = function() {
	//generate random number of piles
	var numberOfPiles = Math.floor(Math.random() * 2) + 2;

	//generate number of beans for each pile
	for(var i = 0; i<numberOfPiles; i++) {
		this.gameSet[i] = Math.floor(Math.random()* 50) + 1;
	}
}

Game.prototype.getGameSet= function() {
	return this.gameSet;
};

Game.prototype.switchPlayersTurn= function() {
	this.player1Turn = !this.player1Turn;

	return this.player1Turn ? this.players[0] : this.players[1];
};

Game.prototype.isItMyTurn = function(id) {
	if(this.player1Turn) return id === this.players[0];
	else return id === this.player[1];
}

Game.prototype.checkWinningMove = function() {
	for(var i = 0; i<this.gameSet.length; i++) {
		if(this.gameSet[i])
			return false;
	}
	return true;
}

Game.prototype.makeMove = function(pileIndex, number) {

	if(pileIndex > this.gameSet.length-1) {
		return null;
	}

	if(number > this.gameSet[pileIndex]) {
		var prevBeans = this.gameSet[pileIndex];
		this.gameSet[pileIndex]=0;
		return prevBeans;
	}else {
		this.gameSet[pileIndex] = this.gameSet[pileIndex] - number;
		return number;

	}
}

Game.prototype.isValidMove = function(pileIndex, number) {
	if(pileIndex >= this.gameSet.length || number <= 0) {
		return false;
	}
	if(this.gameSet[pileIndex] === 0) return false;
	return true;
};


module.exports = Game;