/*Script for general client-Side functions*/


/** general VARIABLES**/

var cuttingColors = [{type: "chop", color: "yellow"},{type: "pestle", color: "white"},{type: "cook", color: "red"},{type: "enchant", color: "purple"}];
var kitchenPictures = [];
var floorPictures = [];
var playerPictures = [];
var itemPictures = [];
var tilePictures = [];
var wallGrid = [];
var floorTotalImages=0;
var maskImagesOKCounter=0;
var outlineImagesOKCounter=0;
var itemImagesOKCounter=0;
var floorImagesOKCounter=0;
var kitchenTileTotalImages=0;
var kitchenTileImagesOKCounter=0;
var maskImgs=[];
var outlineImgs=[];
var itemImgs=[];

var submitAnimations=[];

var cookAnimImages = [];
var cookAnimsLoaded = 0;
var cookAnimsToBeLoaded = 0;
var cookAnimIndex = 0;

var chopAnimImages = [];
var chopAnimsLoaded = 0;
var chopAnimsToBeLoaded = 0;
var chopAnimIndex = 0;

var cleanAnimImages = [];
var cleanAnimsLoaded = 0;
var cleanAnimsToBeLoaded = 0;
var cleanAnimIndex = 0;

var submitAnimImages = [];
var submitAnimsLoaded = 0;
var submitAnimsToBeLoaded = 0;

var doorImages = [];
var doorsLoaded = 0;
var doorsToBeLoaded = 0;

var startImages = [];
var startAnimsLoaded = 0;

var totalDraws = 0;
var FRAMES = 60;
var intervalCounter = 0;


var isFloorDrawn=false;



function initStartAnimation(){
	for (var i = 1; i<=3;i++){
		startImages[i] = new Image();
		startImages[i].src = "/static/Cookaloor/images/effects/start/"+i+".png";
		startImages[i].onload = function(){ startAnimsLoaded++;};
	}
}

function initializeAnimationImages(){

	var anims = [
		{anim: 0, amount: 35},
		{anim: 1, amount: 6},
		{anim: 2, amount: 3},
		{anim: 1, amount: 6}
	];

	var indexer = [-1,-1,-1];

	for (var i = 0; i<anims.length;i++){
		for (var j = 0; j<anims[i].amount;j++) {
			if (indexer[anims[i].anim] == -1){
				indexer[anims[i].anim] = cookAnimImages.length;
				cookAnimImages[cookAnimImages.length] = new Image();
				cookAnimImages[cookAnimImages.length-1].src = "/static/Cookaloor/images/effects/cook/"+anims[i].anim+".png";
				cookAnimsToBeLoaded++;
				cookAnimImages[cookAnimImages.length-1].onload = function(){ cookAnimsLoaded++;};
			} else {
				cookAnimImages[cookAnimImages.length] = cookAnimImages[indexer[anims[i].anim]];
			}
		}
	}

	var upFrame = 6;
	var downFrame = 20;

	var anims = [
		{anim: 0, amount: upFrame},
		{anim: 1, amount: downFrame},
		{anim: 2, amount: upFrame},
		{anim: 3, amount: downFrame},
		{anim: 4, amount: upFrame},
		{anim: 5, amount: downFrame},
		{anim: 6, amount: upFrame},
		{anim: 7, amount: downFrame}
	];

	var indexer = [];
	for (var i = 0; i<=7;i++){
		indexer[i] = -1;
	}
	
	for (var i = 0; i<anims.length;i++){
		for (var j = 0; j<anims[i].amount;j++) {
			if (indexer[anims[i].anim] == -1){
				indexer[anims[i].anim] = chopAnimImages.length;
				chopAnimImages[chopAnimImages.length] = new Image();
				chopAnimImages[chopAnimImages.length-1].src = "/static/Cookaloor/images/effects/chop/"+anims[i].anim+".png";
				chopAnimsToBeLoaded++;
				chopAnimImages[chopAnimImages.length-1].onload = function(){ chopAnimsLoaded++;};
			} else {
				chopAnimImages[chopAnimImages.length] = chopAnimImages[indexer[anims[i].anim]];
			}
		}
	}


	var anims = [];
	for (var i = 0; i<=7;i++){
		anims[i] = {anim: i, amount: 5};
	}

	var indexer = [];
	for (var i = 0; i<=7;i++){
		indexer[i] = -1;
	}
	
	for (var i = 0; i<anims.length;i++){
		for (var j = 0; j<anims[i].amount;j++) {
			if (indexer[anims[i].anim] == -1){
				indexer[anims[i].anim] = cleanAnimImages.length;
				cleanAnimImages[cleanAnimImages.length] = new Image();
				cleanAnimImages[cleanAnimImages.length-1].src = "/static/Cookaloor/images/effects/clean/"+anims[i].anim+".png";
				cleanAnimsToBeLoaded++;
				cleanAnimImages[cleanAnimImages.length-1].onload = function(){ cleanAnimsLoaded++;};
			} else {
				cleanAnimImages[cleanAnimImages.length] = cleanAnimImages[indexer[anims[i].anim]];
			}
		}
	}

	submitAnimImages[0] = new Image();
	submitAnimImages[0].src = "/static/Cookaloor/images/effects/submit/submitgood.png";
	submitAnimsToBeLoaded++;
	submitAnimImages[0].onload = function(){ submitAnimsLoaded++;};

	submitAnimImages[1] = new Image();
	submitAnimImages[1].src = "/static/Cookaloor/images/effects/submit/submitbad.png";
	submitAnimsToBeLoaded++;
	submitAnimImages[1].onload = function(){ submitAnimsLoaded++;};


	doorImages[0] = new Image();
	doorImages[0].src = "/static/Alchemore/images/effects/door/door_horizontal_1.png";
	doorsToBeLoaded++;
	doorImages[0].onload = function(){ doorsLoaded++;};

	doorImages[1] = new Image();
	doorImages[1].src = "/static/Alchemore/images/effects/door/door_vertical_1.png";
	doorsToBeLoaded++;
	doorImages[1].onload = function(){ doorsLoaded++;};

};



function incrementIndexes(){
	chopAnimIndex++;
	if (chopAnimIndex >= chopAnimImages.length){
		chopAnimIndex = 0;
	}
	cookAnimIndex++;
	if (cookAnimIndex >= cookAnimImages.length){
		cookAnimIndex = 0;
	}
	cleanAnimIndex++;
	if (cleanAnimIndex >= cleanAnimImages.length){
		cleanAnimIndex = 0;
	}

}


function allMaskImagesLoaded(){
	return maskImagesOKCounter==maskImgs.length;
}

function allFloorImagesLoaded(){
	return floorImagesOKCounter==floorTotalImages;
}
function allKitchenTileImagesLoaded(){
	return kitchenTileImagesOKCounter==kitchenTileTotalImages;
}
function allOutlineImagesLoaded(){
	return outlineImagesOKCounter==outlineImgs.length;
}

function clearCanvas() {
	var canvas = document.getElementById('canvas');
	var context = canvas.getContext('2d');
	context.clearRect(0, 0, canvas.width, canvas.height);
}

function clearOverlayCanvas() {
	var canvas = document.getElementById('overlayCanvas');
	var context = canvas.getContext('2d');
	context.clearRect(0, 0, canvas.width, canvas.height);
}



function drawFloorImages(){

	var floorCanvas = document.getElementById('floorCanvas');
	floorCanvas.style.display = "block";
	floorCanvas.width = gameState.map.grid[0].length*gameSettings.tileSizeW;
	floorCanvas.height = gameState.map.grid.length*gameSettings.tileSizeH;
	var floorContext = floorCanvas.getContext('2d');

	var dh = 0.333 * gameSettings.tileSizeH;

	for(var y=0;y<gameState.map.grid.length;y++){
		for(var x=0;x<gameState.map.grid[y].length;x++){
			if (floorPictures[y][x]) {
				var w = gameSettings.tileSizeW;
				var h = gameSettings.tileSizeH;
				floorContext.drawImage(floorPictures[y][x], x*w,y*h+dh,w,h);
			}
		}
	}
}

function initTileImages(){
	for (var i=0;i<Object.values(allTilesList).length;i++){
		tilePictures[i] = new Image();
		tilePictures[i].src = Object.values(allTilesList)[i].img;
	}
}
	
//draws the image objects of tiles of the kitchen (these images arent saved because the kitchen tiles should be unchanging for the course of the game)
function initKitchenImages(){
	
	//init the canvas...
	var canvas = document.getElementById('canvas');
	canvas.style.display = "block";
	canvas.width = gameState.map.grid[0].length*gameSettings.tileSizeW;
	canvas.height = gameState.map.grid.length*gameSettings.tileSizeH;
	var context = canvas.getContext('2d');

	wallGrid = [];

	//clears the last kitchen in the canvas
	context.clearRect(0, 0, canvas.width, canvas.height);
	for(var y=0;y<gameState.map.grid.length;y++){
		kitchenPictures[y] = [];
		floorPictures[y] = [];
		wallGrid[y] = [];
		if (allTilesList != undefined) {
			for(var x=0;x<gameState.map.grid[y].length;x++){
				var currentTileId=gameState.map.grid[y][x];
				var currentTile=Object.values(allTilesList)[currentTileId];

				if (currentTile.progressType == "wall"){
					wallGrid[y][x]=1;
				} else {
					wallGrid[y][x]=0;
				}
				
				if(currentTile.img!="" && currentTile.isBlocking){	//could be isBlocking instead of "floor"
					var tileImg = new Image();
					tileImg.src = currentTile.img;
					kitchenPictures[y][x] = tileImg;
					kitchenTileTotalImages++;
					tileImg.onload = function(){ kitchenTileImagesOKCounter++;  onKitchenTileImagesLoaded();};
				} else {
					if (currentTile.action == "door") {
						kitchenPictures[y][x] = "door";
					} else {
						kitchenPictures[y][x] = "";
					}
					if (!currentTile.isBlocking) {
						var tileImg = new Image();
						tileImg.src = currentTile.img;
						floorPictures[y][x] = tileImg;
						floorTotalImages++;
						
						tileImg.onload = function(){ floorImagesOKCounter++;  onFloorImagesLoaded(); };
					}
				}
				
			}
		}
	}
	
}

	
	
//loads the image objects that together compromise all different angles of all player objects and hides them (updateObjects should unhide and move the image objects)
function initPlayerImages(){
	var canvas = document.getElementById('canvas');
	var context = canvas.getContext('2d');
	context.fillStyle = 'black';
	context.font = "bold 12px smallfont";

	for (var i=0; i< gameState.players.length;i++){

		var currentPlayer=gameState.players[i];
		var w = currentPlayer.w;
		var h = currentPlayer.h;
		var x = 500;
		var y = 500;
		context.beginPath();

		var myImages = {hat: "", body: "", face: ""};
		playerPictures[i] = {images: myImages};
		
			
		for(var j=0; j < cheflayer.length;j++){
			var currentImg="/static/common/images/Character2D/"+cheflayers[j]+"/"+currentPlayer.selectedCharacter[cheflayer[j]];
			playerPictures[i].images[cheflayer[j]] = {front: "", top: "", left: "", right: "", frontleft: "", topleft: "", frontright: "", topright: ""};


			for (var k=0; k< directionList.length;k++){
				playerPictures[i].images[cheflayer[j]][directionList[k]] = {outline: "", mask: ""};
				var currentDirectionalOutline = currentImg+"/"+directionList[k]+"/outline.png";
				var img = new Image();
				
				if(currentDirectionalOutline.includes("left")){
					currentDirectionalOutline = currentDirectionalOutline.replace("left","right");
					img.src = currentDirectionalOutline;
					img.width = w;
					img.height = h;
					outlineImgs.push({image:img, playerIndex: i, cheflayerIndex:j, directionIndex:k});
					img.onload = function(){ outlineImagesOKCounter++;  onOutlineImagesLoaded(); };
				} else {
					img.src = currentDirectionalOutline;
					playerPictures[i].images[cheflayer[j]][directionList[k]].outline = img;
				}


				var currentDirectionalMask = currentImg+"/"+directionList[k]+"/mask.png";
				
				var img = new Image();

				var wantMask = playerWantsMask(currentPlayer, cheflayer[j])
				
				if ( wantMask || currentDirectionalMask.includes("left")) {
					currentDirectionalMask = currentDirectionalMask.replace("left","right");
					img.src = currentDirectionalMask;
					img.width = w;
					img.height = h;
					maskImgs.push({image:img, playerIndex: i, cheflayerIndex:j, directionIndex:k, masked:wantMask});
					img.onload = function(){ maskImagesOKCounter++;  onMaskImagesLoaded(); };
				} else {
					img.src = currentDirectionalMask;
					playerPictures[i].images[cheflayer[j]][directionList[k]].mask = img;
				}
	
	
			}

		}
		
		context.fill();
	}
}

var onFloorImagesLoaded = function() {
	if (allFloorImagesLoaded()) {
		//drawFloorImages();
	}
};

var onKitchenTileImagesLoaded = function() {
	//if (allKitchenTileImagesLoaded()) {
		
	//}
};

	
var onMaskImagesLoaded = function() {
    if (allMaskImagesLoaded()) {
        // all images are fully loaded an ready to use
        
		for(var i=0;i<maskImgs.length;i++){
			
			changeMaskImageForPlayer(maskImgs[i].image,maskImgs[i].playerIndex, maskImgs[i].cheflayerIndex, maskImgs[i].directionIndex, maskImgs[i].masked);
			
		}
		
    }
};

var onOutlineImagesLoaded = function() {
    if (allOutlineImagesLoaded()) {
        // all images are fully loaded an ready to use
        
		for(var i=0;i<outlineImgs.length;i++){
			
			changeOutlineImageForPlayer(outlineImgs[i].image,outlineImgs[i].playerIndex,outlineImgs[i].cheflayerIndex,outlineImgs[i].directionIndex);
			
		}
		
    }
};

function playerWantsMask(maskPlayer,  maskname) {
	if (maskname == "hat") {
		return maskPlayer.selectedCharacter.hasHatMask;
	}
	if (maskname == "body") {
		return maskPlayer.selectedCharacter.hasBodyMask;
	}
	if (maskname == "face") {
		return maskPlayer.selectedCharacter.hasFaceMask;
	}
	return false;
}


function changeMaskImage(img, colorRGB, direction, wantMask ){
	
	var canvas = document.createElement('canvas');
	canvas.width=img.width;
	canvas.height=img.height;
	var context = canvas.getContext('2d');
	context.clearRect(0, 0, img.width, img.height);

	var imageData1 = context.getImageData(0, 0,img.width, img.height);

	if (direction.includes("left")) {
		
		context.save();
		context.scale(-1, 1); 
		context.drawImage(img, 0, 0, img.width*-1, img.height);
		context.restore();

	} else {
		context.drawImage(img, 0, 0, img.width, img.height);
	}

	var imageData2 = context.getImageData(0, 0, img.width, img.height);

	// Iterate through every pixel
	if (wantMask) {
		for (var m = 0; m < imageData2.data.length; m += 4) {
			// Modify pixel data
			
			if (imageData2.data[m] != imageData1.data[m] || imageData2.data[m+1] != imageData1.data[m+1] || imageData2.data[m+2] != imageData1.data[m+2]){
				imageData2.data[m + 0] = colorRGB[0];  // R value
				imageData2.data[m + 1] = colorRGB[1];    // G value
				imageData2.data[m + 2] = colorRGB[2];  // B value
			} else {
				imageData2.data[m + 0] = 0;  // R value
				imageData2.data[m + 1] = 0;  // G value
				imageData2.data[m + 2] = 0;  // B value
				imageData2.data[m + 3] = 0;  // A value
			}
		}
	}

	return imagedata_to_image(imageData2);
}

function changeMaskImageForPlayer(img, playerIndex,chefLayerIndex,directionIndex,wantMask ){
	// all images are fully loaded an ready to use
	var colorRGB=gameState.players[playerIndex].selectedCharacter[cheflayer[chefLayerIndex]+"Color"];
	var changedImg=changeMaskImage(img, colorRGB, directionList[directionIndex],wantMask);

	playerPictures[playerIndex].images[cheflayer[chefLayerIndex]][directionList[directionIndex]].mask = changedImg;
		
	
}

function changeOutlineImageForPlayer(img, playerIndex,chefLayerIndex,directionIndex ){
	// all images are fully loaded an ready to use

	var canvas = document.createElement('canvas');
	canvas.width=img.width;
	canvas.height=img.height;
	var context = canvas.getContext('2d');

	if (directionList[directionIndex].includes("left")) {

		context.clearRect(0, 0, canvas.width, canvas.height);

		context.save();
		context.scale(-1, 1); 
		context.drawImage(img, 0, 0, -1*img.width, img.height);
		context.restore();
		var imageData = context.getImageData(0, 0, img.width, img.height);
		
	} else {
		
		context.clearRect(0, 0, canvas.width, canvas.height);
		context.drawImage(img, 0, 0, img.width, img.height);
		var imageData = context.getImageData(0, 0, img.width, img.height);
	}
	
	

	playerPictures[playerIndex].images[cheflayer[chefLayerIndex]][directionList[directionIndex]].outline = imagedata_to_image(imageData);
		

}

//loads all image objects relating to items that are currently in the kitchen
function initItemImages(){

	//allItemsList is supposed to be a list of all items that we received from server. we create an image and add it to the list entry.
	for (var item in allItemsList){ // have .name and .img
		allItemsList[item].image = {front:""};
		var itemImage = new Image();
		itemImage.src=allItemsList[item].img;
		allItemsList[item].image.front=itemImage;
	}
	
	for (var tool in allToolsList){ // have .name and .img
		allToolsList[tool].image = {front:"", frontleft: "", left: "", topleft: "", top: "", frontright: "", right: "", topright: ""};
		var toolImage = new Image();
		toolImage.src=allToolsList[tool].img;
		allToolsList[tool].image.front=toolImage;

		if (allToolsList[tool].name == "pan") {
			for (var i=0;i<directionList.length;i++) {
				if (directionList[i] != "front") {
					var toolImage = new Image();
					toolImage.src=allToolsList[tool].img;
					toolImage.width = gameSettings.toolSizeW;
					toolImage.height = gameSettings.toolSizeH;
					itemImgs.push({image:toolImage, direction: directionList[i], tool: allToolsList[tool].name});
					toolImage.onload = function(){ itemImagesOKCounter++;  onItemImagesLoaded(); };
				}
			}
			
		}
	}

}

var onItemImagesLoaded = function() {
	if (itemImagesOKCounter == itemImgs.length) {
	// all images are fully loaded an ready to use
		changeItemImages();
	}
};

function changeItemImages(){
	var canvas = document.createElement('canvas');
	canvas.width=gameSettings.toolSizeW*25;
	canvas.height=gameSettings.toolSizeH*25;
	var context = canvas.getContext('2d');


	for (var i=0; i<itemImgs.length; i++) {
		var angle = 0;
		var xOffset = 0;
		var yOffset = 0;

		switch(itemImgs[i].direction) {
			case "top":
				angle = 180*Math.PI/180;
				xOffset = itemImgs[i].image.width/-0.95;
				yOffset = itemImgs[i].image.height/-1.05;
				break;
			case "left":
				angle = 90*Math.PI/180;
				xOffset = itemImgs[i].image.width/20;
				yOffset = itemImgs[i].image.height/-1;
				break;
			case "right":
				angle = -90*Math.PI/180;
				xOffset = itemImgs[i].image.width/-0.9;
				yOffset = itemImgs[i].image.height/-100;
				break;
			case "frontright":
				angle = -45*Math.PI/180;0
				xOffset = itemImgs[i].image.width/-1.7;
				yOffset = itemImgs[i].image.height/4.7;
				break;
			case "frontleft":
				angle = 45*Math.PI/180;
				xOffset = itemImgs[i].image.width/4;
				yOffset = itemImgs[i].image.height/-2;
				break;
			case "topright":
				angle = -135*Math.PI/180;
				xOffset = itemImgs[i].image.width/-0.8;
				yOffset = itemImgs[i].image.height/-1.7;
				break;
			case "topleft":
				angle = 135*Math.PI/180;
				xOffset = itemImgs[i].image.width/-2.2;
				yOffset = itemImgs[i].image.height/-0.75;
				break;
			default:
			}

		context.clearRect(0, 0, canvas.width, canvas.height);

		context.save();
		context.rotate(angle);

		context.drawImage(itemImgs[i].image, xOffset, yOffset, itemImgs[i].image.width, itemImgs[i].image.height);

		context.rotate(-angle);
		context.restore();

		var imageData = context.getImageData(0, 0, itemImgs[i].image.width, itemImgs[i].image.height);

		allToolsList[itemImgs[i].tool].image[itemImgs[i].direction] =  imagedata_to_image(imageData);
	}
	
}

//takes all currently existing image objects that belong to players and updates their position and (un)hides them
function drawKitchen(row){
	if(allKitchenTileImagesLoaded()){
		var canvas = document.getElementById('canvas');
		var context = canvas.getContext('2d');
		context.fillStyle = 'black';

		var w = gameSettings.tileSizeW;
		var h = gameSettings.tileSizeH;
		var dh = 0.333 * gameSettings.tileSizeH;

		if (kitchenPictures.length != 0){
			for(var x=0;x<gameState.map.grid[row].length;x++){
			
				//draw regular objects
				if(row-1 > 0 &&kitchenPictures[row-1][x]!="" && kitchenPictures[row-1][x]!="door" && wallGrid[row-1][x] == 0){	
					context.drawImage(kitchenPictures[row-1][x], x*w,(row-1)*h,w,h+dh);
				}

				//draw horizontal doors
				if (kitchenPictures[row][x] == "door" && doorIsHorizontal(row,x)){
					drawDoor(row, x);
				}

				//draw vertical doors
				if (row-2 > 0 && kitchenPictures[row-2][x] == "door" && !doorIsHorizontal(row-2,x)){
					drawDoor(row-2, x);
				}

				//draw walls
				if (row-1 > 0 && kitchenPictures[row-1][x]!="door" && wallGrid[row-1][x] == 1) {
					context.drawImage(kitchenPictures[row-1][x], x*w,(row-1)*h-h,w,2*h+dh);
				}
				

				//do some early catchup drawing
				if (row == 0) {

					//draw catchup walls
					if (kitchenPictures[0][x]!="door" && wallGrid[0][x] == 1) {
						context.drawImage(kitchenPictures[0][x], x*w,row*h-h,w,2*h+dh);
					}

					//draw catchup vertical doors
					if (kitchenPictures[0][x] == "door" && !doorIsHorizontal(0,x)){
						drawDoor(0, x);
					}
				}

					
			}
		}
	}
}


function drawKitchenLastWalls(){
	var max = gameState.map.grid.length-1;

	var canvas = document.getElementById('canvas');
	var context = canvas.getContext('2d');

	var w = gameSettings.tileSizeW;
	var h = gameSettings.tileSizeH;
	var dh = 0.333 * gameSettings.tileSizeH;

	if (kitchenPictures.length != 0){
		for(var x=0;x<gameState.map.grid[max].length;x++){
			//draw catchup walls
			if (kitchenPictures[max][x]!="door" && wallGrid[max][x] == 1) {
				context.drawImage(kitchenPictures[max][x], x*w,max*h-h,w,2*h+dh);
			}

			//draw catchup vertical doors
			if (kitchenPictures[max][x] == "door" && !doorIsHorizontal(max,x)){
				drawDoor(max, x);
			}
			if (kitchenPictures[max-1][x] == "door" && !doorIsHorizontal(max-1,x)){
				drawDoor(max-1, x);
			}
		}
	}
}

//draws a vertical or horizontal door based on the walls around it and based on if any player is closed
function drawDoor(y, x){
	
	if (doorsToBeLoaded == doorsToBeLoaded){
		var canvas = document.getElementById('canvas');
		var context = canvas.getContext('2d');
		var w = gameSettings.tileSizeW;
		var h = gameSettings.tileSizeH;

		var drawDirection = 0;

		var isHorizontal = doorIsHorizontal(y,x);
		var hasPlayerClose = isPlayerClose(y,x);

		if (isHorizontal && hasPlayerClose){
			drawDirection = 1;
		}
		if (!isHorizontal && !hasPlayerClose){
			drawDirection = 1;
		}

		if (isHorizontal){
			context.drawImage(doorImages[drawDirection], x*w,y*h-(0.75*h),w,2*h);
		} else {
			if (hasPlayerClose){
				context.drawImage(doorImages[drawDirection], x*w+(0.3*w),y*h-(0.65*h),w,2*h);
			} else {
				context.drawImage(doorImages[drawDirection], x*w+(0.3*w),y*h-h,w,2*h);
			}
			
		}
		
		
	}

}

function doorIsHorizontal(y,x){
	return wallGrid[y][x-1] == 1;
}

function isPlayerClose(y,x){
	for (var i =0; i <gameState.players.length; i++){
		var player=quickGameState.players[gameState.players[i].userId];
		if (player != null){

			var xg = x*gameSettings.tileSizeW;
			var yg = y*gameSettings.tileSizeH;
			var xp = player.x;
			var yp = player.y;
			
			if (Tools.calcDistance(xg,yg,xp,yp) < 120){
				return true;
			} 
		}
	}

	return false;
}


//takes all currently existing image objects that belong to players and updates their position and (un)hides them
//allowed strings for drawlayer are: body, face, hat, all, toponly
function drawPlayers(row, drawlayer){
	var canvas = document.getElementById('canvas');
	var context = canvas.getContext('2d');
	context.fillStyle = 'black';
	context.font = "bold 12px smallfont";

	var dh = 0.333 * gameSettings.tileSizeH;

	var playersInRow = [];
	
	for (var i=0; i< gameState.players.length;i++){
		
		var player=quickGameState.players[gameState.players[i].userId];

		if (player != null && getRowFromYCoordinate(player.y) == row) {
			playersInRow.push( {player: gameState.players[i], index: i, y: player.y} );
		}

	}

	playersInRow.sort(function(a, b) {
		return a.y-b.y;
	});

	if (playerPictures.length != 0){
		for (var i=0; i< playersInRow.length;i++){
			var currentPlayer = playersInRow[i].player;
			var player=quickGameState.players[currentPlayer.userId];
	
			var playerDirection = getDirectionStringFromMovement(player.direction);
	
			if (drawlayer == "body"){
				if (playerDirection == "topright" || playerDirection == "topleft" || playerDirection == "top"){
					drawHands(player);
				}
			}
			
			context.beginPath();
			var x = (player.x-(currentPlayer.w / 2));
			var y = (player.y-currentPlayer.h);
			var w= currentPlayer.w;
			var h= currentPlayer.h;
			
			for(var j=0; j < cheflayer.length;j++){

				if (drawlayer == cheflayer[j] || drawlayer == "all" || (drawlayer == "toponly" && cheflayer[j] != "body")) {
					var img = playerPictures[playersInRow[i].index].images[cheflayer[j]][playerDirection].mask;
					context.drawImage(img, x,y+dh,w,h);
					var img = playerPictures[playersInRow[i].index].images[cheflayer[j]][playerDirection].outline;
					context.drawImage(img, x,y+dh,w,h);
				}

			}
				if (drawlayer != "body"){
					if (playerDirection == "front" || playerDirection == "frontleft" || playerDirection == "frontright"|| playerDirection == "left" || playerDirection == "right" ){
						drawHands(player);
					}
			
		
				if (playerDirection == "front" || playerDirection == "frontleft" || playerDirection == "frontright"|| playerDirection == "left" || playerDirection == "right" ){
					drawHands(player);
				}
	
			}
			
			var drawPlayerNames=false; //TODO put in gamesettings?
			if(drawPlayerNames){
				var name=getUserNameById(currentPlayer.userId);
				var nameLength=name.length;
					context.fillText(name, x+(currentPlayer.w / 2)-(nameLength*2.5), y+(h*(5/4))); 
				
			}
		}
	}			


}

function drawHands(player) {
	var canvas = document.getElementById('canvas');
	var context = canvas.getContext('2d');

	var playerDirection = getDirectionStringFromMovement(player.direction);
	var quickPlayer=quickGameState.players[player.userId];

	var dh = 0.333 * gameSettings.tileSizeH;
	
	var itemW = gameSettings.ingredientSizeW;
	var itemH = gameSettings.ingredientSizeH;
	if (playerDirection == "front") {
		var itemX = player.x - (itemH/2) - (0*gameSettings.playerDisplayWidth);
		var itemY = player.y - (itemW/2) - (0.1*gameSettings.playerDisplayHeight);
	}

	if (playerDirection == "frontright") {
		var itemX = player.x - (itemH/2) + (0.15*gameSettings.playerDisplayWidth);
		var itemY = player.y - (itemW/2) - (0.15*gameSettings.playerDisplayHeight);
	}

	if (playerDirection == "frontleft") {
		var itemX = player.x - (itemH/2) - (0.15*gameSettings.playerDisplayWidth);
		var itemY = player.y - (itemW/2) - (0.15*gameSettings.playerDisplayHeight);
	}

	if (playerDirection == "left") {
		var itemX = player.x - (itemH/2) - (0.5*gameSettings.playerDisplayWidth);
		var itemY = player.y - (itemW/2) - (0.25*gameSettings.playerDisplayHeight);
	}

	if (playerDirection == "right") {
		var itemX = player.x - (itemH/2) + (0.5*gameSettings.playerDisplayWidth);
		var itemY = player.y - (itemW/2) - (0.25*gameSettings.playerDisplayHeight);
	}

	if (playerDirection == "topright") {
		var itemX = player.x - (itemH/2) + (0.42*gameSettings.playerDisplayWidth);
		var itemY = player.y - (itemW/2) - (0.35*gameSettings.playerDisplayHeight);
	}

	if (playerDirection == "topleft") {
		var itemX = player.x - (itemH/2) - (0.42*gameSettings.playerDisplayWidth);
		var itemY = player.y - (itemW/2) - (0.35*gameSettings.playerDisplayHeight);
	}

	if (playerDirection == "top") {
		var itemX = player.x - (itemH/2) - (0*gameSettings.playerDisplayWidth);
		var itemY = player.y - (itemW/2) - (0.5*gameSettings.playerDisplayHeight);
	}

	if(quickPlayer.hands.tool!=NONE){
		var tool=Object.values(allToolsList)[quickPlayer.hands.tool];
		if (tool.name == "pan") {
			var itemImg = allToolsList[tool.name].image[playerDirection];
		 
		} else {
			var itemImg = allToolsList[tool.name].image.front;
		}
		context.drawImage(itemImg, itemX-gameSettings.toolSizeW/6,itemY-(gameSettings.toolSizeH/13)+dh,gameSettings.toolSizeW,gameSettings.toolSizeH);	
	}

	for(var k=0;k<quickPlayer.hands.items.length;k++){
		var item=getItemObjectById(quickPlayer.hands.items[k]);
		var itemImg = allItemsList[item.name].image.front;
		context.drawImage(itemImg, itemX,itemY-k*6+dh,itemW,itemH);
	}
	if(quickPlayer.hands.progressType!=""){
		drawProgressBar(quickPlayer.hands, itemX, itemY);
	}
}

function imagedata_to_image(imagedata) {
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');
    canvas.width = imagedata.width;
    canvas.height = imagedata.height;
    ctx.putImageData(imagedata, 0, 0);

    var image = new Image();
    image.src = canvas.toDataURL();
    return image;
}

//takes all currently existing image objects that belong to items and updates their position and (un)hides them
function drawItems(row){
	//to make
	var canvas = document.getElementById('canvas');
	var context = canvas.getContext('2d');
	var w= gameSettings.ingredientSizeW;
	var w2= w/2;
	var h= gameSettings.ingredientSizeH;
	var h2= h/2;

	var tw= gameSettings.toolSizeW;
	var tw2= tw/2;
	var th= gameSettings.toolSizeH;
	var th2= th/2;

	var dh = 0.333 * gameSettings.tileSizeH;
	
	for (var i=0; i< quickGameState.items.length;i++){
		if (getRowFromYCoordinate(quickGameState.items[i].y) == row) {
			var currentItemStack=quickGameState.items[i];
			context.beginPath();

			var x= currentItemStack.x;
			var y= currentItemStack.y-4;

			var gridX=Math.floor(x/gameSettings.tileSizeW);
			var gridY=Math.floor(y/gameSettings.tileSizeH);
			
			var tileId=this.gameState.map.grid[gridY][gridX];
			var tile=Object.values(allTilesList)[tileId];


			if(currentItemStack.progressType=="cook" &&tile.action=="cook"){
				drawCookingAnimation(x-w2,y-h2);
			}

			
			if(quickGameState.items[i].tool!=NONE){
				var currentItemId=quickGameState.items[i].tool;
				var currentItem=Object.values(allToolsList)[currentItemId];
				if (allToolsList[currentItem.name].image) {
					var img=allToolsList[currentItem.name].image.front;
					context.drawImage(img, x-tw2,y-th2+dh,tw,th);
				}
				//context.fillText(currentItem.name,x,y); 
			}
			
			
			for(var j=0;j<currentItemStack.items.length;j++){
				var currentItem=getItemObjectById(currentItemStack.items[j]);
				if (allItemsList[currentItem.name].image){
				var img=allItemsList[currentItem.name].image.front;
				context.drawImage(img, x-w2,y-h2-j*6+dh,w,h);
				}
				//context.fillText(currentItem.name,x,y); 
				
			}
	
			if(currentItemStack.progressType!=""){
				drawProgressBar(currentItemStack, x-w2, y-h2+dh);

				if(currentItemStack.progressType=="chop" &&tile.action=="chop"){
					drawChoppingAnimation(x-w2,y-h2);
				}

				if(currentItemStack.progressType=="clean" &&tile.action=="clean"){
					drawCleaningAnimation(x-w2,y-h2);
				}
			}
		}
			
	}
	
	context.fill();
	
}

function drawDispenserCharges(row){
	var canvas = document.getElementById('canvas');
	var context = canvas.getContext('2d');

	var tw= gameSettings.toolSizeW;
	var tw2 = tw/2;
	var th= gameSettings.toolSizeH;
	var th3= th/3;

	var dh = 0.333 * gameSettings.tileSizeH;
	
	if (allToolsList != undefined){
		for(var i=0;i<quickGameState.dispensers.length;i++){
			var currentDispenser=quickGameState.dispensers[i];
			var tile=Object.values(allTilesList)[currentDispenser.tile];
			if(tile.dispenserItem=="dirty_plate" && currentDispenser.y == row){
				var y= currentDispenser.y  *gameSettings.tileSizeH -th3;
				var x= currentDispenser.x * gameSettings.tileSizeW +((gameSettings.tileSizeW/2)-tw2);
				for(var j=0;j<currentDispenser.charges;j++){
					var img=allToolsList["dirty_plate"].image.front;
					context.drawImage(img, x,y-(j*6)+dh,tw,th);
				}
				
			}
			
		}
	}
}




function drawProgressBar(itemStack, x, y){
	var canvas = document.getElementById('canvas');
	var context = canvas.getContext('2d');
	context.fillStyle = "black";
	var borderSize = 2;
	var borderSize2 = borderSize*2;
	var barHeight = 5;

	var w = gameSettings.ingredientSizeW*1.4;
	var w2 = w/7;
	var h = gameSettings.ingredientSizeH/4;

	context.fillRect(x-w2-borderSize, y-h-borderSize, w+borderSize2, barHeight+borderSize2 );

	for (var j = 0; j < cuttingColors.length; j++) {
		if (cuttingColors[j].type == itemStack.progressType) {
			context.fillStyle = cuttingColors[j].color;
		}
	}	

	context.fillRect(x-w2, y-h, w*itemStack.progress, barHeight );
}


function drawCookingAnimation(x, y){

	var dh = 0.333 * gameSettings.tileSizeH;

	if (cookAnimsLoaded == cookAnimsToBeLoaded) {
		var canvas = document.getElementById('canvas');
		var context = canvas.getContext('2d');
		context.drawImage(cookAnimImages[cookAnimIndex], x-gameSettings.toolSizeW*0.15,y-gameSettings.toolSizeH*0.52+dh, gameSettings.toolSizeW*1.1, gameSettings.toolSizeH*1.88);
	}
}


function drawChoppingAnimation(x, y){
	var dh = 0.333 * gameSettings.tileSizeH;
	if (cookAnimsLoaded == cookAnimsToBeLoaded) {
		var canvas = document.getElementById('canvas');
		var context = canvas.getContext('2d');
		context.drawImage(chopAnimImages[chopAnimIndex], x-gameSettings.ingredientSizeW*0.3,y-gameSettings.ingredientSizeH*0.3+dh, gameSettings.ingredientSizeW*2, gameSettings.ingredientSizeH*1.5);
	}
}

function drawCleaningAnimation(x, y){
	var dh = 0.333 * gameSettings.tileSizeH;
	if (cleanAnimsLoaded == cleanAnimsToBeLoaded) {
		var canvas = document.getElementById('canvas');
		var context = canvas.getContext('2d');
		context.drawImage(cleanAnimImages[cleanAnimIndex], x-gameSettings.toolSizeW*0.25,y-gameSettings.toolSizeH*0.25+dh, gameSettings.toolSizeW*1.75, gameSettings.toolSizeH*1.5);
	}
}

function drawSubmitAnimation(x, y, amount) {
	var dh = 0.333 * gameSettings.tileSizeH;
	if (submitAnimsLoaded == submitAnimsToBeLoaded) {
		var canvas = document.getElementById('canvas');
		var context = canvas.getContext('2d');
		
		var dx = gameSettings.ingredientSizeW*0.5;
		var dy = gameSettings.ingredientSizeH*0.25;
		if (amount > 0) {

			var img = submitAnimImages[0];
			context.drawImage(img, x-dx,y-dy+dh, 4*dx, 7*dy);
			if (amount < 100){
				x = x + 10;
			}
			context.font = "33px Tahoma";
			context.fillStyle = "black";
			context.fillText(""+amount, x-dx, y+4*dy+dh, 4*dx, 7*dy);
			context.font = "30px Tahoma";
			context.fillStyle = "white";
			context.fillText(""+amount, x-dx+3, y+4*dy+dh, 4*dx, 7*dy);
		} else {
			var img = submitAnimImages[1];
			context.drawImage(img, x-dx,y-dy+dh, 4*dx, 7*dy);
		}
		
	}
}

function drawDarkness(){
	var canvas = document.getElementById('canvas');
	var context = canvas.getContext('2d');
	context.fillStyle = "black";
	context.fillRect(0, 0, canvas.width, canvas.height );
}

function drawFogOfWar(){
	var canvas = document.getElementById('overlayCanvas');
	var context = canvas.getContext('2d');
	canvas.width = gameState.map.grid[0].length*gameSettings.tileSizeW;
	canvas.height = gameState.map.grid.length*gameSettings.tileSizeH;
	context.clearRect(0, 0, canvas.width, canvas.height);
	context.fillStyle = "black";

	var myNumber = myRoomNumber();

	//im standing in a door
	if (myNumber == 0){
		var player = quickGameState.players[getUserId()];
		if (player != null){
			var myCoords = [getRowFromYCoordinate(player.y), getColumnFromXCoordinate(player.x)];
		} else {
			var myCoords = [-1,-1];
		}
		
		for(var y=0;y<gameState.map.grid.length;y++){
			for(var x=0;x<gameState.map.grid[y].length;x++){
				var gridCoords = [y,x];
				if (!adjacentToTile(myCoords, gridCoords)){
					context.fillRect(x*gameSettings.tileSizeW, y*gameSettings.tileSizeH, gameSettings.tileSizeW, gameSettings.tileSizeH );
				}
			}
		}
	} else {
		//im standing in a room
		for(var y=0;y<gameState.map.grid.length;y++){
			for(var x=0;x<gameState.map.grid[y].length;x++){
					if (myNumber != gameState.map.room[y][x] && !adjacentToRoom(myNumber, y, x)){
						if (y+1 == gameState.map.grid.length){
							context.fillRect(x*gameSettings.tileSizeW, y*gameSettings.tileSizeH-(gameSettings.tileSizeH/2), gameSettings.tileSizeW, gameSettings.tileSizeH*1.5 );
						} else {
							context.fillRect(x*gameSettings.tileSizeW, y*gameSettings.tileSizeH-(gameSettings.tileSizeH/2), gameSettings.tileSizeW, gameSettings.tileSizeH );
						}
						
						
					}
					
			}
		}
	}


}

function adjacentToTile(tile, other){

	return (Tools.calcDistance(tile[0],tile[1],other[0],other[1]) < 4);

}

function adjacentToRoom(roomnumber, y, x){

	var options = [
					[y-1,x],
					[y+1,x],
					[y-1,x-1],
					[y-1,x+1],
					[y+1,x-1],
					[y+1,x+1],
					[y,x+1],
					[y,x-1]
	];

	for (var i = 0; i<options.length;i++){
		if (validCoordinates(options[i][0],options[i][1]) &&
			gameState.map.room[options[i][0]][options[i][1]] == roomnumber
			) {
				return true;
			}
	}

	return false;
}

function validCoordinates(y,x){
	if (y >= 0 && y < gameState.map.room.length &&
		x >= 0 && x <  gameState.map.room[0].length
		) {
			return true;
		}

	return false;
}


function drawStartAnimation(){
	var canvas = document.getElementById('overlayCanvas');
	canvas.width = gameState.map.grid[0].length*gameSettings.tileSizeW;
	canvas.height = gameState.map.grid.length*gameSettings.tileSizeH;
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

	if (intermediateGameState.gameTimer >= 2 && intermediateGameState.gameTimer < 5) {
		var img = startImages[5-intermediateGameState.gameTimer];
		context.drawImage(img,(canvas.width-img.width)/2,(canvas.height-img.height)/2);
	}
}


function drawPostGame(){
	if (!postGameDrawn){
		activateChatTab();
		postGameDrawn = true;
		deleteGuiElement("postGameScreen");

		var wrapper = document.getElementById("canvasWrapper");
	
		var postgame=document.createElement("div");
		postgame.setAttribute("id","postGameScreen");
		postgame.classList.add("postGameScreen");
	
		wrapper.appendChild(postgame);
/*
		var myTeamNumber = getMyTeam();
		var winningTeamNumber = intermediateGameState.score.winner;
		var isWon=intermediateGameState.score.isWon;

		var victoryBar = document.createElement("div");
		victoryBar.classList.add("victoryBar");
		postgame.appendChild(victoryBar);

		if (winningTeamNumber == 1) {
			victoryBar.classList.add("themeRed");
			postgame.style.backgroundColor = "var(--themesubred)";
			var winnertext= "Team Red";
		}
		if (winningTeamNumber == 2) {
			victoryBar.classList.add("themeBlue");
			postgame.style.backgroundColor = "var(--themesubblue)";
			var winnertext= "Team Blue";
		}
		if (winningTeamNumber == 3) {
			postgame.style.backgroundColor = "var(--themesubyellow)";
			victoryBar.classList.add("themeYellow");
			var winnertext= "Team Yellow";
		}
		
		if(isWon){
			victoryBar.innerHTML = winnertext + " Victory!";
		}
		else{
			victoryBar.innerHTML = winnertext + " Lost!";
		}
*/
		var scoreContainer = document.createElement("div");
		scoreContainer.setAttribute("id","scoreContainer");
		scoreContainer.classList.add("scoreContainer");
	
		postgame.appendChild(scoreContainer);
/*
		if (gameSettings.gameMode == 1) {
			var heartSize = (100/gameSettings.gameModeValue);
			for (var j=1;j<gameSettings.teams;j++){
				var livesBar = document.createElement("div");
				livesBar.classList.add("livesBar");
				scoreContainer.appendChild(livesBar);
	
				if (j == 1) {
					livesBar.classList.add("themeRed");
				}
				if (j == 2) {
					livesBar.classList.add("themeBlue");
				}
				if (j == 3) {
					livesBar.classList.add("themeYellow");
				}
	
				if (j == myTeamNumber) {
					livesBar.classList.add("myTeamBorder");
				}
	
				livesBar.style.height = (20/gameSettings.gameModeValue)+"%";
	
				for (var i=0;i<gameSettings.gameModeValue;i++){
					var heartImg = document.createElement("img");
					if (i >= intermediateGameState.score[j].lives) {
						heartImg.src = "/static/"+GAME_NAME+"/images/effects/unlives.png";
					} else {
						heartImg.src = "/static/"+GAME_NAME+"/images/effects/lives.png";
					}
					heartImg.style.width = heartSize*0.33+"%";
					heartImg.style.height = "100%";
					heartImg.style.marginLeft = heartSize*0.33+"%";
					heartImg.style.marginRight = heartSize*0.33+"%";
					livesBar.appendChild(heartImg);
				}
			}
		} else {
			for (var j=1;j<gameSettings.teams;j++){
				var livesBar = document.createElement("div");
				livesBar.classList.add("livesBar");
				scoreContainer.appendChild(livesBar);
	
				if (j == 1) {
					livesBar.classList.add("themeRed");
				}
				if (j == 2) {
					livesBar.classList.add("themeBlue");
				}
				if (j == 3) {
					livesBar.classList.add("themeYellow");
				}
	
				if (j == myTeamNumber) {
					livesBar.classList.add("myTeamBorder");
				}
				livesBar.innerHTML = intermediateGameState.score[j].score;
			}
		}
		*/
	
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


function drawSideLog(){
	deleteGuiElement("sideLog");

	var right = document.getElementById("right");
	var sideLog = document.createElement("div");
	sideLog.classList.add("sideLog");
	sideLog.setAttribute("id","sideLog");
	sideLog.style.display = "block";
	right.appendChild(sideLog);
	
	
	var timerText=Tools.getTimeAsString(gameSettings.playTimer - intermediateGameState.gameTimer);
	var timerDiv = document.createElement("div");
	timerDiv.innerHTML=timerText;
	sideLog.appendChild(timerDiv);
	
}


var selectedPlayerToVote=0;
var alreadyVotedPlayer=false;
var alreadyVotedCauldron=false;
var voteForFlush=false;


function deleteVotingScreen(){
	votingScreenDrawn=false;
	selectedPlayerToVote=0;
	alreadyVotedPlayer=false;
	alreadyVotedCauldron=false;
	voteForFlush=false;
	deleteGuiElement("votingScreen");
	
}


function drawVotingScreen(){
	//console.log("DRAW VOTING SCREEN");
	if (!votingScreenDrawn){
		selectedPlayerToVote=0;
		activateChatTab();
		votingScreenDrawn = true;
		deleteGuiElement("votingScreen");

		var wrapper = document.getElementById("canvasWrapper");
	
		var votingScreen=document.createElement("div");
		votingScreen.setAttribute("id","votingScreen");
		votingScreen.classList.add("votingScreen");
	
	
		for (var i=0; i< gameState.players.length;i++){
			var currentPlayer=gameState.players[i];
			var playerBox=document.createElement("div");
			playerBox.setAttribute("id","playerBox_"+currentPlayer.userId);
			playerBox.classList.add("playerBox");
			playerBox.innerHTML=getUserNameById(currentPlayer.userId);
			playerBox.addEventListener('click', function(event) {
					selectedPlayerToVote=event.target.id.replace("playerBox_","");
					console.log("SELECTED PLAYER TO VOTE: "+selectedPlayerToVote);
				});				
			votingScreen.appendChild(playerBox);
		}
	
		
		var votePlayerButton=document.createElement("button");
		votePlayerButton.setAttribute("id","votePlayerButton");
		votePlayerButton.innerHTML = "Submit Player Vote";
		votePlayerButton.classList.add("votePlayerButton");
		votePlayerButton.classList.add("BigButton");
		votePlayerButton.addEventListener('click', function(event) {
				votePlayer();
			});	
							
		votePlayerButton.disabled=(!canVotePlayer());

		votingScreen.appendChild(votePlayerButton);	
		
		
		//voteForFlush?
		
		var voteForCauldronCheckbox=document.createElement("input");
		voteForCauldronCheckbox.type="checkbox";
		voteForCauldronCheckbox.setAttribute("id","voteForCauldronCheckbox");
		voteForCauldronCheckbox.innerHTML = "Flush Cauldron?";
		voteForCauldronCheckbox.checked = true;
		voteForCauldronCheckbox.classList.add("voteCauldronButton");
		voteForCauldronCheckbox.addEventListener('change', function(event) {
				console.log("check clicked" +this.checked);
				voteForFlush= this.checked;
			});	
		votingScreen.appendChild(voteForCauldronCheckbox);	
		
		var voteCauldronButton=document.createElement("button");
		voteCauldronButton.setAttribute("id","voteCauldronButton");
		voteCauldronButton.innerHTML = "Submit Cauldron Vote";
		voteCauldronButton.classList.add("voteCauldronButton");
		voteCauldronButton.classList.add("BigButton");
		voteCauldronButton.addEventListener('click', function(event) {
				voteCauldron();
			});	
			
		voteCauldronButton.disabled=(!canVoteCauldron());
		votingScreen.appendChild(voteCauldronButton);	
		
		
		wrapper.appendChild(votingScreen);
	}

}

function canVotePlayer(){
	var alreadyVoted=false;
		for(var i=0;i<playerVotes.length;i++){
				if(playerVotes[i].userId=getUserId()){
					alreadyVoted=true;
				}
		}
	console.log("already voted player?! "+alreadyVoted);
	return !alreadyVoted;	
}

function canVoteCauldron(){
	var alreadyVoted=false;
	for(var i=0;i<cauldronVotes.length;i++){
			if(cauldronVotes[i].userId=getUserId()){
				alreadyVoted=true;
			}
	}
	console.log("already voted cauldron?! "+alreadyVoted);
	return !alreadyVoted;	
}





function votePlayer(){
	if(selectedPlayerToVote>0 && !alreadyVotedPlayer){
		alreadyVotedPlayer=true;	
		socket.emit(this.gameType+"_votePlayer"+this.gameId, getUserId(), selectedPlayerToVote);
	}
}


function voteCauldron(){
	if(!alreadyVotedCauldron){
		alreadyVotedCauldron=true;	
		socket.emit(this.gameType+"_voteCauldron"+this.gameId, getUserId(), voteForFlush);
	}
}








function drawSubmitAnimations(){		
	for(var i=0; i < submitAnimations.length;i++){
		var x=submitAnimations[i].x*gameSettings.tileSizeW+20;
		var y=submitAnimations[i].y*gameSettings.tileSizeH-10;
		drawSubmitAnimation(x,y,submitAnimations[i].score);
		submitAnimations[i].timer++;
		if(submitAnimations[i].timer >100){
			submitAnimations.splice(i,1);
		}
	}
}


function myRoomNumber(){
	var player = quickGameState.players[getUserId()];
	if (player == null){
		return -1;
	}
	var x = getColumnFromXCoordinate(player.x);
	var y = getRowFromYCoordinate(player.y);
	return gameState.map.room[y][x];
}

