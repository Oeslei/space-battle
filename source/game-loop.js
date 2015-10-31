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