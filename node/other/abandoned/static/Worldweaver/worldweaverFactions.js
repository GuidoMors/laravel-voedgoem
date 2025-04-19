var characterlist = [];

buildaction = {
	name: "Build a Building",
	text: "As a build action you may build any building for its building cost.",
	time: {phase: "build", step: "building"},
	condition: [{type: "musttarget", building:["unbuilt"]}],
	limit: -1,
	costaction: 1,
	effects: [{type: "buildingplace", building:[]}],
	index: 9
};

var starBuilding = {
    name: "Sanctuary",
	type: "city",
    garrison: 2,
	icon: "star",
    foundation: ["plains", "snow", "desert", "mountain", "forest", "farmland", "riverland"],
	cost: {
		food: 2,
		lumber: 2,
		stone: 2,
		gold: 0,
		tradegoods: 0,
		gear: 0,
		mana: 0,
		relic: 0,
		honor: 0
	},
    limit: 1,
	citypoints: 1,
	produce: [{resource: "choice", amount: 2}],
    other: ["Produces 2 [choice]"]
};

var moonBuilding = {
    name: "Grand Observatory",
	type: "free",
    garrison: 4,
	icon: "moon",
    foundation: ["plains"],
	cost: {
		food: 2,
		lumber: 2,
		stone: 1,
		gold: 1,
		tradegoods: 0,
		gear: 0,
		mana: 0,
		relic: 0,
		honor: 0
	},
    limit: 1,
	produce: [ {resource: "universitychoice", amount: 2},{resource: "universitychoice", amount: "adjacentuniversity"}],
    other: ["Produces 2 [gear] or 2 [mana].","Produces an additional [gear] or [mana] per adjacent university."]
};

var factionInfo = [];
factionInfo[0] = "One day from a distant place an ethereal being landed on our planet, its origins unknown and its intentions unclear. At first the citizens of the world were hesitant or even outright aggressive. But regardless of how they tried, they could not harm it and it did not seem as if it could harm them. But what it could do is talk, and talk it did.";
factionInfo[1] = "Great knowledge it revealed to those that were patient enough to listen; about the stars, about the nature of life, and about the secrets of the earth. The truth of its words could not be doubted, as experiment after experiment proved its preachings to be true.";
factionInfo[2] = "People began to worship it as a God, which it seemed to enjoy. It ordered its believers around, to build cities, universities and sanctuaries of learning and contemplation. But its detractors saw a more sinister intent behind its actions. Why would a God need armies? Why would a God try to replace their kings and leaders? Only time will tell how benevolent the Ethereal really is.";

var factionAbilities = [];
var factionTopics = [];
factionTopics[0] = "Historians";
factionTopics[1] = "Terraformers";
factionTopics[2] = "Genemenders";

factionAbilities[factionAbilities.length] = {
	name: "Quick Learners",
	text: "Making a technology public costs 1 less [gear].",
	topic: factionTopics[0],
	boons: [{type:"Publicize Technology", field:"costgear",amount:-1}]
};

factionAbilities[factionAbilities.length] = {
	name: "Insightful Archeology",
	text: "Whenever you discover an anomaly, gain a [gear].",
	topic: factionTopics[0],
	boons: [{type:"Discover Anomaly", field:"activegear",amount:1}]
};

factionAbilities[factionAbilities.length] = {
	name: "Foresight of the Ether",
	text: "During the anomaly phase if it is not the first round, the Ethereal player is the one who places the anomaly.",
	topic: factionTopics[0],
};
//effect is hardcoded

factionAbilities[factionAbilities.length] = {
	name: "Hindsight",
	text: "At the start of the first gather phase the Ethereal may make a technology of another player public for free, if they do so that player gains 1 [gear].",
	topic: factionTopics[0],
	time: {phase: "gather", step: "gathering"},
	effects: [{type: "publicize", cost: "none"}],
	limit: 1,
	round: "first"
};

factionAbilities[factionAbilities.length] = {
	name: "Terraforming",
	text: "All their characters have the following ability:<br> <b>Terraform</b> - (2 [mana]) - <i>You may turn the tile this character is standing on into another type of your choice as a build action.</i>",
	topic: factionTopics[1],
	costmana: 2,
	costaction: 1,
	time: {phase: "build", step: "building"},
	condition: [{type: "musttarget", character:["friendly"]}],
	effects: [{type: "tileplace", tile: ["any"]}],
	limit: -1
};

factionAbilities[factionAbilities.length] = {
	name: "Meldform",
	text: "Buildings cost 1 less [lumber], [stone], [gold] or [food] to build if they are built on a tile of that type.",
	topic: factionTopics[1],
	boons: [{type: "costreduction", amount: "tiletype", buildings: ["all"], tiles: ["riverland", "mountain", "forest", "farmland"]}],
};

factionAbilities[factionAbilities.length] = {
	name: "Flow of the Land",
	text: "When placing the last special tile in step 3 of world building they may put 3 tiles of their choice down.",
	topic: factionTopics[1],
	boons: [{type:"Place Last Special Tile", field:"charges",amount:2}]
};

factionAbilities[factionAbilities.length] = {
	name: "Planetary Foreigner",
	text: "While choosing neutral characters, the Ethereal may choose neutral characters from among the characters of factions that those factions have not chosen as long as the Ethereal can employ them.",
	topic: factionTopics[2]
};
//hardcoded

factionAbilities[factionAbilities.length] = {
	name: "Faction Forger",
	text: "May during the gather phase force a player to exchange faction treaties if the Ethereal don’t have their faction treaty already.",
	topic: factionTopics[2],
	time: {phase: "gather", step: "gathering"},
	effects: [{type:"exchangetreaty", treaty:"factiontreaty"}],
	limit: 1
};

factionAbilities[factionAbilities.length] = JSON.parse(JSON.stringify(buildaction));
var factionbuildings = ["village", "gatherer", "market", "harbor", "university", "road", "wall", "fort", starBuilding.name, moonBuilding.name];
factionAbilities[factionAbilities.length-1].effects[0].building= factionbuildings;

factionAbilities[factionAbilities.length] = {
	name: "Starting Position",
	text: "Place your starting city.",
	condition: [{type:"ignoretilerestrictions"}, {type: "musttarget", tile:["plains","snow"], building:["unbuilt"]},{type: "hasnotadjacent", amount:2, building:["villageblocker"]}],
	time: {phase: "worldbuilding", step: "startingposition"},
	effects: [{type: "buildingplace", building: ["city"], cost:"none"}],
	limit: 1,
	mandatory: true
};

factionAbilities[factionAbilities.length] = {
	name: "Place a Sanctuary",
	text: "As part of your starting buildings you get a free sanctuary adjacent to your city.",
	condition: [{type:"haveused", affected:"Starting Position"}],
	time: {phase: "worldbuilding", step: "startingposition"},
	effects: [{type: "buildingplace", building: [starBuilding.name], cost: "none"}],
	limit: 1
};

var Ethereal = {
	name: "The Ethereal",
	color: "pink",
	offcolor: "whiteblue",
	characters: [],
	starthonor: 13,
	factionpicks: 0,
	neutralpicks: 5,
	startingtechnology: [],
	startingbuildings: ["city", starBuilding.icon],
	allowedbuildings: factionbuildings,
	startingresources: {
		choice: 1,
		food: 0,
		lumber: 0,
		stone: 0,
		gold: 0,
		tradegoods: 0,
		gear: 0,
		mana: 0,
		honor: 0,
		relic: 0
	},
	order: 0,
	star: starBuilding,
	moon: moonBuilding,
	info: factionInfo,
	abilities: factionAbilities,
	topics: factionTopics
}

var yamanano = {
	name: "Yamanano",
	subtitle: "Famous Carpenter",
	icon: "smith2",
	speed: 2,
	deploy: 1,
	strength: 1,
	maxstrength: 2,
	virtue: 9,
	cost: {
		food: 3,
		lumber: 0,
		stone: 0,
		gold: 0,
		tradegoods: 0,
		gear: 0,
		mana: 0
	}
};

var yuguan = {
	name: "Yuguan",
	subtitle: "Lord of the Magnificent Beard",
	icon: "general2",
	speed: 3,
	deploy: 6,
	strength: 6,
	maxstrength: 10,
	virtue: 12,
	cost: {
		food: 6,
		lumber: 0,
		stone: 0,
		gold: 0,
		tradegoods: 0,
		gear: 0,
		mana: 0
	}
};

var datake = {
	name: "Datake",
	icon: "builder1",
	subtitle: "The Great Fortifier",
	speed: 1,
	deploy: 2,
	strength: 2,
	maxstrength: 4,
	virtue: 13,
	cost: {
		food: 0,
		lumber: 0,
		stone: 3,
		gold: 0,
		tradegoods: 0,
		gear: 0,
		mana: 0
	}
};

var loong = {
	name: "Loong",
	subtitle: "Long-armed and Bare-knuckled",
	icon: "explorer2",
	speed: 3,
	deploy: 2,
	strength: 2,
	maxstrength: 5,
	virtue: 9,
	cost: {
		food: 2,
		lumber: 0,
		stone: 0,
		gold: 0,
		tradegoods: 0,
		gear: 0,
		mana: 0
	}
};

var bulu = {
	name: "Bulu",
	subtitle: "Flying General",
	icon: "general1",
	speed: 3,
	deploy: 6,
	strength: 6,
	maxstrength: 9,
	virtue: 10,
	cost: {
		food: 0,
		lumber: 0,
		stone: 0,
		gold: 5,
		tradegoods: 0,
		gear: 0,
		mana: 0
	}
};

var feizhang = {
	name: "Feizhang",
	subtitle: "Drunken Brawler",
	icon: "magician2",
	speed: 2,
	deploy: 4,
	strength: 4,
	maxstrength: 10,
	virtue: 11,
	cost: {
		food: 2,
		lumber: 2,
		stone: 0,
		gold: 0,
		tradegoods: 0,
		gear: 0,
		mana: 0
	}
};

var liangzhuge = {
	name: "Liangzhuge",
	subtitle: "Calculating Elemencer",
	icon: "tactician2",
	speed: 2,
	deploy: 2,
	strength: 2,
	maxstrength: 8,
	virtue: 12,
	cost: {
		food: 0,
		lumber: 0,
		stone: 0,
		gold: 2,
		tradegoods: 0,
		gear: 0,
		mana: 0
	}
};

var beiliu = {
	name: "Beiliu",
	subtitle: "Virtuous Uncle of the King",
	icon: "merchant1",
	speed: 2,
	deploy: 2,
	strength: 2,
	maxstrength: 7,
	virtue: 13,
	cost: {
		food: 0,
		lumber: 0,
		stone: 0,
		gold: 3,
		tradegoods: 0,
		gear: 0,
		mana: 0
	}
};
  
var starBuilding = {
    name: "Daimyo Castle",
	type: "free",
    garrison: 6,
	icon: "star",
    foundation: ["plains", "snow"],
	cost: {
		food: 2,
		lumber: 2,
		stone: 2,
		gold: 0,
		tradegoods: 0,
		gear: 0,
		mana: 0,
		relic: 0,
		honor: 0
	},
    limit: -1,
	recruitment: [{cost: "none", maxsteps:1, strength: 1, maxstrength: 6},{cost: "none", maxsteps:1, strength: "Rice Fields", maxstrength: 8},{cost: "food", maxsteps:-1, strength: 1, maxstrength: 10}],
    other: ["As a move action you may increase the strength of a character on top of the barracks by 1 (up to a maximum of 6).", "As a move action you may increase the strength of a character on top of the barracks by 1 per adjacent rice fields (up to a maximum of 8).","As a move action you may increase the strength of a character on top of the barracks equal to an amount of [food] paid (up to a maximum of 10)."]
};

var moonBuilding = {
    name: "Rice Field",
	type: "free",
    garrison: 0,
	icon: "moon",
    foundation: ["plains", "riverland"],
	cost: {
		food: 2,
		lumber: 0,
		stone: 0,
		gold: 0,
		tradegoods: 0,
		gear: 0,
		mana: 0,
		honor: 0
	},
    limit: -1,
	produce: [{resource: "food", amount: 1}],
    other: ["Produces 1 [food]"]
};

characterlist = [yamanano, yuguan, datake, loong, bulu, feizhang, liangzhuge, beiliu];

var factionInfo = [];
factionInfo[0] = "The Hanshu were the first peoples of the world. It was them that first evolved from hunters and beast into farmers and civilization. Their ancient traditions taught them that the creator of the world and all life is the sun, who shaped all living beings from clay. Just as the sun has given life to all animals, it also feeds the plants in the soil. The harvesting of plants is sacred, and the wasting of it is severely punished.";
factionInfo[1] = "As the first of the races to evolve, they claim the titles of kings of this world. The king of their kingdom comes from a long hereditary dynasty of kings upon kings, whose lineage according to the Hanshu can be traced back to the first beings shaped from the clay of the earth.";
factionInfo[2] = "The apelike people of the Hanshu rigorously follow their ancient traditions of martial prowess and worship of their heritage. They believe everyone has their place, for some this means to be a shoemaker and for others this means to be a king. And for the Hanshu, this means to rule all others.";

var factionAbilities = [];
var factionTopics = [];
factionTopics[0] = "Expansionist";
factionTopics[1] = "Influential";
factionTopics[2] = "Kingly";

factionAbilities[factionAbilities.length] = {
	name: "Living off the land",
	text: "You may build villages on farmland. Building a village on farmland costs no [food].",
	topic: factionTopics[0],
	time: {phase: "build", step: "building"},
	condition: [{type: "musttarget", tile:["farmland"]}, {type:"ignoretilerestrictions"}],
	effects: [{type: "buildingplace", building: ["village"], cost:"none"}],
	costlumber: 2,
	limit: -1,
	costaction: 1
};

factionAbilities[factionAbilities.length] = {
	name: "Infrastructure",
	text: "Start with Infrastructure technology.",
	topic: factionTopics[0],
	time: {phase: "worldbuilding", step: "neutralcharacters"},
	passivetechnology: ["Infrastructure"]
};

factionAbilities[factionAbilities.length] = {
	name: "Terrace Earthworks",
	text: "During world building, the Hanshu may place double the amount of farmlands in step 2.",
	topic: factionTopics[0],
	boons: [{type: "Place a Farmland", field: "charges", amount: "specialplace"}],
};

factionAbilities[factionAbilities.length] = {
	name: "Food for Thought",
	text: "May repeatedly convert 3 [food] into a [choice] in the gather phase.",
	topic: factionTopics[0],
	time: {phase: "gather", step: "gathering"},
	costfood: 3,
	effects: [{type: "gain", resource:["lumber","stone","gold"], amount: 1}],
	limit: -1,
};

factionAbilities[factionAbilities.length] = {
	name: "Will of the People",
	text: "Cities generate 1 influence during the gather phase.",
	topic: factionTopics[1],
	time: {phase: "gather", step: "startgather"},
	passiveinfluence: "city"
};

factionAbilities[factionAbilities.length] = {
	name: "Tactics of the People",
	text: "You can spend 3 [influence] in the discovery phase on to draw a tactic card.",
	topic: factionTopics[1],
	time: {phase: "discovery", step: "discovering"},
	limit: -1,
	costinfluence: 3,
	effects: [{type: "drawtacticscard"}]
};

factionAbilities[factionAbilities.length] = {
	name: "Will of the People",
	text: "You can spend 4 [influence] in the discovery phase on to deploy a character in court for free at 1 strength.",
	topic: factionTopics[1],
	time: {phase: "discovery", step: "discovering"},
	limit: -1,
	costinfluence: 4,
	effects: [{type: "deploy", strength: 1}]
};

factionAbilities[factionAbilities.length] = {
	name: "Sight of the People",
	text: "You can spend 5 [influence] to instantly gain an undiscovered relic.",
	topic: factionTopics[1],
	condition: [{type: "musttarget", building:["relic"]}],
	time: {phase: "discovery", step: "discovering"},
	limit: -1,
	costinfluence: 5,
	effects: [{type: "discoveranomaly"}],
};


factionAbilities[factionAbilities.length] = {
	name: "Tactics of the People",
	text: "You can spend 6 [influence] to make a technology public.",
	topic: factionTopics[1],
	time: {phase: "discovery", step: "discovering"},
	limit: -1,
	costinfluence: 6,
	effects: [{type: "publicize"}],
};

factionAbilities[factionAbilities.length] = {
	name: "Overpopulation",
	text: "Cities are worth an additional city point.",
	topic: factionTopics[2],
	boons: [{type:"buildingaddvalue", building: "city", field:"citypoints", amount: 1 }]
};

factionAbilities[factionAbilities.length] = {
	name: "Royal Right",
	text: "Whenever another player builds a city, they must pay the hanshu 1 gold or lose 1 honor.",
	topic: factionTopics[2]
};
//hardcoded

factionAbilities[factionAbilities.length] = {
	name: "Royal Right",
	text: "If no one else is emperor the Hanchu can veto laws and count as the emperor when it comes to the rules of laws.",
	topic: factionTopics[2]
};
//hardcoded

factionAbilities[factionAbilities.length] = JSON.parse(JSON.stringify(buildaction));
var factionbuildings = ["village", "gatherer", "market", "barracks", "harbor", "university", "road", "wall", "fort", starBuilding.name, moonBuilding.name];
factionAbilities[factionAbilities.length-1].effects[0].building = factionbuildings;

factionAbilities[factionAbilities.length] = {
	name: "Starting Position",
	text: "Place your starting village.",
	condition: [{type:"ignoretilerestrictions"}, {type: "musttarget", tile:["plains","snow","farmland"], building:["unbuilt"]},{type: "hasnotadjacent", amount:2, building:["villageblocker"]}],
	time: {phase: "worldbuilding", step: "startingposition"},
	effects: [{type: "buildingplace", building: ["village"], cost:"none"}],
	limit: 1,
	mandatory: true
};

factionAbilities[factionAbilities.length] = {
	name: "Second Village",
	text: "Place your second starting village.",
	condition: [{type:"haveused", affected:"Starting Position"},{type:"ignoretilerestrictions"}, {type: "musttarget", tile:["plains","snow","farmland"], building:["unbuilt"]},{type: "hasnotadjacent", amount:2, building:["villageblocker"]},{type: "hasadjacent", amount:3, building:["villageblocker"]}],
	time: {phase: "worldbuilding", step: "startingposition"},
	effects: [{type: "buildingplace", building: ["village"], cost:"none"}],
	limit: 1,
};

factionAbilities[factionAbilities.length] = {
	name: "Place a Gatherer",
	text: "As part of your starting buildings you get a free gatherer adjacent to one of your villages.",
	condition: [{type:"haveused", affected:"Second Village"}],
	time: {phase: "worldbuilding", step: "startingposition"},
	effects: [{type: "buildingplace", building: ["gatherer"], cost: "none"}],
	limit: 1
};

var Hanshu = {
	name: "Kingdom of Hanshu",
	color: "brown",
	offcolor: "grey",
	characters: characterlist,
	starthonor: 15,
	factionpicks: 3,
	neutralpicks: 2,
	startingtechnology: ["Infrastructure"],
	startingbuildings: ["village", "village", "gatherer"],
	allowedbuildings: factionbuildings,
	startingresources: {
		choice: 2,
		food: 0,
		lumber: 0,
		stone: 0,
		gold: 0,
		tradegoods: 0,
		gear: 0,
		mana: 0,
		relic: 0,
		honor: 0
	},
	order: 0,
	star: starBuilding,
	moon: moonBuilding,
	info: factionInfo,
	abilities: factionAbilities,
	topics: factionTopics
}

var fjarjarl = {
	name: "Fjarjarl",
	subtitle: "Longship Captain",
	icon: "explorer3",
	speed: 2,
	deploy: 6,
	strength: 6,
	maxstrength: 12,
	virtue: 9,
	cost: {
		food: 0,
		lumber: 3,
		stone: 0,
		gold: 0,
		tradegoods: 0,
		gear: 0,
		mana: 0
	}
};

var herne = {
	name: "Herne",
	subtitle: "Keen Eyed Huntress",
	icon: "scout2",
	speed: 3,
	deploy: 4,
	strength: 4,
	maxstrength: 5,
	virtue: 10,
	cost: {
		food: 2,
		lumber: 0,
		stone: 0,
		gold: 0,
		tradegoods: 0,
		gear: 0,
		mana: 0
	}
};

var trotskyr = {
	name: "Trotskyr",
	subtitle: "Upholder of the Motherland",
	icon: "tactician1",
	speed: 2,
	deploy: 7,
	strength: 7,
	maxstrength: 12,
	virtue: 9,
	cost: {
		food: 0,
		lumber: 0,
		stone: 3,
		gold: 0,
		tradegoods: 0,
		gear: 0,
		mana: 0
	}
};

var skadr = {
	name: "Skadr",
	subtitle: "Warden of the House",
	icon: "builder3",
	speed: 2,
	deploy: 2,
	strength: 2,
	maxstrength: 5,
	virtue: 8,
	cost: {
		food: 1,
		lumber: 1,
		stone: 0,
		gold: 0,
		tradegoods: 0,
		gear: 0,
		mana: 0
	}
};

var odun = {
	name: "Odun",
	subtitle: "Keeper of the Herd",
	icon: "recruiter3",
	speed: 3,
	deploy: 2,
	strength: 2,
	maxstrength: 4,
	virtue: 9,
	cost: {
		food: 2,
		lumber: 0,
		stone: 0,
		gold: 0,
		tradegoods: 0,
		gear: 0,
		mana: 0
	}
};

var njarny = {
	name: "Njarny",
	subtitle: "Vault Stockpiler",
	icon: "explorer3",
	speed: 4,
	deploy: 3,
	strength: 3,
	maxstrength: 6,
	virtue: 9,
	cost: {
		food: 0,
		lumber: 0,
		stone: 1,
		gold: 1,
		tradegoods: 0,
		gear: 0,
		mana: 0
	}
};

var saga = {
	name: "Saga",
	subtitle: "Global Globetrotter",
	icon: "scout1",
	speed: 4,
	deploy: 2,
	strength: 2,
	maxstrength: 3,
	virtue: 9,
	cost: {
		food: 4,
		lumber: 0,
		stone: 0,
		gold: 0,
		tradegoods: 0,
		gear: 0,
		mana: 0
	}
};

var urvjal = {
	name: "Urvjal",
	subtitle: "Nifty Survivalist",
	icon: "merchant3",
	speed: 4,
	deploy: 5,
	strength: 5,
	maxstrength: 7,
	virtue: 8,
	cost: {
		food: 1,
		lumber: 0,
		stone: 0,
		gold: 2,
		tradegoods: 0,
		gear: 0,
		mana: 0
	}
};

var volundir = {
	name: "Volundir",
	subtitle: "Leader of the Fjords",
	icon: "general3",
	speed: 3,
	deploy: 4,
	strength: 4,
	maxstrength: 18,
	virtue: 7,
	cost: {
		food: 4,
		lumber: 0,
		stone: 0,
		gold: 0,
		tradegoods: 0,
		gear: 0,
		mana: 0
	}
};

var magnir = {
	name: "Magnir",
	subtitle: "Speaker of the Masses",
	icon: "magician1",
	speed: 2,
	deploy: 3,
	strength: 3,
	maxstrength: 9,
	virtue: 9,
	cost: {
		food: 2,
		lumber: 0,
		stone: 0,
		gold: 2,
		tradegoods: 0,
		gear: 0,
		mana: 0
	}
};

var eyir = {
	name: "Eyir",
	subtitle: "Ancient Crone",
	icon: "magician3",
	speed: 2,
	deploy: 6,
	strength: 6,
	maxstrength: 12,
	virtue: 9,
	cost: {
		food: 2,
		lumber: 1,
		stone: 0,
		gold: 0,
		tradegoods: 0,
		gear: 0,
		mana: 0
	}
};

var starBuilding = {
    name: "Vault",
	type: "float",
    garrison: 4,
	icon: "star",
    foundation: ["snow"],
	cost: {
		food: 0,
		lumber: 0,
		stone: 1,
		gold: 1,
		tradegoods: 0,
		gear: 0,
		mana: 0,
		relic: 0,
		honor: 0
	},
    limit: 0,
    other: ["May be built up to 3 tiles away from a village/city you own.", "Characters within 3 tiles of this building are guaranteed to freeze.","Characters can be deployed on this building and return [relic] to this building.", "A character adjacent to a Vault can move during the move phase without it costing an action."]
};

var moonBuilding = {
    name: "Hunting Camp",
	type: "float",
	adjacent: 2,
    garrison: 2,
	icon: "moon",
    foundation: ["snow", "forest", "farmland", "riverland"],
	cost: {
		food: 1,
		lumber: 1,
		stone: 0,
		gold: 0,
		tradegoods: 0,
		gear: 0,
		mana: 0,
		relic: 0,
		honor: 0
	},
    limit: 0,
	produce: [{resource: "food", amount: 1}],
    other: ["May be built within 3 tiles of a village/city you own.","Produces 1 [food]"]
};

characterlist = [fjarjarl, herne, trotskyr, skadr, odun, njarny, saga, urvjal, volundir, magnir, eyir];

var factionInfo = [];
factionInfo[0] = "While the Monkeys and Lions tower and bicker over vast lands and empires, they missed the small secrets right below them. But those that they trampled on, the critters that hid from their violence, did not have such poor wisdom. Below the earth are buried ancient treasures of learning and wealth. Having no taste or skill for war, the critters gained a taste and skill for adventure.";
factionInfo[1] = "The most adventurous of these critters were the foxes of the poles, who with their camps wandered the world, away from the war in search of these relics of times past. Having lived in these harsh frozen lands as long as they can remember, they have learned to squeeze every last drop out of every last resource.";

var factionAbilities = [];
var factionTopics = [];
factionTopics[0] = "Arctic";
factionTopics[1] = "Nifty";
factionTopics[2] = "Relic Seekers";

factionAbilities[factionAbilities.length] = {
	name: "Edge of the World",
	text: "The top and the bottom of the map count as adjacent for you.",
	topic: factionTopics[0],
};
//hardcode

factionAbilities[factionAbilities.length] = {
	name: "Wintertide",
	text: "If the Wanderers are picked the bottom and top 3 lanes of plains are turned into snow instead.",
	topic: factionTopics[0]
};
//hardcode

factionAbilities[factionAbilities.length] = {
	name: "Snowcastles",
	text: "May upgrade villages into cities on snow tiles.",
	topic: factionTopics[0],
	time: {phase: "build", step: "building"},
	condition: [{type:"musttarget", building:["village"], tile:["snow"]},{type:"mustown", building:"village"}],
	limit: -1,
	costaction: 1,
	effects: [{type: "buildingplace", building: ["city"]}]
};

factionAbilities[factionAbilities.length] = {
	name: "Frostborn",
	text: "Your units don't freeze in snow.",
	topic: factionTopics[0],
};
//hardcode

factionAbilities[factionAbilities.length] = {
	name: "Ice Age",
	text: "In the World Building Phase they can flip oceans adjacent to snow into snow. They can do this equal to 2 times the amount of basic tiles they put down.",
	topic: factionTopics[0],
	time: {phase: "worldbuilding", step: "misctiles"},
	condition: [{type: "musttarget", tile:["ocean"]},{type: "hasadjacent", tile:["snow"]}],
	effects: [{type: "tileplace", tile: ["snow"]}],
	limit: "2basicplace",
	mandatory: true
};

factionAbilities[factionAbilities.length] = {
	name: "Nomadic",
	text: "Every non-free-building they own may move to another tile as a move action. Moving this way may not break the rules of placement. They may use multiple move actions to move multiple buildings at the same time. A character on top of the building may move along with the building.",
	topic: factionTopics[1],
	time: {phase: "move", step: "moving"},
	condition: [{type: "musttarget", building:["any"]}],
	effects: [{type: "buildingmove"}],
	limit: -1,
};

factionAbilities[factionAbilities.length] = {
	name: "Refitting",
	text: "The cost of building a new building on top of an old building is reduced by the cost of the old building.",
	topic: factionTopics[1],
	boons: [{type: "costreduction", amount: "previousbuilding", buildings: ["all"], tiles: ["all"]}],
};

factionAbilities[factionAbilities.length] = {
	name: "Immigration",
	text: "You may downgrade a city into a village as a build action, as long as there are no city buildings adjacent to the city. When you do you gain 1 [stone] and 1 [gold].",
	topic: factionTopics[1],
	time: {phase: "build", step: "building"},
	costaction: 1,
	condition: [{type:"musttarget", building:["city"]},{type:"mustown", building:["city"]},{type: "hasnotadjacent", building:["harbor","university"]}],
	limit: -1,
	activegold: 1,
	activestone: 1,
	effects: [{type: "buildingplace", building: ["village"], cost: "none"}]
};


factionAbilities[factionAbilities.length] = {
	name: "Slinky Thieves",
	text: "Can steal a relic from a city/village owned by another player with an adjacent character as a discovery action and by losing 1 honor.",
	topic: factionTopics[2],
	time: {phase: "discovery", step: "discovering"},
	costaction: 1,
	condition: [{type:"musttarget", building:["city", "village"]},{type: "hasadjacent", character:["friendly"]}],
	limit: -1,
	effects: [{type: "takerelic"}]
};

factionAbilities[factionAbilities.length] = {
	name: "Logistics",
	text: "Start with Logistics technology.",
	topic: factionTopics[2],
	time: {phase: "worldbuilding", step: "neutralcharacters"},
	passivetechnology: ["Logistics"]
};

factionAbilities[factionAbilities.length] = {
	name: "Unearthing",
	text: "In the first round of the game the Wanderers put down 2 additional relics in the anomaly phase.",
	topic: factionTopics[2],
	time: {phase: "anomaly", step: "placeanomaly"},
	condition: [{type: "anomalyplace"}],
	effects: [{type: "placeanomaly"}],
	anomaly: {side: "choice", kind: "relic", distance: 3},
	limit: 2,
	mandatory: true,
	round: "first"
};

factionAbilities[factionAbilities.length] = {
	name: "Artificers",
	text: "When putting down an anomaly, you may choose to have it be a relic.",
	topic: factionTopics[2],
	limit: 1,
	time: {phase: "anomaly", step: "placeanomaly"},
	effects: [{type: "anomalyswap", anomaly:"relic"}]
};

factionAbilities[factionAbilities.length] = {
	name: "Artificers",
	text: "For owning 1 relic you produce 1 [tradegoods].",
	topic: factionTopics[2],
	condition: [{type: "mustown", relics:1}],
	time: {phase: "gather", step: "gathering"},
	passivetradegoods: 1
};

factionAbilities[factionAbilities.length] = {
	name: "This Belongs in a Museum",
	text: "If you own 3 relics you may trade your honor to other people.",
	topic: factionTopics[2],
};
//hardcode

factionAbilities[factionAbilities.length] = JSON.parse(JSON.stringify(buildaction));
var factionbuildings = ["village", "gatherer", "market", "barracks", "harbor", "university", "road", "wall", "fort", starBuilding.name, moonBuilding.name];
factionAbilities[factionAbilities.length-1].effects[0].building= factionbuildings;

factionAbilities[factionAbilities.length] = {
	name: "Starting Position",
	text: "Place your starting village.",
	condition: [{type:"ignoretilerestrictions"}, {type: "musttarget", tile:["snow"], building:["unbuilt"]},{type: "hasnotadjacent", amount:2, building:["villageblocker"]}],
	time: {phase: "worldbuilding", step: "startingposition"},
	effects: [{type: "buildingplace", building: ["village"], cost:"none"}],
	limit: 1,
	mandatory: true
};

factionAbilities[factionAbilities.length] = {
	name: "Place a Hunting Camp",
	text: "As part of your starting buildings you get a free hunting camp within 2 tiles of your village.",
	condition: [{type:"haveused", affected:"Starting Position"}],
	time: {phase: "worldbuilding", step: "startingposition"},
	effects: [{type: "buildingplace", building: [moonBuilding.name], cost: "none"}],
	limit: 1
};

factionAbilities[factionAbilities.length] = {
	name: "Place a Gatherer",
	text: "As part of your starting buildings you get a free gatherer adjacent to one of your villages.",
	condition: [{type:"haveused", affected:"Place a Hunting Camp"}],
	time: {phase: "worldbuilding", step: "startingposition"},
	effects: [{type: "buildingplace", building: ["gatherer"], cost: "none"}],
	limit: 1
};


var Wanderers = {
	name: "Wanderers",
	color: "whiteblue",
	offcolor: "black",
	characters: characterlist,
	starthonor: 15,
	factionpicks: 3,
	neutralpicks: 1,
	startingtechnology: ["Logistics"],
	startingbuildings: ["village", "gatherer", moonBuilding.icon],
	allowedbuildings: factionbuildings,
	startingresources: {
		choice: 1,
		food: 0,
		lumber: 0,
		stone: 0,
		gold: 0,
		tradegoods: 0,
		gear: 0,
		mana: 0,
		honor: 0,
		relic: 0
	},
	order: 0,
	star: starBuilding,
	moon: moonBuilding,
	info: factionInfo,
	abilities: factionAbilities,
	topics: factionTopics
}

var lumon = {
	name: "Lumon",
	subtitle: "The White Prophet",
	icon: "lumon",
	speed: 2,
	deploy: 4,
	strength: 4,
	maxstrength: 12,
	virtue: 1,
	cost: {
		food: 0,
		lumber: 0,
		stone: 0,
		gold: 5,
		tradegoods: 0,
		gear: 0,
		mana: 0
	}
};

var prishna = {
	name: "Prishna",
	subtitle: "Gifted Elementalist",
	icon: "smith3",
	speed: 1,
	deploy: 3,
	strength: 6,
	maxstrength: 14,
	virtue: 14,
	cost: {
		food: 0,
		lumber: 0,
		stone: 0,
		gold: 3,
		tradegoods: 0,
		gear: 0,
		mana: 0
	}
};

var anant = {
	name: "Anant",
	subtitle: "The Benevolent Warlord",
	icon: "smith1",
	speed: 2,
	deploy: 9,
	strength: 9,
	maxstrength: 16,
	virtue: 11,
	cost: {
		food: 0,
		lumber: 0,
		stone: 0,
		gold: 7,
		tradegoods: 0,
		gear: 0,
		mana: 0
	}
};

var shrishti = {
	name: "Shrishti",
	subtitle: "Water Oracle",
	icon: "scout3",
	speed: 3,
	deploy: 2,
	strength: 2,
	maxstrength: 5,
	virtue: 12,
	cost: {
		food: 2,
		lumber: 0,
		stone: 0,
		gold: 0,
		tradegoods: 0,
		gear: 0,
		mana: 0
	}
};

var taahira = {
	name: "Taahira",
	subtitle: "Huntress of the Pride",
	icon: "explorer2",
	speed: 3,
	deploy: 7,
	strength: 7,
	maxstrength: 12,
	virtue: 12,
	cost: {
		food: 3,
		lumber: 0,
		stone: 0,
		gold: 2,
		tradegoods: 0,
		gear: 0,
		mana: 0
	}
};

var manan = {
	name: "Manan",
	subtitle: "Defender of the Faith",
	icon: "magician1",
	speed: 2,
	deploy: 5,
	strength: 5,
	maxstrength: 10,
	virtue: 14,
	cost: {
		food: 0,
		lumber: 2,
		stone: 2,
		gold: 0,
		tradegoods: 0,
		gear: 0,
		mana: 0
	}
};

var goldenmane = {
	name: "Goldenmane",
	subtitle: "Lumon's Right Hand",
	icon: "tactician3",
	speed: 2,
	deploy: 7,
	strength: 7,
	maxstrength: 12,
	virtue: 8,
	cost: {
		food: 4,
		lumber: 0,
		stone: 0,
		gold: 0,
		tradegoods: 0,
		gear: 0,
		mana: 0
	}
};

var wololay = {
	name: "Wololay",
	subtitle: "Apprentice of the Faith",
	icon: "recruiter1",
	speed: 2,
	deploy: 7,
	strength: 7,
	maxstrength: 12,
	virtue: 8,
	cost: {
		food: 4,
		lumber: 0,
		stone: 0,
		gold: 0,
		tradegoods: 0,
		gear: 0,
		mana: 0
	}
};

var starBuilding = {
    name: "Divine Sanctum",
	type: "free",
    garrison: 4,
	icon: "star",
    foundation: ["mountain"],
	cost: {
		food: 0,
		lumber: 0,
		stone: 0,
		gold: 8,
		tradegoods: 0,
		gear: 0,
		mana: 0,
		relic: 1,
		honor: 0
	},
    limit: 1,
	produce: [{resource: "mana", amount: 2}],
    other: ["Produces 2 mana","If Lumon is in this building he may cast his Divine Spells."]
};

var moonBuilding = {
    name: "Grand Bazaar",
	type: "city",
    garrison: 2,
	icon: "moon",
    foundation: ["farmland"],
	cost: {
		food: 1,
		lumber: 1,
		stone: 0,
		gold: 3,
		tradegoods: 0,
		gear: 0,
		mana: 0,
		relic: 0,
		honor: 0
	},
    limit: 1,
	produce: [{type: "gain", income: [{resource: "gold", amount: 1},{resource: "convertgoods", amount: 1},{resource: "convertdice", amount: 1}] } ],
    other: ["Produces 1 [gold]","You may convert 1 [tradegoods] into 1 [choice] every gather phase.", "You may convert 1 [gold] into the resource of the gather die every gather phase."]
};

characterlist = [lumon, prishna, anant, shrishti, taahira, manan, goldenmane, wololay];

var factionInfo = [];
factionInfo[0] = "The Lion-peoples of the greater plains were once a vicious people, whose men fought each other for a place within their heartless hierarchy, and whose women were delegated to work. But as the disparate groups of the Lion-peoples were tamed by the Hanshu, a shift in outlook changed their society to the very core. Although at first loyal subjects of the crown, a fire burned in the hearts of the Lion-peoples that could not be quenched. A revolutionary movement of equality and peace called the White Wave overthrew their cruel leaders. At the core of this movement was Lumon; the White Prophet.";
factionInfo[1] = "Their unshaken faith in their prophet has led them to pacifism and diplomacy, and away from conquering and dictatorship. They see themselves and their beliefs as morally superior, and as such their ways must be spread to the other more ignorant and barbaric factions of the world.";

var factionAbilities = [];
var factionTopics = [];
factionTopics[0] = "Plainstriders";
factionTopics[1] = "Lumon the Prophet";
factionTopics[2] = "Pious Diplomats";

factionAbilities[factionAbilities.length] = {
	name: "Plainswalking",
	text: "Moving from a plains to another plains only costs half a speed.",
	topic: factionTopics[0],
	time: {phase: "move", step: "moving"},
};
//hardcode

factionAbilities[factionAbilities.length] = {
	name: "Great Valley",
	text: "May put down double the amount of plains in step 3 of the world building phase.",
	topic: factionTopics[0],
	boons: [{type: "Place a Basic Tile", field: "charges", amount: "basicplace"}],
};

factionAbilities[factionAbilities.length] = {
	name: "Plainspeople",
	text: "Your gatherers produce 1 [gold], but you may only build them on plains.",
	topic: factionTopics[0],
	time: {phase: "build", step: "building"},
	condition: [{type:"ignoretilerestrictions"},{type:"musttarget", tile:["plains"]}],
	limit: -1,
	costaction: 1,
	effects: {type: "buildingplace", building: ["gatherer"]}
};

factionAbilities[factionAbilities.length] = {
	name: "Communes",
	text: "Start with the Communes Technology.",
	topic: factionTopics[0],
	time: {phase: "worldbuilding", step: "neutralcharacters"},
	passivetechnology: ["Communes"]

};

factionAbilities[factionAbilities.length] = {
	name: "The White Wave",
	text: "Lumon has to be chosen as one of the faction characters. He cannot be employed by other factions.",
	topic: factionTopics[1]
};
//hardcode

factionAbilities[factionAbilities.length] = {
	name: "Sanctimonious Prayers",
	text: "Lumon can trade honor with other players as a bartering good.",
	topic: factionTopics[1]
};
//hardcode

factionAbilities[factionAbilities.length] = {
	name: "Fall of a Faith",
	text: "If Lumon were to die, his people lose faith in the cause and his Pride loses the game.",
	topic: factionTopics[1]
};
//hardcode

factionAbilities[factionAbilities.length] = {
	name: "Conversion",
	text: "Can give the treaty: Conversion.<br> Every time you gain a treaty from the Pride of Lumon you gain 1 honor (including this one). Every time you lose a treaty from the Pride of Lumon you lose 1 honor. Conversion can be broken through attacking the Pride of Lumon, resulting in losing 2 honor.",
	topic: factionTopics[2]
};
//hardcode

factionAbilities[factionAbilities.length] = {
	name: "Example of the Faith",
	text: "If at the gather phase every other player has a treaty from the Pride of Lumon, the Pride gains 1 honor.",
	topic: factionTopics[2]
};
//hardcode

factionAbilities[factionAbilities.length] = JSON.parse(JSON.stringify(buildaction));
var factionbuildings = ["village", "market", "barracks", "harbor", "university", "road", "wall", "fort", starBuilding.name, moonBuilding.name];
factionAbilities[factionAbilities.length-1].effects[0].building= factionbuildings;

factionAbilities[factionAbilities.length] = {
	name: "Starting Position",
	text: "Place your starting village.",
	condition: [{type:"ignoretilerestrictions"}, {type: "musttarget", tile:["plains","snow"], building:["unbuilt"]},{type: "hasnotadjacent", amount:2, building:["villageblocker"]}],
	time: {phase: "worldbuilding", step: "startingposition"},
	effects: [{type: "buildingplace", building: ["village"], cost:"none"}],
	limit: 1,
	mandatory: true
};

factionAbilities[factionAbilities.length] = {
	name: "Place a Gatherer",
	text: "As part of your starting buildings you get a free gatherer adjacent to your village.",
	condition: [{type:"haveused", affected:"Starting Position"},{type:"ignoretilerestrictions"}, {type: "musttarget", tile:["plains"], building:["unbuilt"]},{type: "hasadjacent", amount:1, building:["village"]}],
	time: {phase: "worldbuilding", step: "startingposition"},
	effects: [{type: "buildingplace", building: ["gatherer"], cost: "none"}],
	limit: 1
};

factionAbilities[factionAbilities.length] = {
	name: "Place a Market",
	text: "As part of your starting buildings you get a free market adjacent to your village.",
	condition: [{type:"haveused", affected:"Place a Gatherer"},],
	time: {phase: "worldbuilding", step: "startingposition"},
	effects: [{type: "buildingplace", building: ["market"], cost: "none"}],
	limit: 1
};

var Pride = {
	name: "Pride of Lumon",
	color: "yellow",
	offcolor: "black",
	characters: characterlist,
	starthonor: 17,
	factionpicks: 4,
	neutralpicks: 1,
	startingtechnology: ["Communes"],
	startingbuildings: ["village", "gatherer", "market"],
	allowedbuildings: factionbuildings,
	startingresources: {
		choice: 0,
		food: 0,
		lumber: 0,
		stone: 0,
		gold: 0,
		tradegoods: 0,
		gear: 0,
		mana: 0,
		honor: 0,
		relic: 0
	},
	order: 0,
	star: starBuilding,
	moon: moonBuilding,
	info: factionInfo,
	abilities: factionAbilities,
	topics: factionTopics
}

var hornedhoof = {
	name: "Horned Hoof",
	subtitle: "Satyr with Barbed Hoofs",
	icon: "explorer2",
	speed: 3,
	deploy: 2,
	strength: 2,
	maxstrength: 5,
	virtue: 13,
	cost: {
		food: 2,
		lumber: 0,
		stone: 0,
		gold: 0,
		tradegoods: 0,
		gear: 0,
		mana: 0
	}
};

var skittish = {
	name: "Skittish",
	subtitle: "Easily Scared Ratling",
	icon: "scout1",
	speed: 4,
	deploy: 2,
	strength: 2,
	maxstrength: 5,
	virtue: 12,
	cost: {
		food: 2,
		lumber: 0,
		stone: 0,
		gold: 0,
		tradegoods: 0,
		gear: 0,
		mana: 0
	}
};

var blooknokkie = {
	name: "Blook 'n Okkie",
	subtitle: "Two Headed Ogre Shaman",
	icon: "magician2",
	speed: 2,
	deploy: 5,
	strength: 5,
	maxstrength: 10,
	virtue: 11,
	cost: {
		food: 5,
		lumber: 0,
		stone: 0,
		gold: 0,
		tradegoods: 0,
		gear: 0,
		mana: 0
	}
};

var bullofakantash = {
	name: "Bull of Akantash",
	subtitle: "Giant Minotaur Three Stories Tall",
	icon: "general2",
	speed: 2,
	deploy: 7,
	strength: 7,
	maxstrength: 12,
	virtue: 8,
	cost: {
		food: 7,
		lumber: 0,
		stone: 0,
		gold: 0,
		tradegoods: 0,
		gear: 0,
		mana: 0
	}
};

var gorengar = {
	name: "Gorengar the Black",
	subtitle: "Orc Chieftain Covered in Scars and Tar",
	icon: "general3",
	speed: 3,
	deploy: 6,
	strength: 6,
	maxstrength: 12,
	virtue: 10,
	cost: {
		food: 7,
		lumber: 0,
		stone: 0,
		gold: 0,
		tradegoods: 0,
		gear: 0,
		mana: 0
	}
};

var grogognzog = {
	name: "Grog, Og 'n Zog",
	subtitle: "The Three Dumbest and Fattest Orcs",
	icon: "scout2",
	speed: 2,
	deploy: 3,
	strength: 3,
	maxstrength: 6,
	virtue: 12,
	cost: {
		food: 2,
		lumber: 0,
		stone: 0,
		gold: 0,
		tradegoods: 0,
		gear: 0,
		mana: 0
	}
};

var dasmartest = {
	name: "Da Smartest",
	subtitle: "'Ingenious' Goblin",
	icon: "researcher3",
	speed: 3,
	deploy: 4,
	strength: 4,
	maxstrength: 9,
	virtue: 16,
	cost: {
		food: 4,
		lumber: 0,
		stone: 0,
		gold: 0,
		tradegoods: 0,
		gear: 0,
		mana: 0
	}
};

var dinker = {
	name: "Dinker",
	subtitle: "Half-orcen 'Philosopher'",
	icon: "tactician2",
	speed: 3,
	deploy: 4,
	strength: 4,
	maxstrength: 10,
	virtue: 10,
	cost: {
		food: 4,
		lumber: 0,
		stone: 0,
		gold: 0,
		tradegoods: 0,
		gear: 0,
		mana: 0
	}
};

var dorhor = {
	name: "Dorhor of Norvador",
	subtitle: "Troll King of the Hill Trolls",
	icon: "general1",
	speed: 2,
	deploy: 6,
	strength: 6,
	maxstrength: 16,
	virtue: 10,
	cost: {
		food: 8,
		lumber: 0,
		stone: 0,
		gold: 0,
		tradegoods: 0,
		gear: 0,
		mana: 0,
		honor: 0
	}
};

var starBuilding = {
    name: "Tribal Settlement",
	type: "free",
    garrison: 3,
	icon: "star",
    foundation: ["desert"],
	cost: {
		food: 0,
		lumber: 4,
		stone: 0,
		gold: 0,
		tradegoods: 0,
		gear: 0,
		mana: 0,
		relic: 0
	},
    limit: 0,
	produce: [{resource: "food", amount: 1}],
    other: ["Must be built at least 2 tiles away from any other Tribal Settlements or Villages.","Counts as a village for all intents and purposes.", "Produces 1 [food]."]
};

var moonBuilding = {
    name: "Shaman's Lodge",
	type: "village",
    garrison: 2,
	icon: "moon",
    foundation: ["desert"],
	cost: {
		food: 0,
		lumber: 3,
		stone: 0,
		gold: 0,
		tradegoods: 0,
		gear: 0,
		mana: 0,
		relic: 0
	},
    limit: 1,
	produce: [{resource: "mana", amount: 1}],
    other: ["Produces 1 [mana]."]
};

characterlist = [hornedhoof, skittish, blooknokkie, bullofakantash, gorengar, grogognzog, dasmartest, dinker, dorhor];

var factionInfo = [];
factionInfo[0] = "Those that have been outcast from the civilizations of the world have nowhere else to turn to then the Beastmen Tribes. Slowly these outcast’s bodies have become warped and mangled over time due to the cross-species breeding. Bits and pieces of every species can be found if you look close enough at the body of a Beastman. ";
factionInfo[1] = "They call the resource starved deserts their home, the only place the others would allow them to live. But against the odds, there they have not just survived, they have thrived. Their numbers grow and grow, and slowly but surely, the tables have turned against those that had once forsaken them. Now the time has come for them to reap what they have sown.";
factionInfo[2] = "Their evolution has left them with little brains but lots of brawn. They have no gods but the strongest among them, their tribal chieftains, who lead them in great raids of greener pastures.";

var factionAbilities = [];
var factionTopics = [];
factionTopics[0] = "Nomadic Scavengers";
factionTopics[1] = "Honorless";
factionTopics[2] = "Desert Peoples";

factionAbilities[factionAbilities.length] = {
	name: "Salvagers",
	text: "As a discovery action a character standing on one of their buildings can salvage it for a full return in resources spent on them.",
	topic: factionTopics[0],
	costaction: 1,
	time: {phase: "discovery", step:"disocvering"},
	condition: [{type:"musttarget", building:["friendly"], character:["friendly"]}],
	limit: -1,
	effects: [{type: "salvage"}]
};

factionAbilities[factionAbilities.length] = {
	name: "Making Do",
	text: "The Beastmen may convert any amount of [tradegoods] into [choice] during the gather phase.",
	topic: factionTopics[0],
	costtradegoods: 1,
	limit: -1,
	effects: [{type: "gain", resource:["food","lumber","stone","gold"], amount: 1}],
};

factionAbilities[factionAbilities.length] = {
	name: "Plundering",
	text: "For every enemy building they destroy they gain 2 food.",
	topic: factionTopics[0]
};
//hardcode

factionAbilities[factionAbilities.length] = {
	name: "Plundering",
	text: "The Beastmen don’t benefit from owning [relic], but whenever they bring one to a Tribal Settlement they gain 3 [food] on top of the 1 [relic].",
	topic: factionTopics[0],
	boons: [{type:"Return Relic", field:["activefood"],amount:3}]
};

factionAbilities[factionAbilities.length] = {
	name: "Dishonourable",
	text: "The Beastmen thrive on being honorless, characters will leave their court if their honor gets too high instead of too low.",
	topic: factionTopics[1]
};
//hardcode

factionAbilities[factionAbilities.length] = {
	name: "Showing Strength",
	text: "The Beastmen gain 1 honor at the end of every combat phase if they did not inflict at least 1 damage to a character during that phase. Their characters can fight each other to mitigate this effect.",
	topic: factionTopics[1]
};
//hardcode

factionAbilities[factionAbilities.length] = {
	name: "Humiliation",
	text: "When the Beastmen Tribes release a character back to their owner after a fight, their owner loses 1 honor.",
	topic: factionTopics[1]
};
//hardcode

factionAbilities[factionAbilities.length] = {
	name: "Lawless",
	text: "Beastmen are unaffected by the effects and taxes of Emperor Laws.",
	topic: factionTopics[2]
};
//hardcode

factionAbilities[factionAbilities.length] = {
	name: "Desert Charting",
	text: "Start with the Desert Charting technology.",
	topic: factionTopics[2],
	time: {phase: "worldbuilding", step: "neutralcharacters"},
	passivetechnology: ["Desert Charting"]
};

factionAbilities[factionAbilities.length] = {
	name: "Plundering",
	text: "In the World Building Phase they can turn plains adjacent to deserts into deserts. They can do this equal to the amount of basic tiles they put down.",
	topic: factionTopics[2],
	time: {phase: "worldbuilding", step: "misctiles"},
	condition: [{type: "musttarget", tile:["plains"]}],
	effects: [{type: "tileplace", tile: ["desert"]}],
	limit: "basicplace",
	mandatory: true
};

factionAbilities[factionAbilities.length] = {
	name: "Recruit the Locals",
	text: "Characters on desert tiles have access to recruitment.",
	topic: factionTopics[2],
};
//hardcode

factionAbilities[factionAbilities.length] = JSON.parse(JSON.stringify(buildaction));
var factionbuildings = ["gatherer", "road", starBuilding.name, moonBuilding.name];
factionAbilities[factionAbilities.length-1].effects[0].building= factionbuildings;

factionAbilities[factionAbilities.length] = {
	name: "Starting Position",
	text: "Place your starting village.",
	condition: [{type:"ignoretilerestrictions"}, {type: "musttarget", tile:["desert"], building:["unbuilt"]},{type: "hasnotadjacent", amount:2, building:["villageblocker"]}],
	time: {phase: "worldbuilding", step: "startingposition"},
	effects: [{type: "buildingplace", building: [starBuilding.icon], cost:"none"}],
	limit: 1,
	mandatory: true
};

factionAbilities[factionAbilities.length] = {
	name: "Place a Gatherer",
	text: "As part of your starting buildings you get a free gatherer adjacent to your village.",
	condition: [{type:"haveused", affected:"Starting Position"}],
	time: {phase: "worldbuilding", step: "startingposition"},
	effects: [{type: "buildingplace", building: ["gatherer"], cost: "none"}],
	limit: 1
};

var Beastmen = {
	name: "Beastmen Tribes",
	color: "red",
	offcolor: "black",
	characters: characterlist,
	starthonor: 3,
	factionpicks: 4,
	neutralpicks: 0,
	startingtechnology: ["Desert Charting"],
	startingbuildings: [starBuilding.icon, "gatherer"],
	allowedbuildings: factionbuildings,
	startingresources: {
		choice: 0,
		food: 0,
		lumber: 2,
		stone: 0,
		gold: 0,
		tradegoods: 0,
		gear: 0,
		mana: 0,
		honor: 0,
		relic: 0
	},
	order: 0,
	star: starBuilding,
	moon: moonBuilding,
	info: factionInfo,
	abilities: factionAbilities,
	topics: factionTopics
}

var agri1f = {
	name: "Agri-1f",
	subtitle: "Farming Drone",
	icon: "builder1",
	speed: 2,
	deploy: 2,
	strength: 2,
	maxstrength: 4,
	virtue: 5,
	cost: {
		food: 4,
		lumber: 0,
		stone: 0,
		gold: 0,
		tradegoods: 0,
		gear: 0,
		mana: 0
	}
};

var coppygen = {
	name: "Coppygen",
	subtitle: "Inquisitive Researcher",
	icon: "researcher3",
	speed: 3,
	deploy: 4,
	strength: 4,
	maxstrength: 9,
	virtue: 11,
	cost: {
		food: 0,
		lumber: 0,
		stone: 5,
		gold: 0,
		tradegoods: 0,
		gear: 0,
		mana: 0
	}
};

var aurosphoros = {
	name: "Aurosphoros",
	subtitle: "Cannon-armed Mech",
	icon: "general3",
	speed: 2,
	deploy: 2,
	strength: 2,
	maxstrength: 4,
	virtue: 5,
	cost: {
		food: 4,
		lumber: 0,
		stone: 0,
		gold: 0,
		tradegoods: 0,
		gear: 0,
		mana: 0
	}
};

var xcav2m = {
	name: "Xcav-2m",
	subtitle: "Mining Drone",
	icon: "builder3",
	speed: 2,
	deploy: 2,
	strength: 2,
	maxstrength: 4,
	virtue: 5,
	cost: {
		food: 0,
		lumber: 0,
		stone: 4,
		gold: 0,
		tradegoods: 0,
		gear: 0,
		mana: 0
	}
};

var bota3s = {
	name: "Bota-3s",
	subtitle: "Sawing Drone",
	icon: "builder2",
	speed: 2,
	deploy: 2,
	strength: 2,
	maxstrength: 4,
	virtue: 5,
	cost: {
		food: 4,
		lumber: 0,
		stone: 0,
		gold: 0,
		tradegoods: 0,
		gear: 0,
		mana: 0
	}
};

var nitrosium = {
	name: "Nitrosium",
	subtitle: "Devious Engineer",
	icon: "smith2",
	speed: 3,
	deploy: 5,
	strength: 5,
	maxstrength: 10,
	virtue: 5,
	cost: {
		food: 0,
		lumber: 0,
		stone: 3,
		gold: 0,
		tradegoods: 0,
		gear: 3,
		mana: 0
	}
};

var hydricon = {
	name: "Hydricon",
	subtitle: "Submarine Explorer",
	icon: "explorer1",
	speed: 2,
	deploy: 3,
	strength: 3,
	maxstrength: 7,
	virtue: 9,
	cost: {
		food: 5,
		lumber: 0,
		stone: 0,
		gold: 0,
		tradegoods: 0,
		gear: 0,
		mana: 0
	}
};

var oxylium = {
	name: "Oxylium",
	subtitle: "Float Operator",
	icon: "scout3",
	speed: 3,
	deploy: 4,
	strength: 4,
	maxstrength: 7,
	virtue: 9,
	cost: {
		food: 1,
		lumber: 1,
		stone: 1,
		gold: 2,
		tradegoods: 0,
		gear: 0,
		mana: 0
	}
};

var starBuilding = {
    name: "The Ark",
	type: "free",
    garrison: 6,
	icon: "star",
    foundation: ["any"],
	cost: {
		food: 0,
		lumber: 0,
		stone: 0,
		gold: 0,
		tradegoods: 0,
		gear: 0,
		mana: 0,
		relic: 0,
		honor: 0
	},
    limit: 1,
	citypoints: 2,
    other: ["Counts as a city for all intents and purposes.", "Can contain city/village buildings inside of it.", "Its garrison increases by 1 per village building, 2 per city building inside.", "May move as a move action to an adjacent non-ocean tile during your move turn, along with a character on top of it."]
};

var moonBuilding = {
    name: "Enclave",
	type: "free",
    garrison: 2,
	icon: "moon",
    foundation: ["any"],
	cost: {
		food: 0,
		lumber: 0,
		stone: 1,
		gold: 0,
		tradegoods: 0,
		gear: 1,
		mana: 0,
		relic: 0,
		honor: 0
	},
    limit: -1,
    other: ["You may only build an Enclave on a tile type on which there is no enclave yet.","Can’t be contained by the Ark, but can be built on a tile adjacent to the Ark.", "Must be built adjacent to a building owned by another player.","You may build 1 more university inside the Ark per Enclave."]
};

characterlist = [agri1f, coppygen, aurosphoros, xcav2m, bota3s, nitrosium, hydricon, oxylium];

var factionInfo = [];
factionInfo[0] = "With their frail and squishy bodies the frog-peoples have evolved to use their brain over their brawn. Eluding predators by outsmarting them with traps or escape plans. Their numbers never grew high, their peoples spread all throughout the world. From their earliest days, they had to learn how to adapt to any situation.";
factionInfo[1] = "As the world advanced into an age of civilization, their disparate underdog people united to construct an Ark of learning and safety. A technological marvel, the floating city brought hope to a world of fighting kingdoms where the huddled masses were trampled upon. For you could be allowed entry into the Ark, if you pass their tests and questions. ";
factionInfo[2] = "In recent years, their power has evolved beyond mere intelligence, being able through sheer force of mind to peer into the future. A future which is looking very bright for their Ark.";

var factionAbilities = [];
var factionTopics = [];
factionTopics[0] = "Technomancers";
factionTopics[1] = "The Ark";
factionTopics[2] = "Calculators";

factionAbilities[factionAbilities.length] = {
	name: "Learning by Example",
	text: "Every time a technology is made public, you gain 1 [gear].",
	topic: factionTopics[0]
};
//hardcode

factionAbilities[factionAbilities.length] = {
	name: "Ages Ahead",
	text: "The Archivists start in the technological age 2.",
	topic: factionTopics[0]
};
//hardcode

factionAbilities[factionAbilities.length] = {
	name: "Exchanging Knowledge",
	text: "May trade [gear] like bartering goods with other players.",
	topic: factionTopics[0]
};
//hardcode

factionAbilities[factionAbilities.length] = {
	name: "Technological",
	text: "Start with the Metallurgy and Scientific Method technologies.",
	time: {phase: "worldbuilding", step: "neutralcharacters"},
	topic: factionTopics[0],
	passivetechnology: ["Metallurgy", "Scientific Method"]
};

factionAbilities[factionAbilities.length] = {
	name: "Practical Science",
	text: "The Archivists may repeatedly convert 3 resources of the type the Ark is standing into 1 [gear] during the gather phase.",
	topic: factionTopics[0],
	time: {phase: "gather", step: "gathering"},
	limit: -1,
	activegear: 1,
	condition:[{type:"arktilecost"}]
};

factionAbilities[factionAbilities.length] = {
	name: "Ark Expansion",
	text: "Buildings built by the Archivists are not built on the board, instead buildings are constructed off the board inside of the Ark.",
	topic: factionTopics[1]
};
//hardcode

factionAbilities[factionAbilities.length] = {
	name: "Adaptive Gathering",
	text: "Gatherers inside the Ark count as being on the tile that the Ark is on and produce as such.",
	topic: factionTopics[1]
};
//hardcode

factionAbilities[factionAbilities.length] = {
	name: "Arkbound",
	text: "If the Ark is destroyed, the Archivists lose the game.",
	topic: factionTopics[1]
};
//hardcode

factionAbilities[factionAbilities.length] = {
	name: "Ark Absorption",
	text: "If a character on the Ark is victorious against a building in combat, they may put that building inside the Ark if they can build it.",
	topic: factionTopics[1]
};
//hardcode

factionAbilities[factionAbilities.length] = {
	name: "Machiavellian",
	text: "After every player has filled their court with characters, you may make a prediction of who you think the winner will be and how many characters he will have in their court at the moment of victory. If your prediction turns out to be correct, you win instead.",
	topic: factionTopics[2]
};
//hardcode

factionAbilities[factionAbilities.length] = {
	name: "Quantum Position",
	text: "At the gather phase you may pay 1 [gear] to put yourself on the top or the bottom of the faction order for the remainder of that round.",
	topic: factionTopics[2]
};
//hardcode

factionAbilities[factionAbilities.length] = JSON.parse(JSON.stringify(buildaction));
var factionbuildings = ["gatherer", "market", "barracks", "university", starBuilding.name, moonBuilding.name];
factionAbilities[factionAbilities.length-1].effects[0].building= factionbuildings;

factionAbilities[factionAbilities.length] = {
	name: "Starting Position",
	text: "Place your starting village.",
	condition: [{type:"ignoretilerestrictions"}, {type: "musttarget", building:["unbuilt"]},{type: "hasnotadjacent", amount:2, building:["villageblocker"]}],
	time: {phase: "worldbuilding", step: "startingposition"},
	effects: [{type: "buildingplace", building: [starBuilding.name], cost:"none"}],
	limit: 1,
	mandatory: true
};

var Archive = {
	name: "Archive Ark",
	color: "grey",
	offcolor: "white",
	characters: characterlist,
	starthonor: 15,
	factionpicks: 3,
	neutralpicks: 1,
	startingtechnology: ["Metallurgy", "Scientific Method"],
	startingbuildings: [starBuilding.icon, "gatherer", "university"],
	allowedbuildings: factionbuildings,
	startingresources: {
		choice: 1,
		food: 0,
		lumber: 0,
		stone: 0,
		gold: 0,
		tradegoods: 0,
		gear: 0,
		mana: 0,
		honor: 0,
		relic: 0
	},
	order: 0,
	star: starBuilding,
	moon: moonBuilding,
	info: factionInfo,
	abilities: factionAbilities,
	topics: factionTopics
}

var khaz = {
	name: "Khaz",
	subtitle: "Mining Overseer",
	icon: "builder1",
	speed: 2,
	deploy: 2,
	strength: 2,
	maxstrength: 5,
	virtue: 9,
	cost: {
		food: 1,
		lumber: 0,
		stone: 0,
		gold: 2,
		tradegoods: 0,
		gear: 0,
		mana: 0
	}
};

var uhzrun = {
	name: "Uhzrun",
	subtitle: "Master Gold Smelter",
	icon: "smith1",
	speed: 2,
	deploy: 4,
	strength: 4,
	maxstrength: 6,
	virtue: 9,
	cost: {
		food: 0,
		lumber: 0,
		stone: 0,
		gold: 3,
		tradegoods: 0,
		gear: 0,
		mana: 0
	}
};

var thur = {
	name: "Thur",
	subtitle: "The Mining Minister",
	icon: "researcher1",
	speed: 2,
	deploy: 3,
	strength: 3,
	maxstrength: 6,
	virtue: 10,
	cost: {
		food: 0,
		lumber: 0,
		stone: 4,
		gold: 0,
		tradegoods: 0,
		gear: 0,
		mana: 0
	}
};

var skrun = {
	name: "Skrun",
	subtitle: "Stout Hearted Worker",
	icon: "tactician3",
	speed: 2,
	deploy: 3,
	strength: 3,
	maxstrength: 5,
	virtue: 7,
	cost: {
		food: 2,
		lumber: 0,
		stone: 0,
		gold: 1,
		tradegoods: 0,
		gear: 0,
		mana: 0
	}
};

var jaggengrog = {
	name: "Jaggengrog",
	subtitle: "Charismatic Conscriptor",
	icon: "recruiter2",
	speed: 4,
	deploy: 7,
	strength: 7,
	maxstrength: 12,
	virtue: 11,
	cost: {
		food: 0,
		lumber: 0,
		stone: 0,
		gold: 7,
		tradegoods: 0,
		gear: 0,
		mana: 0
	}
};

var gottrek = {
	name: "Gottrek",
	subtitle: "Strategist of Coin",
	icon: "tactician1",
	speed: 2,
	deploy: 5,
	strength: 5,
	maxstrength: 10,
	virtue: 11,
	cost: {
		food: 4,
		lumber: 0,
		stone: 0,
		gold: 0,
		tradegoods: 0,
		gear: 0,
		mana: 0
	}
};

var rohdrimbral = {
	name: "Rohdrimbral",
	subtitle: "The Drunken Governor",
	icon: "merchant1",
	speed: 2,
	deploy: 4,
	strength: 4,
	maxstrength: 8,
	virtue: 9,
	cost: {
		food: 0,
		lumber: 2,
		stone: 0,
		gold: 2,
		tradegoods: 0,
		gear: 0,
		mana: 0
	}
};

var daxgrim = {
	name: "Daxgrim",
	subtitle: "Wielder of the Golden Hammer",
	icon: "general2",
	speed: 3,
	deploy: 9,
	strength: 9,
	maxstrength: 16,
	virtue: 12,
	cost: {
		food: 0,
		lumber: 0,
		stone: 3,
		gold: 3,
		tradegoods: 0,
		gear: 0,
		mana: 0
	}
};

var starBuilding = {
    name: "Golden Hall",
	type: "city",
    garrison: 4,
	icon: "star",
    foundation: ["mountain"],
	cost: {
		food: 0,
		lumber: 0,
		stone: 0,
		gold: 6,
		tradegoods: 0,
		gear: 0,
		mana: 0,
		relic: 0,
		honor: 0
	},
    limit: -1,
	citypoints: 2,
    other: ["Can be built adjacent to Golden Halls.", "The first tactics card of the round costs 1 less [gold] to draw per Golden Hall."]
};

var moonBuilding = {
    name: "Brewery",
	type: "village",
    garrison: 2,
	icon: "moon",
    foundation: ["mountain", "plains", "desert"],
	cost: {
		food: 0,
		lumber: 3,
		stone: 1,
		gold: 0,
		tradegoods: 0,
		gear: 0,
		mana: 0,
		relic: 0,
		honor: 0
	},
    limit: 1,
	produce: [{resource: "stone", amount: "adjacentmines"}],
    other: ["Your maximum tactic hand size is increased by 1 per Brewery","Any adjacent Gatherer on a mountain produces 1 more [stone]", "You may make a character drunk per brewery per gather phase, increasing their strength by 1."]
};

characterlist = [khaz, uhzrun, thur, skrun, jaggengrog, gottrek, rohdrimbral, daxgrim];

var factionInfo = [];
factionInfo[0] = "The stout and rugged Ashen-dwarves have dwelt deep in the caverns beneath the mountain peaks. Unopposed and unphased by the outside world they have dug deep halls into the depths of the earth.In their excavations they find all kinds of valuable minerals and metals, with which their craftsdwarves complete unmatched artifacts and projects. Most priced and rare of all their mined valuables is gold, which they gladly trade with the surface dwellers for their artifacts.";
factionInfo[1] = "Their giant underground fortresses of golden halls and diamond thrones are unmatched in the world above. There they feast upon their fortune and drink their finest grog. What expertise they have in feasting, they lack in diplomacy, subterfuge or trade. But their unbridled greed for gold has forced them to interact with the surface dwellers.";

var factionAbilities = [];
var factionTopics = [];
factionTopics[0] = "Mountaineers";
factionTopics[1] = "Tacticians";
factionTopics[2] = "Craftsdwarfship";

factionAbilities[factionAbilities.length] = {
	name: "Learning by Example",
	text: "Can repeatedly convert 2 [stone] into 1 [gold] during the gather phase.",
	topic: factionTopics[0],
	coststone: 2,
	activegold: 1
};

factionAbilities[factionAbilities.length] = {
	name: "Deep Delving",
	text: "Start with the Deep Delving technology.",
	topic: factionTopics[0],
	time: {phase: "worldbuilding", step: "neutralcharacters"},
	passivetechnology: ["Deep Delving"]
};

factionAbilities[factionAbilities.length] = {
	name: "Dungeons Deep and Caverns Old",
	text: "During world building, the Hammers may place double the amount of mountains in step 2.",
	topic: factionTopics[0],
	boons: [{type: "Place a Mountain", field: "charges", amount: "specialplace"}],
};

factionAbilities[factionAbilities.length] = {
	name: "Halls of the Mountain King",
	text: "Any of their buildings may be built on mountains, but their villages and cities must be built on a mountain.",
	topic: factionTopics[0]
};
//Hardcode

factionAbilities[factionAbilities.length] = {
	name: "Mountain of Work",
	text: "May turn an unbuilt basic tile adjacent to a mountain into a mountain for 10 [stone] as a discovery action.",
	topic: factionTopics[0],
	time: {phase: "discovery", step: "discovering"},
	costaction: 1,
	condition: [{type: "hasadjacent", tile:["mountain"]},{type: "musttarget", building:"unbuilt"}],
	effects: [{type: "tileplace", tile: ["mountain"]}],
	limit: -1,
	coststone: 10
};

factionAbilities[factionAbilities.length] = {
	name: "Eye for the Price",
	text: "The Hammers of the Ash may trade tactics cards with other players as bartering goods (revealed or unrevealed).",
	topic: factionTopics[1]
};
//hardcode

factionAbilities[factionAbilities.length] = {
	name: "Commission",
	text: "The Hammers may search for a tactics card of their choice if they pay 2 additional [gold] when searching for a tactics card.",
	topic: factionTopics[1]
};
//hardcode

factionAbilities[factionAbilities.length] = {
	name: "Dedication",
	text: "If they pay 1 additional [gold] to draw a tactics card it does not cost an action.",
	topic: factionTopics[1]
};
//hardcode

factionAbilities[factionAbilities.length] = {
	name: "Inspiration",
	text: "Whenever the Hammers discover an anomaly they gain a random tactics card.",
	topic: factionTopics[1],
	boons: [{type:"Discover Anomaly", field:"activetactics",amount:1}]
};

factionAbilities[factionAbilities.length] = {
	name: "Inspiration",
	text: "At the end of every gather phase (except the first) a craftsdwarf of the Hammers of the Ash completes a craft in the form of a card drawn from the top of the tactics deck until a production or court card is drawn. Players take turns in faction order auctioning for the card by giving a number higher than any previously given number. The highest number must pay that amount of resources of their choice to the Hammers and gain the card. If no one bids the Hammers get the card.",
	topic: factionTopics[2]
};
//hardcode

factionAbilities[factionAbilities.length] = JSON.parse(JSON.stringify(buildaction));
var factionbuildings = ["village", "gatherer", "market", "barracks", "harbor", "university", "road", "wall", "fort", starBuilding.name, moonBuilding.name];
factionAbilities[factionAbilities.length-1].effects[0].building= factionbuildings;

factionAbilities[factionAbilities.length] = {
	name: "Starting Position",
	text: "Place your starting village.",
	condition: [{type:"ignoretilerestrictions"}, {type: "musttarget", tile:["mountain"], building:["unbuilt"]},{type: "hasnotadjacent", amount:2, building:["villageblocker"]}],
	time: {phase: "worldbuilding", step: "startingposition"},
	effects: [{type: "buildingplace", building: ["village"], cost:"none"}],
	limit: 1,
	mandatory: true
};

factionAbilities[factionAbilities.length] = {
	name: "Place a Gatherer",
	text: "As part of your starting buildings you get a free gatherer adjacent to your village.",
	condition: [{type:"haveused", affected:"Starting Position"}],
	time: {phase: "worldbuilding", step: "startingposition"},
	effects: [{type: "buildingplace", building: ["gatherer"], cost: "none"}],
	limit: 1
};

factionAbilities[factionAbilities.length] = {
	name: "Place a Brewery",
	text: "As part of your starting buildings you get a free brewery adjacent to your village.",
	condition: [{type:"haveused", affected:"Place a Gatherer"}],
	time: {phase: "worldbuilding", step: "startingposition"},
	effects: [{type: "buildingplace", building: [moonBuilding.name], cost: "none"}],
	limit: 1
};

var Hammers = {
	name: "Hammers of the Ash",
	color: "black",
	offcolor: "grey",
	characters: characterlist,
	starthonor: 15,
	factionpicks: 3,
	neutralpicks: 1,
	startingtechnology: ["Deep Delving"],
	startingbuildings: ["village", "gatherer", moonBuilding.icon],
	allowedbuildings: factionbuildings,
	startingresources: {
		choice: 2,
		food: 0,
		lumber: 0,
		stone: 0,
		gold: 0,
		tradegoods: 0,
		gear: 0,
		mana: 0,
		honor: 0,
		relic: 0
	},
	order: 0,
	star: starBuilding,
	moon: moonBuilding,
	info: factionInfo,
	abilities: factionAbilities,
	topics: factionTopics
}

var koroko = {
	name: "Koroko",
	subtitle: "Market Cryer",
	icon: "merchant2",
	speed: 3,
	deploy: 2,
	strength: 2,
	maxstrength: 5,
	virtue: 8,
	cost: {
		food: 0,
		lumber: 0,
		stone: 0,
		gold: 2,
		tradegoods: 0,
		gear: 0,
		mana: 0
	}
};

var anvatsio = {
	name: "Anvatsio",
	subtitle: "Master of Coin",
	icon: "merchant3",
	speed: 2,
	deploy: 6,
	strength: 6,
	maxstrength: 6,
	virtue: 10,
	cost: {
		food: 0,
		lumber: 0,
		stone: 0,
		gold: 4,
		tradegoods: 0,
		gear: 0,
		mana: 0
	}
};

var espantio = {
	name: "Espantio",
	subtitle: "The Blue Prophet",
	icon: "magician3",
	speed: 2,
	deploy: 5,
	strength: 5,
	maxstrength: 10,
	virtue: 12,
	cost: {
		food: 5,
		lumber: 0,
		stone: 0,
		gold: 0,
		tradegoods: 0,
		gear: 0,
		mana: 0
	}
};

var provosto = {
	name: "Provosto",
	subtitle: "Ocean Exploiter",
	icon: "explorer1",
	speed: 2,
	deploy: 3,
	strength: 3,
	maxstrength: 3,
	virtue: 9,
	cost: {
		food: 3,
		lumber: 0,
		stone: 0,
		gold: 0,
		tradegoods: 0,
		gear: 0,
		mana: 0
	}
};

var velzero = {
	name: "Velzero",
	subtitle: "Opportunist Tolwoman",
	icon: "builder2",
	speed: 2,
	deploy: 4,
	strength: 4,
	maxstrength: 7,
	virtue: 10,
	cost: {
		food: 1,
		lumber: 1,
		stone: 0,
		gold: 1,
		tradegoods: 0,
		gear: 0,
		mana: 0
	}
};

var qumono = {
	name: "Qumono",
	subtitle: "Sly Negotiator",
	icon: "tactician2",
	speed: 2,
	deploy: 4,
	strength: 4,
	maxstrength: 9,
	virtue: 9,
	cost: {
		food: 0,
		lumber: 0,
		stone: 1,
		gold: 2,
		tradegoods: 0,
		gear: 0,
		mana: 0
	}
};

var carvano = {
	name: "Carvano",
	subtitle: "Leader of the Great Caravans",
	icon: "scout2",
	speed: 5,
	deploy: 6,
	strength: 6,
	maxstrength: 9,
	virtue: 12,
	cost: {
		food: 3,
		lumber: 0,
		stone: 0,
		gold: 3,
		tradegoods: 0,
		gear: 0,
		mana: 0
	}
};

var sunumo = {
	name: "Sunumo",
	subtitle: "The Tidebringer",
	icon: "magician1",
	speed: 2,
	deploy: 3,
	strength: 3,
	maxstrength: 7,
	virtue: 11,
	cost: {
		food: 0,
		lumber: 2,
		stone: 2,
		gold: 0,
		tradegoods: 0,
		gear: 0,
		mana: 0
	}
};

var malangio = {
	name: "Malangio",
	subtitle: "Rainkeeper",
	icon: "researcher2",
	speed: 2,
	deploy: 6,
	strength: 6,
	maxstrength: 8,
	virtue: 10,
	cost: {
		food: 4,
		lumber: 1,
		stone: 0,
		gold: 0,
		tradegoods: 0,
		gear: 0,
		mana: 0
	}
};

var starBuilding = {
    name: "Guild Halls",
	type: "free",
    garrison: 2,
	icon: "star",
    foundation: ["plains"],
	cost: {
		food: 0,
		lumber: 3,
		stone: 0,
		gold: 2,
		tradegoods: 3,
		gear: 0,
		mana: 0,
		relic: 0,
		honor: 0
	},
    limit: 1,
	produce: [{type: "gain", income: [{resource: "tradegoods", amount: "tradetreaty"}] } ],
    other: ["Must be built adjacent to a Harbor.","Produces 1 [tradegoods] per trade treaty you hold."]
};

var moonBuilding = {
    name: "River Toll",
	type: "free",
    garrison: 2,
	icon: "moon",
    foundation: ["riverland"],
	cost: {
		food: 0,
		lumber: 1,
		stone: 0,
		gold: 1,
		tradegoods: 0,
		gear: 0,
		mana: 0,
		relic: 0,
		honor: 0
	},
    limit: -1,
	produce: [{resource: "convertgoods", amount: 1}],
    other: ["You may convert 1 [tradegoods] into 1 [choice] in the gather phase.", "You may request a toll of resources of your choice of a player once per character attempting to move onto or over a river tile within 7 tiles of this building per round. If they do not pay the requested toll amount and move anyway, they lose 1 honor."]
};

characterlist = [koroko, anvatsio, espantio, provosto, velzero, qumono, carvano, sunumo, malangio];


var factionInfo = [];
factionInfo[0] = "The water-dwelling, scaly and slimy creatures that live in the rivers which crisscross the world, were always lorded over by others. They might have been in a position for domination, but the smartest among them smelled opportunity. While the kings, emperors and chieftains fought, they sold them arms, while they bickered over laws and grudges, they bribed their diplomats.";
factionInfo[1] = "Their society revolves around trade, economic deals, and business. Always business. And business is ruthless. The biggest businessmen among them have conglomerated into a syndicate that holds an iron grip on the market, against their monopoly no other stands a chance of breaking in.";

var factionAbilities = [];
var factionTopics = [];
factionTopics[0] = "Tradespeople";
factionTopics[1] = "Riverdwellers";
factionTopics[2] = "Ruthless Capitalists";

factionAbilities[factionAbilities.length] = {
	name: "Mind on Business",
	text: "For every two trade treaties of other players that you hold you gain an additional [tradegoods].",
	topic: factionTopics[0]
};
//hardcode

factionAbilities[factionAbilities.length] = {
	name: "Black Market",
	text: "May trade with other players outside of the trade phase.",
	topic: factionTopics[0]
};
//hardcode

factionAbilities[factionAbilities.length] = {
	name: "Traders Everywhere",
	text: "Does not have to be connected to receive or give trade treaties.",
	topic: factionTopics[0]
};

factionAbilities[factionAbilities.length] = {
	name: "Diplomatic Ties",
	text: "At the start of the gather phase you may choose another player, if you do both you and that player gain 1 [tradegoods].",
	topic: factionTopics[0]
};
//hardcode

factionAbilities[factionAbilities.length] = {
	name: "Naturally Waterbound",
	text: "Harbors are village buildings.",
	time: {phase: "build", step: "building"},
	topic: factionTopics[0],
	boons: [{type:"buildingsetvalue", building: "harbor", field:"type", amount: "village" }]
};


factionAbilities[factionAbilities.length] = {
	name: "Structural Engineering",
	text: "Start with Structural Engineering technology.",
	topic: factionTopics[1],
	time: {phase: "worldbuilding", step: "neutralcharacters"},
	passivetechnology: ["Structural Engineering"]
};

factionAbilities[factionAbilities.length] = {
	name: "The Riverland",
	text: "In the World Building Phase they create 1 additional river.",
	topic: factionTopics[1],
};


factionAbilities[factionAbilities.length] = {
	name: "Exotic Reagents",
	text: "They can build any building on river tiles, including gatherers which then produce 1 [tradegoods].",
	topic: factionTopics[1]
};
//hardcode

factionAbilities[factionAbilities.length] = {
	name: "Downriver",
	text: "Villages can be founded on a river on which you already own a village or city, without having to own any adjacent building.",
	topic: factionTopics[1]
};
//hardcode

factionAbilities[factionAbilities.length] = {
	name: "Payment for Order Flow",
	text: "As a discovery action you may pay 2 trade goods to:<br><ul> <li>Gain 1 [gear] or 1 [mana].</li> <li>Gain 2 discovery actions.</li> <li>Make a deployed character lose 1 strength (to a minimum of 1).</li> <li>Take 1 basic resource from another player of their choice.</li> <li>Force another player to exchange trade treaties if neither of you has eachothers trade treaty.</li> </ul>",
	topic: factionTopics[2]
};
//hardcode

factionAbilities[factionAbilities.length] = {
	name: "Start a River",
	text: "Choose a snow or plains tile adjacent to a mountain to start your river.",
	time: {phase: "worldbuilding", step: "secondriver"},
	condition: [{type: "musttarget", tile:["plains","snow"]},{type: "hasadjacent", tile:["mountain"]}],
	effects: [{type: "tileplace", tile: ["lastriverland"]}],
	limit: 1,
	mandatory: true
}

factionAbilities[factionAbilities.length] = {
	name: "Continue your River",
	text: "Choose a plains or snow tile adjacent to your previously chosen river tile. Your river will end when a chosen tile is adjacent to a mountain, 2 riverland tiles, or you run out of options.",
	time: {phase: "worldbuilding", step: "secondriver"},
	condition: [{type: "musttarget", tile:["plains", "snow"]},{type: "hasadjacent", tile:["lastriverland"]},{type:"haveused", affected:"Start a River"}],
	effects: [{type: "tileplace", tile: ["lastriverland"]}],
	limit: -1,
	mandatory: true
}

factionAbilities[factionAbilities.length] = JSON.parse(JSON.stringify(buildaction));
var factionbuildings = ["village", "gatherer", "market", "barracks", "harbor", "university", "road", "wall", "fort", starBuilding.name, moonBuilding.name];
factionAbilities[factionAbilities.length-1].effects[0].building= factionbuildings;

factionAbilities[factionAbilities.length] = {
	name: "Starting Position",
	text: "Place your starting village.",
	condition: [{type:"ignoretilerestrictions"}, {type: "musttarget", tile:["riverland","plains","snow"], building:["unbuilt"]},{type: "hasnotadjacent", amount:2, building:["villageblocker"]}],
	time: {phase: "worldbuilding", step: "startingposition"},
	effects: [{type: "buildingplace", building: ["village"], cost:"none"}],
	limit: 1,
	mandatory: true
};

factionAbilities[factionAbilities.length] = {
	name: "Place a Gatherer",
	text: "As part of your starting buildings you get a free gatherer adjacent to your village.",
	condition: [{type:"haveused", affected:"Starting Position"}],
	time: {phase: "worldbuilding", step: "startingposition"},
	effects: [{type: "buildingplace", building: ["gatherer"], cost: "none"}],
	limit: 1
};

factionAbilities[factionAbilities.length] = {
	name: "Place a Harbor",
	text: "As part of your starting buildings you get a free harbor adjacent to your village.",
	condition: [{type:"ignoretilerestrictions"},{type: "musttarget", tile:["riverland","oceansideplains","oceansidesnow"], building:["unbuilt"]},{type: "hasadjacent", amount:1, building:["villageblocker","friendly"]},{type:"haveused", affected:"Place a Gatherer"}],
	time: {phase: "worldbuilding", step: "startingposition"},
	effects: [{type: "buildingplace", building: ["harbor"], cost: "none"}],
	limit: 1
};

var Syndicate = {
	name: "Seven Streams Syndicate",
	color: "blue",
	offcolor: "yellow",
	characters: characterlist,
	starthonor: 13,
	factionpicks: 3,
	neutralpicks: 1,
	startingtechnology: ["Structural Engineering"],
	startingbuildings: ["village", "gatherer", "harbor"],
	allowedbuildings: factionbuildings,
	startingresources: {
		choice: 0,
		food: 0,
		lumber: 0,
		stone: 0,
		gold: 0,
		tradegoods: 2,
		gear: 0,
		mana: 0,
		honor: 0,
		relic: 0
	},
	order: 0,
	star: starBuilding,
	moon: moonBuilding,
	info: factionInfo,
	abilities: factionAbilities,
	topics: factionTopics
}

var leavavel = {
	name: "Leavavel",
	subtitle: "Leafiest of Leafs",
	icon: "builder3",
	speed: 2,
	deploy: 2,
	strength: 2,
	maxstrength: 4,
	virtue: 7,
	cost: {
		food: 1,
		lumber: 1,
		stone: 0,
		gold: 0,
		tradegoods: 0,
		gear: 0,
		mana: 1
	}
};

var maprassil = {
	name: "Maprassil",
	subtitle: "Divine Guardian",
	icon: "magician1",
	speed: 2,
	deploy: 4,
	strength: 4,
	maxstrength: 7,
	virtue: 9,
	cost: {
		food: 0,
		lumber: 3,
		stone: 0,
		gold: 0,
		tradegoods: 0,
		gear: 0,
		mana: 2
	}
};

var daegobark = {
	name: "Daegobark",
	subtitle: "Of Thickened Bark",
	icon: "general3",
	speed: 3,
	deploy: 7,
	strength: 7,
	maxstrength: 12,
	virtue: 11,
	cost: {
		food: 4,
		lumber: 1,
		stone: 0,
		gold: 0,
		tradegoods: 0,
		gear: 0,
		mana: 0
	}
};

var birchawe = {
	name: "Birchawe",
	subtitle: "Tender of the Grove",
	icon: "magician3",
	speed: 2,
	deploy: 3,
	strength: 3,
	maxstrength: 8,
	virtue: 10,
	cost: {
		food: 4,
		lumber: 0,
		stone: 0,
		gold: 0,
		tradegoods: 0,
		gear: 0,
		mana: 0
	}
};

var eriabent = {
	name: "Eriabent",
	subtitle: "Diligent Branches",
	icon: "scout1",
	speed: 1,
	deploy: 3,
	strength: 3,
	maxstrength: 6,
	virtue: 8,
	cost: {
		food: 0,
		lumber: 3,
		stone: 0,
		gold: 0,
		tradegoods: 0,
		gear: 0,
		mana: 0
	}
};

var froot = {
	name: "Froot",
	subtitle: "Fruitful Provider",
	icon: "explorer3",
	speed: 1,
	deploy: 2,
	strength: 2,
	maxstrength: 5,
	virtue: 10,
	cost: {
		food: 1,
		lumber: 1,
		stone: 0,
		gold: 0,
		tradegoods: 0,
		gear: 0,
		mana: 0
	}
};

var thornagast = {
	name: "Birchawe",
	subtitle: "Ancient Protector",
	icon: "general1",
	speed: 2,
	deploy: 6,
	strength: 6,
	maxstrength: 9,
	virtue: 10,
	cost: {
		food: 2,
		lumber: 2,
		stone: 0,
		gold: 0,
		tradegoods: 0,
		gear: 0,
		mana: 02
	}
};

var yewanna = {
	name: "Yewanna",
	subtitle: "Vines of the Elder",
	icon: "magician2",
	speed: 1,
	deploy: 2,
	strength: 2,
	maxstrength: 6,
	virtue: 10,
	cost: {
		food: 0,
		lumber: 2,
		stone: 0,
		gold: 0,
		tradegoods: 0,
		gear: 0,
		mana: 2
	}
};

var starBuilding = {
    name: "The Great Tree",
	type: "free",
    garrison: 10,
	icon: "star",
    foundation: ["forest"],
	cost: {
		food: 0,
		lumber: 0,
		stone: 0,
		gold: 0,
		tradegoods: 0,
		gear: 0,
		mana: 0,
		relic: 0,
		honor: 0
	},
    limit: 1,
    other: ["Forest tiles connected to The Great Tree through forest tiles count as its roots.", "On the roots or tiles encircled by the roots you may build village and city buildings without needing to own any adjacent buildings."]
};

var moonBuilding = {
    name: "Mana Fountain",
	type: "free",
    garrison: 4,
	icon: "moon",
    foundation: ["riverland"],
	cost: {
		food: 0,
		lumber: 4,
		stone: 0,
		gold: 0,
		tradegoods: 0,
		gear: 0,
		mana: 3,
		relic: 0,
		honor: 0
	},
    limit: -1,
    other: ["During the gather phase you may turn an additional unbuilt plains, snow or desert adjacent to a forest into a forest per mana fountain.", "The first ability of the round costs 1 less [mana] to cast per mana fountain.", "For 7 mana you may turn any tile into a forest tile once per gather phase per mana fountain."]
};

characterlist = [leavavel, maprassil, daegobark, birchawe, eriabent, froot, thornagast, yewanna];

var factionInfo = [];
factionInfo[0] = "For thousands of years, the Great Tree has stood while insects and lesser creatures roamed in its dirt and roots. It provided and kept them safe in its ever-expanding roots. Some of its branches, infused by magical energies, slowly became sentient. In symbiosis with the Great Tree its offshoot cared for each other. The Great Tree provides them with protection and mana, and its Children maintain the vines and roots and deal with any threats that may harm the Tree and its vast network of roots.";
factionInfo[1] = "But as time passed, some of the lesser creatures of the world strayed away from its roots into the wide world. And the ruthless wide world corrupted them, turned them into vile beings of war and flame. They turned against the hand that once fed them, cutting and burning down the roots of the Great Tree. Although it did not know war and destruction, it did know growth and creation. It used the only way it knew how to defend itself; to expand its roots further and further until there was no more room for the destroyers left.";

var factionAbilities = [];
var factionTopics = [];
factionTopics[0] = "Mana Affluent";
factionTopics[1] = "Woodkin";
factionTopics[2] = "The Great Tree";

factionAbilities[factionAbilities.length] = {
	name: "Intwine with the Warp",
	text: "Whenever someone discovers a warp gain 1 [mana].",
	topic: factionTopics[0]
};
//hardcode

factionAbilities[factionAbilities.length] = {
	name: "Manaweb",
	text: "The Children can trade mana with other players.",
	topic: factionTopics[0]
};
//hardcode

factionAbilities[factionAbilities.length] = {
	name: "Manaleach",
	text: "The Children gain 1 [mana] every time another player casts a spell that costs [mana].",
	topic: factionTopics[0]
};
//hardcode

factionAbilities[factionAbilities.length] = {
	name: "Manamancy",
	text: "Start with the Manamancy technology unlocked.",
	topic: factionTopics[0],
	time: {phase: "worldbuilding", step: "neutralcharacters"},
	passivetechnology: ["Manamancy"]
};

factionAbilities[factionAbilities.length] = {
	name: "Woodworks",
	text: "Repeatedly for 1 [mana] they may convert a [lumber] into a [choice] during the gather phase.",
	topic: factionTopics[0],
	time: {phase: "gather", step: "gathering"},
	costlumber: 1,
	costmana: 1,
	effects: [{type: "gain", resource:["food","lumber","stone","gold"], amount: 1}],
	limit: -1,
};

factionAbilities[factionAbilities.length] = {
	name: "Branchcraft",
	text: "As a discovery action you may have a character on a forest gain 1 strength.",
	topic: factionTopics[1],
	costaction: 1,
	time: {phase: "discovery", step: "discovering"},

};

factionAbilities[factionAbilities.length] = {
	name: "Forestwalking",
	text: "Moving from a forest tile to another forest tile only costs half a speed.",
	topic: factionTopics[1]
};
//hardcode

factionAbilities[factionAbilities.length] = {
	name: "Woods of the Ages",
	text: "During world building, the Children of the Great Tree may place double the amount of forests in step 2.",
	topic: factionTopics[1],
	boons: [{type: "Place a Forest", field: "charges", amount: "specialplace"}],
};

factionAbilities[factionAbilities.length] = {
	name: "Forest through the Trees",
	text: "During the gather phase you may turn any unbuilt plain, snow or desert adjacent to a forest into a forest.",
	topic: factionTopics[1],
	time: {phase: "gather", step: "gathering"},
	condition: [{type: "musttarget", tile:["plains","snow", "desert"], building:["unbuilt"]},{type:"hasadjacent", tile:["forest"]}],
	effects: [{type: "tileplace", tile: ["forest"]}],
	limit: 1,
};

factionAbilities[factionAbilities.length] = {
	name: "Majesty of the Forest",
	text: "For every 4 forest tiles connected to the Great Tree through forest tiles, the Great Tree becomes worth 1 more city point.",
	topic: factionTopics[2]
};
//hardcode

factionAbilities[factionAbilities.length] = {
	name: "Lifeline",
	text: "If their Great Tree is destroyed, they lose the game.",
	topic: factionTopics[2]
};
//hardcode

factionAbilities[factionAbilities.length] = {
	name: "Branching Out",
	text: "Your limit on building types is increased by 1 per city point your Great Tree is worth.",
	topic: factionTopics[2]
};
//hardcode

factionAbilities[factionAbilities.length] = {
	name: "Rooted Down",
	text: "You can build buildings on any forest tile connected to the Great Tree or encircled by the Great Tree. But you can not build buildings elsewhere.",
	topic: factionTopics[2]
};
//hardcode

factionAbilities[factionAbilities.length] = JSON.parse(JSON.stringify(buildaction));
var factionbuildings = ["gatherer", "market", "barracks", "harbor", "university", "road", "wall", "fort", starBuilding.name, moonBuilding.name];
factionAbilities[factionAbilities.length-1].effects[0].building= factionbuildings;

factionAbilities[factionAbilities.length] = {
	name: "Starting Position",
	text: "Place your Great Tree.",
	time: {phase: "worldbuilding", step: "startingposition"},
	effects: [{type: "buildingplace", building: [starBuilding.name], cost:"none"}],
	limit: 1,
	mandatory: true
};

factionAbilities[factionAbilities.length] = {
	name: "Place a Gatherer",
	text: "As part of your starting buildings you get a free gatherer adjacent to your Great Tree.",
	condition: [{type:"haveused", affected:"Starting Position"},{type:"ignoretilerestrictions"}, {type: "musttarget", tile:["forest","mountain","farmland"], building:["unbuilt"]},{type: "hasadjacent", amount:1, building:["villageblocker"]}],
	time: {phase: "worldbuilding", step: "startingposition"},
	effects: [{type: "buildingplace", building: ["gatherer"], cost: "none"}],
	limit: 1
};

var Children = {
	name: "Children of the Great Tree",
	color: "green",
	offcolor: "brown",
	characters: characterlist,
	starthonor: 15,
	factionpicks: 3,
	neutralpicks: 1,
	startingtechnology: ["Manamancy"],
	startingbuildings: [starBuilding.icon, "gatherer"],
	allowedbuildings: factionbuildings,
	startingresources: {
		choice: 0,
		food: 0,
		lumber: 2,
		stone: 0,
		gold: 0,
		tradegoods: 0,
		gear: 0,
		mana: 1,
		honor: 0,
		relic: 0
	},
	order: 0,
	star: starBuilding,
	moon: moonBuilding,
	info: factionInfo,
	abilities: factionAbilities,
	topics: factionTopics
}

var shashioq = {
	name: "Sha'shi'oq",
	subtitle: "Shapeshifting Octopus",
	icon: "smith3",
	speed: 3,
	deploy: 1,
	strength: 1,
	maxstrength: 5,
	virtue: 0,
	cost: {
		food: 0,
		lumber: 0,
		stone: 0,
		gold: 2,
		tradegoods: 0,
		gear: 0,
		mana: 0
	}
};

var raheskah = {
	name: "Raheskah",
	subtitle: "Psychic Tentacle Abomination",
	icon: "general2",
	speed: 2,
	deploy: 8,
	strength: 8,
	maxstrength: 18,
	virtue: 0,
	cost: {
		food: 2,
		lumber: 2,
		stone: 2,
		gold: 2,
		tradegoods: 0,
		gear: 0,
		mana: 0
	}
};

var iherat = {
	name: "Iherat",
	subtitle: "Manipulating Mindflayer",
	icon: "magician1",
	speed: 3,
	deploy: 4,
	strength: 4,
	maxstrength: 12,
	virtue: 0,
	cost: {
		food: 0,
		lumber: 0,
		stone: 0,
		gold: 5,
		tradegoods: 0,
		gear: 0,
		mana: 0
	}
};

var inusetra = {
	name: "Inusetra",
	subtitle: "Gorgon from the Depths",
	icon: "recruiter3",
	speed: 2,
	deploy: 5,
	strength: 5,
	maxstrength: 10,
	virtue: 0,
	cost: {
		food: 0,
		lumber: 0,
		stone: 3,
		gold: 0,
		tradegoods: 0,
		gear: 0,
		mana: 0
	}
};

var ogilgalog = {
	name: "Ogilgalog",
	subtitle: "Slithering Ooze",
	icon: "scout3",
	speed: 3,
	deploy: 3,
	strength: 3,
	maxstrength: 5,
	virtue: 0,
	cost: {
		food: 2,
		lumber: 0,
		stone: 0,
		gold: 0,
		tradegoods: 0,
		gear: 0,
		mana: 0
	}
};

var jahatri = {
	name: "Jahatri",
	subtitle: "Sworn Cultist",
	icon: "builder2",
	speed: 3,
	deploy: 3,
	strength: 3,
	maxstrength: 5,
	virtue: 0,
	cost: {
		food: 1,
		lumber: 0,
		stone: 0,
		gold: 1,
		tradegoods: 0,
		gear: 0,
		mana: 0
	}
};

var dolomor = {
	name: "Dolomor Darkeye",
	subtitle: "Cunning Manta Pirate",
	icon: "explorer2",
	speed: 3,
	deploy: 6,
	strength: 6,
	maxstrength: 12,
	virtue: 0,
	cost: {
		food: 2,
		lumber: 0,
		stone: 0,
		gold: 3,
		tradegoods: 0,
		gear: 0,
		mana: 0
	}
};

var xionadenyi = {
	name: "Xion-ad-en-Yi",
	subtitle: "Soul Catching Shade",
	icon: "magician3",
	speed: 1,
	deploy: 5,
	strength: 5,
	maxstrength: 8,
	virtue: 0,
	cost: {
		food: 0,
		lumber: 0,
		stone: 0,
		gold: 2,
		tradegoods: 0,
		gear: 0,
		mana: 2
	}
};

var goahlfiesj = {
	name: "Goahl'fiesj",
	subtitle: "Enchanted Anglerfish",
	icon: "magician2",
	speed: 7,
	deploy: 1,
	strength: 1,
	maxstrength: 1,
	virtue: 0,
	cost: {
		food: 0,
		lumber: 0,
		stone: 0,
		gold: 2,
		tradegoods: 0,
		gear: 0,
		mana: 0
	}
};

var starBuilding = {
    name: "Sleeping City",
	type: "free",
    garrison: 4,
	icon: "star",
    foundation: ["ocean"],
	cost: {
		food: 0,
		lumber: 0,
		stone: 0,
		gold: 6,
		tradegoods: 0,
		gear: 0,
		mana: 0,
		relic: 0,
		honor: 0
	},
    limit: -1,
    other: ["Worth 2 City Points","Must be built at least 2 tiles away from any other city or village.","Counts as a city for all intents and purposes.","Must be dedicated to a basic resource."]
};

var moonBuilding = {
    name: "Ritual Hall",
	type: "city",
    garrison: 2,
	icon: "moon",
    foundation: ["ocean"],
	cost: {
		food: 0,
		lumber: 4,
		stone: 0,
		gold: 3,
		tradegoods: 0,
		gear: 0,
		mana: 0,
		relic: 0,
		honor: 0
	},
    limit: 2,
	produce: [{resource: "sleeping", amount: 1}],
    other: ["Produces 1 resource of the type your Sleeping City was dedicated to.", "You may use the move action to move a character on top of a Ritual Hall onto another Ritual Hall.", "Counts as a gatherer for all intents and purposes."]
};

characterlist = [shashioq, raheskah, iherat, inusetra, ogilgalog, jahatri, dolomor, xionadenyi, goahlfiesj];

var factionInfo = [];
factionInfo[0] = "Dwelling in the deep lurk the Deep Ones. They have patiently kept an eye on the races living above the waterline; learning, scheming. The more they learn, the bolder they become, the more they scheme, the naïver the landwalkers seem. Slowly pitting them against each other from the shadowy background. A little betrayal here, a little sabotage there; emperors have fallen over less.";
factionInfo[1] = "From the deep depths of the ocean their sorcerers commune. Their rites and prophecies have revealed to them their destiny; conquering the world above is only the first of many steps to lead them to domination of the vast galaxy in the stars above.";

var factionAbilities = [];
var factionTopics = [];
factionTopics[0] = "Oceanic";
factionTopics[1] = "Mind Flayers";
factionTopics[2] = "Subterfuge";

factionAbilities[factionAbilities.length] = {
	name: "In the Depths Below",
	text: "Characters can move on ocean tiles and be deployed on any ocean tile not adjacent to a character or building owned by another player.",
	topic: factionTopics[0]
};
//hardcode

factionAbilities[factionAbilities.length] = {
	name: "Aquatic Habitat",
	text: "All buildings can only be built on ocean tiles.",
	topic: factionTopics[0]
};
//hardcode

factionAbilities[factionAbilities.length] = {
	name: "Succumbing to the Waves",
	text: "During world building they can remove basic tiles not next to mountains or rivers, turning them into oceans. They can do this equal to 2 times the amount of basic tiles they put down.",
	topic: factionTopics[0],
	time: {phase: "worldbuilding", step: "misctiles"},
	condition: [{type: "musttarget", tile:["plains", "desert", "snow"]}, {type: "hasnotadjacent", tile:["mountain","riverland"]}],
	effects: [{type: "tileplace", tile: ["ocean"]}],
	limit: "2basicplace",
	mandatory: true
};

factionAbilities[factionAbilities.length] = {
	name: "Oceania",
	text: "May place anomalies on oceans.",
	topic: factionTopics[0]
};
//hardcode

factionAbilities[factionAbilities.length] = {
	name: "Beyond Honor",
	text: "The Deep Ones have no honor, and characters won’t leave or have qualms joining them due to honor restrictions.",
	topic: factionTopics[1]
};
//hardcode

factionAbilities[factionAbilities.length] = {
	name: "Mind of their Own",
	text: "Deep Ones characters can’t be employed by other players.",
	topic: factionTopics[1]
};
//hardcode

factionAbilities[factionAbilities.length] = {
	name: "Infection",
	text: "After all players have picked characters, the Deep Ones may write down the name of a character on a secret paper for every other player in the game. Upon those characters entering combat they may reveal their name to have them lose half their strength and be unable to retreat. They may put them in their court when those characters lose a fight.",
	topic: factionTopics[1]
};
//hardcode

factionAbilities[factionAbilities.length] = {
	name: "Cultural Deception",
	text: "If the Deep Ones are in the game the subterfuge cards are added to the tactics deck.",
	topic: factionTopics[2]
};
//hardcode

factionAbilities[factionAbilities.length] = {
	name: "Shielded by the Waves",
	text: "The Deep Ones can’t be targeted by tactics cards.",
	topic: factionTopics[2]
};
//hardcode

factionAbilities[factionAbilities.length] = {
	name: "Inception",
	text: "In every discovery phase they can look through the tactics deck to find a card of their choice and give it to another player.",
	topic: factionTopics[2]
};
//hardcode

factionAbilities[factionAbilities.length] = {
	name: "Inflict Insanity",
	text: "May discard a tactics card as a discovery action to have the player with the most honor lose 1 honor.",
	topic: factionTopics[2]
};
//hardcode

factionAbilities[factionAbilities.length] = JSON.parse(JSON.stringify(buildaction));
var factionbuildings = ["barracks", "university", "road", "wall", "fort", starBuilding.name, moonBuilding.name];
factionAbilities[factionAbilities.length-1].effects[0].building= factionbuildings;

factionAbilities[factionAbilities.length] = {
	name: "Starting Position",
	text: "Place your Sleeping City.",
	time: {phase: "worldbuilding", step: "startingposition"},
	effects: [{type: "buildingplace", building: [moonBuilding.name], cost:"none"}],
	limit: 1,
	mandatory: true
};

factionAbilities[factionAbilities.length] = {
	name: "Place a Gatherer",
	text: "As part of your starting buildings you get a free Ritual Hall adjacent to your Sleeping City.",
	condition: [{type:"haveused", affected:"Starting Position"}],
	time: {phase: "worldbuilding", step: "startingposition"},
	effects: [{type: "buildingplace", building: [starBuilding.name], cost: "none"}],
	limit: 1
};

var DeepOnes = {
	name: "Deep Ones",
	color: "purple",
	offcolor: "black",
	characters: characterlist,
	starthonor: -1,
	factionpicks: 4,
	neutralpicks: 0,
	startingtechnology: [],
	startingbuildings: [moonBuilding.icon, starBuilding.icon],
	allowedbuildings: factionbuildings,
	startingresources: {
		choice: 2,
		food: 0,
		lumber: 0,
		stone: 0,
		gold: 0,
		tradegoods: 0,
		gear: 0,
		mana: 0,
		honor: 0,
		relic: 0
	},
	order: 0,
	star: starBuilding,
	moon: moonBuilding,
	info: factionInfo,
	abilities: factionAbilities,
	topics: factionTopics
}

var hans = {
	name: "Hans",
	subtitle: "Humble and Hardworking Human",
	icon: "builder1",
	speed: 2,
	deploy: 1,
	strength: 1,
	maxstrength: 4,
	virtue: 5,
	cost: {
		food: 3,
		lumber: 0,
		stone: 0,
		gold: 0,
		tradegoods: 0,
		gear: 0,
		mana: 0
	}
};

var steen = {
	name: "Steen",
	subtitle: "Bouldering Golem",
	icon: "builder3",
	speed: 2,
	deploy: 2,
	strength: 2,
	maxstrength: 6,
	virtue: 5,
	cost: {
		food: 0,
		lumber: 0,
		stone: 2,
		gold: 0,
		tradegoods: 0,
		gear: 0,
		mana: 0
	}
};

var bucephalus = {
	name: "Bucephalus",
	subtitle: "Centaur Cavalry Commander",
	icon: "tactician3",
	speed: 4,
	deploy: 6,
	strength: 6,
	maxstrength: 12,
	virtue: 10,
	cost: {
		food: 2,
		lumber: 2,
		stone: 0,
		gold: 0,
		tradegoods: 0,
		gear: 0,
		mana: 0
	}
};

var barendam = {
	name: "Baremdam",
	subtitle: "Righteous Human Crusader",
	icon: "general3",
	speed: 2,
	deploy: 8,
	strength: 8,
	maxstrength: 15,
	virtue: 14,
	cost: {
		food: 2,
		lumber: 0,
		stone: 0,
		gold: 3,
		tradegoods: 0,
		gear: 0,
		mana: 0
	}
};

var goros = {
	name: "Goros",
	subtitle: "Half-Orcen Mercenary Captain",
	icon: "general2",
	speed: 2,
	deploy: 10,
	strength: 10,
	maxstrength: 10,
	virtue: 14,
	cost: {
		food: 0,
		lumber: 0,
		stone: 0,
		gold: 4,
		tradegoods: 0,
		gear: 0,
		mana: 0
	}
};


var horus = {
	name: "Horus",
	subtitle: "Outcast Lion Pharaoh",
	icon: "smith1",
	speed: 2,
	deploy: 4,
	strength: 4,
	maxstrength: 10,
	virtue: 12,
	cost: {
		food: 2,
		lumber: 0,
		stone: 0,
		gold: 2,
		tradegoods: 0,
		gear: 0,
		mana: 0
	}
};

var znort = {
	name: "Znort",
	subtitle: "Meek Kobold",
	icon: "scout2",
	speed: 1,
	deploy: 1,
	strength: 1,
	maxstrength: 1,
	virtue: 12,
	cost: {
		food: 1,
		lumber: 0,
		stone: 0,
		gold: 0,
		tradegoods: 0,
		gear: 0,
		mana: 0
	}
};

var forrow = {
	name: "Forrow",
	subtitle: "Nimble Elven Outrider",
	icon: "scout3",
	speed: 4,
	deploy: 1,
	strength: 1,
	maxstrength: 7,
	virtue: 9,
	cost: {
		food: 1,
		lumber: 1,
		stone: 0,
		gold: 0,
		tradegoods: 0,
		gear: 0,
		mana: 0
	}
};

var ostraria = {
	name: "Ostraria",
	subtitle: "Long-legged Fast-paced Chickenoid",
	icon: "recruiter1",
	speed: 4,
	deploy: 3,
	strength: 3,
	maxstrength: 6,
	virtue: 9,
	cost: {
		food: 3,
		lumber: 1,
		stone: 0,
		gold: 0,
		tradegoods: 0,
		gear: 0,
		mana: 0
	}
};

var izzether = {
	name: "Izz'Ether",
	subtitle: "Mysterious Trader from a Far Land",
	icon: "merchant1",
	speed: 3,
	deploy: 2,
	strength: 2,
	maxstrength: 7,
	virtue: 7,
	cost: {
		food: 0,
		lumber: 0,
		stone: 0,
		gold: 2,
		tradegoods: 0,
		gear: 0,
		mana: 0
	}
};

var sneachy = {
	name: "Sneachy",
	subtitle: "Hooded Ratling",
	icon: "explorer1",
	speed: 3,
	deploy: 3,
	strength: 3,
	maxstrength: 6,
	virtue: 2,
	cost: {
		food: 4,
		lumber: 0,
		stone: 0,
		gold: 0,
		tradegoods: 0,
		gear: 0,
		mana: 0
	}
};

var constellationofioda = {
	name: "Constellation of Ioda",
	subtitle: "Floating Orbs of Mystical Energies",
	icon: "explorer3",
	speed: 0,
	deploy: 0,
	strength: 0,
	maxstrength: 0,
	virtue: 14,
	cost: {
		food: 0,
		lumber: 0,
		stone: 0,
		gold: 0,
		tradegoods: 0,
		gear: 0,
		mana: 0
	}
};

var doropolopolos = {
	name: "Doropolopolos",
	subtitle: "Wise Elephant of Many Years",
	icon: "researcher2",
	speed: 1,
	deploy: 6,
	strength: 6,
	maxstrength: 10,
	virtue: 12,
	cost: {
		food: 5,
		lumber: 0,
		stone: 0,
		gold: 0,
		tradegoods: 0,
		gear: 0,
		mana: 0
	}
};

var torke = {
	name: "Torke",
	subtitle: "Tinkering Goblin",
	icon: "researcher1",
	speed: 2,
	deploy: 2,
	strength: 2,
	maxstrength: 8,
	virtue: 9,
	cost: {
		food: 0,
		lumber: 0,
		stone: 0,
		gold: 2,
		tradegoods: 0,
		gear: 0,
		mana: 0
	}
};

var wimblewhisker = {
	name: "Wimblewhisker",
	subtitle: "Very-long-bearded Gnome",
	icon: "magician3",
	speed: 2,
	deploy: 1,
	strength: 1,
	maxstrength: 6,
	virtue: 9,
	cost: {
		food: 1,
		lumber: 0,
		stone: 0,
		gold: 1,
		tradegoods: 0,
		gear: 0,
		mana: 0
	}
};

var Arachonos = {
	name: "Arachonos",
	subtitle: "Ancient Arachnid Archmage",
	icon: "magician1",
	speed: 1,
	deploy: 2,
	strength: 2,
	maxstrength: 12,
	virtue: 10,
	cost: {
		food: 0,
		lumber: 0,
		stone: 0,
		gold: 2,
		tradegoods: 0,
		gear: 0,
		mana: 2
	}
};

var neutralcharacterlist = [hans, steen, bucephalus, barendam, goros, horus, znort, forrow, ostraria, izzether, sneachy, constellationofioda, doropolopolos, torke, wimblewhisker, Arachonos];

var NeutralFaction = {
	name: "Neutral Characters",
	color: "grey",
	offcolor: "black",
	characters: neutralcharacterlist,
	starthonor: -1,
	factionpicks: 0,
	neutralpicks: 0,
	startingtechnology: [],
	startingbuildings: [],
	allowedbuildings: factionbuildings,
	startingresources: {
		choice: 0,
		food: 0,
		lumber: 0,
		stone: 0,
		gold: 0,
		tradegoods: 0,
		gear: 0,
		mana: 0
	},
	order: 0,
	star: "",
	moon: "",
	info: [],
	abilities: [],
	topics: []
}

var factionlist = [Ethereal, Hanshu, Wanderers, Pride, Beastmen, Archive, Hammers, Syndicate, Children, DeepOnes];
for (var i = 0; i < factionlist.length; i++) {

	var neutralboon = {
		boons: [{type:"Draft Neutral Character", field:"charges",amount: factionlist[i].neutralpicks}]
	};
	factionlist[i].abilities[factionlist[i].abilities.length] = neutralboon;

	factionlist[i].order = i;
}

var observerFaction = {
	order: -1,
	  name: "none",
	  color: "grey",
	  offcolor: "black",
	  characters: [],
	  starthonor: 0,
	  factionpicks: 0,
	  neutralpicks: 0,
	  startingtechnology: [],
	  startingbuildings: [],
	  startingresources: {
		  choice: 0,
		  food: 0,
		  lumber: 0,
		  stone: 0,
		  gold: 0,
		  tradegoods: 0,
		  gear: 0,
		  mana: 0,
	  relic: 0
	}
}


if(!(typeof module === 'undefined')){
	const getObserverfaction =function getObserverfaction (){
		return observerFaction;
	}

	const getFactionlist = function getFactionlist(){
		return factionlist;
	}

	const getNeutralCharacters = function getNeutralCharacters(){
		return neutralcharacterlist;
	}

	const getLumon = function getLumon(){
		return lumon;
	}

	module.exports = {getObserverfaction, getFactionlist, getLumon, getNeutralCharacters}
}

