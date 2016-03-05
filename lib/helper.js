var AssertionError = require('./assertion-error.js');
var AccountHelper = require('./account-helper.js');
var MathHelper = require('./math-helper.js');
var BackOffHelper = require('./backoff-helper.js');

function Helper(wrapper, emitter, ether) {
  this._wrapper = wrapper;
  this._emitter = emitter;
  this._ether = ether;
  this.account = new AccountHelper(this);
  this.math = new MathHelper(this);
  this.backOff = new BackOffHelper(this);
}

Helper.prototype.createContractInstance = function(name, params, txnObj) {
};

Helper.prototype.fromWei = function(amount, toUnit) {
  return this._ether.web3.fromWei(amount, toUnit);
};

Helper.prototype.toWei = function(amount, fromUnit) {
  return this._ether.web3.toWei(amount, fromUnit);
};

Helper.prototype.assert = function(condition, message) {
  if (!condition) {
    throw new AssertionError(message, true, condition);
  }
};

Helper.prototype._ready = function() {
  return true;
};

Helper.prototype._beforeStep = function() {
};

Helper.prototype._cleanup = function() {
};

exports = module.exports = Helper;
