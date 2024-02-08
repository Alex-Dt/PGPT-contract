// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
import hre from "hardhat";
import { setTimeout } from "node:timers/promises";

async function main() {
  const pgpt = await hre.ethers.deployContract("PGPT");
  await pgpt.waitForDeployment();

  console.log("PGPT deployed to:", pgpt.target);
  await setTimeout(30000); //30 sec
  const result = await hre.run("verify:verify", {
    address: pgpt.target,
  });
  console.log(result);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
