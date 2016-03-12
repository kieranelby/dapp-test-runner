function BackOffHelper(helper) {
  this._helper = helper;
}

BackOffHelper.prototype._backOff = function(message) {
  var error = new Error('back off for ' + message);
  error.isBackOff = true;
  error.backOffReason = message;
  this._helper._emitter.emit('waiting', message);
  throw error;
};

BackOffHelper.prototype.untilBlockTime = function(blockTime) {
  // TODO
};

BackOffHelper.prototype.untilClockTime = function(jsDate) {
  // TODO
};

BackOffHelper.prototype.untilPredicate = function(predicateFunction) {
  // TODO
};

BackOffHelper.prototype.untilTxnMined = function(txnHash) {
  if (!this._helper._ether.isTransactionMined(txnHash)) {
    this._backOff('transaction to be mined');
  }
};

BackOffHelper.prototype.untilContractInstanceReady = function(contractInstance) {
  if (!contractInstance.address) {
    this._backOff('contract instance to be ready');
  }
};

exports = module.exports = BackOffHelper;
