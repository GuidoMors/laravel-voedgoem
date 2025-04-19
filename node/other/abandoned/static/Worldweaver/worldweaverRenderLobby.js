/*Script for general clientside functions*/

/*GLOBALS*/

var GAME_NAME="Worldweaver";

function drawGameLobby (){

	deleteGuiElement('gameLogoDiv');
	deleteGuiElement('LobbyGames');

	var board = document.getElementById("middle");

	renderLogo();

	var LobbyGames = document.createElement("div");
	LobbyGames.classList.add("LobbyGames");
	LobbyGames.setAttribute("id","LobbyGames");

	board.appendChild(LobbyGames);

	var ButtonDivider = document.createElement("div");
	ButtonDivider.classList.add("ButtonDivider");
	LobbyGames.appendChild(ButtonDivider);

	drawMenuButton(ButtonDivider, "startGame", "Start Game");
 
	/*

	drawMenuButton(ButtonDivider, "changePassword", "Change Password");

	var kickPlayerButton = document.createElement("button");
	kickPlayerButton.classList.add("pregamekickbutton");
	kickPlayerButton.classList.add("startGameButton");
	ButtonDivider.appendChild(kickPlayerButton);
	kickPlayerButton.innerHTML = "Kick Player";
	

	if (isMeHost() && gameState.players.length > 1) {
		
		var kickplayers = document.createElement("div");
		kickplayers.classList.add("pregamecourtcontent");
		kickPlayerButton.appendChild(kickplayers);
		for (var k = 1; k < gameState.players.length; k++) {
			var divider = document.createElement("div");
			divider.classList.add("colordivider");
			divider.setAttribute("onclick","kick("+k+");");
			kickplayers.appendChild(divider);
	
			var tiletext = document.createElement("div");
			tiletext.classList.add("pregamecourttiletext");
			divider.appendChild(tiletext);
			tiletext.innerHTML = players[k].username;
		}

	} else {
		kickPlayerButton.disabled = true;
	}

	drawMenuButton(ButtonDivider, "", "Game Options");

	*/

	for (var i = 0; i < gameState.players.length; i++) {
		var pregameblock = document.createElement("div");
		pregameblock.classList.add("pregameblock");
		LobbyGames.appendChild(pregameblock);

		var pregamename = document.createElement("div");
		pregamename.classList.add("pregamename");
		pregamename.classList.add("text"+gameState.players[i].faction.color);
		pregamename.innerHTML = gameState.players[i].username;
		pregameblock.appendChild(pregamename);

		drawFactionDropdown(pregameblock, gameState.players[i]);

		var pregamecourt = document.createElement("div");
		pregamecourt.classList.add("pregamecourt");
		pregameblock.appendChild(pregamecourt);

		for (var j = 0; j < gameState.players[i].faction.factionpicks; j++) {

			var pregamecourtbutton = document.createElement("button");
			pregamecourtbutton.classList.add("pregamecourtbutton");
			pregamecourt.appendChild(pregamecourtbutton);

			if(!(gameState.players[i].court[j] == "")) {
				pregamecourtbutton.innerHTML = gameState.players[i].court[j].name;
			} else {
				pregamecourtbutton.innerHTML = "Unselected";
			}

			if (gameState.players[i].username == myUsername && gameState.players[i].court[j].name != "Lumon") {
				
				var pregamecourtcontent = document.createElement("div");
				pregamecourtcontent.classList.add("pregamecourtcontent");
				pregamecourtbutton.appendChild(pregamecourtcontent);
				for (var k = 0; k < gameState.players[i].faction.characters.length; k++) {
					if (!isCharacterTakenByPlayer(gameState.players[i].faction.characters[k].name, i)) {
						var divider = document.createElement("div");
						divider.classList.add("colordivider");
						divider.setAttribute("onclick","courtClick("+k+","+j+");");
						pregamecourtcontent.appendChild(divider);
				
						var tiletext = document.createElement("div");
						tiletext.classList.add("pregamecourttiletext");
						divider.appendChild(tiletext);
						
						if (k < gameState.players[i].faction.factionpicks){
							tiletext.innerHTML = "<i class='cardsubtext'>Recommended:</i><br> "+ gameState.players[i].faction.characters[k].name;
						} else {
							tiletext.innerHTML = gameState.players[i].faction.characters[k].name;
						}
					}
				}
	
			} else {
				pregamecourtbutton.disabled = true;
			}

		}
	}
}

function drawMenuButton(docelement, clickfunction, text) {
	var button = document.createElement("button");
	button.classList.add("startGameButton");
	button.setAttribute("type", "button");
	if (isMeHost() && clickfunction != "") {
		button.setAttribute("onclick", clickfunction+"();");
	} else {
		button.disabled = true;
	}
	button.innerHTML = text;
	docelement.appendChild(button);
}

function renderLogo(){
	var logoDiv=document.createElement("div");
	logoDiv.setAttribute("id","gameLogoDiv");
	logoDiv.classList.add("gameLogo");
	middle.appendChild(logoDiv);
	
	var logoImg= document.createElement("img");
	logoImg.src="/static/"+GAME_NAME+"/images/gameLogo.png";
	logoDiv.appendChild(logoImg);
		
}


function deleteGuiElement(IdToBeDeleted) {
	var toBeDeleted = document.getElementById(IdToBeDeleted);
	while (toBeDeleted) {
	  if (toBeDeleted) {
		toBeDeleted.parentElement.removeChild(toBeDeleted);
	  }
	  var toBeDeleted = document.getElementById(IdToBeDeleted);
	}
  }