var Web3 = require('web3');

function Ether() {
  this.web3 = new Web3();
  this.masterAccount = undefined;
  this.testPassphrase = 'password';

  this._availableAccountsSet = {};
  this._inUseAccountsSet = {};
  this._sweepingAccountsMap = {};
}

Ether.prototype.initialise = function() {
  // TODO
  var defaultWeb3Url = 'http://localhost:8646';
  this.web3.setProvider(new this.web3.providers.HttpProvider(defaultWeb3Url));
  if (!this.web3.personal) {
    this._extendWeb3(this.web3);
  }
  this._scanAccounts();
};

Ether.prototype._scanAccounts = function() {
  if (this.web3.eth.accounts.length < 1) {
    throw new Error('no accounts found');
  }
  if (this.masterAccount === undefined) {
    this.masterAccount = this.web3.eth.accounts[0];
  }
  var masterAccountFound = false;
  for (var i = 0; i < this.web3.eth.accounts.length; i++) {
    var account = this.web3.eth.accounts[i];
    if (account === this.masterAccount) {
      masterAccountFound = true;
      continue;
    }
    var usable = false;
    try {
      this.web3.eth.sign(account, 'dummy');
      usable = true;
    } catch (e1) {
      try {
        this.web3.personal.unlockAccount(account, this.testPassphrase, 86400);
        usable = true;
      } catch (e2) {
      }
    }
    if (usable) {
      var txnHash = this._sweep(account);
      if (txnHash === undefined) {
        this._availableAccountsSet[account] = true;
      } else {
        this._sweepingAccountsMap[account] = txnHash;
      }
    }
  }
  if (!masterAccountFound) {
    throw new Error('specified master account ' + this.masterAccount + ' not found');
  }
};

Ether.prototype.ready = function() {
  return true;
};

Ether.prototype._sweep = function(account) {
  var eth = this.web3.eth;
  var balance = eth.getBalance(account);
  var txn = {
    from: account,
    to: this.masterAccount,
    value: balance
  };
  // bizarrely this makes txn.value lose its bignum-ness!
  var estGasAmt = eth.estimateGas(txn);
  var estGasCost = eth.gasPrice.mul(estGasAmt);
  txn.gas = estGasAmt;
  txn.value = balance.sub(estGasCost);
  if (txn.value.greaterThan(0)) {
    var txnHash = eth.sendTransaction(txn);
    return txnHash;  
  } else {
    return undefined;
  }
};

Ether.prototype.takeAccount = function() {
  var account;
  for (account in this._availableAccountsSet) {
    if (!this._availableAccountsSet.hasOwnProperty(account)) {
      continue;
    }
    delete this._availableAccountsSet[account];
    return this._use(account);
  }
  for (account in this._sweepingAccountsMap) {
    if (!this._sweepingAccountsMap.hasOwnProperty(account)) {
      continue;
    }
    var sweepTxnHash = this._sweepingAccountsMap[account];
    if (!this.web3.eth.getTransactionReceipt(txnHash)) {
      continue;
    }
    delete this._sweepingAccountsMap[account];
    return this._use(account);
  }
  account = this.web3.personal.newAccount(this.testPassphrase);
  this.web3.personal.unlockAccount(account, this.testPassphrase, 86400);
  return this._use(account);
};

Ether.prototype._useAccount = function(account) {
  this._inUseAccountsSet[account] = true;
  return account;
};

Ether.prototype.returnAccount = function(address) {
};

Ether.prototype._extendWeb3 = function (web3) {

  function toStringVal(val) {
    return String(val);
  }

  function toBoolVal(val) {
    if (String(val) == 'true') {
      return true;
    } else {
      return false;
    }
  }

  function toIntVal(val) {
    return parseInt(val);
  }

  function toJSONObject(val) {
    try {
      return JSON.parse(val);
    } catch (e){
      return String(val);
    }
  }

  web3._extend({
    property: 'personal',
    methods: [new web3._extend.Method({
         name: 'unlockAccount',
         call: 'personal_unlockAccount',
         params: 3,
         inputFormatter: [web3._extend.utils.toAddress, toStringVal, toIntVal],
         outputFormatter: toBoolVal
    })]
  });

  web3._extend({
    property: 'personal',
    methods: [new web3._extend.Method({
         name: 'newAccount',
         call: 'personal_newAccount',
         params: 1,
         inputFormatter: [toStringVal],
         outputFormatter: toStringVal
    })]
  });

  web3._extend({
    property: 'personal',
    methods: [new web3._extend.Method({
         name: 'listAccounts',
         call: 'personal_listAccounts',
         params: 0,
         outputFormatter: toJSONObject
    })]
  });

  web3._extend({
    property: 'personal',
    methods: [new web3._extend.Method({
         name: 'deleteAccount',
         call: 'personal_deleteAccount',
         params: 2,
         inputFormatter: [web3._extend.utils.toAddress, toStringVal],
         outputFormatter: toBoolVal
    })]
  });

};

exports = module.exports = Ether;
