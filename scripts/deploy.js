const fs = require("fs");
const path = require("path");
const privateFile = "./private.txt";

async function main() {
  const [chairperson, ...voters] = await ethers.getSigners();
  const Ballot = await ethers.getContractFactory("Ballot");
  const ballot = await Ballot.deploy(["Zetta", "Didin", "Iqbal"]);
  await ballot.waitForDeployment();

  const address = ballot.target;
  console.log("✅ Ballot deployed at:", address);

  // Buat path untuk backend (CommonJS)
  const backendPath = path.resolve(__dirname, "../backend/contract-address.js");
  fs.writeFileSync(backendPath, `module.exports = "${address}";\n`);
  // Simpan ke file frontend
  // Buat path untuk frontend (browser script)
  const frontendPath = path.resolve(
    __dirname,
    "../frontend/contract-address.js"
  );
  fs.writeFileSync(frontendPath, `const contractAddress = "${address}";\n`);

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
