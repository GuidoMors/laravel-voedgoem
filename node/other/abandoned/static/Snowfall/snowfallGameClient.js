/*Script for general client-Side functions*/


/** general VARIABLES**/

var GAME_NAME="Snowfall";
var postGameDrawn = false;

function doMoreOnReceiveGameSettings(){
	if(gameState.isRunning){
		
		
		removeLobby();
		activateSideTab();
		
	} else {
		drawGameLobby();
	}
	
}

function doMoreOnLoad(){
	//console.log("doMoreOnLoad");
	
}



function drawStartAnimation(){
	//console.log("drawStartanim");
	var canvas = document.getElementById('overlayCanvas');
	canvas.width = 1000;
	canvas.height = 1000;
	var context = canvas.getContext('2d');
	context.clearRect(0, 0, canvas.width, canvas.height);
	context.fillStyle = "black";
	if (intermediateGameState.gameTimer < 0) {
		context.globalAlpha = 0;
	} else if (intermediateGameState.gameTimer > 5) {
		context.globalAlpha = 1.0;
	} else {
		context.globalAlpha = 1.0 - 0.2*(intermediateGameState.gameTimer);

	}	
	context.fillRect(0, 0, canvas.width, canvas.height );
	context.globalAlpha = 1.0;

	fontSize = 250;

	if (intermediateGameState.gameTimer >= 2 && intermediateGameState.gameTimer < 5) {
		context.fillStyle = 'black';
		context.font = fontSize+'px Arial';	
		context.fillText((5-intermediateGameState.gameTimer), ((canvas.width-(fontSize/2) )/ 2), ((canvas.height+fontSize)/2));
		
		context.fillStyle = 'white';
		context.font = (fontSize-20)+'px Arial';	
		context.fillText((5-intermediateGameState.gameTimer), ((canvas.width-(fontSize/2) )/ 2)+2, ((canvas.height+fontSize)/2));

	}
}

function drawGamePause(){
	var canvas = document.getElementById('overlayCanvas');
	canvas.width = gameState.map.grid[0].length*gameSettings.tileSizeW;
	canvas.height = gameState.map.grid.length*gameSettings.tileSizeH;
	var context = canvas.getContext('2d');
	context.clearRect(0, 0, canvas.width, canvas.height);
	context.fillStyle = 'green';
	context.font = '48px Arial';	
	context.fillText("..GAME IS PAUSED..", canvas.width / 4, canvas.height/2);
	console.log("draw pause");
	
}

function drawPostGame(){
	//console.log("drawPostGame");
	if (!postGameDrawn){
		activateChatTab();
		postGameDrawn = true;
		deleteGuiElement("postGameScreen");

		var wrapper = document.getElementById("canvasWrapper");
	
		var postgame=document.createElement("div");
		postgame.setAttribute("id","postGameScreen");
		postgame.classList.add("postGameScreen");
	
		wrapper.appendChild(postgame);

		
		//console.log("SCORE: "+ JSON.stringify(intermediateGameState.score));

		var victoryBar = document.createElement("div");
		victoryBar.classList.add("victoryBar");
		postgame.appendChild(victoryBar);
		victoryBar.innerHTML = "Game Over";

		var scoreContainer = document.createElement("div");
		scoreContainer.setAttribute("id","scoreContainer");
		scoreContainer.classList.add("scoreContainer");
	
		postgame.appendChild(scoreContainer);

		if (gameState.host==userId) {
			var finishGameButton=document.createElement("button");
			finishGameButton.setAttribute("id","finishGameButton");
			finishGameButton.innerHTML = "Back to Lobby";
			finishGameButton.classList.add("finishGameButton");
			finishGameButton.classList.add("BigButton");
			finishGameButton.addEventListener('click', function(event) {
				finishGame();
			});	
			postgame.appendChild(finishGameButton);	
		}
	}

}



function doMoreOnReceiveGameState(){
		
	console.log(" GAME STATE: "+JSON.stringify(gameState));
}

function doOnReceiveQuickGameState(newQuickGameState){
	quickGameState=newQuickGameState;
	
	console.log("QUICK GAME STATE: "+JSON.stringify(quickGameState));
	clearCanvas();
	drawMap();	
	drawGameScore();
	
		
	
}

function doOnReceiveIntermediateGameState(newIntermediateGameState){
	intermediateGameState=newIntermediateGameState;

	console.log("INTERMEDIATE GAME STATE: "+JSON.stringify(intermediateGameState));

	if(intermediateGameState.isPaused){
		drawGamePause();
		
	}
	else{
		
		if (intermediateGameState.gameTimer == -1) {
				drawPostGame();
			} else if (intermediateGameState.gameTimer < 5) {
                postGameDrawn = false;
                drawStartAnimation();
			} else {//if (intermediateGameState.gameTimer-5<3){
				
				clearOverlayCanvas();
			}
	}
	
}


function clearOverlayCanvas() {
	var canvas = document.getElementById('overlayCanvas');
	var context = canvas.getContext('2d');
	context.clearRect(0, 0, canvas.width, canvas.height);
}


function clearCanvas() {
	var canvas = document.getElementById('canvas');
	var context = canvas.getContext('2d');
	context.clearRect(0, 0, canvas.width, canvas.height);
}

function drawMap(){
	
	
	
	
	
}

function drawGameScore(){
	var log = document.getElementById('sideLog');

	deleteGuiElementContents('sideLog');

	var gametimer = document.createElement("div");
	log.appendChild(gametimer);
	gametimer.classList.add("gametimer");
	var timertext = Math.floor(intermediateGameState.gameTime/60);
	
	if (Math.floor(intermediateGameState.gameTime%60) < 10){
		timertext = timertext + ":0" + Math.floor(intermediateGameState.gameTime%60);
	} else {
		timertext = timertext + ":" + Math.floor(intermediateGameState.gameTime%60);
	}
	gametimer.innerHTML = timertext;


}
	