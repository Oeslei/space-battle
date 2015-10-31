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