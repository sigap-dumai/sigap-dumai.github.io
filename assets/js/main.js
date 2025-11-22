document.addEventListener("DOMContentLoaded", () => {
    // Cek jika ini adalah kunjungan pertama
    if (!localStorage.getItem('firstVisit')) {
        localStorage.setItem('firstVisit', 'true');
        console.log("First time visiting SiGap App!");
    } else {
        console.log("Welcome back to SiGap App!");
    }

    // Fungsi untuk memeriksa konektivitas internet
    function checkConnectivity() {
        if (navigator.onLine) {
            console.log("You are online!");
        } else {
            console.log("You are offline, please check your connection.");
        }
    }

    // Mengecek konektivitas setiap 5 detik
    setInterval(checkConnectivity, 5000); // setiap 5 detik

    // Cek koneksi internet saat pertama kali aplikasi dimuat
    checkConnectivity();
    
    // Simulasi Pengaturan Local Storage dan Cookie (opsional)
    if (!localStorage.getItem('hasVisited')) {
        console.log("Welcome new user!");
        localStorage.setItem('hasVisited', 'true');
    }

    // Menambahkan event listener untuk interaksi lainnya
    document.getElementById("lapor-btn").addEventListener("click", () => {
        window.location.href = '/laporan.html';  // Pindah ke halaman laporan
    });
});
