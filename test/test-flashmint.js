// Hardhat-based test
const { expect } = require("chai");
const { ethers, deployments, getNamedAccounts } = require('hardhat');
const { BN, expectRevert } = require('@openzeppelin/test-helpers')
const { web3 } = require("@openzeppelin/test-helpers/src/setup")
require("@nomiclabs/hardhat-ethers");

describe("Flash Mint SATOSHI ", function() {

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
let flashmint;
let flashmint_address;

let user1Obj;
let user2Obj;
let user3Obj;
let deployer;
let user1;
let user2;

    beforeEach(async function() {
    const [deployerObj, _user1Obj, _user2Obj, _user3Obj] = await ethers.getSigners();
    user1Obj = _user1Obj;
    user2Obj = _user2Obj;
    user3Obj = _user3Obj;

    deployer = (deployerObj.address).toString();
    user1 = (_user1Obj.address).toString();
    user2 = (_user2Obj.address).toString();
    user3 = (_user3Obj.address).toString();

    });

    it("deployment", async function() {
      console.log("");
      console.log("- deployment");
      
  　  const SATOSHI = await ethers.getContractFactory("SATOSHI")
 　   satoshi = await SATOSHI.deploy();
  　  await satoshi.deployed();
 　   satoshi_address = satoshi.address;

    　const depositRBTC_Tx = await satoshi.connect(user2Obj).depositRBTC({value:BTC_AMT_10});
    　await depositRBTC_Tx.wait();

      const FlashMintTest = await ethers.getContractFactory("FlashMintTest")
      flashmint = await FlashMintTest.deploy(satoshi_address);
      await flashmint.deployed();
      flashmint_address = flashmint.address;
    });

    it("Normal flashmint", async function () {
     console.log("");
     console.log("- Normal flashmint"); 

     const flashMint_Tx = await flashmint.connect(user3Obj).flashMint(SATOSHI_AMT_100M)
     await flashMint_Tx.wait();

     const balanceAfter = await satoshi.balanceOf(user3);
     expect(await balanceAfter.toString()).to.equal((0).toString());
     const flashBalance = await flashmint.flashBalance();
     expect(await flashBalance.toString()).to.equal(SATOSHI_AMT_100M);
     const flashValue = await flashmint.flashValue();
     expect(await flashValue.toString()).to.equal(SATOSHI_AMT_100M);
     const flashSender = await flashmint.flashSender();
     expect(await flashSender.toString()).to.equal(flashmint_address);
    });

    it("FlashMint 0 input", async function () {
     console.log("");
     console.log("- flashmint 0 input");
     const zero = "0";
     await expectRevert(flashmint.connect(user3Obj).flashMint(zero),  "SATOSHI: Amount Zero");
    });

    it("FlashMint over Max limit", async function () {
     console.log("");
     console.log("- flashmint over max");
     const celing = await satoshi.getCeiling();
     console.log("ceiling: "+celing);
     // const over_ceiling = (Number(celing) + Number(1)).toString(); 
     const over_ceiling = "100000000000000000000000001";
     await expectRevert(flashmint.connect(user3Obj).flashMint(over_ceiling),  "SATOSHI: Amount exceeds the limit");
    });

    it("FlashMint Steal", async function () {
     console.log("");
     console.log("- flashmint steal");  
     await expectRevert(flashmint.connect(user3Obj).flashMintAndSteal(SATOSHI_AMT_100M),  "ERC20: burn amount exceeds balance");
    });

    it("FlashMint Reentrancy", async function () {
     console.log("");
     console.log("- flashmint reentrancy");  
     await expectRevert(flashmint.connect(user3Obj).flashMintAndReenter(SATOSHI_AMT_100M),  "ReentrancyGuard: reentrant call");
    });

    it("FlashMint Withdraw", async function () {
     console.log("");
     console.log("- flashmint withdraw");  
     await expectRevert(flashmint.connect(user2Obj).flashMintAndWithdraw(SATOSHI_AMT_100M),  "ReentrancyGuard: reentrant call");
    });
 });
