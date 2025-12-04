document.addEventListener("DOMContentLoaded", () => {
    // 1. Cek Login
    if(!localStorage.getItem("isLoggedIn")) { 
        window.location.href = "login.html"; 
        return; 
    }
    
    const user = localStorage.getItem("currentUser");
    if(user) {
        document.getElementById("userDisplay").innerText = "Halo, " + user.toUpperCase();
    }

    // 2. Fungsi Logout
    document.getElementById('btnLogout').addEventListener('click', () => {
        if(confirm("Yakin ingin keluar?")) {
            localStorage.removeItem("isLoggedIn"); 
            localStorage.removeItem("currentUser");
            window.location.href = "index.html";
        }
    });

    // 3. Render Tabel Laporan
    renderTable();

    // Listener untuk memastikan tabel Admin update jika ada laporan baru dari tab lain
    window.addEventListener('storage', (e) => {
        if (e.key === 'dataLaporan_SIGAP') {
            renderTable();
        }
    });
});

function renderTable() {
    let data = JSON.parse(localStorage.getItem("dataLaporan_SIGAP")) || [];
    
    const countBadge = document.getElementById("countLaporan");
    const tbody = document.getElementById("laporanBody");
    
    // Hitung jumlah laporan yang belum selesai
    const pending = data.filter(d => d.status !== 'Selesai').length;
    countBadge.innerText = pending;
    
    tbody.innerHTML = ""; 

    // Loop data dari yang terbaru (reverse loop)
    for (let i = data.length - 1; i >= 0; i--) {
        const lap = data[i];
        
        if(!lap.status) lap.status = "Menunggu";

        let badgeClass = "bg-danger"; // Menunggu
        if(lap.status === "Proses") badgeClass = "bg-warning text-dark";
        if(lap.status === "Selesai") badgeClass = "bg-success";

        const lokasiShow = lap.wilayah ? `<b>${lap.wilayah}</b><br><small class='text-muted'>${lap.lat.toFixed(4)}, ${lap.lng.toFixed(4)}</small>` : `${lap.lat}, ${lap.lng}`;

        // Link Peta Google
        const mapLink = `http://maps.google.com/maps?q=${lap.lat},${lap.lng}`;

        tbody.innerHTML += `
            <tr>
                <td><small>${lap.waktu}</small></td>
                <td><span class="fw-bold">${lap.jenis}</span><br><small>${lap.namaPelapor || 'Anonim'}</small></td>
                <td>${lokasiShow}</td>
                <td><span class="badge ${badgeClass}">${lap.status}</span></td>
                <td>
                    <div class="btn-group" role="group">
                        <a href="${mapLink}" target="_blank" class="btn btn-sm btn-outline-primary" title="Lihat Peta">
                            <i class="fas fa-map-marked-alt"></i>
                        </a>
                        ${lap.status !== 'Proses' && lap.status !== 'Selesai' ? 
                            `<button onclick="updateStatus(${i}, 'Proses')" class="btn btn-sm btn-warning" title="Proses Laporan">
                                <i class="fas fa-hard-hat"></i>
                            </button>` : ''
                        }
                        ${lap.status !== 'Selesai' ? 
                            `<button onclick="updateStatus(${i}, 'Selesai')" class="btn btn-sm btn-success" title="Selesaikan">
                                <i class="fas fa-check"></i>
                            </button>` : ''
                        }
                        <button onclick="hapusLaporan(${i})" class="btn btn-sm btn-danger" title="Hapus">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>`;
    }
}

// FUNGSI UPDATE STATUS
window.updateStatus = function(index, newStatus) {
    let data = JSON.parse(localStorage.getItem("dataLaporan_SIGAP")) || [];
    
    // Update status
    data[index].status = newStatus;
    
    // Simpan balik ke LocalStorage (Trigger 'storage' event)
    localStorage.setItem("dataLaporan_SIGAP", JSON.stringify(data));
    
    renderTable();
}

// FUNGSI HAPUS LAPORAN
window.hapusLaporan = function(index) {
    if(confirm("Hapus laporan ini permanen?")) {
        let data = JSON.parse(localStorage.getItem("dataLaporan_SIGAP")) || [];
        data.splice(index, 1); 
        localStorage.setItem("dataLaporan_SIGAP", JSON.stringify(data));
        renderTable();
    }
}