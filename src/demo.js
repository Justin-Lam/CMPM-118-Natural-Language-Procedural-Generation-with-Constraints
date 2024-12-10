class Demo extends Phaser.Scene
{
	TILE_SIZE = 16;		// in pixels
	MAP_WIDTH = 40;		// in tiles
	MAP_HEIGHT = 25;	// in tiles

	STRUCTURE_TYPES = [
		{
			name: "house",
			tileIDs: [
				49, 50, 51, 52, 53, 54, 55, 56,
				61, 62, 63, 64, 65, 66, 67, 68,
				73, 74, 75, 76, 77, 78, 79, 80,
				85, 86, 87, 88, 89, 90, 91, 92
			],
			features: {
				"archway": [75, 79],
				"chimney": [52, 56],
				"dormer": [64, 68],
				"door": [86, 87, 88, 90, 91, 92],
				"window": [85, 89],
			}
		},
		{
			name: "fence",
			tileIDs: [
				45, 46, 47, 48, 
				57, 59, 60, 
				69, 70, 71, 72, 
				81, 82, 83
			]
		},
		{
			name: "forest",
			tileIDs: [
				4, 5, 7, 8, 9, 10, 11, 12,
				16, 17, 18, 19, 20, 21, 22, 23, 24, 
				28, 29, 30, 31, 32, 33, 34, 35, 36,
				107, 95
			],
			features: {
				"log": [107],
				"behive": [95],
				"mushroom": [30],
				"sprout": [18]
			}
		}
	];

	DIRECTIONS = [
		{ x: 0, y: -1 }, // up
		{ x: 0, y: 1 },  // down
		{ x: -1, y: 0 }, // left
		{ x: 1, y: 0 }   // right
	];

	MIN_STRUCTURE_SIZE = 3;	// in tiles

	constructor() {
		super("demoScene");
	}

	preload()
	{
		this.load.setPath("./assets/");
		this.load.image("tilemap_tiles", "tilemap_packed.png");                   // packed tilemap
		this.load.tilemapTiledJSON("three-farmhouses", "three-farmhouses.tmj");   // tilemap in JSON
	}

	create()
	{
		this.createMultiLayerMap();		// easier to understand visually for humans; displayed initially
		this.createSingleLayerMap();	// easier to understand visually for computers

		this.getWorldFacts();
		console.log("Map structures (world facts database):");
		console.log(this.structures);

		this.setInput();
		this.displayControls();
	}

	createMultiLayerMap() {
		// Create a new tilemap which uses 16x16 tiles, and is 40 tiles wide and 25 tiles tall
		this.multiLayerMap = this.add.tilemap("three-farmhouses", this.TILE_SIZE, this.TILE_SIZE, this.MAP_HEIGHT, this.MAP_WIDTH);

		// Add a tileset to the map
		this.tileset = this.multiLayerMap.addTilesetImage("kenney-tiny-town", "tilemap_tiles");

		// Create the layers
		this.groundLayer = this.multiLayerMap.createLayer("Ground-n-Walkways", this.tileset, 0, 0);
		this.treesLayer = this.multiLayerMap.createLayer("Trees-n-Bushes", this.tileset, 0, 0);
		this.housesLayer = this.multiLayerMap.createLayer("Houses-n-Fences", this.tileset, 0, 0);
	}

	createSingleLayerMap() {
		// Initialize data
		this.singleLayerMapData = [];
		for (let y = 0; y < this.MAP_HEIGHT; y++) {
			this.singleLayerMapData[y] = [];
		}

		// Populate data
		for (let y = 0; y < this.MAP_HEIGHT; y++) {
			for (let x = 0; x < this.MAP_WIDTH; x++) {

				this.singleLayerMapData[y][x] = this.groundLayer.layer.data[y][x].index;

				if (this.treesLayer.layer.data[y][x].index > 0) {
					this.singleLayerMapData[y][x] = this.treesLayer.layer.data[y][x].index;
				}

				if (this.housesLayer.layer.data[y][x].index > 0) {
					this.singleLayerMapData[y][x] = this.housesLayer.layer.data[y][x].index;
				}
			}
		}

		// Make map
		this.singleLayerMap = this.make.tilemap({
			data: this.singleLayerMapData,
			tileWidth: this.TILE_SIZE,
			tileHeight: this.TILE_SIZE
		});
		this.combinedLayer = this.singleLayerMap.createLayer(0, this.tileset);
		this.combinedLayer.setVisible(false);	// hidden initially
	}

	getWorldFacts() {
		// Initialize
		this.structures = [];

		// Populate
		for (const type of this.STRUCTURE_TYPES) {
			for (const [index, positionArray] of this.getStructures(this.singleLayerMapData, type.tileIDs).entries()) {
				const structure = {
					type: type.name,
					id: index,
					boundingBox: this.getBoundingBox(positionArray),
					descriptions: this.generateDescriptions(this.singleLayerMapData, positionArray, type)	// to be implemented
				};
				this.structures.push(structure);
			}
		}
	}

	getStructures(mapData, structureTiles) {
		// visitedTiles = a copy of mapData where each elem is a bool initialized to false
		const visitedTiles = Array.from({ length: mapData.length }, () => Array(mapData[0].length).fill(false));
		const structures = [];
	
		for (let y = 0; y < mapData.length; y++) {
			for (let x = 0; x < mapData[0].length; x++) {
				
				// Skip if empty or already visited tiles
				if (mapData[y][x] === 0 || visitedTiles[y][x]) continue;
	
				// Flood fill to find connected structure
				const structure = this.floodFill(mapData, x, y, visitedTiles, structureTiles);
	
				// Store structure if it meets criteria
				if (structure.length > this.MIN_STRUCTURE_SIZE) {
					structures.push(structure);
				}
			}
		}
	
		return structures;
	}

	floodFill(mapData, startX, startY, visitedTiles, structureTiles) {
		const structure = [];
		const stack = [{ x: startX, y: startY }];
	
		while (stack.length > 0) {
			const { x, y } = stack.pop();

			// Skip if:
			if (
				x < 0 || y < 0 || x >= mapData[0].length || y >= mapData.length || 	// out of bounds
				visitedTiles[y][x] ||												// already visited tile
				structureTiles.findIndex((elem) => elem === mapData[y][x]) === -1	// tile is not a structure tile
			) {
				continue;
			}
	
			// Mark as visited and add to structure
			visitedTiles[y][x] = true;
			structure.push({ x, y });
	
			// Add neighbors to stack
			for (const dir of this.DIRECTIONS) {
				stack.push({ x: x + dir.x, y: y + dir.y });
			}
		}
	
		return structure;
	}

	getBoundingBox(structure) {
		let minX = structure[0].x;
		let maxX = structure[0].x;
		let minY = structure[0].y;
		let maxY = structure[0].y;

		for (const { x, y } of structure) {
			if (x < minX) minX = x;
			else if (x > maxX) maxX = x;
			if (y < minY) minY = y;
			else if (y > maxY) maxY = y;
		}

		return {
			topLeft: { minX, minY },
			bottomRight: { maxX, maxY }
		};
	}

	generateDescriptions(mapData, positions, type){
		let descriptions = [];
		let features = type.features;

		// descripe position on map
		let mapZone = this.getMapZone(positions[0]);
		// ^ this is using basically a random tile of the structure to determine what zone the structure is in i believe?
		// i think we should consider calculating the center of the structure's bounding box and use that instead
		descriptions.push(`${type.name} at ${mapZone} of map`)

		// describe features
		for(let featureType in features){
			let featureCount = 0;
			for (let {x, y} of positions){ // check for a feature at each position (coord)
				if(features[featureType].includes(mapData[y][x])){
					featureCount++;
				}
			}
			if(featureCount > 0){ 
				if(featureCount > 1){ featureType += "s" } 	// make feature type plural
				descriptions.push(`${mapZone} ${type.name} has ${featureCount} ${featureType}`)
			}
		}

		// TODO: describe structure position in relation to other structures?
		// TODO: describe primary color?

		return descriptions;
	}

	getMapZone(coords){
		let horizontalSliceSize = this.MAP_HEIGHT / 3;	// top, center, bottom
		let verticalSliceSize = this.MAP_WIDTH / 3;		// right, center, left

		let {x, y} = coords;
		let mapZone = "";

		// find horizonal zone
		if(y < horizontalSliceSize){ 
			mapZone = "top"; 
		} else if(y < 2 * horizontalSliceSize){ 
			mapZone = "center"; 
		} else{ 
			mapZone = "bottom"; 
		}

		// find vertical zone
		if(x < verticalSliceSize){ 
			mapZone += " left"; 
		} else if(x < 2 * verticalSliceSize && mapZone !== "center"){ 
			mapZone += " center"; 
		} else{ 
			mapZone += " right"; 
		}

		return mapZone;
	}
	
	// not currently in use (debug util)
	/*
	printLayer(layer){
		let print = ""
		for(const row of layer){
			for(const i of row){
				print += `${i}`.padStart(2, " ");
				print += ` `
			}
			print += '\n'
		}
		return print;
	}
	*/

	setInput() {
		this.swapMapKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.M);
		this.swapMapKey.on("down", () => {
			this.groundLayer.setVisible(!this.groundLayer.visible);
			this.treesLayer.setVisible(!this.treesLayer.visible);
			this.housesLayer.setVisible(!this.housesLayer.visible);
			this.combinedLayer.setVisible(!this.combinedLayer.visible);
		});
	}

	displayControls() {
		document.getElementById("description").innerHTML = `
		<h2>Controls</h2>
		Swap maps: M
		`;
	}
}