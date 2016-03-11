function AssertionError(expected, actual, message) {
  this.message = message;
  this.expected = expected;
  this.actual = actual;
}

AssertionError.prototype.toString = function() {
  return 'assertion failed: expected \'' + this.expected + '\' got \'' + this.actual + '\'; ' + this.message;
};

exports = module.exports = AssertionError;
