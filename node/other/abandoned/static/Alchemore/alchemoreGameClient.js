/*Script for general client-Side functions*/


/** general VARIABLES**/

var GAME_NAME="Alchemore";
var quickGameState = {players: [], items: [], dispensers: []};
var targetXnY = {players: []};
var isBusy=true;
var postGameDrawn = false;
var votingScreenDrawn = false;
var NONE="none";
var cheflayers = ["bodies","faces","hats"];
var cheflayer = ["body","face","hat"];

var allItemsList;
var allToolsList;
var allTilesList;
var gameState;
var gameId;
var gameSettings;
var isPlayer=false;
var isHost=false;
var isBusy=true;
var intermediateGameState;
var quickGameState;
var cauldronVotes=[];
var playerVotes=[];




// call the function that runs on loading the page
onLoadInit();

/**
Define Socket Listeners (general)
**/


socket.on(GAME_NAME+"_receiveGameState", function(newGameState, newGameId){
	console.log("RECEIVE GAME STATE");
	gameId = newGameId;
	gameState=newGameState;
	isPlayer=isMePlayer();
	isHost=isMeHost();
	socket.emit(GAME_NAME+"_requestGameSettings"+gameId, socket.id);
	doMoreOnReceiveGameState();
});

socket.on(GAME_NAME+"_receiveGameSettings", function(newGameSettings){
	gameSettings=newGameSettings;
	
	doMoreOnReceiveGameSettings();

});


socket.on(GAME_NAME+"_receiveIntermediateGameState", function(newIntermediateGameState){
	doOnReceiveIntermediateGameState(newIntermediateGameState);
	
});


socket.on(GAME_NAME+"_receiveQuickGameState", function(newQuickGameState){	
	//console.log("receive quick game state");
	doOnReceiveQuickGameState(newQuickGameState);
});




socket.on(GAME_NAME+"_votingStarted", function(userIdThatClickedButton, cauldron){	
	console.log("VOTE STARTED; TO BE IMPLEMENTED..."+userIdThatClickedButton+" cauldron: "+JSON.stringify(cauldron));
	gameState.isVotingPhase=true;
 	votingScreenDrawn = false;
	refreshObjects();
});
socket.on(GAME_NAME+"_votesChanged", function(playerVotes, cauldronVotes){ // list of {userId, voted} each (voted is userId or a boolIsFlush)	
	console.log("VOTE CHANGED; TO BE IMPLEMENTED...");
	cauldronVotes=cauldronVotes;
	playerVotes=playerVotes;
	votingScreenDrawn=false;
	console.log(gameState.isRunning+" "+gameState.isVotingPhase);
	refreshObjects();
});	
socket.on(GAME_NAME+"_votingEnded", function(userIdToKick, isCauldronFlush){ 
	console.log("VOTE ENDED; TO BE IMPLEMENTED... user getting kicked: "+userIdToKick+" , cauldron is flushed? : "+isCauldronFlush);
		gameState.isVotingPhase=false;
		
		deleteVotingScreen();
});	
/**
these should be sent by client to server:
socket.on(this.gameType+"_votePlayer"+this.gameId, votingUserId, votedUserId);
socket.on(this.gameType+"_voteCauldron"+this.gameId, votingUserId, wantsFlush);

**/


/**
FUNCTIONS
**/

// function that runs on loading the page
function onLoadInit(){
	console.log("onLoadInit");
	setTimeout(function(){//it takes some time to send and receive gamestate so we wait 100 ms
		socket.emit(GAME_NAME+"_requestGameState", socket.id);
		console.log("asked for game state");
	}
	,  100);

	doMoreOnLoad();
}



function doMoreOnReceiveGameSettings(){
	if (allItemsList != undefined && allToolsList != undefined && allTilesList != undefined){
		initializeGamestate();
		isBusy = false;
		postGameDrawn = false;
		
	} else {
		socket.emit(GAME_NAME+"_requestIngredients"+gameId, socket.id);
	}

}
function doMoreOnReceiveGameState(){
		
}

socket.on(GAME_NAME+"_receiveIngredients", function(newAllItemsList){
	//console.log("ingredients");	
	//console.log("receive ingriedeitens game state");
	allItemsList=newAllItemsList;
	
	if (allToolsList != undefined  && allTilesList != undefined){
		initializeGamestate();
		
		isBusy = false;
		postGameDrawn = false;
		
		
	} else {
		socket.emit(GAME_NAME+"_requestTools"+gameId, socket.id);
	}

});

socket.on(GAME_NAME+"_receiveTools", function(newAllToolsList){
	//console.log("tools");
	//console.log("receive tools game state");
	allToolsList=newAllToolsList;
	if (allTilesList != undefined){
		initializeGamestate();
		
		isBusy = false;
		postGameDrawn = false;
		
	} else {
		socket.emit(GAME_NAME+"_requestTiles"+gameId, socket.id);
	}

});

socket.on(GAME_NAME+"_receiveTiles", function(newAllTilesList){
		//console.log("receive tiles game state");
	//console.log("tiles");
	allTilesList=newAllTilesList;
	initializeGamestate();
	isBusy = false;
	postGameDrawn = false;
});


// emit send periodically to update the location of object images currently drawn or to update the gamelobby
function doOnReceiveQuickGameState(reducedQuickGameState){
	//console.log(totalDraws);
	//console.log(reducedQuickGameState[0][7]);
	if(intermediateGameState != undefined){
		quickGameState.players = {};
		for (var i = 0; i < reducedQuickGameState[0].length; i++){
			if (reducedQuickGameState[0][i] != -1) {
				var newUserId = reducedQuickGameState[0][i][2];

				if (targetXnY.players.length == 0 || intermediateGameState.gameTimer < 3) {
					var playerX = reducedQuickGameState[0][i][0];
					var playerY = reducedQuickGameState[0][i][1];
				} else {
					var playerX = targetXnY.players[newUserId].x;
					var playerY = targetXnY.players[newUserId].y;
				}
				quickGameState.players[newUserId] = {
					x: playerX,
					y: playerY,
					userId: newUserId,
					direction: {
						up: reducedQuickGameState[0][i][3][0],
						down: reducedQuickGameState[0][i][3][1],
						left: reducedQuickGameState[0][i][3][2],
						right: reducedQuickGameState[0][i][3][3],
					},
					hands: {
						items: reducedQuickGameState[0][i][4][0],
						tool: reducedQuickGameState[0][i][4][1],
						progress: reducedQuickGameState[0][i][4][2],
						progressType: reducedQuickGameState[0][i][4][3]
					}
				}

			}
		}

		targetXnY.players = {};
		for (var i = 0; i < reducedQuickGameState[0].length; i++){
			if (reducedQuickGameState[0][i] != -1) {
				var newUserId = reducedQuickGameState[0][i][2];
				targetXnY.players[newUserId] = {
					x: reducedQuickGameState[0][i][0],
					y: reducedQuickGameState[0][i][1],
				};
			}
		}


		quickGameState.items = [];
		for (var i = 0; i < reducedQuickGameState[1].length; i++){
			quickGameState.items[i] = {
				x: reducedQuickGameState[1][i][0],
				y: reducedQuickGameState[1][i][1],
				items: reducedQuickGameState[1][i][2],
				tool: reducedQuickGameState[1][i][3],
				progress: reducedQuickGameState[1][i][4],
				progressType: reducedQuickGameState[1][i][5],
			}
		}

		if (gameSettings != null){
			totalDraws = Math.floor(FRAMES/gameSettings.updateTimer);
		} else {
			totalDraws = 1;
		}
	}

}

socket.on(GAME_NAME+"_receiveDispensers", function(reducedDispensers){	
	//console.log("dispensers");

	quickGameState.dispensers = [];
	for (var i = 0; i < reducedDispensers.length; i++){
		quickGameState.dispensers[i] = {
			x: reducedDispensers[i][0],
			y: reducedDispensers[i][1],
			tile: reducedDispensers[i][2],
			charges: reducedDispensers[i][3],
			secondsSinceLastCharged: reducedDispensers[i][4],
			overCharge: reducedDispensers[i][5],
			rate: reducedDispensers[i][6]
		}
	}
});

// emit send periodically to update the location of object images currently drawn or to update the gamelobby
function doOnReceiveIntermediateGameState(newIntermediateGameState){
//console.log("_receiveQuickGameState ");
	intermediateGameState=newIntermediateGameState;
	if(isBusy){
		//console.log("still busy with last event!");
	}
	if (gameState != null && !isBusy && allTilesList != undefined) {
		//drawRecipes();
	} else {
		//drawDarkness();
	}
}


socket.on(GAME_NAME+"_plateSubmitted", function(deltaScore, userId, x,y){	
	//console.log("plateSubmitted"+x+" "+y+" "+deltaScore);
	submitAnimations.push({score:deltaScore, x:x,y:y, userId:userId, timer:0});
});

socket.on(GAME_NAME+"_endGame", function(team, isWon, cauldron,recipe){	
	console.log("GAME ENDED. TEAM "+team+ (isWon? " won. ":" lost. ")+ " Recipe was: "+JSON.stringify(recipe)+" , cauldron contained: "+JSON.stringify(cauldron));
});




/**
FUNCTIONS
**/

// function that runs on loading the page. will be called from the genericClientGameCOntroller
function doMoreOnLoad(){
	setInterval(function(){//it takes some time to send and receive gamestate so we wait 100 ms

		if ((gameState != null && gameState.isRunning) || intervalCounter == 0){
			if (startImages.length == 0){
				//console.log("init start anim images");
				initStartAnimation();
			} else if (submitAnimImages.length == 0) {
				//console.log("init submit anim images");
				initializeAnimationImages();
			} else if (allTilesList != undefined && tilePictures.length == 0){
				//console.log("init tile images");
				initTileImages();
			} else if (allItemsList != undefined && allToolsList != undefined && itemImgs.length == 0){
				//console.log("init all item images");
				initItemImages();
			}
		}

		if (gameState != null && intermediateGameState != null && !isBusy && gameState.isRunning) {
			if (totalDraws > 0){
				moveQuickGameStateToTarget();
				totalDraws--;
			}
			isBusy=true;
			refreshObjects();
			isBusy=false;
		}

		intervalCounter = (intervalCounter + 1) % (FRAMES*5);

	}

	,  1000/FRAMES);
}

/** draws the entire gamestate, including all image objects for kitchen, players and items if the game is running
if the game is not runnning draws the lobby **/
function initializeGamestate(){
	
	if(gameState.isRunning){
		initKitchenImages();
		initPlayerImages();
		removeLobby();
		initClickEvents();
	} else {
		drawGameLobby();
	}

}


// updates the coordinates of all image objects in the canvas, or if the game is not running draws the lobby
function refreshObjects(){
	console.log("refreshobjects");
	if(gameState.isRunning){
		
		drawSideLog();
		
		if(gameState.isVotingPhase){
		//	console.log("Draw voting screen");
			drawVotingScreen();
			
		}
		else{
		
			if(allFloorImagesLoaded() && allMaskImagesLoaded() && allOutlineImagesLoaded() && quickGameState!= undefined && allTilesList != undefined && allToolsList != undefined){
				
				if(!isFloorDrawn){
					drawFloorImages();
					isFloorDrawn=true;
				}
				
				clearCanvas();
				for (var i = 0; i < gameState.map.grid.length; i++) {
					drawKitchen(i);
					drawItems(i);
					drawDispenserCharges(i);
					drawPlayers(i, "body");
					if(i>0){
						drawPlayers(i-1, "toponly");
					}
				}
				drawKitchenLastWalls();
				drawSubmitAnimations();
				drawFogOfWar();
				//drawRecipes();
				incrementIndexes();
			}
			if (intermediateGameState != undefined){
				if ( intermediateGameState.gameTimer == -1) {
					drawPostGame();
				} else if (intermediateGameState.gameTimer < 5) {
					drawStartAnimation();
				} else if (intermediateGameState.gameTimer-5<3){
					clearOverlayCanvas();
				}
			}
		}
	}
	else{
		drawGameLobby();
	}
}

function setMap(id){

	socket.emit(GAME_NAME+"_setMap"+gameId, id);
	
}


function getItemObjectById(itemId){
	var item=Object.values(allItemsList)[itemId];
	return item;
	
}




function getRowFromYCoordinate(y) {
	return parseInt(y/gameSettings.tileSizeH); 
}

function getColumnFromXCoordinate(x) {
	return parseInt(x/gameSettings.tileSizeW); 
}





function moveQuickGameStateToTarget(){
	if (totalDraws > 0) {
		for (var id in quickGameState.players){
			var qgPlayer = quickGameState.players[id];
			var xnyPlayer = targetXnY.players[id];
			var xDif = (xnyPlayer.x - qgPlayer.x)/totalDraws;
			var yDif = (xnyPlayer.y - qgPlayer.y)/totalDraws;
			quickGameState.players[id].x = quickGameState.players[id].x + xDif;
			quickGameState.players[id].y = quickGameState.players[id].y + yDif;
		}
	}
}