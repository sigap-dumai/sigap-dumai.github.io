document.addEventListener("DOMContentLoaded", () => {
    initMap();
    initWeather();
    initGempa();
    updateStatusSiaga();
    updateJumlahLaporan();

    // Tombol Notifikasi
    const btnNotif = document.getElementById('btnNotifikasi');
    if(btnNotif){
        btnNotif.addEventListener('click', () => {
            const pesan = document.getElementById('notifikasi-jalan').innerText;
            alert("⚠️ INFO PERINGATAN DINI BPBD DUMAI:\n\n" + pesan);
        });
    }
});

// --- 1. INISIALISASI PETA (SATELIT + SEMUA MARKER) ---
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

    // D. Marker Banjir/Pasang (BIRU) - BARU!
    const floods = [
        { lat: 1.6850, lng: 101.4400, loc: "Banjir Rob Jl. Cempedak" },
        { lat: 1.6920, lng: 101.4150, loc: "Pasang Kel. Pangkalan Sesai" },
        { lat: 1.6750, lng: 101.4600, loc: "Genangan Jl. Jend. Sudirman" },
        { lat: 1.6600, lng: 101.4250, loc: "Banjir Ratu Sima" }
    ];
    floods.forEach(f => L.circleMarker([f.lat, f.lng], { 
        color: '#1e90ff',       // Warna Biru Laut
        fillColor: '#1e90ff', 
        fillOpacity: 0.8, 
        radius: 7 
    }).addTo(map).bindPopup(`<b>🌊 BANJIR/PASANG:</b> ${f.loc}`));
}

// --- 2. FITUR LAIN (SAMA SEPERTI SEBELUMNYA) ---
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