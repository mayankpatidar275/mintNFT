const hre = require("hardhat");

async function main() {
  const Minter = await hre.ethers.getContractFactory("Minter");
  const minter = await Minter.deploy();

  await minter.deployed();

  console.log("Library deployed to:", minter.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});



// Library deployed to: 0x5FbDB2315678afecb367f032d93F642f64180aa3