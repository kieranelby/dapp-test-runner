var AssertionError = require('./assertion-error.js');

function AssertHelper(helper) {
  this._helper = helper;
}

AssertHelper.prototype.fail = function(message) {
  if (!condition) {
    throw new AssertionError('pass', 'fail', message);
  }
};

AssertHelper.prototype.isTrue = function(condition, message) {
  if (!condition) {
    throw new AssertionError(true, false, message);
  }
};

AssertHelper.prototype.equal = function(expected, actual, message) {
  try {
    this._helper.math.assertEqual(expected, actual, message);
  } catch (ex) {
    if (ex instanceof AssertionError) {
      throw ex;
    } else {
      if (expected !== actual) {
        throw new AssertionError(expected, actual, message);
      }
    }
  }
};

exports = module.exports = AssertHelper;
