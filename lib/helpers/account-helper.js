function AccountHelper(helper) {
  this._helper = helper;
  this.master = this._helper._ether.masterAccount;
  this.accountsUsed = [];
}

AccountHelper.prototype.create = function() {
  var account = this._helper._ether.takeAccount();
  this.accountsUsed.push(account);
  this._helper._emitter.emit('testTookAccount', account);
  return account;
};

AccountHelper.prototype.createWithJustOver = function(weiAmount) {
  var address = this.create();
  var adjustedAmount = this._helper.math.add(weiAmount, this._helper.math.toWei(50, 'finney'));
  var txnObj = {
    from: this.master,
    to: address,
    value: adjustedAmount
  };
  this._helper.txn.send(txnObj);
  return address;
};

AccountHelper.prototype.getBalance = function(address) {
  return this._helper._ether.getBalance(address);
};

AccountHelper.prototype._cleanup = function() {
  var self = this;
  this.accountsUsed.forEach(function (account) {
    self._helper._ether.returnAccount(account);
    self._helper._emitter.emit('testReturnedAccount', account);
  });
};

exports = module.exports = AccountHelper;
