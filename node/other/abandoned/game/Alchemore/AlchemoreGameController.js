(function(exports) { 

var CharacterHandler=require("./../common/CharacterHandler.js");
var CommonGameController=require("./../common/CommonGameController.js");
var Movement2DGrid=require("./../common/Movement2DGrid.js");
var ItemInteraction2DGrid=require("./../common/ItemInteraction2DGrid.js");
var MapHandler2DGrid=require("./../common/MapHandler2DGrid.js");
var Tools = require('./../../static/common/tools.js');	
var CharacterLoader2DGrid=require("./../common/CharacterLoader2DGrid.js");
var AlchemoreResourceManager= require("./AlchemoreResourceManager.js");
var fs = require("fs");

var GAME_NAME="Alchemore";
var NONE="none";




var TILESIZEWIDTH = 64;
var TILESIZEHEIGHT = 64;


class AlchemoreGameController extends CommonGameController{
	constructor(gameId, host, gameName, io, server) {  
		super(GAME_NAME, gameId, host, gameName, io, server,  true);
		
		var hatColor = [10,100,255];
		var faceColor = [150,75,10];
		var bodyColor = [15,200,0];
			var defaultCustomCharacter = {body: CharacterLoader2DGrid.customBodies[0].name, 
						hat: CharacterLoader2DGrid.customHats[0].name, 
						face: CharacterLoader2DGrid.customFaces[0].name, 
						hatColor:hatColor, faceColor:faceColor, bodyColor:bodyColor, 
						hasHatMask: false, hasFaceMask: false, hasBodyMask: false};
		var customizationOptions={customHats:CharacterLoader2DGrid.customHats,customFaces:CharacterLoader2DGrid.customFaces,customBodies:CharacterLoader2DGrid.customBodies};
		this.characterHandler=new CharacterHandler(this,io, gameId, defaultCustomCharacter, customizationOptions);
		this.movementHandler=new Movement2DGrid(this,io, gameId, 18, "team");
		this.itemHandler=new ItemInteraction2DGrid(this,io,gameId, 40, true);
		this.mapHandler=new MapHandler2DGrid(this, io,gameId, TILESIZEWIDTH,TILESIZEHEIGHT);		
		
		this.gameState={
			players:[], 
			isRunning:false,
			host:this.gameHost,
			gameId:this.gameId,
			gameType:this.gameType,
			gameName:this.gameName,
			isPaused:false,
			cauldron:[],
			playerVotes:[],
			cauldronVotes:[],
			playerButtonPresses:[],
			recipe:[],
			votingTime:0,
			map:{id:0, name:"", grid:[[]]}
		};

		this.gameSettings = {
			map: "template",
			amountIngredients:5,
			amountRecipeReaders:1,
			amountCultists:1,
			votingTime:20,
			playTimer: 1200, //amount of seconds a game lasts max.
			playerDisplayWidth: 70, 
			playerDisplayHeight: 120,
			playerCollisionWidth: 30,
			playerCollisionHeight: 30, 
			updateTimer: 14, //25, 10 //5,50 or 18,15
			tileSizeW: TILESIZEWIDTH, tileSizeH: TILESIZEHEIGHT,
			ingredientSizeW: 40, ingredientSizeH: 42,
			toolSizeW: 54, toolSizeH: 54,
			playerHandsHeightModifier: 30
		};
		
		this.lastUpdateTime = (new Date()).getTime();
		this.resetGameVariables();	

		this.makeMapList();		
	}	
	
	
	//should be called each time you want a fresh game
	resetGameVariables(){
		this.gameState.isRunning= false;
		this.getMyGameRoom().isRunning= false;
		this.gameState.playerVotes=[];
		this.gameState.cauldronVotes=[];
		this.gameState.playerButtonPresses=[];
		this.gameState.cauldron=[];
		this.gameState.recipe=[];
		for (var i=0;i<this.gameState.players.length;i++){
			var currentPlayer=this.gameState.players[i];
			currentPlayer.direction={up: false, down: true, left: false, right: false};
			currentPlayer.hands={items:[],tool:NONE,progress:0,progressType:""};
			currentPlayer.movement = {left: false, right: false, up: false, down: false};
			currentPlayer.isRecipeReader=false;
		}				
		this.gameState.gameTimer=0;
	}
	

	
	defineServerListenersFor(socket){
		socket.on(this.gameType+"_startGame"+this.gameId, () => this.startGame() );
		socket.on(this.gameType+"_finishGame"+this.gameId, () => this.finishGame() );
		socket.on(this.gameType+"_requestGameState", socketId => this.giveGameStateToSocket(socketId) );
		socket.on(this.gameType+"_requestGameSettings"+this.gameId, socketId => this.giveGameSettingsToSocket(socketId) );
		socket.on(this.gameType+"_attemptPauseAction"+this.gameId, userId => this.attemptPauseAction(socket, userId));
		socket.on(this.gameType+"_requestIngredients"+this.gameId, socketId => this.giveIngredientsToSocket(socketId) );
		socket.on(this.gameType+"_requestTools"+this.gameId, socketId => this.giveToolsToSocket(socketId) );
		socket.on(this.gameType+"_requestTiles"+this.gameId, socketId => this.giveTilesToSocket(socketId) );
		socket.on(this.gameType+"_setMap"+this.gameId, id => this.setMap(id));
		socket.on(this.gameType+"_votePlayer"+this.gameId, (votingUserId, votedUserId) => this.votePlayer(votingUserId, votedUserId));
		socket.on(this.gameType+"_voteCauldron"+this.gameId, (votingUserId, wantsFlush) => this.voteCauldron(votingUserId, wantsFlush));
	}
	
	deleteListeners(){
		this.io.removeAllListeners([this.gameType+"_startGame"+this.gameId]);
		this.io.removeAllListeners([this.gameType+"_finishGame"+this.gameId]);
		this.io.removeAllListeners([this.gameType+"_requestGameState"]);
		this.io.removeAllListeners([this.gameType+"_requestGameSettings"+this.gameId]);
		this.io.removeAllListeners([this.gameType+"_attemptPauseAction"+this.gameId]);
		this.io.removeAllListeners([GAME_NAME+"_requestIngredients"]);
		this.io.removeAllListeners([GAME_NAME+"_requestTiles"]);
		this.io.removeAllListeners([GAME_NAME+"_requestTools"]);
		this.io.removeAllListeners([this.gameType+"_setMap"+this.gameId]);
		this.io.removeAllListeners([this.gameType+"_votePlayer"+this.gameId]);
		this.io.removeAllListeners([this.gameType+"_voteCauldron"+this.gameId]);
	}	
	
	deleteYourself(){
		this.stopGame();
		super.deleteYourself();
	}
	
	doOnIntermediateTimer(){
		this.itemHandler.updateDispensers();
		if(this.gameState.gameTimer>=this.gameSettings.playTimer){		
			this.endRound(0);
		}
	}
	
	doOnRunTimer(){
		if(this.gameState.gameTimer >=5){		
			var currentTime = (new Date()).getTime();
			var timeDifference = currentTime - this.lastUpdateTime;		
			var stepSizeModifier=timeDifference / (1000/this.gameSettings.updateTimer);
			this.movementHandler.movePlayers(stepSizeModifier);	
			this.lastUpdateTime = (new Date()).getTime();	
		}		
	}

	setMap(id){
		this.gameSettings.map = id;
		this.giveGameStates();
	}
	
	refreshQuickGameInfo(){	
		var reducedQuickGameState = [];
		reducedQuickGameState[0] = [];
		for (var i = 0; i < this.gameState.players.length; i++){		
			var currentUserId= this.gameState.players[i];
			var player = this.gameState.players[i];		
			if (player != null) {
				var x = Math.floor(player.x);
				var y = Math.floor(player.y);
				reducedQuickGameState[0][i] = 
				[
					x,
					y,
					player.userId, 
					[player.direction.up, player.direction.down, player.direction.left, player.direction.right],
					[player.hands.items, player.hands.tool, player.hands.progress, player.hands.progressType],
				];
			} else {
				reducedQuickGameState[0][i] = -1;
			}
		}
		reducedQuickGameState[1] = [];
		for (var i = 0; i < this.gameState.items.length; i++){
			var item = this.gameState.items[i];
			reducedQuickGameState[1][i] = 
			[
				item.x,
				item.y,
				item.items,
				item.tool,
				item.progress,
				item.progressType
			];
		}	
		this.io.to(this.gameId).emit(GAME_NAME+"_receiveQuickGameState",reducedQuickGameState);
	}
	
		

	refreshIntermediateGameInfo(){
		this.io.to(this.gameId).emit(this.gameType+"_receiveIntermediateGameState",{gameTimer:this.gameState.gameTimer, dispensers: this.gameState.dispensers,isPaused:this.gameState.isPaused});	
	}
	


	giveIngredientsToSocket(socketId){
		this.io.to(socketId).emit(GAME_NAME+"_receiveIngredients",AlchemoreResourceManager.ingredients);	
	}

	giveToolsToSocket(socketId){
		this.io.to(socketId).emit(GAME_NAME+"_receiveTools",AlchemoreResourceManager.tools);	
	}
	giveTilesToSocket(socketId){
		this.io.to(socketId).emit(GAME_NAME+"_receiveTiles",this.getTiles());	
	}

	refreshDispenserInfo(){
		var reducedDispensers = [];
		for (var i = 0; i < this.gameState.dispensers.length; i++){
			var dispenser = this.gameState.dispensers[i];
			reducedDispensers[i] = 
			[
				dispenser.x,
				dispenser.y,
				dispenser.tile,
				dispenser.charges,
				dispenser.secondsSinceLastCharged,
				dispenser.overCharge,
				dispenser.rate
			];
		}
		this.io.to(this.gameId).emit(GAME_NAME+"_receiveDispensers",reducedDispensers);
	}

	
	
	
	endRound(userId){
		if(userId>0){
			if(Tools.isElementInList(this.gameState.playerButtonPresses,userId,"")){
				console.log("Player "+userId+" tried to end round but has no charges left.");
				return;
			}
			else{
				this.gameState.playerButtonPresses.push(userId);
				console.log("Round ended by User "+userId);
			}
		}
		else{
			console.log("Round ended by timer ");			
		}
		
		if(this.gameState.players.length <= this.gameState.playerButtonPresses){
			console.log("last voting round! everyone already pressed the button once..");
		}
		
		var isCauldronOk=this.checkCauldron();
		console.log("Handed in cauldron: "+JSON.stringify(this.gameState.cauldron)+". Recipe: "+JSON.stringify(this.gameState.recipe)+". Cauldron "+(isCauldronOk?"":"not")+" ok!");
		if(isCauldronOk){
			this.endGame(1,true);
		}
		else{
			this.startVoting(userId);			
		}
				
		
	}
	
	checkCauldron(){
		var isOk=Tools.isListEqualIngoreOrder(this.gameState.cauldron, this.gameState.recipe, "");
		return isOk;
	
	}
	
	startVoting(userId){
		console.log("start voting!! "+userId);
		this.pauseGame();
		this.gameState.playerVotes=[];
		this.gameState.cauldronVotes=[];
		this.gameState.isVotingPhase=true;
		this.gameState.votingTime=this.gameSettings.votingTime;
		this.votingTimer=setInterval(() => {
			this.gameState.votingTime--;
			if(this.gameState.votingTime <=0){
				this.endVoting();
			}
		},1000);
		
		
		this.io.to(this.gameId).emit(GAME_NAME+"_votingStarted",userId, this.gameState.cauldron);
	}
	
	
	endGame(team, isWon){
		console.log("GAME ENDED. " + team + " "+isWon);
		this.stopGame();
		this.refreshQuickGameInfo();
		this.io.to(this.gameId).emit(GAME_NAME+"_endGame",team, isWon, this.gameState.cauldron, this.gameState.recipe);
	}
	
	endVoting(){
		clearInterval(this.votingTimer);	
		var userIdToKick=this.checkPlayerVotes();
		var isCauldronFlush=this.checkCauldronVotes();
		
		this.gameState.playerVotes=[];
		this.gameState.cauldronVotes=[];
		
		this.gameState.isVotingPhase=false;
		console.log("user ID to be kicked: "+userIdToKick +" (0 means no one is kicked)");
		console.log("ppl voted for cauldron flush? "+isCauldronFlush);
		console.log("TODO check if game is won or not, else start next round");
		
		if(isCauldronFlush){
			this.gameState.cauldron=[];
		}
		
		
		this.io.to(this.gameId).emit(GAME_NAME+"_votingEnded",userIdToKick,isCauldronFlush);
		this.pauseGame();//or well, unpause
		
		if(userIdToKick> 0 ){
			for(var i=0;i<this.gameState.players.length;i++){
				if(this.gameState.players[i].userId=userIdToKick){
					//team of kicked player loses...
					console.log("A Player got kicked. Game ends.. ");
					this.endGame(this.gameState.players[i].team,false);
				}
			}
			
		}
		else{
			if(this.gameState.players.length <= this.gameState.playerButtonPresses){
				console.log("This was the last voting round. if no one got voted out, end game! cultists win then.");
				this.endGame(1,false);
			}
		}
	}
	
	checkPlayerVotes(){
		var votes={};
		for(var i=0;i<this.gameState.players.length;i++){
			votes[this.gameState.players[i].userId]={userId:this.gameState.players[i].userId, votes:0};		
		}
		for(var i=0;i<this.gameState.playerVotes.length;i++){
			var votedId=this.gameState.playerVotes[i].voted;
			votes[votedId].votes=votes[votedId].votes+1;
		}
		console.log(JSON.stringify(votes)+" "+JSON.stringify(Object.values(votes)));
		var sortedVotes=Tools.sortList(Object.values(votes), "votes", false);
		if(sortedVotes.length <=0 || sortedVotes[0].votes <=0){
			return 0;
		}
		return sortedVotes[0].userId;
	}
	
	
	
	checkCauldronVotes(){
		var flushCounter=0;
		for(var i=0;i<this.gameState.cauldronVotes.length;i++){
			if(this.gameState.cauldronVotes[i].voted){
				flushCounter++;
			}
		}
		var isFlush=flushCounter>(this.gameState.players.length / 2);
		return isFlush;
	}
	
	
	
	
	votePlayer(votingUserId, votedUserId){
		console.log("player "+votingUserId+" voted "+votedUserId);
		var alreadyVoted=false;
		for(var i=0;i<this.gameState.playerVotes.length;i++){
				if(this.gameState.playerVotes[i].userId=votingUserId){
					alreadyVoted=true;
				}
		}
		if(!alreadyVoted&&this.gameState.isVotingPhase){
			this.gameState.playerVotes.push({userId:votingUserId, voted:votedUserId});
			this.io.to(this.gameId).emit(this.gameType+"_votesChanged",this.gameState.playerVotes, this.gameState.cauldronVotes);	
		}
		
		if(this.everyoneVoted()){
			this.endVoting();
		}
	}
	
	voteCauldron(votingUserId, wantsFlush){
		var alreadyVoted=false;
		for(var i=0;i<this.gameState.cauldronVotes.length;i++){
				if(this.gameState.cauldronVotes[i].userId=votingUserId){
					alreadyVoted=true;
				}
		}
		if(!alreadyVoted&& this.gameState.isVotingPhase){
			this.gameState.cauldronVotes.push({userId:votingUserId, voted:wantsFlush});
			this.io.to(this.gameId).emit(this.gameType+"_votesChanged",this.gameState.playerVotes, this.gameState.cauldronVotes);	
		}
		if(this.everyoneVoted()){
			this.endVoting();
		}
	}
	
	everyoneVoted(){
		var amountPlayers=this.gameState.players.length;
		var allPlayerVotes=this.gameState.playerVotes.length >=amountPlayers;
		var allCauldronVotes=this.gameState.cauldronVotes.length >=amountPlayers;
		return allPlayerVotes && allCauldronVotes;
	}

	getItemTransitions(){
		return AlchemoreResourceManager.transitions;
	}
	getTools(){
		return AlchemoreResourceManager.tools;
	}
	
	getTiles(){
		return AlchemoreResourceManager.tiles;
	}
	getIngredients(){
		return AlchemoreResourceManager.ingredients;
	}
	

//makes a list of information that the client can see in the browser to pick maps with
	makeMapList(){
		this.gameSettings.mapList=[];
		for(var mapname in AlchemoreResourceManager.maps){
			var newMap={
				name: AlchemoreResourceManager.maps[mapname].name, 
				teamsize: AlchemoreResourceManager.maps[mapname].teamsize, 
				id: mapname
			};
			this.gameSettings.mapList.push(newMap);
		}
	}
	


	
	handleComponentSignal(event){
		if(event.source==this.playerHandler){
			if(event.type=="leavePlayer"){
				//this.quickGameState.players[event.target] = null;
			}
			
			if (!this.gameState.isRunning) {
				this.giveGameStates();
			}
		}
		
		if(event.source==this.movementHandler){
			if(event.type=="playerMoved"){
				var userId=event.target;
				var myCookingTimer=this.itemHandler.getProcessingTimerOfPlayer(userId);
				if(myCookingTimer!= undefined && myCookingTimer.tile.progressType=="manual"){
					this.itemHandler.stopProcessingTimer(myCookingTimer);	
				}
			}	
		}
		

		if(event.source==this.itemHandler){
			console.log("Itemhandler event: "+event.type+" "+JSON.stringify(event.target));
			if(event.type=="playerDropItemStack"){
				var userId=event.target.userId;
				var stackInFrontOfPlayer=event.target.stackInFrontOfPlayer;
				var tileInFront=event.target.tileInFront;
				var toolFromPlayer=event.target.toolFromPlayer;
				var playerHadIngredients = event.target.playerHadIngredients;
				var coords=this.mapHandler.getGridCoordsAt(stackInFrontOfPlayer.x,stackInFrontOfPlayer.y);
				if(tileInFront.action=="submit"){
					this.checkItemSubmission(userId, stackInFrontOfPlayer,coords.x,coords.y); 
				} 		
					
			}
			
			if(event.type=="playerPickUpItemStack"){

			}		
			if(event.type=="useCustomTile"){
				var userId=event.target.userId;
				var tileInFront=event.target.tileInFront;
				var x=event.target.x;
				var y=event.target.y;
				console.log("useCustomTile: "+tileInFront+" "+x+" "+y);
				if(tileInFront.action=="stop"){
					this.endRound(userId); 
				} 				
			}	
			
			if(event.type=="dispenserUsed" || event.type=="dispenserCharge"){
				this.refreshDispenserInfo();
			}	
			
		}
	}

	checkItemSubmission(userId, itemStack,x,y){
		console.log("player "+userId+" submitted item: "+JSON.stringify(itemStack));
		var toolId=itemStack.tool;	
		var tool=Object.values(AlchemoreResourceManager.tools)[toolId];
		var toolName=NONE;
		if(tool!=undefined){
			toolName=tool.name;
		}
		this.gameState.cauldron.push(itemStack.tool);
		this.itemHandler.removeItemFromGround(itemStack);
		
		
	}
		
	attemptPauseAction(socket, userId){
		console.log("attemptPause "+userId+" "+this.gameHost);
		if(this.gameHost==userId){
			this.pauseGame();
		}
	}
	
	pauseGame(){
		console.log("Pause");
		if(!this.gameState.isPaused){
			console.log("pause it");
			this.gameState.isPaused=true;
			this.stopGameTimer();	
			this.refreshIntermediateGameInfo();		
		}	
		else{
			console.log("unpause it");
			this.gameState.isPaused=false;
			this.startGameTimer();	
		}	
		
	}

	
	initializeRoomNumbers(){
		
		this.gameState.map.room=Tools.createMatrix(this.gameState.map.grid[0].length, this.gameState.map.grid.length, 0);
		var currentRoomNumber=1;
		for(var y=0;y<this.gameState.map.grid.length;y++){
			for(var x=0;x<this.gameState.map.grid[y].length;x++){
				if(this.canFillWithRoomNumber(x,y)){		
					this.fillRoomNumberFor(x,y,currentRoomNumber);
					currentRoomNumber++;	
				}	
			}
		}	
	}
	
	fillRoomNumberFor(x,y, i){
		if(this.canFillWithRoomNumber(x,y)){
			this.gameState.map.room[y][x]=i;
			//check adjacent tiles:
			this.fillRoomNumberFor(x-1,y,i);
			this.fillRoomNumberFor(x+1,y,i);
			this.fillRoomNumberFor(x,y-1,i);
			this.fillRoomNumberFor(x,y+1,i);
		}	
	}
	
	canFillWithRoomNumber(x,y){
		var tileId=this.gameState.map.grid[y][x];
		var tile=Object.values(this.getTiles())[tileId];
		//console.log("xy: "+x+" "+y+" "+JSON.stringify(tile)+" "+tileId+" "+JSON.stringify(this.getTiles()));
		var isValidGridPos=(x>=0 && x <this.gameState.map.grid[0].length && y>=0 && y<this.gameState.map.grid.length);
		var isFillable=(this.gameState.map.room[y][x]==0 && tile.progressType!="wall");	
		return isValidGridPos && isFillable;			
	}
	
	
	generateNewRecipe(){
		this.gameState.recipe=[];
		for(var i=0;i<this.gameSettings.amountIngredients;i++){
			var randomIngredient=Tools.getRandomEntryFromList(Object.values(this.getTools()));
			console.log("randomIng "+randomIngredient);
			this.gameState.recipe.push(randomIngredient.id);
		}	

		console.log("generated random recipe: "+JSON.stringify(this.gameState.recipe)+" "+Object.values(this.getTools()));		
	}
	
	randomlySelectCultist(){
		while(this.playerHandler.getPlayersForTeam(2).length < this.gameSettings.amountCultists){	
		
			var randomPlayer=Tools.getRandomEntryFromList(this.gameState.players);console.log("not enough cultists "+ randomPlayer.userId);
			if(randomPlayer.team<2){
				console.log("joinemgme"+randomPlayer.userId+ " "+randomPlayer.team);
				this.playerHandler.joinGame(randomPlayer.userId,  2 ,randomPlayer.selectedCharacter);
			}
		}	
	}
	
	randomlySelectRecipeReader(){
		var readers=0;
		while(readers < this.gameSettings.amountRecipeReaders){	
			console.log("not enough readers");		
			var randomPlayer=Tools.getRandomEntryFromList(this.gameState.players);
			if(!randomPlayer.isRecipeReader){
				randomPlayer.isRecipeReader=true;
				readers++;
			}
		}
	}
	

	startGame(){
		for(var i=0;i<this.gameState.players.length;i++){
			this.gameState.players[i].movement={up: false, down: false, left: false, right: false};
			this.gameState.players[i].w=this.gameSettings.playerDisplayWidth;
			this.gameState.players[i].h=this.gameSettings.playerDisplayHeight;
			this.gameState.players[i].colW=this.gameSettings.playerCollisionWidth;
			this.gameState.players[i].colH=this.gameSettings.playerCollisionHeight;
		}	
		this.loadMapGrid(this.gameSettings.map);
		this.initializeRoomNumbers();
		console.log(JSON.stringify(this.gameState.map));
		
		this.resetGameVariables();
		this.generateNewRecipe();
		this.randomlySelectCultist();
		this.randomlySelectRecipeReader();
		this.lastUpdateTime = (new Date()).getTime();
		this.gameState.isRunning=true;
		this.gameState.isPaused=false;
		
		this.getMyGameRoom().isRunning=true;
		this.initiateGameTimer();
		this.refreshQuickGameInfo();	
		this.refreshIntermediateGameInfo();	 
		this.giveGameStates();		

		this.gameState.isPaused=false;
		

		this.refreshDispenserInfo();	
	}
	
	//actually deletes the game and makes it go back to lobby
	finishGame(){
		this.resetGameVariables();
		this.giveGameStates();
		this.giveGameSettings();
	}	
	
	//stops the current game and displays the end of game screen
	stopGame(){
		this.stopGameTimer();
		this.gameState.gameTimer = -1;
	}
	
	
	giveGameStates(){
		this.io.to(this.gameId).emit(this.gameType+"_receiveGameState",this.gameState, this.gameId);	
	}

	giveGameStateToSocket(socketId){
		console.log("someone asked for gamestate "+ socketId);
		this.io.to(socketId).emit(this.gameType+"_receiveGameState",this.gameState, this.gameId);	
	}

	giveGameSettingsToSocket(socketId){
		this.gameSettings.teams=this.playerHandler.teams;
		this.io.to(socketId).emit(this.gameType+"_receiveGameSettings",this.gameSettings);	
	}

	giveGameSettings(){
		this.io.to(this.gameId).emit(this.gameType+"_receiveGameSettings",this.gameSettings);		
	}



	

	
	loadMapGrid(mapName){
		console.log("Loading map "+mapName);
		this.gameState.map={};
		this.gameState.map.name=mapName;
		this.gameState.map.grid=AlchemoreResourceManager.maps[mapName].grid;
		this.gameState.items=JSON.parse(JSON.stringify(AlchemoreResourceManager.maps[mapName].items));
		
		for (var i = 0; i < this.gameState.items.length; i ++) {
			var x = this.gameState.items[i].x * this.mapHandler.tileSizeW + this.mapHandler.tileSizeW/2;
			var y = this.gameState.items[i].y * this.mapHandler.tileSizeH + this.mapHandler.tileSizeH/2;
			if (this.mapHandler.getTileAtPoint(x,y).isBlocking) {
				y = y - this.mapHandler.tileSizeH/3;
			}
			this.gameState.items[i].x = Math.floor(x);
			this.gameState.items[i].y = Math.floor(y);
		}
		
		this.gameState.dispensers=[];
		for(var y=0; y < this.gameState.map.grid.length;y++){
			for(var x=0; x<this.gameState.map.grid[y].length;x++){
				var tileId=this.gameState.map.grid[y][x];
				var currentTile=Object.values(this.getTiles())[tileId];
				if(currentTile.action=="dispenser"){
					var dispenserObject={x: x ,y:y , tile: tileId, charges: currentTile.charges, secondsSinceLastCharged: 0,overCharge:0, rate: currentTile.dispenserRate};
					this.gameState.dispensers.push(dispenserObject);		
				}
			}
		}	
		for(var i=0;i< this.gameState.players.length;i++){
			var currentPlayer=this.gameState.players[i];
			for(var j=0;j<AlchemoreResourceManager.maps[mapName].startingPositions.length;j++){	
				var currentPos=AlchemoreResourceManager.maps[mapName].startingPositions[j];
				if(currentPos.userId==undefined && currentPlayer.x==undefined && (currentPos.team==currentPlayer.team || this.playerHandler.teams == 2)){//todo check player's team number instead
					var pos=this.mapHandler.getStartingPosForPlayerAtCoords(currentPos.x,currentPos.y);				
					currentPlayer.x=pos.x;
					currentPlayer.y=pos.y;
					currentPos.userId=currentPlayer.userId;
				}
			}
		}	
	}

	

	startGameTimer(){
	
		this.gameTimeTimer=setInterval(() => {
			this.gameState.gameTimer++;
			this.doOnIntermediateTimer();
			this.refreshIntermediateGameInfo();
		},1000);
		
		this.runTimer=setInterval(() => {
			if(this.gameState.isRunning && !this.gameState.isPaused && this.gameState.gameTimer >= 5){
				this.doOnRunTimer();
				this.refreshQuickGameInfo();
				
			}	
		}, (1000/this.gameSettings.updateTimer) );	
		
	}
	
	initiateGameTimer(){
		this.gameState.gameTimer=0;
		this.startGameTimer();		
	}
	
	stopGameTimer(){
		clearInterval(this.runTimer);	
		clearInterval(this.gameTimeTimer);
		
		clearInterval(this.votingTimer);	
	}



/**
STATIC PART
**/

	static initialize(){
		AlchemoreResourceManager.initialize();
		CharacterLoader2DGrid.initialize();
	}

}

module.exports = AlchemoreGameController;
     
})(typeof exports === 'undefined'?  
            window: exports); 