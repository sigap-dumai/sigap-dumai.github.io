// assets/js/modules/lapor.js (FIX: Memastikan skrip berjalan setelah DOM siap)

document.addEventListener('DOMContentLoaded', () => {
    console.log("Modul Lapor.js Dimuat: Siap menunggu aksi user.");

    const btnLokasi = document.getElementById('btnLokasi');
    const jenisKejadian = document.getElementById('jenisKejadian');
    const lainnyaContainer = document.getElementById('lainnyaInputContainer');
    const lokasiStatus = document.getElementById('lokasiStatus');
    const kecamatanStatus = document.getElementById('kecamatanStatus');
    const lokasiError = document.getElementById('lokasiError');
    const formLapor = document.getElementById('formLapor');

    let userCoords = null;
    let detectedKecamatan = "Lokasi Tidak Terdeteksi";

    // --- FUNGSI DETEKSI KECAMATAN (Reverse Geocoding) ---
    async function reverseGeocode(lat, lng) {
        const osmApiUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=15&addressdetails=1`;
        
        try {
            const response = await fetch(osmApiUrl);
            const data = await response.json();
            
            const address = data.address;
            let kecamatan = "Kecamatan Tidak Dikenali";
            
            if (address.suburb) {
                kecamatan = address.suburb;
            } else if (address.city_district) {
                kecamatan = address.city_district;
            } else if (address.village) {
                kecamatan = address.village;
            } else if (address.town) {
                kecamatan = address.town;
            }

            if (kecamatan === "Kecamatan Tidak Dikenali" && address.county) {
                 kecamatan = address.county;
            }
            
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
                
                kecamatanStatus.value = "Sedang mendeteksi Kecamatan...";
                reverseGeocode(userCoords.lat, userCoords.lng);
            },
            (error) => {
                lokasiStatus.innerText = "Status Lokasi: Gagal mengambil GPS.";
                lokasiError.innerText = 'Pastikan GPS perangkat Anda aktif dan diizinkan.';
                userCoords = null;
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
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
    formLapor.addEventListener('submit', async (e) => {
        e.preventDefault(); // PENTING: Mencegah refresh halaman
        
        console.log("DEBUG: Tombol Kirim Diklik. Mencegah Refresh Halaman.");

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
            kecamatan: detectedKecamatan,
            lat: userCoords.lat,
            lng: userCoords.lng,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            status: 'pending'
        };

        console.log("DEBUG: Payload Siap:", reportData);

        // 4. Kirim Data ke Firestore Database
        try {
            await db.collection('reports').add(reportData);

            console.log("DEBUG: Berhasil Kirim ke Firestore!");
            alert("Laporan Berhasil Terkirim Real-time ke Pusat Komando!");
            window.location.href = "index.html";
        } catch (error) {
            // FIX: Tambahkan logging spesifik untuk debugging
            console.error("=================================================");
            console.error("⚠️ ERROR FIREBASE SUBMISSION GAGAL:", error);
            console.error("KEMUNGKINAN BESAR: Aturan Keamanan (Security Rules) Firestore salah. Pastikan 'allow write: if true' di collection /reports.");
            console.error("=================================================");
            
            alert("⚠️ GAGAL TERKIRIM. Cek Konsol (F12) untuk detail error Permintaan Izin (Permission Denied).");
            submitButton.disabled = false;
            submitButton.innerText = 'Kirim Laporan';
        }
    });
});