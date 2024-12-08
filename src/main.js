// debug with extreme prejudice
"use strict"

let config = {
	parent: 'phaser-game',
	type: Phaser.CANVAS,
	width: 1280/2,
	height: 800/2,
	zoom: 1.5,
	autoCenter: true,
	render: {
		pixelArt: true 		// prevent pixel art from getting blurred when scaled
	},
	scene: [Demo]
}

const game = new Phaser.Game(config);