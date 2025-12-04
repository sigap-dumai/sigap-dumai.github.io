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
        { enableHighAccuracy: true }
    );
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

    let data = JSON.parse(localStorage.getItem("dataLaporan_SIGAP")) || [];
    data.push(laporan);
    localStorage.setItem("dataLaporan_SIGAP", JSON.stringify(data));
    
    alert("Laporan Berhasil Masuk Sistem!");
    window.location.href = "index.html"; 
});