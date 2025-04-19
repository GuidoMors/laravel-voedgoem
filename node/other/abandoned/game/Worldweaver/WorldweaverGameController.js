(function(exports) { 

var CommonGameController=require("./../common/CommonGameController.js");
var Tools = require('./../../static/common/tools.js');	
var fs = require("fs");

var HandleFactions = require('./../../static/Worldweaver/worldweaverFactions.js');

var GAME_NAME="Worldweaver";
var NONE="none";
var OBSERVER_FACTION = HandleFactions.getObserverfaction();
var LUMON = HandleFactions.getLumon();

var resources = ["choice","food", "lumber", "stone","gold","tradegoods","gear","mana","relic"];

class WorldweaverGameController extends CommonGameController{

	//construct a new worldweaver game
	constructor(gameId, host, gameName, io, server) {  
		super(GAME_NAME, gameId, host, gameName, io, server,  true);
		
		this.gameState={
			players:[], 
			isRunning:false,
			host:this.gameHost,
			gameId:this.gameId,
			gameType:this.gameType,
			gameName:this.gameName,
		};

	}
	
	//stuff that has to run upon initalizing the worldweaver genre (aka setting up a resource manager once)
	static initialize(){

	}

	freshVariables(){
		
	}

	handleGameRoomChange(event){	
		if (event.type =="joinGameRoom") {
			var player = {
				username: this.server.getUserNameByUserId(event.target),
				userId: event.target,
				court: ["","","","","","","","","","","","","","","","","","","","","","","",""],
				faction: OBSERVER_FACTION,
				citypoints: 0,
				resources: {
				  choice: 0,
				  food: 0,
				  lumber: 0,
				  stone: 0,
				  gold: 0,
				  tradegoods: 0,
				  gear: 0,
				  mana: 0,
				  relic: 0,
				  influence: 0
				},
				action: 0,
				honor: 0,
				age: 0,
				cards: [],
				treaties: [],
			  };
			  this.gameState.players.push(player);

		}
	}	

	defineServerListenersFor(socket){
		socket.on(this.gameType+"_startGame"+this.gameId, () => this.startGame() );
		socket.on(this.gameType+"_finishGame"+this.gameId, () => this.finishGame() );
		socket.on(this.gameType+"_requestGameState", (socketId) => this.giveGameStateToSocket(socketId) );
		socket.on(this.gameType+"_changeFactions", (faction, userId)=> this.changeFaction(faction, userId) );
		socket.on(this.gameType+"_changeCourt", (character, slot, userId) => this.changeCourt(character, slot, userId) );
	}

	deleteListeners(){
		this.io.removeAllListeners([this.gameType+"_startGame"+this.gameId]);
		this.io.removeAllListeners([this.gameType+"_finishGame"+this.gameId]);
		this.io.removeAllListeners([this.gameType+"_requestGameState"]);
		this.io.removeAllListeners([this.gameType+"_changeFactions"]);
		this.io.removeAllListeners([this.gameType+"_changeCourt"]);
	}	
	
	deleteYourself(){
		super.deleteYourself();
	}

	giveGameStates(){
		this.io.to(this.gameId).emit(this.gameType+"_receiveGameState",this.gameState, this.gameId);	
	}

	giveGameStateToSocket(socketId){
		this.io.to(socketId).emit(this.gameType+"_receiveGameState",this.gameState, this.gameId);	
	}

	//puts a game from lobby in the playing
	startGame(){
		this.giveGameStates();		
	}

	//puts a game from playing into lobby
	finishGame(){
		this.freshVariables();
		this.giveGameStates();
	}

	changeFaction(faction, userId){
		for(var i=0;i<this.gameState.players.length;i++){
			if(this.gameState.players[i].userId == userId) {
				this.gameState.players[i].faction = faction;
				this.gameState.players[i].court = ["","","","","","","","","","","","","","","","","","","","","","","",""];
				if (faction.name == "Pride of Lumon") {
					this.gameState.players[i].court[0] = LUMON;
				}
			}
		}
		this.giveGameStates();	
	}

	changeCourt(character, slot, userId){
		for(var i=0;i<this.gameState.players.length;i++){
			if(this.gameState.players[i].userId == userId) {
				this.gameState.players[i].court[slot] = character;
			}
		}
		this.giveGameStates();	
	}

}

module.exports = WorldweaverGameController;
     
})(typeof exports === 'undefined'?  
            window: exports); 