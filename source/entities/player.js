var Entity = require('./../entity');
var point2 = require('./../point2');
var vector2 = require('./../vector2');
var kb = require('./../keyboard');

function Player(x, y) {
	Entity.apply(this);

	this.position = point2(x || 0, y || 0);
	this.maxSpeed = vector2(350, 250);

	this.sprite = 'entity-player';
	this.width = 100;
	this.height = 50;
}

Player.prototype = new Entity();
Player.prototype.construct = Player;

Player.prototype.update = function(elapsed) {
	var acceleration = 20;
	var accelerate = vector2();
	var decelerate = vector2();

	if (kb.isPressed(kb.keys.RIGHT) || kb.isPressed(kb.keys.D)) {
		accelerate.x = acceleration;
	} else if (kb.isPressed(kb.keys.LEFT) || kb.isPressed(kb.keys.A)) {
		accelerate.x = -acceleration;
	} else {
		decelerate.x = acceleration;
	}

	if (kb.isPressed(kb.keys.UP) || kb.isPressed(kb.keys.W)) {
		accelerate.y = -acceleration;
	} else if (kb.isPressed(kb.keys.DOWN) || kb.isPressed(kb.keys.S)) {
		accelerate.y = acceleration;
	} else {
		decelerate.y = acceleration;
	}

	this.accelerate(accelerate);
	this.decelerate(decelerate);

	Entity.prototype.update.apply(this, [ elapsed ]);
};

module.exports = Player;