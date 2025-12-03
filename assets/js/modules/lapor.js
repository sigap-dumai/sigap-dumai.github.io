// assets/js/modules/lapor.js (VERSI FIREBASE & GEOLOKASI KECAMATAN)

const btnLokasi = document.getElementById('btnLokasi');
const jenisKejadian = document.getElementById('jenisKejadian');
const lainnyaContainer = document.getElementById('lainnyaInputContainer');
const lokasiStatus = document.getElementById('lokasiStatus');
const kecamatanStatus = document.getElementById('kecamatanStatus');
const lokasiError = document.getElementById('lokasiError');

let userCoords = null;
let detectedKecamatan = "Lokasi Tidak Terdeteksi";

// --- FUNGSI DETEKSI KECAMATAN (Reverse Geocoding) ---
async function reverseGeocode(lat, lng) {
    // Menggunakan OpenStreetMap Nominatim API
    const osmApiUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=15&addressdetails=1`;
    
    try {
        const response = await fetch(osmApiUrl);
        const data = await response.json();
        
        // Cari nama Kecamatan/Subdistrict/Suburb dari response
        const address = data.address;
        
        let kecamatan = "Kecamatan Tidak Dikenali";
        
        // Mencari nama wilayah yang paling spesifik yang mungkin adalah Kecamatan
        if (address.suburb) {
            kecamatan = address.suburb;
        } else if (address.city_district) {
            kecamatan = address.city_district;
        } else if (address.village) {
            kecamatan = address.village;
        } else if (address.town) {
            kecamatan = address.town;
        }

        // Catatan: Karena Dumai dan Riau, pastikan hasil bukan "Riau" atau "Indonesia"
        if (kecamatan === "Kecamatan Tidak Dikenali" && address.county) {
             kecamatan = address.county;
        }
        
        // Tampilkan hasil dan simpan
        detectedKecamatan = kecamatan;
        kecamatanStatus.value = `📍 ${kecamatan}`;
        lokasiError.innerText = '';

    } catch (error) {
        console.error("Geocoding Error:", error);
        detectedKecamatan = "Gagal mendeteksi kecamatan (API Error)";
        kecamatanStatus.value = detectedKecamatan;
        lokasiError.innerText = '⚠️ Gagal mendeteksi Kecamatan secara otomatis.';
    }
}


// --- FUNGSI AMBIL GPS & GEOLOKASI ---
btnLokasi.addEventListener('click', () => {
    if (!navigator.geolocation) { 
        alert("Browser tidak support GPS. Harap gunakan browser modern."); 
        return; 
    }
    
    lokasiStatus.innerText = "Status Lokasi: Mencari koordinat...";
    lokasiError.innerText = '';
    
    navigator.geolocation.getCurrentPosition(
        (pos) => {
            userCoords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
            lokasiStatus.innerText = `✅ Koordinat: ${userCoords.lat.toFixed(6)}, ${userCoords.lng.toFixed(6)}`;
            
            // Lakukan Reverse Geocoding setelah GPS berhasil
            kecamatanStatus.value = "Sedang mendeteksi Kecamatan...";
            reverseGeocode(userCoords.lat, userCoords.lng);
        },
        (error) => {
            lokasiStatus.innerText = "Status Lokasi: Gagal mengambil GPS.";
            lokasiError.innerText = 'Pastikan GPS perangkat Anda aktif dan diizinkan.';
            userCoords = null;
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 } // Opsi GPS Akurat
    );
});


// --- FUNGSI DYNAMIC FORM (Lainnya) ---
jenisKejadian.addEventListener('change', (e) => {
    if (e.target.value === 'Lainnya') {
        lainnyaContainer.classList.remove('d-none');
        document.getElementById('deskripsiLainnya').setAttribute('required', 'required');
    } else {
        lainnyaContainer.classList.add('d-none');
        document.getElementById('deskripsiLainnya').removeAttribute('required');
    }
});


// --- FUNGSI SUBMIT KE FIREBASE ---
document.getElementById('formLapor').addEventListener('submit', async (e) => {
    e.preventDefault();

    // 1. Validasi
    const jenis = jenisKejadian.value;
    const detailLainnya = document.getElementById('deskripsiLainnya').value.trim();

    if(!userCoords) { alert("Harap ambil lokasi GPS terlebih dahulu!"); return; }
    if(jenis === "") { alert("Harap pilih jenis kejadian!"); return; }
    if(jenis === 'Lainnya' && detailLainnya.length < 5) { 
        alert("Harap isi detail kejadian Lainnya (minimal 5 karakter)."); 
        return; 
    }
    
    const submitButton = e.target.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    submitButton.innerText = 'Mengirim Data...';


    // 2. Tentukan Jenis Final
    const finalJenis = (jenis === 'Lainnya') ? `Lainnya: ${detailLainnya}` : jenis;


    // 3. Payload untuk Firebase
    const reportData = {
        jenis: finalJenis,
        kecamatan: detectedKecamatan, // DATA BARU!
        lat: userCoords.lat,
        lng: userCoords.lng,
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        status: 'pending'
    };

    // 4. Kirim Data ke Firestore Database
    try {
        await db.collection('reports').add(reportData);

        alert("Laporan Berhasil Terkirim Real-time ke Pusat Komando!");
        window.location.href = "index.html";
    } catch (error) {
        console.error("Error saat mengirim ke Firebase:", error);
        alert("⚠️ Gagal Terkirim ke Server. Cek Konfigurasi Firebase!");
        submitButton.disabled = false;
        submitButton.innerText = 'Kirim Laporan';
    }
});