var loop = require('./game-loop');
var Entity = require('./entity');
var keyboard = require('./keyboard');

var Player = require('./entities/player');

var state;
var frames;
var entities;
var scope;

function start() {
	if (state === 1) {
		return;
	}

	state = 1;
	frames = 0;
	entities = [];

	scope = document.getElementById('game');
	scope.innerHTML = '';

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
		entity.render(scope);
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