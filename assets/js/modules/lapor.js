const btnLokasi = document.getElementById('btnLokasi');
const lokasiStatus = document.getElementById('lokasiStatus');
const inputWilayah = document.getElementById('inputWilayah'); // Pastikan ID ini sama dengan di lapor.html
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

// 2. Ambil Lokasi & Deteksi Wilayah (LOGIKA BARU LEBIH KUAT)
btnLokasi.addEventListener('click', () => {
    // Cek support browser
    if (!navigator.geolocation) { 
        alert("Browser HP Anda tidak mendukung fitur GPS."); 
        return; 
    }
    
    // UI Loading
    lokasiStatus.innerText = "⏳ Sedang melacak satelit & wilayah...";
    lokasiStatus.className = "text-warning d-block text-center fw-bold";
    inputWilayah.value = "Sedang mengambil data...";

    navigator.geolocation.getCurrentPosition(
        async (pos) => {
            // Sukses dapat Koordinat
            userCoords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
            
            lokasiStatus.innerHTML = `✅ GPS Terkunci: <b>${userCoords.lat.toFixed(5)}, ${userCoords.lng.toFixed(5)}</b>`;
            lokasiStatus.className = "text-success d-block text-center fw-bold";

            // PANGGIL API NOMINATIM (OSM)
            try {
                const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${userCoords.lat}&lon=${userCoords.lng}&zoom=18&addressdetails=1`;
                
                const response = await fetch(url, {
                    headers: { 'User-Agent': 'SIGAP-Dumai-App/1.0' } // Penting agar tidak diblokir OSM
                });
                
                if (!response.ok) throw new Error("Gagal koneksi ke server peta");
                
                const data = await response.json();
                const addr = data.address;

                console.log("Data Mentah OSM:", addr); // Cek Console jika ingin lihat data asli

                // LOGIKA PINTAR: Cek satu-satu kemungkinan nama
                // 1. Cari Kelurahan / Desa
                let kelurahan = addr.village || addr.suburb || addr.residential || addr.neighbourhood || "";
                
                // 2. Cari Kecamatan
                let kecamatan = addr.city_district || addr.county || addr.district || addr.town || "";

                // 3. Cari Kota (Jika kecamatan kosong)
                let kota = addr.city || addr.region || "";

                // Bersihkan kata-kata duplikat
                kelurahan = kelurahan.replace(/(Kelurahan|Desa)\s/i, "").trim();
                kecamatan = kecamatan.replace(/(Kecamatan|District)\s/i, "").trim();

                // GABUNGKAN HASILNYA
                let hasil = "";
                if(kelurahan && kecamatan) {
                    hasil = `Kel. ${kelurahan}, Kec. ${kecamatan}`;
                } else if (kecamatan) {
                    hasil = `Kec. ${kecamatan}`;
                } else if (kelurahan) {
                    hasil = `Kel. ${kelurahan}`;
                } else {
                    // Jika semua gagal, pakai nama Kota/Kabupaten
                    hasil = kota ? `Area ${kota}` : "Wilayah Tidak Terdeteksi (Isi Manual)";
                }

                inputWilayah.value = hasil;
                // Izinkan edit manual jika hasilnya kurang pas
                inputWilayah.readOnly = false; 

            } catch (error) {
                console.error("Error Geocoding:", error);
                inputWilayah.value = "";
                inputWilayah.placeholder = "Gagal deteksi otomatis. Ketik manual disini...";
                inputWilayah.readOnly = false;
                alert("GPS dapat koordinat, tapi gagal mengambil nama wilayah (Internet/Server Sibuk). Silakan ketik nama wilayah secara manual.");
            }
        },
        (err) => { 
            console.error(err);
            lokasiStatus.innerText = "❌ Gagal ambil lokasi. Pastikan GPS Aktif!";
            lokasiStatus.className = "text-danger d-block text-center fw-bold";
            inputWilayah.value = "";
            inputWilayah.readOnly = false;
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
});

// 3. Kirim Laporan
document.getElementById('formLapor').addEventListener('submit', (e) => {
    e.preventDefault();
    if(!userCoords) { alert("Wajib ambil lokasi (Klik tombol 'Ambil Lokasi')!"); return; }
    
    const nama = document.getElementById('namaPelapor').value;
    let jenisFinal = selectJenis.value;
    if(jenisFinal === 'Lainnya') {
        jenisFinal = document.getElementById('ketLainnya').value;
    }
    
    // Ambil nilai wilayah dari input (bisa hasil otomatis atau editan manual user)
    const wilayahFinal = inputWilayah.value || "Wilayah Tanpa Nama";

    const laporan = { 
        waktu: new Date().toLocaleString("id-ID"), // Format waktu Indonesia
        namaPelapor: nama,
        jenis: jenisFinal, 
        lat: userCoords.lat, 
        lng: userCoords.lng,
        wilayah: wilayahFinal 
    };

    let data = JSON.parse(localStorage.getItem("dataLaporan_SIGAP")) || [];
    data.push(laporan);
    localStorage.setItem("dataLaporan_SIGAP", JSON.stringify(data));
    
    alert("Laporan Berhasil Dikirim!\n\nLokasi: " + wilayahFinal);
    window.location.href = "index.html";
});