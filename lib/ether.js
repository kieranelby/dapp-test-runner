var Web3 = require('web3');

function Ether(runner) {
  this.runner = runner;
  this.web3 = new Web3();
  this.masterAccount = undefined;
  this.testPassphrase = 'password';

  this._availableAccountsSet = {};
  this._inUseAccountsSet = {};
  this._sweepingAccountsMap = {};
  this.registeredContracts = {};
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
  if (this.web3.eth.syncing) {
    return false;
  }
  return true;
};

Ether.prototype.beforeStep = function() {
  this.web3.eth.defaultAccount = this.masterAccount;
};

Ether.prototype.getRegisteredContract = function(name) {
  if (this.registeredContracts[name] === undefined) {
    throw new Error('no contract called ' + name + ' registered');
  }
  return this.registeredContracts[name];
};

Ether.prototype.registerContract = function(name, abi, bytecode, optionalSoliditySource) {
  if (this.registeredContracts[name] !== undefined) {
    throw new Error('contract called ' + name + ' already registered');
  }
  this.registeredContracts[name] = {abi: abi, bytecode: bytecode, soliditySource: optionalSoliditySource};
  this.runner._emitter.emit('contractRegistered', this.runner, name);
};

Ether.prototype.registerSolidityContracts = function(soliditySource) {
  // cross-platform, support compiling via web3, try other paths
  var child_process = require('child_process');
  var rawOutput = child_process.execSync('solc.exe --combined-json abi,bin', {
    cwd: 'C:/Program Files/Ethereum',
    input: soliditySource,
    timeout: 10 * 1000
  });
  var output = JSON.parse(rawOutput);
  console.log('compiled solidity code to: ', output);
  var contracts = output.contracts;
  for (var name in contracts) {
    if (contracts.hasOwnProperty(name)) {
      var contract = contracts[name];
      this.registerContract(name, JSON.parse(contract.abi), contract.bin, soliditySource);
    }
  }
};

Ether.prototype.createContractInstance = function(name, paramsArray, txnObj) {
  var registeredContract = this.registeredContracts[name];
  if (registeredContract === undefined) {
    throw new Error('no contract called ' + name + ' has been registered');
  }
  var contract = this.web3.eth.contract(registeredContract.abi);
  if (!paramsArray) {
    paramsArray = [];
  }
  if (!txnObj) {
    txnObj = {};
  }
  if (!txnObj.gas) {
    txnObj.gas = 3000000;
  }
  if (!txnObj.from) {
    txnObj.from = this.masterAccount;
  }
  delete txnObj.to;
  txnObj.data = registeredContract.bytecode;
  var callArgs = paramsArray.slice();
  callArgs.push(txnObj);
  var contractInstance = contract.new.apply(contract, callArgs);
  return contractInstance;
};

Ether.prototype.send = function(txnObj) {
  if (!txnObj.from) {
    txnObj.from = this.masterAccount;
  }
  return this.web3.eth.sendTransaction(txnObj);
};

Ether.prototype.getBalance = function(address) {
  return this.web3.eth.getBalance(address);
};

Ether.prototype.isTransactionMined = function(txnHash) {
  var receipt = this.web3.eth.getTransactionReceipt(txnHash);
  if (!receipt) {
    return false;
  } else {
    return true;
  }
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
    this.runner._log('sweeping', txn.value.toString(), 'back from account', txn.from);
    var txnHash = eth.sendTransaction(txn);
    return txnHash;  
  } else {
    return undefined;
  }
};

Ether.prototype._checkSwept = function(account) {
  var txnHash = this._sweepingAccountsMap[account];
  if (!this.web3.eth.getTransactionReceipt(txnHash)) {
    return false;
  }
  this.runner._log('swept account', account);
  delete this._sweepingAccountsMap[account];
  this._availableAccountsSet[account] = true;
  return true;
};

Ether.prototype.anySweepsInProgress = function() {
  for (var account in this._sweepingAccountsMap) {
    if (this._sweepingAccountsMap.hasOwnProperty(account)) {
      if (!this._checkSwept(account)) {
        return true;
      }
    }
  }
  return false;
};

Ether.prototype.takeAccount = function() {
  var account;
  for (account in this._availableAccountsSet) {
    if (this._availableAccountsSet.hasOwnProperty(account)) {
      return this._useAccount(account);
    }
  }
  for (account in this._sweepingAccountsMap) {
    if (this._sweepingAccountsMap.hasOwnProperty(account)) {
      if (!this._checkSwept(account)) {
        continue;
      }
      return this._useAccount(account);
    }
  }
  account = this.web3.personal.newAccount(this.testPassphrase);
  this.web3.personal.unlockAccount(account, this.testPassphrase, 86400);
  return this._useAccount(account);
};

Ether.prototype._useAccount = function(account) {
  delete this._availableAccountsSet[account];
  this._inUseAccountsSet[account] = true;
  return account;
};

Ether.prototype.returnAccount = function(account) {
  var txnHash = this._sweep(account);
  if (!txnHash) {
    this._availableAccountsSet[account] = true;
  } else {
    this._sweepingAccountsMap[account] = txnHash;
  }
};

Ether.prototype.getLatestBlockTime = function() {
  return this.web3.eth.getBlock('latest').timestamp;
};

Ether.prototype._extendWeb3 = function (web3) {

  function toStringVal(val) {
    return String(val);
  }

  function toBoolVal(val) {
    if (String(val) == 'true') { // jshint ignore:line
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
