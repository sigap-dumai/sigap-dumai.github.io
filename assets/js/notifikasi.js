// /assets/js/notifikasi.js
// Notifikasi berbasis laporan di localStorage (sama seperti dashboard)
// Dummy 80 laporan akan di-seed jika belum ada.

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

        const lat = area.lat + (Math.random() - 0.5) * 0.03;
        const lon = area.lon + (Math.random() - 0.5) * 0.03;

        const descList = deskripsiTemplate[jenis] || deskripsiTemplate.lainnya;
        const deskripsi = descList[i % descList.length];

        const daysAgo = Math.floor(Math.random() * 7);
        const msAgo =
            daysAgo * 24 * 60 * 60 * 1000 + Math.random() * 60 * 60 * 1000;
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
            return seedDummyReports([]);
        }
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) {
            return seedDummyReports([]);
        }
        if (parsed.length < 80) {
            return seedDummyReports(parsed);
        }
        return parsed;
    } catch {
        return seedDummyReports([]);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    initFilterButtons();
    renderNotifications("all");
});

/* FILTER BUTTONS */
function initFilterButtons() {
    const buttons = document.querySelectorAll(".filter-button");
    buttons.forEach((btn) => {
        btn.addEventListener("click", () => {
            buttons.forEach((b) => b.classList.remove("active"));
            btn.classList.add("active");
            const filter = btn.dataset.filter || "all";
            renderNotifications(filter);
        });
    });
}

/* RENDER LIST */
function renderNotifications(filter) {
    const container = document.getElementById("notif-list");
    if (!container) return;

    let reports = getStoredReports().slice().reverse(); // terbaru di atas

    // mapping laporan → notifikasi
    let items = reports.map((r) => ({
        type: mapJenisToType(r.jenis),
        title: `Laporan ${r.jenis || "kejadian"}`,
        message: r.deskripsi || "",
        time: r.waktu
            ? new Date(r.waktu).toLocaleString("id-ID")
            : "",
        source: "Laporan Warga",
        unread: true
    }));

    if (filter !== "all") {
        items = items.filter((n) => n.type === filter);
    }

    container.innerHTML = "";

    if (!items.length) {
        container.innerHTML =
            '<p class="notif-empty">Belum ada notifikasi. Kirim laporan dulu.</p>';
        return;
    }

    items.forEach((item) => {
        const card = document.createElement("div");
        card.className = `notif-card ${item.type} ${
            item.unread ? "unread" : ""
        }`;

        card.innerHTML = `
            <div class="notif-type-badge ${item.type}"></div>
            <div class="notif-content">
                <h4 class="notif-title">${item.title}</h4>
                <p class="notif-message">${item.message}</p>
                <div class="notif-meta">
                    <span class="notif-source">${item.source}</span>
                    <span class="notif-time">${item.time}</span>
                </div>
            </div>
        `;

        container.appendChild(card);
    });
}

function mapJenisToType(jenis) {
    if (!jenis) return "info";
    if (jenis === "banjir" || jenis === "karhutla" || jenis === "kebakaran") {
        return "warning";
    }
    return "info";
}
