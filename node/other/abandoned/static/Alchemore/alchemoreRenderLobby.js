/*Script to render a game-specific lobby.*/
var selectedBody=0;
var selectedFace=0;
var selectedHat=0;

//getting the colors from teh color pickers
//getting the colors from teh color pickers
var hatColor = [10,100,255];
var faceColor = [150,75,10];
var bodyColor = [15,200,0];

var hatColorIsChecked = false;
var faceColorIsChecked = false;
var bodyColorIsChecked = false;

var customFaces;
var customBodies;
var customHats;


var selectedTeam=1;

var selectedCharacter;

function getReceivedSelectedCharacter(){
	return selectedCharacter;
}

//refresh html when new player connects // Press F5
socket.emit(GAME_NAME+"_requireCustomizations");		

socket.on(GAME_NAME+"_receiveCustomizations", function(customizationOptions, customCharacter){	
	//console.log("receive customizations");
	customizationOptions=customizationOptions;
	selectedCharacter=customCharacter;
});

function removeLobby(){
	var middle = document.getElementById("middle");
	middle.style.display = "none";

	var wrapper = document.getElementById("canvasWrapper");
	wrapper.style.display = "block";
}


function clearGameLobby(){
	//console.log("clear game lobby");
	deleteGuiElement('lobbyDiv');
	deleteGuiElement('characterSelectionDiv');
	deleteGuiElement('playerPics');
	deleteGuiElement('gameLogoDiv');
	
}

function createTeamDiv(playerListToDraw){
	console.log("create team div "+JSON.stringify(playerListToDraw));
	var playerPics=document.createElement("div");
	playerPics.setAttribute("id","playerPics");
	playerPics.classList.add("playerPicsLobby");
	for(var i=0;i<playerListToDraw.length;i++){
			var characterDivImage= createCharacterImageDivPlayer(i, getUserNameById(playerListToDraw[i].userId), playerListToDraw[i].selectedCharacter);
			playerPics.appendChild(characterDivImage);
		
		
	}
	return playerPics;
	
}

function drawCharacterSelection(){

	deleteGuiElement("characterSelectionDiv");
	deleteGuiElement("startGameButton");

	var characterSelectionDiv=document.createElement("div");
	characterSelectionDiv.setAttribute("id","characterSelectionDiv");
	characterSelectionDiv.classList.add("characterSelection");
	lobbyDiv.appendChild(characterSelectionDiv);

	var characterSelectionDivLeft=document.createElement("div");
	characterSelectionDivLeft.setAttribute("id","characterSelectionDivLeft");
	characterSelectionDivLeft.classList.add("characterSelectionDivLeft");

	var characterSelectionDivMiddle=document.createElement("div");
	characterSelectionDivMiddle.setAttribute("id","characterSelectionDivMiddle");
	characterSelectionDivMiddle.classList.add("characterSelectionDivMiddle");

	var characterSelectionDivRight=document.createElement("div");
	characterSelectionDivRight.setAttribute("id","characterSelectionDivRight");
	characterSelectionDivRight.classList.add("characterSelectionDivRight");

	characterSelectionDiv.appendChild(characterSelectionDivLeft);
	characterSelectionDiv.appendChild(characterSelectionDivMiddle);
	characterSelectionDiv.appendChild(characterSelectionDivRight);

	drawCharacterSelectionLeft(characterSelectionDivLeft);
	drawCharacterSelectionMiddle(characterSelectionDivMiddle);
	drawCharacterSelectionRight(characterSelectionDivRight);

	var startGameButton=document.createElement("button");
	startGameButton.setAttribute("id","startGameButton");
	startGameButton.innerHTML = "Start Game";
	startGameButton.classList.add("startGameButton");
	startGameButton.classList.add("BigButton");

	if  (isMeHost()) {
		startGameButton.addEventListener('click', function(event) {
			startGame();
		});	
		
	} else {
		startGameButton.disabled = true;
	}
	lobbyDiv.appendChild(startGameButton);	
	
	
}

//function drawCharacterSelectionLeft(docelement){}
//function drawCharacterSelectionMiddle(docelement){}
//function drawCharacterSelectionRight(docelement){}
//function createCharacterImageCanvas(id, name, selectedCharacter){}
//function getMySelectedCharacter();



function createCharacterImageDivDraft(id,name,selectedCharacter){
	var characterDivImage = document.createElement("div");
	characterDivImage.setAttribute("id","characterDivImage_"+id);
	if(id=="draft"){
		characterDivImage.classList.add("customImageDisplayDraft");
	}else{
		characterDivImage.classList.add("customImageDisplay");
	}
	var playerCanvas=createCharacterImageCanvas(id, name ,selectedCharacter);
	characterDivImage.appendChild(playerCanvas);
	
	var middle = document.getElementById("characterSelectionDivMiddle");
	var characterName = document.createElement("span"); 
	characterName.setAttribute("id","playerNameTag_"+id);
	characterName.classList.add("myPlayerNameTag");
	characterName.innerHTML=name;
	//draw/add them in correct order (first the one that is in the background)
	
	middle.appendChild(characterName);
	
	return characterDivImage;
	
	
}

	
	
	
function createCharacterImageDivPlayer(id, name,selectedCharacter){
	
	var characterDivImage = document.createElement("div");
	characterDivImage.setAttribute("id","characterDivImage_"+id);
	characterDivImage.classList.add("customImageDisplay");
	var playerCanvas=createCharacterImageCanvas(id, name ,selectedCharacter);
	characterDivImage.appendChild(playerCanvas);

	
	var characterName=document.createElement("span"); 
	characterName.setAttribute("id","playerNameTag_"+id);
	characterName.classList.add("playerNameTag");
	characterName.innerHTML=name;
	characterDivImage.appendChild(characterName);
	
	
	

	return characterDivImage;
	
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





function drawMyCharacterSelection(){
	deleteGuiElement("characterDivImage_draft");
	var characterSelectionDivMiddle = document.getElementById("characterSelectionDivMiddle");
	//var characterSelectionDivImage = document.createElement("canvas");

	var characterDivImage= createCharacterImageDivDraft("draft","", getMySelectedCharacter());

	characterSelectionDivMiddle.appendChild(characterDivImage);
	
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
	deleteGuiElementContents("middle");
	var leaveGameButton=document.getElementById("leaveGameButton");
	leaveGameButton.style.display = "block";
	
}





/**
Define Socket Listeners for Lobby Phase
**/
socket.on(GAME_NAME+"_receiveCustomizations", function(customizationOptions, customChef){		
	var dt = new Date();
	var utcDate = dt.toUTCString();
 
	//console.log("receiveCustomizationLists*****************"+utcDate);

	//console.log("customhats: "+customHats+" "+customHats[0]);
	
	//var newChef = {body: customizationOptions.customBodies[0].name, hat: customizationOptions.customHats[0].name, face: customizationOptions.customFaces[0].name, hatColor:hatColor, 
	//faceColor:faceColor, bodyColor:bodyColor, hasHatMask: false, hasFaceMask: false, hasBodyMask: false};
	customFaces=customizationOptions.customFaces;
	customBodies=customizationOptions.customBodies;
	customHats=customizationOptions.customHats;
	
	hatColorIsChecked=customChef.hasHatMask;
	faceColorIsChecked=customChef.hasFaceMask;
	bodyColorIsChecked=customChef.hasBodyMask;
	hatColor=customChef.hatColor;
	faceColor=customChef.faceColor;
	bodyColor=customChef.bodyColor;
	
	
	for(var i=0; i < customizationOptions.customFaces.length;i++){
		if(customizationOptions.customFaces[i].name==customChef.face){
			selectedFace=i;
		}
	}
		
	for(var i=0; i < customizationOptions.customHats.length;i++){
		if(customizationOptions.customHats[i].name==customChef.hat){
			selectedHat=i;
		}
	}	
	
	for(var i=0; i < customizationOptions.customBodies.length;i++){
		if(customizationOptions.customBodies[i].name==customChef.body){
			selectedBody=i;
		}
	}
	
	
});

function drawCharacterSelectionLeft(docelement){


	for (var i = cheflayer.length-1; i >= 0; i--) {

		var seperator = document.createElement("div");
		seperator.classList.add("characterSelectionDivSeperator");
		docelement.appendChild(seperator);

		var buttonLeft=document.createElement("button");
		buttonLeft.setAttribute("id",cheflayer[i]+"ButtonLeft");
		buttonLeft.innerHTML = "<";
		buttonLeft.classList.add("customImageButtonLeft");
		seperator.appendChild(buttonLeft);

		var buttonRight=document.createElement("button");
		buttonRight.setAttribute("id",cheflayer[i]+"ButtonRight");
		buttonRight.innerHTML = ">";
		buttonRight.classList.add("customImageButtonRight");
		seperator.appendChild(buttonRight);

		if (cheflayer[i] == "hat") {


			buttonLeft.addEventListener('click', function(event) {
				selectedHat--;
				if(selectedHat<0){
					selectedHat=customHats.length-1;
				}
				drawMyCharacterSelection();
			});	
			buttonRight.addEventListener('click', function(event) {
				selectedHat++;
				if(selectedHat>=customHats.length){
					selectedHat=0;
				}
				drawMyCharacterSelection();
			});	


		} else if (cheflayer[i] == "face") {


			buttonLeft.addEventListener('click', function(event) {
				selectedFace--;
				if(selectedFace<0){
					selectedFace=customFaces.length-1;
				}
				drawMyCharacterSelection();
			});	
			buttonRight.addEventListener('click', function(event) {
				selectedFace++;
				if(selectedFace>=customFaces.length){
					selectedFace=0;
				}
				drawMyCharacterSelection();
			});	


		} else if (cheflayer[i] == "body") {

			buttonLeft.addEventListener('click', function(event) {
				selectedBody--;
				if(selectedBody<0){
					selectedBody=customBodies.length-1;
				}
				drawMyCharacterSelection();
			});	
			buttonRight.addEventListener('click', function(event) {
				selectedBody++;
				if(selectedBody>=customBodies.length){
					selectedBody=0;
				}
				drawMyCharacterSelection();
			});	
		}

		
	}
	
	

}


function drawGameLobby(){
	//clearGameLobby();
	clearBoard();
	deleteGuiElement("postGameScreen");
	//console.log("draw game lobby");
	
	renderLogo();
	
	var lobbyDiv=document.createElement("div");
	lobbyDiv.setAttribute("id","lobbyDiv");
	lobbyDiv.classList.add("lobbyDiv");
	
	var middle= document.getElementById("middle");
	middle.appendChild(lobbyDiv);
	middle.style.display = "block";

	var teamblock=document.createElement("div");
	teamblock.setAttribute("id","teamblock");
	teamblock.classList.add("teamblock");
	teamblock.style.width = 100/(gameSettings.teams-1)+"%";
	var playerPics=createTeamDiv(gameState.players);
	
	teamblock.appendChild(playerPics);
	lobbyDiv.appendChild(teamblock);

	var joinGameButton=document.createElement("button");
	joinGameButton.setAttribute("id","joinGameButton_"+i);
	joinGameButton.innerHTML = "Join Game";
	joinGameButton.classList.add("joinGameButton");
	if (!Tools.isElementInList(gameState.players,"userId",userId)){
		joinGameButton.addEventListener('click', function(event) {
			var newTeamNr=event.srcElement.id.replace("joinGameButton_","");
			joinGame(1, getMySelectedCharacter());
		});		
	}
	teamblock.appendChild(joinGameButton);
	
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

		var kitchenPickerDiv =document.createElement("div");
		kitchenPickerDiv.setAttribute("id","kitchenPickerDiv");
		kitchenPickerDiv.classList.add("kitchenPicker");
		characterSelectionDiv.appendChild(kitchenPickerDiv);

		var mapButtons = [];
		for (var i =0; i < gameSettings.mapList.length;i++){
			mapButtons[i] = document.createElement("button");
			mapButtons[i].setAttribute("id",gameSettings.mapList[i].id);
			mapButtons[i].innerHTML = gameSettings.mapList[i].name;
			mapButtons[i].classList.add("kitchenChoosingButton");

			if (gameSettings.mapList[i].id == gameSettings.map) {
				mapButtons[i].classList.add("BigButton");
			}

			var kitchenBlock =document.createElement("div");
			kitchenBlock.classList.add("kitchenBlock");

			kitchenPickerDiv.appendChild(kitchenBlock);
			kitchenBlock.appendChild(mapButtons[i]);

		}

		var startGameButton=document.createElement("button");
		startGameButton.setAttribute("id","startGameButton");
		startGameButton.innerHTML = "Start Game";
		startGameButton.classList.add("startGameButton");
		startGameButton.classList.add("BigButton");
		if  (isMeHost()) {
			startGameButton.addEventListener('click', function(event) {
				startGame();
			});	
			
			for (var i = 0; i < gameSettings.mapList.length; i++){
				if (gameSettings.mapList[i].teamsize == (gameSettings.teams-1)){

					mapButtons[i].addEventListener('click', function(event) {
						setMap(event.currentTarget.id);
					});

				}
			}
		} else {
			startGameButton.disabled = true;
			
			for (var i = 0; i < gameSettings.mapList.length; i++){
				if (gameSettings.mapList[i].teamsize == (gameSettings.teams-1)){
					mapButtons[i].disabled = true;
				}
			}
		}
		lobbyDiv.appendChild(startGameButton);	
	}

}



function drawCharacterSelectionMiddle(docelement){
	
	
	drawMyCharacterSelection();
	
	
}

function drawCharacterSelectionRight(docelement){

	for (var i = cheflayer.length-1; i >= 0; i--) {
		var seperator = document.createElement("div");
		seperator.classList.add("characterSelectionDivSeperator");
		docelement.appendChild(seperator);

		var colorPicker=document.createElement("input");
		colorPicker.classList.add("customPickerLeft");
		colorPicker.setAttribute("type","color");
		colorPicker.setAttribute("id",cheflayer[i]+"ColorPicker");
		seperator.appendChild(colorPicker);

		var checkbox =document.createElement("input");
		checkbox.classList.add("colorpickerCheckbox");
		checkbox.setAttribute("type","checkbox");
		checkbox.setAttribute("id",cheflayer[i]+"Checkbox");
		seperator.appendChild(checkbox);

		if (cheflayer[i] == "body") {

			colorPicker.setAttribute("value",Tools.RGBToHex(bodyColor));
			colorPicker.addEventListener("change", function(){
				bodyColor = Tools.hexToRGB(document.getElementById('bodyColorPicker').value);
				drawCharacterSelection();
			}, false);

			checkbox.checked = bodyColorIsChecked;
			checkbox.addEventListener("change", function(){
				bodyColorIsChecked = this.checked;
				drawCharacterSelection();
			}, false);

		} else if (cheflayer[i] == "face") {

			colorPicker.setAttribute("value",Tools.RGBToHex(faceColor));
			colorPicker.addEventListener("change", function(){
				faceColor = Tools.hexToRGB(document.getElementById('faceColorPicker').value);
				drawCharacterSelection();
			}, false);

			checkbox.checked = faceColorIsChecked;
			checkbox.addEventListener("change", function(){
				faceColorIsChecked = this.checked;
				drawCharacterSelection();
			}, false);

		} else if (cheflayer[i] == "hat") {

			colorPicker.setAttribute("value",Tools.RGBToHex(hatColor));
			colorPicker.addEventListener("change", function(){
				hatColor = Tools.hexToRGB(document.getElementById('hatColorPicker').value);
				drawCharacterSelection();
			}, false);

			checkbox.checked = hatColorIsChecked;
			checkbox.addEventListener("change", function(){
				hatColorIsChecked = this.checked;
				drawCharacterSelection();
			}, false);

		}

	}
	
}


var draftImageData=[];


function createCharacterImageCanvas(id, name, selectedCharacter){// hat, face, body,newHatColor,newFaceColor,newBodyColor,wantHatMask,wantFaceMask,wantBodyMask){
	draftImageData[id]={id: id, imageCounter:0, maskImageCounter:0, imgs:[]};


	var canvas = document.createElement("canvas");
	if(id=="draft"){
		canvas.classList.add("characterCanvasDraft");
	}
	else{
		canvas.classList.add("characterCanvas");
	}
	canvas.width = 450;
	canvas.height = 300;
	canvas.setAttribute("id","characterCanvas_"+id);
	var context = canvas.getContext('2d');
	context.beginPath();

	//getting the pictures to be drawn and putting them in an array in order
	var sourceList = [
		"/static/common/images/Character2D/bodies/"+selectedCharacter.body+"/front/mask.png",
		"/static/common/images/Character2D/bodies/"+selectedCharacter.body+"/front/outline.png",
		"/static/common/images/Character2D/faces/"+selectedCharacter.face+"/front/mask.png",
		"/static/common/images/Character2D/faces/"+selectedCharacter.face+"/front/outline.png",
		"/static/common/images/Character2D/hats/"+selectedCharacter.hat+"/front/mask.png",
		"/static/common/images/Character2D/hats/"+selectedCharacter.hat+"/front/outline.png",
	];

	//first we create the image objects and set their source
	for (var i = 0; i < sourceList.length; i++) {
		var currentImg=new Image();
		draftImageData[id].imgs[i]=currentImg;
		currentImg.onload = function(){ draftImageData[id].imageCounter++; 
										onDraftMaskImagesLoaded(id,context,selectedCharacter.hatColor,selectedCharacter.faceColor,selectedCharacter.bodyColor,
										selectedCharacter.hasHatMask,selectedCharacter.hasFaceMask,selectedCharacter.hasBodyMask); 
									};
		currentImg.src = sourceList[i];
	}

	return canvas;

}




var onDraftMaskImagesLoaded = function(id, context ,newHatColor,newFaceColor,newBodyColor,wantHatMask,wantFaceMask,wantBodyMask) {

	var imgs=draftImageData[id].imgs;
    if (allDraftImagesLoaded(id)) {
        // all images are fully loaded an ready to use    
		draftImageData[id].imageCounter=0;
		draftImageData[id].maskImageCounter=0;
		for (var i = 0; i < imgs.length; i++) {
			var changedMaskImage=imgs[i];
			if (imgs[i].src.includes("mask")) {
				var doWeChange = false;
				if (imgs[i].src.includes("hats") && wantHatMask) {
					changedMaskImage=changeMaskImage(imgs[i], newHatColor, "front", wantHatMask);
					doWeChange = true;
				}
				if (imgs[i].src.includes("faces") && wantFaceMask) {
					changedMaskImage=changeMaskImage(imgs[i], newFaceColor, "front", wantFaceMask);
					doWeChange = true;
				}
				if (imgs[i].src.includes("bodies") && wantBodyMask) {
					changedMaskImage=changeMaskImage(imgs[i], newBodyColor, "front", wantBodyMask);
					doWeChange = true;
				}
				
				if (doWeChange) {
					imgs[i] = changedMaskImage;
					imgs[i].onload=function(){ draftImageData[id].maskImageCounter++; onDraftMaskImagesComplete(id,context); };
				}
				
			}
			
		}
	
	}	

	if (allDraftMaskImagesLoaded(id)) {
		onDraftMaskImagesComplete(id,context);
	}

};

var onDraftMaskImagesComplete = function(id,context ) {
	if (allDraftMaskImagesLoaded(id)) {
		var imgs=draftImageData[id].imgs;
	
		var x = 0;
		var y = 0;
		var w = 450;
		var h = 300;
		for (var i = 0; i < imgs.length; i++) {
				context.drawImage(imgs[i], x, y, w, h);  
			}
	 }
		
}

function getMySelectedCharacter(){
	
	var myCharacter={};
	myCharacter.hat=customHats[selectedHat].name;
	myCharacter.face=customFaces[selectedFace].name;
	myCharacter.body=customBodies[selectedBody].name;
	myCharacter.hatColor=hatColor;
	myCharacter.faceColor=faceColor;
	myCharacter.bodyColor=bodyColor;
	myCharacter.hasHatMask=hatColorIsChecked;
	myCharacter.hasFaceMask=faceColorIsChecked;
	myCharacter.hasBodyMask=bodyColorIsChecked;


	return myCharacter;	
}	

function allDraftImagesLoaded(id){
	var expectedAmount=6; //TODO
	return (draftImageData[id].imageCounter==expectedAmount);
	
}
function allDraftMaskImagesLoaded(id){
	var expectedAmount=draftImageData[id].maskImageCounter;
	return (draftImageData[id].maskImageCounter==expectedAmount);
	
}

	
	
	
	
function createCharacterImageDivPlayer(id, name,myCharacter){
	
	var characterDivImage = document.createElement("div");
	characterDivImage.setAttribute("id","characterDivImage_"+id);
	characterDivImage.classList.add("customImageDisplay");
	var playerCanvas=createCharacterImageCanvas(id, name ,myCharacter);
	characterDivImage.appendChild(playerCanvas);

	
	var characterName=document.createElement("span"); 
	characterName.setAttribute("id","playerNameTag_"+id);
	characterName.classList.add("playerNameTag");
	characterName.innerHTML=name;
	characterDivImage.appendChild(characterName);
	


	return characterDivImage;
	
}





