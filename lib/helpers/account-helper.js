function AccountHelper(helper, nodeNumber) {
  this._helper = helper;
  this.master = this._helper._ether.getMasterAccount();
  this.accountsUsed = [];
  if (!nodeNumber) {
    this._nodeNumber = 1;
    this.node1 = this;
    for (var nodeNumber = 2; nodeNumber <= this._helper._ether.getNumNodes(); nodeNumber++) {
      this['node' + nodeNumber] = new AccountHelper(helper, nodeNumber);
    }
  } else {
    this._nodeNumber = nodeNumber;
  }
}

AccountHelper.prototype.create = function() {
  var account = this._helper._ether.takeAccount(this._nodeNumber);
  this.accountsUsed.push(account);
  this._helper._emitter.emit('testTookAccount', this._helper._wrapper, account, this._nodeNumber);
  return account;
};

AccountHelper.prototype.createWith = function(weiAmount) {
  var address = this.create();
  var txnObj = {
    to: address,
    value: weiAmount,
    nodeNumber: this._nodeNumber
  };
  this._helper.txn.send(txnObj);
  return address;
};

AccountHelper.prototype.createWithJustOver = function(weiAmount) {
  var adjustedAmount = this._helper.math.add(weiAmount, this._helper.math.toWei(100, 'finney'));
  return this.createWith(adjustedAmount);
};

AccountHelper.prototype.getBalance = function(address) {
  return this._helper._ether.getBalance(address, this._nodeNumber);
};

AccountHelper.prototype._cleanup = function() {
  var self = this;
  this.accountsUsed.forEach(function (account) {
    self._helper._ether.returnAccount(account);
    self._helper._emitter.emit('testReturnedAccount', self._helper._wrapper, account, self._nodeNumber);
  });
};

exports = module.exports = AccountHelper;
