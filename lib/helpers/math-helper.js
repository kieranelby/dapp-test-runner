function MathHelper(helper) {
  this._helper = helper;
}

MathHelper.prototype.fromWei = function(amount, toUnit) {
  return this._helper._ether.web3.fromWei(amount, toUnit);
};

MathHelper.prototype.toWei = function(amount, fromUnit) {
  return this._helper._ether.web3.toWei(amount, fromUnit);
};

MathHelper.prototype.toNumber = function(numberOrString) {
  return this._helper._ether.web3.toBigNumber(numberOrString);
};

MathHelper.prototype.compare = function(numberOrStringOrBigNumA, numberOrStringOrBigNumB) {
  var bigA = this.toNumber(numberOrStringOrBigNumA);
  var bigB = this.toNumber(numberOrStringOrBigNumB);
  return bigA.cmp(bigB);
};

MathHelper.prototype.add = function(numberOrStringOrBigNumA, numberOrStringOrBigNumB) {
  var bigA = this.toNumber(numberOrStringOrBigNumA);
  var bigB = this.toNumber(numberOrStringOrBigNumB);
  return bigA.add(bigB);
};

MathHelper.prototype.subtract = function(numberOrStringOrBigNumA, numberOrStringOrBigNumB) {
  var bigA = this.toNumber(numberOrStringOrBigNumA);
  var bigB = this.toNumber(numberOrStringOrBigNumB);
  return bigA.sub(bigB);
};

MathHelper.prototype._assertionFailed = function(expected, actual, message) {
  this._helper.assert._assertionFailed(expected, actual, message);
};

MathHelper.prototype.assertEqual = function(expected, actualAmount, message) {
  var result = this.compare(actualAmount, expected);
  if (result !== 0) {
    this._assertionFailed(expected, actualAmount, message);
  }
};

MathHelper.prototype.assertNotEqual = function(notExpected, actualAmount, message) {
  var result = this.compare(actualAmount, expected);
  if (result === 0) {
    this._assertionFailed('not ' + notExpected, actualAmount, message);
  }
};

MathHelper.prototype.assertLessThan = function(actualAmount, comparedTo, message) {
  var result = this.compare(actualAmount, comparedTo);
  if (result >= 0) {
    this._assertionFailed('less than ' + comparedTo, actualAmount, message);
  }
};

MathHelper.prototype.assertLessThanOrEqual = function(actualAmount, comparedTo, message) {
  var result = this.compare(actualAmount, comparedTo);
  if (result > 0) {
    this._assertionFailed('less than or equal to ' + comparedTo, actualAmount, message);
  }
};

MathHelper.prototype.assertGreaterThan = function(actualAmount, comparedTo, message) {
  var result = this.compare(actualAmount, comparedTo);
  if (result <= 0) {
    this._assertionFailed('greater than ' + comparedTo, actualAmount, message);
  }
};

MathHelper.prototype.assertGreaterThanOrEqual = function(actualAmount, comparedTo, message) {
  var result = this.compare(actualAmount, comparedTo);
  if (result < 0) {
    this._assertionFailed('greater than or equal to ' + comparedTo, actualAmount, message);
  }
};

MathHelper.prototype.assertRoughlyEqual = function(expected, actualAmount, withinDelta, message) {
  this.assertGreaterThanOrEqual(actualAmount, this.subtract(expected, withinDelta), message);
  this.assertLessThanOrEqual(actualAmount, this.add(expected, withinDelta), message);
};

exports = module.exports = MathHelper;
