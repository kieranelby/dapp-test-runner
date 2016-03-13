//var Ether = require('./fake-ether.js');
var Ether = require('./ether.js');
var Wrapper = require('./wrapper.js');
var Emitter = require('./emitter.js');
var StatsReporter = require('./reporters/stats-reporter.js');
var ConsoleReporter = require('./reporters/console-reporter.js');
var MarkdownReporter = require('./reporters/markdown-reporter.js');
var Results = require('./reporters/results.js');

function Runner(title) {
  this.title = title;
  this.ran = false;
  this._tests = [];
  this._maxConcurrentTests = 5;
  this._alwaysWaitForSweep = false;
  this._excludedCategorySet = {};
  this._testTitles = {};
  this._currentTests = [];
  this._notStartedTests = [];
  this._emitter = new Emitter();
  this._statsReporter = new StatsReporter();
  this._markdownReporter = new MarkdownReporter(this._statsReporter);
  this._emitter.addReporter(this._statsReporter);
  this._emitter.addReporter(this._markdownReporter);
  this._emitter.addReporter(new ConsoleReporter(this._statsReporter));
  this._ether = new Ether(this);
  this._emitter.emit('runnerCreated', this);
}

Runner.prototype._assertNotRan = function() {
  if (this.ran) {
    throw new Error('too late, already run or running');
  }
};

Runner.prototype.setWeb3RpcUrl = function(web3RpcUrl) {
  this._assertNotRan();
  // TODO
  throw new Error('not yet implemented');
};

Runner.prototype.setMasterAccountPassphrase = function(passphrase) {
  this._assertNotRan();
  // TODO
  throw new Error('not yet implemented');
};

Runner.prototype.registerContract = function(name, abi, bytecode) {
  this._assertNotRan();
  this._ether.registerContract(name, abi, bytecode);
};

Runner.prototype.registerSolidityContracts = function(soliditySource) {
  this._assertNotRan();
  this._ether.registerSolidityContracts(soliditySource);
};

Runner.prototype.disableParallelism = function() {
  this._assertNotRan();
  this._maxConcurrentTests = 1;
  this._alwaysWaitForSweep = true;
};

Runner.prototype.excludeCategory = function(category) {
  this._excludedCategorySet[category] = true;
};

Runner.prototype.addRunSetupFunction = function(runSetupFunction) {
  this._assertNotRan();
  // TODO
  throw new Error('not yet implemented');
};

Runner.prototype.addRunCleanupFunction = function(runCleanupFunction) {
  this._assertNotRan();
  // TODO
  throw new Error('not yet implemented');
};

Runner.prototype.addTest = function(testObj) {
  this._assertNotRan();
  var test = new Wrapper(testObj, this);
  if (this._testTitles[test.title] !== undefined) {
    throw new Error('cannot have two tests with same title: \'' + test.title + '\'');
  }
  this._testTitles[test.title] = test;
  this._tests.push(test);
  this._emitter.emit('testAdded', test);
};

Runner.prototype.run = function(runCompletedFunction) {
  this._assertNotRan();
  if (runCompletedFunction === undefined) {
    runCompletedFunction = function(results) {
    };
  }
  this._emitter.emit('runnerStarted', this);
  this.ran = true;
  this._runCompletedFunction = runCompletedFunction;
  this._ether.initialise();
  // TODO - run-level setup function(s)
  this._currentTests = [];
  this._notStartedTests = this._tests.slice();
  this._advance();
};

Runner.prototype._advance = function() {
  var done = this._realAdvance();
  if (done) {
    this._runEnded();
  } else {
    setTimeout(this._advance.bind(this), 100);
  }
};

Runner.prototype._realAdvance = function() {
  while (this._currentTests.length < this._maxConcurrentTests &&
         this._notStartedTests.length > 0) {
    this._currentTests.push(this._notStartedTests[0]);
    this._notStartedTests = this._notStartedTests.slice(1);
  }
  if (!this._ether.ready()) {
    this._emitter.emit('waiting', 'ethereum node to sync');
    return false;
  }
  if (this._alwaysWaitForSweep && this._ether.anySweepsInProgress()) {
    this._emitter.emit('waiting', 'funds to be swept back from accounts');
    return false;
  }
  if (this._currentTests.length === 0) {
    if (this._ether.anySweepsInProgress()) {
      this._emitter.emit('waiting', 'funds to be swept back from accounts');
      return false;
    } else {
      return true;
    }
  }
  var test = this._currentTests[0];
  this._currentTests = this._currentTests.slice(1);
  if (!test.initialised) {
    test.initialise(this._emitter, this._ether);
  }
  test.advance();
  if (!test.completed) {
    this._currentTests.push(test);
  }
  return false;
};

Runner.prototype._log = function(_variable_args_) {
  var args = Array.prototype.splice.call(arguments, 0);
  args.unshift('runnerLogged', this);
  this._emitter.emit.apply(this._emitter, args);
};

Runner.prototype._runEnded = function() {
  // TODO - run-level cleanup function(s)
  this._emitter.emit('runnerCompleted', this);
  var results = new Results(this._statsReporter, this._markdownReporter);
  this._runCompletedFunction(results);
};

exports = module.exports = Runner;
