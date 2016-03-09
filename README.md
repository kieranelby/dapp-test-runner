# dapp-test-runner
dapp-test-runner is a tool to check Ethereum contracts work as you expect.

## About

There are better general-purpose Javascript test runners out there (such as [mocha.js](/mochajs/mocha)),
but dapp-test-runner helps you write tests for your Ethereum contracts by making it easy to:
 * keep tests independent by creating fresh contract instances and test accounts;
 * wait for transactions from one test step to be mined before starting the next step of the test (without getting into callback hell);
 * run multiple tests in parallel (a big speed-up since waiting for blocks can take a while);
 * perform artihmetic and assertions about Wei amounts;
 * create test accounts, send ether to them, and automatically sweep the ether back again afterwards;
 * produce a test report you can include with your DApp to show it has been tested;
 * measure test coverage using the Ethereum Virtual Machine (coming soon).

## Requirements

 * node.js (for now - browser compatibility coming soon);
 * eth or geth Ethereum node running on testnet with some ether;
 * the solidity source code or the bytecode for the contract you want to test;
 * solc solidity compiler (if you want to use solidity source code).

## Example

Suppose you want to test this Solidity contract ([Auction.sol](/kieranelby/dapp-test-runner-examples/blob/master/Auction.sol)) which implements a simple auction:

```
contract Auction {

  address public beneficiary;
  uint public auctionEndAt;
  address public highestBidder;
  uint public highestBid;
  bool public ended;

  /// Create a simple auction with `_biddingTime` seconds bidding time
  /// on behalf of the beneficiary address `_beneficiary`.
  function SimpleAuction(uint _biddingTime, address _beneficiary) {
    beneficiary = _beneficiary;
    auctionEndAt = now + _biddingTime;
  }

  /// Bid on the auction with the value sent together with this transaction.
  /// The value will be refunded if the auction is not won.
  function bid() {
    if (now > auctionEndAt) {
      throw; // too late
    }
    if (msg.value <= highestBid) {
      throw; // too low
    }
    if (highestBidder != 0) {
      // refund previous highest bidder
      highestBidder.send(highestBid);
    }
    highestBidder = msg.sender;
    highestBid = msg.value;
  }

  /// End the auction and send the highest bid to the beneficiary.
  function auctionEnd() {
    if (now <= auctionEndAt) {
      throw; // auction did not yet end
    }
    if (ended) {
      throw; // this function has already been called
    }
    beneficiary.send(this.balance);
    ended = true;
  }

  // Assume any ether sent to the contract is an attempt to bid.
  function () {
    bid();
  }

}
```

Create a Javascript file for your tests ([test-auction.js](/kieranelby/dapp-test-runner-examples/blob/master/test-auction.js), say).

Start by creating a new dapp-test-runner like this:

```javascript
var DAppTestRunner = require('dapp-test-runner');
var runner = new DAppTestRunner('Auction Test Suite');
var fs = require('fs'); // we'll need this later to read/write files
```

Then register the contract under test with the runner:

```javascript
var auctionContractSource = fs.readFileSync('Auction.sol', 'utf8');
runner.registerSolidityContracts(auctionContractSource);
```

Now let's create our first test:

```javascript
// Our very first test.
runner.addTest({
  title: 'First bid becomes highest bid',
  steps: [
    function(helper) {
      // Given a newly created auction and an account called 'Alice' ready to bid
      this.beneficiary = helper.account.create();
      this.auction = helper.createContractInstance('Auction', [this.beneficiary, 60*60]);
      this.aliceBid = helper.toWei('100','finney');
      this.alice = helper.account.createWithJustOver(this.aliceBid);
    },
    function(helper) {
      // When Alice bids on the auction
      this.auction.bid({
        from: this.alice,
        value: this.aliceBid,
        gas: 200000
      });
    },
    function(helper) {
      // Then the highest bid and higest bidder change correctly
      helper.assertEqual(this.aliceBid, this.auction.highestBid(),
        'first bid should become highest bid');
      helper.assertEqual(this.alice, this.auction.highestBidder(),
        'alice should become highest bidder');
    }
  ]
});
```

And another one:

```javascript
// Our second test.
runner.addTest({
  title: 'TODO',
  steps: [
  ]
});
```

Add a final line to your test-auction.js file to actually run the tests and write a report:

```javascript
var results = runner.run();
fs.writeFileSync('test-auction-report.html', results.getHtmlReport(), 'utf8');
```

Let's try it out.

First, start eth/geth running on the testnet with the extra RPC APIs enabled, on the port dapp-test-runner expects (8646), and with the master account unlocked:

```
geth --testnet --rpc --rpcport 8646 --rpcapi "eth,web3,personal" --unlock 0
```

Then run your tests with:

```
node test-auction.js
```

It will log what it is doing to the console. Here's what the report should look like if it all works: [test-auction-report.html](/kieranelby/dapp-test-runner-examples/blob/master/test-auction-report.html).

## Troubleshooting Common Problems

TODO ...

- not enough ether
- master account not unlocked
- personal api not available via RPC
- testnet not sync-ed
- transactions not being mined
- contract not usable until next step
- account not funded until next step
- not enough gas

## Real World Example

TODO - link to the King of the Ether Throne once got it working ...

## dapp-test-runner in Depth

### How dapp-test-runner uses accounts and ether

dapp-test-runner assumes your first geth account is the "master" account for it to get funds from. This account must either already be unlocked or have the passphrase supplied to dapp-test-runner via `runner.setMasterAccountPassphrase()`.

All other geth accounts are assumed to be existing dapp-test-runner test accounts with passphrase "password". dapp-test-runner will use these accounts in tests that make use of `helper.account.create()`.

If a test asks for an account with funds by calling `helper.account.createWithJustOver(weiAmount)`, dapp-test-runner will move funds from the master account to the test account. dapp-test-runner will create new test accounts (with passphrase "password") if it runs out of existing ones to use.

Make sure you have plenty of ether - you can CPU mine on the public testnet to get some. Or use a private testnet with allocated funds in the genesis block - this will be also faster to run test since you can decrease the difficulty for quicker block times, though one downside is that you can't use online chain explorers.

Before and after running tests, dapp-test-runner will "sweep" funds from the test accounts back to the master account.

You can help preserve ether that would otherwise be stuck in contracts by including a "kill" function in your contract and calling it from your test cleanup function.

You should generally write your tests to use test accounts they have requested with `helper.account.create()` or `helper.account.createWithJustOver(weiAmount)` rather than using the master account.

Using separate test accounts for each test is desirable since dapp-test-runner runs tests in parallel for speed - the balance of the master account will often change unpredictably during your test as funds are moved in and out of it by other tests.

However, using the master account is a reasonable thing to do if you don't care about the balance and want to minimise the number of transactions. The address of the master account is available at  `helper.account.master`.

The default account for transactions, contract creation, and contract invocations is the master account, but you can choose the account for a transaction by supplying a txnObj - e.g.

to-do

todo - can we detect Ctrl-C in node.js and clean-up nicely?

### Understanding test steps and waiting for transactions

Often when writing a test for a DApp we want to do something like this:

create a contract;
... wait for it to be mined;
interact with the contract, sending some ether;
... wait for transaction to be mined;
perform some other interaction with the contract which sends some ether;
... wait for transaction to be mined;
make some assertions about balances and contract state.

To achieve the waiting, you _could_ use callbacks directly or via a library like <insert js library> .

However, our experience has been that tests are easier to read, easier to write, and easier to run efficiently if callbacks are avoided by breaking the test into "steps" and letting dapp-test-runner take care of knowing when to call the next step.

To-do: example.
runner.addTest({
title: '',
steps: [
]});

Most helper functions that generate an Ethereum transaction "do the right thing" by automatically making the next step wait for their transaction to be mined (to-do example).

If you need to, you can control when the next step is allowed to start using the helper.nextStep functions:

- [`helper.nextStep.needsTxnMined(txnHash)`](docs/helper.nextStep.md)
- [`helper.nextStep.needsBlockTime(blockTimestamp)`](docs/helper.nextStep.md)
- [`helper.nextStep.needsClockTime(jsDate)`](docs/helper.nextStep.md)
- [`helper.nextStep.needsPredicate(predicateFn)`](docs/helper.nextStep.md)

It is also possible to achieve a similar effect with the helper.backOff functions - these cause the current step to stop and retry itself later:

- [`helper.backOff.untilTxnMined(txnHash)`](docs/helper.nextStep.md)
- [`helper.backOff.untilBlockTime(blockTimestamp)`](docs/helper.nextStep.md)
- [`helper.backOff.untilClockTime(jsDate)`](docs/helper.nextStep.md)
- [`helper.backOff.untilPredicate(predicateFn)`](docs/helper.nextStep.md)

Normally a call to helper.backOff should be the first line of the test step.

For example, ... TODO ...

You can set a time-out on a specific test by specifying a `completionTimeoutSeconds` property on the test object you pass to `runner.addTest(testObj)`.

### Built-in Contracts

dapp-test-runner includes

## API Documentation

### Runner API Index

- [`var runner = new DAppTestRunner(suiteName)`](docs/runner.md)
- [`runner.setWeb3RpcUrl(web3RpcUrl)`](docs/runner.md)
- [`runner.setMasterAccountPassphrase(passphrase)`](docs/runner.md)
- [`runner.addTest(testObject)`](docs/runner.md)
- [`runner.registerContract(contractName, contractAbi, contractBytecode)`](docs/runner.md)
- [`runner.registerSolidityContract(soliditySourceCode)`](docs/runner.md)
- [`var results = runner.run()`](docs/runner.md)

### Results API Index

- [`var results = runner.run();`](docs/results.md)
- [`results.allPassed`](docs/results.md)
- [`results.skippedCount`](docs/results.md)
- [`results.failedCount`](docs/results.md)
- [`results.passedCount`](docs/results.md)
- [`results.computeCoverage()`](docs/results.md)
- [`var html = results.getHtmlReport();`](docs/results.md)

### Test Helper API Index

#### Accounts

- [`var address = helper.account.create()`](docs/helper.account.md)
- [`var address = helper.account.createWithJustOver(weiAmount)`](docs/helper.account.md)
- [`var address = helper.account.master`](docs/helper.account.md)
- [`var weiAmount = helper.account.balance(address)`](docs/helper.account.md)

#### Contracts

- [`var contract = helper.contract.createInstance(name, paramsArray, transactionObj)`](docs/helper.contract.md)

#### Maths

- [`var ethAmount = helper.fromWei(weiAmount, toUnit)`](docs/helper.math.md)
- [`var weiAmount = helper.toWei(amount, fromUnit)`](docs/helper.math.md)
- [`var bigNum = helper.math.toNum('numericValue')`](docs/helper.math.md)
- [`var sign = helper.math.cmp(numericValueA, numericValueB)`](docs/helper.math.md)
- [`var answerBigNum = helper.math.add(numericValueA, numericValueB)`](docs/helper.math.md)
- [`var answerBigNum = helper.math.subtract(numericValueA, numericValueB)`](docs/helper.math.md)

#### Assertions

- [`helper.assert.fail(message)`](docs/helper.assert.md)
- [`helper.assert.true(condition, message)`](docs/helper.assert.md)
- [`helper.assert.equal(expectedValue, actualValue, message)`](docs/helper.assert.md)
- [`helper.math.assertEqual(expectedNumericValue, actualNumericValue, message)`](docs/helper.math.md)
- [`helper.math.assertLessThan(actualNumericValue, comparedToNumericValue, message)`](docs/helper.math.md)
- [`helper.math.assertGreaterThan(actualNumericValue, comparedToNumericValue, message)`](docs/helper.math.md)
- [`helper.math.assertLessThanOrEqual(actualNumericValue, comparedToNumericValue, message)`](docs/helper.math.md)
- [`helper.math.assertGreaterThanOrEqual(actualNumericValue, comparedToNumericValue, message)`](docs/helper.math.md)
- [`helper.math.assertRoughlyEqual(expectedNumericValue, actualNumericValue, withinDelta, message)`](docs/helper.math.md)

#### Waiting

- [`helper.nextStep.needsTxnMined(txnHash)`](docs/helper.nextStep.md)
- [`helper.nextStep.needsBlockTime(blockTimestamp)`](docs/helper.nextStep.md)
- [`helper.nextStep.needsClockTime(jsDate)`](docs/helper.nextStep.md)
- [`helper.nextStep.needsPredicate(predicateFn)`](docs/helper.nextStep.md)
- [`helper.backOff.untilTxnMined(txnHash)`](docs/helper.nextStep.md)
- [`helper.backOff.untilBlockTime(blockTimestamp)`](docs/helper.nextStep.md)
- [`helper.backOff.untilClockTime(jsDate)`](docs/helper.nextStep.md)
- [`helper.backOff.untilPredicate(predicateFn)`](docs/helper.nextStep.md)

#### Unsupported

- [`helper.unsupported.web3`](docs/helper.misc.md)

### Test Object API Index

- [`title`](docs/testObj.md)
- [`steps`](docs/testObj.md)
- [`cleanup`](docs/testObj.md)
- [`completionTimeoutSeconds`](docs/testObj.md)

### Contract Object API Index

TODO ... explain a bit about how these work (same as web3.eth basically).

### Transaction Object API Index

- [`from`](docs/txnObj.md)
- [`to`](docs/txnObj.md)
- [`value`](docs/txnObj.md)
- [`data`](docs/txnObj.md)
