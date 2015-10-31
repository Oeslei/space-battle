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