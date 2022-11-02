
// Hardhat-based test
const { expect } = require("chai");
const { ethers, deployments, getNamedAccounts } = require('hardhat');
const BigInteger = require("js-big-integer").BigInteger;
const { BN, expectRevert } = require('@openzeppelin/test-helpers')
const { web3 } = require("@openzeppelin/test-helpers/src/setup")
require("@nomiclabs/hardhat-ethers");

// example1: https://github.com/WETH10/WETH10/blob/main/test/01_WETH10.test.js
// example2: https://github.com/SimonDeSchutter/voting_dapp/blob/master/test/Election.test.js

describe("SATOSHI Basic", function() {

// Variables
const BTC_AMT_1 = web3.utils.toWei("1", "ether");
const BTC_AMT_5 = web3.utils.toWei("5", "ether");
const BTC_AMT_10 = web3.utils.toWei("10", "ether");

const SATOSHI_AMT_100M = web3.utils.toWei("100000000", "ether");
const SATOSHI_AMT_500M = web3.utils.toWei("500000000", "ether");
const SATOSHI_AMT_1B = web3.utils.toWei("1000000000", "ether");

// Contract Instances and addresses
let satoshi;
let contract_address;
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

    it("deployment", async function (){
        console.log("");
        console.log("- deployment");
        const SATOSHI = await ethers.getContractFactory("SATOSHI")
        satoshi = await SATOSHI.deploy();
        await satoshi.deployed();
        contract_address = satoshi.address;
        const satoshi_balance = await web3.eth.getBalance(contract_address);

        expect(await satoshi.name()).to.equal("SATOSHI");
        expect(await satoshi.symbol()).to.equal("SATS");
    });
    
    it("deposit 1 RBTC", async function () {
        console.log("");
        console.log("- deposit 1 RBTC");
        const _userSATSBal = await satoshi.balanceOf(user1);
        const _contractRBTCBal = await web3.eth.getBalance(contract_address);
        console.log("_userSATSBal: "+_userSATSBal);
        console.log("_contractRBTCBal: "+_contractRBTCBal);
        
        const depositRBTC_Tx = await satoshi.connect(user1Obj).depositRBTC({value:BTC_AMT_1});
        await depositRBTC_Tx.wait();

        const userSATSBal = await satoshi.balanceOf(user1);
        const contractRBTCBal = await web3.eth.getBalance(contract_address);
        console.log("userSATSBal: "+userSATSBal);
        console.log("contractRBTCBal: "+contractRBTCBal);

        expect(await userSATSBal.toString()).to.equal(_userSATSBal.add(SATOSHI_AMT_100M).toString());
        expect(await contractRBTCBal.toString()).to.equal((Number(_contractRBTCBal) + Number(BTC_AMT_1)).toString());
    });

    it("deposit RBTC to another account", async function () {
        console.log("");
        console.log("- deposit RBTC to another account");

        const _userSATSBal = await satoshi.balanceOf(user2);
        const _contractRBTCBal = await web3.eth.getBalance(contract_address);
        console.log("_userSATSBal: "+_userSATSBal);
        console.log("_contractRBTCBal: "+_contractRBTCBal);
        
        const depositRBTC_Tx = await satoshi.connect(user1Obj).depositRBTCto(user2, {value:BTC_AMT_1});
        await depositRBTC_Tx.wait();

        const userSATSBal = await satoshi.balanceOf(user2);
        const contractRBTCBal = await web3.eth.getBalance(contract_address);
        console.log("userSATSBal: "+userSATSBal);
        console.log("contractRBTCBal: "+contractRBTCBal);

        expect(await userSATSBal.toString()).to.equal(_userSATSBal.add(SATOSHI_AMT_100M).toString());
        expect(await contractRBTCBal.toString()).to.equal((Number(_contractRBTCBal) + Number(BTC_AMT_1)).toString());
    });

    it("get SATS/RBTC ratio", async function () {
        console.log("");
        console.log("- get SATS/RBTC ratio");

        const _contractRBTCBal = await satoshi.getRBTCBalance();
        console.log("_contractRBTCBal: "+_contractRBTCBal);

        const sats_totalsupply = await satoshi.totalSupply();
        console.log("sats_totalsupply: "+sats_totalsupply);
        
        const _expectedRatio =sats_totalsupply*1E18/1E8/_contractRBTCBal;
        const expectedRatio = parseInt(_expectedRatio/10000, 0);
        console.log("expectedRatio: "+expectedRatio);
        
        const _ratio = await satoshi.getSATSandRBTCratio();
        const ratio = parseInt(_ratio/10000, 0);
        console.log("ratio: "+ratio);

        expect(await ratio.toString()).to.equal(expectedRatio.toString());
    });

    it("withdraw RBTC", async function () {
        console.log("");
        console.log("- withdraw RBTC");
        const _userSATSBal = await satoshi.balanceOf(user1);
        const _contractRBTCBal = await web3.eth.getBalance(contract_address);
        console.log("_userSATSBal: "+_userSATSBal);
        console.log("_contractRBTCBal: "+_contractRBTCBal);

        const sats_totalsupply = await satoshi.totalSupply();
        const BTC_AMT = SATOSHI_AMT_100M * _contractRBTCBal / sats_totalsupply;
        console.log("BTC_AMT: "+BTC_AMT);

        const withdrawRBTC_Tx = await satoshi.connect(user1Obj).withdrawRBTC(SATOSHI_AMT_100M);
        await withdrawRBTC_Tx.wait();

        const userSATSBal = await satoshi.balanceOf(user1);
        const contractRBTCBal = await web3.eth.getBalance(contract_address);
        console.log("userSATSBal: "+userSATSBal);
        console.log("contractRBTCBal: "+contractRBTCBal);

        expect(await userSATSBal.toString()).to.equal(_userSATSBal.sub(web3.utils.toWei("100000000")).toString());
        expect(await contractRBTCBal.toString()).to.equal((Number(_contractRBTCBal) - Number(BTC_AMT)).toString()); // 1.99958 = (0.99979*2) ? 0.00042
  });

    it("get SATS/RBTC ratio2", async function () {
        console.log("");
        console.log("- get SATS/RBTC ratio2");
        const _contractRBTCBal = await satoshi.getRBTCBalance();
        console.log("_contractRBTCBal: "+_contractRBTCBal);

        const sats_totalsupply = await satoshi.totalSupply();
        console.log("sats_totalsupply: "+sats_totalsupply);
        
        const _expectedRatio =sats_totalsupply*1E18/1E8/_contractRBTCBal;
        const expectedRatio = parseInt(_expectedRatio/10000, 0);
        console.log("expectedRatio: "+expectedRatio);
        
        const _ratio = await satoshi.getSATSandRBTCratio();
        const ratio = parseInt(_ratio/10000, 0);
        console.log("ratio: "+ratio);

        expect(await ratio.toString()).to.equal(expectedRatio.toString());
    });

    it("withdraw RBTC to another account", async function () {

        const depositRBTC_Tx = await satoshi.connect(user1Obj).depositRBTC({value:BTC_AMT_1});
        await depositRBTC_Tx.wait();


        console.log("");
        console.log("- withdraw RBTC to another account");
        const _userBTCBal = await web3.eth.getBalance(user2);
        const _contractRBTCBal = await web3.eth.getBalance(contract_address);
        console.log("_userBTCBal: "+_userBTCBal);
        console.log("_contractRBTCBal: "+_contractRBTCBal);

        const sats_totalsupply = await satoshi.totalSupply();
        const BTC_AMT = SATOSHI_AMT_100M * _contractRBTCBal / sats_totalsupply;
        console.log("BTC_AMT: "+BTC_AMT);

        const withdrawRBTC_Tx = await satoshi.connect(user1Obj).withdrawRBTCto(SATOSHI_AMT_100M, user2);
        await withdrawRBTC_Tx.wait();

        const userBTCBal = await web3.eth.getBalance(user2);
        const contractRBTCBal = await web3.eth.getBalance(contract_address);
        console.log("userBTCBal: "+userBTCBal);
        console.log("contractRBTCBal: "+contractRBTCBal);

        expect(await (userBTCBal/1E7).toString()).to.equal((Number(_userBTCBal/1E7) + Number(BTC_AMT/1E7)).toString());
        expect(await contractRBTCBal.toString()).to.equal((Number(_contractRBTCBal) - Number(BTC_AMT)).toString()); // 1.99958 = (0.99979*2) ? 0.00042
  });

    it("withdraw Revert, Insufficient Balance", async function () {
        await expectRevert(satoshi.connect(user1Obj).withdrawRBTC(SATOSHI_AMT_1B), "SATOSHI: Not enough balance");
  });

 });

