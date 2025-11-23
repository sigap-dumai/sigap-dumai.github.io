document.addEventListener("DOMContentLoaded", () => {
    initMap();
    initSummaryCards();
    initWeatherCard();
    initEarthquakeCard();
    initKarhutlaCard();
    initActions();
});

// ------------------------ PETA ----------------------------

function initMap() {
    const map = L.map("map").setView([1.667, 101.45], 11); // Perkiraan Dumai

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> kontributor',
        maxZoom: 19
    }).addTo(map);

    // Coba load geojson dari /geojson/dumai.geojson lalu fallback /dumai.geojson
    const candidateUrls = ["/geojson/dumai.geojson", "/dumai.geojson"];

    (async () => {
        for (const url of candidateUrls) {
            try {
                const res = await fetch(url);
                if (!res.ok) continue;
                const data = await res.json();

                L.geoJSON(data, {
                    onEachFeature(feature, layer) {
                        const props = feature.properties || {};
                        const name = props.nama || props.NAME || props.name || "Lokasi";
                        layer.bindPopup(name);
                    },
                    style(feature) {
                        return {
                            color: "#3498db",
                            weight: 2,
                            fillColor: "#2980b9",
                            fillOpacity: 0.25
                        };
                    },
                    pointToLayer(feature, latlng) {
                        return L.marker(latlng);
                    }
                }).addTo(map);

                return; // berhenti kalau sudah berhasil
            } catch (e) {
                console.warn("Gagal load GeoJSON dari", url, e);
            }
        }
        console.warn("Tidak ada GeoJSON yang berhasil dimuat.");
    })();

    // Marker contoh posko
    L.marker([1.685, 101.445])
        .addTo(map)
        .bindPopup("<b>Posko Utama BPBD</b><br>Kota Dumai.");
}

// -------------------- KARTU RINGKASAN ---------------------

function initSummaryCards() {
    // Dummy untuk sekarang – nanti bisa diisi dari API backend
    const statusLevel = "WASPADA";
    const updatedAt = "Diperbarui: " + new Date().toLocaleString("id-ID");

    document.querySelector("#status-card .status-level").textContent = statusLevel;
    document.querySelector("#status-card .status-updated").textContent = updatedAt;

    document.querySelector("#laporan-card .laporan-total").textContent = "12 laporan";
    document.querySelector("#laporan-card .laporan-detail").textContent =
        "Banjir: 8 • Karhutla: 2 • Lainnya: 2";

    document.querySelector("#posko-card .posko-total").textContent = "Posko aktif: 5";
    document.querySelector("#posko-card .posko-logistik").textContent =
        "Logistik: Cukup";
    document.querySelector("#posko-card .posko-medis").textContent =
        "Tim Medis & Ambulans standby";

    document.querySelector("#edukasi-card .edukasi-title").textContent =
        "Cara Evakuasi Saat Banjir Bandang";
    document.querySelector("#edukasi-card .edukasi-date").textContent =
        "Publikasi: " + new Date().toLocaleDateString("id-ID");
}

// ------------------------ CUACA ---------------------------

async function initWeatherCard() {
    const card = document.getElementById("weather-card");
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

// ------------------------ GEMPA ---------------------------

async function initEarthquakeCard() {
    const container = document.querySelector("#earthquake-card .quake-list");
    container.innerHTML = "<p>Memuat data gempa...</p>";

    const url =
        "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson";

    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error("HTTP " + res.status);
        const data = await res.json();

        // Ambil 3 gempa terkuat hari ini
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

// ------------------------ KARHUTLA ------------------------

function initKarhutlaCard() {
    const card = document.getElementById("karhutla-card");
    const summaryEl = card.querySelector(".fire-summary");
    const detailEl = card.querySelector(".fire-detail");

    // Dummy data – nanti bisa diganti integrasi FIRMS / BMKG
    const hotspotCount = 3;
    const area = "Sekitar Dumai & sekitarnya";

    summaryEl.textContent = `${hotspotCount} hotspot terpantau (dummy)`;
    detailEl.textContent = `Sumber data karhutla simulasi. Integrasi API FIRMS/BMKG bisa ditambahkan di sini.`;
}

// ------------------------ ACTIONS -------------------------

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
                "Contoh kriteria siaga:\n\n• NORMAL\n• WASPADA\n• SIAGA I\n• TANGGAP DARURAT\n\n(Bisa diarahkan ke halaman penjelasan detail.)"
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
            alert(
                "Aksi ini nantinya bisa memfilter peta hanya menampilkan marker posko & rute tercepat."
            );
        });
    }

    const edukasiDetail = document.getElementById("btn-edukasi-detail");
    if (edukasiDetail) {
        edukasiDetail.addEventListener("click", () => {
            alert("Nanti diarahkan ke halaman artikel edukasi lengkap.");
        });
    }
}

// ------------------------ UTIL ----------------------------

function capitalize(text) {
    if (!text) return "";
    return text.charAt(0).toUpperCase() + text.slice(1);
}
