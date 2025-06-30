let privateKey = "";

function loginWithPrivateKey() {
  privateKey = document.getElementById("privateKeyInput").value.trim();
  if (!privateKey) {
    alert("Private key kosong!");
    return;
  }
  document.getElementById("account").innerText = "✅ Login berhasil";
  // Karena tidak bisa cek chairperson di backend, tombol hak suara selalu muncul
  document.getElementById("rightToVoteBtn").style.display = "inline-block";
  loadProposals();
}
async function loadProposals() {
  const list = document.getElementById("proposalList");
  list.innerHTML = "";
  try {
    const res = await fetch("http://localhost:3001/proposals");
    const data = await res.json();
    for (let proposal of data.proposals) {
      list.innerHTML += `
  <li class="bg-white border border-gray-200 rounded-lg shadow-sm p-4 mb-2 hover:shadow-md transition">
    <div class="flex justify-between items-center">
      <div>
        <p class="font-semibold text-gray-800">[${proposal.index}] ${proposal.name}</p>
        <p class="text-sm text-gray-500">🗳️ ${proposal.voteCount} suara</p>
      </div>
    </div>
  </li>
`;
    }
  } catch {
    list.innerHTML = "<li>Gagal mengambil daftar proposal.</li>";
  }
}

async function giveRightToVote() {
  const voterAddress = prompt("Masukkan alamat voter:");
  if (!privateKey || !voterAddress) {
    alert("Masukkan private key ketua dan alamat voter!");
    return;
  }

  try {
    const res = await fetch("http://localhost:3001/give-right", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chairPrivateKey: privateKey,
        voterAddress,
      }),
    });

    const data = await res.json();
    if (data.status === "success") {
      alert("✅ Hak suara diberikan. Tx: " + data.txHash);
    } else {
      alert("❌ Gagal: " + data.message);
    }
  } catch (err) {
    alert("❌ Gagal terhubung ke server");
  }
}

async function vote() {
  const index = document.getElementById("proposalIndex").value;
  if (!privateKey || index === "") {
    alert("Isi private key dan index proposal");
    return;
  }
  try {
    const res = await fetch("http://localhost:3001/vote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ privateKey, proposalIndex: parseInt(index) }),
    });
    const data = await res.json();
    if (data.status === "success") {
      document.getElementById("voteStatus").innerText =
        "✅ Vote berhasil: " + data.txHash;
    } else {
      document.getElementById("voteStatus").innerText =
        "❌ Gagal: " + data.message;
    }
  } catch (err) {
    document.getElementById("voteStatus").innerText =
      "❌ Error koneksi ke server";
  }
}

async function getWinner() {
  try {
    const res = await fetch("http://localhost:3001/winner");
    const data = await res.json();
    document.getElementById("winnerName").innerText =
      "🎉 Pemenang: " + data.winner;
  } catch {
    document.getElementById("winnerName").innerText = "❌ Gagal ambil pemenang";
  }
}
