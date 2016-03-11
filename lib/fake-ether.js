var Web3 = require('web3');

function Ether() {
  this._realWeb3 = new Web3();
  this.web3 = {};
  this.web3.fromWei = this._realWeb3.fromWei;
  this.web3.toWei = this._realWeb3.toWei;
  this.masterAccount = undefined;
  this.testPassphrase = 'password';
}

Ether.prototype.initialise = function() {
};

Ether.prototype.ready = function() {
  return true;
};

Ether.prototype.takeAccount = function() {
};

Ether.prototype.returnAccount = function(address) {
};

exports = module.exports = Ether;
