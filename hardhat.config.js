require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.7.1",
  paths:{
    sources: './contracts',
    artifacts: './src/artifacts'
  },
  defaultNetwork: 'goerli',
  networks:{
    goerli:{
      url: process.env.WEB3_ALCHEMY,
      accounts: [process.env.PRIVATE_KEY_GOERLI]
    }
  }
};
