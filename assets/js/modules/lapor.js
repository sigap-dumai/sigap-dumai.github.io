const btnLokasi = document.getElementById('btnLokasi');
const lokasiStatus = document.getElementById('lokasiStatus');
const inputWilayah = document.getElementById('inputWilayah'); // ID Baru biar sesuai konteks
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

// 2. Ambil Lokasi & Deteksi KECAMATAN
btnLokasi.addEventListener('click', () => {
    if (!navigator.geolocation) { alert("Browser tidak support GPS"); return; }
    
    lokasiStatus.innerText = "Mencari titik koordinat...";
    lokasiStatus.className = "text-muted d-block text-center";
    inputWilayah.value = "Melacak Kecamatan...";

    navigator.geolocation.getCurrentPosition(
        async (pos) => {
            userCoords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
            
            lokasiStatus.innerText = `✅ GPS: ${userCoords.lat.toFixed(5)}, ${userCoords.lng.toFixed(5)}`;
            lokasiStatus.className = "text-success d-block text-center fw-bold";

            // PANGGIL API OPENSTREETMAP (NOMINATIM)
            try {
                const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${userCoords.lat}&lon=${userCoords.lng}&zoom=14&addressdetails=1`;
                const response = await fetch(url);
                const data = await response.json();

                // PRIORITAS DATA KECAMATAN
                // 1. city_district (Biasanya untuk kota besar)
                // 2. suburb (Biasanya untuk pinggiran)
                // 3. county (Kadang terdeteksi sebagai ini)
                let kecamatan = data.address.city_district || data.address.suburb || data.address.county || "Kecamatan Tidak Terdeteksi";
                
                // Bersihkan kata "Kecamatan" atau "District" jika sudah ada, biar rapi
                kecamatan = kecamatan.replace("Kecamatan ", "").replace("District", "").trim();

                inputWilayah.value = "Kec. " + kecamatan; 

            } catch (error) {
                console.error(error);
                inputWilayah.value = "Gagal deteksi wilayah";
            }
        },
        () => { 
            lokasiStatus.innerText = "Gagal ambil lokasi. Pastikan Izin GPS Aktif.";
            lokasiStatus.className = "text-danger d-block text-center";
            inputWilayah.value = "";
        },
        { enableHighAccuracy: true }
    );
});

// 3. Kirim Laporan
document.getElementById('formLapor').addEventListener('submit', (e) => {
    e.preventDefault();
    if(!userCoords) { alert("Wajib ambil lokasi dulu!"); return; }
    
    const nama = document.getElementById('namaPelapor').value;
    let jenisFinal = selectJenis.value;
    if(jenisFinal === 'Lainnya') {
        jenisFinal = document.getElementById('ketLainnya').value;
    }

    const laporan = { 
        waktu: new Date().toLocaleString(), 
        namaPelapor: nama,
        jenis: jenisFinal, 
        lat: userCoords.lat, 
        lng: userCoords.lng,
        wilayah: inputWilayah.value // Simpan nama Kecamatan
    };

    let data = JSON.parse(localStorage.getItem("dataLaporan_SIGAP")) || [];
    data.push(laporan);
    localStorage.setItem("dataLaporan_SIGAP", JSON.stringify(data));
    
    alert("Laporan Terkirim! \nLokasi: " + inputWilayah.value);
    window.location.href = "index.html";
});