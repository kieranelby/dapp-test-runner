function NextStepHelper(helper) {
  this._helper = helper;
}

NextStepHelper.prototype.needsTxnMined = function(txnHash) {
  // TODO
};

NextStepHelper.prototype.needsBlockTime = function(blockTime) {
  // TODO
};

NextStepHelper.prototype.needsClockTime = function(jsDate) {
  // TODO
};

NextStepHelper.prototype.needsPredicate = function(predicateFunction) {
  // TODO
};

exports = module.exports = NextStepHelper;
