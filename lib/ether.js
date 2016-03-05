var Web3 = require('web3');

function Ether() {
  this.web3 = new Web3();
  this.masterAccount = undefined;
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
