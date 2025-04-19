/**
	MAIN RENDERERS
**/

function renderGame(){
  renderButtonVisibility();
  renderStateClasses();
  renderTopBarText();
  renderTeamScores();
  renderPlayersInTeams();
  renderObserverCards();
  renderTheCard();
}

function renderTheCard(){
  if (!gameState.running){
    deleteGuiElement('thecard');
  } else {
    //the card container
    var middle = document.getElementById('middlebar');
    var thecard = conjureElement('div', middle, 'thecard');

    if (gameState.aftergame){
      thecard.style.display = 'none';
      return;
    } else {
      thecard.style.display = 'block';
    }

    thecard.classList.remove(TEAM_NAMES_LOWER[0]);
    thecard.classList.remove(TEAM_NAMES_LOWER[1]);
    thecard.classList.remove(TEAM_NAMES_LOWER[2]);
    conjureClass(thecard, TEAM_NAMES_LOWER[gameState.turn.teamNr]);
  
    //two sides of the card
    var cardinner = conjureElement('div', thecard, 'card-inner');
    var cardfront = conjureElement('div', cardinner, 'card-front');
    var cardback = conjureElement('div', cardinner, 'card-back');

    
  
    if (gameState.turn.phase == 1){
      conjureClass(thecard, 'flipped');
      cardText = "<div class='hundred topScoreText'>"+gameState.timeLeft+"</div>"
      if (isMyCardTurn()){
        cardText += gameState.currentWords.join('<br>');
      }
      cardback.innerHTML = cardText;
    } else if (gameState.turn.phase == 2) {
      conjureClass(thecard, 'flipped');
      cardText = "<div class='hundred topScoreText'>Assign a score:</div>"
      for (var i = 0; i<gameState.currentWords.length;i++){
        if (isMyCardTurn()){
          cardText += '<div class="hundred"><input type="checkbox" class="cardScore">' + gameState.currentWords[i] +"</label></div>";
        } else {
          cardText += '<div class="hundred"><input type="checkbox" class="cardScore" disabled>' + gameState.currentWords[i] +"</label></div>";
        }
      }
      cardback.innerHTML = cardText;
    } else {
      thecard.classList.remove('flipped');
    }

    cardfront.innerHTML = 'FLIP ME';

    var cardflipper = conjureElement('div', thecard, 'card-flipper');
    cardflipper.style.display = "none";
    if(isMyCardTurn() && gameState.turn.phase == 0){
      cardflipper.addEventListener('click', requestCard);
      cardflipper.style.display = "block";
    } else {
      cardflipper.removeEventListener('click', requestCard);
      
    }

    if(isMyCardTurn() && gameState.turn.phase == 1){
      cardflipper.addEventListener('click', completeCard);
      cardflipper.style.display = "block";
    } else {
      cardflipper.removeEventListener('click', completeCard);
    }

    if(isMyCardTurn() && gameState.turn.phase == 2){
      cardflipper.addEventListener('click', receiveScore);
      cardflipper.style.display = "block";
    } else {
      cardflipper.removeEventListener('click', receiveScore);
    }
    
    var timegiver = conjureElement('div', thecard, 'time-giver');
    timegiver.style.display = "none";
    timegiver.innerHTML = '5';
    if(gameState.turn.phase == 1){
      var previousTurn = gameState.turn.teamNr - 1;
      if (previousTurn <= 0){
        var previousTurn = gameState.teams.length - 1;
      }
      if(gameState.teams[previousTurn].teamCaptainId == getUserId()){
        timegiver.style.display = "block";
        timegiver.addEventListener('click', giveTime);
      }
    }


  }

}

function renderObserverCards() {
  var players = gameState.players;

  var middle = document.getElementById('observerbar');
  var tbl = conjureElement('div', middle, 'observers');

  tbl.innerHTML = "";

  for (let i = 0; i < players.length; i++) {
    if (getUserIdTeam(players[i].userId) == 0){
      var cell = conjureElement('div', tbl);
      conjureClass(cell, "observerCard grey")
  
      var cellText = document.createTextNode(getUserNameById(players[i].userId));
      cell.appendChild(cellText);
      if (mayIdraft()){
        cell.addEventListener('click', function() {
          draftPlayer(getMyTeam(), players[i].userId);
        });
      }
    }
  }
}

function renderPlayersInTeams(){
  var players = gameState.players;

  var first = true;
  var playerBoxYellow = document.getElementById('yellowPlayerBoxInner');
  playerBoxYellow.innerHTML = "";
  for (var i = 0; i < players.length; i++) {
    if (getUserIdTeam(players[i].userId) == 1){
      var playerNameText = conjureElement('p', playerBoxYellow, "playerNameInBoxYellow", i);
      playerNameText.innerHTML = getUserNameById(players[i].userId);
      if (first){
        conjureClass(playerNameText, "captain");
        first = false;
      }
    }
  }

  var first = true;
  var playerBoxBlue = document.getElementById('bluePlayerBoxInner');
  playerBoxBlue.innerHTML = "";
  for (var i = 0; i < players.length; i++) {
    if (getUserIdTeam(players[i].userId) == 2){
      var playerNameText = conjureElement('p', playerBoxBlue, "playerNameInBoxBlue", i);
      playerNameText.innerHTML = getUserNameById(players[i].userId);
      if (first){
        conjureClass(playerNameText, "captain");
        first = false;
      }
    }
  }
}

function renderTeamScores(){
  var scoreBoxYellow = document.getElementById('scoreBoxYellow');
  var scoreBoxBlue = document.getElementById('scoreBoxBlue');
  if (!gameState.running){
    scoreBoxBlue.innerHTML = "";
    scoreBoxYellow.innerHTML = "";
    return;
  }

  scoreBoxYellow.innerHTML = ""+gameState.teams[1].score;
  scoreBoxBlue.innerHTML = ""+gameState.teams[2].score;
}

//shows and hides the buttons in the menu depending on the gameState
function renderButtonVisibility() {
  var startButton = document.getElementById("startbutton");
  var quitButton = document.getElementById("quitbutton");
  var leaveButton = document.getElementById("leavebutton");

  // Disable all buttons initially
  startButton.disabled = true;
  quitButton.disabled = true;
  leaveButton.disabled = true;

  // Enable buttons based on game state and conditions
  if (gameState.running) {
    if (isMeAdmin()) {
      quitButton.disabled = false;
    }
  } else if (gameState.drafting) {
    if (isMeAdmin()) {
      quitButton.disabled = false;
      startButton.disabled = false;
    }
    if (getMyTeam() != 0){
      leaveButton.disabled = false;
    }
  } else {
    if (getMyTeam() != 0) {
      leaveButton.disabled = false;
    }
    if (isMeAdmin()) {
      startButton.disabled = false;
    }
  }
}

function renderStateClasses(){

  var elementsToCheck = [
    document.body,
    document.getElementById('middle')
  ]

  var statesToCheck = [
    "drafting",
    "aftergame",
    "running",
  ]

  for(var j=0; j < elementsToCheck.length; j++){
    var foundOne = false;
    for (var i=0; i < statesToCheck.length; i++){
      if (gameState[statesToCheck[i]]){
        conjureClass(elementsToCheck[j], statesToCheck[i]); 
        foundOne = true;
      } else {
        elementsToCheck[j].classList.remove(statesToCheck[i]);
      }
    }
    if (!foundOne){
      conjureClass(elementsToCheck[j], 'lobby'); 
    } else {
      elementsToCheck[j].classList.remove('lobby');
    }
  }
}

function renderTopBarText(){
  var topbar = document.getElementById("topbar");
  if (gameState.drafting){
    var player = getCurrentPlayerCardTurn();
    if (player != null){
      var playername = getUserNameById(player.userId);
      topbar.innerHTML = playername + ' is drafting';
    }
  } else if (gameState.aftergame){
    topbar.innerHTML = '<div class="winningText"> Team <span class="'+TEAM_NAMES_LOWER[getVictoriousTeam()]+'text">'+TEAM_NAMES_UPPER[getVictoriousTeam()]+'</span> has won!</div>';
  } else if (gameState.running){
    var player = getCurrentPlayerCardTurn();
    if (player != null){
      var topbarText = "";
      if (gameState.suddenDeath) {
        var topbarText = "<p class='suddendeathtext'>SUDDEN DEATH</p><br>";
      }
      var playername = "<p class='"+TEAM_NAMES_LOWER[getUserIdTeam(player.userId)] +"text'>"+getUserNameById(player.userId)+"</p>";
      if (gameState.turn.phase == 0){  
        topbarText = topbarText + playername + ' is mentally preparing';
      } else if (gameState.turn.phase == 1){
        topbarText = topbarText + playername + ' is explaining';
      } else {
        topbarText = topbarText + playername + ' is scoring';
      }

      topbar.innerHTML = topbarText;

    } else {
      topbar.innerHTML = '';
    }
  } else {
    topbar.innerHTML = '';
  }
}


//renders the tabs on the right
function openTab(evt, tabname) {
  var i, tabcontent, tablinks;

  tabcontent = document.getElementsByClassName("tabContent");
  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }

  tablinks = document.getElementsByClassName("tablinks");
  for (i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(" active", "");
  }
  if (tabname == 'rulesTab'){
    document.getElementById(tabname).style.display = "inline-block";
  } else {
    document.getElementById(tabname).style.display = "block";
  }
  
  evt.currentTarget.className += " active";

  if (tabname == "playerlistLog"){
    activatePlayerlistTab(); //in common/renderTabs.js
  }
} 


//renders the QR Code
function fetchQRCode(){
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
}


//updates all the stats on the tab on the right with all the player stats
//stolen from Woerdgoem. It is a mess but cba fixing it
function updatePlayerList(){
  if (gameState == undefined || gameState == null || gameState.players == undefined || gameState.players == null){
    return;
  }

  var sortStatsBy=-3;
  var sortStatsByAsc=1;

  var playerList = gameState.players;

	var statsPanel= document.getElementById("playerStats");
	
	var oldTable=document.getElementById("playerStatsTable");

	while(oldTable){
		if (oldTable) {
      oldTable.parentElement.removeChild(oldTable);
    }
	  var oldTable = document.getElementById("playerStatsTable");
	}
	
	var tbl = document.createElement("table");
	
	tbl.setAttribute('id', 'playerStatsTable');
	tbl.classList.add("playerStatsTable");
	var tblBody = document.createElement("tbody");

	//create header:
	var row = document.createElement("tr");
	var cell = document.createElement("th");
	var headerDiv=document.createElement("div");

  var cellText = document.createTextNode("Player Name");  
  cell.classList.add("playerStatsEntryHeader");
  cell.setAttribute('id', "statsHeaderCell-2");
  headerDiv.setAttribute('id', "statsHeaderDiv-2");
  headerDiv.appendChild(cellText);
  headerDiv.classList.add("vertical");
  headerDiv.classList.add("statsplayername");
  row.classList.add("playerStatsEntryHeaderRow");
  cell.classList.add("playerStatsNameTd");
  cell.appendChild(headerDiv);
  row.appendChild(cell);

  cell.addEventListener('click', function(event) {
    var headerId=event.target.id.replace("statsHeaderCell","").replace("statsHeaderDiv","");
    if(sortStatsBy == headerId){
        if( sortStatsByAsc==-1){
          sortStatsBy=-3;
          sortStatsByAsc=1;
        }
        else{
          sortStatsByAsc=-1;
        }
    }
    else{
      sortStatsBy=headerId;
    }
    updatePlayerList();
  });
      

  var cell = document.createElement("td");
	var headerDiv=document.createElement("div");
  var cellText = document.createTextNode("Win Ratio");  
  cell.classList.add("playerStatsEntryHeader");
  headerDiv.appendChild(cellText);
  headerDiv.classList.add("vertical");
  headerDiv.classList.add("statstype");
  cell.setAttribute('id', "statsHeaderCell-1");
  headerDiv.setAttribute('id', "statsHeaderDiv-1");
  cell.classList.add("playerStatsTd");
  cell.classList.add("playerStatsEntryHeader");
  cell.appendChild(headerDiv);
  row.appendChild(cell);

  cell.addEventListener('click', function(event) {
    var headerId=event.target.id.replace("statsHeaderCell","").replace("statsHeaderDiv","");
    if(sortStatsBy == headerId){
        if( sortStatsByAsc==-1){
          sortStatsBy=-3;
          sortStatsByAsc=1;
        }
        else{
          sortStatsByAsc=-1;
        }
    }
    else{
      sortStatsBy=headerId;
    }
    updatePlayerList();
  });


	for (var j = 0; j < PLAYER_STATS_NAMES.length; j++) {
		var cell = document.createElement("th");
		cell.setAttribute('id', "statsHeaderCell"+j);
		var headerDiv=document.createElement("div");
		headerDiv.setAttribute('id', "statsHeaderDiv"+j);
		var cellText = document.createTextNode(PLAYER_STATS_NAMES[j]); 
		
		headerDiv.appendChild(cellText);
		headerDiv.classList.add("vertical");
		headerDiv.classList.add("statstype");
		cell.appendChild(headerDiv);
		cell.classList.add("playerStatsEntryHeader");
		cell.classList.add("playerStatsTd");
		row.appendChild(cell);
		cell.addEventListener('click', function(event) {
			var headerId=event.target.id.replace("statsHeaderCell","").replace("statsHeaderDiv","");
			if(sortStatsBy == headerId){
					if(sortStatsByAsc==-1){
						sortStatsBy=-3;
						sortStatsByAsc=1;
					}
					else{
						sortStatsByAsc=-1;
					}
			}
			else{sortStatsByAsc=1;
				sortStatsBy=headerId; 
			}
			updatePlayerList();
    });
	}
	tblBody.appendChild(row);

  //sort the list on a "deep copy"
  
  playerListSorted=Tools.copy(playerList);
  
  if(sortStatsBy==-2){
    playerListSorted.sort((a, b) => (getUserNameById(a.userId).toUpperCase() > getUserNameById(b.userId).toUpperCase()) ? sortStatsByAsc : (sortStatsByAsc*(-1)));
  }
  if(sortStatsBy==-1){
    playerListSorted.sort((a, b) => 
        (b.playerStats[PLAYER_STAT_ATTRIBUTES[0]] ==0 || (a.playerStats[PLAYER_STAT_ATTRIBUTES[0]] > 0 &&
		
		(  (a.playerStats[PLAYER_STAT_ATTRIBUTES[1]] / a.playerStats[PLAYER_STAT_ATTRIBUTES[0]]) 
		> (b.playerStats[PLAYER_STAT_ATTRIBUTES[1]] / b.playerStats[PLAYER_STAT_ATTRIBUTES[0]]) ))
		) 
		? sortStatsByAsc : (sortStatsByAsc*(-1)));
  }
  if(sortStatsBy>=0){
    playerListSorted.sort((a, b) => (a.playerStats[PLAYER_STAT_ATTRIBUTES[sortStatsBy]] > b.playerStats[PLAYER_STAT_ATTRIBUTES[sortStatsBy]]) ? sortStatsByAsc : (sortStatsByAsc*(-1)));
  }
  // creating all cells
  for (var i = 0; i < playerListSorted.length; i++) {
    // creates a table row
    var row = document.createElement("tr");
    var cell = document.createElement("td");
	  var cellText = document.createTextNode(getUserNameById(playerListSorted[i].userId)); 
		cell.classList.add("playerStatsNameTd");
    cell.appendChild(cellText);
	  row.appendChild(cell);

    var cell = document.createElement("td");
    if (playerListSorted[i] && playerListSorted[i].playerStats && playerListSorted[i].playerStats[PLAYER_STAT_ATTRIBUTES[0]] && playerListSorted[i].playerStats[PLAYER_STAT_ATTRIBUTES[0]] != 0) {
      var ratio = (playerListSorted[i].playerStats[PLAYER_STAT_ATTRIBUTES[1]])/(playerListSorted[i].playerStats[PLAYER_STAT_ATTRIBUTES[0]]);
    } else {
      var ratio = 0
    }
    ratio = Math.floor(ratio*100)+"%";
	  var cellText = document.createTextNode(ratio); 
		cell.classList.add("playerStatsTd");
    cell.appendChild(cellText);
	  row.appendChild(cell);


    for (var j = 0; j < PLAYER_STAT_ATTRIBUTES.length; j++) {
      var cell = document.createElement("td");
      if (playerListSorted[i] && playerListSorted[i].playerStats && playerListSorted[i].playerStats[PLAYER_STAT_ATTRIBUTES[0]] && playerListSorted[i].playerStats[PLAYER_STAT_ATTRIBUTES[0]] != 0) {
        if (PLAYER_STAT_ATTRIBUTES[j] == "myExplainRate"){
          var ratio = playerListSorted[i].playerStats[PLAYER_STAT_ATTRIBUTES[j]].toFixed(2);
          var cellText = document.createTextNode(ratio); 
        } else {
          var cellText = document.createTextNode(playerListSorted[i].playerStats[PLAYER_STAT_ATTRIBUTES[j]]); 
        }
      } else {
        var cellText = document.createTextNode("");
      }
      cell.classList.add("playerStatsTd");		
      cell.appendChild(cellText);
      row.appendChild(cell);
      
    }
    var className= ("logGreen"+((i+1)%2));
    row.classList.add(className);
    row.classList.add("playerStatsEntry");
    tblBody.appendChild(row);
    tbl.appendChild(tblBody);
    statsPanel.appendChild(tbl);
  }
}
