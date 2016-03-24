function AssertHelper(helper) {
  this._helper = helper;
}

AssertHelper.prototype._assertionFailed = function(expected, actual, message) {
  var fullMessage = 'assertion failed: expected \'' + expected + '\' got \'' + actual + '\'; ' + message;
  var error = new Error(fullMessage);
  error.isAssertionFailed = true;
  throw error;
};

AssertHelper.prototype.fail = function(message) {
  this._assertionFailed('pass', 'fail', message);
};

AssertHelper.prototype.isTrue = function(condition, message) {
  if (!condition) {
    this._assertionFailed(true, false, message);
  }
};

AssertHelper.prototype.equal = function(expected, actual, message) {
  try {
    this._helper.math.assertEqual(expected, actual, message);
  } catch (err) {
    if (err.isAssertionFailed) {
      throw err;
    } else {
      if (expected !== actual) {
        this._assertionFailed(expected, actual, message);
      }
    }
  }
};

AssertHelper.prototype.notEqual = function(notExpected, actual, message) {
  try {
    this._helper.math.assertNotEqual(notExpected, actual, message);
  } catch (err) {
    if (err.isAssertionFailed) {
      throw err;
    } else {
      if (notExpected === actual) {
        this._assertionFailed('not ' + notExpected, actual, message);
      }
    }
  }
};

exports = module.exports = AssertHelper;
