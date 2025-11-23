// =============================================================
// Notifikasi.js – SiGap Dumai
// =============================================================
const REPORT_KEY = "sigap_laporan";
const LAST_VIEW_KEY = "sigap_notif_last_view";

document.addEventListener("DOMContentLoaded", () => {
    renderNotifications("all");
    markNotificationsViewed();

    document.querySelectorAll("[data-filter]").forEach((btn) => {
        btn.addEventListener("click", (e) => {
            const filter = e.target.dataset.filter;
            renderNotifications(filter);
        });
    });
});

function getStoredReports() {
    try {
        const raw = localStorage.getItem(REPORT_KEY);
        if (!raw) return seedDummyReports([]);
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) return seedDummyReports([]);
        if (parsed.length < 80) return seedDummyReports(parsed);
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

function renderNotifications(filter) {
    const container = document.getElementById("notif-container");
    const reports = getStoredReports();
    const filtered =
        filter === "all" ? reports : reports.filter((r) => r.jenis === filter);
    filtered.sort((a, b) => new Date(b.waktu) - new Date(a.waktu));

    container.innerHTML = filtered
        .map((r) => {
            const type =
                ["banjir", "karhutla", "kebakaran"].includes(r.jenis) ? "warning" : "info";
            return `
                <div class="notif-item ${type}">
                    <h4>Laporan ${r.jenis.toUpperCase()}</h4>
                    <p>${r.deskripsi}</p>
                    <small>${new Date(r.waktu).toLocaleString("id-ID")}</small>
                </div>
            `;
        })
        .join("");
}

// =============================================================
// TANDAI SUDAH DILIHAT
// =============================================================
function markNotificationsViewed() {
    localStorage.setItem(LAST_VIEW_KEY, new Date().toISOString());
}
