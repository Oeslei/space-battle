var shared = require('./game-shared');
var point2 = require('./point2');
var vector2 = require('./vector2');

function Entity() {
	this.position = point2();
	this.velocity = vector2();
	this.acceleration = 0;

	this.sprite = '';
	this.width = this.height = 0;
}

Entity.prototype.update = function(elapsed) {
	var decelerate = vector2(this.acceleration, this.acceleration);

	if (this.maxSpeed) {
		if (this.maxSpeed.x >= 0 && Math.abs(this.velocity.x) > this.maxSpeed.x) {
			this.velocity.x = this.maxSpeed.x * (this.velocity.x >= 0 ? 1 : -1);
		}

		if (this.maxSpeed.y >= 0 && Math.abs(this.velocity.y) > this.maxSpeed.y) {
			this.velocity.y = this.maxSpeed.y * (this.velocity.y >= 0 ? 1 : -1);
		}
	}

	this.position.x += this.velocity.x * elapsed;
	this.position.y += this.velocity.y * elapsed;

	if (this.bounds) {
		if (this.position.x < this.bounds.left) {
			this.position.x = this.bounds.left;
		} else if (this.position.x > (this.bounds.right - this.width)) {
			this.position.x = this.bounds.right - this.width;
		} else {
			decelerate.x = 0;
		}

		if (this.position.y < this.bounds.top) {
			this.position.y = this.bounds.top;
		} else if (this.position.y > (this.bounds.bottom - this.height)) {
			this.position.y = this.bounds.bottom - this.height;
		} else {
			decelerate.y = 0;
		}

		this.decelerate(decelerate);
	}
};

Entity.prototype.accelerate = function(force) {
	this.velocity.x += force.x;
	this.velocity.y += force.y;
};

Entity.prototype.decelerate = function(force) {
	if (this.velocity.x >= 0) {
		this.velocity.x -= this.velocity.x < force.x ? this.velocity.x : force.x;
	} else {
		this.velocity.x += this.velocity.x > force.x ? this.velocity.x : force.x;
	}

	if (this.velocity.y >= 0) {
		this.velocity.y -= this.velocity.y < force.y ? this.velocity.y : force.y;
	} else {
		this.velocity.y += this.velocity.y > force.y ? this.velocity.y : force.y;
	}
};

Entity.prototype.render = function() {
	if (this.entity) {
		this.entity.style.top = this.position.y + 'px';
		this.entity.style.left = this.position.x + 'px';
	} else {
		this.entity = document.createElement('div');

		this.entity.classList.add('entity');
		this.entity.classList.add(this.sprite);

		this.entity.style.width = this.width + 'px';
		this.entity.style.height = this.height + 'px';

		this.entity.style.top = this.position.y + 'px';
		this.entity.style.left = this.position.x + 'px';

		shared.get('world').appendChild(this.entity);
	}
};

module.exports = Entity;