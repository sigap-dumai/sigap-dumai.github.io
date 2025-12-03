// assets/js/modules/lapor.js (VERSI FIREBASE)

const btnLokasi = document.getElementById('btnLokasi');
const lokasiStatus = document.getElementById('lokasiStatus');
let userCoords = null;

btnLokasi.addEventListener('click', () => {
    if (!navigator.geolocation) { alert("Browser tidak support GPS"); return; }
    lokasiStatus.innerText = "Mencari koordinat...";
    navigator.geolocation.getCurrentPosition(
        (pos) => {
            userCoords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
            lokasiStatus.innerText = `✅ ${userCoords.lat.toFixed(4)}, ${userCoords.lng.toFixed(4)}`;
            lokasiStatus.classList.add('text-success');
        },
        () => { lokasiStatus.innerText = "Gagal ambil lokasi"; }
    );
});

document.getElementById('formLapor').addEventListener('submit', async (e) => {
    e.preventDefault();
    if(!userCoords) { alert("Wajib ambil lokasi!"); return; }
    
    const submitButton = e.target.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    submitButton.innerText = 'Mengirim...';

    // 1. Kumpulkan Data Laporan
    const jenis = document.getElementById('jenisKejadian').value;
    const reportData = {
        jenis: jenis,
        lat: userCoords.lat,
        lng: userCoords.lng,
        timestamp: firebase.firestore.FieldValue.serverTimestamp(), // Waktu Server Firebase
        status: 'pending' // Status awal
    };

    // 2. Kirim Data ke Firestore Database
    try {
        await db.collection('reports').add(reportData);

        alert("Laporan Berhasil Terkirim Real-time ke Pusat Komando!");
        window.location.href = "index.html";
    } catch (error) {
        console.error("Error saat mengirim ke Firebase:", error);
        alert("⚠️ Gagal Terkirim ke Server. Cek Log Konsol.");
        submitButton.disabled = false;
        submitButton.innerText = 'Kirim Laporan';
    }
});