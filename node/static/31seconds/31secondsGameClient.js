/**
    VARIABLES
**/

var GAME_NAME = "31seconds";
var username = getUserName();
var adminUser;
var gameState;
var gameSettings = {
  timeLimit: 31, 
  turnSize: 7,
  winningScore: 31,
  teams: "2", 
}; 
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
var PLAYER_STAT_ATTRIBUTES = ["myTotalGames","myTotalWins","myTotalLosses", "myTeamCaptainGames", "myTeamCaptainWins", "myTeamCaptainLosses", "myExplainRate", "myCardsExplained"];
var PLAYER_STATS_NAMES = ["Total Games", "Wins", "Losses", "Captain Games", "Captain Wins", "Captain Losses", "Explain Ratio", "Total Cards Explained"]
var TEAM_NAMES_LOWER = ["grey", "yellow", "blue"];
var TEAM_NAMES_UPPER = ['Grey', 'Yellow', 'Blue'];

/**
	ON LOAD
**/

socket.emit(GAME_NAME+"_requestGameInfo"+gameId);
// attemptMigratePlayerStats(); Loading from cookie is outdated
fetchQRCode(); //in renderGame

// turn console logging off, so players cannot console.log(gameState);
// console.log = function() {
//   console.warn("Console logging is disabled for this application.");
// };

/**
	LISTENERS
**/

socket.on(GAME_NAME+"_adminUser", function(user) {
  adminUser = user;
});

socket.on(GAME_NAME+"_gameState", function(newGameState) {
  if (gameState == null){
    //first time receive gameState
    gameState = newGameState;
    updatePlayerList();
  } else {
    gameState = newGameState;
  }
  renderGame();
});	

socket.on(GAME_NAME+"_gameSettings", function(newGameSettings) {
  gameSettings = newGameSettings;
});

socket.on(GAME_NAME+"_playerStatsChanged", function() {
  updatePlayerList(); //defined in render game
});

/**
  EMITTER FUNCTIONS
**/
function quitGame(){
  if (gameState.aftergame && isMeAdmin()){
    socket.emit(GAME_NAME+"_endGame"+gameId, getUserId());
  } else {
    socket.emit(GAME_NAME+"_quitGame"+gameId, getUserId());
  }
}

function startDraft(){
	socket.emit(GAME_NAME+"_startDraft"+gameId);
}

function draftPlayer(teamNr, checkUserId){
  if (mayIdraft()){
    socket.emit(GAME_NAME+"_draftPlayer"+gameId, teamNr, checkUserId);
  }
}

function startGame(){
  if (isMeAdmin()){
      socket.emit(GAME_NAME+"_startGame"+gameId);
  }
}

function requestCard(){
  if (isMyCardTurn()){
	  socket.emit(GAME_NAME+"_requestCard"+gameId, getUserId());
  }
}

function completeCard(){
  if (isMyCardTurn()){
	  socket.emit(GAME_NAME+"_completeCard"+gameId, getUserId());
  }
}

function receiveScore(){
  var score = getAssignedScore();
  if (isMyCardTurn()){
    socket.emit(GAME_NAME+"_receiveScore"+gameId,score);
  }
}

function endGame(){
  if (gameState.aftergame && isMeAdmin()){
	  socket.emit(GAME_NAME+"_endGame"+gameId, getUserId());
  }
}

function giveTime(){
  if(gameState.turn.phase == 1){
    var previousTurn = gameState.turn.teamNr - 1;
    if (previousTurn <= 0){
      var previousTurn = gameState.teams.length - 1;
    }
    if(gameState.teams[previousTurn].teamCaptainId == getUserId()){
      socket.emit(GAME_NAME+"_giveTime"+gameId);
    }
  }
}

/**
  HELPER FUNCTIONS
**/

function mayIdraft(){
  return mayPlayerDraft(getUserId());
}

function mayPlayerDraft(checkUserId){
  if (
    gameState.drafting &&
    gameState.turn != undefined &&
    gameState.turn.teamNr == getUserIdTeam(checkUserId) &&
    gameState.teams[gameState.turn.teamNr].teamCaptainId == checkUserId
  ) {
    return true;
  }
  return false;
}

function isMeAdmin(){
	return getUserId() == adminUser;
}

function isPlayerAdmin(checkUserId){
	return checkUserId == adminUser;
}

function getMyTeam(){
  return getUserIdTeam(getUserId());
}

function getUserIdTeam(checkUserId){
	for(var i=0;i<gameState.teams.length;i++){
    for(var j=0;j<gameState.teams[i].playerIds.length;j++){
      if(gameState.teams[i].playerIds[j] == checkUserId){
        return i;
      }
    }
	}
	return 0;
}

function isMyCardTurn(){
  return isPlayerCardTurn(getUserId());
}

function getCurrentPlayerCardTurn(){
  for(var i = 0; i < gameState.players.length; i++){
    if (isPlayerCardTurn(gameState.players[i].userId)){
      return gameState.players[i];
    }
  }
  return null;
}

function isPlayerCardTurn(checkUserId){
  if (gameState.drafting){
    return mayPlayerDraft(checkUserId)
  } else if (gameState.afterGame){
    return isPlayerAdmin(checkUserId);
  } else if (gameState.running){
    return isPlayerRunningTurn(checkUserId);
  }

  return isPlayerAdmin(checkUserId);
}

function isPlayerRunningTurn(checkUserId){
  var playerteam = getUserIdTeam(checkUserId);
  var turnteam = gameState.turn.teamNr;

  if(gameState.turn.phase == 2){
    var previousTurn = gameState.turn.teamNr - 1;
    if (previousTurn <= 0){
      var previousTurn = gameState.teams.length - 1;
    }
    if(gameState.teams[previousTurn].teamCaptainId == checkUserId){
      return true;
    } else {
      return false;
    }
  }

  if (turnteam != playerteam){
    return false;
  }
  var playerindex = getPlayerIndex(checkUserId, playerteam);
  var turnindex = gameState.turn.turnIndex;

  return turnindex[turnteam] == playerindex;

}

function getAssignedScore(){
  const checkboxes = document.querySelectorAll('.cardScore');
  const checkedCount = Array.from(checkboxes).filter(checkbox => checkbox.checked).length;
  return checkedCount;
}

function getPlayerIndex(checkUserId, playerteam){
  for(var i=0; i<gameState.teams[playerteam].playerIds.length;i++){
    if (gameState.teams[playerteam].playerIds[i] == checkUserId){
      return i;
    }
  }
  return 0;
}

function getVictoriousTeam(){
  var highestScore = -Infinity;
  var winningTeamNr = -1;
  var isTie = false;
  var teams = this.gameState.teams;
  
  for (var i=0; i<gameState.teams.length;i++) {
    if (gameState.teams[i].score > highestScore) {
      highestScore = gameState.teams[i].score;
      winningTeamNr = i;
      isTie = false;
    } else if (gameState.teams[i].score === highestScore) {
      isTie = true;
    }
  }
  
  return isTie ? false : winningTeamNr;
}

function leave(){
	joinTeam(0, false);
}


function joinTeam(teamNumber){	
  if (!gameState.running) {
	  joinGame( teamNumber, false);
  }
}

// Artifacts
// function attemptMigratePlayerStats(){
// 	var myPlayerStats =getMyPersonalScore();
// 	if(myPlayerStats.myTotalGames>0){
// 	  socket.emit(GAME_NAME+"_migrateScoreFromCookie"+gameId,getUserId(),myPlayerStats);
// 	}
// }

// function getMyPersonalScore(){
//   var cookie = getCookie("myPersonalScore");
//   if(cookie==null || cookie==undefined || cookie==""){
//     var myPersonalScore = EMPTY_PLAYER_STATS;
//     setCookie("myPersonalScore",JSON.stringify(myPersonalScore),9999);
//     return myPersonalScore;
//   }else{
//     var myPersonalScore= JSON.parse(cookie);	
//     return myPersonalScore;
//   }
// }