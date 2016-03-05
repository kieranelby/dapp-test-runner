var AssertionError = require('./assertion-error.js');

function MathHelper(helper) {
  this._helper = helper;
}

MathHelper.prototype.toNum = function(numberOrString) {
  return this._helper._ether.web3.toBigNumber(numberOrString);
};

MathHelper.prototype.cmp = function(numberOrStringOrBigNumA, numberOrStringOrBigNumB) {
  var bigA = this.toNum(numberOrStringOrBigNumA);
  var bigB = this.toNum(numberOrStringOrBigNumB);
  return bigA.cmp(bigB);
};

MathHelper.prototype.add = function(numberOrStringOrBigNumA, numberOrStringOrBigNumB) {
  var bigA = this.toNum(numberOrStringOrBigNumA);
  var bigB = this.toNum(numberOrStringOrBigNumB);
  return bigA.add(bigB);
};

MathHelper.prototype.subtract = function(numberOrStringOrBigNumA, numberOrStringOrBigNumB) {
  var bigA = this.toNum(numberOrStringOrBigNumA);
  var bigB = this.toNum(numberOrStringOrBigNumB);
  return bigA.subtract(bigB);
};

MathHelper.prototype.assertEqual = function(expected, amount, message) {
  var result = this.cmp(amount, expected);
  if (result !== 0) {
    throw new AssertionError(message, expected, amount);
  }
};

MathHelper.prototype.assertLessThan = function(amount, comparedTo, message) {
  var result = this.cmp(amount, comparedTo);
  if (result >= 0) {
    throw new AssertionError(message, 'less than ' + comparedTo, amount);
  }
};

MathHelper.prototype.assertGreaterThan = function(amount, comparedTo, message) {
  var result = this.cmp(amount, comparedTo);
  if (result <= 0) {
    throw new AssertionError(message, 'greater than ' + comparedTo, amount);
  }
};

exports = module.exports = MathHelper;
