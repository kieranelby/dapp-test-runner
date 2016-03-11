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
  } catch (ex) {
    // aaah this won't work
    if (ex.isAssertionFailed) {
      throw ex;
    } else {
      if (expected !== actual) {
        this._assertionFailed(expected, actual, message);
      }
    }
  }
};

exports = module.exports = AssertHelper;