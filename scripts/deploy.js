const fs = require("fs");
const path = "./frontend/contract-address.js";
const privateFile = "./private.txt";
const pathNew = "../backend/contract-address.js";

async function main() {
  const [chairperson, ...voters] = await ethers.getSigners();
  const Ballot = await ethers.getContractFactory("Ballot");
  const ballot = await Ballot.deploy(["Zetta", "Didin", "Iqbal"]);
  await ballot.waitForDeployment();

  const address = ballot.target;
  console.log("✅ Ballot deployed at:", address);

  // Simpan ke file frontend
  fs.writeFileSync(path, `const contractAddress = "${address}";\n`);
  fs.writeFileSync(pathNew, `const contractAddress = "${address}";\n`);
  console.log("📁 contract-address.js updated!");

  // Simpan daftar voter + private key
  let privateLines = ["# Daftar Private Key untuk Voter"];
  for (let i = 1; i < 20; i++) {
    const voter = voters[i];
    const tx = await ballot.giveRightToVote(voter.address);
    await tx.wait();
    console.log(`✅ Hak suara ke: ${voter.address}\n${voter.privateKey}`);

    const pk = voter.privateKey; // signer bawaan Hardhat
    privateLines.push(`${voter.address}|${pk}`);
  }

  fs.writeFileSync(privateFile, privateLines.join("\\n"));
  console.log("📁 File private.txt disimpan.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
