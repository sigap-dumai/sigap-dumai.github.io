// assets/js/modules/trc.js (VERSI LOCAL STORAGE - FINAL)

document.addEventListener("DOMContentLoaded", () => {
    // 1. Cek Keamanan
    if(!localStorage.getItem("isLoggedIn")) { window.location.href = "login.html"; return; }
    
    // Tampilkan Nama User
    const currentUser = localStorage.getItem("currentUser");
    if(currentUser) {
        document.getElementById("userDisplay").innerText = "Halo, " + currentUser.charAt(0).toUpperCase() + currentUser.slice(1);
    }

    // 2. Fungsi Logout
    document.getElementById('btnLogout').addEventListener('click', () => {
        localStorage.removeItem("isLoggedIn"); 
        localStorage.removeItem("currentUser");
        window.location.href = "index.html";
    });

    // 3. LOAD DATA DARI LOCAL STORAGE
    loadLocalReports();
});

function loadLocalReports() {
    const tbody = document.getElementById("laporanBody");
    const countDisplay = document.getElementById("countLaporan");
    const loadingStatus = document.getElementById("loadingStatus");
    
    // Mengambil data dari LocalStorage
    let dataReports = JSON.parse(localStorage.getItem("dataLaporan_SIGAP")) || [];

    tbody.innerHTML = ""; // Bersihkan isi tabel lama
    loadingStatus.style.display = 'none';

    if (dataReports.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted">Belum ada laporan masuk.</td></tr>';
        countDisplay.innerText = 0;
        return;
    }

    countDisplay.innerText = dataReports.length;

    // Tampilkan data terbaru di atas
    dataReports.reverse().forEach((lap, index) => {
        const row = `
            <tr>
                <td><small>${lap.timestamp}</small></td>
                <td><span class="badge bg-warning text-dark">${lap.jenis}</span></td>
                <td>${lap.kecamatan || 'N/A'}</td>
                <td>${lap.lat.toFixed(5)}, ${lap.lng.toFixed(5)}</td>
                <td>
                    <a href="https://www.google.com/maps/search/?api=1&query=${lap.lat},${lap.lng}" 
                       target="_blank" class="btn btn-sm btn-primary">
                       <i class="fas fa-map"></i> Cek Lokasi
                    </a>
                    <button onclick="markAsResolved(${lap.id})" class="btn btn-sm btn-outline-success">
                       <i class="fas fa-check"></i> Selesai
                    </button>
                </td>
            </tr>
        `;
        tbody.innerHTML += row;
    });
}

// Fungsi Admin: Tandai Laporan Selesai (Hapus dari LocalStorage)
window.markAsResolved = function(id) {
    if(confirm("Tandai laporan ini sebagai selesai/ditangani?")) {
        let existingReports = JSON.parse(localStorage.getItem("dataLaporan_SIGAP")) || [];
        
        // Filter laporan yang ID-nya tidak sesuai (menghapus yang dipilih)
        const updatedReports = existingReports.filter(report => report.id !== id);
        
        localStorage.setItem("dataLaporan_SIGAP", JSON.stringify(updatedReports));
        
        // Refresh tabel
        loadLocalReports();
    }
};