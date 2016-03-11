function AccountHelper(helper) {
  this._helper = helper;
  this.master = this._helper._ether.masterAccount;
}

AccountHelper.prototype.create = function() {
  // TODO
};

AccountHelper.prototype.createWithJustOver = function(weiAmount) {
  // TODO
};

AccountHelper.prototype.getBalance = function(address) {
  return this._helper._ether.web3.eth.getBalance(address);
};

exports = module.exports = AccountHelper;
