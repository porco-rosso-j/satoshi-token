
require("@nomiclabs/hardhat-ethers");
require("@nomiclabs/hardhat-waffle");
//require("hardhat-gas-reporter");

let secret = require("./secret")

const fs = require('fs');
const gasPriceTestnetRaw = fs.readFileSync(".gas-price-testnet.json").toString().trim();
const gasPriceTestnet = parseInt(JSON.parse(gasPriceTestnetRaw).result, 16);
if (typeof gasPriceTestnet !== 'number' || isNaN(gasPriceTestnet)) {
  throw new Error('unable to retrieve network gas price from .gas-price-testnet.json');
}

console.log("Gas price Testnet: " + gasPriceTestnet);

module.exports = {
	solidity: {
		version: "0.6.11",
		settings: {
			optimizer: {
				enabled: true,
				runs: 200,
			},
		},
	},
  defaultNetwork: "localhost",
	networks: {
		hardhat: {},

    localhost: {
      url: "http://127.0.0.1:8545",
    },
    
	regtest: {
	  url: "http://localhost:4444",
	  accounts: [secret.private_key, secret.private_key2],
	  //seeds:[secret.key],
	  network_id: 33,
	},

	testnet: {
		url: "https://public-node.testnet.rsk.co/",
		accounts: [secret.private_key, secret.private_key2],
		//seeds:[secret.key],
		network_id: 31,
		gasPrice: Math.floor(gasPriceTestnet * 1.1)
	  },

    /*
		rskPublicMainnet: {
			url: "https://public-node.rsk.co/",
			network_id: 30,
			//timeout: 20000, // increase if needed; 20000 is the default value
		},
    */
	},
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  },
  /*
	mocha: {
		timeout: 800000,
		grep: "^(?!.*; using Ganache).*",
	},
	docgen: {
		path: "./docs",
		clear: true,
	},
  */
  compilers : {
    solc: {
     version: "0.6.11",
     //evmVersion: "byzantium"
    }
  },
  /*
  gasReporter: {
    currency: 'USD',
    gasPrice: 8
  }
  */
};