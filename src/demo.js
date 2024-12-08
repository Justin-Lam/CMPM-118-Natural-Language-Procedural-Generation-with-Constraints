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
		this.createMultiLayerMap();		// looks good to humans
		this.createSingleLayerMap();	// looks good to computers
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