import hre from "hardhat";

async function main() {
    console.log("Deploying UsernameRegistry...");

    const [deployer] = await hre.ethers.getSigners();
    console.log("Deploying from address:", deployer.address);

    const balance = await hre.ethers.provider.getBalance(deployer.address);
    console.log("Account balance:", hre.ethers.formatEther(balance), "PAS");

    if (balance === 0n) {
        console.log("\n❌ You need testnet tokens!");
        console.log("Get them from: https://faucet.polkadot.io/");
        console.log("Select 'Passet Hub: smart contracts' in the dropdown");
        process.exit(1);
    }

    const UsernameRegistry = await hre.ethers.getContractFactory("UsernameRegistry");
    const usernameRegistry = await UsernameRegistry.deploy({
        gasLimit: 5000000
    });

    await usernameRegistry.waitForDeployment();

    const address = await usernameRegistry.getAddress();
    console.log("\n✅ UsernameRegistry deployed to:", address);
    console.log("\nSave this address - you'll need it for frontend integration!");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
