(function(exports){
/////////////////////
// Dependencies
/////////////////////
var express = require('express');
var http = require('http');
var path = require('path');
var socketIO = require('socket.io');
var fs = require("fs");
var _eval = require('eval')
const cors = require('cors');
const axios = require('axios');

var Tools = require('./static/common/tools.js');	

const { GAMES } = require('./app');

class ServerController{
	
	constructor() {  
		this.lastGameId=0;
		this.app = express();
		this.server = http.Server(this.app);
		this.io;
		this.users=[];
		this.gameRooms=[{gameId: 0, gameName:"NewbieLobby", gameType:"lobby", host:0, players:[], isRunning:false, pw:"", maxPlayers: 100}];
		this.gameTypes; 
		this.controllerClasses;
		this.initGameTypes();
		this.gameControllers=[];
		this.gameLog=[];
			
	}

////////////////////////
// RUN Method
////////////////////////
	run(server, io){
		this.io = io;
		this.app.use(cors({
			//TO DO
			//maybe have a limit on who is and who is not allowed?
			origin: '*',
			methods: ['GET', 'POST'],
			allowedHeaders: ['Content-Type', 'Authorization'],
		  }));
		  
		this.defineServerListeners();
		this.loadUsersFromLaravel();
	}


///////////////////////////////
// Define Events to listen to
///////////////////////////////
	defineServerListeners(){
	  this.io.on('connection', (socket) =>{
		socket.on('refresh', (userId) => this.refreshPlayer(socket, userId) );
		socket.on('hasPasswordCheck', (userId, gameId) => this.checkForPassword(socket, userId,gameId));
		socket.on('kickPlayer', (gameId, userIdtoKick, adminId) => this.kickPlayer(gameId, userIdtoKick, adminId)); 
		socket.on('newMessage', (message) => this.newChatMessage(socket,message, this.getGameIdByUser(this.getUserIdBySocket(socket.id)) ));
		socket.on('createGameRoom', (userId,  newGameName, newGameType, pw, maxPlayers) => this.createGameRoom(socket, userId, newGameName, newGameType, pw, maxPlayers) ); 
		socket.on('joinGameRoom', (userId, gameId, pw) => this.joinGameRoom(socket, userId, gameId,pw)); 	
		socket.on('leaveGameRoom', (userId, gameId) => this.leaveGameRoom(userId, gameId)); 	
		socket.on('requestChangeGamePassword', (newGamePw, gameId) => this.changeGamePassword(newGamePw, gameId)); 	

		socket.on('laravelLogin', (userId, userName) => this.doOnSuccessfulLogin(socket, userId, userName)); 	
		

		//TO DO
		//Remove them and their functionality
		// socket.on('changeUserNameRequested', (newName, userId) => this.changeUserNameRequested(socket,newName, userId)); 
		// socket.on('requestPlayerLogin', (userName, pw) => this.requestPlayerLogin(socket,userName, pw)); 		
		// socket.on('requestPlayerLoginCookie', (userName) => this.requestPlayerLoginCookie(socket,userName)); 	
		// socket.on('requestPlayerSignup', (userName, pw) => this.requestPlayerSignup(socket,userName, pw)); 	
		// socket.on('disconnectPlayer', (username, userId) => this.disconnectPlayer(socket.id,username, userId));
		// socket.on('logoutPlayer', (username, userId) => this.logoutPlayer(socket,username, userId));
	  });

	}
////////////////////////
// ...Functions...
////////////////////////

	initGameTypes(){
		this.gameTypes=Tools.getFolderNamesInFolder(fs,path,"./node/game/").filter(function(e) { return e !=="common" });
		this.controllerClasses=[];
		for(var i=0; i <this.gameTypes.length;i++){
			var thisController= require("./game/"+this.gameTypes[i]+"/"+this.gameTypes[i]+"GameController.js");
			this.controllerClasses.push({name: this.gameTypes[i], controllerClass: thisController});
			thisController.initialize();
		}		
	}

	createGameController(newGameRoom, gameType){
		var controller;
		for(var i=0;i < this.controllerClasses.length;i++){
			if(this.controllerClasses[i].name==gameType){
				controller=this.controllerClasses[i].controllerClass;
			}
		}
		var gameController = new controller(newGameRoom.gameId, newGameRoom.host, newGameRoom.gameName, this.io, this);
		return gameController;	
	}
	
	
//*****************************
//Game/Lobby related Functions
//*****************************

	 createGameRoom(socket,userId, newGameName, newGameType, newPw, maxAmountPlayers){
		if(this.getGameIdByUser(userId)==0){
			var newGameId=this.getNewGameId();			
			var newGameRoom={gameId: newGameId, gameName:newGameName, gameType:newGameType, host:userId, players:[], isRunning:false, pw:newPw, maxPlayers: maxAmountPlayers};
			this.gameRooms.push(newGameRoom);
			var newGameController=this.createGameController(newGameRoom,newGameType);
			this.gameControllers.push({gameId:newGameRoom.gameId, controller: newGameController});
			var event={gameId: newGameId, type:"createGameRoom", target:userId};
			this.refreshGameRoomInfo(newGameId,event);
			this.refreshGameRoomInfo(0,event);
			this.joinGame(socket,userId,newGameId);
            this.pushLogMessage("{0} created a game room '{1}' for {2}.",[this.getUserNameByUserId(userId), newGameName, newGameType],  false, false, 0);
		
		}
	}

	 printRoomsOfSocket(socket){
        console.log(socket.rooms);
	}
	

	async printSocketsOfRoom(room){
		const rooms = this.io.of("/").adapter.rooms;
		console.log(rooms);
	}

	 printUserList(){
		for(var i=0;i<this.users.length;i++){
			console.log("User ID="+this.users[i].userId+" Name="+this.users[i].username+" IP="+this.users[i].ip+" socketId="+this.users[i].socketId);
		}	
	}
	
	refreshPlayer(socket, userId){
		if (!this.isUserInGame(userId)){
			this.joinGame(socket,userId,0);
			var event={gameId: this.getGameIdByUser(userId), type:"refreshPlayer", target:userId};
			this.refreshGameRoomInfo(this.getGameIdByUser(userId),event);	

		} else {		 
			socket.join(this.getGameIdByUser(userId));
			var gameRoom=this.getGameRoomById(this.getGameIdByUser(userId))
			this.io.to(socket.id).emit('joinedGameRoom', gameRoom.gameId, gameRoom.gameType);		
			var event={gameId: this.getGameIdByUser(userId), type:"refreshPlayer", target:userId};
			this.refreshGameRoomInfo(this.getGameIdByUser(userId),event);		
		}	  
	}
	
	getGameControllerByGameId(gameId){
		for(var i=0; i<this.gameControllers.length;i++){
			if(this.gameControllers[i].gameId==gameId){
				return this.gameControllers[i].controller;		
			}	
		}
		return null;
	}
	
	//TO DO, players are not added to gameRoom if they are already in it
	joinGame(socket, userId, gameId){
		var gameRoom=this.getGameRoomById(gameId);
		this.leavePlayers(userId);
		socket.leave(0);
		socket.join(gameId);

		axios.put("http://localhost:3333/api/users/game", {
			user_id: userId, game_id: gameId, game_type: gameRoom.gameType 
		})
		.then(response => {
			console.log('User updated:', response.data);
		})
		.catch(error => {
			console.error('Error:', error.response ? error.response.data : error.message);
		});

		gameRoom.players.push(userId);
        if(gameId > 0){
            this.pushLogMessage("{0} joined game room '{1}'.",[this.getUserNameByUserId(userId), gameRoom.gameName],  false, false, 0);   
        }

		this.io.to(socket.id).emit('joinedGameRoom', gameId, gameRoom.gameType);	

		var event = {gameId: gameId, type:"joinGameRoom", target:userId};
		this.refreshGameRoomInfo(gameId,event);		
	}	
	

	joinGameRoom(socket, userId, gameId, enteredPassword){
		var gameRoom=this.getGameRoomById(gameId);
		if(gameRoom?.pw && gameRoom.pw==enteredPassword){
			
			if(gameRoom.players.length < gameRoom.maxPlayers || gameRoom.maxPlayers=="∞"){
				this.joinGame(socket, userId, gameId);
			}else{
				 this.io.to(socket.id).emit('failedJoinGame',"Lobby full");
			}	
		}
		else {
			this.io.to(socket.id).emit('failedJoinGame',"Wrong password");
		}	
	}

	kickPlayer(gameId, userId, kickerId){
		var game= this.getGameRoomById(gameId);
		if(game.gameId==gameId && game.host==kickerId){
			this.pushLogMessage("{0} has been kicked.",[this.getUserNameByUserId(userId)], false, false, gameId);
			this.leaveGameRoom(userId,gameId);		
		} 
	}
	

	 getGameRoomById(gameId){
		for(var i=0; i<this.gameRooms.length;i++){
			if(this.gameRooms[i].gameId==gameId){
				return this.gameRooms[i];
			}
		}
		return null;
	}

	 getNewGameId(){
		 this.lastGameId++;
		 return this.lastGameId;
	}


	checkForPassword(socket, userId, gameId){
		if (this.getGameRoomById(gameId).pw) {
			this.io.to(socket.id).emit('requestGamePassword', gameId);
		  } else {
			this.joinGame(socket, userId, gameId);
		  }
	}

	 changeGamePassword(socket, newGamePw,gameId){
		var game=this.getGameRoomById(gameId);
		var requesterId=this.getUserIdBySocket(socket.id);
		if(requesterId==game.host){
			game.pw=newGamePw;
		}
	}


	requestPlayerLogin(socket, userName, pw){
		var userId=0;
		var message="";
		for(var i=0; i< this.users.length;i++){
			if(userName.toLowerCase()==this.users[i].username.toLowerCase()){
				userId=this.users[i].userId;
				userName=this.users[i].username;
				if(pw!= this.users[i].pw){
					
					message="Your combination of password and favourite animal are incorrect.";
				}
				if (this.isUserInGame(userId)){
					message="You are already logged in on another device.";
				}
			}
		}
		if(userId==0){
			message="This username does not exist. Please sign up.";
		}	
		if(message!=""){
			this.io.to(socket.id).emit("loginFail", userName,message, false);
		}
		else{	
			this.doOnSuccessfulLogin(socket, userId, userName);		
		}
	}


	requestPlayerLoginCookie(socket, userName){
		var userId=0;
		var message="";
		var currentDate=new Date();
		for(var i=0; i< this.users.length;i++){
			if(userName==this.users[i].username){
				userId=this.users[i].userId;
				var daysSinceLastLogin=Tools.getTimeDifferenceInDays(currentDate, this.users[i].lastLoginTime);
					if(daysSinceLastLogin>1){
						message="Login expired, you must login again";
					}
					/*
					//TODO sometimes IPv4 and sometimes IPv6, gets annoying when i freshly get logged in when i join a game and im on a diff IP ..
					if(this.users[i].ip!=socket.request.connection.remoteAddress){
						message="Seems like you logged in from another computer? Fresh login required";
					}*/	
			}
		}
		if(userId==0){
			message="Username does not exist";
		}
		
		if(message!=""){
			this.io.to(socket.id).emit("loginFail", userName,message, true);
		}
		else{	
			this.doOnSuccessfulLogin(socket, userId, userName);
		}
	}	
	
    doOnSuccessfulLogin(socket, userId, userName){
			this.updateUserInfoOnLogin(socket, userId, userName);
			this.io.to(socket.id).emit("loginSuccessful", userName, userId);
			this.refreshPlayer(socket,userId);
            var gameId=this.getGameIdByUser(userId);
            this.pushLogMessage("{0} has connected.",[userName],  false, false, gameId);
    }
	
	requestPlayerSignup(socket, userName, newPw){
		if(this.userNameExists(userName)){
			var message="Username already taken";
			console.log("request Player Signup failed: "+message);
			this.io.to(socket.id).emit("loginFail", userName,message, false);
		}	
		else{
			if(userName == undefined || userName.length<=2){
				var message="Username too short";
				this.io.to(socket.id).emit("loginFail", userName,message, false);
			}
			else{
				var newUserId=this.getNewUserId();
				this.createUser(socket, userName, newPw, newUserId);
				console.log("request Player Signup successful: "+userName+" "+newUserId+" "+newPw);
				this.io.to(socket.id).emit("signupSuccessful", userName, newUserId, newPw);
				this.refreshPlayer(socket,newUserId);
			}
		}
		
	}
	
	userNameExists(name){
		for(var i=0; i< this.users.length;i++){
			if(name.toLowerCase()==this.users[i].username.toLowerCase()){
				return true;
			}
		}
		return false;
	}
	
	generateNewPassword(){
		return Tools.generateRandomString(4);
	}

	createUser(socket, newUserName, newPw, newUserId){
		var newUserId=this.getNewUserId();
		var newSocketId=socket.id;
		var newIp=socket.request.connection.remoteAddress;
		var creationTime=new Date();
		var lastLoginTime=creationTime;
		var newUser={userId:newUserId, username:newUserName, pw: newPw, creationTime: creationTime, lastLoginTime: lastLoginTime, socketId:newSocketId, ip:newIp};
		this.users.push(newUser);
		//TO DO
		//this.saveUsersInFile();
	}
	
	getNewUserId(){
		var maxUserId=1;
		for(var i=0;i<this.users.length;i++){
			var currentUser=this.users[i];
			if(currentUser.userId >maxUserId){
				maxUserId=currentUser.userId;
			}
		}
		return (maxUserId+1);
		
	}
	
	updateUserInfoOnLogin(socket, userIdToUpdate, userName){
		for(var i=0;i<this.users.length;i++){
			if(this.users[i].userId==userIdToUpdate){	
				if(userName!=undefined && userName != "" && this.users[i].username!=userName){	
					this.users[i].username=userName;
				}
				this.users[i].socketId=socket.id;
				this.users[i].ip=socket.request.connection.remoteAddress;
				this.users[i].lastLoginTime=new Date();
			}	
		}
		//TO DO
		//this.saveUsersInFile();
	}

	disconnectPlayer(socketId,username, userId){
		var gameId=this.getGameIdByUser(userId);
		if (username != ""){
			this.pushLogMessage("{0} has disconnected.", [username],false, false,gameId);
		}
		if(this.getGameIdByUser(userId) == 0 ){
			this.leavePlayers(userId);
		}
		var event={gameId: gameId, type:"disconnectPlayer", target:userId};
		this.refreshGameRoomInfo(gameId, event);
	}

	logoutPlayer(socket,username, userId){
		console.log("Logout Player: "+username + " userId: "+userId);
        this.pushLogMessage("{0} has logged out.", [username],false, false,0);
		this.leavePlayers(userId);
		//TODO ??		
	}
	
	leavePlayers(userId){
		for(var i=0;i<this.gameRooms.length;i++){
			for(var j=0;j<this.gameRooms[i].players.length;j++){
				if (this.gameRooms[i].players[j]== userId) {	
					this.gameRooms[i].players.splice(j, 1);
					if (this.gameRooms[i].players.length < 1 && i != 0) {
							this.destroyGameRoom(this.gameRooms[i].gameId);
						}
					return;
				}
			}
		}
	} 

	changeUserNameRequested(socket, newUserName, userId){
		var currentUserName=this.getUserNameByUserId(userId);
		var message="";
		if(currentUserName!=newUserName){
			if(!this.userNameExists(newUserName)){
				for(var i=0; i < this.users.length;i++){
					if(this.users[i].userId==userId){
						this.users[i].username=newUserName;	
						//TO DO
						//this.saveUsersInFile();
						var gameId=this.getGameIdByUser(userId);
						this.io.to(socket.id).emit("userNameChanged", newUserName);
						this.pushLogMessage("{0} has changed name to {1}. How creative.",[currentUserName, newUserName],  false, false,gameId);
					}
				}			
			}
			else{
				message="That name is already taken.";
			}
		}
		else{
			message="Thats already your name, did you already forget?!";
		}
		
		if(message!=""){
			this.pushLogMessage( "Can't change username to {0}. "+message, [newUserName], false,false,socket.id);			
		}	
	}


	 getSimpleListOfAllUsers(){
		var simpleUsers=[];
		for(var i=0;i<this.users.length;i++){
			simpleUsers.push({userId: this.users[i].userId, username: this.users[i].username});
		}	
		return simpleUsers;	
	}

	 refreshGameRoomInfo(gameId,event){
		if (gameId > 0) {
			var controller = this.getGameControllerByGameId(gameId);
			if (controller != null){
				this.io.to(gameId).emit('gameRoomUpdated', gameId, this.getGameRoomById(gameId), this.getSimpleListOfAllUsers());
				controller.handleGameRoomChange(event);
			}
		}
		this.io.to(0).emit('gameRoomsUpdated', this.gameRooms, this.getSimpleListOfAllUsers(), GAMES);
	}

	getUsers(){
		return this.users;
	}

	getUserIdByUserName(username){
		var user =this.users.filter(function(e) { return e.username == username })[0];
		if(user == undefined){
			return -1;
		}
		else{
			return user.userId;
		}
	}

	getUserNameByUserId(userId){
		var user =this.users.filter(function(e) { return e.userId == userId })[0];
		if(user == undefined){
			return "Not_A_Player";
		}
		else{
			return user.username;
		}
	}

	 getUserNameBySocket(socketId){
		var user =this.users.filter(function(e) { return e.socketId == socketId })[0];
		if(user == undefined){
			return "Not_A_Player";
		}
		else{
			return user.username;
		}
	}

	 getUserIdBySocket(socketId){
		var user =this.users.filter(function(e) { return e.socketId == socketId })[0];
		if(user == undefined){
			return "Not_A_Player";
		}
		else{
			return user.userId;
		}
	}
	 getSocketByUserName(username){
		var user =this.users.filter(function(e) { return e.username == username })[0];
		if(user == undefined){
			return "Not_A_Player";
		}
		else{
			return user.socketId;
		}
	}

	getSocketByUser(userId){
		var user =this.users.filter(function(e) { return e.userId == userId })[0];
		if(user == undefined){
			return "Not_A_Player";
		}
		else{
			return user.socketId;
		}
	}

	 getAllLoggedInUsers(){
		var loggedInUsers=[];
		for(var i=0; i<this.users.length;i++){
			var currentUser=users[i];
			if(currentUser.socketId != null && currentUser.socketId!=""){
				loggedInUsers.push(currentUser);
			}
		}
		return loggedInUsers;
	}

	getGameIdByUser(userId){
		for(var i=0;i<this.gameRooms.length;i++){
			for(var j=0;j<this.gameRooms[i].players.length;j++){
				if(this.gameRooms[i].players[j]==userId){
					return this.gameRooms[i].gameId;
				}
			}
		}
		return 0;
	}
	
	isUserInGame(userId){
		for(var i=0;i<this.gameRooms.length;i++){
			for(var j=0;j<this.gameRooms[i].players.length;j++){
				if(this.gameRooms[i].players[j]==userId){
					return true;
				}
			}
		}
		return false;
	}
	
	getAllLoggedInUsersWithoutGame(){
		var loggedInUsers=[];
		for(var i=0; i<this.users.length;i++){
			var currentUser=this.users[i];
			if(currentUser.socketId != null && currentUser.socketId!=""){
				if(this.getGameIdByUser(currentUser.userId)==0){
					loggedInUsers.push(currentUser);
				}
			}
		}
		return loggedInUsers;
	}


	destroyGameRoom(gameId){
		console.log("Destroying the game room with id: "+gameId);
		for(var i=0;i<this.gameRooms.length;i++){
			if(this.gameRooms[i].gameId==gameId){
				this.gameRooms[i].isRunning=false;
				this.gameRooms.splice(i, 1);
			}
		}
		for(var i=0; i<this.gameControllers.length;i++){
			if(this.gameControllers[i].gameId==gameId){
				var gameControllerToBeDeleted=this.gameControllers[i];
				this.gameControllers.splice(i, 1);
				gameControllerToBeDeleted.controller.deleteYourself();
				
			}
		}	
	}
	
	async leaveGameRoom(userId, gameId){
		if (userId == null) { return;}
		
		this.leavePlayers(userId);
		var socket=await this.getSocketBySocketId(this.getSocketByUser(userId));
		if (gameId != null && socket != null) { socket.leave(gameId)}
		
		if(gameId!=0){
			this.joinGame(socket,userId,0);
		}
		
        this.pushLogMessage("{0} left the game.",[this.getUserNameByUserId(userId)],  false, false, gameId);		
		if (this.getGameRoomById(gameId) == null){
			if (gameId != 0){
				for(var i=0; i<this.gameControllers.length;i++){
					if(this.gameControllers[i].gameId==gameId){
						this.gameControllers[i].deleteYourself();
						this.gameControllers[i] = null;
					}
				}
			}
		} else {
			var event={gameId: gameId, type:"leaveGameRoom", target:userId};
			this.refreshGameRoomInfo(gameId, event);
		}		
	}

	async getSocketBySocketId(socketId){
		const sockets = await this.io.fetchSockets();
		for (const socket of sockets) {
			if(socket.id==socketId){			
				return socket;
			}
		}
		return null;		
	}

	// TO DO
	// saveUsersInFile(){
	// 	fs.writeFile(ServerController.USER_FILE_NAME, JSON.stringify(this.users,null, '\t'), function (err) {
	// 		if (err) return console.log("Save User Error: "+err);
	// 	});
	// }

	async loadUsersFromLaravel() {
		try {
			const response = await axios.get('http://localhost:3333/api/users');
		  	const users = response.data;
	  
		  	this.users = response.data.map(user => ({
				userId: user.id,
				username: user.name,
			}));
		} catch (error) {
		  console.error('Error fetching users:', error.message);
		}
	  }

	newChatMessage(socket, message,gameId){		
		//this.printRoomsOfSocket(socket);
		this.pushLogMessage(message, [this.getUserNameBySocket(socket.id)] ,true, false,gameId);		
	}


/**
Function that pushes a given LogMessages to either all Users or the specified user "to".
The message can contain placeholders, i.e."{0}", which means that the first element of the args array should be replaced here.
The message will be interpreted to have placeholders, IF the argument "isRaw" is false. Else the message will be taken 1:1.
If the message "is raw", then the first argument of "args" is mandatory and will be interpreted as the sender (i.e. player name or "server") and will be put in front of the message.
The parameter "important" defines whether the message should be printed in bold or not.

**/
	pushLogMessage( message, args, isRaw, important, to){
		var logMessageHTML;
		if(isRaw){
			logMessageHTML='<p><span><b>'+args[0]+':</b> '+message+'</span></p>';
		}
		else{
			if(important){
				logMessageHTML='<p><span><b>'+ServerController.replaceStringArgs(message,args)+'</b></span></p>';
			}
			else{
				logMessageHTML='<p><span>'+ServerController.replaceStringArgs(message,args)+'</span></p>';
			}	
		}

		this.gameLog.push(logMessageHTML);
		if(to == undefined || to ==null ){
			this.io.sockets.emit("gameLog", logMessageHTML);
		}
		else{
			this.io.to(to).emit("gameLog", logMessageHTML);	
		}
	}

	
	static replaceStringArgs(message, args){
		var result=message;
		for(var i=0;i<args.length;i++){
			result=result.replace("{"+i+"}", args[i]);		
		}	
		return result;	
	}
	

}

module.exports = ServerController;
     
})(typeof exports === 'undefined'?  
            window: exports); 
