document.addEventListener("DOMContentLoaded", () => {
    // Initialize map
    const map = L.map('map').setView([0.4668, 101.4489], 12); // Coordinates for Dumai

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    // Fetch and display GeoJSON data
    fetch('/dumai.geojson')
        .then(response => response.json())
        .then(data => {
            L.geoJSON(data).addTo(map);
        })
        .catch(error => console.error('Error loading GeoJSON:', error));

    // Update dashboard data
    document.getElementById('status-card').innerHTML = 'Status Siaga Dumai: <span>WASPADA</span>';
    document.getElementById('laporan-card').innerHTML = 'Jumlah Laporan Baru: <span>12</span>';
    document.getElementById('posko-card').innerHTML = 'Posko Aktif: <span>5</span>';
    document.getElementById('edukasi-card').innerHTML = 'Edukasi Bencana: <span>Evakuasi Saat Banjir</span>';

    // FAB (Floating Action Button) for Report
    document.getElementById('lapor-btn').addEventListener('click', () => {
        window.location.href = '/laporan.html';  // Navigate to report page
    });
});
