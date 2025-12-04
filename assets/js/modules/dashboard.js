document.addEventListener("DOMContentLoaded", () => {
    // 1. GENERATE DUMMY DATA (Jika belum ada laporan)
    seedDummyReports();

    // 2. JALANKAN FITUR UTAMA
    initMap();
    initWeather();
    initGempa();
    updateStatusSiaga();
    updateJumlahLaporan();

    // 3. Tombol Notifikasi
    const btnNotif = document.getElementById('btnNotifikasi');
    if(btnNotif){
        btnNotif.addEventListener('click', () => {
            const pesan = document.getElementById('notifikasi-jalan').innerText;
            alert("⚠️ INFO PERINGATAN DINI BPBD DUMAI:\n\n" + pesan);
        });
    }
});

// --- FUNGSI BARU: MEMBUAT DATA PALSU LAPORAN WARGA (SIMULASI) ---
function seedDummyReports() {
    const data = JSON.parse(localStorage.getItem("dataLaporan_SIGAP"));
    // Hanya buat data dummy jika database kosong
    if (!data || data.length === 0) {
        const dummy = [
            { waktu: "4/12/2023, 10:00:00", jenis: "Jalan Rusak", lat: 1.6780, lng: 101.4450, kelurahan: "Kel. Bintan" },
            { waktu: "4/12/2023, 14:30:00", jenis: "Hewan Buas", lat: 1.7010, lng: 101.3950, kelurahan: "Kel. Purnama" },
            { waktu: "4/12/2023, 16:15:00", jenis: "Tiang Listrik Roboh", lat: 1.6600, lng: 101.4700, kelurahan: "Kel. Jaya Mukti" },
            { waktu: "5/12/2023, 09:00:00", jenis: "Kecelakaan", lat: 1.6850, lng: 101.4200, kelurahan: "Kel. Ratu Sima" }
        ];
        localStorage.setItem("dataLaporan_SIGAP", JSON.stringify(dummy));
        console.log("Data simulasi laporan warga berhasil dibuat.");
    }
}

// --- INISIALISASI PETA (SATELIT + SEMUA MARKER) ---
function initMap() {
    const map = L.map('map').setView([CONFIG.defaultLat, CONFIG.defaultLng], 11);
    
    // Tampilan Satelit
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles © Esri'
    }).addTo(map);

    // A. Marker Posko (HIJAU)
    const posko = [
        { n: "Posko Dumai Kota", lat: 1.6815, lng: 101.4475 },
        { n: "Posko Dumai Barat", lat: 1.6943, lng: 101.4098 },
        { n: "Posko Dumai Timur", lat: 1.6662, lng: 101.4829 },
        { n: "Posko Dumai Selatan", lat: 1.6498, lng: 101.4334 },
        { n: "Posko Bukit Kapur", lat: 1.5714, lng: 101.3562 },
        { n: "Posko Sei Sembilan", lat: 1.7766, lng: 101.3262 },
        { n: "Posko Medang Kampai", lat: 1.6214, lng: 101.5978 }
    ];
    posko.forEach(p => L.circleMarker([p.lat, p.lng], { color: '#2ed573', fillColor: '#2ed573', fillOpacity: 0.8, radius: 6 }).addTo(map).bindPopup(`<b>🏕️ ${p.n}</b>`));

    // B. Marker Hotspot (MERAH)
    const hot = [
        { lat: 1.6900, lng: 101.4500, loc: "Jl. Putri Tujuh" },
        { lat: 1.6700, lng: 101.4300, loc: "Area Kilang" },
        { lat: 1.6000, lng: 101.5500, loc: "Pelintung" }
    ];
    hot.forEach(h => L.circleMarker([h.lat, h.lng], { color: '#ff4757', fillColor: '#ff4757', fillOpacity: 0.8, radius: 8 }).addTo(map).bindPopup(`<b>🔥 HOTSPOT:</b> ${h.loc}`));

    // C. Marker Angin/Pohon (ORANGE)
    const wind = [
        { lat: 1.6960, lng: 101.4200, loc: "Pohon Tumbang Dock Yard" },
        { lat: 1.6300, lng: 101.3800, loc: "Angin Kencang Bagan Besar" },
        { lat: 1.6500, lng: 101.5200, loc: "Pohon Tumbang Mundam" },
        { lat: 1.7400, lng: 101.3400, loc: "Badai Pesisir Sei Sembilan" },
        { lat: 1.6100, lng: 101.5800, loc: "Angin Kencang Medang Kampai" }
    ];
    wind.forEach(w => L.circleMarker([w.lat, w.lng], { color: '#ffa500', fillColor: '#ffa500', fillOpacity: 0.8, radius: 7 }).addTo(map).bindPopup(`<b>💨 ANGIN KENCANG:</b> ${w.loc}`));

    // D. Marker Banjir/Pasang (BIRU)
    const floods = [
        { lat: 1.6850, lng: 101.4400, loc: "Banjir Rob Jl. Cempedak" },
        { lat: 1.6920, lng: 101.4150, loc: "Pasang Kel. Pangkalan Sesai" },
        { lat: 1.6750, lng: 101.4600, loc: "Genangan Jl. Jend. Sudirman" },
        { lat: 1.6600, lng: 101.4250, loc: "Banjir Ratu Sima" }
    ];
    floods.forEach(f => L.circleMarker([f.lat, f.lng], { 
        color: '#1e90ff', fillColor: '#1e90ff', fillOpacity: 0.8, radius: 7 
    }).addTo(map).bindPopup(`<b>🌊 BANJIR/PASANG:</b> ${f.loc}`));

    // E. MARKER LAPORAN WARGA (UNGU) - [FITUR TAMBAHAN BARU]
    // Mengambil data dari LocalStorage yang diisi oleh seedDummyReports atau input manual
    const laporanWarga = JSON.parse(localStorage.getItem("dataLaporan_SIGAP")) || [];
    laporanWarga.forEach(lap => {
        // Kita pakai warna UNGU (#9c27b0) agar beda dengan Banjir (Biru)
        L.circleMarker([lap.lat, lap.lng], {
            color: '#fff',          // Garis putih biar kontras
            weight: 1,
            fillColor: '#9c27b0',   // Isi Ungu
            fillOpacity: 1,
            radius: 5               // Ukuran kecil tapi solid
        }).addTo(map).bindPopup(`
            <b>👤 LAPORAN WARGA</b><br>
            Jenis: <b>${lap.jenis}</b><br>
            Area: ${lap.kelurahan || '-'}<br>
            <small>${lap.waktu}</small>
        `);
    });
}

// --- FITUR LAIN (TETAP ADA) ---
async function initWeather() {
    try {
        const response = await fetch("https://api.open-meteo.com/v1/forecast?latitude=1.68&longitude=101.45&current_weather=true&timezone=Asia%2FBangkok");
        const data = await response.json();
        const code = data.current_weather.weathercode;
        document.getElementById('cuaca-suhu').innerText = `${data.current_weather.temperature}°C`;
        
        let desc = "Cerah", icon = "fa-sun text-warning";
        if(code > 3) { desc = "Berawan"; icon = "fa-cloud text-secondary"; }
        if(code > 50) { desc = "Hujan"; icon = "fa-cloud-rain text-info"; }
        
        document.getElementById('cuaca-desc').innerText = desc;
        document.getElementById('cuaca-icon').className = `fas ${icon} fs-4`;
    } catch (e) { document.getElementById('cuaca-desc').innerText = "-"; }
}

async function initGempa() {
    const container = document.getElementById('list-gempa');
    try {
        const res = await fetch('https://data.bmkg.go.id/DataMKG/TEWS/gempaterkini.json');
        if(!res.ok) throw new Error();
        const data = await res.json();
        container.innerHTML = "";
        data.Infogempa.gempa.slice(0, 3).forEach(g => {
            container.innerHTML += `<div class="gempa-item"><span class="gempa-mag">${g.Magnitude}</span> ${g.Wilayah}<br><small class="text-muted">${g.Jam}</small></div>`;
        });
    } catch (e) {
        container.innerHTML = `<div class="gempa-item"><span class="gempa-mag">5.0</span> Simulasi Gempa Laut <br><small>Baru saja</small></div>`;
    }
}

function updateStatusSiaga() {
    document.getElementById('status-text').innerText = "SIAGA 1";
    document.getElementById('status-text').className = "fw-bold fs-5 mb-1 text-danger";
    document.getElementById('status-desc').innerText = "Waspada Banjir Rob & Karhutla";
    document.getElementById('notifikasi-jalan').innerText = "⚠️ PERINGATAN DINI: Waspada Pasang Air Laut (ROB) di wilayah Dumai Kota dan Dumai Barat sore ini. Hindari daerah pinggir pantai.";
}

function updateJumlahLaporan() {
    const data = JSON.parse(localStorage.getItem("dataLaporan_SIGAP")) || [];
    document.getElementById("jml-laporan").innerText = data.length + " Laporan";
}