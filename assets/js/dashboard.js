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

    // Menampilkan placeholder "Memuat Cuaca..." sebelum data muncul
    card.innerHTML = "<p>Memuat Cuaca...</p>";

    fetchWeatherData(card);
}

function fetchWeatherData(card) {
    // Caching untuk cuaca, jika sudah ada di localStorage, gunakan
    const cachedData = localStorage.getItem('cuacaData');
    const cachedTime = localStorage.getItem('cuacaDataTime');
    const now = new Date().getTime();

    // Jika data ada di cache dan belum lebih dari 30 menit
    if (cachedData && cachedTime && now - cachedTime < 30 * 60 * 1000) {
        const data = JSON.parse(cachedData);
        displayWeatherData(data, card);
    } else {
        fetch(`https://api.openweathermap.org/data/2.5/weather?q=Dumai&appid=${WEATHER_KEY}&units=metric&lang=id`)
            .then((r) => r.json())
            .then((data) => {
                // Simpan data cuaca di localStorage
                localStorage.setItem('cuacaData', JSON.stringify(data));
                localStorage.setItem('cuacaDataTime', new Date().getTime());
                displayWeatherData(data, card);
            })
            .catch(() => {
                card.innerHTML = `<h3>Cuaca</h3><p>Tidak tersedia</p>`;
            });
    }
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

    // Menampilkan placeholder "Memuat Gempa..." sebelum data muncul
    card.innerHTML = "<p>Memuat Gempa...</p>";

    fetchEarthquakeData(card);
}

function fetchEarthquakeData(card) {
    // Caching untuk gempa, jika sudah ada di localStorage, gunakan
    const cachedData = localStorage.getItem('gempaData');
    const cachedTime = localStorage.getItem('gempaDataTime');
    const now = new Date().getTime();

    // Jika data ada di cache dan belum lebih dari 30 menit
    if (cachedData && cachedTime && now - cachedTime < 30 * 60 * 1000) {
        const data = JSON.parse(cachedData);
        displayEarthquakeData(data, card);
    } else {
        fetch("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson")
            .then((r) => r.json())
            .then((data) => {
                // Simpan data gempa di localStorage
                localStorage.setItem('gempaData', JSON.stringify(data));
                localStorage.setItem('gempaDataTime', new Date().getTime());
                displayEarthquakeData(data, card);
            })
            .catch(() => {
                card.innerHTML = `<h3>Gempa</h3><p>Tidak tersedia</p>`;
            });
    }
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

// =============================================================
// Tombol Notifikasi - Perbaikan Responsif & Tema Alert
// =============================================================
function renderNotificationBadge() {
    const icon = document.querySelector(".nav-item[data-target='notifikasi']");
    if (!icon) return;

    // Ganti ikon notifikasi dengan ikon tema peringatan (alert)
    icon.innerHTML = `
        <i class="fa-solid fa-triangle-exclamation text-lg text-yellow-600"></i>
    `;

    const count = 5;  // Simulasi jumlah laporan baru
    let badge = icon.querySelector(".badge");

    if (!badge) {
        badge = document.createElement("span");
        badge.className = "badge absolute -top-1 -right-2 bg-red-600 text-white text-xs rounded-full px-1";
        icon.style.position = "relative";
        icon.appendChild(badge);
    }

    // Menampilkan badge jika ada laporan baru
    badge.textContent = count > 99 ? "99+" : count;
    badge.style.display = count > 0 ? "inline" : "none";

    // Tambahkan event listener klik pada tombol notifikasi
    icon.addEventListener("click", () => {
        // Aksi saat tombol notifikasi diklik
        showAlertNotifikasi();
    });
}

<<<<<<< HEAD
// Ambil laporan dari localStorage atau gunakan laporan dummy
let reports = getStoredReports();

// Gabungkan data dummy dengan laporan warga
const dashboardData = {
    ...dummyData,
    reports: reports
};

// Panggil fungsi updateDashboard untuk menampilkan data
updateDashboard(dashboardData);

// Menambahkan event listener untuk card
document.querySelectorAll('.info-card').forEach(card => {
    card.addEventListener('click', function() {
        alert(`${card.querySelector('h3').innerText} clicked!`);
    });
});
=======
function showAlertNotifikasi() {
    // Tampilkan alert atau notifikasi di bagian lain
    alert("Ada 5 laporan baru yang perlu perhatian!");
}
>>>>>>> parent of 1634695 (Update dashboard.js)
