const btnLokasi = document.getElementById('btnLokasi');
const lokasiStatus = document.getElementById('lokasiStatus');
const inputWilayah = document.getElementById('inputWilayah');
const selectJenis = document.getElementById('jenisKejadian');
const divLainnya = document.getElementById('divLainnya');
let userCoords = null;

selectJenis.addEventListener('change', () => {
    if (selectJenis.value === 'Lainnya') {
        divLainnya.classList.remove('d-none');
        document.getElementById('ketLainnya').required = true;
    } else {
        divLainnya.classList.add('d-none');
        document.getElementById('ketLainnya').required = false;
    }
});

btnLokasi.addEventListener('click', () => {
    if (!navigator.geolocation) { alert("Browser tidak support GPS"); return; }
    
    lokasiStatus.innerText = "⏳ Melacak satelit...";
    lokasiStatus.className = "text-warning d-block text-center fw-bold";
    inputWilayah.value = "Mendeteksi wilayah...";

    navigator.geolocation.getCurrentPosition(
        async (pos) => {
            userCoords = { 
                lat: parseFloat(pos.coords.latitude), 
                lng: parseFloat(pos.coords.longitude) 
            };
            
            lokasiStatus.innerHTML = `✅ Terkunci: <b>${userCoords.lat.toFixed(5)}, ${userCoords.lng.toFixed(5)}</b>`;
            lokasiStatus.className = "text-success d-block text-center fw-bold";

            // Reverse Geocoding (Cari Nama Wilayah dari OSM)
            try {
                const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${userCoords.lat}&lon=${userCoords.lng}&zoom=18&addressdetails=1`;
                const res = await fetch(url, { headers: { 'User-Agent': 'SIGAP-Dumai/1.0' } });
                const data = await res.json();
                
                const addr = data.address || {};
                const desa = addr.village || addr.suburb || addr.residential || "";
                const kec = addr.city_district || addr.county || addr.district || "";
                
                let hasil = desa ? `Kel. ${desa}` : "";
                if(kec) hasil += (hasil ? ", " : "") + `Kec. ${kec}`;
                if(!hasil) hasil = addr.city || "Wilayah Dumai";

                inputWilayah.value = hasil.replace(/(Kelurahan|Kecamatan)\s/gi, "");
                inputWilayah.readOnly = false;
            } catch (e) {
                inputWilayah.value = "Gagal deteksi otomatis. Ketik manual.";
                inputWilayah.readOnly = false;
            }
        },
        () => { 
            lokasiStatus.innerText = "❌ Gagal ambil lokasi. Cek GPS!";
            lokasiStatus.className = "text-danger d-block text-center fw-bold";
        },
{ enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }    );
});

document.getElementById('formLapor').addEventListener('submit', (e) => {
    e.preventDefault();
    if(!userCoords) { alert("Wajib ambil lokasi dulu!"); return; }
    
    const nama = document.getElementById('namaPelapor').value;
    let jenisFinal = selectJenis.value;
    if(jenisFinal === 'Lainnya') jenisFinal = document.getElementById('ketLainnya').value;
    
    const laporan = { 
        id: Date.now(), 
        waktu: new Date().toLocaleString("id-ID"), 
        namaPelapor: nama,
        jenis: jenisFinal, 
        lat: userCoords.lat, 
        lng: userCoords.lng,
        wilayah: inputWilayah.value || "Lokasi Terpantau",
        status: "Menunggu" // Status Default untuk Admin
    };

 // Submit laporan ke backend GAS API (bukan localStorage)
  try {
    const response = await fetch(CONFIG.apiBaseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' }, // GAS tidak support application/json dari CORS
      body: JSON.stringify({
        action: 'report',
        key: CONFIG.publicApiKey,
        ...laporan
      })
    });
    const result = await response.json();
    if (!result.ok) throw new Error(result.error || 'API Error');
  } catch (err) {
    console.error('API Error:', err);
    alert(`Gagal kirim ke server: ${err.message}`);
    return;
  }    alert("Laporan Berhasil Masuk Sistem!");
    window.location.href = "index.html"; 
});
