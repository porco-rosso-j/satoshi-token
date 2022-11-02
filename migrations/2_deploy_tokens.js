const SATOSHI = artifacts.require("./contracts/SATOSHI.sol");

module.exports = (deployer) => {
    deployer.deploy(SATOSHI, 10000);
};