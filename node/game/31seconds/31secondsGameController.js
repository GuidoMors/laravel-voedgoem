(function(exports) { 

var CommonGameController=require("./../common/CommonGameController.js");
var Tools = require('./../../static/common/tools.js');	
var fs = require("fs");

var GAME_NAME="31seconds";
var WORDS_FOLDER_NAME="node/game/"+GAME_NAME+"/resources/words/";

//minimum and maximum words used from a library text file
var MAXWORDS = 15;
var MINWORDS = 5;

var team_names=["grey", "yellow", "blue"];
var PLAYERSTATS_FILE_NAME="node/game/"+GAME_NAME+"/resources/playerstats.json";
var EMPTY_PLAYER_STATS = {
	myTotalGames:0, 
	myTotalWins:0, 
	myTotalLosses:0, 
	myTeamCaptainGames:0, 
	myTeamCaptainWins:0, 
	myTeamCaptainLosses:0, 
	myExplainRate:0, 
	myCardsExplained:0
};

class SecondsGameController extends CommonGameController{

	/**
	CONSTRUCTOR
	**/
	constructor(gameId, host, gameName, ioo, server) {  
		super(GAME_NAME, gameId, host, gameName, ioo, server);	

		this.gameState = {
				drafting: false, 
				aftergame: false,
				running: false,
				isRunning: false,
				currentWords: [],
				teams: [],
				turn: {
					teamNr: 0,
					phase: 0,
					turnIndex: [],
				},
				timeLeft: 0,
				players: [],
				suddenDeath: false,
		};

		this.wordList = [];
		this.lastWordIndex = 0;
		this.gameTimer,

		this.gameSettings = {
				timeLimit: 31, 
				turnSize: 7,
				winningScore: 31,
				teams: "2", 
		}; 
			
		this.initTeams();
	}	

	//initializes the team values
	initTeams(){
		this.gameState.teams = [];
		for(var i=0;i<=this.gameSettings.teams;i++){
			this.gameState.teams[i] = {name: team_names[i], playerIds: [], score: 0, teamCaptainId: null};
		}
		for(var i=0;i<this.gameState.players.length;i++){
			  this.gameState.teams[0].playerIds[i] = this.gameState.players[i].userId;
		}

		this.refreshGameInfo();
	}

	//sends all data to all sockets of this game
	refreshGameInfo(){
		this.io.to(this.gameId).emit(this.gameType+"_adminUser",this.getAdmin());
		this.io.to(this.gameId).emit(this.gameType+"_gameState", this.gameState);
		this.io.to(this.gameId).emit(this.gameType+"_gameSettings", this.gameSettings);
	}

	/**
	LISTENERS
	**/

	defineServerListenersFor(socket){
		socket.on(this.gameType+"_requestGameInfo"+this.gameId, () => this.refreshGameInfo());
		//quit Game cancels the current game without calculating scores. It is like an abort button that can be pressed at any time
		socket.on(this.gameType+"_quitGame"+this.gameId, (userId) => this.quitGame(userId));
		socket.on(this.gameType+"_draftPlayer"+this.gameId, (teamNr, userId) => this.draftPlayer(teamNr, userId));
		socket.on(this.gameType+"_startGame"+this.gameId, () => this.startGame());
		socket.on(this.gameType+"_requestCard"+this.gameId, (userId) => this.requestCard(userId));
		socket.on(this.gameType+"_completeCard"+this.gameId, (userId) => this.completeCard(userId));
		socket.on(this.gameType+"_receiveScore"+this.gameId, (score) => this.receiveScore(score));
		socket.on(this.gameType+"_giveTime"+this.gameId, (score) => this.giveTime());
		//end game properly ends the game and calculates scores. It is the way the game is normally ended
		socket.on(this.gameType+"_endGame"+this.gameId, (score) => this.endGame(score));

		//artifact
		//socket.on(this.gameType+"_migrateScoreFromCookie"+this.gameId, (userId, myPlayerStats) => this.migrateScoreFromCookie(userId, myPlayerStats));
	}
	
	deleteListeners(){
		this.io.removeAllListeners([this.gameType+"_refreshGameInfo"+this.gameId]);
		this.io.removeAllListeners([this.gameType+"_quitGame"+this.gameId]);
		this.io.removeAllListeners([this.gameType+"_draftPlayer"+this.gameId]);
		this.io.removeAllListeners([this.gameType+"_startGame"+this.gameId]);		
		this.io.removeAllListeners([this.gameType+"_requestCard"+this.gameId]);	
		this.io.removeAllListeners([this.gameType+"_completeCard"+this.gameId]);	
		this.io.removeAllListeners([this.gameType+"_receiveScore"+this.gameId]);	
		this.io.removeAllListeners([this.gameType+"_giveTime"+this.gameId]);
		this.io.removeAllListeners([this.gameType+"_endGame"+this.gameId]);

		//artifact
		//this.io.removeAllListeners([this.gameType+"_migrateScoreFromCookie"+this.gameId]);
	}

	/**
	THE MAIN LISTENER FUNCTIONS
	**/

	quitGame(userId){
		this.stopGameTimer();
		this.log("Game ended.");

		this.gameState.running = false;
		this.gameState.isRunning = false;
		this.gameState.aftergame = false;
		this.gameState.drafting = false;
		this.gameState.turn.teamNr = 0;
		this.gameState.turn.phase = 0;
		this.gameState.turn.userId = null;
		this.gameState.turn.turnIndex = [];

		var message = "<span style='color: purple'>Game has been aborted by {0}.</span>";
		this.pushMessage(message,[this.server.getUserNameByUserId(userId)]);

		this.dumpTeams();
		this.refreshGameInfo();	
	}

	startGame(){
		if (!this.gameState.running && !this.gameState.drafting) {
			this.startDraft();
		} else {
			this.log("Game started.");

			this.gameState.aftergame = false;
			this.gameState.drafting = false;
			this.gameState.running = true;
			this.gameState.isRunning = true;
	
	
			this.gameState.turn.teamNr = 1;
			this.gameState.turn.phase = 0;
			this.gameState.turn.userId = null;
			for(var i=0;i<this.gameState.teams.length;i++){
				this.gameState.turn.turnIndex[i] = 0;
				this.gameState.teams[i].score = 0;
			}
	
			var message="<span style='color: purple'>Game has started.</span>";
			this.pushMessage(message,[]);	
	
			this.gameState.currentWords = [];
			this.wordList = this.generateWordList();
			this.lastWordIndex = 0;
	
			this.refreshGameInfo();
		}
	}

	startDraft(){
		this.log("Drafting started.");

		this.setTeamCaptains();

		this.gameState.aftergame = false;
		this.gameState.drafting = true;
		this.gameState.running = false;
		this.gameState.isRunning = false;

		this.gameState.turn.teamNr = 1;
		this.gameState.turn.phase = 0;
		this.gameState.turn.userId = null;
		this.gameState.turn.turnIndex = [];
		
		var message = "<span style='color: purple'>Drafting has started.</span>";
		this.pushMessage(message,[ ]);	

		this.refreshGameInfo();
	}

	setTeamCaptains(){
		for (var i = 1;i<this.gameState.teams.length;i++) {
			if (this.gameState.teams[i].playerIds.length >= 1) {
				var teamCaptainId = this.getRandomPlayerIdFromTeam(i);
				this.dumpTeam(i);
				if (teamCaptainId != null){
					this.joinTeam(teamCaptainId, i);
				}
			} else if (this.gameState.teams[i].playerIds.length == 0) {
				var teamCaptainId = this.randomlySelectObserverForTeam(i);
				if (teamCaptainId != null){
					this.playerHandler.joinGame(teamCaptainId, i, false);
				}
			}
			this.gameState.teams[i].teamCaptainId = teamCaptainId;
		}
	}

	draftPlayer(teamNr, userId) {
		if (this.gameState.teams[0].playerIds.includes(userId)) {
			this.playerHandler.changeTeam(userId, teamNr);
			
			var message="<span style='color:{0}'> Team {1} has drafted {2}. </span>";
			this.pushMessage(message,[team_names[this.gameState.turn.teamNr],team_names[this.gameState.turn.teamNr], this.server.getUserNameByUserId(userId) ]);	

			this.gameState.turn.phase = 0;
			this.gameState.turn.teamNr++;
			if (this.gameState.turn.teamNr >= this.gameState.teams.length){
				this.gameState.turn.teamNr = 1;
			}

			this.refreshGameInfo();
		}	  
	}

	requestCard(userId){
		if (this.gameState.turn.phase != 0){
			return;
		}

		this.gameState.currentWords = [];

		for (var i = 0; i < this.gameSettings.turnSize; i++) {
			this.lastWordIndex++;
			if (this.lastWordIndex >= this.wordList.length){
				this.wordList = this.generateWordList();
				this.lastWordIndex = 0;
			}
			this.gameState.currentWords.push(this.wordList[this.lastWordIndex]);
		}

		this.gameState.turn.phase = 1;
		this.gameState.turn.userId = userId;

		this.startGameTimer();
		this.refreshGameInfo();
	}

	startGameTimer(){
		this.gameState.timeLeft = this.gameSettings.timeLimit;

		this.gameTimer = setInterval(() => {	
			this.gameState.timeLeft--;
			if (this.gameState.timeLeft <= 0){
				this.completeCard(this.gameState.turn.turnIndex[this.gameState.turn.teamNr]);
			} else {
				this.refreshGameInfo();
			}
		}, 1000);	
	}

	completeCard(userId){
		if (this.gameState.turn.phase != 1){
			return;
		}
		this.gameState.turn.userId = userId;
		this.gameState.turn.phase = 2;

		if (this.gameTimer) {
			this.stopGameTimer();
		}

		this.refreshGameInfo();
	}

	receiveScore(score){
		if (this.gameState.turn.phase != 2){
			return;
		}

		for(var i = 0; i < this.gameState.players.length; i ++){
			if (this.gameState.players[i].userId == this.gameState.turn.userId){
				if (!this.gameState.players[i].playerStats || this.gameState.players[i].playerStats == undefined || this.gameState.players[i].playerStats == null){
					this.gameState.players[i].playerStats = JSON.parse(JSON.stringify(EMPTY_PLAYER_STATS));;
				} 
				var explainRate = this.gameState.players[i].playerStats.myExplainRate;
				var cardsExplained = this.gameState.players[i].playerStats.myCardsExplained;
				this.gameState.players[i].playerStats.myExplainRate = ((explainRate*cardsExplained) + score) / (cardsExplained + 1);
				this.gameState.players[i].playerStats.myCardsExplained++;
			}
		}

		var message="<span style='color:{0}'> Team {1} has been given a score of {2}. </span>";
		this.pushMessage(message,[team_names[this.gameState.turn.teamNr],team_names[this.gameState.turn.teamNr], score ]);	

		var currentTurnTeamNr = this.gameState.turn.teamNr;

		this.gameState.turn.turnIndex[this.gameState.turn.teamNr]++;
		if (this.gameState.turn.turnIndex[currentTurnTeamNr] >= this.gameState.teams[currentTurnTeamNr].playerIds.length){
			this.gameState.turn.turnIndex[currentTurnTeamNr] = 0;
		}

		this.gameState.teams[currentTurnTeamNr].score = this.gameState.teams[currentTurnTeamNr].score + score;

		if (!this.gameState.suddenDeath){
			if (this.gameState.teams[currentTurnTeamNr].score >= this.gameSettings.winningScore){
				//Sudden Death attempts to declare a winner each time a full round has passed after the winning score
				this.gameState.suddenDeath = this.getPreviousTurnNr();
			}
		} else {
			if (currentTurnTeamNr == this.gameState.suddenDeath ){
				var winningTeamNr = this.gameHasWinner();
				if (winningTeamNr){
					this.declareWinner(winningTeamNr);
					return;
				}
			}

		}
		
		this.gameState.turn.phase = 0;
		this.gameState.turn.teamNr = this.getNextTurnNr();
		this.refreshGameInfo();

	}

	gameHasWinner() {
		var highestScore = -Infinity;
		var winningTeamNr = -1;
		var isTie = false;
		var teams = this.gameState.teams;
	  
		for (let i = 0; i < teams.length; i++) {
		  if (teams[i].score > highestScore) {
			highestScore = teams[i].score;
			winningTeamNr = i;
			isTie = false;
		  } else if (teams[i].score === highestScore) {
			isTie = true;
		  }
		}
	  
		return isTie ? false : winningTeamNr;
	}

	getNextTurnNr(){
		if (this.gameState.turn.teamNr >= (this.gameState.teams.length-1)){
			return 1;
		} else {
			return this.gameState.turn.teamNr + 1;
		}
	}

	getPreviousTurnNr(){
		if (this.gameState.turn.teamNr <= 1){
			return this.gameState.teams.length - 1;
		} else {
			return this.gameState.turn.teamNr - 1;
		}
	}

	giveTime(){
		if (this.gameState.timeLeft > 0){
			this.gameState.timeLeft += 5;
		}
		this.refreshGameInfo();
	}

	declareWinner(winningTeamNr){
		if (this.gameState.aftergame){ return; }

		this.log("Team "+ winningTeamNr +" has won.");

		//store stats
		for(var i=0;i<this.gameState.players.length;i++){
			this.updatePersonalScoreForUserId(this.gameState.players[i].userId, winningTeamNr);
		}
		this.storePlayerStatsInFile(); 
		
		this.gameState.aftergame = true;
		this.gameState.drafting = false;
		this.gameState.running = true;
		this.gameState.isRunning = true;

		this.gameState.turn.teamNr = 0;
		this.gameState.turn.phase = 0;
		
		var message="<span style='color:{0} '>Team {1} has won.</span>";
		this.pushMessage(message,[team_names[winningTeamNr],  team_names[winningTeamNr] ]);

		this.refreshGameInfo();
		this.io.to(this.gameId).emit(this.gameType+"_playerStatsChanged");
	}

	endGame(){
		this.log("Game ended.");

		this.gameState.aftergame = false;
		this.gameState.drafting = false;
		this.gameState.running = false;
		this.gameState.isRunning = false;

		this.gameState.turn.teamNr = 0;
		this.gameState.turn.phase = 0;
		this.gameState.turn.userId = null;

		var message="<span style='color: purple'>Game has ended.</span>";
		this.pushMessage(message,[]);	

		this.gameState.currentWords = [];
		this.lastWordIndex = 0;

		this.dumpTeams();

		this.refreshGameInfo();
	}

	// artifact
	// migrateScoreFromCookie(userId, myPlayerStats){
	// 	for(var i=0;i<this.gameState.players.length;i++){
	// 		var currentPlayer=this.gameState.players[i];
	// 		if(currentPlayer.userId==userId){
	// 			if(currentPlayer.playerStats.myTotalGames==0){ //if new playerStats
	// 				currentPlayer.playerStats = myPlayerStats;
	// 				this.storePlayerStatsInFile();
	// 				this.refreshGameInfo();
	// 			}
	// 		}
			
	// 	}
	// }

	/** 
	 MAIN UTIL FUNCTIONS
	**/

	//grabs 5000 thousand random words from the files and turns them in a randomized list
	generateWordList(){
		var list = [];
		var numberlist = [];
		for (var i = 0; i < SecondsGameController.wordlibraries.length; i++) {
			numberlist[i] = i;
		}
		numberlist = Tools.scrambleList(numberlist);
		var count = 0;
		var counttwo = 0;
		
		while (count < 1000) {
			var text = fs.readFileSync(SecondsGameController.wordlibraries[numberlist[counttwo]], "utf-8");
			var textByLine = text.split("\n")
			textByLine = Tools.scrambleList(textByLine);
			var random = Math.floor(Math.random()*(MAXWORDS-MINWORDS))+MINWORDS;
			for (var j = 0; j < random; j++) {
				if (count < 1000) {
					if (textByLine[j] !== undefined){
						textByLine[j] = textByLine[j].toUpperCase(); 
						textByLine[j] = textByLine[j].trim();
						if(textByLine[j] !== null && textByLine[j] !== "" ){
							list[count] = textByLine[j];
							count++;
						}
					}
				}
			}	
			counttwo++;
			if (counttwo >= numberlist.length){
				counttwo = 0;
			}
		}
		list = Tools.scrambleList(list);
		return list;
	}


	updatePersonalScoreForUserId(userId, winningTeamNr){
		for(var i = 0; i < this.gameState.players.length; i++){
			if (this.gameState.players[i].userId == userId){
				var myTeamNr = this.getTeamByUserId(userId);	
				if(myTeamNr>0){
					var iWon = (myTeamNr == winningTeamNr);
					if (this.gameState.players[i].playerStats){
						var myPersonalScore = this.gameState.players[i].playerStats;
						if (myPersonalScore){
							myPersonalScore.myTotalGames++;
		
							if(iWon){
								myPersonalScore.myTotalWins++;
							}else{
								myPersonalScore.myTotalLosses++;
							}
		
							if (this.isUserIdTeamCaptain(userId)){
								myPersonalScore.myTeamCaptainGames++;
								if(iWon){
									myPersonalScore.myTeamCaptainWins++;
								}else{
									myPersonalScore.myTeamCaptainLosses++;
								}	
							}
							this.gameState.players[i].playerStats = myPersonalScore;
						}
					}
				}
			}
		}
	}

	handleGameRoomChange(event){
		var userId=event.target;
		if(event.type=="joinGameRoom"){	
			var myStats=this.getPlayerStatsFromFile(userId);
			this.gameState.players[this.gameState.players.length] = {userId: userId, playerStats:myStats, team:0};
			this.gameState.teams[0].playerIds.push(userId);
      
			this.io.to(this.gameId).emit(this.gameType+"_adminUser",this.getAdmin());

			if (!this.inTeam(userId)){
				this.playerHandler.joinGame(userId, 0, false);
			}			
		}
		if(event.type=="leaveGameRoom"){
			if (!this.gameState.running) {
				this.leaveGameState(userId);  
			} else {
			  for (var i = 0; i<this.gameState.players.length;i++){
				if (this.getTeamByUserId(userId) == 0){
					this.leaveObservers(userId);
				} 
			  }
			}
		}
		this.refreshGameInfo();
	}	

	handleComponentSignal(event){
		if(event.source==this.playerHandler){
			if(event.type=="joinPlayer" || event.type=="changeTeam"){
				var player = this.playerHandler.getPlayerByUserId(event.target);
				this.joinTeam(player.userId, player.team); 
			}
			this.refreshGameInfo();
		}		
	}

	/** 
	 HELPER FUNCTIONS
	**/

	stopGameTimer(){
		clearInterval(this.gameTimer);	
		this.gameTimer = null;
	}	

	getAdmin(){
		return this.gameHost;
	}

	joinTeam(userId, teamNr){
		if(userId!=undefined){
			this.leaveTeams(userId);
			this.gameState.teams[teamNr].playerIds.push(userId);
		}	
	}
	
	leaveTeams(userId){
		userId = parseInt(userId);
		for(var j=0;j<this.gameState.teams.length;j++){
			this.gameState.teams[j].playerIds = this.gameState.teams[j].playerIds.filter(function(e) {
				return e !== userId
			});
	  	}
	}

	leaveGameState(userId){
		userId = parseInt(userId);
		this.leaveTeams(userId);
		this.gameState.players = this.gameState.players.filter(function(e) {
			return e.userId !== userId
		});
	}

	getTeamByUserId(userId){
		var teamNr=0;
		for(var i=0;i<this.gameState.teams.length;i++){
			if(this.gameState.teams[i].playerIds.indexOf(userId)>=0){
				teamNr=i;
			}
		}
		return teamNr;
	}

	isUserIdTeamCaptain(userId){
		for(var i=0;i<this.gameState.teams.length;i++){
			if (this.gameState.teams[i].teamCaptainId == userId){
				return true;
			}
		}
		return false;
	}

	getRandomPlayerIdFromTeam(teamNr){
		var randomPlayerNumber = Math.floor(Math.random()*this.gameState.teams[teamNr].playerIds.length);
		if (this.gameState.teams[teamNr].playerIds[randomPlayerNumber] == undefined){
			return null;
		}
		return this.gameState.teams[teamNr].playerIds[randomPlayerNumber];
	}

	randomlySelectObserverForTeam(team){
		var randomPlayer=this.getRandomPlayerIdFromTeam(0);
		return randomPlayer;
	}

	inTeam(userId){
		for(var i=0;i<this.gameState.teams.length;i++){
			for (var j=0;j<this.gameState.teams[i].playerIds.length;j++) {
				if (this.gameState.teams[i].playerIds[j] == userId) {
				return true;
				}
			}
		}
		return false;
	}

	dumpTeams(){
		for(var i=1;i<this.gameState.teams.length;i++){
			this.dumpTeam(i);
		}		
	}

	dumpTeam(team){
		for (var i=0;i<this.gameState.teams[team].playerIds.length;i++) {
			var teamPlayerId = this.gameState.teams[team].playerIds[i];
			for (var j=0; j<this.gameState.players.length;j++){
				if (teamPlayerId == this.gameState.players[j].userId) {
					var player = this.gameState.players[j];
					if (player.team == team){
						this.playerHandler.joinGame(player.userId, 0, false);
					}
				}
			}
		}	
		this.gameState.teams[team].playerIds=[];
		this.gameState.teams[team].teamCaptain=null;
	}

	getPlayerStatsFromFile(userId){
		var playerScoresFile=fs.readFileSync(PLAYERSTATS_FILE_NAME);
		var playerScoresFromFile=JSON.parse(playerScoresFile);
		for(var i=0;i< playerScoresFromFile.length;i++){
			if(playerScoresFromFile[i].userId==userId){
				return playerScoresFromFile[i].playerStats;
			}
		}
		var newStats = JSON.parse(JSON.stringify(EMPTY_PLAYER_STATS));;
		return newStats;
	}
	
	storePlayerStatsInFile(){
		var playerScoresFile=fs.readFileSync(PLAYERSTATS_FILE_NAME);
		var playerScoresFromFile=JSON.parse(playerScoresFile);
		
		for(var i=0;i<this.gameState.players.length;i++){
			var currentPlayer=this.gameState.players[i];
			playerScoresFromFile=this.putPlayerStatsInList(playerScoresFromFile, currentPlayer);
		}
		fs.writeFile(PLAYERSTATS_FILE_NAME, JSON.stringify(playerScoresFromFile, null, '\t'), function (err) {
			if (err) return console.log("storePlayerStatsInFile error: "+err);
		});
	}
	
	putPlayerStatsInList(playerScoresList, player){
		var found=false;
		for(var i=0;i<playerScoresList.length;i++){
			if(playerScoresList[i].userId==player.userId){
				playerScoresList[i].playerStats=player.playerStats;
				found=true;
			}
		}
		if(!found){
			playerScoresList.push({userId: player.userId, playerStats: player.playerStats});
		}
		return playerScoresList;
		
	}

	pushMessage(message, args){
		this.server.pushLogMessage( message, args, false,false, this.gameId);
	}
	
	/**
	STATIC
	**/
	
	static initialize(){
		SecondsGameController.initWordLibraries();			
	}	
	
	static initWordLibraries(){	
		SecondsGameController.wordlibraries = fs.readdirSync(WORDS_FOLDER_NAME);
		for (var i=0; i < SecondsGameController.wordlibraries.length; i++) {
			SecondsGameController.wordlibraries[i] = WORDS_FOLDER_NAME + SecondsGameController.wordlibraries[i];
		}
	}

}

module.exports = SecondsGameController;
     
})(typeof exports === 'undefined'?  
            window: exports); 