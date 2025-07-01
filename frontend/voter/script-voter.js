let privateKey = "";
let lastVotes = [];
let pollingInterval;
function loginWithPrivateKey() {
  privateKey = document.getElementById("privateKeyInput").value.trim();
  if (!privateKey) {
    alert("Private key kosong!");
    return;
  }
  document.getElementById("account").innerText = "✅ Login berhasil";

  loadProposals(); // pertama kali
  startLivePolling(); // mulai polling tiap 5 detik
}
function startLivePolling() {
  if (pollingInterval) clearInterval(pollingInterval);
  pollingInterval = setInterval(async () => {
    try {
      const res = await fetch("http://localhost:3001/proposals");
      const data = await res.json();

      let updated = false;
      for (let i = 0; i < data.proposals.length; i++) {
        const newCount = parseInt(data.proposals[i].voteCount);
        const oldCount = lastVotes[i] ?? -1;
        if (newCount !== oldCount) {
          updated = true;
        }
        lastVotes[i] = newCount;
      }

      if (updated) {
        showToast("🔔 Suara telah diperbarui!");
        loadProposals(); // update tampilan UI
      }
    } catch (err) {
      console.warn("Polling gagal:", err.message);
    }
  }, 5000); // tiap 5 detik
}
function showToast(msg) {
  const toast = document.getElementById("voteToast");
  toast.innerText = msg;
  toast.classList.remove("hidden");

  // 🔊 Mainkan suara
  const audio = document.getElementById("toastSound");
  if (audio) {
    audio.currentTime = 0; // reset posisi
    audio.play().catch((e) => console.warn("Audio blocked by browser:", e));
  }

  setTimeout(() => {
    toast.classList.add("hidden");
  }, 3000);
}

async function loadProposals() {
  const list = document.getElementById("proposalList");
  list.innerHTML = "";
  try {
    const res = await fetch("http://localhost:3001/proposals");
    const data = await res.json();
    for (let proposal of data.proposals) {
      list.innerHTML += `
        <li class="mb-1">[${proposal.index}] ${proposal.name} - ${proposal.voteCount} suara</li>
      `;
    }
  } catch (err) {
    list.innerHTML =
      "<li class='text-red-600'>Gagal mengambil daftar proposal.</li>";
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
