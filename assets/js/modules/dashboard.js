document.addEventListener("DOMContentLoaded", () => {
    initMap();
    initWeather();
    initGempa();
    updateStatusSiaga();
    updateJumlahLaporan();
});

// --- 1. INISIALISASI PETA (SATELIT + MARKER) ---
function initMap() {
    const map = L.map('map').setView([CONFIG.defaultLat, CONFIG.defaultLng], 11);

    // Tampilan Satelit (Esri)
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri'
    }).addTo(map);

    // Marker Posko (Hijau)
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

    // Marker Hotspot (Merah)
    const hot = [
        { lat: 1.6900, lng: 101.4500, loc: "Jl. Putri Tujuh" },
        { lat: 1.6700, lng: 101.4300, loc: "Area Kilang" },
        { lat: 1.6000, lng: 101.5500, loc: "Pelintung" }
    ];
    hot.forEach(h => L.circleMarker([h.lat, h.lng], { color: '#ff4757', fillColor: '#ff4757', fillOpacity: 0.8, radius: 8 }).addTo(map).bindPopup(`<b>🔥 HOTSPOT:</b> ${h.loc}`));

    // Marker Angin/Pohon (Orange)
    const wind = [
        { lat: 1.6960, lng: 101.4200, loc: "Pohon Tumbang Dock Yard" },
        { lat: 1.6300, lng: 101.3800, loc: "Angin Kencang Bagan Besar" },
        { lat: 1.6500, lng: 101.5200, loc: "Pohon Tumbang Mundam" },
        { lat: 1.7400, lng: 101.3400, loc: "Badai Pesisir Sei Sembilan" },
        { lat: 1.6100, lng: 101.5800, loc: "Angin Kencang Medang Kampai" }
    ];
    wind.forEach(w => L.circleMarker([w.lat, w.lng], { color: '#ffa500', fillColor: '#ffa500', fillOpacity: 0.8, radius: 7 }).addTo(map).bindPopup(`<b>💨 ANGIN KENCANG:</b> ${w.loc}`));
}

// --- 2. FITUR CUACA REALTIME (Open-Meteo API) ---
async function initWeather() {
    // Koordinat Dumai
    const url = "https://api.open-meteo.com/v1/forecast?latitude=1.68&longitude=101.45&current_weather=true&timezone=Asia%2FBangkok";
    
    try {
        const response = await fetch(url);
        const data = await response.json();
        const temp = data.current_weather.temperature;
        const code = data.current_weather.weathercode;

        document.getElementById('cuaca-suhu').innerText = `${temp}°C`;
        
        // Menerjemahkan kode cuaca
        let desc = "Cerah";
        let iconClass = "fa-sun text-warning";
        
        if(code > 3) { desc = "Berawan"; iconClass = "fa-cloud text-secondary"; }
        if(code > 50) { desc = "Gerimis"; iconClass = "fa-cloud-rain text-info"; }
        if(code > 80) { desc = "Hujan Deras"; iconClass = "fa-poo-storm text-dark"; }

        document.getElementById('cuaca-desc').innerText = desc;
        document.getElementById('cuaca-icon').className = `fas ${iconClass} fs-4`;

    } catch (error) {
        document.getElementById('cuaca-desc').innerText = "Gagal memuat";
    }
}

// --- 3. FITUR GEMPA TERKINI (BMKG API) ---
async function initGempa() {
    // Menggunakan Proxy jika BMKG memblokir akses langsung, atau akses langsung ke data JSON
    // Untuk demo ini, kita coba fetch langsung. Jika gagal (CORS), kita pakai data dummy simulasi.
    const container = document.getElementById('list-gempa');
    
    try {
        const response = await fetch('https://data.bmkg.go.id/DataMKG/TEWS/gempaterkini.json');
        if (!response.ok) throw new Error("Network response was not ok");
        
        const data = await response.json();
        const gempaList = data.Infogempa.gempa.slice(0, 3); // Ambil 3 Terakhir

        container.innerHTML = ""; // Bersihkan loading
        gempaList.forEach(g => {
            container.innerHTML += `
                <div class="gempa-item">
                    <span class="gempa-mag">${g.Magnitude} SR</span> 
                    ${g.Wilayah} <br>
                    <small class="text-muted">${g.Jam}, ${g.Tanggal}</small>
                </div>
            `;
        });
    } catch (error) {
        // Fallback jika API BMKG tidak bisa diakses langsung dari browser (masalah keamanan browser/CORS)
        console.log("Menggunakan data simulasi gempa karena API terblokir browser");
        container.innerHTML = `
            <div class="gempa-item"><span class="gempa-mag">4.5</span> Simulasi Gempa 1 <br><small>Baru saja</small></div>
            <div class="gempa-item"><span class="gempa-mag">3.2</span> Simulasi Gempa 2 <br><small>1 Jam lalu</small></div>
            <div class="gempa-item"><span class="gempa-mag">5.1</span> Simulasi Gempa 3 <br><small>3 Jam lalu</small></div>
        `;
    }
}

// --- 4. STATUS SIAGA & NOTIFIKASI ---
function updateStatusSiaga() {
    // Logika simulasi status berdasarkan jam atau kondisi
    // Di aplikasi nyata, ini diambil dari database admin
    const statusText = document.getElementById('status-text');
    const statusDesc = document.getElementById('status-desc');
    const notif = document.getElementById('notifikasi-jalan');

    // Kita set Default ke SIAGA (Simulasi)
    statusText.innerText = "SIAGA 1";
    statusText.classList.remove('text-secondary');
    statusText.classList.add('text-danger');
    statusDesc.innerText = "Potensi Karhutla & Angin";

    // Update Teks Berjalan
    notif.innerText = "⚠️ PERINGATAN DINI: Terpantau 3 Titik Panas di Wilayah Medang Kampai dan Potensi Angin Kencang di Dumai Barat. Warga dimohon waspada dan dilarang membakar lahan!";
}

function updateJumlahLaporan() {
    const data = JSON.parse(localStorage.getItem("dataLaporan_SIGAP")) || [];
    document.getElementById("jml-laporan").innerText = data.length + " Laporan";
}