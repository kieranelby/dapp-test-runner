function BackOffHelper(helper) {
  this._helper = helper;
}

BackOffHelper.prototype.untilTxnMined = function(txnHash) {
  // TODO
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

exports = module.exports = BackOffHelper;
