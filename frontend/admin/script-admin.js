let privateKey = "";

async function loginAdmin() {
  const pk = document.getElementById("adminPrivateKey").value.trim();
  if (!pk) return alert("Private key belum diisi!");
  privateKey = pk;
  localStorage.setItem("adminKey", privateKey); // Simpan ke localStorage

  document.getElementById("adminStatus").innerText = "✅ Login berhasil";
  document.getElementById("logoutBtn").classList.remove("hidden");

  try {
    const res = await fetch("http://localhost:3001/proposals");
    const data = await res.json();
    const labels = [];
    const votes = [];
    const ul = document.getElementById("proposalStats");
    ul.innerHTML = "";

    for (let proposal of data.proposals) {
      labels.push("[" + proposal.index + "] " + proposal.name);
      votes.push(parseInt(proposal.voteCount));
      ul.innerHTML += `<li><strong>${proposal.name}</strong> - ${proposal.voteCount} suara</li>`;
    }

    const ctx = document.getElementById("voteChart").getContext("2d");
    new Chart(ctx, {
      type: "bar",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Jumlah Suara",
            data: votes,
            backgroundColor: "rgba(54, 162, 235, 0.6)",
            borderColor: "rgba(54, 162, 235, 1)",
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
            precision: 0,
          },
        },
      },
    });
  } catch (err) {
    alert("Gagal mengambil data: " + err.message);
  }
  startLivePolling();
}
function logoutAdmin() {
  localStorage.removeItem("adminKey");
  privateKey = "";

  document.getElementById("adminPrivateKey").value = "";
  document.getElementById("adminStatus").innerText = "🔒 Logout berhasil";
  document.getElementById("logoutBtn").classList.add("hidden");

  // Clear UI
  document.getElementById("proposalStats").innerHTML = "";
  const chartCanvas = document.getElementById("voteChart");
  const ctx = chartCanvas.getContext("2d");
  ctx.clearRect(0, 0, chartCanvas.width, chartCanvas.height);
}

function showVoterInput() {
  document.getElementById("voterInputSection").classList.remove("hidden");
}

async function submitRightToVote() {
  const voterAddress = document
    .getElementById("voterAddressInput")
    .value.trim();
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
      document.getElementById("voterAddressInput").value = "";
      document.getElementById("voterInputSection").classList.add("hidden");
    } else {
      alert("❌ Gagal: " + data.message);
    }
  } catch (err) {
    alert("❌ Gagal terhubung ke server");
  }
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
window.addEventListener("DOMContentLoaded", async () => {
  const savedKey = localStorage.getItem("adminKey");
  if (savedKey) {
    privateKey = savedKey;
    document.getElementById("adminPrivateKey").value = privateKey;
    document.getElementById("adminStatus").innerText =
      "✅ Login otomatis dari localStorage";
    document.getElementById("logoutBtn").classList.remove("hidden");
    await loadProposals();
  }
});
