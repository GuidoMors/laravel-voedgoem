(function(exports) { 

var fs = require("fs");
var path= require("path");
var Tools = require('./../../static/common/tools.js');	

var GAME_NAME="Alchemore";
var NONE="none";


var INGREDIENTS_FILE_NAME="game/"+GAME_NAME+"/resources/ingredients.json";
var TILES_FILE_NAME="game/"+GAME_NAME+"/resources/tiles.json";
var TRANSITIONS_FILE_NAME="game/"+GAME_NAME+"/resources/transitions.json";
var MAPS_FILE_NAME="game/"+GAME_NAME+"/resources/maps.json";
var TOOLS_FILE_NAME="game/"+GAME_NAME+"/resources/tools.json";

var mapHashes = [
	["xxx", "table1"],
	["ooo", "table2"],
	["OOO", "wall1"],
	["fur", "furnace1"],
	["cut", "cuttingboard1"],
	["sub", "submitcounter1"],
	["trs", "trash1"],
	["tod", "tomatodispenser"],
	["col", "cauldron"],
	["but", "stopbutton"],
	["enc", "enchanttable1"],
	["mor", "mortar1"]
];



class AlchemoreResourceManager{


	constructor() { 
		console.log("should not happen");
	}	
	

/**
STATIC PART
**/

	
	static tiles={};
	static ingredients={};
	static transitions=[];
	static maps={};
	static tools={};
	//static recipes=[];

	static initialize(){
			
		AlchemoreResourceManager.initTiles();
		AlchemoreResourceManager.initIngredients();
		AlchemoreResourceManager.initTransitions();
		AlchemoreResourceManager.initTools();
		AlchemoreResourceManager.initMaps();
		//AlchemoreResourceManager.initRecipes();
	}


	
	
	static initTools(){
		var toolsFile=fs.readFileSync(TOOLS_FILE_NAME);
		AlchemoreResourceManager.tools=JSON.parse(toolsFile);
				
		for(var i=0;i<Object.keys(AlchemoreResourceManager.tools).length;i++){
			var currentToolName= Object.keys(AlchemoreResourceManager.tools)[i];
			AlchemoreResourceManager.tools[currentToolName].id=i;
		}	

	}	
	/*
	static initRecipes(){
		var recipesFile=fs.readFileSync(RECIPES_FILE_NAME);
		AlchemoreResourceManager.recipes=JSON.parse(recipesFile);
		for(var i=0;i<AlchemoreResourceManager.recipes.length;i++){
			for(var j=0;j<AlchemoreResourceManager.recipes[i].ingredients.length;j++){
				AlchemoreResourceManager.recipes[i].ingredients[j]=AlchemoreResourceManager.ingredients[AlchemoreResourceManager.recipes[i].ingredients[j]].id;
			}
		}		
	}*/
	
	static initIngredients(){
		var ingredientsFile=fs.readFileSync(INGREDIENTS_FILE_NAME);
		AlchemoreResourceManager.ingredients=JSON.parse(ingredientsFile);
		for(var i=0;i<Object.keys(AlchemoreResourceManager.ingredients).length;i++){
			var currentIngredientName= Object.keys(AlchemoreResourceManager.ingredients)[i];
			AlchemoreResourceManager.ingredients[currentIngredientName].id=i;
		}
	}
	
	static initTransitions(){
		var transitionsFile=fs.readFileSync(TRANSITIONS_FILE_NAME);
		AlchemoreResourceManager.transitions=JSON.parse(transitionsFile);		
	}
	
	static initTiles(){
		var tilesFile=fs.readFileSync(TILES_FILE_NAME);
		AlchemoreResourceManager.tiles=JSON.parse(tilesFile);
		for(var i=0;i<Object.keys(AlchemoreResourceManager.tiles).length;i++){
			var currentTileName= Object.keys(AlchemoreResourceManager.tiles)[i];
			AlchemoreResourceManager.tiles[currentTileName].id=i;
		}
		var noTile={name: NONE, id:"0", img: "", isBlocking:true, action:NONE, dispenserItem: ""};
		AlchemoreResourceManager.tiles[noTile.name]=noTile;
		
	}

	static initMaps(){
		var mapFile=fs.readFileSync(MAPS_FILE_NAME);
		AlchemoreResourceManager.maps=JSON.parse(mapFile);
		for(var mapname in AlchemoreResourceManager.maps){

			AlchemoreResourceManager.maps[mapname].startingPositions = [];
			for (var n=0;n<10;n++){
				for(var y=0;y<AlchemoreResourceManager.maps[mapname].grid.length;y++){
					for(var x=0;x<AlchemoreResourceManager.maps[mapname].grid[y].length;x++){
						if (AlchemoreResourceManager.maps[mapname].grid[y][x] == " " +n+ " " || AlchemoreResourceManager.maps[mapname].grid[y][x] == "." +n+ "."){
							AlchemoreResourceManager.maps[mapname].startingPositions.push({x: x, y: y, team:1});
						}
						if (AlchemoreResourceManager.maps[mapname].grid[y][x] == " " +String.fromCharCode(97+n)+ " " || AlchemoreResourceManager.maps[mapname].grid[y][x] == "." +String.fromCharCode(97+n)+ "."){
							AlchemoreResourceManager.maps[mapname].startingPositions.push({x: x, y: y, team:2});
						}
					}
				}
			}

			AlchemoreResourceManager.maps[mapname].items = [];
			/*for(var y=0;y<AlchemoreResourceManager.maps[mapname].grid.length;y++){
				for(var x=0;x<AlchemoreResourceManager.maps[mapname].grid[y].length;x++){

					if (AlchemoreResourceManager.maps[mapname].grid[y][x] == "fur"){
						AlchemoreResourceManager.maps[mapname].items.push({x: x, y: y, items:[], progress: 0, progressType: "", tool: AlchemoreResourceManager.tools["pan"].id});
					}
					if (AlchemoreResourceManager.maps[mapname].grid[y][x] == "XpX"){
						AlchemoreResourceManager.maps[mapname].items.push({x: x, y: y, items:[], progress: 0, progressType: "", tool: AlchemoreResourceManager.tools["plate"].id});
					}
				}
			}*/

			for(var y=0;y<AlchemoreResourceManager.maps[mapname].grid.length;y++){
				for(var x=0;x<AlchemoreResourceManager.maps[mapname].grid[y].length;x++){
					for (var i=0;i<mapHashes.length;i++){
						if (AlchemoreResourceManager.maps[mapname].grid[y][x] == mapHashes[i][0]){
							AlchemoreResourceManager.maps[mapname].grid[y][x]=mapHashes[i][1];
						}
						if (AlchemoreResourceManager.maps[mapname].grid[y][x].charAt(0) == " " && AlchemoreResourceManager.maps[mapname].grid[y][x].charAt(2) == " "){
							if (AlchemoreResourceManager.maps[mapname].grid[y][x] == " D "){
								AlchemoreResourceManager.maps[mapname].grid[y][x]="woodendoor1";
							} else {
								AlchemoreResourceManager.maps[mapname].grid[y][x]="woodenfloor1";
							}
							
						}
						if (AlchemoreResourceManager.maps[mapname].grid[y][x].charAt(0) == "." && AlchemoreResourceManager.maps[mapname].grid[y][x].charAt(2) == "."){
							if (AlchemoreResourceManager.maps[mapname].grid[y][x] == ".D."){
								AlchemoreResourceManager.maps[mapname].grid[y][x]="stonedoor1";
							} else {
								AlchemoreResourceManager.maps[mapname].grid[y][x]="stonefloor1";
							}
							
						}
					}
				}
			}
			
			AlchemoreResourceManager.translateStringArrayIntoTileArray(AlchemoreResourceManager.maps[mapname].grid);
			
			for(var y=0;y<AlchemoreResourceManager.maps[mapname].grid.length;y++){
				for(var x=0;x<AlchemoreResourceManager.maps[mapname].grid[y].length;x++){
					AlchemoreResourceManager.maps[mapname].grid[y][x]=AlchemoreResourceManager.tiles[AlchemoreResourceManager.maps[mapname].grid[y][x].name].id;
				}
			}
		}
		
	}
	
	static translateStringArrayIntoItemArray(items){
		for(var i=0; i < items.length;i++){
				for(var j=0; j < items[i].items.length;j++){
					var itemName=items[i].items[j];
					items[i].items[j]=AlchemoreResourceManager.ingredients[itemName];
					
					if(items[i].items[j]==undefined){
						items[i].items.splice(j,1);
					}
				}
				if(items[i].items.length<=0 && items[i].tool==NONE){
					items.splice(i,1);
				}
				
			items[i].tool=AlchemoreResourceManager.tools[items[i].tool];
			if(items[i].tool==undefined){
				items[i].tool=NONE;
			}
		}
		
	}

	static translateStringArrayIntoTileArray(grid){
		for(var y=0; y < grid.length;y++){
				for(var x=0; x<grid[y].length;x++){
					grid[y][x]=AlchemoreResourceManager.tiles[grid[y][x]];
				}
		}
	}		
}


module.exports = AlchemoreResourceManager;
     
})(typeof exports === 'undefined'?  
            window: exports); 