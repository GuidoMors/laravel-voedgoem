var GAME_NAME="Woerdgoem";
var teams=[];
var username =getUserName();
var turn;
var running=false;
var drafting=false;
var adminUser;
var gameSettings={boardSize:32, timeLimit:120, teams: 2, specials: 3 };
var isShowSettings=false;

var boardSizeOption = 32;
var teamSizeOptions = [2,3];

var blankedActive = false;
var timeHalver = 0;

var abilityList = [];

var loggingChatGPT = false;


document.addEventListener("DOMContentLoaded", function () {
  initializeSettingsMenu();
});


fetch('http://localhost:2222/qrcode') 
.then(response => response.json())
.then(data => {
    var qrDiv = document.getElementById("qrDiv");
    
    while (qrDiv.firstChild) {
        qrDiv.removeChild(qrDiv.firstChild);
    }
    
    var img = document.createElement("img");
    img.src = data.src;
    img.alt = "QR Code";
    
    qrDiv.appendChild(img);
})
.catch(err => {
    console.error('Error fetching QR code:', err);
});


function attemptMigratePlayerStats(){

	var myPlayerStats=getMyPersonalScore();
	if(myPlayerStats.myTotalGames>0){
		socket.emit(GAME_NAME+"_migrateScoreFromCookie"+gameId,getUserId(),myPlayerStats);
	//	deleteCookie("myPersonalScore");
	}
}


//draw cards when server wants to
socket.on(GAME_NAME+"_drawcards", function(board, aftergame,taps, specialHints, newRunning, newAbilityList, newTurn) {
	turn=newTurn;
  abilityList = newAbilityList;
  running = newRunning
  var tbl = document.getElementById('cardboard');
  if (tbl) {
    tbl.parentElement.removeChild(tbl);
  }
  generate_cards(board, aftergame, taps, turn, specialHints, running);
  initializeDropDownBoxAmounts();
  refreshButtons();

  if (loggingChatGPT){
    printForChatGPT(board);
  }
});


socket.on(GAME_NAME+"_gamestate", function(gameRunning, newSettings, newGameState) {
  gameSettings=newSettings;
  gameState=newGameState;
  running=gameRunning;
  refreshButtons();
  refreshTeamWindows();
  attemptMigratePlayerStats();

});	

socket.on(GAME_NAME+"_revealBoardstate", function() {
  delete_turncard();
  generate_gameovercard();
  refreshButtons();
});	


socket.on(GAME_NAME+"_aftergameCleanup", function() {
  document.getElementById('redteamtime').innerHTML = "";
  document.getElementById('blueteamtime').innerHTML = "";
  document.getElementById('greenteamtime').innerHTML = "";
  document.getElementById('redteamscore').innerHTML = "";
  document.getElementById('blueteamscore').innerHTML = "";
  document.getElementById('greenteamscore').innerHTML = "";

  var turncard = document.getElementById('turner');
  if (turncard) {
    turncard.parentElement.removeChild(turncard);
  }

  var observers = document.getElementById('observers');
  if (observers) {
    observers.parentElement.removeChild(observers);
  }
});


socket.on(GAME_NAME+"_turnChanged", function(newTurn, newHint, running, newDrafting, newTimeHalver) {
	timeHalver = newTimeHalver;
	drafting = newDrafting;
	turn = newTurn;

  refreshBackground(turn.teamNr);
  refreshButtons();
  if (running || drafting) {
    refreshTurnMessage(turn, newHint);
  }

  delete_turncard();
  if (running) {
    if(turn.spymaster == false) {
      generate_turncard(turn, newHint, isMyTurn());
    }
  } else {
    if (drafting) {
      generate_draftcard(turn);
    } 
  }

});	

socket.on(GAME_NAME+"_timer", function(timecount) {
  refreshTime(timecount);
});	


socket.on(GAME_NAME+"_scoreChanged", function(cardcount) {
  refreshScore(cardcount);
});	


socket.on(GAME_NAME+"_adminUser", function(user) {
  adminUser=user;
  refreshButtons();
});

socket.on(GAME_NAME+"_updatePlayerList",  function(playerList) {
	updatePlayerList(playerList);
});



socket.on(GAME_NAME+"_observersChanged", function(players) {
  var tbl = document.getElementById('observers');
  if (tbl) {
    tbl.parentElement.removeChild(tbl);
  }
  generate_observers(players);
});

socket.on(GAME_NAME+"_teamsChanged", function(newTeams, newGameState) {
  teams=newTeams;
  gameState=newGameState;
  document.getElementById('redoperatives').innerHTML = getUserNamesByIds(teams[1].players).join(", ");
  document.getElementById('redspymasters').innerHTML = getUserNamesByIds(teams[1].spymasters).join(", ");
  document.getElementById('blueoperatives').innerHTML = getUserNamesByIds(teams[2].players).join(", ");
  document.getElementById('bluespymasters').innerHTML = getUserNamesByIds(teams[2].spymasters).join(", ");
  if (teams.length > 3) {
    document.getElementById('greenoperatives').innerHTML = getUserNamesByIds(teams[3].players).join(", ");
    document.getElementById('greenspymasters').innerHTML = getUserNamesByIds(teams[3].spymasters).join(", ");
  }
  refreshTeamWindows();
});

function refreshBackground(turncount){
  switch(turncount) {
    case 1:
      document.body.className = 'backgroundred';
      break;
    case 2: 
      document.body.className = 'backgroundblue';
      break;
    case 3:
      document.body.className = 'backgroundgreen';
      break;
    default:
      document.body.className = 'backgroundneutral';
  }
}




function refreshTime(timecount){
  var teamcolorings = ["","red","blue","green"];

  if (timeHalver > 0){
    for (var i = 1; i < teamcolorings.length;i++){
      var moduloteam = i;
      if (turn.teamNr > i){
        moduloteam = i + 2;
      }
  
      if (moduloteam < turn.teamNr + timeHalver){
        document.getElementById(teamcolorings[i]+'teamtime').classList.add("hurried");
      } else {
        document.getElementById(teamcolorings[i]+'teamtime').classList.remove("hurried");
      }
      
    }

  } else {
    document.getElementById(teamcolorings[1]+'teamtime').classList.remove("hurried");
    document.getElementById(teamcolorings[2]+'teamtime').classList.remove("hurried");
    document.getElementById(teamcolorings[3]+'teamtime').classList.remove("hurried");
  }

  
  document.getElementById('redteamtime').innerHTML = Math.floor(timecount[1]/60) +':'+ ((timecount[1] %60)<10?('0'+(timecount[1] %60)):(timecount[1] %60));
  document.getElementById('blueteamtime').innerHTML = Math.floor(timecount[2]/60) +':'+ ((timecount[2] % 60)<10?('0'+(timecount[2] %60)):(timecount[2] %60));
  document.getElementById('greenteamtime').innerHTML = Math.floor(timecount[3]/60) +':'+ ((timecount[3] %60)<10?('0'+(timecount[3] %60)):(timecount[3] %60));
}

function refreshScore(cardcount){
  document.getElementById('redteamscore').innerHTML = cardcount[1];
  document.getElementById('blueteamscore').innerHTML = cardcount[2];
  document.getElementById('greenteamscore').innerHTML = cardcount[3];
}


function refreshTurnMessage(myTurn, myHint){

  var elementId = ['', 'redHintText', 'blueHintText', 'greenHintText'];

  document.getElementById(elementId[1]).innerHTML = "";
  document.getElementById(elementId[2]).innerHTML = "";
  document.getElementById(elementId[3]).innerHTML = "";

  if (myHint && myTurn.teamNr>0) {
    if (myTurn.spymaster == true) {
      document.getElementById(elementId[myTurn.teamNr]).innerHTML = "Spymaster is thinking";
    } else {
      if (hint.amount > 0) {
        document.getElementById(elementId[myTurn.teamNr]).innerHTML = myHint.word + " " + myHint.amount;
      } else {
        document.getElementById(elementId[myTurn.teamNr]).innerHTML = myHint.word + "<span class='monospace'> " + myHint.amount+"</span>";
      }
      
    }
}
  
}


function showSettings(){
	isShowSettings=true;
	refreshButtons();	
}

function cancelSettings(){
	isShowSettings=false;
	refreshButtons();
}

function updateGameSettings(){
	var boardSize=document.getElementById('boardSizeSettings').value;;
  var teamSize=document.getElementById('teamSizeSettings').value;
  var specialAmount=document.getElementById('specialSettings').value;
	var newTimer=document.getElementById('timerSettings').value;
	
	gameSettings={boardSize: boardSize, timeLimit: newTimer, teams: teamSize, specials: specialAmount};
	socket.emit(GAME_NAME+"_gameSettingsUpdated"+gameId,gameSettings,getUserId());
	isShowSettings=false;
	refreshButtons();
	refreshTeamWindows();
}

function initializeSettingsMenu(){	
  var teamSizeElement = document.getElementById('teamSizeSettings');
  if (teamSizeElement){
    for(var i=0;i<teamSizeOptions.length;i++){
      var option = new Option( teamSizeOptions[i]);
      teamSizeElement.add(option);
    }
  }

}

function refreshTeamWindows(){
  if (gameSettings.teams > 2) {
    document.getElementById("greenbox").style.display = "block";
  } else {
    document.getElementById("greenbox").style.display = "none";
  }

}

function refreshButtons(){
  if(running){
    //team buttons
    document.getElementById('redspymasterbutton').style.display = 'none';
    document.getElementById('greenspymasterbutton').style.display = 'none';
    document.getElementById('bluespymasterbutton').style.display = 'none';
    document.getElementById('redoperativebutton').style.display = 'none';
    document.getElementById('greenoperativebutton').style.display = 'none';
    document.getElementById('blueoperativebutton').style.display = 'none';
    document.getElementById('boardSizeSettings').style.display = 'none';	

    document.getElementById('specialSettings').style.display = 'none';
    document.getElementById('teamSizeSettings').style.display = 'none';
    document.getElementById('timerSettings').style.display = 'none';

    //hint message box
    document.getElementById('redHintText').style.display = 'block';
    document.getElementById('greenHintText').style.display = 'block';
    document.getElementById('blueHintText').style.display = 'block';

    //settings buttons
    document.getElementById('settingsbutton').style.display = 'none';
    document.getElementById('startbutton').style.display = 'none';
    document.getElementById('leavebutton').style.display = 'none';
    document.getElementById('cancelsettingsbutton').style.display = 'none';
    document.getElementById('savesettingsbutton').style.display = 'none';
    if(isMeAdmin()){
      document.getElementById('quitbutton').style.display = 'flex';
    }
    else{
      document.getElementById('quitbutton').style.display = 'none';
    }
    if(isMyTurn() && !isMeSpymaster()){
      document.getElementById('passbutton').style.display = 'flex';
    } else {
      document.getElementById('passbutton').style.display = 'none';
      
    }
    if (turn.teamNr != getMyTeam() && !isMeSpymaster() && getMyTeam() != 0){
      
      document.getElementById('hurrybutton').style.display = 'flex';
      document.getElementById('blankoutbutton').style.display = 'flex';
      if (getMyAbilityCharges() <= 0){
        document.getElementById('hurrybutton').disabled = true;
        document.getElementById('blankoutbutton').disabled = true;
      } else {
        document.getElementById('hurrybutton').disabled = false;
        document.getElementById('blankoutbutton').disabled = false;
      }
    } else {
      document.getElementById('hurrybutton').style.display = 'none';
      document.getElementById('blankoutbutton').style.display = 'none';
    }

    //chat buttons
    if(isMeSpymaster()){
      document.getElementById('inputMessage').style.display = 'none';
      document.getElementById('MessageButton').style.display = 'none';
      document.getElementById('inputAmount').style.display = 'block';
      document.getElementById('inputHint').style.display = 'block';
      if (isMyTurn()) {
        document.getElementById('HintButton').style.display = 'block';
      } else {
        document.getElementById('HintButton').style.display = 'none';    
      }
    } else {
      document.getElementById('HintButton').style.display = 'none';
      document.getElementById('inputAmount').style.display = 'none';
      document.getElementById('inputHint').style.display = 'none';
      document.getElementById('MessageButton').style.display = 'block';
      document.getElementById('inputMessage').style.display = 'block';
    }
  }
  else{

    //team buttons
    document.getElementById('redspymasterbutton').style.display = 'block';
    document.getElementById('greenspymasterbutton').style.display = 'block';
    document.getElementById('bluespymasterbutton').style.display = 'block';
    document.getElementById('redoperativebutton').style.display = 'block';
    document.getElementById('greenoperativebutton').style.display = 'block';
    document.getElementById('blueoperativebutton').style.display = 'block';

    //settings buttons
    document.getElementById('quitbutton').style.display = 'none';
    document.getElementById('passbutton').style.display = 'none';
    document.getElementById('leavebutton').style.display = 'flex';
    if(isMeAdmin() ){
      document.getElementById('settingsbutton').style.display = 'flex';
      document.getElementById('startbutton').style.display = 'flex';
      if (drafting) {
        document.getElementById('settingsbutton').style.display = 'none';
        document.getElementById('cancelsettingsbutton').style.display = 'none';
        document.getElementById('savesettingsbutton').style.display = 'none';
        document.getElementById('boardSizeSettings').style.display = 'none';
        document.getElementById('specialSettings').style.display = 'none';
        document.getElementById('teamSizeSettings').style.display = 'none';
        document.getElementById('timerSettings').style.display = 'none';
      } else {
        if(isShowSettings){
          document.getElementById('cancelsettingsbutton').style.display = 'flex';
          document.getElementById('savesettingsbutton').style.display = 'flex';
          document.getElementById('boardSizeSettings').style.display = 'flex';
          document.getElementById('specialSettings').style.display = 'flex';
          document.getElementById('teamSizeSettings').style.display = 'flex';
          document.getElementById('timerSettings').style.display = 'flex';
          document.getElementById('startbutton').style.display = 'none';
          document.getElementById('settingsbutton').style.display = 'none';
          document.getElementById('leavebutton').style.display = 'none';
        }
        else{
          document.getElementById('cancelsettingsbutton').style.display = 'none';
          document.getElementById('savesettingsbutton').style.display = 'none';
          document.getElementById('boardSizeSettings').style.display = 'none';
          document.getElementById('specialSettings').style.display = 'none';
          document.getElementById('teamSizeSettings').style.display = 'none';
          document.getElementById('timerSettings').style.display = 'none';
        }
      }

    }
    else{
      document.getElementById('settingsbutton').style.display = 'none';
      document.getElementById('startbutton').style.display = 'none';
	  }

    //hint message box
    document.getElementById('redHintText').style.display = 'none';
    document.getElementById('greenHintText').style.display = 'none';
    document.getElementById('blueHintText').style.display = 'none';

    //chat buttons
    document.getElementById('HintButton').style.display = 'none';
    document.getElementById('inputHint').style.display = 'none';
    document.getElementById('inputAmount').style.display = 'none';
    document.getElementById('MessageButton').style.display = 'block';
    document.getElementById('inputMessage').style.display = 'block';
	
    document.getElementById('hurrybutton').style.display = 'none';
    document.getElementById('blankoutbutton').style.display = 'none';
  }
  
}

function isMeAdmin(){
	return userId == adminUser;
}
function getMyTeam(){
	var myTeamNr=0;
	for(var i=0;i<teams.length;i++){
		if(teams[i].players.indexOf(userId)>=0 || teams[i].spymasters.indexOf(userId)>=0){
			myTeamNr=i;
		}
	}
	return myTeamNr;
}

function isMeSpymaster(){
	for(var i=0;i<teams.length;i++){
		if(teams[i].spymasters.indexOf(getUserId())>=0){
			return true;
		}
	}
	return false;
}

function isMyTurn(){
	return(turn.teamNr == getMyTeam() && turn.spymaster==isMeSpymaster());
	
}

function endTurn(){
	socket.emit(GAME_NAME+"_endTurn"+gameId,getUserId());
	
}

function leave(){
	joinTeam(0, false);
}

function startGame(){
	socket.emit(GAME_NAME+"_startGame"+gameId,getUserId());
	
}

function quitGame(){
  delete_turncard();
	socket.emit(GAME_NAME+"_quitGame"+gameId,getUserId());
}


function joinTeam(teamNumber, spymasterBool){	
  if (!running) {
	  joinGame( teamNumber, spymasterBool);
  }
}

function getMyPersonalScore(){
	var cookie= getCookie("myPersonalScore");
	if(cookie==null || cookie==undefined || cookie==""){
		var myPersonalScore={myTotalGames:0,myTotalWins:0, myTotalLoses:0, myGamesAsSpymaster:0, myGamesAsTeammember:0, myWinsAsTeammember:0, myWinsAsSpymaster:0, myLosesAsSpymaster:0,myLosesAsTeammember:0,myGamesAsTeam1:0,myGamesAsTeam2:0,myGamesAsTeam3:0, blackCardsTapped:0};
		setCookie("myPersonalScore",JSON.stringify(myPersonalScore),9999);
		return myPersonalScore;
	}else{
	var myPersonalScore= JSON.parse(cookie);	
	return  myPersonalScore;
	}
}



function hurryTime(){
  socket.emit(GAME_NAME+"_hurrytime"+gameId, getUserId());
};

function blankOut(){
  if (getMyAbilityCharges() > 0){
    blankedActive = !blankedActive;
    var table = document.getElementById('cardboard');
    var tbody = table.firstElementChild;
    var trs = tbody.children;
    for (var i = 0; i < trs.length; i++){
      tds = trs[i].children;
      for (var j = 0; j < tds.length; j++){
        if (blankedActive){
          tds[j].classList.add("blankedout");
        } else {
          tds[j].classList.remove("blankedout");
        }
      }
    }
  } 
  
};

function getMyAbilityCharges(){
  for (var i = 0; i < abilityList?.length; i++){
    if (abilityList[i].userId ==getUserId()){
      return abilityList[i].charges;
    }
  }
  return 0;
}


function logChatGPT(){
  loggingChatGPT = !loggingChatGPT;
  return console.log("we are logging:",loggingChatGPT);
}

function printForChatGPT(board){

  var team_names = ["","red","blue","green"];

  var thePrompt = "We have made a game similar to codenames. The rules are as follows: there are " + board.boardSize + " cards each with a word on it. " +
  "Each card has a secret color that only the spymaster can see. The secret colors are grey, red, blue and black. " +
  "The spymaster is allowed to give a 1 word hint accompanied by a number to make his team guess which words and how many of those belong to their team. "+
  "For instance if the spymaster for team red knows that the cards 'fire', 'oven' and 'red' are red words, he could give the hint: 'hot 3' to the operatives of his team. " +
  "The spymaster is not allowed to give a hint which contains a word or a subword which is on a card that has not yet been guess. " +
  "For example if one of the cards has the word 'Netherlands' on it, he is not allowed to hint the world 'Netherlands', 'Netherland', 'Nether', 'land' or 'lands'. " +
  "After the spymaster gives a hint, the operatives of his team start guessing which cards belong to the hint. They can guess a number of times equal to the number of the hint plus. " +
  "However if they guess a card which does not belong to their team, they immediately pass the turn to the other team. " +
  "If they guess the black card, they lose the game, and the other team wins the game. " +
  "A good hint from the spymaster has the following properties: "+
  "1) it avoids relating to black cards and cards from the other team." +
  "2) the connection of the hint towards the words is something your operatives can figure out. " +
  "3) the number of the hint is as high as possible while maintaing 1) and 2). " +
  "Could you give me 5 good hints as if you were a spymaster for team " + team_names[getMyTeam()] + ", considering the rules as outlined above, with the following unguessed cards/words, and their secret colors:";

  for (var i = 0; i < board.boardSize; i++) {
    if (!board.card[i].visible){
      thePrompt += " [" + board.card[i].word.toUpperCase() + "," + board.card[i].color + "] ";
    }
  }

  console.log(thePrompt);
}