function Results(statsReporter, markdownReporter) {
  this._markdownReporter = markdownReporter;
  this.addedCount = statsReporter.addedCount;
  this.skippedCount = statsReporter.skippedCount;
  this.failedCount = statsReporter.failedCount;
  this.passedCount = statsReporter.passedCount;
  this.anyFailed = (this.failedCount > 0);
}

Results.prototype.getMarkdownReport = function() {
  return this._markdownReporter.getMarkdownReport();
};

exports = module.exports = Results;
