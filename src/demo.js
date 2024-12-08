class Demo extends Phaser.Scene
{
	TILE_SIZE = 16;		// in pixels
	MAP_WIDTH = 40;		// in tiles
	MAP_HEIGHT = 25;	// in tiles

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
		this.createMultiLayerMap();		// easier to understand for humans
		this.createSingleLayerMap();	// easier to understand for computers

		// find houses
		let houseTiles = [
			49, 50, 51, 52, 53, 54, 55, 56,
			61, 62, 63, 64, 65, 66, 67, 68,
			73, 74, 75, 76, 77, 78, 79, 80,
			85, 86, 87, 88, 89, 90, 91, 92
		];
		let houses = this.findStructures(this.singleLayerMapData, houseTiles);
		console.log("houses", houses)

		// find fences
		let fenceTiles = [
			45, 46, 47, 48, 
			57, 59, 60, 
			69, 70, 71, 72, 
			81, 82, 83
		];
		let fences = this.findStructures(this.singleLayerMapData, fenceTiles);
		console.log("fences", fences)

		// find forest
		let forestTiles = [
			4, 5, 6, 7, 8, 9, 10, 11, 12, 
			16, 17, 18, 19, 20, 21, 22, 23, 24, 
			28, 29, 30, 31, 32, 33, 34, 35, 36,
			107, 95
		];
		let forests = this.findStructures(this.singleLayerMapData, forestTiles);
		console.log("forests", forests)

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

	findStructures(mapData, targetStructure) {
		const visited = Array.from({ length: mapData.length }, () => Array(mapData[0].length).fill(false));
		const structures = [];
	
		for (let y = 0; y < mapData.length; y++) {
			for (let x = 0; x < mapData[0].length; x++) {
				// Skip empty or already visited tiles
				if (mapData[y][x] === 0 || visited[y][x]) continue;
	
				// Flood fill to find connected structure
				const structure = this.floodFill(mapData, x, y, visited, targetStructure);
	
				// Store structure if it meets criteria
				if (structure.length > 3) {
					structures.push(structure);
				}
			}
		}
	
		return structures;
	}

	floodFill(mapData, startX, startY, visited, target) {
		const structure = [];
		const stack = [{ x: startX, y: startY }];
		const directions = [
			{ x: 0, y: -1 }, // up
			{ x: 0, y: 1 },  // down
			{ x: -1, y: 0 }, // left
			{ x: 1, y: 0 }   // right
		];
	
		while (stack.length > 0) {
			const { x, y } = stack.pop();
			// Skip if already visited or out of bounds
			if (
				x < 0 || y < 0 || 
				x >= mapData[0].length || y >= mapData.length || 
				visited[y][x] || /*mapData[y][x] !== tileIndex ||*/
				target.findIndex((elem) => elem === mapData[y][x]) === -1
			) {
				continue;
			}
	
			// Mark as visited and add to structure
			visited[y][x] = true;
			structure.push({ x, y });
	
			// Add neighbors to the stack
			for (const dir of directions) {
				stack.push({ x: x + dir.x, y: y + dir.y });
			}
		}
	
		return structure;
	}
	

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
		Swap visible map: M
		`;
	}
}