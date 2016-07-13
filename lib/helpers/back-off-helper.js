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
  var blockNow = this._helper._ether.getLatestBlockTime();
  if (this._helper.math.compare(blockNow, blockTime) < 0) {
    this._backOff('block time to be reached');
  }
};

BackOffHelper.prototype.untilClockTime = function(jsDate) {
  if (new Date() < jsDate) {
    this._backOff('clock time to be reached');
  }
};

BackOffHelper.prototype.untilPredicate = function(predicateFunction) {
  if (!predicateFunction()) {
    this._backOff('custom predicate to become true');
  }
};

BackOffHelper.prototype.untilTxnMined = function(txnHash) {
  if (!this._helper._ether.isTransactionMined(txnHash)) {
    this._backOff('transaction ' + txnHash + ' to be mined');
  }
  this._helper.debug.log('txn', txnHash, 'has been mined on all nodes');
};

BackOffHelper.prototype.untilContractInstanceReady = function(contractInstance) {
  if (!contractInstance.address) {
    this._backOff('contract instance to be ready');
  }
  // See comments in transaction-helper, this is ugly.
  this._helper.txn._wrapContractInstance(contractInstance);
};

exports = module.exports = BackOffHelper;
