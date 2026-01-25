// Variabel Global untuk Layer dan Map
let layerLaporanWarga;
let mapInstance;

// --- UTIL: Sanitasi teks untuk mencegah HTML injection pada popup ---
function escapeHTML(str) {
    if (str === null || str === undefined) return "";
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// --- UTIL: Cache fetch (offline-friendly) ---
async function fetchWithCache(url, cacheKey, ttlMs, parser = 'json') {
    const now = Date.now();
    try {
        const cachedRaw = localStorage.getItem(cacheKey);
        if (cachedRaw) {
            const cached = JSON.parse(cachedRaw);
            if (cached && cached.ts && (now - cached.ts) <= ttlMs && cached.data) {
                return { data: cached.data, fromCache: true };
            }
        }
    } catch (e) { }

    try {
        const res = await fetch(url, { cache: 'no-store' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (parser === 'text') ? await res.text() : await res.json();
        try { localStorage.setItem(cacheKey, JSON.stringify({ ts: now, data })); } catch (e) { }
        return { data, fromCache: false };
    } catch (e) {
        try {
            const cachedRaw = localStorage.getItem(cacheKey);
            if (cachedRaw) {
                const cached = JSON.parse(cachedRaw);
                if (cached && cached.data) return { data: cached.data, fromCache: true, stale: true };
            }
        } catch (e2) { }
        throw e;
    }
}

// --- UTIL: Debounce event handler ---
function debounce(fn, wait = 300) {
    let t;
    return (...args) => {
        clearTimeout(t);
        t = setTimeout(() => fn(...args), wait);
    };
}

document.addEventListener("DOMContentLoaded", () => {
    seedDummyReports();

    initMap();
    initCuacaBMKG();
    initGempaBMKG();
    initNews();
    updateStatusSiaga();
    updateJumlahLaporan();
    initNotificationBtn();
    initProximityAlertButton();

    const onStorageUpdate = debounce((e) => {
        if (e.key === 'dataLaporan_SIGAP') {
            refreshLayerLaporan();
            updateJumlahLaporan();
        }
    }, 300);

    window.addEventListener('storage', onStorageUpdate);
});

function seedDummyReports() {
    const data = JSON.parse(localStorage.getItem("dataLaporan_SIGAP")) || [];
    if (data.length === 0) {
        const d = [
            { waktu: "5/12/2023, 10:00:00", jenis: "Jalan Rusak", lat: 1.6780, lng: 101.4450, wilayah: "Kec. Dumai Kota", status: "Menunggu", namaPelapor: "Simulasi 1" },
            { waktu: "5/12/2023, 14:30:00", jenis: "Banjir", lat: 1.7010, lng: 101.3950, wilayah: "Kec. Dumai Barat", status: "Proses", namaPelapor: "Simulasi 2" },
            { waktu: "5/12/2023, 16:15:00", jenis: "Karhutla", lat: 1.6600, lng: 101.4700, wilayah: "Kec. Dumai Timur", status: "Selesai", namaPelapor: "Simulasi 3" }
        ];
        localStorage.setItem("dataLaporan_SIGAP", JSON.stringify(d));
    }
}

function initProximityAlertButton() {
    const btn = document.getElementById('btnCekRadius');
    if (!btn) return;

    btn.addEventListener('click', () => {
        if (!navigator.geolocation) { alert("Browser tidak mendukung GPS."); return; }

        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const userLat = pos.coords.latitude;
                const userLng = pos.coords.longitude;
                const nearReports = checkProximity(userLat, userLng, 1.0);

                let message = `📍 Lokasi Anda: ${userLat.toFixed(4)}, ${userLng.toFixed(4)}\n\n`;

                if (nearReports.length > 0) {
                    message += `🚨 ${nearReports.length} BAHAYA TERDETEKSI dalam radius 1 KM:\n`;
                    nearReports.forEach(r => { message += `- [${r.type}] ${r.name} (${r.distance.toFixed(2)} km)\n`; });
                    alert(message);
                } else {
                    message += "✅ Tidak ada bahaya (Laporan/Hotspot/Banjir) terdeteksi dalam radius 1 km. Tetap waspada!";
                    alert(message);
                }

                btn.disabled = false;
                btn.innerHTML = '<i class="fas fa-bullseye"></i>';
            },
            () => {
                alert("Gagal mengambil lokasi Anda. Pastikan GPS aktif dan izin diberikan.");
                btn.disabled = false;
                btn.innerHTML = '<i class="fas fa-bullseye"></i>';
            },
            { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
        );
    });
}

function initNotificationBtn() {
    const b = document.getElementById('btnNotifikasi');
    if (b) b.addEventListener('click', () => {
        alert("⚠️ INFO PERINGATAN DINI BPBD DUMAI:\n\n" + document.getElementById('notifikasi-jalan').innerText);
    });
}

function initMap() {
    const satelit = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', { attribution: 'Tiles © Esri' });
    const petaJalan = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap' });
    const radarHujan = L.tileLayer('https://tile.rainviewer.com/img/nowcast_now/{z}/{x}/{y}/256/1/6_1.png', { opacity: 0.7, attribution: 'RainViewer' });

    mapInstance = L.map('map', { center: [CONFIG.defaultLat, CONFIG.defaultLng], zoom: 11, layers: [satelit] });

    const layerPosko = L.layerGroup().addTo(mapInstance);
    const layerHotspot = L.layerGroup().addTo(mapInstance);
    const layerAngin = L.layerGroup().addTo(mapInstance);
    const layerBanjir = L.layerGroup().addTo(mapInstance);
    layerLaporanWarga = L.layerGroup().addTo(mapInstance);

    const posko = [{ n: "Posko Dumai Kota", lat: 1.6815, lng: 101.4475 }, { n: "Posko Dumai Barat", lat: 1.6943, lng: 101.4098 }, { n: "Posko Dumai Timur", lat: 1.6662, lng: 101.4829 }, { n: "Posko Dumai Selatan", lat: 1.6498, lng: 101.4334 }, { n: "Posko Bukit Kapur", lat: 1.5714, lng: 101.3562 }, { n: "Posko Sei Sembilan", lat: 1.7766, lng: 101.3262 }, { n: "Posko Medang Kampai", lat: 1.6214, lng: 101.5978 }];
    posko.forEach(p => L.circleMarker([p.lat, p.lng], { color: '#2ed573', fillColor: '#2ed573', fillOpacity: 0.8, radius: 6 }).bindPopup(`<b>🏕️ ${escapeHTML(p.n)}</b>`).addTo(layerPosko));

    const hot = [{ lat: 1.6900, lng: 101.4500, loc: "Jl. Putri Tujuh" }, { lat: 1.6700, lng: 101.4300, loc: "Area Kilang" }, { lat: 1.6000, lng: 101.5500, loc: "Pelintung" }];
    hot.forEach(h => L.circleMarker([h.lat, h.lng], { color: '#ff4757', fillColor: '#ff4757', fillOpacity: 0.8, radius: 8 }).bindPopup(`<b>🔥 HOTSPOT:</b> ${escapeHTML(h.loc)}`).addTo(layerHotspot));

    const wind = [{ lat: 1.6960, lng: 101.4200, loc: "Pohon Tumbang Dock Yard" }, { lat: 1.6300, lng: 101.3800, loc: "Angin Kencang Bagan Besar" }, { lat: 1.6500, lng: 101.5200, loc: "Pohon Tumbang Mundam" }, { lat: 1.7400, lng: 101.3400, loc: "Badai Pesisir Sei Sembilan" }, { lat: 1.6100, lng: 101.5800, loc: "Angin Kencang Medang Kampai" }];
    wind.forEach(w => L.circleMarker([w.lat, w.lng], { color: '#ffa500', fillColor: '#ffa500', fillOpacity: 0.8, radius: 7 }).bindPopup(`<b>💨 ANGIN/POHON:</b> ${escapeHTML(w.loc)}`).addTo(layerAngin));

    const floods = [{ lat: 1.6850, lng: 101.4400, loc: "Banjir Rob Jl. Cempedak" }, { lat: 1.6920, lng: 101.4150, loc: "Pangkalan Sesai" }, { lat: 1.6750, lng: 101.4600, loc: "Genangan Jl. Jend. Sudirman" }, { lat: 1.6600, lng: 101.4250, loc: "Banjir Ratu Sima" }];
    floods.forEach(f => L.circleMarker([f.lat, f.lng], { color: '#1e90ff', fillColor: '#1e90ff', fillOpacity: 0.8, radius: 7 }).bindPopup(`<b>🌊 BANJIR:</b> ${escapeHTML(f.loc)}`).addTo(layerBanjir));

    refreshLayerLaporan();

    L.control.layers(
        { "Satelit (Esri)": satelit, "Peta Jalan (OSM)": petaJalan },
        { "⛈️ Radar Hujan": radarHujan, "👤 Laporan Warga": layerLaporanWarga, "🏕️ Posko": layerPosko, "🔥 Hotspot": layerHotspot, "💨 Angin": layerAngin, "🌊 Banjir": layerBanjir },
        { position: 'topright' }
    ).addTo(mapInstance);
}

function refreshLayerLaporan() {
    if (!layerLaporanWarga) return;
    layerLaporanWarga.clearLayers();

    const data = JSON.parse(localStorage.getItem("dataLaporan_SIGAP")) || [];

    data.forEach(lap => {
        const lat = Number(lap.lat);
        const lng = Number(lap.lng);
        const status = lap.status || 'Menunggu';
        if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;

        L.circleMarker([lat, lng], {
            color: '#fff', weight: 2, fillColor: '#9c27b0', fillOpacity: 1, radius: 6
        }).bindPopup(`
                <div style="text-align:center">
                    <b style="color:#9c27b0">👤 LAPORAN WARGA</b><br>
                    <b>${escapeHTML(lap.jenis)}</b><br>
                    ${escapeHTML(lap.wilayah)}<br>
                    <small>${escapeHTML(lap.waktu)}</small><br>
                    <span class="badge bg-${status === 'Selesai' ? 'success' : (status === 'Proses' ? 'warning' : 'danger')}">${escapeHTML(status)}</span>
                </div>
            `).addTo(layerLaporanWarga);
    });
}

function getDistanceKm(lat1, lon1, lat2, lon2) {
    const R = 6371; const dLat = (lat2 - lat1) * (Math.PI / 180); const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); return R * c;
}

function checkProximity(userLat, userLng, radiusKm) {
    let nearReports = [];
    const allReports = [];

    const userReports = JSON.parse(localStorage.getItem("dataLaporan_SIGAP")) || [];
    userReports.forEach(r => allReports.push({ type: "Laporan Warga", name: `${r.jenis} (${r.wilayah})`, lat: r.lat, lng: r.lng }));

    const hotspots = [{ lat: 1.6900, lng: 101.4500, loc: "Jl. Putri Tujuh" }, { lat: 1.6700, lng: 101.4300, loc: "Area Kilang" }];
    hotspots.forEach(h => allReports.push({ type: "Hotspot", name: h.loc, lat: h.lat, lng: h.lng }));

    const floods = [{ lat: 1.6850, lng: 101.4400, loc: "Jl. Cempedak" }, { lat: 1.6920, lng: 101.4150, loc: "Pangkalan Sesai" }];
    floods.forEach(f => allReports.push({ type: "Banjir/Rob", name: f.loc, lat: f.lat, lng: f.lng }));

    allReports.forEach(r => {
        const lat = Number(r.lat);
        const lng = Number(r.lng);
        if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;

        const dist = getDistanceKm(userLat, userLng, lat, lng);
        if (dist <= radiusKm) { nearReports.push({ type: r.type, name: r.name, distance: dist }); }
    });

    return nearReports;
}

async function initCuacaBMKG() {
    const dSuhu = document.getElementById('cuaca-suhu'), dDesc = document.getElementById('cuaca-desc'), dIcon = document.getElementById('cuaca-icon');
    dDesc.innerText = "Koneksi BMKG...";

    try {
        const { data: xmlText } = await fetchWithCache(
            "https://data.bmkg.go.id/DataMKG/MEWS/DigitalForecast/DigitalForecast-Riau.xml",
            "cache_BMKG_RiauForecast_XML",
            30 * 60 * 1000,
            'text'
        );

        const xml = new DOMParser().parseFromString(xmlText, "text/xml");
        let areaDumai = null;
        const areas = xml.getElementsByTagName("area");
        for (let i = 0; i < areas.length; i++) {
            const desc = areas[i].getAttribute("description") || "";
            if (desc.includes("Dumai")) { areaDumai = areas[i]; break; }
        }

        if (areaDumai) {
            let temp = "--", wCode = "0";
            const params = areaDumai.getElementsByTagName("parameter");
            for (let j = 0; j < params.length; j++) {
                if (params[j].getAttribute("id") === "t") temp = params[j].getElementsByTagName("timerange")[0].getElementsByTagName("value")[0].textContent;
                if (params[j].getAttribute("id") === "weather") wCode = params[j].getElementsByTagName("timerange")[0].getElementsByTagName("value")[0].textContent;
            }
            dSuhu.innerText = `${temp}°C`; dDesc.innerText = translateKode(wCode);
            let ico = "fa-cloud-sun text-warning";
            if (["60", "61", "63", "80"].includes(wCode)) ico = "fa-cloud-rain text-info";
            if (["95", "97"].includes(wCode)) ico = "fa-bolt text-warning";
            if (wCode == "0") ico = "fa-sun text-warning";
            dIcon.className = `fas ${ico} fs-4`;
        } else {
            throw new Error("Area Dumai tidak ditemukan");
        }
    } catch (e) {
        initWeatherFallback();
    }
}

function translateKode(c) {
    const map = { "0": "Cerah", "1": "Cerah Berawan", "2": "Cerah Berawan", "3": "Berawan", "4": "Berawan Tebal", "5": "Udara Kabur", "60": "Hujan Ringan", "61": "Hujan Sedang", "63": "Hujan Lebat", "95": "Hujan Petir" };
    return map[c] || "Berawan";
}

async function initWeatherFallback() {
    try {
        const r = await fetch("https://api.open-meteo.com/v1/forecast?latitude=1.68&longitude=101.45&current_weather=true&timezone=Asia%2FBangkok");
        const d = await r.json();
        document.getElementById('cuaca-suhu').innerText = d.current_weather.temperature + "°C";
        document.getElementById('cuaca-desc').innerText = "Cerah (OM)";
    } catch (e) { }
}

async function initGempaBMKG() {
    const c = document.getElementById('list-gempa');
    try {
        const { data } = await fetchWithCache(
            'https://data.bmkg.go.id/DataMKG/TEWS/gempaterkini.json',
            'cache_BMKG_gempaterkini',
            10 * 60 * 1000,
            'json'
        );

        c.innerHTML = "";
        data.Infogempa.gempa.slice(0, 3).forEach(g => {
            let highlight = (g.Wilayah.includes("Riau") || g.Wilayah.includes("Sumatera")) ? "bg-warning-subtle" : "";
            c.innerHTML += `<div class="gempa-item ${highlight}"><span class="gempa-mag">${escapeHTML(g.Magnitude)}</span> ${escapeHTML(g.Wilayah)}<br><small class="text-muted">${escapeHTML(g.Jam)}, ${escapeHTML(g.Tanggal)}</small></div>`;
        });
    } catch (e) {
        c.innerHTML = `<div class="gempa-item"><span class="gempa-mag">5.0</span> Simulasi Gempa (Offline)<br><small>Baru saja</small></div>`;
    }
}

function initNews() {
    const c = document.getElementById('berita-container'); c.innerHTML = "";
    const n = [
        { t: "Waspada Banjir Pasang (ROB)", d: "Pasang puncak pukul 17.00 WIB.", w: "Baru saja", i: "https://placehold.co/60x60/1e90ff/ffffff?text=ROB" },
        { t: "Kebakaran Lahan Padam", d: "Tim Gabungan padamkan 2 Ha lahan.", w: "1 Jam lalu", i: "https://placehold.co/60x60/ff4757/ffffff?text=API" },
        { t: "Pohon Tumbang Jl. Sudirman", d: "Lalu lintas dialihkan.", w: "3 Jam lalu", i: "https://placehold.co/60x60/ffa500/ffffff?text=ANGIN" },
        { t: "Peringatan Cuaca Ekstrem", d: "Potensi hujan lebat & petir.", w: "5 Jam lalu", i: "https://placehold.co/60x60/636e72/ffffff?text=BMKG" },
        { t: "Buaya di Sungai Dumai", d: "Waspada aktivitas di air keruh.", w: "Kemarin", i: "https://placehold.co/60x60/2ed573/ffffff?text=HEWAN" },
        { t: "Himbauan Kabut Asap", d: "Kualitas udara menurun.", w: "Kemarin", i: "https://placehold.co/60x60/d63031/ffffff?text=SEHAT" }
    ];
    n.forEach(x => { c.innerHTML += `<div class="news-item"><img src="${x.i}" class="news-thumb"><div><h6>${escapeHTML(x.t)}</h6><p>${escapeHTML(x.d)}</p><span class="news-date">${escapeHTML(x.w)}</span></div></div>`; });
}

function updateStatusSiaga() {
    document.getElementById('status-text').innerText = "SIAGA 1";
    document.getElementById('status-text').className = "fw-bold fs-5 mb-1 text-danger";
    document.getElementById('status-desc').innerText = "Waspada Banjir Rob";
    document.getElementById('notifikasi-jalan').innerText = "⚠️ PERINGATAN DINI: Waspada potensi hujan lebat & angin kencang di Dumai Pesisir.";
}

function updateJumlahLaporan() {
    const d = JSON.parse(localStorage.getItem("dataLaporan_SIGAP")) || [];
    document.getElementById("jml-laporan").innerText = d.length + " Laporan";
}
