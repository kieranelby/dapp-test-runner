# dapp-test-runner
Ethereum DApp Test Runner, tool to check Ethereum contracts work as expected.

## About

TODO

## Requirements

 * node.js
 * geth Ethereum node running on testnet
 * an Ethereum account with some ether
 * solc solidity compiler
 * the source of the contract you want to test

## Tutorial

Let's suppose you want to test this Solidity contract ([Auction.sol](../examples/Auction.sol)) which implements a simple auction:

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

Create a Javascript file for your tests ([test-auction.js](../examples/test-auction.js), say). Start by creating a new dapp-test-runner like this:

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
runner.addTest({
	title: 'Create Auction',
	steps: [
	  function(helper) {
	  	this.auction = helper.createContractInstance('Auction');
	  }
	]
});
```

Add a final line to your test-auction.js file to actually run the tests:

```javascript
runner.run('test-action-report.html');
```

Let's try it out:

```
node test-auction.js
```

