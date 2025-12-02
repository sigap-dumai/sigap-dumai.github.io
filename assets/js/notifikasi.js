// =============================================================
// Notifikasi.js – SiGap Dumai
// =============================================================
const REPORT_KEY = "sigap_laporan";
const LAST_VIEW_KEY = "sigap_notif_last_view";

document.addEventListener("DOMContentLoaded", () => {
    renderNotifications("all");  // Render all notifications by default
    markNotificationsViewed();   // Mark notifications as viewed

    // Add filter event listeners for the buttons
    document.querySelectorAll("[data-filter]").forEach((btn) => {
        btn.addEventListener("click", (e) => {
            const filter = e.target.dataset.filter;
            renderNotifications(filter);  // Re-render notifications based on the filter
        });
    });

    // Event listener for the notification bell icon
    document.getElementById("notif-bell").addEventListener("click", function() {
        const notificationsPanel = document.getElementById("notifications-panel");
        notificationsPanel.classList.toggle("show");  // Toggle notifications panel visibility
        renderNotifications("all");  // Display all notifications
    });
});

// Get reports from localStorage or use dummy data if not available
function getStoredReports() {
    try {
        const raw = localStorage.getItem(REPORT_KEY);
        if (!raw) return seedDummyReports([]);  // Use dummy data if no reports are found
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) return seedDummyReports([]);
        if (parsed.length < 80) return seedDummyReports(parsed);
        return parsed;
    } catch {
        return seedDummyReports([]);  // Return dummy data in case of error
    }
}

// Seed dummy data if there are no reports in localStorage
function seedDummyReports(existing) {
    const target = 80;
    const jenisList = ["banjir", "karhutla", "kebakaran", "angin_kencang", "lainnya"];
    const areaList = [
        { nama: "Bukit Kapur", lat: 1.727, lon: 101.372 },
        { nama: "Dumai Timur", lat: 1.685, lon: 101.455 },
        { nama: "Dumai Barat", lat: 1.668, lon: 101.420 },
        { nama: "Dumai Kota", lat: 1.682, lon: 101.448 },
        { nama: "Dumai Selatan", lat: 1.638, lon: 101.450 },
    ];
    return existing.concat(
        new Array(target - existing.length).fill(null).map(() => ({
            jenis: jenisList[Math.floor(Math.random() * jenisList.length)],
            area: areaList[Math.floor(Math.random() * areaList.length)],
            timestamp: new Date().getTime(),
        }))
    );
}

// Render notifications based on the filter (all, specific types)
function renderNotifications(filter) {
    const reports = getStoredReports();
    const filteredReports = filter === "all" ? reports : reports.filter(report => report.jenis === filter);
    const notificationsPanel = document.getElementById("notifications-panel");
    notificationsPanel.innerHTML = '';  // Clear current notifications
    filteredReports.forEach(report => {
        const notificationItem = document.createElement("div");
        notificationItem.className = 'notification-item';
        notificationItem.innerHTML = `<strong>${report.jenis}</strong><p>${report.area.nama}</p>`;
        notificationsPanel.appendChild(notificationItem);
    });
}

// Mark all notifications as viewed
function markNotificationsViewed() {
    localStorage.setItem(LAST_VIEW_KEY, new Date().getTime());
}
