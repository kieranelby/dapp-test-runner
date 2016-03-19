function BuiltInContracts() {
}

BuiltInContracts.prototype.register = function(runner) {

  runner.registerContract(
    'DTRRejector',
    [{"constant":false,"inputs":[],"name":"reject","outputs":[],"type":"function"}],
    '6060604052605b8060106000396000f360606040523615603a576000357c0100000000000000000000000000000000000000000000000000000000900480634dc415de14604857603a565b60465b60436055565b5b565b005b605360048050506055565b005b6002565b56'
  );

  runner.registerContract(
    'DTRExpensiveWallet',
    [{"constant":false,"inputs":[{"name":"dst","type":"address"},{"name":"val","type":"uint256"},{"name":"extraGasAmount","type":"uint256"}],"name":"spendWithGas","outputs":[],"type":"function"},{"constant":false,"inputs":[],"name":"kill","outputs":[],"type":"function"},{"constant":false,"inputs":[{"name":"dst","type":"address"},{"name":"val","type":"uint256"}],"name":"spend","outputs":[],"type":"function"},{"constant":false,"inputs":[{"name":"dst","type":"address"},{"name":"val","type":"uint256"},{"name":"extraGasAmount","type":"uint256"},{"name":"callData","type":"bytes"}],"name":"spendWithGasAndData","outputs":[],"type":"function"},{"inputs":[{"name":"eatGasAmount_","type":"uint256"}],"type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"name":"by","type":"address"}],"name":"WalletCreated","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"from","type":"address"},{"indexed":false,"name":"value","type":"uint256"}],"name":"DepositMade","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"to","type":"address"},{"indexed":false,"name":"value","type":"uint256"}],"name":"WithdrawalMade","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"from","type":"address"},{"indexed":false,"name":"versus","type":"address"}],"name":"AccessDenied","type":"event"}]
,
    '6060604052604051602080610877833981016040528080519060200190919050505b32600060006101000a81548173ffffffffffffffffffffffffffffffffffffffff02191690830217905550806001600050819055507f234cf33b32239d80b54161e2396c80cdeaf4d34161300e54d8bc01eb7c0ea553600060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff16604051808273ffffffffffffffffffffffffffffffffffffffff16815260200191505060405180910390a15b506107a2806100d56000396000f36060604052361561005e576000357c0100000000000000000000000000000000000000000000000000000000900480632cae9ca1146100ff57806341c0e1b514610129578063af7d6ca314610138578063c217a724146101595761005e565b6100fd5b600060005a91507fd15c9547ea5c06670c0010ce19bc32d54682a4b3801ece7f3ab0c3f17106b4bb3234604051808373ffffffffffffffffffffffffffffffffffffffff1681526020018281526020019250505060405180910390a1600190505b816001600050545a011015156100f85780604051808281526020019150506040518091039020600190048101905080506100c3565b5b5050565b005b6101276004808035906020019091908035906020019091908035906020019091905050610341565b005b610136600480505061067c565b005b61015760048080359060200190919080359060200190919050506101ca565b005b6101c86004808035906020019091908035906020019091908035906020019091908035906020019082018035906020019191908080601f0160208091040260200160405190810160405280939291908181526020018383808284378201915050505050509090919050506104b8565b005b600060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163273ffffffffffffffffffffffffffffffffffffffff161415156102b3577fc21bbf9d94f95c3d399c96e6e0a641c57c9d086081bf1ab101a242d646821f8032600060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff16604051808373ffffffffffffffffffffffffffffffffffffffff1681526020018273ffffffffffffffffffffffffffffffffffffffff1681526020019250505060405180910390a161033d565b8173ffffffffffffffffffffffffffffffffffffffff168160405180905060006040518083038185876185025a03f192505050507fbc158bb64f05d6383aea69bbb0b20c1bbf4b7a18f63359c5649b7c39e29d38848282604051808373ffffffffffffffffffffffffffffffffffffffff1681526020018281526020019250505060405180910390a15b5050565b600060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163273ffffffffffffffffffffffffffffffffffffffff1614151561042a577fc21bbf9d94f95c3d399c96e6e0a641c57c9d086081bf1ab101a242d646821f8032600060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff16604051808373ffffffffffffffffffffffffffffffffffffffff1681526020018273ffffffffffffffffffffffffffffffffffffffff1681526020019250505060405180910390a16104b3565b8273ffffffffffffffffffffffffffffffffffffffff16828290604051809050600060405180830381858888f19350505050507fbc158bb64f05d6383aea69bbb0b20c1bbf4b7a18f63359c5649b7c39e29d38848383604051808373ffffffffffffffffffffffffffffffffffffffff1681526020018281526020019250505060405180910390a15b505050565b600060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163273ffffffffffffffffffffffffffffffffffffffff161415156105a1577fc21bbf9d94f95c3d399c96e6e0a641c57c9d086081bf1ab101a242d646821f8032600060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff16604051808373ffffffffffffffffffffffffffffffffffffffff1681526020018273ffffffffffffffffffffffffffffffffffffffff1681526020019250505060405180910390a1610676565b8373ffffffffffffffffffffffffffffffffffffffff1683839083604051808280519060200190808383829060006004602084601f0104600f02600301f150905090810190601f1680156106095780820380516001836020036101000a031916815260200191505b50915050600060405180830381858888f19350505050507fbc158bb64f05d6383aea69bbb0b20c1bbf4b7a18f63359c5649b7c39e29d38848484604051808373ffffffffffffffffffffffffffffffffffffffff1681526020018281526020019250505060405180910390a15b50505050565b600060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163273ffffffffffffffffffffffffffffffffffffffff16141515610765577fc21bbf9d94f95c3d399c96e6e0a641c57c9d086081bf1ab101a242d646821f8032600060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff16604051808373ffffffffffffffffffffffffffffffffffffffff1681526020018273ffffffffffffffffffffffffffffffffffffffff1681526020019250505060405180910390a16107a0565b600060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16ff5b56'
  );
  
};

exports = module.exports = BuiltInContracts;