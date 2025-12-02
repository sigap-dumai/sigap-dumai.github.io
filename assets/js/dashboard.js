// =============================================================
// Dashboard.js – SiGap Dumai
// =============================================================

// Data dummy untuk cuaca dan kebakaran hutan
const dummyData = {
    weather: "Sunny",
    fireAlert: "Moderate",
    temperature: "30°C",
    locations: [
        { lat: 1.727, lon: 101.372, name: "Bukit Kapur" },
        { lat: 1.685, lon: 101.455, name: "Dumai Timur" },
        { lat: 1.668, lon: 101.420, name: "Dumai Barat" },
        { lat: 1.638, lon: 101.450, name: "Dumai Selatan" },
        { lat: 1.590, lon: 101.540, name: "Medang Kampai" },
        { lat: 1.720, lon: 101.500, name: "Sungai Sembilan" },
        { lat: 1.682, lon: 101.448, name: "Dumai Kota" }
    ]
};

// Inisialisasi peta Leaflet
const map = L.map('map').setView([1.727, 101.372], 13);  // Koordinat Dumai, zoom level 13

// Tambahkan layer peta menggunakan TileLayer (OpenStreetMap)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Menambahkan marker untuk setiap lokasi dalam dummyData
dummyData.locations.forEach(location => {
    L.marker([location.lat, location.lon])
        .addTo(map)
        .bindPopup(location.name)
        .openPopup();
});

// Fungsi untuk mengambil laporan dari localStorage atau membuat laporan dummy
function getStoredReports() {
    const REPORT_KEY = "sigap_laporan";
    try {
        const raw = localStorage.getItem(REPORT_KEY);
        if (!raw) return seedDummyReports([]);
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) return seedDummyReports([]);
        return parsed;
    } catch {
        return seedDummyReports([]);
    }
}

// Fungsi untuk membuat laporan dummy jika tidak ada laporan
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
            id: Date.now(),
            jenis: jenis,
            area: area,
            date: date.toISOString().split('T')[0]
        });
    }
    return base;
}

// Fungsi untuk memperbarui tampilan dashboard
function updateDashboard(data) {
    // Update elemen UI dengan data cuaca
    document.getElementById("weather").textContent = data.weather;
    document.getElementById("fireAlert").textContent = data.fireAlert;
    document.getElementById("temperature").textContent = data.temperature;

    // Update laporan warga
    const reportsContainer = document.getElementById("reports");
    data.reports.forEach(report => {
        const reportElement = document.createElement("div");
        reportElement.textContent = `${report.jenis} - ${report.area.nama} - ${report.date}`;
        reportsContainer.appendChild(reportElement);
    });
}

// Ambil laporan dari localStorage atau gunakan laporan dummy
let reports = getStoredReports();

// Gabungkan data dummy dengan laporan warga
const dashboardData = {
    ...dummyData,
    reports: reports
};

// Panggil fungsi updateDashboard untuk menampilkan data
updateDashboard(dashboardData);
