
function generate_observers (players) {
	
  var tbl = document.createElement("table");
  tbl.setAttribute('id', 'observers');
  var tblBody = document.createElement("tbody");
  tblBody.setAttribute('id', 'observerBody');

  // creating all cells
  for (var i = 0; i < 1; i++) {
    // creates a table row
    var row = document.createElement("tr");

    for (var j = 0; j < players.length; j++) {

      var cell = document.createElement("td");
      cell.classList.add("grey");
      cell.classList.add("observerCard");
      var cellText = document.createTextNode(getUserNameById(players[j]));
          
      cell.appendChild(cellText);
      tbody.appendChild(cell);

      // add the row to the end of the table body
      tblBody.appendChild(row);
    }
    tbl.appendChild(tblBody);
    var bottom = document.getElementById('bottombar');
    bottom.appendChild(tbl);
    // sets the border attribute of tbl to 2;
    tbl.setAttribute("border", "2");
  }
}

function delete_turncard() {
  var turncard = document.getElementById('turner');
  while (turncard) {
    if (turncard) {
      turncard.parentElement.removeChild(turncard);
    }
    var turncard = document.getElementById('turner');
  }
}


function generate_turncard(turn, hint, myTurn) {
  var textForCell = null;
  if (myTurn && hint && hint.word){
    textForCell = hint.word+"<br>IT IS YOUR TURN";
  } else if (myTurn) {
    textForCell = "IT IS YOUR TURN";
  } else if (hint && hint.word){
    textForCell = hint.word;
  }

  if (!textForCell){ return;}

  var tbl = document.createElement("table");
  tbl.setAttribute('id', 'turner');
  var tblBody = document.createElement("tbody");
    var row = document.createElement("tr");
    var cell = document.createElement("td");
    if(turn.teamNr==0){
        cell.classList.add("black");
      } else{
      if(turn.teamNr==1){
        cell.classList.add("red");
      }
      else{
        if(turn.teamNr==2){
          cell.classList.add("blue");
        }
        else{
          cell.classList.add("green");
        }
      }
    }
    cell.classList.add("turncard");
    cell.innerHTML = textForCell;
    row.appendChild(cell);
    tblBody.appendChild(row);

    tbl.appendChild(tblBody);
    var top = document.getElementById('topbar');
    top.appendChild(tbl);
    tbl.setAttribute("border", "2");
}

function generate_gameovercard () {

  // creates a <table> element and a <tbody> element
  var tbl = document.createElement("table");
  
  tbl.setAttribute('id', 'turner');
  var tblBody = document.createElement("tbody");

  // creating all cells
  for (var i = 0; i < 1; i++) {
    // creates a table row
    var row = document.createElement("tr");

    for (var j = 0; j < 1; j++) {

      var cell = document.createElement("td");
	    cell.classList.add("black");
      cell.classList.add("turncard");

      var cellText = document.createTextNode("GAME OVER");
          
      cell.appendChild(cellText);
      row.appendChild(cell);

      // add the row to the end of the table body
      tblBody.appendChild(row);
    }
    tbl.appendChild(tblBody);
    var top = document.getElementById('topbar');
    top.appendChild(tbl);
    // sets the border attribute of tbl to 2;
    tbl.setAttribute("border", "2");
  }
}


function generate_draftcard (turn) {
  // creates a <table> element and a <tbody> element
  var tbl = document.createElement("table");
  
  tbl.setAttribute('id', 'turner');
  var tblBody = document.createElement("tbody");

  // creating all cells
  for (var i = 0; i < 1; i++) {
    // creates a table row
    var row = document.createElement("tr");

    for (var j = 0; j < 1; j++) {

      var cell = document.createElement("td");

      if(turn.teamNr==1){
        cell.classList.add("red");
      }
      else{
        if(turn.teamNr==2){
          cell.classList.add("blue");
        }
        else{
          cell.classList.add("green");
        }
      }
      cell.classList.add("turncard");

      var cellText = document.createTextNode("SPYMASTER IS DRAFTING");
          
      cell.appendChild(cellText);
      row.appendChild(cell);

      // add the row to the end of the table body
      tblBody.appendChild(row);
    }
    tbl.appendChild(tblBody);
    var top = document.getElementById('topbar');
    top.appendChild(tbl);
    // sets the border attribute of tbl to 2;
    tbl.setAttribute("border", "2");
  }
}


function generate_cards(board, aftergame, taps, turn, specialHints, running) {

	if(getUserName() !==null && getUserName() !== undefined){
	window.document.title="Woerdgoem ("+getUserName()+")";
	}
	else{
		window.document.title="Woerdgoem";
	}	

  var tbl = document.createElement("div");
  
  tbl.setAttribute('id', 'cardboard');
  tbl.classList.add("cardboard");
  var tblBody = document.createElement("tbody");

  // creating all cells
  for (var i = 0; i < board.boardSize; i++) {
      var cell = document.createElement("div");
      cell.classList.add("cardboardcard");
      cell.setAttribute('id', 'cell' + i);

      //create the divs where tapmessages will be created
      var tapmessages = document.createElement("div");
      tapmessages.className = 'tapmessages';
      tapmessages.setAttribute('id', 'tap' + i);
      cell.appendChild(tapmessages);
      
      //remove old taps that are still remaining
      while (tapmessages.firstChild) {
        tapmessages.removeChild(tapmessages.lastChild);
      }
     
      if (board.card[i].visible) {
        if (running) {
          var invisText = document.createElement("div");
          invisText.className = 'invis';
          invisText.setAttribute('id', 'invis' + i);
          var cellText = document.createTextNode(board.card[i].word.toUpperCase());  
          invisText.appendChild(cellText);
          cell.appendChild(invisText);
          
        } else {
          var cellText = document.createTextNode(board.card[i].word.toUpperCase());  
          cell.appendChild(cellText);
        }

        cell.classList.add(board.card[i].color);
      } else {
        if (board.card[i].blank > 0){
          cell.classList.add("blankedout");
		   if (isMeSpymaster()){
            var cellText = document.createTextNode(board.card[i].word.toUpperCase());  
            cell.appendChild(cellText);
          }
        } else {
          var cellText = document.createTextNode(board.card[i].word.toUpperCase());  
          cell.appendChild(cellText);
        }
        
        if (isMeSpymaster() || aftergame ) {
          cell.classList.add(board.card[i].color+"master");
        } else {
          cell.classList.add("brown");
          if (blankedActive) {
            cell.classList.add("blankedout");
          }
        }
      }
      tbl.appendChild(cell);

      cell.addEventListener('click', function(event) {
        var cardId=event.target.id.replace("tap","").replace("cell","").replace("invis","");
        
        
        if (blankedActive){
          blankedActive = !blankedActive;
          socket.emit(GAME_NAME+"_cardclick"+gameId,cardId, !blankedActive, getUserId());
        } else {
          socket.emit(GAME_NAME+"_cardclick"+gameId,cardId, blankedActive, getUserId());
        }
      });
      cell.addEventListener('contextmenu', function(event) {
          event.preventDefault();
          var cardId=event.target.id.replace("tap","").replace("cell","") ;
          socket.emit(GAME_NAME+"_cardtap"+gameId,cardId, getUserId());
      });
  }
  // put the <tbody> in the <table>
  tbl.appendChild(tblBody);
  // appends <table> into <div middle>
  var middle = document.getElementById('middlebar');
  middle.appendChild(tbl);
  // sets the border attribute of tbl to 2;
  tbl.setAttribute("border", "2");


  //change cells for hint cells and put a purple tap message on it
  for (var i=0; i<specialHints.length;i++) {
    for (var j=0; j<specialHints[i].length;j++) {
      if (!board.card[specialHints[i][j].cardId].visible) {
        if (isMeSpymaster() || specialHints[i][j].userId == getUserId() ) {
          var specialCard = document.getElementById("cell"+specialHints[i][j].cardId);
          specialCard.className=("cardboardcard "+board.card[specialHints[i][j].cardId].color+"special");
          var tapmessages = document.getElementById("tap"+specialHints[i][j].cardId);
  
          var specialmessage = document.createElement("div");
          specialmessage.className = "purplehighlight";
          specialmessage.innerHTML = getUserNameById(specialHints[i][j].userId);
          tapmessages.appendChild(specialmessage);
        }
      }
    }
  }
  var tapColorName;
  if(turn.teamNr==1){
    tapColorName='redhighlight';
  }
  else{
    if(turn.teamNr==2){

      tapColorName='bluehighlight';
    }
    else{
      tapColorName='greenhighlight';
    }
  }

  //put taps on cards
  for (var i=0;i<taps.length;i++) {
    if (!board.card[taps[i].cardId].visible) {
      var taplocation = document.getElementById("tap"+taps[i].cardId);
      for (var j=0;j<taps[i].players.length;j++) {
        var tapmessage = document.createElement("div");
        tapmessage.className = tapColorName;
        tapmessage.innerHTML = getUserNameById(taps[i].players[j]);
        taplocation.appendChild(tapmessage);
      }
    }
  }
}
  
 //tabs to switch between chat and stats
  
function openTab(evt, tabname) {
  // Declare all variables
  var i, tabcontent, tablinks;

  // Get all elements with class="tabcontent" and hide them
  tabcontent = document.getElementsByClassName("tabContent");
  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }

  // Get all elements with class="tablinks" and remove the class "active"
  tablinks = document.getElementsByClassName("tablinks");
  for (i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(" active", "");
  }

  // Show the current tab, and add an "active" class to the button that opened the tab
  document.getElementById(tabname).style.display = "block";
  evt.currentTarget.className += " active";

  if (tabname == "playerlistLog"){
    activatePlayerlistTab(); //in common/renderTabs.js
  }
} 
/*
var playerStatAttributes=["myTotalGames","myTotalWins","myTotalLoses", "myGamesAsSpymaster","myGamesAsTeammember","myWinsAsTeammember","myWinsAsSpymaster"
,"myLosesAsSpymaster","myLosesAsTeammember","myGamesAsTeam1","myGamesAsTeam2","myGamesAsTeam3","blackCardsTapped"];

var playerStatDisplayNames=["Games","Wins","Losses", "Spymaster","Operative","Operative Wins","Spymaster Wins"
,"Spymaster Losses","Operative Losses","Team Red","Team Blue","Team Green","Black Cards"];
*/
var playerStatAttributes=["myTotalGames","myTotalWins","myTotalLoses", "myGamesAsSpymaster","myGamesAsTeammember","myWinsAsTeammember","myWinsAsSpymaster"
,"myGamesAsTeam1","myGamesAsTeam2","myGamesAsTeam3","blackCardsTapped"];

var playerStatDisplayNames=["Games","Wins","Losses", "Spymaster","Operative","Operative Wins","Spymaster Wins"
,"Team Red","Team Blue","Team Green","Black Cards"];



var sortStatsBy=-3;
var sortStatsByAsc=1;

function updatePlayerList(playerList){
	//var myPersonalScore={myTotalGames:0,myTotalWins:0, myTotalLoses:0, myGamesAsSpymaster:0, 
	//myGamesAsTeammember:0, myWinsAsTeammember:0, myWinsAsSpymaster:0, myLosesAsSpymaster:0,
	//myLosesAsTeammember:0,myGamesAsTeam1:0,myGamesAsTeam2:0,myGamesAsTeam3:0, blackCardsTapped:0};
	var statsPanel= document.getElementById("playerStats");
	
	var oldTable=document.getElementById("playerStatsTable");

	while(oldTable){
		 if (oldTable) {
      oldTable.parentElement.removeChild(oldTable);
    }
	var oldTable=document.getElementById("playerStatsTable");
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
    updatePlayerList(playerList);
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
    updatePlayerList(playerList);
  });


	for (var j = 0; j < playerStatDisplayNames.length; j++) {
		var cell = document.createElement("th");
		cell.setAttribute('id', "statsHeaderCell"+j);
		var headerDiv=document.createElement("div");
		headerDiv.setAttribute('id', "statsHeaderDiv"+j);
		var cellText = document.createTextNode(playerStatDisplayNames[j]); 
		
		
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
			updatePlayerList(playerList);
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
        (b.playerStats[playerStatAttributes[0]] ==0 || (a.playerStats[playerStatAttributes[0]] > 0 &&
		
		(  (a.playerStats[playerStatAttributes[1]] /a.playerStats[playerStatAttributes[0]]) 
		> (b.playerStats[playerStatAttributes[1]] /b.playerStats[playerStatAttributes[0]]) ))
		) 
		? sortStatsByAsc : (sortStatsByAsc*(-1)));
  }
  if(sortStatsBy>=0){
    playerListSorted.sort((a, b) => (a.playerStats[playerStatAttributes[sortStatsBy]] > b.playerStats[playerStatAttributes[sortStatsBy]]) ? sortStatsByAsc : (sortStatsByAsc*(-1)));
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
    if (playerListSorted[i] && playerListSorted[i].playerStats && playerListSorted[i].playerStats[playerStatAttributes[0]] && playerListSorted[i].playerStats[playerStatAttributes[0]] != 0) {
      var ratio = (playerListSorted[i].playerStats[playerStatAttributes[1]])/(playerListSorted[i].playerStats[playerStatAttributes[0]]);
    } else {
      var ratio = 0
    }
    ratio = Math.floor(ratio*100)+"%";
	  var cellText = document.createTextNode(ratio); 
		cell.classList.add("playerStatsTd");
    cell.appendChild(cellText);
	  row.appendChild(cell);


    for (var j = 0; j < playerStatAttributes.length; j++) {
      var cell = document.createElement("td");
      if (playerListSorted[i] && playerListSorted[i].playerStats && playerListSorted[i].playerStats[playerStatAttributes[0]] && playerListSorted[i].playerStats[playerStatAttributes[0]] != 0) {
        var cellText = document.createTextNode(playerListSorted[i].playerStats[playerStatAttributes[j]]); 
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
