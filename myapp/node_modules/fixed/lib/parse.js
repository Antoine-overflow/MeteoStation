module.exports = function (data) {
	var spec = this.spec;

	if (!(data instanceof Buffer))
		data = new Buffer(data);

	if (data.toString(spec.encoding, data.length - spec.recordEnding.length) === spec.recordEnding)
		data = data.slice(0, data.length - spec.recordEnding.length);

	if (data.length > spec.length)
		throw new Error('invalid record - unexpected length');

	var output = {};

	spec.fields.forEach(function (field) {
		if (field.required && data.length < field.endIndex)
			throw new Error('field missing: ' + field.key);

		var value = data.toString(spec.encoding, field.startIndex, field.endIndex);

		value = value.trim();
		value = transformValue(value, field);

		if (typeof value === 'string' && value.length === 0 && !field.required)
			value = null;

		output[field.key] = value;
	});

	return output;
};

function transformValue(value, field) {
	function err(msg) {
		if (!msg)
			msg = 'invalid';
		return new Error(['value is', msg, 'for field', field.key, '\n', value].join(' '));
	}

	switch (field.type) {
		case 'string':
			return value;

		case 'integer':
			if (value === null || !value.length)
				return null;
			if (!value.match(/^[0-9]+$/))
				throw err('not an integer');
			return parseInt(value, 10);

		case 'boolean':
			if (value === field.trueValue)
				return true;
			if (value === field.falseValue)
				return false;
			if (!value && !field.required)
				return null;
			throw err('not a boolean');

		default:
			throw new Error('unrecognized type ' + field.type + ' on field ' + field.key);
	}
}
