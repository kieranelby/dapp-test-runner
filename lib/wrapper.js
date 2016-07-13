var Helper = require('./helpers/helper.js');

function Wrapper(testObj, runner) {

  if (testObj === undefined) {
    throw new Error('must supply a test object');
  }
  if (testObj.title === undefined) {
    throw new Error('test object must have a title property');
  }
  if (testObj.steps === undefined) {
    throw new Error('test object must have a steps property');
  }

  this.title = testObj.title;
  this.runner = runner;
  this.initialised = false;
  this.completed = false;
  this.failed = false;
  this.err = undefined;
  this.cleanupErr = undefined;

  this._testObj = testObj;
  this._nextStepIdx = 0;
  this._lastStartedStepIdx = undefined;
  this._emitter = undefined;
  this._helper = undefined;
}

Wrapper.prototype.initialise = function(emitter, ether) {
  this.initialised = true;
  this._emitter = emitter;
  this._helper = new Helper(this, emitter, ether);
};

Wrapper.prototype._shouldIgnoreTest = function() {
  if (this._testObj.ignore) {
    return true;
  }
  if (this._testObj.categories) {
    var excludeExceptionFound = false;
    for (var i = 0; i < this._testObj.categories.length; i++) {
      var category = this._testObj.categories[i];
      // TODO - move this somewhere nicer (a test-filter class?)
      if (this.runner._excludedCategorySet[category]) {
        return true;
      }
      if (this.runner._excludeExceptCategorySet[category]) {
        excludeExceptionFound = true;
      }
    }
    if (this.runner._excludeExceptCategorySet['__has_entries__'] &&
        !excludeExceptionFound) {
      return true;
    }
  }
  return false;
};

Wrapper.prototype.advance = function() {
  if (this.completed) {
    return;
  }
  if (this._shouldIgnoreTest()) {
    this._emitter.emit('testSkipped', this);
    this.completed = true;
    return;
  }
  if (!this._helper._ready()) {
    return;
  }
  if (this.failed) {
    this.cleanup();
  } else if (this._nextStepIdx >= this._testObj.steps.length) {
    this.pass();
    this.cleanup();
  } else {
    var stepFn = this._testObj.steps[this._nextStepIdx];
    this.beforeStep();
    try {
      stepFn.apply(this._testObj, [this._helper]);
      this._nextStepIdx++;
    } catch (err) {
      if (err.isBackOff) {
        return;
      } else {
        this.fail(err);
      }
    }
  }
};

Wrapper.prototype.beforeStep = function() {
  // avoid emitting multiple times in bespoke back-off situation
  if (this._nextStepIdx !== this._lastStartedStepIdx) {
    this._emitter.emit('testStepStarted', this, this._nextStepIdx);
    this._lastStartedStepIdx = this._nextStepIdx;
  }
  this._helper._beforeStep();
};

Wrapper.prototype.pass = function() {
  this._emitter.emit('testPassed', this);
};

Wrapper.prototype.fail = function(err) {
  this.failed = true;
  this.err = err;
  this._emitter.emit('testFailed', this, this.err, this._nextStepIdx);
};

Wrapper.prototype.cleanup = function() {
  var bespokeCleanup = this._testObj.cleanup;
  if (bespokeCleanup !== undefined) {
    try {
      bespokeCleanup.apply(this._testObj, [this._helper]);
    } catch (err) {
      this.cleanupErr = err;
    }
  }
  this._helper._cleanup();
  this.completed = true;
  this._emitter.emit('testCompleted', this);
};

exports = module.exports = Wrapper;
