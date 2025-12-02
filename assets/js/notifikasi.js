document.addEventListener("DOMContentLoaded", () => {
    renderNotifications("all");  // Render all notifications by default
    markNotificationsViewed();   // Mark notifications as viewed

    // Add event listener untuk tombol lonceng (notifikasi)
    document.getElementById("notif-btn").addEventListener("click", function() {
        const notificationsPanel = document.getElementById("notifications-panel");
        notificationsPanel.classList.toggle("show");  // Toggle visibility of notification panel
    });

    // Event listener untuk filter berdasarkan kategori
    document.querySelectorAll("[data-filter]").forEach((btn) => {
        btn.addEventListener("click", (e) => {
            const filter = e.target.dataset.filter;
            renderNotifications(filter);
        });
    });
});

// Fungsi untuk mendapatkan laporan yang disimpan
function getStoredReports() {
    try {
        const raw = localStorage.getItem("sigap_laporan");
        if (!raw) return seedDummyReports([]);
        return JSON.parse(raw);  // Parse and return reports from localStorage
    } catch {
        return seedDummyReports([]);  // Return dummy data in case of error
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

// Fungsi untuk merender notifikasi
function renderNotifications(filter) {
    const reports = getStoredReports();
    const filteredReports = reports.filter(report => {
        if (filter === "all") return true;
        return report.jenis === filter;
    });
    
    const notificationContainer = document.getElementById("notification-container");
    notificationContainer.innerHTML = ""; // Clear existing notifications

    filteredReports.forEach(report => {
        const notification = document.createElement("div");
        notification.className = "notification";
        notification.textContent = `${report.jenis} - ${report.area.nama} - ${report.date}`;
        notificationContainer.appendChild(notification);
    });
}

// Menandai notifikasi sebagai telah dibaca
function markNotificationsViewed() {
    localStorage.setItem("sigap_notif_last_view", new Date().toISOString());
}
