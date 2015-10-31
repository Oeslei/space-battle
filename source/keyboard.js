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