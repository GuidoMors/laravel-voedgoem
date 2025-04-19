//
// HTML CHUNKS
//
function drawLogo(docelement) {
	var Logo = document.createElement("div");
	Logo.classList.add("Logo");
	Logo.innerHTML = "WORLDWEAVER";
	docelement.appendChild(Logo);
}

function drawLobbyGamesBigger(docelement) {
	var LobbyGames = document.createElement("div");
	LobbyGames.classList.add("LobbyGames");
	LobbyGames.classList.add("LobbyBigger");
	docelement.appendChild(LobbyGames);
}

function drawMenuButton(docelement, clickfunction, text) {
	var button = document.createElement("button");
	button.classList.add("startGameButton");
	button.setAttribute("type", "button");
	if (host == myUsername && clickfunction != "") {
		button.setAttribute("onclick", clickfunction+"();");
	} else {
		button.disabled = true;
	}
	button.innerHTML = text;
	docelement.appendChild(button);
}

function drawInMenuButton(docelement, clickfunction, text) {
	var button = document.createElement("button");
	button.classList.add("InMenuButton");
	button.setAttribute("onclick",clickfunction);
	button.style.marginTop = "5%";
	button.style.marginBottom = "5%";
	button.innerHTML = text;
	docelement.appendChild(button);
}

function drawAbilityDropdown(docelement, ability) {

	for (var i = 0;i<ability.effects.length;i++) {
		var abilityitemlist = [];
		for (var j = 0;j<ability.effects[i].building?.length;j++) {
			abilityitemlist[abilityitemlist.length] = ability.effects[i].building[j];
		}
		for (var j = 0;j<ability.effects[i].character?.length;j++) {
			abilityitemlist[abilityitemlist.length] = ability.effects[j].character[j];
		}
		for (var j = 0;j<ability.effects[i].tile?.length;j++) {
			abilityitemlist[abilityitemlist.length] = ability.effects[i].tile[j];
		}
		for (var j = 0;j<ability.effects[i].resource?.length;j++) {
			abilityitemlist[abilityitemlist.length] = ability.effects[i].resource[j];
		}	

		if (abilityitemlist.length > 1) {

			var container = document.createElement("div");
			container.classList.add("dropdowncontainer");
			docelement.appendChild(container);
	
			var dropdownbutton = document.createElement("button");
			dropdownbutton.classList.add("abilitydropdownbutton");
			container.appendChild(dropdownbutton);
	
			var abilityselection = getSelectionForm(ability.name);
	
			var tiletext = document.createElement("div");
			tiletext.classList.add("bigtiletext");
			tiletext.innerHTML = capitalize(abilityselection);
			dropdownbutton.appendChild(tiletext);
	
			var dropdowncontent = document.createElement("div");
			dropdowncontent.classList.add("abilitydropdowncontent");
			container.appendChild(dropdowncontent);
	
			for (var j = 0; j < abilityitemlist.length; j++) {
				if (ability.effects[i].cost == "none" || canPayForObject(abilityitemlist[j])) {
					var divider = document.createElement("div");
					divider.classList.add("colordivider");	
					dropdowncontent.appendChild(divider);
					divider.setAttribute("onclick","makeThisSelected('"+ability.name+"', "+0+",'"+abilityitemlist[j]+"');");
					var tiletext = document.createElement("div");
					tiletext.classList.add("abilitydropdowntext");
					divider.appendChild(tiletext);
					
					var costlist = getCostListforObject(abilityitemlist[j]);
	
					var text = "<b>"+capitalize(abilityitemlist[j])+ "</b><div class='rightfloater'>";
	
					if (costlist.length>0 && ability.effects[i].cost != "none" ){
						for (var k = 0;k<costlist.length;k++) {
							text = text + costlist[k].amount+" "+"["+costlist[k].type+"] "
						}
						text = iconify(text);
					}
					var text = text + "</div>";
	
					tiletext.innerHTML = text;

					if (j%2==1){
						divider.classList.add("white");
					}
				
				}
			}
			
			for (var j = 0; j < abilityitemlist.length; j++) {
				if (ability.effects[i].cost != "none" && !canPayForObject(abilityitemlist[j])) {
					var divider = document.createElement("div");
					divider.classList.add("colordivider");	
					dropdowncontent.appendChild(divider);
					
					var tiletext = document.createElement("div");
					tiletext.classList.add("abilitydropdowntext");
					divider.appendChild(tiletext);
					
					var costlist = getCostListforObject(abilityitemlist[j]);
	
					var text = capitalize(abilityitemlist[j])+ " <div class='rightfloater'>";
	
					if (costlist.length>0 && ability.effects[i].cost != "none" ){
						for (var k = 0;k<costlist.length;k++) {
							text = text + costlist[k].amount+" "+"["+costlist[k].type+"] ";
						}
						text = iconify(text);
					}
					var text = text + "</div>";
	
					tiletext.innerHTML = text;

					if (j%2==1){
						divider.classList.add("mountaingrey");
					} else {
						divider.classList.add("grey");
					}
				
				}
			}
	
		}
		var abilitybuilding = getBuildingFromName(abilityselection);

		if (abilitybuilding != "") {
			drawBuildingCard(docelement, abilitybuilding);
		}
	}

}


function drawFactionDropdown (docelement, player) {
	var pregamefaction = document.createElement("div");
	pregamefaction.classList.add("pregamefaction");
	docelement.appendChild(pregamefaction);

	var pregamefactionbutton = document.createElement("button");
	pregamefactionbutton.classList.add("pregamefactionbutton");
	pregamefaction.appendChild(pregamefactionbutton);

	if (player.faction.order >= 0) {
		var pregamefactioninfo = document.createElement("button");
		pregamefactioninfo.classList.add("pregamefactioninfo");
		pregamefactioninfo.innerHTML = "?";
		pregamefactioninfo.setAttribute("onclick","factionInfoClick("+player.faction.order+");");
		docelement.appendChild(pregamefactioninfo);
	}

	var colorblock = document.createElement("div");
	colorblock.classList.add("colorblock");
	colorblock.classList.add(player.faction.color);
	pregamefactionbutton.appendChild(colorblock);

	var tiletext = document.createElement("div");
	tiletext.classList.add("bigtiletext");
	tiletext.innerHTML = player.faction.name;
	pregamefactionbutton.appendChild(tiletext);

	if (player.username == myUsername) {

		var pregamefactioncontent = document.createElement("div");
		pregamefactioncontent.classList.add("pregamefactioncontent");
		pregamefaction.appendChild(pregamefactioncontent);

		for (var j = 0; j < factionlist.length; j++) {
			if (!isFactionTaken(factionlist[j].name)) {
				var divider = document.createElement("div");
				divider.classList.add("colordivider");
				divider.setAttribute("onclick","factionClick("+j+");");
				pregamefactioncontent.appendChild(divider);

				var colorblock = document.createElement("div");
				colorblock.classList.add("colorblock");
				colorblock.classList.add(factionlist[j].color);
				divider.appendChild(colorblock);
		
				var tiletext = document.createElement("div");
				tiletext.classList.add("factiontiletext");
				divider.appendChild(tiletext);
				tiletext.innerHTML = factionlist[j].name;			
			}

		}		
	} else {
		pregamefactionbutton.disabled = true;
	}
}

function drawPlayerDropdown (clickfunction, docelement, index) {
	var container = document.createElement("div");
	container.classList.add("PlayerDropdownContainer");

	docelement.appendChild(container);

	var button = document.createElement("button");
	button.classList.add("PlayerDropdownButton");
	button.classList.add(gameState.players[index].faction.color);
	button.classList.add("text"+gameState.players[index].faction.offcolor);
	if (index >= 0) {
		button.innerHTML =  gameState.players[index].username;
	} else {
		button.innerHTML =  index;
	}
	
	container.appendChild(button);

	var content = document.createElement("div");
	content.classList.add("PlayerDropdownContent");
	container.appendChild(content);

	for (var i = 0; i < gameState.players.length; i++) {
		if (gameState.players[i].faction.order != -1) {
			var divider = document.createElement("div");
			divider.classList.add("colordivider");
			divider.setAttribute("onclick",clickfunction+"("+i+");");
			content.appendChild(divider);
		
			var block = document.createElement("div");
			block.classList.add("colorblock");
			block.classList.add(gameState.players[i].faction.color);
			divider.appendChild(block);
	
			var text = document.createElement("div");
			text.classList.add("factiontiletext");
			text.innerHTML = gameState.players[i].username;
			divider.appendChild(text);
		}
	}
}

function drawCharacterTile(docelement, Characterobject) {
	var characterblock = document.createElement("div");
	characterblock.classList.add("characterblock");
	docelement.appendChild(characterblock);
	
	var characterblockborder = document.createElement("div");
	characterblockborder.classList.add("characterblockborder");
	characterblockborder.classList.add(getColorFromUsername(Characterobject.owner));
	characterblock.appendChild(characterblockborder);
	
	var speed = document.createElement("div");
	speed.classList.add("characterspeed");
	speed.innerHTML = Characterobject.character.speed;
	characterblock.appendChild(speed);
	
	var strength = document.createElement("div");
	strength.classList.add("characterstrength");
	strength.innerHTML = Characterobject.character.strength;
	characterblock.appendChild(strength);
	
	var charname = document.createElement("div");
	charname.classList.add("charactername");
	var charactername = Characterobjectcharacter.name;
	charname.innerHTML = charactername;
	if (charactername.length > 5) {
		var charcount = (charactername.length-5)*8.2;
		for (var k = 0; k < charactername.length; k++) {
			var charAtPoint = charactername.charAt(k);
			if (charAtPoint.toUpperCase() == "M" || charAtPoint.toUpperCase() == "W") {
				charcount = charcount + 8;
			}
			if (charAtPoint.toUpperCase() == "'" || charAtPoint.toUpperCase() == "I" || charAtPoint == "l") {
				charcount = charcount - 3;
			}
		}
		charname.style.left = "-" + charcount +"%";
	}
	characterblock.appendChild(charname);
	
	var type = document.createElement("div");
	type.classList.add(Characterobject.character.icon);
	type.classList.add(getOffColorFromUsername(Characterobject.owner));
	type.classList.add("iconcharacterclip");
	characterblockborder.appendChild(type);
}

function drawBuildingTile (docelement, Buildingobject) {

	if (Buildingobject.building == "relic" || Buildingobject.building == "warp" || Buildingobject.building == "treasure") {
		console.log(Buildingobject.building);

		var anomalycontainer = document.createElement("div");
		anomalycontainer.classList.add("anomalycontainer");
		anomalycontainer.classList.add(Buildingobject.building);
		docelement.appendChild(anomalycontainer);

	} else {

		var buildingblock = document.createElement("div");
		buildingblock.classList.add("buildingblock");
		docelement.appendChild(buildingblock);

		var buildingblockborder = document.createElement("div");
		buildingblockborder.classList.add("buildingblockborder");
		buildingblockborder.classList.add(getColorFromUsername(Buildingobject.owner));
		buildingblock.appendChild(buildingblockborder);
	
		var type = document.createElement("div");
		type.classList.add(getIconFromBuildingname(Buildingobject.building));
		type.classList.add(getOffColorFromUsername(Buildingobject.owner));
		type.classList.add("iconbuildingclip");
		buildingblockborder.appendChild(type);
	}

}

function drawTacticCard(docelement, card) {
	var table = document.createElement("table");
	table.classList.add("ruletacticstable");
	docelement.appendChild(table);
	var row = document.createElement("tr");
	table.appendChild(row);
	var column = document.createElement("td");
	switch(card.type) {
		case "production":
			column.classList.add("textbrown");
		  break;
		case "court":
			column.classList.add("textwhiteblue");
		  break;
		case "thief":
			column.classList.add("textyellow");
		  break;
		case "subagr":
			column.classList.add("textpurple");
		  break;
		default:
			column.classList.add("textpink");
	  }
	var text ="<b>"+card.name+"</b>";
	column.innerHTML = text;
	row.appendChild(column);

	var cardtext = document.createElement("div");
	var text = card.text;
	text = iconify(text);
	cardtext.innerHTML = text;
	column.appendChild(cardtext);
}

function drawTreatyCard(docelement, treaty){
	var table = document.createElement("table");
	table.classList.add("ruletacticstable");
	docelement.appendChild(table);
	var row = document.createElement("tr");
	table.appendChild(row);
	var column = document.createElement("td");
	column.classList.add("textgreen");
	var text ="<b>"+treaty.name+"</b>";
	column.innerHTML = text;
	row.appendChild(column);

	var cardtext = document.createElement("div");
	cardtext.classList.add(treaty.giver.faction.color);
	cardtext.style.color = treaty.giver.faction.offcolor;
	var text = treaty.text;
	var text = text + "<br>Giver:" + treaty.giver.username;
	text = iconify(text);
	cardtext.innerHTML = text;
	column.appendChild(cardtext);
}

function drawAbility(docelement, ability){
	var textcontainer = document.createElement("div");
	textcontainer.classList.add("InMenuAbility");
	if (ability.name == activeAbility.name) {
		textcontainer.classList.add("active");
		textcontainer.style.border = "1px solid var(--white)"
	}
	textcontainer.style.marginTop = "3.5%";
	textcontainer.style.marginBottom = "3.5%";
	docelement.appendChild(textcontainer);

	var blocker = document.createElement("div");
	blocker.classList.add("blocker");
	textcontainer.appendChild(blocker);

	var left = document.createElement("div");
	left.classList.add("abilityleft");
	blocker.appendChild(left);
	var text = iconify(ability.name);
	left.innerHTML = text;

	var middle = document.createElement("div");
	middle.classList.add("abilitymiddle");
	blocker.appendChild(middle);
	var abilitycost = abilityCostList(ability.name);
	if (abilitycost.length>0){
		var text = "";
		for (var j = 0;j<abilitycost.length;j++) {
			text = text + abilitycost[j].amount+" "+"["+abilitycost[j].type+"] "
		}
		text = iconify(text);
		middle.innerHTML = text;
	}
	if (abilitycost.length<=2){
		middle.style.display = "flex";
	}

	var right = document.createElement("div");
	right.classList.add("abilityright");
	blocker.appendChild(right);
	if (ability.charges == -1) {
		var text = iconify("∞ [charges]");
	} else {
		var text = iconify(ability.charges + " [charges]");
	}
	right.innerHTML = text;

	var abilitytext = document.createElement("div");
	abilitytext.classList.add("abilitytext");
	textcontainer.appendChild(abilitytext);
	var text = iconify(ability.text);
	abilitytext.innerHTML = text;

	if (canPayForAbility(ability.name)){

		if(hasDropdown(ability.name)){
			drawAbilityDropdown(textcontainer, ability)
		} else if(hasOptions(ability.name)){
			drawAbilityOptions(textcontainer, ability)
		} else if(getSelectionForm(ability.name)=="unselected") {

			var abilityitemlist = [];
			for (var i = 0;i<ability.effects.length;i++) {
				for (var j = 0;j<ability.effects[i].building?.length;j++) {
					abilityitemlist[abilityitemlist.length] = ability.effects[i].building[j];
				}
				for (var j = 0;j<ability.effects[i].character?.length;j++) {
					abilityitemlist[abilityitemlist.length] = ability.effects[j].character[j];
				}
				for (var j = 0;j<ability.effects[i].tile?.length;j++) {
					abilityitemlist[abilityitemlist.length] = ability.effects[i].tile[j];
				}
				for (var j = 0;j<ability.effects[i].resource?.length;j++) {
					abilityitemlist[abilityitemlist.length] = ability.effects[i].resource[j];
				}
				for (var j = 0;j<ability.effects[i].toresource?.length;j++) {
					abilityitemlist[abilityitemlist.length] = ability.effects[i].toresource[j];
				}
			}
			makeThisSelected(ability.name, 0, abilityitemlist[0]);
		}

		if (ability.name != activeAbility.name) {
			textcontainer.setAttribute("onclick","activateAbility('"+(ability.name)+"');");
		} else {
			if (noTarget(ability)){
				drawInMenuButton(textcontainer, "genericClick('"+ability.name+"');", "Use Ability")
			}
		}
	
	} else {
		middle.style.backgroundColor = "var(--aggressiveorange)";
		textcontainer.classList.add("passive");
		textcontainer.style.border = "1px solid black";
	}

}

function drawAbilityOptions(docelement, ability) {
	var checker = 0;
	var abilityitemlist = [];
	for (var i = 0;i<ability.effects.length;i++) {
		abilityitemlist[i] = []
		for (var j = 0;j<ability.effects[i].building?.length;j++) {
			abilityitemlist[i][abilityitemlist[i].length] = ability.effects[i].building[j];
		}
		for (var j = 0;j<ability.effects[i].character?.length;j++) {
			abilityitemlist[i][abilityitemlist[i].length] = ability.effects[i].character[j];
		}
		for (var j = 0;j<ability.effects[i].tile?.length;j++) {
			abilityitemlist[i][abilityitemlist[i].length] = ability.effects[i].tile[j];
		}
		for (var j = 0;j<ability.effects[i].resource?.length;j++) {
			abilityitemlist[i][abilityitemlist[i].length] = ability.effects[i].resource[j];
		}
		for (var j = 0;j<ability.effects[i].toresource?.length;j++) {
			abilityitemlist[i][abilityitemlist[i].length] = ability.effects[i].toresource[j];
		}
		checker = checker + abilityitemlist[i].length;
	}

	if (getSelectionForm(ability.name)=="unselected") {
		makeThisSelected(ability.name, 0, abilityitemlist[0][0]);
	}

	if (checker > 1) {
		var blocker = document.createElement("div");
		blocker.classList.add("blocker");
		blocker.style.backgroundColor = "var(--log2)";
		blocker.style.borderRadius = "3px";
		docelement.appendChild(blocker);

		for (var i = 0;i<abilityitemlist.length;i++) {
			var abilityinput = document.createElement("div");
			abilityinput.classList.add("abilityinput");
			blocker.appendChild(abilityinput);

			var abilitylabel = document.createElement("label");
			abilitylabel.classList.add("abilitylabel");
			abilitylabel.for = abilityitemlist[i];
			blocker.appendChild(abilitylabel);
			
			var canIconvert = canPayForConversion(ability.effects[i]);

			var text = capitalize(ability.effects[i].type);
			if (ability.effects[i].type == "convert") {
				if (!canIconvert){
					text = text + " <div class='aggressive inline'>" + ability.effects[i].fromamount + " [" +ability.effects[i].fromresource+ "]</div> into:";
				} else {
					text = text + " " + ability.effects[i].fromamount + " [" +ability.effects[i].fromresource+ "] into:";
				}
			} else {
				text = text + ":";
			}
			abilitylabel.innerHTML = iconify(text);

			var br = document.createElement("br");
			blocker.appendChild(br);

			var blocker = document.createElement("div");
			blocker.classList.add("blocker");
			blocker.style.backgroundColor = "var(--log2)";
			blocker.style.borderRadius = "3px";
			docelement.appendChild(blocker);
	
			for (var j = 0;j<abilityitemlist[i].length;j++) {
				var abilityinput = document.createElement("input");
				abilityinput.classList.add("abilityinput");
				abilityinput.type="radio";
				abilityinput.name=ability.name;
				abilityinput.id=abilityitemlist[i];
				blocker.appendChild(abilityinput);
				if (selectionHasForm(ability.name, i, abilityitemlist[i][j])) {
					abilityinput.checked = true;
				}
				
				var abilitylabel = document.createElement("label");
				abilitylabel.classList.add("abilitylabel");
				abilitylabel.for = abilityitemlist[i][j];
				blocker.appendChild(abilitylabel);
				
				if (ability.effects[i].amount) {
					var text = ability.effects[i].amount +" ";
				} else {
					var text = "";
				}
				abilitylabel.innerHTML = text+abilityitemlist[i][j];
	
				var br = document.createElement("br");
				blocker.appendChild(br);

				if (ability.effects[i].type != "convert" || canIconvert){
					abilityinput.setAttribute("onclick","makeThisSelected('"+ability.name+"', "+i+",'"+abilityitemlist[i][j]+"');");
				} else {
					abilityinput.disabled = "true";
					abilitylabel.classList.add("textfrontplate");
				}
				
			}
			
		}
	}
}

function drawLawCard(docelement, law){
	var table = document.createElement("table");
	table.classList.add("rulelawtable");
	docelement.appendChild(table);
	var row = document.createElement("tr");
	table.appendChild(row);
	var column = document.createElement("th");
	switch(law.type) {
		case "lumber":
			column.classList.add("brown");
		  break;
		case "food":
			column.classList.add("green");
		  break;
		case "stone":
			column.classList.add("grey");
		  break;
		case "gold":
			column.classList.add("yellow");
		  break;
		default:
			column.classList.add("purple");
	  }
	var text ="<b>"+law.name+"</b>";
	column.innerHTML = text;
	row.appendChild(column);

	var row = document.createElement("tr");
	table.appendChild(row);
	var column = document.createElement("td");
	var text = law.text;
	if (law.card) {
		text = text + "<div class='card'> <i class='cardsubtext'>"+law.card.condition+"</i><br>"+law.card.text+"</di>v";
	}
	text = iconify(text);
	column.innerHTML = text;
	row.appendChild(column);
}

function drawTechnologyCard(docelement, technology) {
	var container = document.createElement("div");
	container.classList.add("techcard");
	docelement.appendChild(container);
	var text ="<b>"+technology.name+"</b><br>"+technology.text;
	text = iconify(text);
	container.innerHTML = text;
	for (var k = 0; k < Technologystate.length; k++) {
		if (technology.name == Technologystate[k].tech.name) {
			container.classList.add(getColorFromUsername(Technologystate[k].owner));
		}
	}
}

function drawCharacterCard(docelement, charactercard, color) {
	var character = document.createElement("div");
	character.classList.add("characterTab");
	docelement.appendChild(character);

	var blocker = document.createElement("div");
	blocker.classList.add("blocker");
	character.appendChild(blocker);

	var charactername = document.createElement("div");
	charactername.classList.add("characterTabName");
	charactername.classList.add("text"+color);
	charactername.innerHTML = ""+charactercard.name;
	blocker.appendChild(charactername);

	var subtitle = document.createElement("div");
	subtitle.classList.add("characterTabSubtitle");
	subtitle.innerHTML = ""+charactercard.subtitle;
	charactername.appendChild(subtitle);
	
	var honor = document.createElement("div");
	honor.classList.add("characterTabHonor");
	honor.innerHTML = addTooltip("<img src='/static/images/icons/elements/honor.png' class='textico'>"+charactercard.virtue,"Virtue");
	blocker.appendChild(honor);

	var cost = document.createElement("div");
	cost.classList.add("characterTabCost");
	var text = '';
	var costs = ["food", "lumber", "stone", "gold", "tradegoods", "gears", "mana"]
	for (var j = 0; j < costs.length; j++) {
		if (charactercard.cost[costs[j]] > 0) {
			if (text != '') {
				text = text + ", ";
			}
			text = text + iconify("["+costs[j]+"] "+charactercard.cost[costs[j]]);
		}
	}
	if (text == '') {
		text == 'free';
	}
	cost.innerHTML = text;
	blocker.appendChild(cost);

	var blocker = document.createElement("div");
	blocker.classList.add("blocker");
	character.appendChild(blocker);

	var speed = document.createElement("div");
	speed.classList.add("characterTabSpeed");
	speed.innerHTML = iconify("[speed] "+charactercard.speed);
	blocker.appendChild(speed);

	var deploy = document.createElement("div");
	deploy.classList.add("characterTabDeploy");
	deploy.innerHTML = iconify("[deploystrength] "+charactercard.deploy);
	blocker.appendChild(deploy);

	var maxstrength = document.createElement("div");
	maxstrength.classList.add("characterTabMaxstrength");
	maxstrength.innerHTML = iconify("[maxstrength] "+charactercard.maxstrength);
	blocker.appendChild(maxstrength);

	var abilities = document.createElement("div");
	abilities.classList.add("characterTabAbilities");
	character.appendChild(abilities);

	return character;
}


function drawBuildingCard(docelement, building) {

	var factionuniquebuildings = document.createElement("table");
	factionuniquebuildings.classList.add("buildingtableinfo");
	docelement.appendChild(factionuniquebuildings);

	var row = document.createElement("tr");
	factionuniquebuildings.appendChild(row);

	var column = document.createElement("td");
	row.appendChild(column);

	var uniquedivider = document.createElement("div");
	uniquedivider.classList.add("buildingtableinfocontainer");
	column.appendChild(uniquedivider);

	var uniqueheader = document.createElement("div");
	uniqueheader.classList.add("buildingheader");
	uniquedivider.appendChild(uniqueheader);

	var uniquetitle = document.createElement("div");
	uniquetitle.classList.add("buildingtitle");
	uniqueheader.appendChild(uniquetitle);
	uniquetitle.innerHTML = iconify("["+building.icon+"]"+ building.name);

	var uniquegarrison = document.createElement("div");
	uniquegarrison.classList.add("buildinggarrison");
	uniqueheader.appendChild(uniquegarrison);
	uniquegarrison.innerHTML = iconify("[garrison]"+ building.garrison);

	var uniquecost = document.createElement("div");
	uniquecost.classList.add("buildingcost");
	uniqueheader.appendChild(uniquecost);
	var count = 0;
	for (var i = 0; i < resources.length; i++) {
		if (building.cost[resources[i].id]) {
			count = count + building.cost[resources[i].id];
		}
	}
	var text = "";
	if (count > 0) {
		for (var i = 0; i < resources.length; i++) {
			if (building.cost[resources[i].id] > 0 && building.cost[resources[i].id]) {
				text = text + building.cost[resources[i].id]+" ["+resources[i].id+"]";
			}
		}
	} else {
		text = text + "-"
	}
	uniquecost.innerHTML = iconify(text);

	var uniquetype = document.createElement("div");
	uniquedivider.appendChild(uniquetype);
	var text = "";
	if (building.type == "village" || building.type == "Village") {
		text = text + "<i class='cardsubtext'>Village Building<i>";
	} else if (building.type == "city" || building.type == "City"){
		text = text + "<i class='cardsubtext'>City Building<i>";
	} else if (building.type == "float"){
		text = text + "<i class='cardsubtext'>Village Building<i>";
	} else {
		text = text + "<i class='cardsubtext'>Free-build Building<i>";
	}
	if (building.limit < 1 ) {
		text = text + " (unlimited)";
	} else {
		text = text + " (limit of "+building.limit+")";
	}
	uniquetype.innerHTML = text;

	var uniquelist = document.createElement("ul");
	uniquedivider.appendChild(uniquelist);
	if (building.citypoints>0){
		var uniqueitem = document.createElement("li");
		var text = "Worth "+building.citypoints+" city points.";
		text = iconify(text);
		uniqueitem.innerHTML = text;
		uniquelist.appendChild(uniqueitem);		
	}
	for (var i = 0; i < building.other.length; i++){
		var uniqueitem = document.createElement("li");
		var text = building.other[i];
		text = iconify(text);
		uniqueitem.innerHTML = text;
		uniquelist.appendChild(uniqueitem);
	}
}

function drawTextBlock (docelement, text) {
	var textcontainer = document.createElement("div");
	textcontainer.classList.add("InMenuTextBlock");
	textcontainer.style.marginTop = "3%";
	textcontainer.style.marginBottom = "3%";
	textcontainer.innerHTML = text;
	docelement.appendChild(textcontainer);
}

function drawActiveTextBlock (docelement, text) {
	var textcontainer = document.createElement("div");
	textcontainer.classList.add("InMenuTextBlock");
	textcontainer.classList.add("active");
	textcontainer.style.marginTop = "3%";
	textcontainer.style.marginBottom = "3%";
	textcontainer.innerHTML = text;
	docelement.appendChild(textcontainer);
}

function drawPassiveTextBlock (docelement, text) {
	var textcontainer = document.createElement("div");
	textcontainer.classList.add("InMenuTextBlock");
	textcontainer.classList.add("passive");
	textcontainer.style.marginTop = "3%";
	textcontainer.style.marginBottom = "3%";
	textcontainer.innerHTML = text;
	docelement.appendChild(textcontainer);
}

function drawHex(docelement, count, firsttile, hexfunction) {
	var container = document.createElement("li");
	container.classList.add("tilecontainer");
	container.style.width = (100/BOARDWIDTH)+"%";
	docelement.appendChild(container);

	if (firsttile) {
		container.style.marginLeft = (100/(2*BOARDWIDTH))+"%";
	}

	var tile = document.createElement("li");
	tile.classList.add("tile");
	tile.style.height = (3850/BOARDHEIGHT)+"%"
	container.appendChild(tile);

	var border = document.createElement("div");
	border.classList.add("tileborder");
	border.classList.add(Tilestate[count]);
	tile.appendChild(border);

	var content = document.createElement("div");
	content.classList.add("tileContent");
	border.appendChild(content);

	if (!(Buildingstate[count] == "")) {
		drawBuildingTile(content, Buildingstate[count]);
	}
	if (!(Characterstate[count] == "")) {
		drawCharacterTile(content, Characterstate[count]);
	}
	
	if (hexfunction) {
		if (meetsHexagonConditions(count, activeAbility)) {
			tile.setAttribute("onclick","hexClick("+(count)+");");
			tile.classList.add("active");
		}
	}

}

//
// DRAW LOGIC FUNCTIONS
//
function isFactionTaken(checkfaction){
	for (var i = 0; i < gameState.players.length; i++) {
		if(gameState.players[i].faction.name == checkfaction) {
			return true;
		}
	}
	return false;
}

function isCharacterTakenByPlayer(checkcharacter, playernumber){
	for (var n = 0; n < gameState.players[playernumber].court.length; n++) {
		if (gameState.players[playernumber].court[n] != "") {
			if(gameState.players[playernumber].court[n].name == checkcharacter) {
				return true;
			}
		}
	}
	return false;
}

function isCharacterTaken(charactername){
	for(var i=0;i<gameState.players.length;i++){
		for (var j=0;j<gameState.players[i].court.length;j++){
			if (gameState.players[i].court[j].name == charactername) {
				return true;
			}
		}
	}
	return false;
}

function includeHTML() {
	var z, i, elmnt, file, xhttp;
	z = document.getElementsByTagName("*");
	for (i = 0; i < z.length; i++) {
	  elmnt = z[i];
	  file = elmnt.getAttribute("includeHTML");
	  if (file) {
		xhttp = new XMLHttpRequest();
		xhttp.onreadystatechange = function() {
		  if (this.readyState == 4) {
			if (this.status == 200) {elmnt.innerHTML = this.responseText;}
			if (this.status == 404) {elmnt.innerHTML = "Page not found.";}
			elmnt.removeAttribute("includeHTML");
			includeHTML();
		  }
		}      
		xhttp.open("GET", file, true);
		xhttp.send();
		return;
	  }
	}
}

function openTab(evt, tabName) {
	var i, tabcontent, tablinks;
	tabcontent = document.getElementsByClassName("tabcontent");
	for (i = 0; i < tabcontent.length; i++) {
	  tabcontent[i].style.display = "none";
	}
	tablinks = document.getElementsByClassName("tablinks");
	for (i = 0; i < tablinks.length; i++) {
	  tablinks[i].className = tablinks[i].className.replace(" active", "");
	}
	document.getElementById(tabName).style.display = "block";
	evt.currentTarget.className += " active";
}

function getColorFromUsername(playername) {
	for (var i = 0; i < gameState.players.length; i++) {
		if (gameState.players[i].username == playername) {
			return gameState.players[i].faction.color;
		}
	}
	return "";
}

function getOffColorFromUsername(playername) {
	for (var i = 0; i < gameState.players.length; i++) {
		if (gameState.players[i].username == playername) {
			return gameState.players[i].faction.offcolor;
		}
	}
	return "";
}

function getCharacterColor(charactername){
	for(var i=0;i<factionlist.length;i++){
		for(var j=0;j<factionlist[i].characters.length;j++){
			if (charactername == factionlist[i].characters[j].name){
				return factionlist[i].color;
			}
		}
	}
	return "grey";
}

function getOwnerColor(charactername){
	for(var i=0;i<gameState.players.length;i++){
		for(var j=0;j<gameState.players[i].court.length;j++){
			if (charactername == gameState.players[i].court[j].name){
				return gameState.players[i].faction.color;
			}
		}
	}
	return "grey";
}

function iconify(text) {
	for (var k = 0; k < resources.length; k++) {
		text = text.replace("["+resources[k].id+"]", addTooltip("<img src='/static/images/icons/elements/"+resources[k].id+".png' class='textico'></img>",resources[k].name));
	}
	for (var k = 0; k < values.length; k++) {
		text = text.replace("["+values[k].id+"]", addTooltip("<img src='/static/images/icons/elements/"+values[k].id+".png' class='textico'></img>",values[k].name));
	}
	for (var k = 0; k < buildinglist.length; k++) {
		text = text.replace("["+buildinglist[k].name.toLowerCase()+"]", addTooltip("<img src='/static/images/icons/Buildings/"+buildinglist[k].name.toLowerCase()+".png' class='textico'></img>",buildinglist[k].name));
	}
	for (var k = 0; k < tilelist.length; k++) {
		text = text.replace("["+tilelist[k]+"]", addTooltip("<img src='/static/images/Lands/"+tilelist[k]+"tile.png' class='textico'></img>",capitalize(tilelist[k])));
	}
	text = text.replace("[action]", addTooltip("<img src='/static/images/icons/elements/"+phases[myPhase].id+".png' class='textico'></img>",capitalize(phases[myPhase].id)+" action"));
	if (gatherdice == "" ){
		text = text.replace("[gatherdice]", "?");
	} else {
		text = text.replace("[gatherdice]", addTooltip("<img src='/static/images/icons/elements/"+gatherdice+".png' class='textico'></img>",capitalize(gatherdice)+" action"));
	}

	return text;
}

function addTooltip(wrap, tooltiptext) {
	wrap = "<div class='tooltip'>"+wrap+"<span class='tooltiptext'>"+tooltiptext+"</span></div>"
	return wrap;
}

function capitalize(text) {
	return text.charAt(0).toUpperCase() + text.slice(1)
}


function getIconFromBuildingname(buildingname){

	var buildingcheck = [].concat(buildinglist);
	for (var i=0;i<gameState.players.length;i++){
		buildingcheck[buildingcheck.length] = gameState.players[i].faction.star;
		buildingcheck[buildingcheck.length] = gameState.players[i].faction.moon;
	}

	for (var j = 0; j < buildingcheck.length; j++) {
		if (buildingcheck[j].name == buildingname || buildingcheck[j].icon == buildingname){
			return buildingcheck[j].icon;
		}
	}
	return "";

}