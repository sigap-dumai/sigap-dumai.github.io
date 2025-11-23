document.addEventListener("DOMContentLoaded", () => {
    initFilterButtons();
    renderNotifications("all");
});

/* ============================================================
   DATA NOTIFIKASI (sementara dummy, siap diganti endpoint API)
   ============================================================ */
const dummyNotifications = [
    {
        id: 1,
        type: "warning",
        title: "Peringatan Dini Karhutla",
        message: "Potensi hotspot terdeteksi di wilayah Dumai Selatan.",
        time: "10 menit lalu",
        source: "BMKG",
        unread: true
    },
    {
        id: 2,
        type: "info",
        title: "Laporan Banjir Ditangani",
        message: "Tim BPBD sedang menuju lokasi banjir di Bukit Kapur.",
        time: "30 menit lalu",
        source: "BPBD Dumai",
        unread: false
    },
    {
        id: 3,
        type: "edu",
        title: "Tips Siaga Musim Hujan",
        message: "Pastikan saluran air di sekitar rumah rutin dibersihkan.",
        time: "Hari ini, 08:20",
        source: "BPBD",
        unread: false
    },
    {
        id: 4,
        type: "warning",
        title: "Peringatan Cuaca Ekstrem",
        message: "Hujan lebat disertai angin kencang diperkirakan sore ini.",
        time: "1 jam lalu",
        source: "BMKG",
        unread: true
    }
];

/* ============================================================
   FILTER BUTTONS
   ============================================================ */
function initFilterButtons() {
    const buttons = document.querySelectorAll(".filter-button");

    buttons.forEach(btn => {
        btn.addEventListener("click", () => {
            buttons.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");

            const filter = btn.dataset.filter;
            renderNotifications(filter);
        });
    });
}

/* ============================================================
   RENDER LIST NOTIFIKASI
   ============================================================ */
function renderNotifications(filter) {
    const container = document.getElementById("notif-list");
    if (!container) return;

    container.innerHTML = "";

    const filtered =
        filter === "all"
            ? dummyNotifications
            : dummyNotifications.filter(n => n.type === filter);

    if (filtered.length === 0) {
        container.innerHTML = `<p class="notif-empty">Tidak ada notifikasi.</p>`;
        return;
    }

    filtered.forEach(item => {
        const card = document.createElement("div");
        card.className = `notif-card ${item.type} ${item.unread ? "unread" : ""}`;

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

        card.addEventListener("click", () => markAsRead(item.id));

        container.appendChild(card);
    });
}

/* ============================================================
   UPDATE STATUS → TERBACA
   ============================================================ */
function markAsRead(id) {
    const notif = dummyNotifications.find(n => n.id === id);
    if (!notif) return;

    notif.unread = false;
    renderNotifications(document.querySelector(".filter-button.active").dataset.filter);
}
