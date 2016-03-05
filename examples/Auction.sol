// An example of a contract we can test with dapp-test-runner.
// Simplified slightly from http://solidity.readthedocs.org/en/latest/solidity-by-example.html.
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