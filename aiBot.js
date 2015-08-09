var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io-client');
socket = io.connect("http://anrangame.herokuapp.com/");

socket.on('connect', function(){
	socket.emit('ai');
})

socket.on('updateGameSet', function(gameSet, player){

	if(player === socket.io.engine.id) {
		var move = aiMakeMove(gameSet);
		socket.emit('submitMove', move.pile, move.beans);
	}
});

var aiMakeMove = function( gameSet) {

	var anranSum = 0;
	for(var i = 0; i< gameSet.length; i++) {
		anranSum = anranSum ^ gameSet[i];
	}

	var move = {pile:0, beans: 0};
	for(var i = 0; i< gameSet.length; i++) {
		if(gameSet[i] >= anranSum && anranSum !== 0) {
			console.log("anram summed")
			move.beans = anranSum;
			move.pile = i;
			return move;
		} else if(gameSet[i] > 0) {
			move.beans = 1;
			move.pile = i;
		}
	}
	return move;

}

http.listen(process.env.PORT || 4000, function(){
  console.log('listening on *:4000');
});
