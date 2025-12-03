document.addEventListener("DOMContentLoaded", () => {
    if(!localStorage.getItem("isLoggedIn")) { window.location.href = "login.html"; return; }
    
    // Tampilkan Nama User
    const user = localStorage.getItem("currentUser");
    if(user) {
        document.getElementById("userDisplay").innerText = "Halo, " + user.charAt(0).toUpperCase() + user.slice(1);
    }

    document.getElementById('btnLogout').addEventListener('click', () => {
        localStorage.removeItem("isLoggedIn"); 
        localStorage.removeItem("currentUser");
        window.location.href = "index.html";
    });

    const data = JSON.parse(localStorage.getItem("dataLaporan_SIGAP")) || [];
    document.getElementById("countLaporan").innerText = data.length;
    const tbody = document.getElementById("laporanBody");
    
    data.reverse().forEach((lap, idx) => {
        tbody.innerHTML += `
            <tr>
                <td><small>${lap.waktu}</small></td>
                <td>${lap.jenis}</td>
                <td>${lap.lat}, ${lap.lng}</td>
                <td><a href="https://maps.google.com/?q=${lap.lat},${lap.lng}" target="_blank" class="btn btn-sm btn-primary">Peta</a></td>
            </tr>`;
    });
});