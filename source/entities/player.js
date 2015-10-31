var shared = require('./../game-shared');
var point2 = require('./../point2');
var vector2 = require('./../vector2');
var area = require('./../area');
var Entity = require('./../entity');
var kb = require('./../keyboard');

function Player(x, y) {
	Entity.apply(this);

	this.position = point2(x || 0, y || 0);
	this.maxSpeed = vector2(350, 250);
	this.bounds = shared.get('worldBounds');
	this.acceleration = 20;

	this.sprite = 'entity-player';
	this.width = 100;
	this.height = 50;
}

Player.prototype = new Entity();
Player.prototype.construct = Player;

Player.prototype.update = function(elapsed) {
	var accelerate = vector2();
	var decelerate = vector2();

	if (kb.isPressed(kb.keys.RIGHT) || kb.isPressed(kb.keys.D)) {
		accelerate.x = this.acceleration;
	} else if (kb.isPressed(kb.keys.LEFT) || kb.isPressed(kb.keys.A)) {
		accelerate.x = -this.acceleration;
	} else {
		decelerate.x = this.acceleration;
	}

	if (kb.isPressed(kb.keys.UP) || kb.isPressed(kb.keys.W)) {
		accelerate.y = -this.acceleration;
	} else if (kb.isPressed(kb.keys.DOWN) || kb.isPressed(kb.keys.S)) {
		accelerate.y = this.acceleration;
	} else {
		decelerate.y = this.acceleration;
	}

	this.accelerate(accelerate);
	this.decelerate(decelerate);

	Entity.prototype.update.apply(this, [ elapsed ]);
};

module.exports = Player;