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
  const container = document.getElementById("proposalList");
  const select = document.getElementById("proposalSelect");

  container.innerHTML = "";
  select.innerHTML = `<option value="">Pilih kandidat</option>`; // reset dropdown

  try {
    const res = await fetch("http://localhost:3001/proposals");
    const data = await res.json();

    for (let proposal of data.proposals) {
      // 🎴 Tambahkan ke daftar dalam bentuk kartu
      const card = document.createElement("div");
      card.className =
        "bg-white border rounded-xl shadow-sm p-4 hover:shadow-md transition";
      card.innerHTML = `
        <h3 class="font-semibold text-gray-800 text-base">[${proposal.index}] ${proposal.name}</h3>
        <p class="text-sm text-gray-500 mt-1">🗳️ ${proposal.voteCount} suara</p>
      `;
      container.appendChild(card);

      // 🔽 Tambahkan ke dropdown select
      const option = document.createElement("option");
      option.value = proposal.index;
      option.textContent = `[${proposal.index}] ${proposal.name}`;
      select.appendChild(option);
    }
  } catch (err) {
    container.innerHTML = `<div class="text-red-600">Gagal mengambil daftar proposal.</div>`;
  }
}
async function vote() {
  const index = document.getElementById("proposalSelect").value;
  const button = document.querySelector("button[onclick='vote()']");
  if (!privateKey || index === "") {
    alert("Silakan pilih kandidat dan login dulu.");
    return;
  }

  try {
    button.disabled = true;
    button.innerText = "⏳ Mengirim suara...";

    const res = await fetch("http://localhost:3001/vote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ privateKey, proposalIndex: parseInt(index) }),
    });

    const data = await res.json();
    if (data.status === "success") {
      document.getElementById("voteStatus").innerText =
        "✅ Vote berhasil: " + data.txHash;
      button.innerText = "✅ Vote Terkirim";
      button.disabled = true; // disable tombol setelah vote
    } else {
      document.getElementById("voteStatus").innerText =
        "❌ Gagal: " + data.message;
      button.disabled = false;
      button.innerText = "🗳️ Vote";
    }
  } catch (err) {
    document.getElementById("voteStatus").innerText =
      "❌ Gagal koneksi ke server";
    button.disabled = false;
    button.innerText = "🗳️ Vote";
  }
}

async function getWinner() {
  try {
    const res = await fetch("http://localhost:3001/winner");
    const data = await res.json();
    const winner = data.winner;

    document.getElementById("winnerName").innerText = "🎉 Pemenang: " + winner;

    // Highlight kartu pemenang
    const cards = document.querySelectorAll("#proposalList > div");
    for (const card of cards) {
      const title = card.querySelector("h3")?.innerText || "";
      if (title.includes(winner)) {
        card.classList.add("ring-2", "ring-green-500", "scale-[1.02]");
      } else {
        card.classList.remove("ring-2", "ring-green-500", "scale-[1.02]");
      }
    }
  } catch {
    document.getElementById("winnerName").innerText = "❌ Gagal ambil pemenang";
  }
}
