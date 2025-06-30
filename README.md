# 🗳️ E-Voting Blockchain (Hardhat + Express + Frontend)

Sistem e-voting sederhana menggunakan smart contract Solidity, backend Node.js, dan frontend HTML yang terintegrasi via REST API.

---

## 🚀 Fitur

- Login menggunakan **private key**
- Pemilih (voter) dapat memilih kandidat
- Ketua pemilu (admin) dapat memberi hak suara
- Lihat hasil pemenang voting
- Menggunakan jaringan lokal Hardhat (Testnet Simulasi)

---

## 📁 Struktur Proyek

```
e-voting-project/
│
├── contracts/
│   └── Ballot.sol              # Smart contract voting
│
├── scripts/
│   └── deploy.js               # Script deploy + beri hak suara + generate private.txt
│
├── backend/
│   ├── server.js               # Backend Express API (vote, give-right, winner, proposals)
│   ├── abi.js                  # ABI hasil compile kontrak
│   └── contract-address.js     # Alamat kontrak hasil deploy
│
├── frontend/
│   ├── index.html              # UI login, vote, lihat proposal dan winner
│   └── script.js               # Integrasi dengan backend API
│
├── private.txt                 # Berisi daftar alamat dan private key voter (hasil deploy)
└── README.md                   # Petunjuk ini
```

---

## ⚙️ Setup dan Instalasi

### 1. Clone dan Install Dependency

```bash
npm install
```

### 2. Jalankan Hardhat Local Node

```bash
npx hardhat node
```

### 3. Deploy Kontrak + Generate Akun Voter

```bash
npx hardhat run scripts/deploy.js --network localhost
```

> Akan muncul `contract-address.js` dan `private.txt`

### 4. Jalankan Backend Express

```bash
cd backend
node server.js
```

### 5. Jalankan Frontend

```bash
cd frontend
python -m http.server 8000
```

Akses di browser: [http://localhost:8000](http://localhost:8000)

---

## 🧪 Cara Pakai

### 👤 Login

1. Masukkan salah satu **private key** dari `private.txt`
2. Jika akun adalah **ketua pemilu**, akan muncul tombol **"Beri Hak Suara"**

### 🗳️ Voting

- Masukkan indeks kandidat lalu klik **"Vote"**

### 👑 Admin Panel

- Ketua dapat memasukkan alamat voter dan klik **"Beri Hak Suara"**
- Hanya admin (deployer) yang bisa menggunakan fitur ini

---

## 🛡️ Catatan Keamanan

- Sistem ini hanya untuk simulasi akademik (tugas UAS)
- Private key disimpan secara manual (bukan metode aman)
- Tidak cocok digunakan untuk voting publik/nyata tanpa audit dan enkripsi

---

## 📬 Kontak

Dibuat oleh ZETTAAA — Untuk keperluan Tugas UAS.
