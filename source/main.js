var game = require('./game-engine');
var keyboard = require('./keyboard');

keyboard.whenPress(keyboard.keys.SPACE, game.start, true);