document.addEventListener("DOMContentLoaded", () => {
    // 1. Inisialisasi Peta
    const map = L.map('map').setView([CONFIG.defaultLat, CONFIG.defaultLng], 12);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap' }).addTo(map);
    
    // 2. Load Data Utama
    loadDashboardStats();
    getRealTimeWeather();
    fetchEarthquakeData();
    
    // 3. Load Marker POSKO (Sesuai 7 Titik Akurat dari Pak Tami)
    loadPoskoMarkers(map);

    // Dummy Data Marker Hotspot (Titik panas tetap dummy)
    const hotspots = [{lat: 1.6900, lng: 101.4500}, {lat: 1.6700, lng: 101.4300}];
    hotspots.forEach(h => L.circleMarker([h.lat, h.lng], {color: '#ff4757', radius: 8, fillOpacity: 1}).addTo(map).bindPopup("Hotspot"));
});

// --- DATA POSKO AKURAT (DARI PAK TAMI) ---
const POSKO_DATA = [
    { name: "Posko Utama Dumai Kota", lat: 1.67724, lng: 101.43969 },
    { name: "Posko Siaga Dumai Timur", lat: 1.66969, lng: 101.45865 },
    { name: "Posko Siaga Dumai Barat", lat: 1.69156, lng: 101.40407 },
    { name: "Posko Siaga Dumai Selatan", lat: 1.6374, lng: 101.3890 },
    { name: "Posko Siaga Sungai Sembilan", lat: 1.8522, lng: 101.3022 },
    { name: "Posko Siaga Bukit Kapur", lat: 1.5537, lng: 101.3853 },
    { name: "Posko Siaga Medang Kampai", lat: 1.6285, lng: 101.5487 }
];

function loadPoskoMarkers(map) {
    const poskoIcon = L.icon({
        iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
    });

    POSKO_DATA.forEach(posko => {
        L.marker([posko.lat, posko.lng], { icon: poskoIcon }).addTo(map)
         .bindPopup(`<b>POSKO TERPADU</b><br>${posko.name}`);
    });
}

// --- FUNGSI GEMPA REAL-TIME (BMKG) ---
async function fetchEarthquakeData() {
    // Menggunakan Proxy CORS agar bisa diakses dari GitHub Pages
    const proxyUrl = 'https://corsproxy.io/?'; 
    const bmkgApiUrl = 'https://data.bmkg.go.id/DataMKG/TEWS/gempadirasakan.json';
    
    try {
        const response = await fetch(proxyUrl + bmkgApiUrl);
        const data = await response.json();
        const gempa = data.Infogempa.gempa; 

        if (gempa) {
            const banner = document.getElementById('earthquake-banner');
            const waktu = gempa.Tanggal + ', ' + gempa.Jam.split(" ")[0];

            document.getElementById('eq-magnitude').innerText = `M${gempa.Magnitude} | ${gempa.Kedalaman}`;
            document.getElementById('eq-location').innerText = `${gempa.Wilayah}`;
            document.getElementById('eq-time').innerText = waktu;

            banner.classList.remove('d-none');
            
            // Marker gempa
            const eqLat = parseFloat(gempa.Lintang.replace(/[A-Z]/g, ''));
            const eqLng = parseFloat(gempa.Bujur.replace(/[A-Z]/g, ''));

            if (!isNaN(eqLat) && !isNaN(eqLng)) {
                L.circleMarker([eqLat, eqLng], { color: 'yellow', fillColor: '#FFD700', fillOpacity: 0.8, radius: 15 })
                 .addTo(map)
                 .bindPopup(`<b>Gempa M${gempa.Magnitude}</b><br>${gempa.Wilayah}`)
                 .openPopup();
            }
        }
    } catch (error) {
        console.warn("Gagal mengambil data Gempa BMKG.");
    }
}


// --- FUNGSI STATS & CUACA ---

function loadDashboardStats() {
    // A. Laporan Masuk (Mengambil dari LocalStorage)
    const dataLaporan = JSON.parse(localStorage.getItem("dataLaporan_SIGAP")) || [];
    document.getElementById('laporan-count').innerHTML = `${dataLaporan.length} <small class="fs-6 text-muted">masuk</small>`;

    // B. Hotspot & ISPU (Simulasi Data Statis)
    document.getElementById('hotspot-count').innerText = '5'; 
    
    const ispuValue = 45; 
    let ispuStatus = "Baik";
    let ispuColor = "text-success";

    if (ispuValue > 50 && ispuValue <= 100) {
        ispuStatus = "Sedang";
        ispuColor = "text-warning";
    } else if (ispuValue > 100) {
        ispuStatus = "Tidak Sehat";
        ispuColor = "text-danger";
    }
    
    document.getElementById('ispu-status').innerText = ispuStatus;
    document.getElementById('ispu-status').classList.remove('text-success', 'text-warning', 'text-danger');
    document.getElementById('ispu-status').classList.add(ispuColor);
}

async function getRealTimeWeather() {
    const apiURL = `https://api.open-meteo.com/v1/forecast?latitude=${CONFIG.defaultLat}&longitude=${CONFIG.defaultLng}&current_weather=true&timezone=auto`;

    try {
        const response = await fetch(apiURL);
        const data = await response.json();
        const weather = data.current_weather;

        document.getElementById('cuaca-suhu').innerText = `${weather.temperature}°C`;
        const weatherInfo = getWeatherDesc(weather.weathercode);
        document.getElementById('cuaca-desc').innerText = weatherInfo.text;
        
        const iconEl = document.getElementById('cuaca-icon');
        iconEl.className = `fas ${weatherInfo.icon} fs-4`;
        iconEl.classList.remove('fa-spin', 'text-warning', 'text-secondary', 'text-info');
        iconEl.classList.add(weatherInfo.color);

    } catch (error) {
        console.error("Gagal ambil cuaca:", error);
        document.getElementById('cuaca-desc').innerText = "Gagal memuat";
    }
}

function getWeatherDesc(code) {
    if (code === 0) return { text: "Cerah", icon: "fa-sun", color: "text-warning" };
    if (code >= 1 && code <= 3) return { text: "Berawan", icon: "fa-cloud-sun", color: "text-secondary" };
    if (code >= 45 && code <= 48) return { text: "Berkabut", icon: "fa-smog", color: "text-secondary" };
    if (code >= 51 && code <= 67) return { text: "Hujan Ringan", icon: "fa-cloud-rain", color: "text-info" };
    if (code >= 71 && code <= 77) return { text: "Hujan Es", icon: "fa-snowflake", color: "text-info" };
    if (code >= 80 && code <= 82) return { text: "Hujan Lebat", icon: "fa-cloud-showers-heavy", color: "text-primary" };
    if (code >= 95 && code <= 99) return { text: "Badai Petir", icon: "fa-bolt", color: "text-danger" };
    
    return { text: "Berawan", icon: "fa-cloud", color: "text-secondary" };
}