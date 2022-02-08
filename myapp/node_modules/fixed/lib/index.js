var clone = require('clone');

var fixed = module.exports = function (spec) {
	if (!(this instanceof fixed))
		return new fixed(spec);

	this.spec = processSpec(spec);
}

fixed.prototype.generate = require('./generate');
fixed.prototype.parse = require('./parse');

function processSpec(spec) {
	spec = clone(spec);

	// encoding

	if (!spec.encoding)
		spec.encoding = 'utf8';

	if (typeof spec.supportsUnicode === 'undefined')
		spec.supportsUnicode = spec.encoding != 'ascii';

	if (typeof spec.supportsControlChars === 'undefined')
		spec.supportsControlChars = false;

	if (typeof spec.supportsNewLineChars === 'undefined')
		spec.supportsNewLineChars = false;

	if (typeof spec.excludedChars === 'undefined')
		spec.excludedChars = [];

	// format

	if (typeof spec.recordEnding === 'undefined')
		spec.recordEnding = '\r\n';

	// field defaults

	if (typeof spec.defaultRequired === 'undefined')
		spec.defaultRequired = true;

	if (typeof spec.defaultTrueValue === 'undefined')
		spec.defaultTrueValue = '1';

	if (typeof spec.defaultFalseValue === 'undefined')
		spec.defaultFalseValue = '0';

	// fields

	spec.fields.forEach(function (field) {
		if (!spec.zeroIndexedStartingPosition)
			field.startIndex = field.startingPosition - 1;
		else
			field.startIndex = field.startingPosition;

		field.endIndex = field.startIndex + field.length;

		if (typeof field.required === 'undefined')
			field.required = spec.defaultRequired;

		if (typeof field.trueValue === 'undefined')
			field.trueValue = spec.defaultTrueValue;

		if (typeof field.falseValue === 'undefined')
			field.falseValue = spec.defaultFalseValue;

		if (field.possibleValues && typeof field.possibleValues.indexOf !== 'function')
			throw new Error('possibleValues of field ' + field.key + ' must be an array');
	});

	// record length

	var requiredLength = Math.max.apply(null, spec.fields.map(function (field) {
		return field.endIndex;
	}));

	if (typeof spec.length === 'undefined')
		spec.length = requiredLength;

	if (spec.length < requiredLength)
		throw new Error('spec length is ' + spec.length + ' but ' + requiredLength + ' is needed');

	spec.totalLength = spec.length;

	if (spec.recordEnding)
		spec.totalLength += spec.recordEnding.length;

	return spec;
}
