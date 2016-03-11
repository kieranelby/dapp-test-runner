var Web3 = require('web3');
var RealEther = require('./ether.js');

function Ether() {
  this._realWeb3 = new Web3();
  this._realEther = new RealEther();
  this.web3 = {};
  this.web3.fromWei = this._realWeb3.fromWei;
  this.web3.toWei = this._realWeb3.toWei;
  this.web3.toBigNumber = this._realWeb3.toBigNumber;
  this.masterAccount = undefined;
  this.testPassphrase = 'password';
  this.registeredContracts = {};
}

Ether.prototype.initialise = function() {
};

Ether.prototype.ready = function() {
  return true;
};

Ether.prototype.beforeStep = function() {
};

Ether.prototype.registerContract = function(name, abi, bytecode) {
  this._realEther.registerContract(name,abi,bytecode);
};

Ether.prototype.registerSolidityContracts = function(soliditySource) {
  this._realEther.registerSolidityContracts(soliditySource);
};

Ether.prototype.createContractInstance = function(name, paramsArray, txnObj) {
  var registeredContract = this._realEther.registeredContracts[name];
  if (registeredContract === undefined) {
    throw new Error('no contract called ' + name + ' has been registered');
  }
  var self = this;
  var contractObj = {};
  // create dummy functions
  registeredContract.abi.forEach(function (abiEntry) {
    contractObj[abiEntry.name] = function() { return 0; };
  });
  contractObj.transactionHash = 'dummyTxnHash';
  return contractObj;
};

Ether.prototype.getBalance = function(address) {
  return this.web3.toBigNumber(0);
};

Ether.prototype.send = function(txnObj) {
  return 'dummyTxnHash';
};

Ether.prototype.isTransactionMined = function(txnHash) {
  return true;
};

Ether.prototype.takeAccount = function() {
};

Ether.prototype.returnAccount = function(address) {
};

exports = module.exports = Ether;
