const btnLokasi = document.getElementById('btnLokasi');
const lokasiStatus = document.getElementById('lokasiStatus');
const inputWilayah = document.getElementById('inputWilayah');
const selectJenis = document.getElementById('jenisKejadian');
const divLainnya = document.getElementById('divLainnya');
let userCoords = null;

// DEBUG LOGGER
function debugLog(msg, data = null) {
  console.log(`[SIGAP-GPS] ${msg}`, data || '');
}

// GEOLOCATION ERROR MAPPER
function getGeoErrorMessage(error) {
  switch(error.code) {
    case error.PERMISSION_DENIED:
      return '❌ GPS DITOLAK: Izinkan akses lokasi di pengaturan browser!';
    case error.POSITION_UNAVAILABLE:
      return '❌ GPS TIDAK TERSEDIA: Cek apakah GPS device aktif di HP!';
    case error.TIMEOUT:
      return '❌ TIMEOUT: GPS tidak merespons. Coba lagi dalam 10 detik!';
    default:
      return `❌ ERROR GPS (${error.code}): ${error.message}`;
  }
}

selectJenis.addEventListener('change', () => {
  if (selectJenis.value === 'Lainnya') {
    divLainnya.classList.remove('d-none');
    document.getElementById('ketLainnya').required = true;
  } else {
    divLainnya.classList.add('d-none');
    document.getElementById('ketLainnya').required = false;
  }
});

bnLokasi.addEventListener('click', () => {
  debugLog('Tombol GPS ditekan');
  
  // CHECK 1: Browser Support
  if (!navigator.geolocation) {
    lokasiStatus.innerText = '❌ Browser tidak support Geolocation API';
    lokasiStatus.className = 'text-danger d-block text-center fw-bold';
    debugLog('ERROR: Geolocation API tidak tersupport');
    return;
  }
  
  // CHECK 2: HTTPS Requirement
  if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
    lokasiStatus.innerText = '⚠️ Harus HTTPS untuk akses GPS. Buka di HTTPS!';
    lokasiStatus.className = 'text-warning d-block text-center fw-bold';
    debugLog('WARNING: Bukan HTTPS/localhost');
  }
  
  debugLog('Memulai permintaan GPS dengan opsi: enableHighAccuracy=true, timeout=15000ms');
  lokasiStatus.innerText = '⏳ Meminta izin GPS dari perangkat...';
  lokasiStatus.className = 'text-warning d-block text-center fw-bold';
  inputWilayah.value = 'Mendeteksi wilayah...';
  btnLokasi.disabled = true;
  
  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      debugLog('SUCCESS: GPS berhasil diterima', {
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
        accuracy: pos.coords.accuracy + 'm'
      });
      
      userCoords = {
        lat: parseFloat(pos.coords.latitude),
        lng: parseFloat(pos.coords.longitude)
      };
      
      lokasiStatus.innerHTML = `✅ Terkunci: <b>${userCoords.lat.toFixed(5)}, ${userCoords.lng.toFixed(5)}</b> (Akurasi: ${Math.round(pos.coords.accuracy)}m)`;
      lokasiStatus.className = 'text-success d-block text-center fw-bold';
      
      // Reverse Geocoding (Cari Nama Wilayah dari OSM)
      try {
        debugLog('Mencari nama wilayah dari OSM Nominatim...');
        const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${userCoords.lat}&lon=${userCoords.lng}&zoom=18&addressdetails=1`;
        const res = await fetch(url, {
          headers: { 'User-Agent': 'SIGAP-Dumai/1.0' },
          timeout: 5000
        });
        
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        
        const data = await res.json();
        debugLog('Response dari Nominatim:', data.address);
        
        const addr = data.address || {};
        const desa = addr.village || addr.suburb || addr.residential || '';
        const kec = addr.city_district || addr.county || addr.district || '';
        
        let hasil = desa ? `Kel. ${desa}` : '';
        if(kec) hasil += (hasil ? ', ' : '') + `Kec. ${kec}`;
        if(!hasil) hasil = addr.city || 'Wilayah Dumai';
        
        inputWilayah.value = hasil.replace(/(Kelurahan|Kecamatan)\s/gi, '');
        inputWilayah.readOnly = false;
        debugLog('Wilayah berhasil dideteksi:', inputWilayah.value);
        
      } catch (e) {
        debugLog('WARNING: Nominatim gagal, gunakan manual input', e.message);
        inputWilayah.value = 'Gagal deteksi otomatis. Silakan ketik manual.';
        inputWilayah.readOnly = false;
      }
      
      btnLokasi.disabled = false;
    },
    (error) => {
      const errorMsg = getGeoErrorMessage(error);
      lokasiStatus.innerText = errorMsg;
      lokasiStatus.className = 'text-danger d-block text-center fw-bold';
      debugLog('ERROR CALLBACK:', {
        code: error.code,
        message: error.message,
        userMsg: errorMsg
      });
      btnLokasi.disabled = false;
    },
    {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0
    }
  );
});

document.getElementById('formLapor').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  if(!userCoords) {
    alert('❌ Wajib ambil lokasi GPS terlebih dahulu!');
    debugLog('ERROR: Form submitted tanpa userCoords');
    return;
  }
  
  debugLog('Form submit dimulai', { userCoords });
  
  const nama = document.getElementById('namaPelapor').value;
  let jenisFinal = selectJenis.value;
  if(jenisFinal === 'Lainnya') jenisFinal = document.getElementById('ketLainnya').value;
  
  const laporan = {
    id: Date.now(),
    waktu: new Date().toLocaleString('id-ID'),
    namaPelapor: nama,
    jenis: jenisFinal,
    lat: userCoords.lat,
    lng: userCoords.lng,
    wilayah: inputWilayah.value || 'Lokasi Terpantau',
    status: 'Menunggu'
  };
  
  debugLog('Data laporan siap dikirim:', laporan);
  
  // Submit laporan ke backend GAS API
  try {
    const response = await fetch(CONFIG.apiBaseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({
        action: 'report',
        key: CONFIG.publicApiKey,
        ...laporan
      })
    });
    
    debugLog('API Response status:', response.status);
    const result = await response.json();
    debugLog('API Response data:', result);
    
    if (!result.ok) throw new Error(result.error || 'API Error');
    
    alert('✅ Laporan Berhasil Masuk Sistem!');
    debugLog('SUCCESS: Laporan berhasil dikirim');
    window.location.href = 'index.html';
    
  } catch (err) {
    console.error('API Error:', err);
    debugLog('ERROR API:', err.message);
    alert(`❌ Gagal kirim ke server: ${err.message}`);
  }
});
