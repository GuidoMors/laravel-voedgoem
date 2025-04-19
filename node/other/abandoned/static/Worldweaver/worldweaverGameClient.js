/*Script for general clientside functions*/

/*GLOBALS*/

var GAME_NAME="Worldweaver";
var gameId;
var gameState;
var isPlayer;
var isHost;

// call the function that runs on loading the page
onLoadInit();

/**
Define Socket Listeners (general)
**/

socket.on(GAME_NAME+"_receiveGameState", function(newGameState, newGameId){
	gameId = newGameId;
	gameState=newGameState;
	isPlayer=isMePlayer();
	isHost=isMeHost();

	drawGameLobby();
});


// function that runs on loading the page
function onLoadInit(){

	setTimeout(function(){//it takes some time to send and receive gamestate so we wait 100 ms
		
        socket.emit(GAME_NAME+"_requestGameState", socket.id);

	}
	,  100);

};

function factionClick(n){
	socket.emit(GAME_NAME+'_changeFactions', factionlist[n], userId);
}

function courtClick(character, slot){
	socket.emit(GAME_NAME+'_changeCourt', getMeAsPlayer().faction.characters[character], slot, userId);
}


