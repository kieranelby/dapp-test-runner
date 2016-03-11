var AssertionError = require('./assertion-error.js');

function MathHelper(helper) {
  this._helper = helper;
}

MathHelper.prototype.fromWei = function(amount, toUnit) {
  return this._helper._ether.web3.fromWei(amount, toUnit);
};

MathHelper.prototype.toWei = function(amount, fromUnit) {
  return this._helper._ether.web3.toWei(amount, fromUnit);
};

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

MathHelper.prototype.assertEqual = function(expected, actualAmount, message) {
  var result = this.cmp(actualAmount, expected);
  if (result !== 0) {
    throw new AssertionError(expected, actualAmount, message);
  }
};

MathHelper.prototype.assertLessThan = function(actualAmount, comparedTo, message) {
  var result = this.cmp(actualAmount, comparedTo);
  if (result >= 0) {
    throw new AssertionError('less than ' + comparedTo, actualAmount, message);
  }
};

MathHelper.prototype.assertLessThanOrEqual = function(actualAmount, comparedTo, message) {
  var result = this.cmp(actualAmount, comparedTo);
  if (result > 0) {
    throw new AssertionError('less than or equal to ' + comparedTo, actualAmount, message);
  }
};

MathHelper.prototype.assertGreaterThan = function(actualAmount, comparedTo, message) {
  var result = this.cmp(actualAmount, comparedTo);
  if (result <= 0) {
    throw new AssertionError('greater than ' + comparedTo, actualAmount, message);
  }
};

MathHelper.prototype.assertGreaterThanOrEqual = function(actualAmount, comparedTo, message) {
  var result = this.cmp(actualAmount, comparedTo);
  if (result < 0) {
    throw new AssertionError('greater than or equal to ' + comparedTo, actualAmount, message);
  }
};

MathHelper.prototype.assertRoughlyEqual = function(expected, actualAmount, withinDelta, message) {
  this.assertGreaterThanOrEqual(this.subtract(expected, withinDelta), actualAmount, message);
  this.assertLessThanOrEqual(this.add(expected, withinDelta), actualAmount, message);
};

exports = module.exports = MathHelper;
