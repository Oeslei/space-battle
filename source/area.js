function area(top, right, bottom, left) {
	return {
		top: top || 0,
		right: right || 0,
		bottom: bottom || 0,
		left: left || 0
	};
}

module.exports = area;