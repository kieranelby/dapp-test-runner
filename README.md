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
var runner = new DAppTestRunner('Auction Tests');
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
// Run the tests.
runner.run(function (results) {
  fs.writeFileSync('test-auction-report.html', results.getHtmlReport(), 'utf-8');
});
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

### Understanding test scope, test parallelism, sharing information, and setup and cleanup.

dapp-test-runner encourages you to keep your tests independent. Each test is expected to create its own accounts and contract instances.

Test steps can save information to use in the next step by assigning to properties of the `this` variable, which refers to the test object.

To-do - good example of a test using info from one step in next step

Test steps must avoid storing information outside the test object since:

- dapp-test-runner will likely run tests in a different order depending on how quickly each transaction gets mined, which will NOT be the order they appear in your javascript file;
- dapp-test-runner will likely re-use accounts or remove funds from accounts once the test that created the account has finished, which is unlikely to end well if you've saved the account in a module / global variable and are planning to use it from another test.

`runner.disableParallelism()` can be a handy temporary measure to see if a problem goes away when you force dapp-test-runner to run tests one at a time.

To-do - bad example of two or more tests with hidden dependencies

If you do need to share information between tests, the recommended way is to create the information in a setup function registered with `runner.addRunSetupFunction(runSetupFunction)`. The run setup function will be called by the runner when `runner.run()` is called, before any of the tests start running.

Your setup function will be passed a "run helper" object. The run helper has the same properties and methods as the helper objects passed to the test step functions. However, unlike a normal helper, any accounts and contract instances created via the run helper will remain valid for the duration of the entire run.

To-do - run setup example.

Use `runner.addRunCleanupFunction(runCleanupFunction)` to register a run cleanup function to be run after all the tests finish. Individual tests can have cleanup functions too - just set a property called `cleanup` on the testObject passed to `runner.addTest(testObj)`.

dapp-test-runner may or may not share the same ethereum web3 instance between tests and between steps - avoid relying on this. Changes made to the `web3.eth.defaultAccount` property from within a test step will be undone at the end of current test step.

### Built-in Contracts

dapp-test-runner includes some Ethereum contracts that simulate scenarios that can occur. These include:

- DTR.ExpensiveWallet
- DTR.Poison

You can create these from a test with [`helper.txn.createContractInstance(name, paramsArray, transactionObj)`](docs/helper.txn.md) just like your own contracts.

## API Documentation

### Runner API Index

The runner object is your starting point for interaction with dapp-test-runner. `require('dapp-test-runner')` will give you the DAppTestRunner constructor you use to get a runner object.

Use the runner object to register contracts and add tests, then to run the tests.

- [`var runner = new DAppTestRunner(runnerName)`](docs/runner.md)
- [`runner.setWeb3RpcUrl(web3RpcUrl)`](docs/runner.md)
- [`runner.setMasterAccountPassphrase(passphrase)`](docs/runner.md)
- [`runner.disableParallelism()`](docs/runner.md)
- [`runner.registerContract(contractName, contractAbi, contractBytecode)`](docs/runner.md)
- [`runner.registerSolidityContract(soliditySourceCode)`](docs/runner.md)
- [`runner.addRunSetupFunction(runSetupFunction)`](docs/runner.md)
- [`runner.addRunCleanupFunction(runCleanupFunction)`](docs/runner.md)
- [`runner.addTest(testObject)`](docs/runner.md)
- [`runner.run(runCompletedFunction)`](docs/runner.md)

### Results API Index

A results object is passed to the runCompletedFunction you gave to `runner.run(runCompletedFunction)`. It tells you whether the tests passed.

- [`results.allPassed`](docs/results.md)
- [`results.skippedCount`](docs/results.md)
- [`results.failedCount`](docs/results.md)
- [`results.passedCount`](docs/results.md)
- [`results.getHtmlReport();`](docs/results.md)

### Test Helper API Index

A test helper object is passed to each step of each of your tests. This object provides almost everything you need during the execution of a test.

Use the helper to create Ethereum accounts and contracts, to check amounts, to send transactions, and to make assertions.

#### Accounts

- [`var address = helper.account.create()`](docs/helper.account.md)
- [`var address = helper.account.createWithJustOver(weiAmount)`](docs/helper.account.md)
- [`var address = helper.account.master`](docs/helper.account.md)
- [`var weiAmount = helper.account.getBalance(address)`](docs/helper.account.md)

### Contracts and Transactions

- [`var contract = helper.txn.createContractInstance(name, paramsArray, transactionObj)`](docs/helper.txn.md)
- [`var txnHash = helper.txn.send(transactionObj)`](docs/helper.txn.md)
- [`helper.txn.rawWeb3`](docs/helper.txn.md)
- [`helper.txn.recordOtherTransaction(txnHash)`](docs/helper.txn.md)

#### Maths

- [`var ethAmount = helper.math.fromWei(weiAmount, toUnit)`](docs/helper.math.md)
- [`var weiAmount = helper.math.toWei(amount, fromUnit)`](docs/helper.math.md)
- [`var bigNum = helper.math.toNumber('numericValue')`](docs/helper.math.md)
- [`var sign = helper.math.compare(numericValueA, numericValueB)`](docs/helper.math.md)
- [`var answerBigNum = helper.math.add(numericValueA, numericValueB)`](docs/helper.math.md)
- [`var answerBigNum = helper.math.subtract(numericValueA, numericValueB)`](docs/helper.math.md)

#### Assertions

- [`helper.assert.fail(message)`](docs/helper.assert.md)
- [`helper.assert.isTrue(condition, message)`](docs/helper.assert.md)
- [`helper.assert.equal(expectedValue, actualValue, message)`](docs/helper.assert.md)
- [`helper.math.assertEqual(expectedNumericValue, actualNumericValue, message)`](docs/helper.assert.md)
- [`helper.math.assertRoughlyEqual(expectedNumericValue, actualNumericValue, withinDelta, message)`](docs/helper.math.md)
- [`helper.math.assertLessThan(actualNumericValue, comparedToNumericValue, message)`](docs/helper.math.md)
- [`helper.math.assertGreaterThan(actualNumericValue, comparedToNumericValue, message)`](docs/helper.math.md)
- [`helper.math.assertLessThanOrEqual(actualNumericValue, comparedToNumericValue, message)`](docs/helper.math.md)
- [`helper.math.assertGreaterThanOrEqual(actualNumericValue, comparedToNumericValue, message)`](docs/helper.math.md)

#### Waiting

- [`helper.nextStep.needsTxnMined(txnHash)`](docs/helper.nextStep.md)
- [`helper.nextStep.needsBlockTime(blockTimestamp)`](docs/helper.nextStep.md)
- [`helper.nextStep.needsClockTime(jsDate)`](docs/helper.nextStep.md)
- [`helper.nextStep.needsPredicate(predicateFn)`](docs/helper.nextStep.md)
- [`helper.backOff.untilTxnMined(txnHash)`](docs/helper.nextStep.md)
- [`helper.backOff.untilBlockTime(blockTimestamp)`](docs/helper.nextStep.md)
- [`helper.backOff.untilClockTime(jsDate)`](docs/helper.nextStep.md)
- [`helper.backOff.untilPredicate(predicateFn)`](docs/helper.nextStep.md)

### Test Object API Index

- [`title`](docs/testObj.md)
- [`steps`](docs/testObj.md)
- [`cleanup`](docs/testObj.md)
- [`completionTimeoutSeconds`](docs/testObj.md)

### Contract Object API Index

TODO ... explain a bit about how these work (same as web3.eth basically).

### Transaction Object API Index

Several functions accept a transaction object from you with the following properties:

- [`from`](docs/txnObj.md)
- [`to`](docs/txnObj.md)
- [`value`](docs/txnObj.md)
- [`data`](docs/txnObj.md)
- [`gas`](docs/txnObj.md)

## Future Directions

Planned but not yet implemented features include:

- measuring code coverage (using VM traces);
- running from browser as well as node.js;
- helping test javascript contract interface code that uses callbacks;
- helping test contract "logs" (aka solidity "events");
- (possibly) offering a hosted CI solution (a tiny bit like https://travis-ci.org/).
