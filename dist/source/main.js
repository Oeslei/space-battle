(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
function area(top, right, bottom, left) {
	return {
		top: top || 0,
		right: right || 0,
		bottom: bottom || 0,
		left: left || 0
	};
}

module.exports = area;
},{}],2:[function(require,module,exports){
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
},{"./../area":1,"./../entity":3,"./../game-shared":6,"./../keyboard":7,"./../point2":9,"./../vector2":10}],3:[function(require,module,exports){
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
},{"./game-shared":6,"./point2":9,"./vector2":10}],4:[function(require,module,exports){
var loop = require('./game-loop');
var shared = require('./game-shared');
var area = require('./area');
var keyboard = require('./keyboard');

var Entity = require('./entity');
var Player = require('./entities/player');

var state;
var frames;
var entities;

function start() {
	var world;

	if (state === 1) {
		return;
	}

	state = 1;
	frames = 0;
	entities = [];

	world = document.getElementById('game');
	world.innerHTML = '';

	shared.set('world', world);
	shared.set('worldBounds', area(0, world.offsetWidth, world.offsetHeight, 0));

	addEntity(new Player());

	keyboard.whenPress(keyboard.keys.SPACE, toggleState);
	loop.start(tick);

	console.log('game started');
}

function tick(elapsed) {
	frames++;
	update(elapsed);
	render();
}

function update(elapsed) {
	entities.forEach(function(entity) {
		entity.update(elapsed);
	});

	// Math.floor((Math.random() * 100) + 1);
}

function render() {
	entities.forEach(function(entity) {
		entity.render();
	});
}

function addEntity(entity) {
	if (entity instanceof Entity) {
		entities.push(entity);
	} else {
		throw 'The object given must be an entity';
	}
}

function toggleState() {
	if (state === 1) {
		state = 2;
		loop.pause();

		console.log('game paused');
	} else if (state === 2) {
		state = 1;
		loop.resume();

		console.log('game resumed');
	}
}

module.exports = {
	start: start,
	addEntity: addEntity
};
},{"./area":1,"./entities/player":2,"./entity":3,"./game-loop":5,"./game-shared":6,"./keyboard":7}],5:[function(require,module,exports){
var lastUpdate;
var state;

var onTick;

function start(_onTick) {
	lastUpdate = null;
	state = 1;

	onTick = _onTick;
	tick();
}

function pause() {
	state = 2;
}

function resume() {
	lastUpdate = null;
	state = 1;
	tick();
}

function finish() {
	state = 3;
}

function tick() {
	if (state !== 1) {
		return;
	}

	var now = Date.now();
	var elapsed;

	if (lastUpdate) {
		elapsed = (now - lastUpdate) / 1000;
		onTick(elapsed);
	}

	lastUpdate = now;
	requestAnimationFrame(tick);
}

module.exports = {
	start: start,
	pause: pause,
	resume: resume,
	finish: finish
};
},{}],6:[function(require,module,exports){
var storage = {};

function set(name, value) {
	storage[name] = value;
}

function get(name, defaultValue) {
	if (typeof storage[name] !== 'undefined') {
		return storage[name];
	} else if (typeof defaultValue !== 'undefined') {
		return defaultValue;
	}
}

module.exports = {
	set: set,
	get: get
};
},{}],7:[function(require,module,exports){
var keys = {};
var isPressedMap = [];
var whenPressMap = {};

keys.ESC = 27;
keys.ALT = 18;
keys.CTRL = 17;
keys.SHIFT = 16;
keys.SPACE = 32;

keys.UP = 38;
keys.DOWN = 40;
keys.LEFT = 37;
keys.RIGHT = 39;

keys.A = 65;
keys.B = 66;
keys.C = 67;
keys.D = 68;
keys.E = 69;
keys.F = 70;
keys.G = 71;
keys.H = 72;
keys.I = 73;
keys.J = 74;
keys.K = 75;
keys.L = 76;
keys.M = 77;
keys.N = 78;
keys.O = 79;
keys.P = 80;
keys.Q = 81;
keys.R = 82;
keys.S = 83;
keys.T = 84;
keys.U = 85;
keys.V = 86;
keys.W = 87;
keys.X = 88;
keys.Y = 89;
keys.Z = 90;

function keyDown(event) {
	if (isPressedMap.indexOf(event.keyCode) < 0) {
		isPressedMap.push(event.keyCode);
		keyPress(event);
	}
}

function keyUp(event) {
	var idx = isPressedMap.indexOf(event.keyCode);

	if (idx >= 0) {
		isPressedMap.splice(idx, 1);
	}
}

function keyPress(event) {
	var callbacks = whenPressMap[event.keyCode] || [];

	callbacks.forEach(function(callback) {
		if (callback !== null) {
			callback();
		}
	});
}

function whenPress(keyCode, callback, oneTime) {
	var pos = 0;

	if (!whenPressMap[keyCode]) {
		whenPressMap[keyCode] = [];
	} else {
		pos = whenPressMap[keyCode].length;
	}

	if (oneTime) {
		whenPressMap[keyCode].push(function() {
			whenPressMap[keyCode] = null;
			callback();
		});
	} else {
		whenPressMap[keyCode].push(callback);
	}
}

function isPressed(keyCode) {
	return isPressedMap.indexOf(keyCode) >= 0;
}

document.addEventListener('keydown', keyDown, false);
document.addEventListener('keyup', keyUp, false);

module.exports = {
	keys: keys,
	whenPress: whenPress,
	isPressed: isPressed
};
},{}],8:[function(require,module,exports){
var game = require('./game-engine');
var keyboard = require('./keyboard');

keyboard.whenPress(keyboard.keys.SPACE, game.start, true);
},{"./game-engine":4,"./keyboard":7}],9:[function(require,module,exports){
function point2(x, y) {
	return {
		x: x || 0,
		y: y || 0
	};
}

module.exports = point2;
},{}],10:[function(require,module,exports){
function vector2(x, y) {
	return {
		x: x || 0,
		y: y || 0
	};
}

module.exports = vector2;
},{}]},{},[8])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzb3VyY2UvYXJlYS5qcyIsInNvdXJjZS9lbnRpdGllcy9wbGF5ZXIuanMiLCJzb3VyY2UvZW50aXR5LmpzIiwic291cmNlL2dhbWUtZW5naW5lLmpzIiwic291cmNlL2dhbWUtbG9vcC5qcyIsInNvdXJjZS9nYW1lLXNoYXJlZC5qcyIsInNvdXJjZS9rZXlib2FyZC5qcyIsInNvdXJjZS9tYWluLmpzIiwic291cmNlL3BvaW50Mi5qcyIsInNvdXJjZS92ZWN0b3IyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakdBO0FBQ0E7QUFDQTtBQUNBOztBQ0hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJmdW5jdGlvbiBhcmVhKHRvcCwgcmlnaHQsIGJvdHRvbSwgbGVmdCkge1xyXG5cdHJldHVybiB7XHJcblx0XHR0b3A6IHRvcCB8fCAwLFxyXG5cdFx0cmlnaHQ6IHJpZ2h0IHx8IDAsXHJcblx0XHRib3R0b206IGJvdHRvbSB8fCAwLFxyXG5cdFx0bGVmdDogbGVmdCB8fCAwXHJcblx0fTtcclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBhcmVhOyIsInZhciBzaGFyZWQgPSByZXF1aXJlKCcuLy4uL2dhbWUtc2hhcmVkJyk7XHJcbnZhciBwb2ludDIgPSByZXF1aXJlKCcuLy4uL3BvaW50MicpO1xyXG52YXIgdmVjdG9yMiA9IHJlcXVpcmUoJy4vLi4vdmVjdG9yMicpO1xyXG52YXIgYXJlYSA9IHJlcXVpcmUoJy4vLi4vYXJlYScpO1xyXG52YXIgRW50aXR5ID0gcmVxdWlyZSgnLi8uLi9lbnRpdHknKTtcclxudmFyIGtiID0gcmVxdWlyZSgnLi8uLi9rZXlib2FyZCcpO1xyXG5cclxuZnVuY3Rpb24gUGxheWVyKHgsIHkpIHtcclxuXHRFbnRpdHkuYXBwbHkodGhpcyk7XHJcblxyXG5cdHRoaXMucG9zaXRpb24gPSBwb2ludDIoeCB8fCAwLCB5IHx8IDApO1xyXG5cdHRoaXMubWF4U3BlZWQgPSB2ZWN0b3IyKDM1MCwgMjUwKTtcclxuXHR0aGlzLmJvdW5kcyA9IHNoYXJlZC5nZXQoJ3dvcmxkQm91bmRzJyk7XHJcblx0dGhpcy5hY2NlbGVyYXRpb24gPSAyMDtcclxuXHJcblx0dGhpcy5zcHJpdGUgPSAnZW50aXR5LXBsYXllcic7XHJcblx0dGhpcy53aWR0aCA9IDEwMDtcclxuXHR0aGlzLmhlaWdodCA9IDUwO1xyXG59XHJcblxyXG5QbGF5ZXIucHJvdG90eXBlID0gbmV3IEVudGl0eSgpO1xyXG5QbGF5ZXIucHJvdG90eXBlLmNvbnN0cnVjdCA9IFBsYXllcjtcclxuXHJcblBsYXllci5wcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24oZWxhcHNlZCkge1xyXG5cdHZhciBhY2NlbGVyYXRlID0gdmVjdG9yMigpO1xyXG5cdHZhciBkZWNlbGVyYXRlID0gdmVjdG9yMigpO1xyXG5cclxuXHRpZiAoa2IuaXNQcmVzc2VkKGtiLmtleXMuUklHSFQpIHx8IGtiLmlzUHJlc3NlZChrYi5rZXlzLkQpKSB7XHJcblx0XHRhY2NlbGVyYXRlLnggPSB0aGlzLmFjY2VsZXJhdGlvbjtcclxuXHR9IGVsc2UgaWYgKGtiLmlzUHJlc3NlZChrYi5rZXlzLkxFRlQpIHx8IGtiLmlzUHJlc3NlZChrYi5rZXlzLkEpKSB7XHJcblx0XHRhY2NlbGVyYXRlLnggPSAtdGhpcy5hY2NlbGVyYXRpb247XHJcblx0fSBlbHNlIHtcclxuXHRcdGRlY2VsZXJhdGUueCA9IHRoaXMuYWNjZWxlcmF0aW9uO1xyXG5cdH1cclxuXHJcblx0aWYgKGtiLmlzUHJlc3NlZChrYi5rZXlzLlVQKSB8fCBrYi5pc1ByZXNzZWQoa2Iua2V5cy5XKSkge1xyXG5cdFx0YWNjZWxlcmF0ZS55ID0gLXRoaXMuYWNjZWxlcmF0aW9uO1xyXG5cdH0gZWxzZSBpZiAoa2IuaXNQcmVzc2VkKGtiLmtleXMuRE9XTikgfHwga2IuaXNQcmVzc2VkKGtiLmtleXMuUykpIHtcclxuXHRcdGFjY2VsZXJhdGUueSA9IHRoaXMuYWNjZWxlcmF0aW9uO1xyXG5cdH0gZWxzZSB7XHJcblx0XHRkZWNlbGVyYXRlLnkgPSB0aGlzLmFjY2VsZXJhdGlvbjtcclxuXHR9XHJcblxyXG5cdHRoaXMuYWNjZWxlcmF0ZShhY2NlbGVyYXRlKTtcclxuXHR0aGlzLmRlY2VsZXJhdGUoZGVjZWxlcmF0ZSk7XHJcblxyXG5cdEVudGl0eS5wcm90b3R5cGUudXBkYXRlLmFwcGx5KHRoaXMsIFsgZWxhcHNlZCBdKTtcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gUGxheWVyOyIsInZhciBzaGFyZWQgPSByZXF1aXJlKCcuL2dhbWUtc2hhcmVkJyk7XHJcbnZhciBwb2ludDIgPSByZXF1aXJlKCcuL3BvaW50MicpO1xyXG52YXIgdmVjdG9yMiA9IHJlcXVpcmUoJy4vdmVjdG9yMicpO1xyXG5cclxuZnVuY3Rpb24gRW50aXR5KCkge1xyXG5cdHRoaXMucG9zaXRpb24gPSBwb2ludDIoKTtcclxuXHR0aGlzLnZlbG9jaXR5ID0gdmVjdG9yMigpO1xyXG5cdHRoaXMuYWNjZWxlcmF0aW9uID0gMDtcclxuXHJcblx0dGhpcy5zcHJpdGUgPSAnJztcclxuXHR0aGlzLndpZHRoID0gdGhpcy5oZWlnaHQgPSAwO1xyXG59XHJcblxyXG5FbnRpdHkucHJvdG90eXBlLnVwZGF0ZSA9IGZ1bmN0aW9uKGVsYXBzZWQpIHtcclxuXHR2YXIgZGVjZWxlcmF0ZSA9IHZlY3RvcjIodGhpcy5hY2NlbGVyYXRpb24sIHRoaXMuYWNjZWxlcmF0aW9uKTtcclxuXHJcblx0aWYgKHRoaXMubWF4U3BlZWQpIHtcclxuXHRcdGlmICh0aGlzLm1heFNwZWVkLnggPj0gMCAmJiBNYXRoLmFicyh0aGlzLnZlbG9jaXR5LngpID4gdGhpcy5tYXhTcGVlZC54KSB7XHJcblx0XHRcdHRoaXMudmVsb2NpdHkueCA9IHRoaXMubWF4U3BlZWQueCAqICh0aGlzLnZlbG9jaXR5LnggPj0gMCA/IDEgOiAtMSk7XHJcblx0XHR9XHJcblxyXG5cdFx0aWYgKHRoaXMubWF4U3BlZWQueSA+PSAwICYmIE1hdGguYWJzKHRoaXMudmVsb2NpdHkueSkgPiB0aGlzLm1heFNwZWVkLnkpIHtcclxuXHRcdFx0dGhpcy52ZWxvY2l0eS55ID0gdGhpcy5tYXhTcGVlZC55ICogKHRoaXMudmVsb2NpdHkueSA+PSAwID8gMSA6IC0xKTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdHRoaXMucG9zaXRpb24ueCArPSB0aGlzLnZlbG9jaXR5LnggKiBlbGFwc2VkO1xyXG5cdHRoaXMucG9zaXRpb24ueSArPSB0aGlzLnZlbG9jaXR5LnkgKiBlbGFwc2VkO1xyXG5cclxuXHRpZiAodGhpcy5ib3VuZHMpIHtcclxuXHRcdGlmICh0aGlzLnBvc2l0aW9uLnggPCB0aGlzLmJvdW5kcy5sZWZ0KSB7XHJcblx0XHRcdHRoaXMucG9zaXRpb24ueCA9IHRoaXMuYm91bmRzLmxlZnQ7XHJcblx0XHR9IGVsc2UgaWYgKHRoaXMucG9zaXRpb24ueCA+ICh0aGlzLmJvdW5kcy5yaWdodCAtIHRoaXMud2lkdGgpKSB7XHJcblx0XHRcdHRoaXMucG9zaXRpb24ueCA9IHRoaXMuYm91bmRzLnJpZ2h0IC0gdGhpcy53aWR0aDtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdGRlY2VsZXJhdGUueCA9IDA7XHJcblx0XHR9XHJcblxyXG5cdFx0aWYgKHRoaXMucG9zaXRpb24ueSA8IHRoaXMuYm91bmRzLnRvcCkge1xyXG5cdFx0XHR0aGlzLnBvc2l0aW9uLnkgPSB0aGlzLmJvdW5kcy50b3A7XHJcblx0XHR9IGVsc2UgaWYgKHRoaXMucG9zaXRpb24ueSA+ICh0aGlzLmJvdW5kcy5ib3R0b20gLSB0aGlzLmhlaWdodCkpIHtcclxuXHRcdFx0dGhpcy5wb3NpdGlvbi55ID0gdGhpcy5ib3VuZHMuYm90dG9tIC0gdGhpcy5oZWlnaHQ7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHRkZWNlbGVyYXRlLnkgPSAwO1xyXG5cdFx0fVxyXG5cclxuXHRcdHRoaXMuZGVjZWxlcmF0ZShkZWNlbGVyYXRlKTtcclxuXHR9XHJcbn07XHJcblxyXG5FbnRpdHkucHJvdG90eXBlLmFjY2VsZXJhdGUgPSBmdW5jdGlvbihmb3JjZSkge1xyXG5cdHRoaXMudmVsb2NpdHkueCArPSBmb3JjZS54O1xyXG5cdHRoaXMudmVsb2NpdHkueSArPSBmb3JjZS55O1xyXG59O1xyXG5cclxuRW50aXR5LnByb3RvdHlwZS5kZWNlbGVyYXRlID0gZnVuY3Rpb24oZm9yY2UpIHtcclxuXHRpZiAodGhpcy52ZWxvY2l0eS54ID49IDApIHtcclxuXHRcdHRoaXMudmVsb2NpdHkueCAtPSB0aGlzLnZlbG9jaXR5LnggPCBmb3JjZS54ID8gdGhpcy52ZWxvY2l0eS54IDogZm9yY2UueDtcclxuXHR9IGVsc2Uge1xyXG5cdFx0dGhpcy52ZWxvY2l0eS54ICs9IHRoaXMudmVsb2NpdHkueCA+IGZvcmNlLnggPyB0aGlzLnZlbG9jaXR5LnggOiBmb3JjZS54O1xyXG5cdH1cclxuXHJcblx0aWYgKHRoaXMudmVsb2NpdHkueSA+PSAwKSB7XHJcblx0XHR0aGlzLnZlbG9jaXR5LnkgLT0gdGhpcy52ZWxvY2l0eS55IDwgZm9yY2UueSA/IHRoaXMudmVsb2NpdHkueSA6IGZvcmNlLnk7XHJcblx0fSBlbHNlIHtcclxuXHRcdHRoaXMudmVsb2NpdHkueSArPSB0aGlzLnZlbG9jaXR5LnkgPiBmb3JjZS55ID8gdGhpcy52ZWxvY2l0eS55IDogZm9yY2UueTtcclxuXHR9XHJcbn07XHJcblxyXG5FbnRpdHkucHJvdG90eXBlLnJlbmRlciA9IGZ1bmN0aW9uKCkge1xyXG5cdGlmICh0aGlzLmVudGl0eSkge1xyXG5cdFx0dGhpcy5lbnRpdHkuc3R5bGUudG9wID0gdGhpcy5wb3NpdGlvbi55ICsgJ3B4JztcclxuXHRcdHRoaXMuZW50aXR5LnN0eWxlLmxlZnQgPSB0aGlzLnBvc2l0aW9uLnggKyAncHgnO1xyXG5cdH0gZWxzZSB7XHJcblx0XHR0aGlzLmVudGl0eSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xyXG5cclxuXHRcdHRoaXMuZW50aXR5LmNsYXNzTGlzdC5hZGQoJ2VudGl0eScpO1xyXG5cdFx0dGhpcy5lbnRpdHkuY2xhc3NMaXN0LmFkZCh0aGlzLnNwcml0ZSk7XHJcblxyXG5cdFx0dGhpcy5lbnRpdHkuc3R5bGUud2lkdGggPSB0aGlzLndpZHRoICsgJ3B4JztcclxuXHRcdHRoaXMuZW50aXR5LnN0eWxlLmhlaWdodCA9IHRoaXMuaGVpZ2h0ICsgJ3B4JztcclxuXHJcblx0XHR0aGlzLmVudGl0eS5zdHlsZS50b3AgPSB0aGlzLnBvc2l0aW9uLnkgKyAncHgnO1xyXG5cdFx0dGhpcy5lbnRpdHkuc3R5bGUubGVmdCA9IHRoaXMucG9zaXRpb24ueCArICdweCc7XHJcblxyXG5cdFx0c2hhcmVkLmdldCgnd29ybGQnKS5hcHBlbmRDaGlsZCh0aGlzLmVudGl0eSk7XHJcblx0fVxyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBFbnRpdHk7IiwidmFyIGxvb3AgPSByZXF1aXJlKCcuL2dhbWUtbG9vcCcpO1xyXG52YXIgc2hhcmVkID0gcmVxdWlyZSgnLi9nYW1lLXNoYXJlZCcpO1xyXG52YXIgYXJlYSA9IHJlcXVpcmUoJy4vYXJlYScpO1xyXG52YXIga2V5Ym9hcmQgPSByZXF1aXJlKCcuL2tleWJvYXJkJyk7XHJcblxyXG52YXIgRW50aXR5ID0gcmVxdWlyZSgnLi9lbnRpdHknKTtcclxudmFyIFBsYXllciA9IHJlcXVpcmUoJy4vZW50aXRpZXMvcGxheWVyJyk7XHJcblxyXG52YXIgc3RhdGU7XHJcbnZhciBmcmFtZXM7XHJcbnZhciBlbnRpdGllcztcclxuXHJcbmZ1bmN0aW9uIHN0YXJ0KCkge1xyXG5cdHZhciB3b3JsZDtcclxuXHJcblx0aWYgKHN0YXRlID09PSAxKSB7XHJcblx0XHRyZXR1cm47XHJcblx0fVxyXG5cclxuXHRzdGF0ZSA9IDE7XHJcblx0ZnJhbWVzID0gMDtcclxuXHRlbnRpdGllcyA9IFtdO1xyXG5cclxuXHR3b3JsZCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdnYW1lJyk7XHJcblx0d29ybGQuaW5uZXJIVE1MID0gJyc7XHJcblxyXG5cdHNoYXJlZC5zZXQoJ3dvcmxkJywgd29ybGQpO1xyXG5cdHNoYXJlZC5zZXQoJ3dvcmxkQm91bmRzJywgYXJlYSgwLCB3b3JsZC5vZmZzZXRXaWR0aCwgd29ybGQub2Zmc2V0SGVpZ2h0LCAwKSk7XHJcblxyXG5cdGFkZEVudGl0eShuZXcgUGxheWVyKCkpO1xyXG5cclxuXHRrZXlib2FyZC53aGVuUHJlc3Moa2V5Ym9hcmQua2V5cy5TUEFDRSwgdG9nZ2xlU3RhdGUpO1xyXG5cdGxvb3Auc3RhcnQodGljayk7XHJcblxyXG5cdGNvbnNvbGUubG9nKCdnYW1lIHN0YXJ0ZWQnKTtcclxufVxyXG5cclxuZnVuY3Rpb24gdGljayhlbGFwc2VkKSB7XHJcblx0ZnJhbWVzKys7XHJcblx0dXBkYXRlKGVsYXBzZWQpO1xyXG5cdHJlbmRlcigpO1xyXG59XHJcblxyXG5mdW5jdGlvbiB1cGRhdGUoZWxhcHNlZCkge1xyXG5cdGVudGl0aWVzLmZvckVhY2goZnVuY3Rpb24oZW50aXR5KSB7XHJcblx0XHRlbnRpdHkudXBkYXRlKGVsYXBzZWQpO1xyXG5cdH0pO1xyXG5cclxuXHQvLyBNYXRoLmZsb29yKChNYXRoLnJhbmRvbSgpICogMTAwKSArIDEpO1xyXG59XHJcblxyXG5mdW5jdGlvbiByZW5kZXIoKSB7XHJcblx0ZW50aXRpZXMuZm9yRWFjaChmdW5jdGlvbihlbnRpdHkpIHtcclxuXHRcdGVudGl0eS5yZW5kZXIoKTtcclxuXHR9KTtcclxufVxyXG5cclxuZnVuY3Rpb24gYWRkRW50aXR5KGVudGl0eSkge1xyXG5cdGlmIChlbnRpdHkgaW5zdGFuY2VvZiBFbnRpdHkpIHtcclxuXHRcdGVudGl0aWVzLnB1c2goZW50aXR5KTtcclxuXHR9IGVsc2Uge1xyXG5cdFx0dGhyb3cgJ1RoZSBvYmplY3QgZ2l2ZW4gbXVzdCBiZSBhbiBlbnRpdHknO1xyXG5cdH1cclxufVxyXG5cclxuZnVuY3Rpb24gdG9nZ2xlU3RhdGUoKSB7XHJcblx0aWYgKHN0YXRlID09PSAxKSB7XHJcblx0XHRzdGF0ZSA9IDI7XHJcblx0XHRsb29wLnBhdXNlKCk7XHJcblxyXG5cdFx0Y29uc29sZS5sb2coJ2dhbWUgcGF1c2VkJyk7XHJcblx0fSBlbHNlIGlmIChzdGF0ZSA9PT0gMikge1xyXG5cdFx0c3RhdGUgPSAxO1xyXG5cdFx0bG9vcC5yZXN1bWUoKTtcclxuXHJcblx0XHRjb25zb2xlLmxvZygnZ2FtZSByZXN1bWVkJyk7XHJcblx0fVxyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHtcclxuXHRzdGFydDogc3RhcnQsXHJcblx0YWRkRW50aXR5OiBhZGRFbnRpdHlcclxufTsiLCJ2YXIgbGFzdFVwZGF0ZTtcclxudmFyIHN0YXRlO1xyXG5cclxudmFyIG9uVGljaztcclxuXHJcbmZ1bmN0aW9uIHN0YXJ0KF9vblRpY2spIHtcclxuXHRsYXN0VXBkYXRlID0gbnVsbDtcclxuXHRzdGF0ZSA9IDE7XHJcblxyXG5cdG9uVGljayA9IF9vblRpY2s7XHJcblx0dGljaygpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBwYXVzZSgpIHtcclxuXHRzdGF0ZSA9IDI7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHJlc3VtZSgpIHtcclxuXHRsYXN0VXBkYXRlID0gbnVsbDtcclxuXHRzdGF0ZSA9IDE7XHJcblx0dGljaygpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBmaW5pc2goKSB7XHJcblx0c3RhdGUgPSAzO1xyXG59XHJcblxyXG5mdW5jdGlvbiB0aWNrKCkge1xyXG5cdGlmIChzdGF0ZSAhPT0gMSkge1xyXG5cdFx0cmV0dXJuO1xyXG5cdH1cclxuXHJcblx0dmFyIG5vdyA9IERhdGUubm93KCk7XHJcblx0dmFyIGVsYXBzZWQ7XHJcblxyXG5cdGlmIChsYXN0VXBkYXRlKSB7XHJcblx0XHRlbGFwc2VkID0gKG5vdyAtIGxhc3RVcGRhdGUpIC8gMTAwMDtcclxuXHRcdG9uVGljayhlbGFwc2VkKTtcclxuXHR9XHJcblxyXG5cdGxhc3RVcGRhdGUgPSBub3c7XHJcblx0cmVxdWVzdEFuaW1hdGlvbkZyYW1lKHRpY2spO1xyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHtcclxuXHRzdGFydDogc3RhcnQsXHJcblx0cGF1c2U6IHBhdXNlLFxyXG5cdHJlc3VtZTogcmVzdW1lLFxyXG5cdGZpbmlzaDogZmluaXNoXHJcbn07IiwidmFyIHN0b3JhZ2UgPSB7fTtcclxuXHJcbmZ1bmN0aW9uIHNldChuYW1lLCB2YWx1ZSkge1xyXG5cdHN0b3JhZ2VbbmFtZV0gPSB2YWx1ZTtcclxufVxyXG5cclxuZnVuY3Rpb24gZ2V0KG5hbWUsIGRlZmF1bHRWYWx1ZSkge1xyXG5cdGlmICh0eXBlb2Ygc3RvcmFnZVtuYW1lXSAhPT0gJ3VuZGVmaW5lZCcpIHtcclxuXHRcdHJldHVybiBzdG9yYWdlW25hbWVdO1xyXG5cdH0gZWxzZSBpZiAodHlwZW9mIGRlZmF1bHRWYWx1ZSAhPT0gJ3VuZGVmaW5lZCcpIHtcclxuXHRcdHJldHVybiBkZWZhdWx0VmFsdWU7XHJcblx0fVxyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHtcclxuXHRzZXQ6IHNldCxcclxuXHRnZXQ6IGdldFxyXG59OyIsInZhciBrZXlzID0ge307XHJcbnZhciBpc1ByZXNzZWRNYXAgPSBbXTtcclxudmFyIHdoZW5QcmVzc01hcCA9IHt9O1xyXG5cclxua2V5cy5FU0MgPSAyNztcclxua2V5cy5BTFQgPSAxODtcclxua2V5cy5DVFJMID0gMTc7XHJcbmtleXMuU0hJRlQgPSAxNjtcclxua2V5cy5TUEFDRSA9IDMyO1xyXG5cclxua2V5cy5VUCA9IDM4O1xyXG5rZXlzLkRPV04gPSA0MDtcclxua2V5cy5MRUZUID0gMzc7XHJcbmtleXMuUklHSFQgPSAzOTtcclxuXHJcbmtleXMuQSA9IDY1O1xyXG5rZXlzLkIgPSA2Njtcclxua2V5cy5DID0gNjc7XHJcbmtleXMuRCA9IDY4O1xyXG5rZXlzLkUgPSA2OTtcclxua2V5cy5GID0gNzA7XHJcbmtleXMuRyA9IDcxO1xyXG5rZXlzLkggPSA3Mjtcclxua2V5cy5JID0gNzM7XHJcbmtleXMuSiA9IDc0O1xyXG5rZXlzLksgPSA3NTtcclxua2V5cy5MID0gNzY7XHJcbmtleXMuTSA9IDc3O1xyXG5rZXlzLk4gPSA3ODtcclxua2V5cy5PID0gNzk7XHJcbmtleXMuUCA9IDgwO1xyXG5rZXlzLlEgPSA4MTtcclxua2V5cy5SID0gODI7XHJcbmtleXMuUyA9IDgzO1xyXG5rZXlzLlQgPSA4NDtcclxua2V5cy5VID0gODU7XHJcbmtleXMuViA9IDg2O1xyXG5rZXlzLlcgPSA4Nztcclxua2V5cy5YID0gODg7XHJcbmtleXMuWSA9IDg5O1xyXG5rZXlzLlogPSA5MDtcclxuXHJcbmZ1bmN0aW9uIGtleURvd24oZXZlbnQpIHtcclxuXHRpZiAoaXNQcmVzc2VkTWFwLmluZGV4T2YoZXZlbnQua2V5Q29kZSkgPCAwKSB7XHJcblx0XHRpc1ByZXNzZWRNYXAucHVzaChldmVudC5rZXlDb2RlKTtcclxuXHRcdGtleVByZXNzKGV2ZW50KTtcclxuXHR9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGtleVVwKGV2ZW50KSB7XHJcblx0dmFyIGlkeCA9IGlzUHJlc3NlZE1hcC5pbmRleE9mKGV2ZW50LmtleUNvZGUpO1xyXG5cclxuXHRpZiAoaWR4ID49IDApIHtcclxuXHRcdGlzUHJlc3NlZE1hcC5zcGxpY2UoaWR4LCAxKTtcclxuXHR9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGtleVByZXNzKGV2ZW50KSB7XHJcblx0dmFyIGNhbGxiYWNrcyA9IHdoZW5QcmVzc01hcFtldmVudC5rZXlDb2RlXSB8fCBbXTtcclxuXHJcblx0Y2FsbGJhY2tzLmZvckVhY2goZnVuY3Rpb24oY2FsbGJhY2spIHtcclxuXHRcdGlmIChjYWxsYmFjayAhPT0gbnVsbCkge1xyXG5cdFx0XHRjYWxsYmFjaygpO1xyXG5cdFx0fVxyXG5cdH0pO1xyXG59XHJcblxyXG5mdW5jdGlvbiB3aGVuUHJlc3Moa2V5Q29kZSwgY2FsbGJhY2ssIG9uZVRpbWUpIHtcclxuXHR2YXIgcG9zID0gMDtcclxuXHJcblx0aWYgKCF3aGVuUHJlc3NNYXBba2V5Q29kZV0pIHtcclxuXHRcdHdoZW5QcmVzc01hcFtrZXlDb2RlXSA9IFtdO1xyXG5cdH0gZWxzZSB7XHJcblx0XHRwb3MgPSB3aGVuUHJlc3NNYXBba2V5Q29kZV0ubGVuZ3RoO1xyXG5cdH1cclxuXHJcblx0aWYgKG9uZVRpbWUpIHtcclxuXHRcdHdoZW5QcmVzc01hcFtrZXlDb2RlXS5wdXNoKGZ1bmN0aW9uKCkge1xyXG5cdFx0XHR3aGVuUHJlc3NNYXBba2V5Q29kZV0gPSBudWxsO1xyXG5cdFx0XHRjYWxsYmFjaygpO1xyXG5cdFx0fSk7XHJcblx0fSBlbHNlIHtcclxuXHRcdHdoZW5QcmVzc01hcFtrZXlDb2RlXS5wdXNoKGNhbGxiYWNrKTtcclxuXHR9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGlzUHJlc3NlZChrZXlDb2RlKSB7XHJcblx0cmV0dXJuIGlzUHJlc3NlZE1hcC5pbmRleE9mKGtleUNvZGUpID49IDA7XHJcbn1cclxuXHJcbmRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBrZXlEb3duLCBmYWxzZSk7XHJcbmRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2tleXVwJywga2V5VXAsIGZhbHNlKTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0ge1xyXG5cdGtleXM6IGtleXMsXHJcblx0d2hlblByZXNzOiB3aGVuUHJlc3MsXHJcblx0aXNQcmVzc2VkOiBpc1ByZXNzZWRcclxufTsiLCJ2YXIgZ2FtZSA9IHJlcXVpcmUoJy4vZ2FtZS1lbmdpbmUnKTtcclxudmFyIGtleWJvYXJkID0gcmVxdWlyZSgnLi9rZXlib2FyZCcpO1xyXG5cclxua2V5Ym9hcmQud2hlblByZXNzKGtleWJvYXJkLmtleXMuU1BBQ0UsIGdhbWUuc3RhcnQsIHRydWUpOyIsImZ1bmN0aW9uIHBvaW50Mih4LCB5KSB7XHJcblx0cmV0dXJuIHtcclxuXHRcdHg6IHggfHwgMCxcclxuXHRcdHk6IHkgfHwgMFxyXG5cdH07XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gcG9pbnQyOyIsImZ1bmN0aW9uIHZlY3RvcjIoeCwgeSkge1xyXG5cdHJldHVybiB7XHJcblx0XHR4OiB4IHx8IDAsXHJcblx0XHR5OiB5IHx8IDBcclxuXHR9O1xyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHZlY3RvcjI7Il19
