var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var Anran = require('./anranGame.js');

http.listen(process.env.PORT || 3000, function(){
  console.log('listening on *:process.env.PORT');
});

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

var room = 0;
var roomsToJoin = [];
var roomList = {};

var ai;


io.on('connection', function(socket){

	socket.on('ai', function(){
		console.log("ai detected");
		ai = this;
	});


	socket.on('adduser', function(){

		//find available room to join
		if(roomsToJoin.length === 0 ) {

			socket.room = ++room;
			socket.join(room);
			roomsToJoin.push(room);

			roomList[socket.room] = {};
			roomList[socket.room].player1 = socket.id;
		} else {

			socket.room = roomsToJoin.pop();
			socket.join(socket.room);

			//if room has been filled, create new game instance for that room
			roomList[socket.room].player2 = socket.id;
			var player1 = io.sockets.connected[roomList[socket.room].player1];
			roomList[socket.room].game = new Anran(player1.id, socket.id);
			io.sockets.in(socket.room).emit('updateRoom', [player1.username, socket.username], player1.id);
			io.sockets.in(socket.room).emit('updateGameSet', roomList[socket.room].game.getGameSet());
		};

	});

	socket.on('submitMove', function(pile,beans) {
		var game = roomList[socket.room].game;

		//make game move
		beans = game.makeMove(pile, beans);

		//switch player's turn
		var nextPlayer = game.switchPlayersTurn();

		io.sockets.in(socket.room).emit('updateMoves', socket.username, pile, beans);
		io.sockets.in(socket.room).emit('updatePlayer',nextPlayer);
		io.sockets.in(socket.room).emit('updateGameSet', game.getGameSet(), nextPlayer, pile, beans);

		if(game.checkWinningMove()) {
			io.sockets.in(socket.room).emit('winner', socket.id);
			delete roomList[socket.room];
		}
	});


	socket.on('vsAI', function() {
		socket.room = ++room;
		socket.join(room);
		roomList[socket.room] = {};
		roomList[socket.room].player1 = socket.id;
		
   	 	ai.username = 'AIBOT';
   	 	ai.room = socket.room;
   	 	ai.join(socket.room);
		roomList[socket.room].player2 = ai.id;
		roomList[socket.room].game = new Anran(socket.id, ai.id);

		io.sockets.in(socket.room).emit('updateRoom', [socket.username, ai.username], socket.id);
		io.sockets.in(socket.room).emit('updateGameSet', roomList[socket.room].game.getGameSet(), socket.id);


	});

	socket.on('validMove', function(pile,beans) {
		var game = roomList[socket.room].game;
		//check whether move is valid
		var isValid = game.isValidMove(pile,beans);
		//tell client whether move was valid
		socket.emit('isValidMove', isValid);
	});

	socket.on('storeName', function(username){
		socket.username = username;
	});


	socket.on('disconnect',function(){
		if(io.sockets.adapter.rooms[socket.room]=== undefined) {
			//remove room from roomsToJoin list
	   	 	roomsToJoin.splice(roomsToJoin.indexOf(socket.room), 1);
		}else {
			socket.broadcast.to(socket.room).emit('playerDisconnect', socket.username + 'has disconnected. Refresh to start a new game');
		}
	})



});



