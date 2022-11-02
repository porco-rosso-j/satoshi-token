// Hardhat-based test
const { expect } = require("chai");
const { ethers, deployments, getNamedAccounts } = require('hardhat');
const { BN, expectRevert } = require('@openzeppelin/test-helpers')
const { web3 } = require("@openzeppelin/test-helpers/src/setup")
require("@nomiclabs/hardhat-ethers");

// example1: https://github.com/WETH10/WETH10/blob/main/test/01_WETH10.test.js
// example2: https://github.com/SimonDeSchutter/voting_dapp/blob/master/test/Election.test.js

describe("Flash BTC", function() {

// Variables
const BTC_AMT_1 = web3.utils.toWei("1", "ether");
const BTC_AMT_5 = web3.utils.toWei("5", "ether");
const BTC_AMT_10 = web3.utils.toWei("10", "ether");

const SATOSHI_AMT_100M = web3.utils.toWei("100000000", "ether");
const SATOSHI_AMT_500M = web3.utils.toWei("500000000", "ether");
const SATOSHI_AMT_1B = web3.utils.toWei("1000000000", "ether");

// Contract Instances and addresses
let satoshi;
let satoshi_address;
let flashtest;
let flashtest_address;
let borrower_ads;

let user1Obj;
let user2Obj;
let deployer;
let user1;
let user2;

    beforeEach(async function() {
    const [deployerObj, _user1Obj, _user2Obj] = await ethers.getSigners();
    user1Obj = _user1Obj;
    user2Obj = _user2Obj;

    deployer = (deployerObj.address).toString();
    user1 = (_user1Obj.address).toString();
    user2 = (_user2Obj.address).toString();

    });

    it("deployment", async function() {
      console.log("");
      console.log("- deployment");
      
  　  const SATOSHI = await ethers.getContractFactory("SATOSHI")
 　   satoshi = await SATOSHI.deploy();
  　  await satoshi.deployed();
 　   satoshi_address = satoshi.address;

   　 borrower_ads = await satoshi.borrower_ads();

    　const depositRBTC_Tx = await satoshi.connect(user2Obj).depositRBTC({value:BTC_AMT_10});
    　await depositRBTC_Tx.wait();

      const Flashtest = await ethers.getContractFactory("FlashTest")
      flashtest = await Flashtest.deploy(borrower_ads, satoshi_address);
      await flashtest.deployed();
      flashtest_address = flashtest.address;
    });

    it("flashlon", async function () {

     console.log("");
     console.log("- flashlon");
     const _userRBTCBal = await web3.eth.getBalance(user1);
     const _satoshiRBTCBal = await web3.eth.getBalance(satoshi_address);
     console.log("_userRBTCBal: "+_userRBTCBal);
     console.log("_satoshiRBTCBal: "+_satoshiRBTCBal);
        
      // Deposit Profit 
      const privateKey = "";
      const sendTx = await user2Obj.sendTransaction({to: flashtest_address, value: web3.utils.toHex(BTC_AMT_1)})
      await sendTx.wait();

      const flashtest_balance = await web3.eth.getBalance(flashtest_address);
      console.log("flashtest_balance: "+flashtest_balance);

      // FlashLoan
 　   const flashBTC_Tx = await flashtest.connect(user1Obj).normalFlashloan(BTC_AMT_5, "5000000000000000000");
      await flashBTC_Tx.wait();

     // See Results
     const userRBTCBal = await web3.eth.getBalance(user1);
     const satoshiRBTCBal = await web3.eth.getBalance(satoshi_address);
     console.log("userRBTCBal: "+userRBTCBal);
     console.log("satoshiRBTCBal: "+satoshiRBTCBal);

      expect(await satoshiRBTCBal.toString()).to.equal(_satoshiRBTCBal.toString());

    });
    

    it("flashlon fail", async function () {

      // Deposit Profit 
      const privateKey = "";
      const sendTx = await user2Obj.sendTransaction({to: flashtest_address, value: web3.utils.toHex(BTC_AMT_1)})
      await sendTx.wait();
  
    // "SATOSHI: Amount Zero"
 　   await expectRevert(flashtest.connect(user1Obj).normalFlashloan("0", "5000000000000000000"), 
     "Error: VM Exception while processing transaction: revert SATOSHI: Amount Zero");

    // "SATOSHI: _amount exceeds the borrowable limit; RBTC in the contract"
      await expectRevert(
          flashtest
          .connect(user1Obj)
          .normalFlashloan(web3.utils.toWei("100", "ether"), "5000000000000000000"), 
          "Error: VM Exception while processing transaction: revert SATOSHI: _amount exceeds the borrowable limit; RBTC in the contract"
          );

    // "SATOSHI: Borrower failed to return the borrowed RBTC"
     await expectRevert(flashtest.connect(user1Obj).normalFlashloan(BTC_AMT_5, "4000000000000000000"), 
     "Error: VM Exception while processing transaction: revert SATOSHI: Borrower failed to return the borrowed RBTC");
      
    });
    
    it("flashloan reentrance", async function () {

      // Deposit Profit 
      const privateKey = "";
      const sendTx = await user2Obj.sendTransaction({to: flashtest_address, value: web3.utils.toHex(BTC_AMT_1)})
      await sendTx.wait();

     　await expectRevert(flashtest.connect(user1Obj).reentFalshloan(BTC_AMT_5, "5000000000000000000"), 
      "Error: VM Exception while processing transaction: revert BorrowerProxy: Borrower contract reverted during execution");
    });
    

 });
