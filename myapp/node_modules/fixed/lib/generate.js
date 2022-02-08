var nonAsciiRegex = /[^\x00-\x7F]/g;
var newLineRegex = /[\n\r]/g;
var controlRegex = /[\x00-\x09\x0B\x0C\x0E-\x1F\x7F]/g; // 00-1F and 7F, excl new-line chars

module.exports = function (data) {
	var spec = this.spec;

	var buffer = new Buffer(spec.totalLength);
	buffer.fill(' ');

	spec.fields.forEach(function (field) {
		var value = findValue(data, field);
		value = transformValue(value, field, spec);

		if (value == null)
			return;

		buffer.write(value, field.startIndex, field.length, spec.encoding);
	});

	if (spec.recordEnding)
		buffer.write(spec.recordEnding, spec.length, spec.encoding);

	return buffer;
};

function findValue(data, field) {
	if (field.fixedValue !== void 0)
		return field.fixedValue;

	var value = field.defaultValue;

	if (data[field.key] !== void 0)
		value = data[field.key];

	if (field.required && value == null)
		throw new Error('field ' + field.key + ' is required, but cannot be resolved');

	if (value != null && field.possibleValues && field.possibleValues.indexOf(value) === -1)
		throw new Error('value "' + value + '" is not possible for field ' + field.key);

	return value;
}

function transformValue(value, field, spec) {
	function err(msg) {
		if (!msg)
			msg = 'invalid';
		return new Error(['value is', msg, 'for field', field.key, '\n', value].join(' '));
	}

	if (value == null) {
		switch (field.type) {
			case 'integer':
				value = 0;
				break;

			default:
				return value;
		}
	}

	switch (field.type) {
		case 'string':
			if (!(value instanceof String))
				value = value.toString();
			if (!spec.supportsUnicode)
				value = value.replace(nonAsciiRegex, '*');
			if (!spec.supportsNewLineChars)
				value = value.replace(newLineRegex, ' ');
			if (!spec.supportsControlChars)
				value = value.replace(controlRegex, '');
			if (spec.excludedChars.length)
				value = removeExcludedChars(spec.excludedChars, value);
			if (value.length > field.length)
				throw err('too long');
			return value;

		case 'integer':
			if (typeof value !== 'number')
				throw err('not a number');
			if (value % 1 !== 0)
				throw err('not an integer');
			value = value.toString();
			if (value.length > field.length)
				throw err('too long');
			if (value.length < field.length)
				value = new Array(field.length - value.length + 1).join('0') + value;
			return value;

		case 'boolean':
			return value ? field.trueValue : field.falseValue;
	}

	throw new Error('unrecognized type ' + field.type + ' on field ' + field.key);
}

function removeExcludedChars(excludedChars, value) {
	excludedChars.forEach(char => {
		value = value.split(char).join('');
	});

	return value;
}
