function AccountHelper(helper) {
  this._helper = helper;
  this.master = this._helper._ether.masterAccount;
}

AccountHelper.prototype.create = function() {
};

AccountHelper.prototype.createWith = function(amount) {
};

AccountHelper.prototype.createWithJustOver = function(amount) {
};

AccountHelper.prototype.getBalance = function(address) {
  // hmm, law of demeter ...
  return this._helper._ether.web3.eth.getBalance(address);
};

exports = module.exports = AccountHelper;
