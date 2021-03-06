function NextStepHelper(helper) {
  this._helper = helper;
  this._backOffFunctions = [];
}

NextStepHelper.prototype.needsBlockTime = function(blockTime) {
  var self = this;
  this._backOffFunctions.push(function () {
    self._helper._backOff.untilBlockTime(blockTime);
  });
};

NextStepHelper.prototype.needsClockTime = function(jsDate) {
  var self = this;
  this._backOffFunctions.push(function () {
    self._helper._backOff.untilClockTime(jsDate);
  });
};

NextStepHelper.prototype.needsPredicate = function(predicateFunction) {
  var self = this;
  this._backOffFunctions.push(function () {
    self._helper._backOff.untilPredicate(predicateFunction);
  });
};

NextStepHelper.prototype.needsTxnMined = function(txnHash) {
  var self = this;
  self._helper.debug.log('need to wait for txn ' + txnHash);
  this._backOffFunctions.push(function () {
    self._helper._backOff.untilTxnMined(txnHash);
  });
};

NextStepHelper.prototype.needsContractInstanceReady = function(contractInstance) {
  var self = this;
  this._backOffFunctions.push(function () {
    self._helper._backOff.untilContractInstanceReady(contractInstance);
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
