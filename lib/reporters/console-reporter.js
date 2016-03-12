function ConsoleReporter() {
  this._lastWaitMessage = undefined;
  this._needsNewLine = false;
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

ConsoleReporter.prototype.runnerStarted = function(runner) {
  this._addNewLineIfNeeded();
  console.log('runner', this._quotedTitleOf(runner), 'started');
};

ConsoleReporter.prototype.waiting = function(message) {
  if (process && process.stdout.isTTY) {
    if (message !== this._lastWaitMessage) {
      this._addNewLineIfNeeded();
      process.stdout.write('waiting for ' + message);
      this._lastWaitMessage = message;
    } else {
      process.stdout.write('.');
    }
    this._needsNewLine = true;
  } else {
    console.log('waiting for ' + message);
  }
}

ConsoleReporter.prototype.runnerLogged = function(runner, _variable_args_) {
  this._addNewLineIfNeeded();
  var args = Array.prototype.splice.call(arguments, 1);
  args.unshift('runner', this._quotedTitleOf(runner), 'says');
  console.log.apply(console, args);
};

ConsoleReporter.prototype.testDebugLogged = function(test, _variable_args_) {
  this._addNewLineIfNeeded();
  var args = Array.prototype.splice.call(arguments, 1);
  args.unshift('test', this._quotedTitleOf(test), 'says');
  console.log.apply(console, args);
};

ConsoleReporter.prototype.testStepStarted = function(test, stepIdx) {
  this._addNewLineIfNeeded();
  console.log('test', this._quotedTitleOf(test), 'started step', stepIdx);
};

ConsoleReporter.prototype.testGeneratedTransaction = function(test, txnHash) {
  this._addNewLineIfNeeded();
  console.log('test', this._quotedTitleOf(test), 'generated transaction', txnHash);
};

ConsoleReporter.prototype.testPassed = function(test) {
  this._addNewLineIfNeeded();
  console.log('test', this._quotedTitleOf(test), 'passed');
};

ConsoleReporter.prototype.testFailed = function(test, err, stepIdx) {
  this._addNewLineIfNeeded();
  console.log('test', this._quotedTitleOf(test), 'failed with', err, 'on step', stepIdx, ':', err.stack);
};

ConsoleReporter.prototype.testCompleted = function(test) {
  this._addNewLineIfNeeded();
  console.log('test', this._quotedTitleOf(test), 'completed');
};

ConsoleReporter.prototype.runnerCompleted = function(runner) {
  this._addNewLineIfNeeded();
  console.log('runner', this._quotedTitleOf(runner), 'completed');
};

exports = module.exports = ConsoleReporter;
