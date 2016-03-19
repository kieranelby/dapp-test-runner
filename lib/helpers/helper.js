var AccountHelper = require('./account-helper.js');
var AssertHelper = require('./assert-helper.js');
var BackOffHelper = require('./back-off-helper.js');
var DebugHelper = require('./debug-helper.js');
var MathHelper = require('./math-helper.js');
var NextStepHelper = require('./next-step-helper.js');
var TransactionHelper = require('./transaction-helper.js');

function Helper(wrapper, emitter, ether) {
  this._wrapper = wrapper;
  this._emitter = emitter;
  this._ether = ether;
  this.debug = new DebugHelper(this);
  this.math = new MathHelper(this);
  this.txn = new TransactionHelper(this);
  this.account = new AccountHelper(this);
  this.assert = new AssertHelper(this);
  this._backOff = new BackOffHelper(this);
  this.nextStep = new NextStepHelper(this);
}

Helper.prototype._ready = function() {
  return this.nextStep._ready();
};

Helper.prototype._beforeStep = function() {
  this._ether.beforeStep();
};

Helper.prototype._cleanup = function() {
  this.account._cleanup();
  this.txn._cleanup();
};

exports = module.exports = Helper;
