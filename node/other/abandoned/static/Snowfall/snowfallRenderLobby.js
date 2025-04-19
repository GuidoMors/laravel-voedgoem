/*Script to render a game-specific lobby.*/





function getMySelectedCharacter(){
	var selectedCharacter=getReceivedSelectedCharacter();
	//console.log("get my selected char.." +selectedCharacter);
	if(selectedCharacter==undefined){
		selectedCharacter={color: [10,100,255]};
		//console.log("give default color "+selectedCharacter);
	}

	
	return selectedCharacter;
}

function createCharacterImageCanvas(id, name, myCharacter){
	

	var canvas = document.createElement("canvas");
	if(id=="draft"){
		canvas.classList.add("characterCanvasDraft");
	}
	else{
		canvas.classList.add("characterCanvas");
	}

	var w = gameSettings.tileSizeW;
	var h = gameSettings.tileSizeH;


	canvas.width = w*2;
	canvas.height = h*3;
	canvas.setAttribute("id","characterCanvas_"+id);
	var context = canvas.getContext('2d');
	context.beginPath();

	var borderThickness=2;
	var borderColor="#000000";

	var matrix = [
		[1,0],
		[1,1],
		[1,0]
	];

	for(var y=0;y<3;y++){
		for(var x=0;x<2;x++){
			if (matrix[y][x]==1){
			//Border:
			context.fillStyle = borderColor;
			context.fillRect((x*w), (y*h), w, h);
			//Filling:
			context.fillStyle = Tools.RGBToHex(myCharacter.color);
			context.fillRect((x*w)+borderThickness, (y*h)+borderThickness, w-(borderThickness*2), h-(borderThickness*2));
			}
		}
	}

	return canvas;

}

function drawGameLobby(){
	//clearGameLobby();
	clearBoard();
	deleteGuiElement("postGameScreen");
	console.log("draw game lobby");
	
	renderLogo();
	
	var lobbyDiv=document.createElement("div");
	lobbyDiv.setAttribute("id","lobbyDiv");
	lobbyDiv.classList.add("lobbyDiv");
	
	var middle= document.getElementById("middle");
	middle.appendChild(lobbyDiv);
	middle.style.display = "block";

	for(var i=1;i<gameSettings.teams;i++){
		var teamblock=document.createElement("div");
		teamblock.setAttribute("id","teamblock"+i);
		teamblock.classList.add("teamblock");
		teamblock.style.width = 100/(gameSettings.teams-1)+"%";
		if (i%2 == 0){
			teamblock.classList.add("themeRed");
			
		}
		else{
			teamblock.classList.add("themeBlue");
		}
		var playerPics=createTeamDiv(gameState.players, i);
		
		teamblock.appendChild(playerPics);
		lobbyDiv.appendChild(teamblock);

		var joinGameButton=document.createElement("button");
		joinGameButton.setAttribute("id","joinGameButton_"+i);
		joinGameButton.innerHTML = "Join Team";
		joinGameButton.classList.add("joinGameButton");
		if (!Tools.isElementInList(gameState.players,"userId",userId)){
			joinGameButton.addEventListener('click', function(event) {
				var newTeamNr=event.srcElement.id.replace("joinGameButton_","");
				joinGame(newTeamNr, getMySelectedCharacter());
			});		
		}else {
			joinGameButton.addEventListener('click', function(event) {
				var newTeamNr=event.srcElement.id.replace("joinGameButton_","");
				changeTeam(newTeamNr); // just "i" didnt work, always defaulted i 3.
			});
		}

		teamblock.appendChild(joinGameButton);
	}
	
	
	
	var canvasWrapper = document.getElementById("canvasWrapper");
	canvasWrapper.style.display = "none";
	
	//if i am not a player myself yet, show me character selection.
	if(!Tools.isElementInList(gameState.players,"userId",userId)){
		drawCharacterSelection();
	} else {

		var characterSelectionDiv=document.createElement("div");
		characterSelectionDiv.setAttribute("id","characterSelectionDiv");
		characterSelectionDiv.classList.add("characterSelection");
		lobbyDiv.appendChild(characterSelectionDiv);
		
		var leavePlayersButton=document.createElement("button");
		leavePlayersButton.setAttribute("id","leavePlayersButton");
		if (GAME_NAME == "Tetrys"){
			leavePlayersButton.innerHTML = "Pick Color";
		} else {
			leavePlayersButton.innerHTML = "Edit Character";
		}
		leavePlayersButton.classList.add("editCharacterButton");
		leavePlayersButton.addEventListener('click', function(event) {
			leavePlayers();
		});		
		characterSelectionDiv.appendChild(leavePlayersButton);

		var lessTeamsButton =document.createElement("button");
		lessTeamsButton.setAttribute("id","lessTeamsButton");
		lessTeamsButton.innerHTML = "Teams--";
		lessTeamsButton.classList.add("teamChoosingButton");
		characterSelectionDiv.appendChild(lessTeamsButton);	

		var moreTeamsButton =document.createElement("button");
		moreTeamsButton.setAttribute("id","moreTeamsButton");
		moreTeamsButton.innerHTML = "Teams++";
		moreTeamsButton.classList.add("teamChoosingButton");
		characterSelectionDiv.appendChild(moreTeamsButton);	

		var startGameButton=document.createElement("button");
		startGameButton.setAttribute("id","startGameButton");
		startGameButton.innerHTML = "Start Game";
		startGameButton.classList.add("startGameButton");
		startGameButton.classList.add("BigButton");
		if  (isMeHost()) {
			startGameButton.addEventListener('click', function(event) {
				startGame();
			});	
			lessTeamsButton.addEventListener('click', function(event) {
                if(gameSettings.teams >= 3){
				    setTeams(gameSettings.teams-2); //server adds one again for spectators
                }
			});	
			moreTeamsButton.addEventListener('click', function(event) {
				setTeams(gameSettings.teams);//server adds already 1 for spectators
			});	
		} else {
			startGameButton.disabled = true;
			lessTeamsButton.disabled = true;
			moreTeamsButton.disabled = true;
		}
		lobbyDiv.appendChild(startGameButton);	
	}

}
function drawCharacterSelectionLeft(docelement){
	//left not needed
}


function drawCharacterSelectionMiddle(docelement){
	
	var colorPicker=document.createElement("input");
	colorPicker.classList.add("customPickerLeft");
	colorPicker.setAttribute("type","color");
	colorPicker.setAttribute("id","ColorPicker");
	docelement.appendChild(colorPicker);
	
	colorPicker.setAttribute("value",Tools.RGBToHex(selectedCharacter.color));
		colorPicker.addEventListener("change", function(){
			selectedCharacter.color = Tools.hexToRGB(document.getElementById('ColorPicker').value);
		}, false);
	
}

function drawCharacterSelectionRight(docelement){
	
	//right not needed
	
}


