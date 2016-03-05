var Ether = require('./ether.js');
var Wrapper = require('./wrapper.js');
var Emitter = require('./emitter.js');
var ConsoleReporter = require('./console-reporter.js');
var HtmlReporter = require('./html-reporter.js');

function Runner(title) {
  this.title = title;
  this.ran = false;
  this._tests = [];
  this._maxConcurrentTests = 2;
  this._testTitles = {};
  this._currentTests = [];
  this._notStartedTests = [];
  this._emitter = new Emitter();
  this._ether = new Ether();
}

Runner.prototype.registerContract = function(name, abi, bytecode) {
};

Runner.prototype.registerSolidityContracts = function(soliditySource) {
};

Runner.prototype.addTest = function(testObj) {
  var test = new Wrapper(testObj);
  if (this._testTitles[test.title] !== undefined) {
    throw new Error('cannot have two tests with same title: \'' + test.title + '\'');
  }
  this._testTitles[test.title] = test;
  this._tests.push(test);
};

Runner.prototype.run = function(reportFilename) {
  if (this.ran) {
    throw new Error('can only run once');
  }
  this._emitter.addReporter(new ConsoleReporter());
  this._emitter.addReporter(new HtmlReporter(reportFilename));
  this._emitter.emit('runStarted', this);
  this.ran = true;
  this._currentTests = [];
  this._notStartedTests = this._tests.slice();
  this._advance();
};

Runner.prototype._advance = function() {
  while (this._currentTests.length < this._maxConcurrentTests &&
         this._notStartedTests.length > 0) {
    this._currentTests.push(this._notStartedTests[0]);
    this._notStartedTests = this._notStartedTests.slice(1);
  }
  if (this._currentTests.length === 0) {
    this._runEnded();
    return;
  }
  if (this._ether.ready()) {
    var test = this._currentTests[0];
    this._currentTests = this._currentTests.slice(1);
    if (!test.initialised) {
      test.initialise(this._emitter, this._ether);
    }
    test.advance();
    if (!test.completed) {
      this._currentTests.push(test);
    }
  }
  setTimeout(this._advance.bind(this), 100);
};

Runner.prototype._runEnded = function() {
  this._emitter.emit('runEnded', this);
};

exports = module.exports = Runner;
