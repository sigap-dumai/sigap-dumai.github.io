// main.js - khusus untuk splash & inisialisasi ringan

document.addEventListener("DOMContentLoaded", () => {
    // Redirect otomatis dari splash ke dashboard
    const path = window.location.pathname;

    if (path === "/" || path === "/index.html") {
        // Tunda 2.5 detik biar splash sempat kelihatan
        setTimeout(() => {
            window.location.href = "/dashboard.html";
        }, 2500);
    }

    // Di halaman lain (dashboard/laporan/informasi) file ini sengaja tidak melakukan apa-apa
});
