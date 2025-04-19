(function(exports) { 

var CommonGameController=require("./../common/CommonGameController.js");
var Tools = require('./../../static/common/tools.js');	
var fs = require("fs");

var GAME_NAME="Woerdgoem";
var WORDS_FOLDER_NAME="node/game/"+GAME_NAME+"/resources/words/";
var NONE="none";

//minimum and maximum words used from a library text file
var MAXWORDS = 5;
var MINWORDS = 2;
var team_names=["grey", "red", "blue", "green"];
var PLAYERSTATS_FILE_NAME="node/game/"+GAME_NAME+"/resources/playerstats.json";


class WoerdgoemGameController extends CommonGameController{
	constructor(gameId, host, gameName, ioo, server) {  
		super(GAME_NAME, gameId, host, gameName, ioo, server);	
	
		this.userIdClickedBlackCard="";
		this.specialHints=[]; 
		//players
		this.gameState={players:[]};
		//running is true when spymasters are drafting their teams
		this.drafting = false;
		//aftergame is true when the currently running game has ended but the players have not yet returned to the lobby and false otherwise
		this.aftergame = false;
		this.taps=[];
		this.teams=[];
		this.turn = {teamNr: 0, spymaster: true};
		this.abilityList = [];
		this.timeHalver = 0;
		//team that clicked the black card
		this.blackTeam = 0;
		this.usedWords=[];
		this.amountClicks=0;
		this.lastHint;
		this.teamTime =[0,0,0];
		this.gameSettings={
					timeLimit:120, 
					boardSize: 32,
					teams: "2", 
					specials: 3, 
					operativeCharges: 3,
					turnsUntilBlankReveal: 5,
			}; 
		this.board = {
			  boardSize: 0,
			  card: []
			};
			
		this.initTeams();
	}	

	startGameRequested(){
		this.userIdClickedBlackCard="";
		var teamsfilled = false;
		for (var i = 1;i<this.teams.length;i++) {
			if (this.teams[i].players.length !== 0) {
				teamsfilled = true;
			}
		}
		var spymastersFilled = false;
		for (var i = 1;i<this.teams.length;i++) {
			if (this.teams[i].spymasters.length !== 0) {
				spymastersFilled = true;
			}
		}
		if (teamsfilled || this.drafting) {
			this.startGame();
		} 
		else {
			if(spymastersFilled){
				this.startDraft();
			}
			else{
				this.randomlySelectSpyMasters(); 
			}
		}	
	}
	
	joinTeam(userId, teamNr, spymaster){
		if(userId!=undefined){
			this.leaveTeams(userId);
			if(spymaster){
				this.teams[teamNr].spymasters[this.teams[teamNr].spymasters.length]=userId;
			}
			else{	
				this.teams[teamNr].players[this.teams[teamNr].players.length]=userId;
			}
		}	
	}
	
	leaveTeams(userId){
		userId = parseInt(userId);
		for(var j=0;j<this.teams.length;j++){
			this.teams[j].players=this.teams[j].players.filter(function(e) {
				return e !== userId
			});
			this.teams[j].spymasters=this.teams[j].spymasters.filter(function(e) {
				return e !== userId
			});
	  	}
	}

	randomlySelectSpyMasters(){
		
		for (var i = 1;i<this.teams.length;i++) {
			var randomPlayer=this.getRandomPlayerFromTeam(0);
			this.playerHandler.joinGame(randomPlayer, i,true);
		}
		this.generatePlayerboard();	
		this.io.to(this.gameId).emit(this.gameType+"_teamsChanged", this.teams);
		this.io.to(this.gameId).emit(this.gameType+"_drawcards", this.board, this.aftergame, this.taps, this.specialHints, this.running, this.abilityList,this.turn);
	}


	startGame(){
		this.board.boardSize = this.gameSettings.boardSize;
		this.blackTeam = 0;
		this.aftergame = false;
		this.drafting = false;
		this.startGameTimer();
		this.log("Game started.");
		this.running = true;
		this.isRunning = true;
		this.hint = {word: "", amount: 0}
		this.turn.teamNr = 1;
		this.turn.spymaster = true;
		this.amountClicks=0;
		this.timeHalver=0;
		this.taps=[];
		this.specialHints = [];
		this.abilityList = [];
		for(var i=0;i<=this.teams.length;i++){
			this.specialHints[i]=[];
			this.teamTime[i]=this.gameSettings.timeLimit;
			if (i>0 && i<this.teams.length){
				for (var j=0;j<this.teams[i].players.length;j++){
				this.abilityList.push({userId: this.teams[i].players[j], charges: this.gameSettings.operativeCharges});
				}
			}
		}
		this.teamTime[1] = Math.floor(Math.min(this.teamTime[1],120) / 2);
		this.teamTime[1] = this.teamTime[1] + parseInt(this.gameSettings.timeLimit);
	
		var message="<span style='color: purple'>Game has started.</span>";
		this.pushMessage(message,[]);	
		
		this.generateBoardstate(this.gameSettings.boardSize);
		this.refreshGameInfo();
		var myCardcount = this.checkCardCounts();
		this.io.to(this.gameId).emit(this.gameType+"_scoreChanged", myCardcount);
		this.io.to(this.gameId).emit(this.gameType+"_observersChanged", this.teams[0].players);
		
	}

	initTeams(){
	  this.teams=[];
		for(var i=0;i<=this.gameSettings.teams;i++){
			this.teams[i]={name: team_names[i], players: [], spymasters: []};
		}
	  for(var i=0;i<this.gameState.players.length;i++){
			this.teams[0].players[i]=this.gameState.players[i].userId;
		}
	  if (!this.running) {
		this.generatePlayerboard();
	  }
		this.refreshGameInfo();
	}


	defineServerListenersFor(socket){
		socket.on(this.gameType+"_quitGame"+this.gameId, (userId) => this.quitGame(userId));
		socket.on(this.gameType+"_cardclick"+this.gameId, (cardId, blankedActive, userId) => this.cardClicked(cardId, blankedActive, userId));
		socket.on(this.gameType+"_cardtap"+this.gameId, (cardId, userId) => this.cardTapped(cardId,userId));
		socket.on(this.gameType+"_gameSettingsUpdated"+this.gameId, (newSettings, userId) => this.gameSettingsUpdated(newSettings));
		socket.on(this.gameType+"_newHint"+this.gameId, (hint, userId) => this.newHint(hint,userId));
		socket.on(this.gameType+"_hurrytime"+this.gameId, (userId) => this.hurryTime(userId));
		socket.on(this.gameType+"_endTurn"+this.gameId, (userId) => this.endTurn(userId));
		socket.on(this.gameType+"_startGame"+this.gameId, () => this.startGameRequested());
		socket.on(this.gameType+"_migrateScoreFromCookie"+this.gameId, (userId, myPlayerStats) => this.migrateScoreFromCookie(userId, myPlayerStats));
	}
	
	deleteListeners(){
		this.io.removeAllListeners([this.gameType+"_quitGame"+this.gameId]);
		this.io.removeAllListeners([this.gameType+"_cardclick"+this.gameId]);
		this.io.removeAllListeners([this.gameType+"_cardtap"+this.gameId]);
		this.io.removeAllListeners([this.gameType+"_gameSettingsUpdated"+this.gameId]);
		this.io.removeAllListeners([this.gameType+"_newHint"+this.gameId]);
		this.io.removeAllListeners([this.gameType+"_hurrytime"+this.gameId]);
		this.io.removeAllListeners([this.gameType+"_endTurn"+this.gameId]);
		this.io.removeAllListeners([this.gameType+"_startGame"+this.gameId]);	
		this.io.removeAllListeners([this.gameType+"_migrateScoreFromCookie"+this.gameId]);	
	}
	
	
	getTeamByUserId(userId){
		var teamNr=0;
		for(var i=0;i<this.teams.length;i++){
			if(this.teams[i].players.indexOf(userId)>=0 || this.teams[i].spymasters.indexOf(userId)>=0){
				teamNr=i;
			}
		}
		return teamNr;
	}

	
	endTurn(userId){
		if(this.turn.teamNr == this.getTeamByUserId(userId)) {
			this.log(userId+" ended the turn.");
			var message="<span style='color: {0}'>{1}</span> ended the turn.";
			this.pushMessage(message,[team_names[this.getTeamByUserId(userId)], this.server.getUserNameByUserId(userId)]);
			this.nextTurn();
		}
	}
	
	
	
	migrateScoreFromCookie(userId, myPlayerStats){
		for(var i=0;i<this.gameState.players.length;i++){
			var currentPlayer=this.gameState.players[i];
			if(currentPlayer.userId==userId){
				if(currentPlayer.playerStats.myTotalGames==0){ //if new playerStats
					currentPlayer.playerStats=myPlayerStats;
					this.storePlayerStatsInFile();
					this.refreshGameInfo();
				}
			}
			
		}
	}

	newHint(hint,userId){
		if(this.isPlayersTurn(userId)) {
			this.lastHint=hint;
			this.log("New Hint given: " +hint.word + " " + hint.amount);
			var messageString="{0} gave hint: {1}";
			var userArg='<span style="color: '+team_names[this.getTeamByUserId(userId)]+'">'+this.server.getUserNameByUserId(userId)+'</span>';
			if (hint.amount > 0) {
				var hintArg='<b>'+hint.word + " " + hint.amount+'</b>';
			}
			else{
				var hintArg=' <b>'+hint.word + " <span class='monospace'>" + hint.amount+'</span></b>';
			}
			this.pushMessage(messageString,[userArg,hintArg]);
			this.nextTurn();
		}
	}


	pushMessage(message, args){
		this.server.pushLogMessage( message, args, false,false, this.gameId);
	}

	generatePlayerboard(){
		var amountPlayers = 0;
		var wordlist = [];
		var colorlist = [];
		for (var i=0; i<this.teams.length;i++){
			for (var j=0;j<this.teams[i].players.length;j++) {
				wordlist[amountPlayers]=this.server.getUserNameByUserId(this.teams[i].players[j]);
				colorlist[amountPlayers]=team_names[i];
				amountPlayers++;
			}
			for (var j=0;j<this.teams[i].spymasters.length;j++) {
				wordlist[amountPlayers]=this.server.getUserNameByUserId(this.teams[i].spymasters[j]);
				colorlist[amountPlayers]="spy"+team_names[i];
				amountPlayers++;
			}
		}  
	  this.board.boardSize = amountPlayers
	  for (var i = 0; i < this.board.boardSize; i++) {
		if (colorlist[i] == undefined || wordlist[i] == undefined ) {
		  this.board.card[i] = {
			word: " ",
			visible: true,
			color: "empty",
			id: i
		  }
		} else {
		  this.board.card[i] = {
			word: wordlist[i],
			visible: true,
			color: colorlist[i],
			id: i
		  }
		}
	  }
	}
	
	getAdmin(){
		return this.gameHost;
		/*if(this.gameState.players.length>0){
			return this.gameState.players[0].userId;
		}
		else{ 
			return undefined;
		}*/
	}
	
	refreshGameInfo(){
		this.io.to(this.gameId).emit(this.gameType+"_adminUser",this.getAdmin());
		this.io.to(this.gameId).emit(this.gameType+"_teamsChanged", this.teams,this.gameState);
		this.io.to(this.gameId).emit(this.gameType+"_turnChanged", this.turn, this.lastHint, this.running, this.drafting, this.timeHalver);
		this.io.to(this.gameId).emit(this.gameType+"_drawcards", this.board, this.aftergame, this.taps, this.specialHints, this.running, this.abilityList,this.turn);
		this.io.to(this.gameId).emit(this.gameType+"_gamestate", this.running, this.gameSettings, this.gameState);
		this.io.to(this.gameId).emit(this.gameType+"_updatePlayerList",this.gameState.players);
	}
	
	
	isPlayersTurn(userId){
		return(this.turn.teamNr == this.getTeamByUserId(userId) && this.turn.spymaster==this.isPlayerSpymaster(userId));
	}


	isPlayerSpymaster(userId){
		for(var i=0;i<this.teams.length;i++){
			if( this.teams[i].spymasters.indexOf(userId)>=0){
				return true;
			}
		}
		return false;	
	}

	getRandomPlayerFromTeam(teamNr){
	  var randomPlayerNumber=Math.floor(Math.random()*this.teams[teamNr].players.length);
	  return this.teams[teamNr].players[randomPlayerNumber];
	}
		

	
	updatePersonalScores( didWin, teamNr, userIdTappedBlackCard){
			for(var i=0;i<this.gameState.players.length;i++){
				this.updatePersonalScoreFor(this.gameState.players[i], didWin, teamNr, userIdTappedBlackCard);
			}
			this.storePlayerStatsInFile();
	
	}
	
	
	updatePersonalScoreFor(player, didWin, teamNr, userIdTappedBlackCard){
		var userId=player.userId;
		var myTeamNr=this.getTeamByUserId(userId);	
		var isSpyMaster=this.isPlayerSpymaster(userId);
			
		if(myTeamNr>0){
			var isWin=(teamNr==myTeamNr && didWin) || (teamNr!=myTeamNr && !didWin);
			if (player.playerStats){
				var myPersonalScore=player.playerStats;
				if (myPersonalScore){
					myPersonalScore.myTotalGames=myPersonalScore.myTotalGames+1;
					if(isWin){
						myPersonalScore.myTotalWins=myPersonalScore.myTotalWins+1;
						if(isSpyMaster){
							myPersonalScore.myWinsAsSpymaster=myPersonalScore.myWinsAsSpymaster+1;
							myPersonalScore.myGamesAsSpymaster=myPersonalScore.myGamesAsSpymaster+1;
						}
						else{
							myPersonalScore.myWinsAsTeammember=myPersonalScore.myWinsAsTeammember+1;
							myPersonalScore.myGamesAsTeammember=myPersonalScore.myGamesAsTeammember+1;
						}
					}
					else{
						myPersonalScore.myTotalLoses=myPersonalScore.myTotalLoses+1;
						if(isSpyMaster){
							myPersonalScore.myLosesAsSpymaster=myPersonalScore.myLosesAsSpymaster+1;
							myPersonalScore.myGamesAsSpymaster=myPersonalScore.myGamesAsSpymaster+1;
						}
						else{
							myPersonalScore.myLosesAsTeammember=myPersonalScore.myLosesAsTeammember+1;
							myPersonalScore.myGamesAsTeammember=myPersonalScore.myGamesAsTeammember+1;
						}
					}
					if(userIdTappedBlackCard==userId){
						myPersonalScore.blackCardsTapped=myPersonalScore.blackCardsTapped+1;
					}
					
					if(myTeamNr==1){
						myPersonalScore.myGamesAsTeam1=myPersonalScore.myGamesAsTeam1+1;
					}
					if(myTeamNr==2){
						myPersonalScore.myGamesAsTeam2=myPersonalScore.myGamesAsTeam2+1;
					}
					if(myTeamNr==3){
						myPersonalScore.myGamesAsTeam3=myPersonalScore.myGamesAsTeam3+1;
					}
					
					player.playerStats=myPersonalScore;
				}
			}

		}
	}
		
	gameSettingsUpdated(newGameSettings){
		this.gameSettings=newGameSettings;
		this.gameSettings.operativeCharges = 2;
		this.gameSettings.turnsUntilBlankReveal = 5;
		if (this.gameSettings.teams !== newGameSettings.teams) {
			this.playerHandler.teams=this.gameSettings.teams;
			this.initTeams();
		} 
	}
	
		
	startGameTimer(){
		this.gameTimer=setInterval(() => {	
			if (this.gameSettings.timeLimit > 0) {
				if (!this.aftergame && (this.running || this.drafting)) {
					this.teamTime[this.turn.teamNr]--;    
					if (this.teamTime[this.turn.teamNr]<1) {
						this.teamTime[this.turn.teamNr] = 0;
						var message="<span style='color: purple'>Timer has run out.</span>";
						this.pushMessage(message,[]);
						this.nextTurn();
						if (this.turn.spymaster == false && this.running) {
							this.nextTurn();
						}
					} 
				}
				this.io.to(this.gameId).emit(this.gameType+"_timer", this.teamTime);
			}
		}, 1000);	
	}
	

	quitGame(userId){
		this.stopGameTimer();
		this.log("Game ended.");
		this.running = false;
		this.isRunning = false;
		this.turn.teamNr = 0;
		this.blackTeam = 0;
		this.turn.spymaster = true;
		this.specialHints = [];
		this.abilityList = [];
		this.taps = [];

		var message="<span style='color: purple'>Game has been aborted by {0}.</span>";
		this.pushMessage(message,[this.server.getUserNameByUserId(userId)]);
		
		this.io.to(this.gameId).emit(this.gameType+"_aftergameCleanup");
		this.clearGame();
		this.generatePlayerboard();
		this.refreshGameInfo();	
	}
	
	stopGameTimer(){
		clearInterval(this.gameTimer);	
	}	
	
	
	giveSpecialHint(specialCardId, teamNr){
		var existor = false;
		for (var i=0;i<this.specialHints.length;i++) {
			for (var j=0;j<this.specialHints[i].length;j++) {
				if (this.specialHints[i][j].cardId == specialCardId) {
				existor = true;
			  }
			}
		  }
		  if (!existor) {
			if(this.specialHints[teamNr].length<this.gameSettings.specials){
				var cardColor=this.board.card[specialCardId].color;
				var teamColor=team_names[teamNr];      
				if(cardColor!== teamColor && cardColor!=="grey" && cardColor !== "black"){
					this.log("Gave special hint: "+ specialCardId+" "+teamNr);	  
					var randomPlayer=this.getRandomPlayerFromTeam(teamNr);
					this.specialHints[teamNr].push({cardId: specialCardId, userId: randomPlayer});
					this.io.to(this.gameId).emit(this.gameType+"_drawcards", this.board, this.aftergame, this.taps, this.specialHints, this.running, this.abilityList, this.turn);
				}
			}
		 }
	}

	cardClicked(cardId, blankedActive, userId){
		  if(this.board.card[cardId] !== undefined && !this.board.card[cardId].visible && this.running){
			if (blankedActive){
			  this.makeCardBlank(cardId, userId);
			}
			if(!this.isPlayerSpymaster(userId) && this.isPlayersTurn(userId)){
			  this.amountClicks++;
			  this.checkCardClicked(cardId,userId);
			}
			if(this.isPlayerSpymaster(userId)){
			  this.giveSpecialHint(cardId,this.getTeamByUserId(userId));
			} 
			
		  }
		  else {
			if(this.board.card[cardId] !== undefined && this.board.card[cardId].visible && this.isPlayerSpymaster(userId) && this.drafting && this.isPlayersTurn(userId)){
			  this.draftPlayerByCard(cardId);
			}
		}
	}


	cardTapped(myCardId,userId){
		  if(this.board.card[myCardId] !== undefined){
			if(this.turn.teamNr == this.getTeamByUserId(userId) && !this.isPlayerSpymaster(userId) && !this.board.card[myCardId].visible){
			  var cardInTaps=-1;
			  var removedLastPlayerFromTap=false;
				for(var i=0;i<this.taps.length;i++){
				  if(this.taps[i].cardId==myCardId){
					var cardInTaps=i;
				  }
				}
				if (cardInTaps!=-1){

				  if (this.taps[cardInTaps].players.includes(userId)){
					for (var i=0; i<this.taps[cardInTaps].players.length; i++) {
					  if (this.taps[cardInTaps].players[i] == userId) {
						  this.taps[cardInTaps].players.splice(i, 1);
						if (this.taps[cardInTaps].players.length == 0) {
						  removedLastPlayerFromTap=true;
						}
					  }
					}
				if(removedLastPlayerFromTap){
				  this.taps.splice(cardInTaps,1);
				}
				  } else {
					this.taps[cardInTaps].players[this.taps[cardInTaps].players.length] = userId;
				  }

				} else {
				  this.taps[this.taps.length]={cardId: myCardId, players: [userId]};
				}
			  }  
		  }
		  this.io.to(this.gameId).emit(this.gameType+"_drawcards", this.board, this.aftergame, this.taps, this.specialHints, this.running, this.abilityList,this.turn);
	}

	makeCardBlank(cardId, userId){
		  var playerTeamNr = this.getTeamByUserId(userId);
		  if(this.board.card[cardId] !== undefined && playerTeamNr != this.turn.teamNr && !this.isPlayerSpymaster(userId)){// && this.board.card[cardId].blank == 0){
			for (var i = 0; i < this.abilityList.length; i++){
			  if (this.abilityList[i].userId == userId && this.abilityList[i].charges > 0){
				this.abilityList[i].charges--;
				var message="";
				var username=this.server.getUserNameByUserId(userId);
				 if (this.board.card[cardId].blank == 0){
					  var message="<span style='color: purple'>"+username +" has made a card blank!</span></p>";
					  //board.card[cardId].blank = (teams.length-1);
					  this.board.card[cardId].blank = this.gameSettings.turnsUntilBlankReveal;
					} else {
					  var message="<span style='color: purple'>"+username +" has revealed a blank card!</span></p>";
					  this.board.card[cardId].blank = 0;
					}
				
				this.refreshGameInfo();

				this.pushMessage(message,[this.server.getUserNameByUserId(userId)]);	
			  }
			}
		  }
	}


	hurryTime(userId){
		  var playerTeamNr = this.getTeamByUserId(userId);
		  if(playerTeamNr != this.turn.teamNr && !this.isPlayerSpymaster(userId) && this.timeHalver == 0){
			for (var i = 0; i < this.abilityList.length; i++){
			  if (this.abilityList[i].userId == userId && this.abilityList[i].charges > 0){
				this.abilityList[i].charges--;
				this.teamTime[this.turn.teamNr] = Math.floor(this.teamTime[this.turn.teamNr]/2);
				this.timeHalver = this.timeHalver + (this.teams.length-1);
				this.refreshGameInfo();
		
				var message="<span style='color: purple'>{0} has halfed the time!</span>";
				this.pushMessage(message,[this.server.getUserNameByUserId(userId)]);	
			  }
			}
		  }
	}

	draftPlayerByCard(myCardId) {
		var userName=this.board.card[myCardId].word;
		var userId=this.server.getUserIdByUserName(userName);
		if (this.teams[0].players.includes(userId)) {
			this.playerHandler.joinGame(userId, this.turn.teamNr, false);				
			var message="<span style='color:{0}'> Team {1} has drafted {2}. </span>";
			this.pushMessage(message,[team_names[this.turn.teamNr],team_names[this.turn.teamNr], userName ]);
			this.generatePlayerboard();		
			this.nextTurn();
			this.refreshGameInfo();
		  }	  
	}

	checkWinConditionWhenCardsAreGone(){
		//if all cards of one team are gone.... end game
		var cardCount = this.checkCardCounts();
		for(var i=1;i<cardCount.length;i++){
			if (cardCount[i]==0){
			  this.endGame(i, true, this.userIdClickedBlackCard);
			  return;
			}
		  }			
	}

	checkCardClicked(cardId,userId){
		this.board.card[cardId].visible = true;
		var message="<span style='color:{0}'>{1}</span> has clicked <span style='color:{2}'>{3}</span>";
		this.pushMessage(message,[team_names[this.getTeamByUserId(userId)],this.server.getUserNameByUserId(userId) ,this.board.card[cardId].color,  this.board.card[cardId].word  ]);

	  if (this.running) {
		this.io.to(this.gameId).emit(this.gameType+"_scoreChanged", this.checkCardCounts());
	  }
	 this.checkWinConditionWhenCardsAreGone();
		//if black card ... end game
		if(this.board.card[cardId].color=="black" ){
			if(this.blackTeam>0){
				this.userIdClickedBlackCard=userId;
				this.endGame(this.getTeamByUserId(userId), false, this.userIdClickedBlackCard);
			}
			else if (this.teams.length < 4 ) {
				this.userIdClickedBlackCard=userId;
				this.endGame(this.getTeamByUserId(userId), false, this.userIdClickedBlackCard);
			} 
			else {
				var message="<span style='color:'{0}'>Team {1} must skip all their turns. {2}</span>";
				this.pushMessage(message,[team_names[this.getTeamByUserId(userId)] ,team_names[this.getTeamByUserId(userId)]]);
				this.userIdClickedBlackCard=userId;
				this.blackTeam = this.getTeamByUserId(userId);
				this.nextTurn();
			}
		
		} else {
			if(this.board.card[cardId].color !== team_names[this.getTeamByUserId(userId)] || ((this.lastHint.amount !=='∞') && this.amountClicks > this.lastHint.amount )  ){	
				var message="<span style='color:{0}'>The turn of team {1} has ended.</span>";
				this.pushMessage(message,[team_names[this.getTeamByUserId(userId)] , team_names[this.getTeamByUserId(userId)] ]);

				this.nextTurn();
			} 
			else {
				this.io.to(this.gameId).emit(this.gameType+"_drawcards", this.board, this.aftergame, this.taps, this.specialHints, this.running, this.abilityList,this.turn);
			}
		}
	}

	getAllCardIdsOfTeam(teamNr){
		var cardsList=[];
		for(var i =0; i < this.board.card.length; i++){
			if(this.board.card[i].color==team_names[teamNr]){
				cardsList[cardsList.length]=i;
			}		
		}
		return cardsList;
	}
	
	getAllNotVisibleCardIdsOfTeam(teamNr){
		var cardsList=[];
		for(var i =0; i < this.board.card.length; i++){
			if(this.board.card[i].color==team_names[teamNr] && !this.board.card[i].visible){
				cardsList[cardsList.length]=i;
			}	
		}
		return cardsList;
	}
	
	randomlyRevealACardOfTeam(teamNr){
		var cardsList=this.getAllNotVisibleCardIdsOfTeam(teamNr);
		var random = Math.floor(Math.random()*(cardsList.length));
		var randomCardId=cardsList[random];
		this.board.card[randomCardId].visible = true;
		var revealedWord=this.board.card[randomCardId].word;
	
		var message="A card was randomly revealed: <span style='color:{0}'>{1}</span>";
		this.pushMessage(message,[team_names[teamNr] , revealedWord ]);
		this.checkWinConditionWhenCardsAreGone();
	}


	getPlayerStatsFromFile(userId){
		var playerScoresFile=fs.readFileSync(PLAYERSTATS_FILE_NAME);
		var playerScoresFromFile=JSON.parse(playerScoresFile);
		for(var i=0;i< playerScoresFromFile.length;i++){
			if(playerScoresFromFile[i].userId==userId){
				return playerScoresFromFile[i].playerStats;
			}
		}
		var newStats={myTotalGames:0,myTotalWins:0, myTotalLoses:0, myGamesAsSpymaster:0, myGamesAsTeammember:0, myWinsAsTeammember:0, myWinsAsSpymaster:0, myLosesAsSpymaster:0,myLosesAsTeammember:0,myGamesAsTeam1:0,myGamesAsTeam2:0,myGamesAsTeam3:0, blackCardsTapped:0};
		return newStats;
		
	}
	
	storePlayerStatsInFile(){
		var playerScoresFile=fs.readFileSync(PLAYERSTATS_FILE_NAME);
		var playerScoresFromFile=JSON.parse(playerScoresFile);
		
		for(var i=0;i<this.gameState.players.length;i++){
			var currentPlayer=this.gameState.players[i];
			//if(this.getTeamByUserId(currentPlayer.userId)>0){
				playerScoresFromFile=this.putPlayerStatsInList(playerScoresFromFile, currentPlayer);
			//}	
		}
		fs.writeFile(PLAYERSTATS_FILE_NAME, JSON.stringify(playerScoresFromFile,null, '\t'), function (err) {
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
	
	
	
	
	handleComponentSignal(event){
		if(event.source==this.playerHandler){
			if(event.type=="joinPlayer" || event.type=="changeTeam"){
				var player= this.playerHandler.getPlayerByUserId(event.target);
				this.joinTeam(player.userId,player.team,player.selectedCharacter); 
			}
			if (!this.running) {
				this.generatePlayerboard();
			}
			this.io.to(this.gameId).emit(this.gameType+"_teamsChanged", this.teams);
			this.io.to(this.gameId).emit(this.gameType+"_drawcards", this.board, this.aftergame, this.taps, this.specialHints, this.running, this.abilityList, this.turn);
		}
						
	}


	handleGameRoomChange(event){	
		var userId=event.target;
		if(event.type=="joinGameRoom"){	
			var myStats=this.getPlayerStatsFromFile(userId);
			this.gameState.players[this.gameState.players.length] = {userId: userId, playerStats:myStats, team:0};
      
			this.io.to(this.gameId).emit(this.gameType+"_adminUser",this.getAdmin());

			if (!this.inTeam(userId)){
				this.playerHandler.joinGame(userId, 0, false);
				if (!this.running) {
				  this.generatePlayerboard();
				}
			}			
			if (this.running) {
				this.io.to(this.gameId).emit(this.gameType+"_observersChanged", this.teams[0].players);
			}
			this.refreshGameInfo();
		}

		if(event.type=="refreshPlayer"){
			this.refreshGameInfo();
		}
		
		if(event.type=="leaveGameRoom"){// ||event.type=="disconnectPlayer"){
			//this.leavePlayers(userId);
			if (!this.running) {
			  this.leaveTeams(userId);
			  this.generatePlayerboard();
			  this.refreshGameInfo();		  
			} else {
			  for (var i = 0; i<this.gameState.players.length;i++){
				if (this.getTeamByUserId(userId) == 0){
				  this.leaveObservers(userId);
				 this.io.to(this.gameId).emit(this.gameType+"_observersChanged", this.teams[0].players); 
				} 
			  }
			}
		}
	}	

	endGame(teamNr, didWin, userIdBlackCardTapped){
		this.stopGameTimer();
		this.updatePersonalScores(didWin, teamNr, userIdBlackCardTapped);
		this.aftergame = true;
		this.log("Team "+ teamNr +" has "+ (didWin?"won":"lost"));
		this.turn.teamNr = 0;
		this.turn.spymaster = true;
		this.taps=[];
		this.amountClicks=0;
		
		var message="<span style='color:{0} '>Team {1} has {2}.</span>";
		this.pushMessage(message,[team_names[teamNr],  team_names[teamNr] , ( (didWin?"won":"lost"))  ]);

		this.refreshGameInfo();
		this.io.to(this.gameId).emit(this.gameType+"_revealBoardstate");	
	}

	checkCardCounts(){
		
		var cardcount= [];
		for (i=0;i<this.teams.length;i++) {
			cardcount[i] = 0;
		}
		for(var i=0;i<this.board.card.length;i++){
			for (var j=0;j<team_names.length;j++){
				if(this.board.card[i].color == team_names[j] && !this.board.card[i].visible){
					if( cardcount[j] == undefined) {
						cardcount[j] = 1;
					} else {
						cardcount[j]++;
					}
				}
			}
		}
		return cardcount;
	}


	clearGame(){
		this.dumpTeams();
		this.board = {
			boardSize: 0,
			card: []
		};
		this.stopGameTimer();
	}


	dumpTeams(){
		for (var i=0;i<this.gameState.players.length;i++) {
			if (this.gameState.players[i].userId !== undefined) {
				this.playerHandler.joinGame(this.gameState.players[i].userId, 0, false);
			}
		}	
		for(var i=1;i<this.teams.length;i++){
			this.teams[i].players=[];
			this.teams[i].spymasters=[];
		}		
		if (!this.running) {
			this.generatePlayerboard();
		}
		this.io.to(this.gameId).emit(this.gameType+"_teamsChanged", this.teams);
	}

	startDraft(){
		this.blackTeam = 0;
		this.drafting = true;
		this.running = false;
		this.isRunning = false;
		this.log("Drafting started.");
		this.turn.teamNr = 1;
		this.turn.spymaster = true;
		for(var i=0;i<=this.teams.length;i++){
			this.teamTime[i]=this.gameSettings.timeLimit;
		}
		this.teamTime[1] = Math.floor(Math.min(this.teamTime[1],120) / 2);
		this.teamTime[1] = this.teamTime[1] + parseInt(this.gameSettings.timeLimit);
		
		var message="<span style='color: purple'>Drafting has started.</span>";
		this.pushMessage(message,[ ]);	
		this.refreshGameInfo();
	}

	nextTurn(){
		this.amountClicks=0;
	  
		if(this.turn.spymaster==true && this.running){
			this.turn.spymaster=false;
		}
		else{
			this.timeHalver = Math.max(this.timeHalver-1, 0);
			this.taps=[];
				this.turn.teamNr= ((this.turn.teamNr+1) % (this.teams.length));
			while (this.turn.teamNr == 0 || this.turn.teamNr == this.blackTeam) {
			  this.turn.teamNr= ((this.turn.teamNr+1) % (this.teams.length));
			}
			this.turn.spymaster=true;
			this.teamTime[this.turn.teamNr] = Math.floor(this.teamTime[this.turn.teamNr] / 2);
			this.teamTime[this.turn.teamNr] = Math.floor(this.teamTime[this.turn.teamNr] + parseInt(this.gameSettings.timeLimit));

			if (this.timeHalver > 0){
			  this.teamTime[this.turn.teamNr] = Math.floor(this.teamTime[this.turn.teamNr] / 2);
			}

			for (var i = 0; i < this.board.card.length; i++){
			  if (this.board.card[i].blank > 0){
				this.board.card[i].blank--;
			  }
			}
		}
		this.io.to(this.gameId).emit(this.gameType+"_turnChanged",this.turn, this.lastHint, this.running, this.drafting, this.timeHalver);
		this.io.to(this.gameId).emit(this.gameType+"_drawcards", this.board, this.aftergame, this.taps, this.specialHints, this.running, this.abilityList,this.turn);
	}


	inTeam(userId){
		for(var i=0;i<this.teams.length;i++){
			for (var j=0;j<this.teams[i].players.length;j++) {
				if (this.teams[i].players[j] == userId) {
				return true;
				}
			}
			for (var j=0;j<this.teams[i].spymasters.length;j++) {
				if (this.teams[i].spymasters[j] == userId) {
				return true;
				}
			}
		}
		return false;
	}


	generateBoardstate (amountCards){
		var wordlist = this.generateWordList(amountCards);
		var colorlist = this.generateColorList(amountCards);
		
		this.board.size = amountCards;
		
		for (var i = 0; i < amountCards; i++) {
			this.board.card[i] = {
				word: wordlist[i],
				visible: false,
				color: colorlist[i],
				id: i,
				blank: 0
			}
		}
	}


	generateColorList(amount){
		var list = [];
		var coloramount = [];
		var colored = 0
		
		for (var i = this.gameSettings.teams; i > 0; i--) {
			coloramount[i] = Math.floor(amount/(1+parseInt(this.gameSettings.teams)));
			colored = colored+ coloramount[i]
		}
		coloramount[1] ++;
		colored++;
		coloramount[0] = amount-colored
		
		var count = 0;
		for (var j = this.gameSettings.teams; j >=0;j--) {
			for (var i = 0; i<coloramount[j]; i++) {
				list[count] = team_names[j];
				count++;
			}
		}	
		list[amount-1] = "black";
		list = Tools.scrambleList(list);
		return list;
	}


	generateWordList(amount){
		var list = [];
		var numberlist = [];
		for (var i = 0; i < WoerdgoemGameController.wordlibraries.length; i++) {
			numberlist[i] = i;
		}
		numberlist = Tools.scrambleList(numberlist);
		var count = 0;
		var counttwo = 0;
		
		while (count < amount) {
		var text = fs.readFileSync(WoerdgoemGameController.wordlibraries[numberlist[counttwo]], "utf-8");
		var textByLine = text.split("\n")
		textByLine = Tools.scrambleList(textByLine);
		var random = Math.floor(Math.random()*(MAXWORDS-MINWORDS))+MINWORDS;
		for (var j = 0; j < random; j++) {
			if (count < amount) {
				textByLine[j] = textByLine[j].toUpperCase(); 
				textByLine[j] = textByLine[j].trim();
				if (textByLine[j] !== undefined 
					&& textByLine[j] !== null
					&& textByLine[j] !== "" 
					&& !this.usedWords.includes(textByLine[j])){
					list[count] = textByLine[j];
					this.usedWords[this.usedWords.length] = textByLine[j];
					count++;
				}
			}
		}	
		counttwo++;
		}
		this.cleanUsedWords();
		list = Tools.scrambleList(list);
		return list;
	}

	cleanUsedWords(){
		while (this.usedWords.length>1000) {
			this.usedWords.shift();
		}
	}

	
/**
STATIC PART
**/
	
	static initialize(){
		WoerdgoemGameController.initWordLibraries();			
	}	
	
	static initWordLibraries(){	
		WoerdgoemGameController.wordlibraries = fs.readdirSync(WORDS_FOLDER_NAME);
		for (var i=0; i < WoerdgoemGameController.wordlibraries.length; i++) {
			WoerdgoemGameController.wordlibraries[i] = WORDS_FOLDER_NAME + WoerdgoemGameController.wordlibraries[i];
		}
	}

}

module.exports = WoerdgoemGameController;
     
})(typeof exports === 'undefined'?  
            window: exports); 