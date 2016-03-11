function AccountHelper(helper) {
  this._helper = helper;
  this.master = this._helper._ether.masterAccount;
  this.accountsUsed = [];
}

AccountHelper.prototype.create = function() {
  var address = this._helper._ether.takeAccount();
  this.accountsUsed.push(address);
  console.log('created account', address);
  return address;
};

AccountHelper.prototype.createWithJustOver = function(weiAmount) {
  var address = this.create();
  var adjustedAmount = this._helper.math.add(weiAmount, this._helper.math.toWei(50, 'finney'));
  var txnObj = {
    from: this.master,
    to: address,
    value: adjustedAmount
  };
  console.log('sending', txnObj.value.toString(), 'to', txnObj.to);
  this._helper.txn.send(txnObj);
  return address;
};

AccountHelper.prototype.getBalance = function(address) {
  return this._helper._ether.getBalance(address);
};

AccountHelper.prototype._cleanup = function() {
  var self = this;
  this.accountsUsed.forEach(function (address) {
    self._helper._ether.returnAccount(address);
  });
};

exports = module.exports = AccountHelper;
