/*Script to render the general Lobby that provides an overview over all currently hosted games.*/
var GAME_NAME = "Lobby";

function clearLobby(){
	deleteGuiElement('lobbyDiv');
	deleteGuiElement('characterSelectionDiv');
	deleteGuiElement('playerPics');
	deleteGuiElement('gameLogoDiv');
	var logoutButton=document.getElementById("logoutButton");
	logoutButton.style.display = "block";
}


function drawLobby(gameRooms, games){
	
	clearLogin();
	clearLobby();
	clearQR();
	renderLogo();
	enableTab();

	var right = document.getElementById("right");
	var qrDiv = document.createElement("div");
	qrDiv.setAttribute("id","qrDiv");
	qrDiv.classList.add("qrDiv");
	qrDiv.classList.add("neonwhite");
	qrDiv.classList.add("neonborder");
	right.appendChild(qrDiv);

	var left = document.getElementById("left");
	var qrDiv = document.createElement("div");
	qrDiv.setAttribute("id","qrDivTwo");
	qrDiv.classList.add("qrDiv");
	qrDiv.classList.add("neonwhite");
	qrDiv.classList.add("neonborder");
	left.appendChild(qrDiv);

	fetch('http://localhost:2222/qrcode') 
    .then(response => response.json())
    .then(data => {
        var qrDiv = document.getElementById("qrDiv");
        while (qrDiv.firstChild) {
            qrDiv.removeChild(qrDiv.firstChild);
        }

		var qrDivTwo = document.getElementById("qrDivTwo"); 
        while (qrDivTwo.firstChild) {
            qrDivTwo.removeChild(qrDivTwo.firstChild);
        }
        
        var img = document.createElement("img");
        img.src = data.src;
        img.alt = "QR Code";
		qrDiv.appendChild(img);

		var img = document.createElement("img");
        img.src = data.src;
        img.alt = "QR Code";
        qrDivTwo.appendChild(img);
    })
    .catch(err => {
        console.error('Error fetching QR code:', err);
    });

	var lobbyDiv=document.createElement("div");
	lobbyDiv.setAttribute("id","lobbyDiv");
	lobbyDiv.classList.add("lobbyDiv");
	lobbyDiv.classList.add("neonborder");
	lobbyDiv.classList.add("neongreen");
	
	var board= document.getElementById("board");
	board.appendChild(lobbyDiv);
	
	
	//create room part:
	
	var createGameRoomDiv=document.createElement("div");
	createGameRoomDiv.setAttribute("id","createGameRoomDiv");
	createGameRoomDiv.classList.add("createGameRoomDiv");
	lobbyDiv.appendChild(createGameRoomDiv);
	
	
	var createGameRoomNameField=document.createElement("input");
	createGameRoomNameField.setAttribute("id","createGameRoomNameField");
	createGameRoomNameField.setAttribute("placeholder","Game Room Name");
	createGameRoomNameField.classList.add("createGameRoomNameField");
	createGameRoomDiv.appendChild(createGameRoomNameField);

	var createGameRoomPwField=document.createElement("input");
	createGameRoomPwField.setAttribute("id","createGameRoomPwField");
	createGameRoomPwField.setAttribute("placeholder","Password");
	createGameRoomPwField.classList.add("createGameRoomPwField");
	createGameRoomDiv.appendChild(createGameRoomPwField);
	
		
	var createGameRoomSelectType = document.createElement('select');	
	createGameRoomSelectType.setAttribute("id","createGameRoomSelectType");
	createGameRoomSelectType.classList.add("createGameRoomSelectType");
	createGameRoomSelectType.classList.add("neonwhite");
	createGameRoomSelectType.classList.add("neonborder");
	createGameRoomSelectType.classList.add("neonbutton");
	
	for (var i = 0; i < games.length; i++) {
		var option = new Option(games[i]);
    	createGameRoomSelectType.options[i] = option;
	}
	
	createGameRoomDiv.appendChild(createGameRoomSelectType);	
	createGameRoomSelectType.selectedIndex=0;
	
	var createGameRoomSelectMaxPlayers = document.createElement('select');
	createGameRoomSelectMaxPlayers.setAttribute("id","createGameRoomSelectMaxPlayers");
	createGameRoomSelectMaxPlayers.classList.add("createGameRoomSelectMaxPlayers");
	createGameRoomSelectMaxPlayers.classList.add("neonwhite");
	createGameRoomSelectMaxPlayers.classList.add("neonborder");
	createGameRoomSelectMaxPlayers.classList.add("neonbutton");
	
    for(var i=0;i<16;i++){
      var option = new Option(''+(i+1), ''+(i+1));
      createGameRoomSelectMaxPlayers.options[i] = option;
    }
	 var option = new Option('∞', '∞');
	createGameRoomSelectMaxPlayers.options[i] = option;
	createGameRoomSelectMaxPlayers.selectedIndex=i;
	createGameRoomDiv.appendChild(createGameRoomSelectMaxPlayers);

	var createGameRoomButtonContainer=document.createElement("div"); 
	createGameRoomButtonContainer.classList.add("gameRoomButtonContainer");
	createGameRoomDiv.appendChild(createGameRoomButtonContainer);
	var createGameRoomButton=document.createElement("button");
	createGameRoomButton.setAttribute("id","createGameRoomButton");
	createGameRoomButton.classList.add("createGameRoomButton");
	createGameRoomButton.classList.add("BigButton");
	createGameRoomButton.classList.add("neongreen");
	createGameRoomButton.classList.add("neonborder");
	createGameRoomButton.classList.add("neonbutton");
	createGameRoomButton.innerHTML="Create Game Room";
	createGameRoomButton.addEventListener('click', function(event) {
		createGameRoom();
	});		
	createGameRoomButtonContainer.appendChild(createGameRoomButton);


	for(var i=1; i<gameRooms.length;i++){
		var gameRoomDiv=document.createElement("div");
		gameRoomDiv.setAttribute("id","gameRoom_"+i);
		gameRoomDiv.classList.add("gameRoomDiv");
		
		var gameRoomNameDiv=document.createElement("div");
		//gameRoomNameDiv.setAttribute("id","gameRoom_"+i);
		gameRoomNameDiv.classList.add("gameRoomNameDiv");
		gameRoomNameDiv.innerHTML="<p class='bigfont'>Room:</p><p class='notneon'>"+gameRooms[i].gameName+"</p>";
		gameRoomDiv.appendChild(gameRoomNameDiv);
		
		var gameRoomHostDiv=document.createElement("div");
		//gameRoomHostDiv.setAttribute("id","gameRoom_"+i);
		gameRoomHostDiv.classList.add("gameRoomHostDiv");
		gameRoomHostDiv.innerHTML="<p class='bigfont'>Host:</p><p class='notneon'>"+getUserNameById(gameRooms[i].host)+"</p>";
		gameRoomDiv.appendChild(gameRoomHostDiv);
		
		var gameRoomTypeDiv=document.createElement("div");
		gameRoomTypeDiv.classList.add("gameRoomTypeDiv");

		var gameImg=document.createElement("img");
		gameImg.src = "/static/"+gameRooms[i].gameType+"/images/favicon.ico";

		var gameTypeText=document.createElement("p");
		gameTypeText.innerHTML = gameRooms[i].gameType;

		gameRoomTypeDiv.appendChild(gameImg);
		gameRoomTypeDiv.appendChild(gameTypeText);
		gameRoomDiv.appendChild(gameRoomTypeDiv);
		
		var gameRoomRunningDiv=document.createElement("div");
		//gameRoomRunningDiv.setAttribute("id","gameRoom_"+i);
		gameRoomRunningDiv.classList.add("gameRoomRunningDiv");
		gameRoomRunningDiv.innerHTML="<p class='bigfont'>State:</p><p class='notneon'>"+(gameRooms[i].isRunning?"Playing the game":"Gathering more players"+"</p>");
		gameRoomDiv.appendChild(gameRoomRunningDiv);

		var gameRoomPlayersDiv=document.createElement("div");
		//gameRoomPlayersDiv.setAttribute("id","gameRoom_"+i);
		gameRoomPlayersDiv.classList.add("gameRoomPlayersDiv");
		gameRoomPlayersDiv.innerHTML="<p class='bigfont'>Players:</p><p class='notneon'>"+gameRooms[i].players.length+"/"+gameRooms[i].maxPlayers+"</p>";
		gameRoomDiv.appendChild(gameRoomPlayersDiv);
		
		var gameRoomJoinButton=document.createElement("button");
		gameRoomJoinButton.setAttribute("id","joinGameRoom_"+gameRooms[i].gameId);
		gameRoomJoinButton.classList.add("gameRoomJoinButton");
		gameRoomJoinButton.innerHTML="Join";
		gameRoomJoinButton.addEventListener('click', function(event) {
			var selectedGameId=event.target.id.replace("joinGameRoom_","");  
			joinGame(selectedGameId);
		});		
		gameRoomDiv.appendChild(gameRoomJoinButton);

		var locksymbol = document.createElement("div");
		locksymbol.classList.add("locksymbol");

		if(gameRooms[i].pw != false){
			locksymbol.classList.add("locked");
		}
		gameRoomDiv.appendChild(locksymbol);		
		lobbyDiv.appendChild(gameRoomDiv);		
	}
}



function clearLogin(){
	deleteGuiElement('loginDiv');
	deleteGuiElement('failDiv');
	deleteGuiElement('gameLogoDiv');
	var logoutButton=document.getElementById("logoutButton");
	logoutButton.style.display = "block";
}

function clearLobby(){
	deleteGuiElement('loginDiv');
	deleteGuiElement('failDiv');
	deleteGuiElement('gameLogoDiv');
	var logoutButton=document.getElementById("logoutButton");
	logoutButton.style.display = "block";
}

function clearQR(){
	deleteGuiElement('qrDiv');
}

function renderLogo(){
	var logoDiv=document.createElement("div");
	logoDiv.setAttribute("id","gameLogoDiv");
	logoDiv.classList.add("gameLogo");
	logoDiv.classList.add("neongreen");
	
	var board= document.getElementById("board");
	board.appendChild(logoDiv);
	logoDiv.innerHTML="voedgoem";
		
	//var logoImg= document.createElement("img");
	//logoImg.src="/static/common/images/gameLogo.png";
	//logoDiv.appendChild(logoImg);
}


function enableTab(){
	var right = document.getElementById("right");
	right.style.display = "block";

	var logoutButton= document.getElementById("logoutButton");
	logoutButton.disabled = false;	

	var whosHereButton = document.getElementById("playerlistButton");
	whosHereButton.disabled = false;	

	var changeNameButton = document.getElementById("changeNameButton");
	changeNameButton.disabled = false;	
	
	var messageButton = document.getElementById("messageButton");
	messageButton.disabled = false;	
	
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

function deleteGuiElementContents(IdToCleared) {
	var toBeCleared = document.getElementById(IdToCleared);
	toBeCleared.innerHTML="";
}


function clearBoard(){
	deleteGuiElementContents("board");
	var logoutButton=document.getElementById("logoutButton");
	logoutButton.style.display = "block";
}

function drawFailMessage(message){
	var failDiv = document.getElementById('failDiv');
	if (failDiv){
		failDiv.innerHTML = message;
	}
	
}