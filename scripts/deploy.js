import hre from "hardhat";

async function main() {
  console.log("Deploying UsernameRegistry...");

  const UsernameRegistry = await hre.ethers.getContractFactory("UsernameRegistry");
  const usernameRegistry = await UsernameRegistry.deploy();

  await usernameRegistry.waitForDeployment();

  const address = await usernameRegistry.getAddress();
  console.log("UsernameRegistry deployed to:", address);
  
  console.log("\nSave this address - you'll need it for frontend integration!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
