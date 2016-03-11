function TransactionHelper(helper) {
  this._helper = helper;
  this.rawWeb3 = this._helper._ether.web3;
  this._txnHashes = []; // TODO - use for reporting/coverage etc
}

TransactionHelper.prototype.createContractInstance = function(name, paramsArray, txnObj) {
  // TODO - keep track of transaction hash etc
  var contractInstance = this._helper._ether.createContractInstance(name, paramsArray, txnObj);
  var txnHash = contractInstance.transactionHash;
  this._helper.nextStep.needsTxnMined(txnHash);
  this._helper.nextStep._needsContractInstanceReady(contractInstance);
  this._recordTxnHash(txnHash);
  return contractInstance;
};

TransactionHelper.prototype.send = function(txnObj) {
  var txnHash = this._helper._ether.send(txnObj);
  this._helper.nextStep.needsTxnMined(txnHash);
};

TransactionHelper.prototype.recordOtherTxn = function(txnObj) {
  // TODO
};

TransactionHelper.prototype.recordOtherTxn = function(txnHash) {
  this._recordTxnHash(txnHash);
};

TransactionHelper.prototype._recordTxnHash = function(txnHash) {
  this._txnHashes.push(txnHash);
};

exports = module.exports = TransactionHelper;
