// assets/js/modules/trc.js (VERSI FIREBASE)

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

    // 3. LOAD DATA REAL-TIME DARI FIREBASE
    loadRealTimeReports();
});

function loadRealTimeReports() {
    const tbody = document.getElementById("laporanBody");
    const countDisplay = document.getElementById("countLaporan");
    const loadingStatus = document.getElementById("loadingStatus");
    
    // Listener Real-time: Setiap kali ada laporan baru, tabel otomatis update!
    db.collection('reports').orderBy('timestamp', 'desc').onSnapshot(snapshot => {
        tbody.innerHTML = ""; // Bersihkan isi tabel lama
        loadingStatus.style.display = 'none';

        if (snapshot.empty) {
            tbody.innerHTML = '<tr><td colspan="4" class="text-center text-muted">Belum ada laporan masuk.</td></tr>';
            countDisplay.innerText = 0;
            return;
        }

        let reportCount = 0;

        snapshot.forEach(doc => {
            const lap = doc.data();
            const reportId = doc.id;
            reportCount++;

            // Format waktu
            const date = lap.timestamp ? lap.timestamp.toDate().toLocaleString('id-ID') : 'N/A';
            
            const row = `
                <tr>
                    <td><small>${date}</small></td>
                    <td><span class="badge bg-warning text-dark">${lap.jenis}</span></td>
                    <td>${lap.lat.toFixed(5)}, ${lap.lng.toFixed(5)}</td>
                    <td>
                        <a href="https://www.google.com/maps/search/?api=1&query=${lap.lat},${lap.lng}" 
                           target="_blank" class="btn btn-sm btn-primary">
                           <i class="fas fa-map"></i> Cek Lokasi
                        </a>
                        <button onclick="markAsResolved('${reportId}')" class="btn btn-sm btn-outline-success">
                           <i class="fas fa-check"></i> Selesai
                        </button>
                    </td>
                </tr>
            `;
            tbody.innerHTML += row;
        });

        countDisplay.innerText = reportCount;
    }, err => {
        console.error("Error reading data:", err);
        loadingStatus.innerText = "Gagal memuat data real-time.";
        tbody.innerHTML = '<tr><td colspan="4" class="text-center text-danger">ERROR KONEKSI DATABASE</td></tr>';
    });
}

// Fungsi Admin: Tandai Laporan Selesai (Simulasi Hapus di UI)
window.markAsResolved = function(id) {
    if(confirm("Tandai laporan ini sebagai selesai/ditangani?")) {
        // Hapus dari Firestore
        db.collection('reports').doc(id).delete()
            .then(() => {
                console.log("Laporan selesai ditangani dan dihapus dari database.");
            })
            .catch(error => {
                alert("Gagal menghapus laporan: " + error.message);
            });
    }
};