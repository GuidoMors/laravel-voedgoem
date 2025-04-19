(function(exports) { 

var PlayerHandler=require("./../common/PlayerHandler.js");
var CommonGameController=require("./../common/CommonGameController.js");
var Tools = require('./../../static/common/tools.js');	
var fs = require("fs");

var GAME_NAME="Snowfall";
var NONE="none";

var TILES_FILE_NAME="game/"+GAME_NAME+"/resources/tiles.json";
var MAPS_FILE_NAME="game/"+GAME_NAME+"/resources/maps.json";



/*


*/

var TILESIZEWIDTH = 64;
var TILESIZEHEIGHT = 64;


class SnowfallGameController extends CommonGameController{

		constructor(gameId, host, gameName, ioo, server) {  
		super(GAME_NAME, gameId, host, gameName, ioo, server);
		this.playerHandler=new PlayerHandler(this,ioo, gameId);
		
		
	}	



	defineServerListenersFor(socket){
	}
	
	deleteListeners(){
	}
	
	
	
	doOnRunTimer(){
		this.movePlayers();
		
		if(this.checkGameOver()){
			this.endGame();
		}
		
	}



	doOnStartGame(){
		this.loadMap("map1");
		
	}

	
		loadMap(mapName){
			
		this.gameState.map={};
		this.gameState.map.name=mapName;
		this.gameState.map.levels=SnowfallGameController.maps[mapName].levels;
		this.gameState.map.level=SnowfallGameController.maps[mapName].level;
		this.gameState.map.entities=SnowfallGameController.maps[mapName].entities;


		//starting positions of players
		for(var i=0;i< this.gameState.players.length;i++){
			var currentPlayer=this.gameState.players[i];
			var quickPlayer=this.quickGameState.players[currentPlayer.userId];
			
			for(var j=0;j<SnowfallGameController.maps[mapName].startingPositions.length;j++){
			//console.log("startingpos found");
				var currentPos=SnowfallGameController.maps[mapName].startingPositions[j];
				if(currentPos.userId==undefined && quickPlayer.x==undefined && (currentPos.team==currentPlayer.team || this.gameSettings.teams == 2)){

					var pos=this.getStartingPosForPlayerAtCoords(currentPos.x,currentPos.y);				
					this.quickGameState.players[currentPlayer.userId].x=pos.x;
					this.quickGameState.players[currentPlayer.userId].y=pos.y;
					currentPos.userId=currentPlayer.userId;
				}
			}
		}
	
		
	}
	

	
/**
STATIC PART
**/
	

	static tiles={};
	
	static initialize(){
		SnowfallGameController.initTiles();
		SnowfallGameController.initMaps();
				
	}
	
    static initTiles(){
		var tilesFile=fs.readFileSync(TILES_FILE_NAME);
		SnowfallGameController.tiles=JSON.parse(tilesFile);
	}
	
    static initMaps(){
		var mapsFile=fs.readFileSync(MAPS_FILE_NAME);
		SnowfallGameController.maps=JSON.parse(mapsFile);

		
		for(var mapname in SnowfallGameController.maps){
			
			
			SnowfallGameController.maps[mapname].startingPositions = [];
			for(var i=0;i<SnowfallGameController.maps[mapname].levels;i++){
				
				
			
				for (var n=0;n<10;n++){
					for(var y=0;y<SnowfallGameController.maps[mapname].level[i].grid.length;y++){
						for(var x=0;x<SnowfallGameController.maps[mapname].level[i].grid[y].length;x++){
							if (SnowfallGameController.maps[mapname].level[i].grid[y][x] == "_" +n+ "_"){
								SnowfallGameController.maps[mapname].startingPositions.push({x: x, y: y, team:1});
							}
							if (SnowfallGameController.maps[mapname].level[i].grid[y][x] == "_" +String.fromCharCode(97+n)+ "_"){
								SnowfallGameController.maps[mapname].startingPositions.push({x: x, y: y, team:2});
							}
						}
					}
				}
			/*analog für entities list
				SnowfallGameController.maps[mapname].items = [];
				for(var y=0;y<SnowfallGameController.maps[mapname].grid.length;y++){
					for(var x=0;x<SnowfallGameController.maps[mapname].grid[y].length;x++){

						if (SnowfallGameController.maps[mapname].grid[y][x] == "fur"){
							SnowfallGameController.maps[mapname].items.push({x: x, y: y, items:[], progress: 0, progressType: "", tool: GameControllerCookaloor.tools["pan"].id});
						}
						if (SnowfallGameController.maps[mapname].grid[y][x] == "XpX"){
							SnowfallGameController.maps[mapname].items.push({x: x, y: y, items:[], progress: 0, progressType: "", tool: GameControllerCookaloor.tools["plate"].id});
						}
					}
				}
			*/
				for(var y=0;y<SnowfallGameController.maps[mapname].level[i].grid.length;y++){
					for(var x=0;x<SnowfallGameController.maps[mapname].level[i].grid[y].length;x++){
							if (SnowfallGameController.maps[mapname].level[i].grid[y][x].charAt(0) == "_" && SnowfallGameController.maps[mapname].grid[y][x].charAt(2) == "_"){
								SnowfallGameController.maps[mapname].level[i].grid[y][x]="___";
							}
						
					}
				}
				
				//GameControllerCookaloor.translateStringArrayIntoTileArray(SnowfallGameController.maps[mapname].grid);
			/*	
				//turn tile objects into only ids xd
				for(var y=0;y<SnowfallGameController.maps[mapname].grid.length;y++){
					for(var x=0;x<SnowfallGameController.maps[mapname].grid[y].length;x++){
						SnowfallGameController.maps[mapname].grid[y][x]=SnowfallGameController.tiles[SnowfallGameController.maps[mapname].grid[y][x].name].id;
					}
				}
				//console.log(JSON.stringify(SnowfallGameController.maps[mapname].items));
			}*/
			
			//console.log("reading kitchens...: "+SnowfallGameController.maps);
			
			}
		}
	
	
	}
}
module.exports = SnowfallGameController;
     
})(typeof exports === 'undefined'?  
            window: exports); 