function StatsReporter() {
  this.addedCount = 0;
  this.skippedCount = 0;
  this.passedCount = 0;
  this.failedCount = 0;
}

StatsReporter.prototype.testAdded = function(test) {
  this.addedCount++;
};

StatsReporter.prototype.testSkipped = function(test) {
  this.skippedCount++;
};

StatsReporter.prototype.testPassed = function(test) {
  this.passedCount++;
};

StatsReporter.prototype.testFailed = function(test, err, stepIdx) {
  this.failedCount++;
};

exports = module.exports = StatsReporter;
