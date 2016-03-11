function ConsoleReporter() {
}

ConsoleReporter.prototype.runStarted = function(runner) {
  console.log('runner', runner.title, 'started');
};

ConsoleReporter.prototype.testStepStarted = function(test, stepIdx) {
  console.log('step', stepIdx, 'of', test.title, 'started');
};

ConsoleReporter.prototype.testPassed = function(test) {
  console.log('test', test.title, 'passed');
};

ConsoleReporter.prototype.testFailed = function(test, err, stepIdx) {
  console.log('test', test.title, 'failed with', err, 'on step', stepIdx, ':', err.stack);
};

ConsoleReporter.prototype.testCompleted = function(test) {
  console.log('test', test.title, 'completed');
};

ConsoleReporter.prototype.runEnded = function(runner) {
  console.log('runner', runner.title, 'ended');
};

exports = module.exports = ConsoleReporter;
