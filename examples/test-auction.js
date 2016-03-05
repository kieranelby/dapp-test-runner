
// Create test runner
var DAppTestRunner = require('dapp-test-runner');
var runner = new DAppTestRunner('Action Test Suite');

// Register the contract we want to test.
var fs = require('fs');
var auctionContractSource = fs.readFileSync('Auction.sol', 'utf8');
runner.registerSolidityContracts(auctionContractSource);

// Add our first test.
runner.addTest({
	title: 'Create Auction',
	steps: [
	  function(helper) {
	  	this.auction = helper.createContractInstance('Auction');
	  }
	]
});

// Add another test.
runner.addTest();

// Run the tests.
runner.run('test-auction-report.html');