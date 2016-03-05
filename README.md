# dapp-test-runner
Ethereum DApp Test Runner, a tool to check Ethereum contracts work as you expect.

## About

There are better general-purpose Javascript test runners out there (like [mocha.js](/mochajs/mocha)),
but dapp-test-runner helps you write tests for your Ethereum contracts by making it easy to:
 * wait for transactions from one test step to be mined before starting the next step of the test;
 * keep tests independent by creating fresh contract instances and test accounts;
 * run multiple tests in parallel (useful since waiting for blocks can take a while);
 * make assertions about Wei amounts;
 * create test accounts, send ether to them, and sweep it back again afterwards;
 * produce a test report you can include with your DApp to show it has been tested;
 * measure test coverage using the Ethereum Virtual Machine.

## Requirements

 * node.js;
 * geth Ethereum node running on testnet with some ether;
 * solc solidity compiler;
 * the source of the contract you want to test.

## Tutorial

### Getting Started

Let's suppose you want to test this Solidity contract ([Auction.sol](/kieranelby/dapp-test-runner-examples/blob/master/Auction.sol)) which implements a simple auction:

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

Create a Javascript file for your tests ([test-auction.js](/kieranelby/dapp-test-runner-examples/blob/master/test-auction.js), say). Start by creating a new dapp-test-runner like this:

```javascript
var DAppTestRunner = require('dapp-test-runner');
var runner = new DAppTestRunner('Action Test Suite');
```

Then register the contract we want to test with the runner, like this:

```javascript
var fs = require('fs');
var auctionContractSource = fs.readFileSync('Auction.sol', 'utf8');
runner.registerSolidityContracts(auctionContractSource);
```

Now let's create our first test.

```javascript
// Our first test.
runner.addTest({
	title: 'New Auction has expected properties',
	steps: [
	  function(helper) {
	    // Given a newly created one-hour auction on behalf of a particular beneficiary
	    this.beneficiary = helper.account.create();
	    this.biddingTime = 60 * 60;
	  	this.auction = helper.createContractInstance(
	  	  'Auction', [this.beneficiary, this.biddingTime]);
	  },
	  function(helper) {
	    // When we examine the properties of the auction
	    // Then they look as expected:
	    helper.math.assertEqual(0, this.auction.highestBid(),
	      'highest bid should be zero for a new auction');
	    helper.math.assertEqual(0, this.auction.highestBid(),
	      'highest bid should be zero for a new auction');
	  }
	]
});
```

Add a final line to your test-auction.js file to actually run the tests:

```javascript
runner.run('test-auction-report.html');
```

Let's try it out:

```
node test-auction.js
```

### Common Problems Running the Runner


### Adding Some More Interesting Tests


### Reporting

## Real World Example

TODO - link to the King of the Ether Throne once got it working ...
