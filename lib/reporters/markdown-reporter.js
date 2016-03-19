var CommonFormatter = require('./common-formatter.js');

function MarkdownReporter(statsReporter) {
  this.statsReporter = statsReporter;
  this.commonFormatter = new CommonFormatter();
  this.title = 'Unknown';
  this.testEntries = [];
  this.testEntriesByTitle = {};
  this.failedTestEntries = [];
}

MarkdownReporter.prototype.runnerCreated = function(runner) {
  this.title = runner.title;
};

MarkdownReporter.prototype.testAdded = function(test) {
  var testEntry = {
    test: test,
    status: 'Unknown',
    txnHashes: [],
    contractEvents: [],
    debugMessages: []
  };
  this.testEntries.push(testEntry);
  this.testEntriesByTitle[test.title] = testEntry;
};

MarkdownReporter.prototype.testDebugLogged = function(test, _variable_args_) {
  var vargs = Array.prototype.splice.call(arguments, 1);
  var testEntry = this.testEntriesByTitle[test.title];
  var message = vargs.join(' ');
  testEntry.debugMessages.push(message);
};

MarkdownReporter.prototype.testSkipped = function(test) {
  var testEntry = this.testEntriesByTitle[test.title];
  testEntry.status = 'Skipped';
};

MarkdownReporter.prototype.testPassed = function(test) {
  var testEntry = this.testEntriesByTitle[test.title];
  testEntry.status = 'Passed';
};

MarkdownReporter.prototype.testFailed = function(test, err, stepIdx) {
  var testEntry = this.testEntriesByTitle[test.title];
  testEntry.status = 'Failed';
  testEntry.failedStepIdx = stepIdx;
  this.failedTestEntries.push(testEntry);
};

MarkdownReporter.prototype.testGeneratedTransaction = function(test, txnHash) {
  var testEntry = this.testEntriesByTitle[test.title];
  testEntry.txnHashes.push(txnHash);
};

MarkdownReporter.prototype.testGeneratedContractEvent = function(test, contractEvent) {
  var testEntry = this.testEntriesByTitle[test.title];
  testEntry.contractEvents.push(contractEvent);
};


MarkdownReporter.prototype.getMarkdownReport = function() {

  var newline = '\n';
  var doubleNewline = '\n\n';
  var rpt = '';

  rpt += '# ';
  rpt += this.commonFormatter.quotedTitleOf(this);
  rpt += ' Report';
  rpt += doubleNewline;

  rpt += 'Generated at ';
  rpt += (new Date()).toISOString();
  rpt += ' by [dapp-test-runner](https://github.com/kieranelby/dapp-test-runner).';
  rpt += doubleNewline;

  rpt += '## Run Summary';
  rpt += doubleNewline;
  if (this.statsReporter.failedCount > 0) {
    rpt += '**Bad** - there were test failures:';
  } else {
    rpt += '**Good**:';
  }
  rpt += doubleNewline;
  rpt += '* Tests added: ' + this.statsReporter.addedCount + newline;
  rpt += '* Tests skipped: ' + this.statsReporter.skippedCount + newline;
  rpt += '* Tests passed: ' + this.statsReporter.passedCount + newline;
  rpt += '* Tests failed: ' + this.statsReporter.failedCount + newline;
  rpt += newline;
  if (this.failedTestEntries.length > 0) {
    rpt += 'The first test that failed was ' + this.commonFormatter.quotedTitleOf(this.failedTestEntries[0].test) + doubleNewline;
  }

  rpt += '## Tests' + doubleNewline;

  for (var testIdx = 0; testIdx < this.testEntries.length; testIdx++) {

    var testEntry = this.testEntries[testIdx];
    var test = testEntry.test;

    rpt += '### Test - ' + this.commonFormatter.quotedTitleOf(test) + doubleNewline;
    
    rpt += '##### Status' + doubleNewline;
    rpt += testEntry.status + doubleNewline;

    if (testEntry.test.failed) {
      rpt += '##### Failure Cause' + doubleNewline;
      rpt += test.err + doubleNewline;
      rpt += 'Location: ';
      rpt += 'Step #' + testEntry.failedStepIdx;
      var line = this.commonFormatter.extractLineFromErr(test.err);
      if (line !== undefined) {
        rpt += ' ' + line;
      }
      rpt += doubleNewline;
    }

    if (testEntry.debugMessages.length > 0) {
      rpt += '##### Debug Messages' + doubleNewline;
      for (var debugMessageIdx = 0; debugMessageIdx < testEntry.debugMessages.length; debugMessageIdx++) {
        var message = testEntry.debugMessages[debugMessageIdx];
        rpt += '* ' + message + newline;
      }
      rpt += newline;
    }
   
    if (testEntry.txnHashes.length > 0) {
      rpt += '##### Transactions Generated' + doubleNewline;
      for (var txnHashIdx = 0; txnHashIdx < testEntry.txnHashes.length; txnHashIdx++) {
        var txnHash = testEntry.txnHashes[txnHashIdx];
        var link = '[' + txnHash + ']' + '(' + this.commonFormatter.explorerTxnUrl(txnHash) + ')';
        rpt += '* ' + link + newline;
      }
      rpt += newline;
    }

    if (testEntry.contractEvents.length > 0) {
      rpt += '##### Contract Events' + doubleNewline;
      for (var contractEventIdx = 0; contractEventIdx < testEntry.contractEvents.length; contractEventIdx++) {
        var contractEvent = testEntry.contractEvents[contractEventIdx];
        rpt += '* ' + this.commonFormatter.formatContractEvent(contractEvent) + newline;
      }
      rpt += newline;
    }

  }

  return rpt;
};

exports = module.exports = MarkdownReporter;
