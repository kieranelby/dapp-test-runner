var CommonFormatter = require('./common-formatter.js');

function ConsoleReporter(statsReporter) {
  this.statsReporter = statsReporter;
  this.commonFormatter = new CommonFormatter();
  this._lastWaitMessage = undefined;
  this._needsNewLine = false;
  
  this.prefix = {
    pass : '\u221A',
    fail : '\u00D7',
    info : '*',
  };

}

ConsoleReporter.prototype._addNewLineIfNeeded = function() {
  if (this._needsNewLine) {
    console.log('');
    this._needsNewLine = false;
  }
  this._lastWaitMessage = undefined;
};

ConsoleReporter.prototype._quotedTitleOf = function(titledObj) {
  return '"' + titledObj.title + '"';
};

ConsoleReporter.prototype.runnerCreated = function(runner) {
  this._addNewLineIfNeeded();
  console.log(this.prefix.info, 'runner', this._quotedTitleOf(runner), 'created');
};

ConsoleReporter.prototype.runnerLogged = function(runner, _variable_args_) {
  this._addNewLineIfNeeded();
  var args = Array.prototype.splice.call(arguments, 1);
  args.unshift(this.prefix.info, 'runner', this._quotedTitleOf(runner), 'says');
  console.log.apply(console, args);
};

ConsoleReporter.prototype.contractCompiled = function(runner, contractName) {
  this._addNewLineIfNeeded();
  console.log(this.prefix.info, 'contract', contractName, 'compiled');
};

ConsoleReporter.prototype.contractRegistered = function(runner, contractName) {
  this._addNewLineIfNeeded();
  console.log(this.prefix.info, 'contract', contractName, 'registered');
};

ConsoleReporter.prototype.runnerStarted = function(runner) {
  this._addNewLineIfNeeded();
  console.log(this.prefix.info, 'runner', this._quotedTitleOf(runner), 'started');
};

ConsoleReporter.prototype.waiting = function(message) {
  if (process && process.stdout.isTTY) {
    if (message !== this._lastWaitMessage) {
      this._addNewLineIfNeeded();
      process.stdout.write(this.prefix.info + ' ' + 'waiting for ' + message);
      this._lastWaitMessage = message;
    } else {
      process.stdout.write('.');
    }
    this._needsNewLine = true;
  } else {
    console.log(this.prefix.info, 'waiting for ' + message);
  }
};

ConsoleReporter.prototype.testAdded = function(test) {
  this._addNewLineIfNeeded();
  console.log(this.prefix.info, 'test', this._quotedTitleOf(test), 'added');
};

ConsoleReporter.prototype.testTookAccount = function(test, address, nodeNumber) {
  this._addNewLineIfNeeded();
  console.log(this.prefix.info, 'test', this._quotedTitleOf(test), 'took account', address, 'on node', nodeNumber);
};

ConsoleReporter.prototype.testReturnedAccount = function(test, address, nodeNumber) {
  this._addNewLineIfNeeded();
  console.log(this.prefix.info, 'test', this._quotedTitleOf(test), 'returned account', address, 'on node', nodeNumber);
};

ConsoleReporter.prototype.testDebugLogged = function(test, _variable_args_) {
  this._addNewLineIfNeeded();
  var args = Array.prototype.splice.call(arguments, 1);
  args.unshift(this.prefix.info, 'test', this._quotedTitleOf(test), 'says');
  console.log.apply(console, args);
};

ConsoleReporter.prototype.testStepStarted = function(test, stepIdx) {
  this._addNewLineIfNeeded();
  console.log(this.prefix.info, 'test', this._quotedTitleOf(test), 'started step', stepIdx);
};

ConsoleReporter.prototype.testGeneratedTransaction = function(test, txnHash) {
  this._addNewLineIfNeeded();
  console.log(this.prefix.info, 'test', this._quotedTitleOf(test), 'generated transaction', txnHash);
};

ConsoleReporter.prototype.testGeneratedContractEvent = function(test, contractEvent, nodeNumber) {
  this._addNewLineIfNeeded();
  console.log(this.prefix.info, 'test', this._quotedTitleOf(test), 'generated contract event', this.commonFormatter.formatContractEvent(contractEvent), 'on node', nodeNumber);
};

ConsoleReporter.prototype.testSkipped = function(test) {
  this._addNewLineIfNeeded();
  console.log(this.prefix.info, 'test', this._quotedTitleOf(test), 'skipped');
};

ConsoleReporter.prototype.testPassed = function(test) {
  this._addNewLineIfNeeded();
  console.log(this.prefix.pass, 'test', this._quotedTitleOf(test), 'passed');
};

ConsoleReporter.prototype.testFailed = function(test, err, stepIdx) {
  this._addNewLineIfNeeded();
  if (err.isAssertionFailed) {
    console.log(this.prefix.fail, 'test', this._quotedTitleOf(test), 'failed with', err, 'on step', stepIdx);
  } else {
    console.log(this.prefix.fail, 'test', this._quotedTitleOf(test), 'failed with', err, 'on step', stepIdx, 'due to', err.stack);
  }
};

ConsoleReporter.prototype.testCompleted = function(test) {
  this._addNewLineIfNeeded();
  console.log(this.prefix.info, 'test', this._quotedTitleOf(test), 'completed');
};

ConsoleReporter.prototype.runnerCompleted = function(runner) {
  this._addNewLineIfNeeded();
  console.log(this.prefix.info, 'runner', this._quotedTitleOf(runner), 'completed');
  this._printFinalStats();
};

ConsoleReporter.prototype._printFinalStats = function() {
  this._addNewLineIfNeeded();
  console.log(this.prefix.info, 'tests added:', this.statsReporter.addedCount);
  console.log(this.prefix.info, 'tests skipped:', this.statsReporter.skippedCount);
  console.log(this.prefix.info, 'tests passed:', this.statsReporter.passedCount);
  console.log(this.prefix.info, 'tests failed:', this.statsReporter.failedCount);
  if (this.statsReporter.failedCount > 0) {
    console.log(this.prefix.fail, 'Bad');
  } else {
    console.log(this.prefix.pass, 'Good');
  }
};

exports = module.exports = ConsoleReporter;
