// =============================================================
// Dashboard.js – SiGap Dumai
// =============================================================

// --- Konstanta ---
const WEATHER_KEY = "d2482cbc5428fccde0297d4aab71e3ee";
const BMKG_FWI_API = "https://api.bmkg.go.id/publik/prakiraan/karhutla.json"; // FWI nasional

// =============================================================
// INIT
// =============================================================
document.addEventListener("DOMContentLoaded", () => {
    loadInitialData();  // Load cuaca dan gempa
    setTimeout(loadAdditionalData, 500); // Load data tambahan (laporan, status) setelah beberapa waktu
});

function loadInitialData() {
    // Memuat Cuaca dan Gempa terlebih dahulu
    renderWeather();
    renderEarthquake();
}

function loadAdditionalData() {
    // Memuat data laporan dan status setelah cuaca dan gempa
    renderReportStatistics();
    renderKarhutla();
    renderNotificationBadge();
}

// =============================================================
// DATA CUACA & GEMPA - Cache dan Fetch
// =============================================================
function renderWeather() {
    const card = document.getElementById("card-cuaca");
    if (!card) return;

    const cachedData = localStorage.getItem('cuacaData');
    const cachedTime = localStorage.getItem('cuacaDataTime');
    const now = new Date().getTime();

    // Jika data ada di cache dan belum lebih dari 30 menit
    if (cachedData && cachedTime && now - cachedTime < 30 * 60 * 1000) {
        const data = JSON.parse(cachedData);
        displayWeatherData(data, card);
    } else {
        fetchWeatherData(card);
    }
}

function fetchWeatherData(card) {
    fetch(`https://api.openweathermap.org/data/2.5/weather?q=Dumai&appid=${WEATHER_KEY}&units=metric&lang=id`)
        .then((r) => r.json())
        .then((data) => {
            localStorage.setItem('cuacaData', JSON.stringify(data));
            localStorage.setItem('cuacaDataTime', new Date().getTime());
            displayWeatherData(data, card);
        })
        .catch(() => {
            card.innerHTML = `<h3>Cuaca</h3><p>Tidak tersedia</p>`;
        });
}

function displayWeatherData(data, card) {
    card.innerHTML = `
        <h3>Cuaca</h3>
        <p>${data.weather[0].description}</p>
        <p><strong>${Math.round(data.main.temp)}°C</strong></p>
        <small>Kelembapan ${data.main.humidity}% | ${data.name}</small>
    `;
}

function renderEarthquake() {
    const card = document.getElementById("card-gempa");
    if (!card) return;

    const cachedData = localStorage.getItem('gempaData');
    const cachedTime = localStorage.getItem('gempaDataTime');
    const now = new Date().getTime();

    // Jika data ada di cache dan belum lebih dari 30 menit
    if (cachedData && cachedTime && now - cachedTime < 30 * 60 * 1000) {
        const data = JSON.parse(cachedData);
        displayEarthquakeData(data, card);
    } else {
        fetchEarthquakeData(card);
    }
}

function fetchEarthquakeData(card) {
    fetch("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson")
        .then((r) => r.json())
        .then((data) => {
            localStorage.setItem('gempaData', JSON.stringify(data));
            localStorage.setItem('gempaDataTime', new Date().getTime());
            displayEarthquakeData(data, card);
        })
        .catch(() => {
            card.innerHTML = `<h3>Gempa</h3><p>Tidak tersedia</p>`;
        });
}

function displayEarthquakeData(data, card) {
    const sorted = data.features
        .sort((a, b) => b.properties.mag - a.properties.mag)
        .slice(0, 3);
    const list = sorted
        .map(
            (q) =>
                `M${q.properties.mag.toFixed(1)} • ${
                    q.properties.place
                } • ${new Date(q.properties.time).toLocaleTimeString("id-ID")}`
        )
        .join("<br>");
    card.innerHTML = `<h3>Gempa Terkini</h3><p>${list}</p>`;
}

// =============================================================
// LAKUKAN LAINNYA (Laporan, Statistik, Notifikasi)
// =============================================================
function renderReportStatistics() {
    const card = document.getElementById("card-statistik");
    if (!card) return;

    // Ambil data laporan dari localStorage atau dummy data
    const reports = getStoredReports();
    const total = reports.length;
    const banjir = reports.filter((r) => r.jenis === "banjir").length;
    const karhutla = reports.filter((r) => r.jenis === "karhutla").length;
    const kebakaran = reports.filter((r) => r.jenis === "kebakaran").length;

    card.innerHTML = `
        <h3>Statistik Laporan</h3>
        <p>Total Laporan: <strong>${total}</strong></p>
        <p>Banjir: ${banjir}, Karhutla: ${karhutla}, Kebakaran: ${kebakaran}</p>
    `;
}

function getStoredReports() {
    // Fungsi untuk mengambil data laporan
    const reports = JSON.parse(localStorage.getItem('reports')) || [];
    return reports;
}

function renderNotificationBadge() {
    const icon = document.querySelector(".nav-item[data-target='notifikasi']");
    if (!icon) return;
    // Contoh notifikasi yang muncul, bisa dikembangkan lebih lanjut
    const count = 5;  // Simulasi jumlah laporan baru
    let badge = icon.querySelector(".badge");
    if (!badge) {
        badge = document.createElement("span");
        badge.className = "badge absolute -top-1 -right-2 bg-red-600 text-white text-xs rounded-full px-1";
        icon.style.position = "relative";
        icon.appendChild(badge);
    }
    badge.textContent = count > 99 ? "99+" : count;
    badge.style.display = count > 0 ? "inline" : "none";
}

// =============================================================
// Dummy Data
function seedDummyReports(existing) {
    const target = 80;
    const jenisList = ["banjir", "karhutla", "kebakaran", "angin_kencang", "lainnya"];
    const base = existing || [];
    while (base.length < target) {
        base.push({
            id: `report_${base.length}`,
            jenis: jenisList[Math.floor(Math.random() * jenisList.length)],
            lokasi: "Dumai",
            deskripsi: "Deskripsi laporan...",
            waktu: new Date().toISOString(),
        });
    }
    localStorage.setItem('reports', JSON.stringify(base));
    return base;
}
