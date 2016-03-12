function NextStepHelper(helper) {
  this._helper = helper;
  this._backOffFunctions = [];
}

NextStepHelper.prototype.needsBlockTime = function(blockTime) {
  // TODO
  this._helper.debug.log('warning, needsBlockTime not implemented');
};

NextStepHelper.prototype.needsClockTime = function(jsDate) {
  // TODO
  this._helper.debug.log('warning, needsClockTime not implemented');
};

NextStepHelper.prototype.needsPredicate = function(predicateFunction) {
  // TODO
  this._helper.debug.log('warning, needsPredicate not implemented');
};

NextStepHelper.prototype.needsTxnMined = function(txnHash) {
  var self = this;
  this._backOffFunctions.push(function () {
    self._helper.backOff.untilTxnMined(txnHash);
  });
};

NextStepHelper.prototype.needsContractInstanceReady = function(contractInstance) {
  var self = this;
  this._backOffFunctions.push(function () {
    self._helper.backOff.untilContractInstanceReady(contractInstance);
  });
};

NextStepHelper.prototype._ready = function() {
  for (var i = 0; i < this._backOffFunctions.length; i++) {
    var backOffFunction = this._backOffFunctions[i];
    try {
      backOffFunction();
    } catch (err) {
      if (err.isBackOff) {
        return false;
      } else {
        throw err;
      }
    }
  }
  this._backOffFunctions = [];
  return true;
};

exports = module.exports = NextStepHelper;
