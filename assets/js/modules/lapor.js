const btnLokasi = document.getElementById('btnLokasi');
const lokasiStatus = document.getElementById('lokasiStatus');
const inputKelurahan = document.getElementById('inputKelurahan');
const selectJenis = document.getElementById('jenisKejadian');
const divLainnya = document.getElementById('divLainnya');
let userCoords = null;

// 1. Logika Tampilkan Input "Lainnya"
selectJenis.addEventListener('change', () => {
    if (selectJenis.value === 'Lainnya') {
        divLainnya.classList.remove('d-none');
        document.getElementById('ketLainnya').required = true;
    } else {
        divLainnya.classList.add('d-none');
        document.getElementById('ketLainnya').required = false;
    }
});

// 2. Ambil Lokasi & Deteksi Kelurahan
btnLokasi.addEventListener('click', () => {
    if (!navigator.geolocation) { alert("Browser tidak support GPS"); return; }
    
    lokasiStatus.innerText = "Mencari titik koordinat...";
    lokasiStatus.className = "text-muted d-block text-center";

    navigator.geolocation.getCurrentPosition(
        (pos) => {
            userCoords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
            
            // Simulasi Deteksi Kelurahan (Mocking Reverse Geocoding)
            // Di aplikasi asli, ini memanggil API Google Maps / OpenStreetMap
            const namaKelurahan = simulasiCekKelurahan(userCoords.lat, userCoords.lng);
            
            inputKelurahan.value = namaKelurahan;
            lokasiStatus.innerText = `✅ Terkunci: ${userCoords.lat.toFixed(4)}, ${userCoords.lng.toFixed(4)}`;
            lokasiStatus.className = "text-success d-block text-center fw-bold";
        },
        () => { 
            lokasiStatus.innerText = "Gagal ambil lokasi. Coba lagi.";
            lokasiStatus.className = "text-danger d-block text-center";
        },
        { enableHighAccuracy: true }
    );
});

// Fungsi Simulasi Nama Kelurahan (Hanya Contoh)
function simulasiCekKelurahan(lat, lng) {
    const listKel = ["Kel. Bintan", "Kel. Sukajadi", "Kel. Dumai Kota", "Kel. Teluk Binjai", "Kel. Purnama"];
    // Pilih acak untuk demo
    return listKel[Math.floor(Math.random() * listKel.length)];
}

// 3. Kirim Laporan
document.getElementById('formLapor').addEventListener('submit', (e) => {
    e.preventDefault();
    if(!userCoords) { alert("Wajib ambil lokasi dulu!"); return; }
    
    // Tentukan Jenis Kejadian (Pilihan atau Ketik Sendiri)
    let jenisFinal = selectJenis.value;
    if(jenisFinal === 'Lainnya') {
        jenisFinal = document.getElementById('ketLainnya').value;
    }

    const laporan = { 
        waktu: new Date().toLocaleString(), 
        jenis: jenisFinal, 
        lat: userCoords.lat, 
        lng: userCoords.lng,
        kelurahan: inputKelurahan.value // Simpan data kelurahan
    };

    let data = JSON.parse(localStorage.getItem("dataLaporan_SIGAP")) || [];
    data.push(laporan);
    localStorage.setItem("dataLaporan_SIGAP", JSON.stringify(data));
    
    alert("Laporan Berhasil Terkirim!\nPetugas akan segera memverifikasi.");
    window.location.href = "index.html";
});