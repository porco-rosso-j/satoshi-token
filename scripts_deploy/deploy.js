require("@nomiclabs/hardhat-ethers");
const hre = require("hardhat");

async function main() {

  const SATOSHI = await ethers.getContractFactory("SATOSHI");
  const satoshi = await SATOSHI.deploy();
  await satoshi.deployed();

  console.log("SATOSHI deployed to:", satoshi.address);
/*
  const FlashMintTest = await ethers.getContractFactory("FlashMintTest");
  const flashminttest = await FlashMintTest.deploy(satoshi.address);
  await flashminttest.deployed();

  console.log("FlashMintTest deployed to:", flashminttest.address);
  */
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
