// =============================================================
// Dashboard.js – SiGap Dumai
// =============================================================

// --- Konstanta ---
const LAST_VIEW_KEY = "sigap_notif_last_view";
const REPORT_KEY = "sigap_laporan";
const WEATHER_KEY = "d2482cbc5428fccde0297d4aab71e3ee";
const BMKG_FWI_API = "https://api.bmkg.go.id/publik/prakiraan/karhutla.json"; // FWI nasional

// =============================================================
// INIT
// =============================================================
document.addEventListener("DOMContentLoaded", async () => {
    initMap();
    renderWeather();
    renderEarthquake();
    await renderKarhutla();
    renderReportStatistics();
    renderNotificationBadge();
});

// =============================================================
// DATA LAPORAN
// =============================================================
function getStoredReports() {
    try {
        const raw = localStorage.getItem(REPORT_KEY);
        if (!raw) return seedDummyReports([]);
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed) || parsed.length < 80) {
            return seedDummyReports(parsed || []);
        }
        return parsed;
    } catch {
        return seedDummyReports([]);
    }
}

function seedDummyReports(existing) {
    const target = 80;
    const jenisList = ["banjir", "karhutla", "kebakaran", "angin_kencang", "lainnya"];
    const areaList = [
        { nama: "Bukit Kapur", lat: 1.727, lon: 101.372 },
        { nama: "Dumai Timur", lat: 1.685, lon: 101.455 },
        { nama: "Dumai Barat", lat: 1.668, lon: 101.420 },
        { nama: "Dumai Kota", lat: 1.682, lon: 101.448 },
        { nama: "Dumai Selatan", lat: 1.638, lon: 101.450 },
        { nama: "Medang Kampai", lat: 1.590, lon: 101.540 },
        { nama: "Sungai Sembilan", lat: 1.720, lon: 101.500 }
    ];
    const base = existing || [];
    const needed = target - base.length;
    for (let i = 0; i < needed; i++) {
        const jenis = jenisList[Math.floor(Math.random() * jenisList.length)];
        const area = areaList[Math.floor(Math.random() * areaList.length)];
        const date = new Date();
        date.setDate(date.getDate() - Math.floor(Math.random() * 7));
        base.push({
            id: Date.now() + i,
            jenis,
            lokasi: `${area.lat + Math.random() * 0.01}, ${area.lon + Math.random() * 0.01} – ${area.nama}`,
            deskripsi: `Laporan ${jenis} di ${area.nama}.`,
            waktu: date.toISOString()
        });
    }
    localStorage.setItem(REPORT_KEY, JSON.stringify(base));
    return base;
}

// =============================================================
// MAP & MARKERS
// =============================================================
function initMap() {
    const map = L.map("map").setView([1.667, 101.45], 11);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap",
        maxZoom: 19
    }).addTo(map);

    // Load boundary GeoJSON Dumai
    fetch("/geojson/dumai.geojson")
        .then((res) => res.json())
        .then((data) => {
            L.geoJSON(data, {
                style: { color: "#2563eb", weight: 2, fillOpacity: 0.05 }
            }).addTo(map);
        })
        .catch((err) => console.warn("Gagal load GeoJSON Dumai:", err));

    loadLaporanMarkers(map);
}

function loadLaporanMarkers(map) {
    const reports = getStoredReports();
    reports.forEach((r) => {
        const match = r.lokasi.match(/([\d\.\-]+),\s*([\d\.\-]+)/);
        if (match) {
            const lat = parseFloat(match[1]);
            const lon = parseFloat(match[2]);
            L.marker([lat, lon])
                .addTo(map)
                .bindPopup(
                    `<strong>${r.jenis.toUpperCase()}</strong><br>${r.deskripsi}<br><small>${new Date(
                        r.waktu
                    ).toLocaleString("id-ID")}</small>`
                );
        }
    });
}

// =============================================================
// WEATHER
// =============================================================
function renderWeather() {
    const card = document.getElementById("card-cuaca");
    if (!card) return;
    fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=Dumai&appid=${WEATHER_KEY}&units=metric&lang=id`
    )
        .then((r) => r.json())
        .then((data) => {
            card.innerHTML = `
                <h3>Cuaca</h3>
                <p>${data.weather[0].description}</p>
                <p><strong>${Math.round(data.main.temp)}°C</strong></p>
                <small>Kelembapan ${data.main.humidity}% | ${data.name}</small>
            `;
        })
        .catch(() => {
            card.innerHTML = `<h3>Cuaca</h3><p>Tidak tersedia</p>`;
        });
}

// =============================================================
// GEMPA
// =============================================================
function renderEarthquake() {
    const card = document.getElementById("card-gempa");
    if (!card) return;
    fetch("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson")
        .then((r) => r.json())
        .then((data) => {
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
        })
        .catch(() => {
            card.innerHTML = `<h3>Gempa</h3><p>Tidak tersedia</p>`;
        });
}

// =============================================================
// KARHUTLA (API BMKG)
// =============================================================
async function renderKarhutla() {
    const card = document.getElementById("card-karhutla");
    if (!card) return;
    try {
        const res = await fetch(BMKG_FWI_API);
        const data = await res.json();

        // Ambil data wilayah Riau dari hasil JSON
        const riau = data.data.find((p) => p.provinsi?.toLowerCase() === "riau");
        if (riau) {
            const risiko = riau.level;
            card.innerHTML = `
                <h3>Karhutla (BMKG)</h3>
                <p>Provinsi: <strong>Riau</strong></p>
                <p>Status Risiko: <strong>${risiko}</strong></p>
                <small>Data: BMKG Fire Weather Index (FWI) - ${riau.update}</small>
            `;
        } else {
            card.innerHTML = `
                <h3>Karhutla (BMKG)</h3>
                <p>Data tidak ditemukan untuk Riau.</p>
            `;
        }
    } catch (e) {
        console.warn("Gagal ambil data karhutla BMKG:", e);
        card.innerHTML = `
            <h3>Karhutla</h3>
            <p>Gagal memuat data BMKG.</p>
        `;
    }
}

// =============================================================
// STATISTIK
// =============================================================
function renderReportStatistics() {
    const reports = getStoredReports();
    const card = document.getElementById("card-statistik");
    if (!card) return;
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

// =============================================================
// BADGE NOTIFIKASI
// =============================================================
function getLastViewedTime() {
    const raw = localStorage.getItem(LAST_VIEW_KEY);
    return raw ? new Date(raw) : null;
}

function renderNotificationBadge() {
    const icon = document.querySelector(".nav-item[data-target='notifikasi']");
    if (!icon) return;
    const lastViewed = getLastViewedTime();
    const reports = getStoredReports();
    const newReports = lastViewed
        ? reports.filter((r) => new Date(r.waktu) > lastViewed)
        : reports;
    const count = newReports.length;

    let badge = icon.querySelector(".badge");
    if (!badge) {
        badge = document.createElement("span");
        badge.className =
            "badge absolute -top-1 -right-2 bg-red-600 text-white text-xs rounded-full px-1";
        icon.style.position = "relative";
        icon.appendChild(badge);
    }

    badge.textContent = count > 99 ? "99+" : count;
    badge.style.display = count > 0 ? "inline" : "none";
}
