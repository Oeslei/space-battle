var loop = require('./game-loop');

var entities;

function start() {
	entities = [];

	loop.start(tick);
}

function tick(elapsed) {
	update(elapsed);
	render();
}

function update(elapsed) {

}

function render() {

}

module.exports = {
	start: start
};