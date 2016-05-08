// TODO - enforce same master account on all nodes?

var Ether = require('./ether.js');

function MultiEther(runner) {
  this.runner = runner;
  this.initialised = false;
  this.web3 = undefined;
  this.masterNode = undefined;
  this._nodes = [];
  this._accountsToReturn = {};
}

MultiEther.prototype.addEtherNode = function(etherNodeSettings) {
  if (this.initialised) {
    throw new Error('too late to add ethereum nodes');
  }
  if (!etherNodeSettings) {
    etherNodeSettings = {};
  }
  etherNodeSettings._nodeNumber = (1 + this._nodes.length);
  var node = new Ether(this.runner);
  node.addEtherNode(etherNodeSettings);
  this._nodes.push(node);
};

MultiEther.prototype.getNumNodes = function() {
  return this._nodes.length;
}

MultiEther.prototype.initialise = function() {
  if (this._nodes.length == 0) {
    this.addEtherNode();
  };
  for (var nodeIdx = 0; nodeIdx < this._nodes.length; nodeIdx++) {
    var node = this._nodes[nodeIdx];
    node.initialise();
  }
  this.masterNode = this._nodes[0];
  this.web3 = this.masterNode.web3;
  this.initialised = true;
};

MultiEther.prototype.getMasterAccount = function(nodeNumber) {
  var node = this._getNode(nodeNumber);
  return node.getMasterAccount(nodeNumber);
};

MultiEther.prototype.ready = function() {
  for (var nodeIdx = 0; nodeIdx < this._nodes.length; nodeIdx++) {
    var node = this._nodes[nodeIdx];
    if (!node.ready()) {
      return false;
    }
  }
  return true;
};

MultiEther.prototype.beforeStep = function() {
  for (var nodeIdx = 0; nodeIdx < this._nodes.length; nodeIdx++) {
    var node = this._nodes[nodeIdx];
    node.beforeStep();
  }
};

MultiEther.prototype.getRegisteredContract = function(name) {
  return this.masterNode.getRegisteredContract(name);
};

MultiEther.prototype.registerContract = function(name, abi, bytecode, optionalSoliditySource) {
  // TODO - BUT HOW TO CALL IT FROM OTHER NODE ...
  return this.masterNode.registerContract(name, abi, bytecode, optionalSoliditySource);
};

MultiEther.prototype.registerSolidityContracts = function(soliditySource) {
  // TODO - BUT HOW TO CALL IT FROM OTHER NODE ...
  return this.masterNode.registerSolidityContracts(soliditySource);
};

MultiEther.prototype.createContractInstance = function(name, paramsArray, txnObj) {
  // TODO - choose node
  return this.masterNode.createContractInstance(name, paramsArray, txnObj);
};

MultiEther.prototype.getContractInstanceAt = function(abi, address, nodeNumber) {
  var node = this._getNode(nodeNumber);
  return node.getContractInstanceAt(abi, address);
};

MultiEther.prototype._getNode = function(optionalNodeNumber) {
  var nodeIdx = (optionalNodeNumber !== undefined) ? optionalNodeNumber - 1 : 0;
  if (nodeIdx < 0 || nodeIdx >= this._nodes.length) {
    throw new Error('bad node number ' + optionalNodeNumber);
  }
  return this._nodes[nodeIdx];
}

MultiEther.prototype.send = function(txnObj) {
  var node = this._getNode(txnObj.nodeNumber);
  return node.send(txnObj);
};

MultiEther.prototype.getBalance = function(address) {
  return this.masterNode.getBalance(address);
};

MultiEther.prototype.isTransactionMined = function(txnHash) {
  for (var nodeIdx = 0; nodeIdx < this._nodes.length; nodeIdx++) {
    var node = this._nodes[nodeIdx];
    if (!node.isTransactionMined(txnHash)) {
      return false;
    }
  }
  return true;
};

MultiEther.prototype.anySweepsInProgress = function() {
  for (var nodeIdx = 0; nodeIdx < this._nodes.length; nodeIdx++) {
    var node = this._nodes[nodeIdx];
    if (node.anySweepsInProgress()) {
      return true;
    }
  }
  return false;
};

// TODO - shouldn't allow master accounts to be used (e.g. master account on one node is a non-master account on another node) ...
MultiEther.prototype.isMasterAccount = function(account) {
  return false;  
}

MultiEther.prototype.takeAccount = function(nodeNumber) {
  var node = this._getNode(nodeNumber);
  var account = node.takeAccount();
  var canUse = false;
  var whyNot = 'something odd has happened';
  if (this.isMasterAccount(account)) {
    canUse = false;
    whyNot = 'it is a master account';
  } else if (this._accountsToReturn[account] !== undefined) {
    canUse = false;
    whyNot = 'it (presumably?) exists on another node';
  } else {
    canUse = true;
    whyNot = 'n/a';
  }
  if (canUse) {
    this._accountsToReturn[account] = {node: node};
    return account;
  } else {
    this.runner._log('warn: cannot use account ' + account + ' because ' + whyNot);
    var betterChoice = this.takeAccount(nodeNumber);
    node.rejectAccountUnused(account);
    return betterChoice;
  }
};

MultiEther.prototype.returnAccount = function(account) {
  var returnDetails = this._accountsToReturn[account];
  if (returnDetails === undefined) {
    throw new Error('do not know where to return account ' + account);
  }
  var node = returnDetails.node;
  node.returnAccount(account);
  delete this._accountsToReturn[account];
};

MultiEther.prototype.getLatestBlockTime = function() {
  var earliestLatestBlockTime;
  for (var nodeIdx = 0; nodeIdx < this._nodes.length; nodeIdx++) {
    var node = this._nodes[nodeIdx];
    var nodeLatestBlockTime = node.getLatestBlockTime();
    if (earliestLatestBlockTime === undefined || nodeLatestBlockTime < earliestLatestBlockTime) {
      earliestLatestBlockTime = nodeLatestBlockTime;
    }
  }
  return earliestLatestBlockTime;
};

exports = module.exports = MultiEther;
