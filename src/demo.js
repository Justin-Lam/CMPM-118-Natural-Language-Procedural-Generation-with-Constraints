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
		this.load.image("tilemap_tiles", "tilemap_packed.png");                   // Packed tilemap
		this.load.tilemapTiledJSON("three-farmhouses", "three-farmhouses.tmj");   // Tilemap in JSON
	}

	create()
	{

	}

	update()
	{
		// Create a new tilemap which uses 16x16 tiles, and is 40 tiles wide and 25 tiles tall
		this.map = this.add.tilemap("three-farmhouses", this.TILE_SIZE, this.TILE_SIZE, this.MAP_HEIGHT, this.MAP_WIDTH);

		// Add a tileset to the map
		this.tileset = this.map.addTilesetImage("kenney-tiny-town", "tilemap_tiles");

		// Create the layers
		this.groundLayer = this.map.createLayer("Ground-n-Walkways", this.tileset, 0, 0);
		this.treesLayer = this.map.createLayer("Trees-n-Bushes", this.tileset, 0, 0);
		this.housesLayer = this.map.createLayer("Houses-n-Fences", this.tileset, 0, 0);
	}
}