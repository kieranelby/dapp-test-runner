var Helper = require('./helpers/helper.js');

function Wrapper(testObj) {

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
  this.initialised = false;
  this.completed = false;
  this.failed = false;
  this.err = undefined;
  this.cleanupErr = undefined;

  this._testObj = testObj;
  this._nextStepIdx = 0;
  this._emitter = undefined;
  this._helper = undefined;
}

Wrapper.prototype.initialise = function(emitter, ether) {
  this.initialised = true;
  this._emitter = emitter;
  this._helper = new Helper(this, emitter, ether);
};

Wrapper.prototype.advance = function() {
  if (this.completed) {
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
      if (err instanceof this.BackOffError) {
        return;
      } else {
        this.fail(err);
      }
    }
  }
};

Wrapper.prototype.BackOffError = function() {
};

Wrapper.prototype.beforeStep = function() {
  this._emitter.emit('testStepStarted', this, this._nextStepIdx);
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
