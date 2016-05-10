function CommonFormatter() {
};

CommonFormatter.prototype.formatContractEvent = function(contractEvent) {
  if (contractEvent.event && contractEvent.args) {
    var s = '';
    s += contractEvent.event;
    s += '(';
    for (var argName in contractEvent.args) {
      if (contractEvent.args.hasOwnProperty(argName)) {
        var argValue = contractEvent.args[argName];
        s += argName;
        s += '=';
        s += argValue;
        s += ',';
      }
    };
    s += ')';
    return s;
  } else {
    return contractEvent.toString();
  }
};

CommonFormatter.prototype.formatTxnObj = function(optionalTxnObj) {
  if (optionalTxnObj === undefined) {
    return '';
  }
  var s = '{';
  if (optionalTxnObj.from !== undefined) {
    s += ' from: ' + optionalTxnObj.from;
  }
  if (optionalTxnObj.to !== undefined) {
    s += ' to: ' + optionalTxnObj.to;
  }
  if (optionalTxnObj.value !== undefined) {
    s += ' value: ' + optionalTxnObj.value;
  }
  s += ' }';
  return s;
};

CommonFormatter.prototype.quotedTitleOf = function(titledObj) {
  return '"' + titledObj.title + '"';
};

CommonFormatter.prototype.explorerTxnUrl = function(txnHash) {
  return 'http://testnet.etherscan.io/tx/' + txnHash;
};

CommonFormatter.prototype.extractLineFromErr = function(err) {
  if (!err.stack) {
    return undefined;
  }
  var lines = err.stack.split('\n');
  for (var lineIdx = 0; lineIdx < lines.length; lineIdx++) {
    var line = lines[lineIdx];
    // this is rather hopeful but it worked in my version of node.js once
    if (line.indexOf('.addTest') !== -1 || line.indexOf('.<anonymous>') !== -1) {
      return line.trim();
    }
  }
  return undefined;
};

exports = module.exports = CommonFormatter;
