// dashboard.js - Managing Dashboard Features like Map and Data Cards

document.addEventListener("DOMContentLoaded", () => {
    // Initializing Leaflet map
    const map = L.map('map').setView([0.4668, 101.4489], 12); // Coordinates for Dumai

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    // Example Marker for Posko
    const poskoMarker = L.marker([0.4668, 101.4489]).addTo(map);
    poskoMarker.bindPopup('<b>Posko Bantuan</b><br>Lokasi Posko Terdekat.');
    
    // Updating Data Cards on Dashboard
    function updateDashboardCards() {
        // Dummy data update
        document.getElementById('status-card').innerHTML = 'Status Siaga Dumai: <span>WASPADA</span>';
        document.getElementById('laporan-card').innerHTML = 'Jumlah Laporan Baru: <span>12</span>';
        document.getElementById('posko-card').innerHTML = 'Posko Aktif: <span>5</span>';
        document.getElementById('edukasi-card').innerHTML = 'Edukasi Bencana: <span>Evakuasi Saat Banjir</span>';
    }

    updateDashboardCards();

    // Handling Floating Action Button Click
    const fab = document.getElementById('lapor-btn');
    fab.addEventListener('click', () => {
        window.location.href = '/laporan.html';  // Navigate to the report page
    });
});
