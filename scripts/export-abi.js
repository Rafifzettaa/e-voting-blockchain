const fs = require("fs");
const path = "./artifacts/contracts/Ballot.sol/Ballot.json";
const output = "./frontend/abi.js";

const json = JSON.parse(fs.readFileSync(path));
const abi = JSON.stringify(json.abi, null, 2);

fs.writeFileSync(output, `const contractABI = ${abi};\n`);
console.log("✅ ABI exported to frontend/abi.js");
