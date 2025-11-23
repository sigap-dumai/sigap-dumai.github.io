// =============================================================
// Dashboard.js – SiGap Dumai (Muat Dummy Terlebih Dahulu, Baru API)
// =============================================================

// --- Konstanta ---
const WEATHER_KEY = "d2482cbc5428fccde0297d4aab71e3ee";
const BMKG_FWI_API = "https://api.bmkg.go.id/publik/prakiraan/karhutla.json"; // FWI nasional

// =============================================================
// INIT
// =============================================================
document.addEventListener("DOMContentLoaded", () => {
    loadDummyData();  // Muat data dummy terlebih dahulu
    setTimeout(loadAPIData, 1000); // Muat data cuaca dan gempa setelah data dummy
});

function loadDummyData() {
    // Memuat data dummy (laporan, karhutla, dan notifikasi)
    renderReportStatistics();
    renderKarhutla();
    renderNotificationBadge();
}

function loadAPIData() {
    // Memuat data cuaca dan gempa setelah data dummy
    renderWeather();
    renderEarthquake();
}

// =============================================================
// DATA CUACA & GEMPA - Menggunakan API
// =============================================================
function renderWeather() {
    const card = document.getElementById("card-cuaca");
    if (!card) return;

    fetchWeatherData(card);
}

function fetchWeatherData(card) {
    fetch(`https://api.openweathermap.org/data/2.5/weather?q=Dumai&appid=${WEATHER_KEY}&units=metric&lang=id`)
        .then((r) => r.json())
        .then((data) => {
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

    fetchEarthquakeData(card);
}

function fetchEarthquakeData(card) {
    fetch("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson")
        .then((r) => r.json())
        .then((data) => {
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
// DATA LAINNYA - Dummy
// =============================================================
function renderReportStatistics() {
    const card = document.getElementById("card-statistik");
    if (!card) return;

    // Menggunakan data dummy untuk laporan
    const reports = seedDummyReports();
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

function seedDummyReports() {
    const target = 80;
    const jenisList = ["banjir", "karhutla", "kebakaran", "angin_kencang", "lainnya"];
    const base = [];
    while (base.length < target) {
        base.push({
            id: `report_${base.length}`,
            jenis: jenisList[Math.floor(Math.random() * jenisList.length)],
            lokasi: "Dumai",
            deskripsi: "Deskripsi laporan...",
            waktu: new Date().toISOString(),
        });
    }
    return base;
}

function renderKarhutla() {
    const card = document.getElementById("card-karhutla");
    if (!card) return;

    // Data dummy status karhutla
    card.innerHTML = `
        <h3>Karhutla</h3>
        <p>Status: <strong>Tinggi</strong></p>
        <small>Data terbaru: ${new Date().toLocaleString()}</small>
    `;
}

function renderNotificationBadge() {
    const icon = document.querySelector(".nav-item[data-target='notifikasi']");
    if (!icon) return;

    // Simulasi jumlah laporan baru
    const count = 5;
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
