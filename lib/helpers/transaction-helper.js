function TransactionHelper(helper) {
  this._helper = helper;
  this.rawWeb3 = this._helper._ether.web3;
  this._txnHashes = []; // TODO - use for reporting/coverage etc
}

TransactionHelper.prototype.createContractInstance = function(name, paramsArray, txnObj) {
  var contractAbi = this._helper._ether.getRegisteredContract(name).abi;
  // TODO - would be nice to emit contract creation when address becomes available?
  var contractInstance = this._helper._ether.createContractInstance(name, paramsArray, txnObj);
  var txnHash = contractInstance.transactionHash;
  this._helper.nextStep.needsTxnMined(txnHash);
  this._helper.nextStep._needsContractInstanceReady(contractInstance);
  this._recordTxnHash(txnHash);
  return this._wrapContractInstance(contractInstance, contractAbi);
};

TransactionHelper.prototype._wrapContractInstance = function(contractInstance, contractAbi) {
  // TODO - hook into non-constant functions and intercept txn hashes
  this._helper.debug.log('warning, wrapping contract not implemented');
  return contractInstance;
}

TransactionHelper.prototype.send = function(txnObj) {
  var txnHash = this._helper._ether.send(txnObj);
  this._helper.nextStep.needsTxnMined(txnHash);
};

TransactionHelper.prototype.recordOtherTxn = function(txnHash) {
  this._recordTxnHash(txnHash);
};

TransactionHelper.prototype._recordTxnHash = function(txnHash) {
  this._helper._emitter.emit('testGeneratedTransaction', this._helper._wrapper, txnHash);
  this._txnHashes.push(txnHash);
};

exports = module.exports = TransactionHelper;
