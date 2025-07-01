const express = require("express");
const cors = require("cors");
const { ethers } = require("ethers");
const fs = require("fs");

const app = express();
app.use(cors());
app.use(express.json());

const contractAddress = require("./contract-address.js");
const abi = require("./abi.js");

// Connect to local Hardhat network
const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");

app.post("/vote", async (req, res) => {
  const { privateKey, proposalIndex } = req.body;
  try {
    const wallet = new ethers.Wallet(privateKey, provider);
    const contract = new ethers.Contract(contractAddress, abi, wallet);
    const tx = await contract.vote(proposalIndex);
    await tx.wait();
    res.json({ status: "success", txHash: tx.hash });
  } catch (err) {
    res
      .status(400)
      .json({ status: "error", message: err.reason || err.message });
  }
});
app.get("/proposals", async (req, res) => {
  try {
    const contract = new ethers.Contract(contractAddress, abi, provider);
    let proposals = [];
    for (let i = 0; ; i++) {
      try {
        const p = await contract.proposals(i);
        proposals.push({
          index: i,
          name: p.name,
          voteCount: p.voteCount.toString(),
        });
      } catch {
        break;
      }
    }
    res.json({ proposals });
  } catch (err) {
    res.status(500).json({ error: err.reason || err.message });
  }
});

app.post("/give-right", async (req, res) => {
  const { chairPrivateKey, voterAddress } = req.body;
  console.log("🛂 /give-right dipanggil dengan body:", req.body);

  try {
    const wallet = new ethers.Wallet(chairPrivateKey, provider);
    const contract = new ethers.Contract(contractAddress, abi, wallet);
    const tx = await contract.giveRightToVote(voterAddress);
    await tx.wait();
    res.json({ status: "success", txHash: tx.hash });
  } catch (err) {
    res
      .status(400)
      .json({ status: "error", message: err.reason || err.message });
  }
});

app.get("/winner", async (req, res) => {
  try {
    const contract = new ethers.Contract(contractAddress, abi, provider);
    const name = await contract.winnerName();
    res.json({ winner: name });
  } catch (err) {
    res
      .status(400)
      .json({ status: "error", message: err.reason || err.message });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`✅ Backend API running on http://localhost:${PORT}`);
});
