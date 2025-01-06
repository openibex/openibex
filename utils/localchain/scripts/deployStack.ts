import { ethers } from "hardhat";


async function main() {
  console.log("\n\n ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ TESTING ACCOUNTS !! NEVER USE IN PRODUCTION !! ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ \n")

  // Name-mapping the different signers
  const [manitu, trent, bob, ] = await ethers.getSigners();
  const signers = {
    "manitu": manitu, // typically used as deployer and for genesis transactions, contract owner etc.
    "trent": trent, // For transfers, normal user
    "bob": bob, // For transfers, normal user
  }

  // Print to console for easy reference of developers
  for(const signerName in signers) {
    console.log(`\t ${signerName}=${signers[signerName].address}`)
  }
  console.log("\n ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ \n\n")


  console.log("\n\n ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ Deployment of Contracts ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ \n")
  
  // Deploy the ERC20 demo contract
  const GLDTokenContract = await ethers.getContractFactory("GLDToken");
  const gldDeployer = "manitu";
  const gldToken = await GLDTokenContract.connect(signers[gldDeployer]).deploy(100000000)
  console.log(`ERC-20: Deployed GLDToken-Contract to ${await gldToken.getAddress()}, deployed by ${gldDeployer}`)

  // Transfer to the wallets/eip155 "alice" wallet
  await gldToken.connect(manitu).transfer("0x904de374105a106609480d213d59798833a75a81", 100000)
  
  // Deploy the ERC721 demo contract
  console.log(`ERC-721 TODO`)

  // Deploy the ERC6956 demo contract
  console.log(`ERC-6956 TODO`)

  console.log("\n\n ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ Funding of OpenIbex-Wallets ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ \n")
  
  // This funds alice wallet in wallets/eip155/alice.json
  const tx = await manitu.sendTransaction({
    to: "0x904de374105a106609480d213d59798833a75a81",
    value: ethers.parseEther("1.0") // Adjust the value as needed
  });

  console.log("Transaction Hash:", tx.hash);

  await tx.wait();
  console.log("Transaction Confirmed!");
  
  
  
  console.log("\n\n ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ Funding of Rupicapra-Wallets ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ \n")
  
  // This funds alice wallet in wallets/eip155/alice.json
  const tx2 = await manitu.sendTransaction({
    to: "0xeE9CD548bf721806Aa597BEe871C50c022C4FccE",
    value: ethers.parseEther("1.0") // Adjust the value as needed
  });

  console.log("Transaction Hash:", tx2.hash);

  await tx2.wait();
  console.log("Transaction Confirmed!");


  console.log("\n\n ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ ERC-2771 and ERC-721 sample ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ \n")
   // Deploy the SimpleForwarder contract
   console.log("Deploying SimpleForwarder...");
   const Forwarder = await ethers.getContractFactory("SimpleForwarder");
   const forwarder = await Forwarder.deploy();
   const forwarderAddr = await forwarder.getAddress();
   console.log(`SimpleForwarder deployed at: ${forwarderAddr}`);
 
   // Deploy the DummyERC2771ERC721 contract
   console.log("Deploying DummyNFT...");
   const ERC721 = await ethers.getContractFactory("DummyNFT");
   const erc721 = await ERC721.deploy(forwarderAddr); // Pass forwarder address to the constructor
   console.log(`DummyERC2771ERC721 deployed at: ${await erc721.getAddress()}`);
 
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
