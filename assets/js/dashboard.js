// /assets/js/dashboard.js
// Dashboard end-user, semua laporan diambil dari localStorage
// Pertama kali dijalankan akan mengisi ~80 laporan dummy tersebar di Dumai.

document.addEventListener("DOMContentLoaded", () => {
    const map = initMap();
    initSummaryCards();
    initWeatherCard();
    initEarthquakeCard();
    initKarhutlaCard();
    initActions();
    loadLaporanMarkers(map);
});

/* =========================
   Laporan di localStorage + seeding dummy
   ========================= */
function seedDummyReports(existing) {
    const reports = Array.isArray(existing) ? existing.slice() : [];
    const targetTotal = 80;
    const needed = targetTotal - reports.length;
    if (needed <= 0) {
        return reports;
    }

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

    const deskripsiTemplate = {
        banjir: [
            "Genangan air setinggi betis di pemukiman warga.",
            "Air mulai masuk ke pekarangan rumah.",
            "Akses jalan utama tergenang, kendaraan melambat.",
            "Drainase meluap setelah hujan deras.",
            "Banjir mengganggu aktivitas warga sekitar."
        ],
        karhutla: [
            "Asap tipis terlihat dari arah kebun.",
            "Tercium bau asap cukup kuat di sekitar lokasi.",
            "Titik api kecil terlihat di lahan kosong.",
            "Asap mulai menutupi pandangan di jalan sekitar.",
            "Warga khawatir api merembet ke permukiman."
        ],
        kebakaran: [
            "Asap tebal keluar dari salah satu rumah warga.",
            "Terjadi percikan api di bangunan semi permanen.",
            "Petugas damkar sedang menuju lokasi kebakaran.",
            "Api sudah mulai dapat dikendalikan.",
            "Warga membantu memadamkan api dengan alat seadanya."
        ],
        angin_kencang: [
            "Angin kencang merobohkan beberapa pohon kecil.",
            "Atap seng beberapa rumah terangkat angin.",
            "Terlihat awan gelap dan hembusan angin kuat.",
            "Spanduk dan papan reklame nyaris tumbang.",
            "Warga diminta waspada potensi angin kencang."
        ],
        lainnya: [
            "Laporan gangguan utilitas umum di lingkungan warga.",
            "Ada kejadian yang berpotensi membahayakan keselamatan.",
            "Aktivitas mencurigakan dilaporkan oleh warga.",
            "Kondisi infrastruktur rusak dilaporkan.",
            "Warga membutuhkan bantuan segera di lokasi."
        ]
    };

    for (let i = 0; i < needed; i++) {
        const area = areaList[i % areaList.length];
        const jenis = jenisList[i % jenisList.length];

        // Jitter koordinat sedikit di sekitar area supaya menyebar
        const lat = area.lat + (Math.random() - 0.5) * 0.03;
        const lon = area.lon + (Math.random() - 0.5) * 0.03;

        const descList = deskripsiTemplate[jenis] || deskripsiTemplate.lainnya;
        const deskripsi = descList[i % descList.length];

        // Waktu acak dalam 7 hari terakhir
        const daysAgo = Math.floor(Math.random() * 7);
        const msAgo = daysAgo * 24 * 60 * 60 * 1000 + Math.random() * 60 * 60 * 1000;
        const waktu = new Date(Date.now() - msAgo).toISOString();

        reports.push({
            id: Date.now() + i,
            jenis,
            lokasi: `${lat.toFixed(6)}, ${lon.toFixed(6)} - ${area.nama}`,
            deskripsi,
            waktu
        });
    }

    localStorage.setItem("sigap_laporan", JSON.stringify(reports));
    return reports;
}

function getStoredReports() {
    try {
        const raw = localStorage.getItem("sigap_laporan");
        if (!raw) {
            // Belum ada sama sekali → seed 80 dummy
            return seedDummyReports([]);
        }
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) {
            return seedDummyReports([]);
        }
        // Kalau kurang dari 80 (misalnya pernah dibersihkan), tambahkan lagi sampai 80
        if (parsed.length < 80) {
            return seedDummyReports(parsed);
        }
        return parsed;
    } catch {
        return seedDummyReports([]);
    }
}

/* =========================
   PETA
   ========================= */
function initMap() {
    const map = L.map("map").setView([1.667, 101.45], 11);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; OpenStreetMap',
        maxZoom: 19
    }).addTo(map);

    // GeoJSON batas Dumai (kalau ada)
    const candidateUrls = ["/geojson/dumai.geojson", "/dumai.geojson"];
    (async () => {
        for (const url of candidateUrls) {
            try {
                const res = await fetch(url);
                if (!res.ok) continue;
                const data = await res.json();
                L.geoJSON(data, {
                    style() {
                        return {
                            color: "#3498db",
                            weight: 2,
                            fillColor: "#2980b9",
                            fillOpacity: 0.15
                        };
                    }
                }).addTo(map);
                return;
            } catch (e) {
                console.warn("Gagal load GeoJSON:", url, e);
            }
        }
    })();

    // Marker posko contoh
    L.marker([1.685, 101.445])
        .addTo(map)
        .bindPopup("<b>Posko Utama BPBD</b><br>Kota Dumai.");

    return map;
}

function parseLokasi(str) {
    if (!str) return null;
    const m = str.match(/-?\d+(\.\d+)?/g);
    if (!m || m.length < 2) return null;
    const lat = parseFloat(m[0]);
    const lon = parseFloat(m[1]);
    if (Number.isNaN(lat) || Number.isNaN(lon)) return null;
    return { lat, lon };
}

function loadLaporanMarkers(map) {
    const data = getStoredReports();

    data.forEach((row) => {
        const loc = parseLokasi(row.lokasi);
        if (!loc) return;

        const { lat, lon } = loc;
        const popupHtml = `
            <b>${(row.jenis || "").toUpperCase()}</b><br/>
            ${row.deskripsi || ""}<br/>
            Lokasi: ${row.lokasi}<br/>
            <small>${row.waktu ? new Date(row.waktu).toLocaleString("id-ID") : ""}</small>
        `;

        L.marker([lat, lon]).addTo(map).bindPopup(popupHtml);
    });
}

/* =========================
   KARTU RINGKASAN
   ========================= */
async function initSummaryCards() {
    // Status siaga (dummy)
    const statusLevel = "WASPADA";
    const updatedAt = "Diperbarui: " + new Date().toLocaleString("id-ID");

    document.querySelector("#status-card .status-level").textContent =
        statusLevel;
    document.querySelector("#status-card .status-updated").textContent =
        updatedAt;

    // Statistik laporan dari localStorage (sudah plus dummy)
    const data = getStoredReports();
    const stats = {
        total: data.length,
        banjir: data.filter((x) => x.jenis === "banjir").length,
        karhutla: data.filter((x) => x.jenis === "karhutla").length,
        kebakaran: data.filter((x) => x.jenis === "kebakaran").length,
        lainnya: data.filter(
            (x) =>
                x.jenis !== "banjir" &&
                x.jenis !== "karhutla" &&
                x.jenis !== "kebakaran"
        ).length
    };

    document.querySelector("#laporan-card .laporan-total").textContent =
        `${stats.total} laporan`;

    document.querySelector("#laporan-card .laporan-detail").textContent =
        `Banjir: ${stats.banjir} • Karhutla: ${stats.karhutla} • Lainnya: ${stats.lainnya}`;

    // Posko & edukasi dummy
    document.querySelector("#posko-card .posko-total").textContent =
        "Posko aktif: 5";
    document.querySelector("#posko-card .posko-logistik").textContent =
        "Logistik: Cukup";
    document.querySelector("#posko-card .posko-medis").textContent =
        "Tim Medis & Ambulans standby";

    document.querySelector("#edukasi-card .edukasi-title").textContent =
        "Cara Evakuasi Saat Banjir Bandang";
    document.querySelector("#edukasi-card .edukasi-date").textContent =
        "Publikasi: " + new Date().toLocaleDateString("id-ID");
}

/* =========================
   CUACA
   ========================= */
async function initWeatherCard() {
    const card = document.getElementById("weather-card");
    if (!card) return;

    const mainEl = card.querySelector(".weather-main");
    const extraEl = card.querySelector(".weather-extra");

    const apiKey = "d2482cbc5428fccde0297d4aab71e3ee";
    const city = "Dumai";
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
        city
    )}&appid=${apiKey}&units=metric&lang=id`;

    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error("HTTP " + res.status);
        const data = await res.json();

        const temp = Math.round(data.main.temp);
        const feels = Math.round(data.main.feels_like);
        const desc = data.weather[0].description;

        mainEl.textContent = `${temp}°C, ${capitalize(desc)}`;
        extraEl.textContent = `Terasa ${feels}°C • Kelembapan ${data.main.humidity}%`;
    } catch (e) {
        console.error("Gagal memuat cuaca:", e);
        mainEl.textContent = "Gagal memuat cuaca";
        extraEl.textContent = "";
    }
}

/* =========================
   GEMPA
   ========================= */
async function initEarthquakeCard() {
    const container = document.querySelector("#earthquake-card .quake-list");
    if (!container) return;

    container.innerHTML = "<p>Memuat data gempa...</p>";
    const url =
        "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson";

    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error("HTTP " + res.status);
        const data = await res.json();

        const features = (data.features || [])
            .sort((a, b) => (b.properties.mag || 0) - (a.properties.mag || 0))
            .slice(0, 3);

        if (!features.length) {
            container.innerHTML = "<p>Tidak ada data gempa hari ini.</p>";
            return;
        }

        container.innerHTML = "";
        features.forEach((eq) => {
            const p = eq.properties;
            const mag = p.mag ?? "?";
            const place = p.place || "Lokasi tidak diketahui";
            const time = new Date(p.time).toLocaleTimeString("id-ID", {
                hour: "2-digit",
                minute: "2-digit"
            });

            const row = document.createElement("p");
            row.textContent = `M${mag.toFixed(1)} • ${place} • ${time}`;
            container.appendChild(row);
        });
    } catch (e) {
        console.error("Gagal memuat gempa:", e);
        container.innerHTML = "<p>Gagal memuat data gempa.</p>";
    }
}

/* =========================
   KARHUTLA (dummy)
   ========================= */
function initKarhutlaCard() {
    const card = document.getElementById("karhutla-card");
    if (!card) return;

    const summaryEl = card.querySelector(".fire-summary");
    const detailEl = card.querySelector(".fire-detail");

    const hotspotCount = 3;
    const area = "Sekitar Dumai & sekitarnya";

    summaryEl.textContent = `${hotspotCount} hotspot terpantau (dummy)`;
    detailEl.textContent =
        `Area: ${area}. Integrasi API FIRMS/BMKG bisa ditambahkan di sini.`;
}

/* =========================
   ACTIONS
   ========================= */
function initActions() {
    const laporBtn = document.getElementById("lapor-btn");
    if (laporBtn) {
        laporBtn.addEventListener("click", () => {
            window.location.href = "/laporan.html";
        });
    }

    const statusDetail = document.getElementById("btn-status-detail");
    if (statusDetail) {
        statusDetail.addEventListener("click", () => {
            alert(
                "Contoh kriteria siaga:\n\n• NORMAL\n• WASPADA\n• SIAGA I\n• TANGGAP DARURAT\n\n(Nanti bisa diarahkan ke halaman penjelasan detail.)"
            );
        });
    }

    const laporanDetail = document.getElementById("btn-laporan-detail");
    if (laporanDetail) {
        laporanDetail.addEventListener("click", () => {
            window.location.href = "/laporan.html";
        });
    }

    const poskoMap = document.getElementById("btn-posko-map");
    if (poskoMap) {
        poskoMap.addEventListener("click", () => {
            alert("Nanti peta difilter hanya menampilkan marker posko & rute.");
        });
    }

    const edukasiDetail = document.getElementById("btn-edukasi-detail");
    if (edukasiDetail) {
        edukasiDetail.addEventListener("click", () => {
            alert("Nanti diarahkan ke halaman artikel edukasi lengkap.");
        });
    }

    const notifBtn = document.getElementById("notif-btn");
    if (notifBtn) {
        notifBtn.addEventListener("click", () => {
            window.location.href = "/notifikasi.html";
        });
    }
}

function capitalize(text) {
    if (!text) return "";
    return text.charAt(0).toUpperCase() + text.slice(1);
}
