function TransactionHelper(helper) {
  this._helper = helper;
  this.rawWeb3 = this._helper._ether.web3;
}

TransactionHelper.prototype.createContractInstance = function(name, paramsArray, txnObj) {
  // TODO
};

TransactionHelper.prototype.send = function(txnObj) {
  // TODO
};

TransactionHelper.prototype.recordOtherTxn = function(txnObj) {
  // TODO
};

exports = module.exports = TransactionHelper;
