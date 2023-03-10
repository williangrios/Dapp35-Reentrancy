const hre = require("hardhat");

async function main() {
  const FailedBank = await hre.ethers.getContractFactory("EthFailedBank");
  const failedBank = await FailedBank.deploy();
  await failedBank.deployed();
  console.log(
    `Failed Bank Deployed to ${failedBank.address}`
  );

  const SafeBank = await hre.ethers.getContractFactory("EthSafeBank");
  const safeBank = await SafeBank.deploy();
  await safeBank.deployed();
  console.log(
    `Safe Bank Deployed to ${safeBank.address}`
  );

  const BankExploit = await hre.ethers.getContractFactory("EthBankExploit");
  const bankExploit = await BankExploit.deploy(failedBank.address, safeBank.address);
  await bankExploit.deployed();
  console.log(
    `Bank Exploit Deployed to ${bankExploit.address}`
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
