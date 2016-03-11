function BackOffHelper(helper) {
  this._helper = helper;
}

BackOffHelper.prototype._backOff = function(message) {
  var error = new Error('back off');
  error.isBackOff = true;
  if (process && process.stdout.isTTY) {
    process.stdout.write('.');
  }
  throw error;
};

BackOffHelper.prototype.untilTxnMined = function(txnHash) {
  if (!this._helper._ether.isTransactionMined(txnHash)) {
    this._backOff('waiting for transaction to be mined');
  }
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

BackOffHelper.prototype._untilContractInstanceReady = function(contractInstance) {
  if (!contractInstance.address) {
    this._backOff('waiting for contract instance to be ready');
  }
};

exports = module.exports = BackOffHelper;
