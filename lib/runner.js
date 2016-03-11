var Ether = require('./fake-ether.js');
var Wrapper = require('./wrapper.js');
var Emitter = require('./emitter.js');
var ConsoleReporter = require('./reporters/console-reporter.js');
var HtmlReporter = require('./reporters/html-reporter.js');

function Runner(title) {
  this.title = title;
  this.ran = false;
  this._tests = [];
  this._maxConcurrentTests = 5;
  this._testTitles = {};
  this._currentTests = [];
  this._notStartedTests = [];
  this._emitter = new Emitter();
  this._registeredContracts = {}; // should probably live in ether actually
  this._ether = new Ether(this._registeredContracts);
}

Runner.prototype.setWeb3RpcUrl = function(web3RpcUrl) {
  if (this.ran) {
    throw new Error('too late, already run or running');
  }
  // TODO
};

Runner.prototype.setMasterAccountPassphrase = function(passphrase) {
  if (this.ran) {
    throw new Error('too late, already run or running');
  }
  // TODO
};

Runner.prototype.registerContract = function(name, abi, bytecode) {
  if (this.ran) {
    throw new Error('too late, already run or running');
  }
  this._registeredContracts[name] = {abi: abi, bytecode: bytecode};
};

Runner.prototype.registerSolidityContracts = function(soliditySource) {
  if (this.ran) {
    throw new Error('too late, already run or running');
  }
  // TODO - doesn't belong here, cross-platform, support compiling via web3
  var child_process = require('child_process');
  var rawOutput = child_process.execSync('solc.exe --combined-json abi,bin', {
    cwd: 'C:/Program Files/Ethereum',
    input: soliditySource,
    timeout: 10 * 1000
  });
  var output = JSON.parse(rawOutput);
  console.log('compiled solidity code to: ', output);
  var contracts = output.contracts;
  for (name in contracts) {
    if (!contracts.hasOwnProperty(name)) {
      continue;
    }
    var contract = contracts;
    this.registerContract(name, contract.abi, contract.bin);
  }
};

Runner.prototype.disableParallelism = function() {
  if (this.ran) {
    throw new Error('too late, already run or running');
  }
  this._maxConcurrentTests = 1;
}

Runner.prototype.addRunSetupFunction = function(runSetupFunction) {
  if (this.ran) {
    throw new Error('too late, already run or running');
  }
  // TODO
};

Runner.prototype.addRunCleanupFunction = function(runCleanupFunction) {
  if (this.ran) {
    throw new Error('too late, already run or running');
  }
  // TODO
};

Runner.prototype.addTest = function(testObj) {
  if (this.ran) {
    throw new Error('too late, already run or running');
  }
  var test = new Wrapper(testObj);
  if (this._testTitles[test.title] !== undefined) {
    throw new Error('cannot have two tests with same title: \'' + test.title + '\'');
  }
  this._testTitles[test.title] = test;
  this._tests.push(test);
};

Runner.prototype.run = function(reportFilename) {
  if (this.ran) {
    throw new Error('too late, already run or running');
  }
  this._emitter.addReporter(new ConsoleReporter());
  this._emitter.addReporter(new HtmlReporter(reportFilename));
  this._emitter.emit('runStarted', this);
  this.ran = true;
  this._ether.initialise();
  // TODO - run-level setup function(s)
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
  // TODO - run-level cleanup function(s)
  this._emitter.emit('runEnded', this);
};

exports = module.exports = Runner;
