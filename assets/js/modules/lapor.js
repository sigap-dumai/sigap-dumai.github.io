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

// 2. Ambil Lokasi & Deteksi Kelurahan (REAL OSM API)
btnLokasi.addEventListener('click', () => {
    if (!navigator.geolocation) { alert("Browser tidak support GPS"); return; }
    
    lokasiStatus.innerText = "Mencari titik koordinat...";
    lokasiStatus.className = "text-muted d-block text-center";
    inputKelurahan.value = "Sedang melacak wilayah...";

    navigator.geolocation.getCurrentPosition(
        async (pos) => {
            userCoords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
            
            // Tampilkan koordinat sementara
            lokasiStatus.innerText = `✅ GPS Terkunci: ${userCoords.lat.toFixed(5)}, ${userCoords.lng.toFixed(5)}`;
            lokasiStatus.className = "text-success d-block text-center fw-bold";

            // PANGGIL API OPENSTREETMAP (NOMINATIM) UNTUK NAMA KELURAHAN
            try {
                const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${userCoords.lat}&lon=${userCoords.lng}&zoom=18&addressdetails=1`;
                const response = await fetch(url);
                const data = await response.json();

                // Ambil data spesifik: Village (Desa/Kelurahan) atau Suburb (Kecamatan/Wilayah)
                // Nominatim kadang menaruh nama kelurahan di 'village', 'suburb', atau 'residential'
                const kelurahan = data.address.village || data.address.suburb || data.address.residential || data.address.city_district || "Wilayah Tidak Terdeteksi";
                
                inputKelurahan.value = "Kel. " + kelurahan.replace("Kelurahan ", ""); // Bersihkan nama jika ada duplikasi
            } catch (error) {
                console.error(error);
                inputKelurahan.value = "Gagal deteksi nama wilayah (Offline?)";
            }
        },
        () => { 
            lokasiStatus.innerText = "Gagal ambil lokasi. Pastikan Izin GPS Aktif.";
            lokasiStatus.className = "text-danger d-block text-center";
            inputKelurahan.value = "";
        },
        { enableHighAccuracy: true }
    );
});

// 3. Kirim Laporan
document.getElementById('formLapor').addEventListener('submit', (e) => {
    e.preventDefault();
    if(!userCoords) { alert("Wajib ambil lokasi dulu!"); return; }
    
    // Ambil Data Input
    const nama = document.getElementById('namaPelapor').value;
    let jenisFinal = selectJenis.value;
    if(jenisFinal === 'Lainnya') {
        jenisFinal = document.getElementById('ketLainnya').value;
    }

    const laporan = { 
        waktu: new Date().toLocaleString(), 
        namaPelapor: nama,   // Simpan Nama Pelapor
        jenis: jenisFinal, 
        lat: userCoords.lat, 
        lng: userCoords.lng,
        kelurahan: inputKelurahan.value 
    };

    let data = JSON.parse(localStorage.getItem("dataLaporan_SIGAP")) || [];
    data.push(laporan);
    localStorage.setItem("dataLaporan_SIGAP", JSON.stringify(data));
    
    alert("Terima kasih, " + nama + "!\nLaporan Anda berhasil dikirim.");
    window.location.href = "index.html";
});