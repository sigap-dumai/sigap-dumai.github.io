document.addEventListener("DOMContentLoaded", () => {
    // Inisialisasi Peta
    const map = L.map('map').setView([0.4668, 101.4489], 12); // Koordinat Dumai

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    // Menambahkan marker contoh (Posko Bantuan)
    const poskoMarker = L.marker([0.4668, 101.4489]).addTo(map);
    poskoMarker.bindPopup('<b>Posko Bantuan</b><br>Lokasi Posko Terdekat.');

    // Memuat dan menampilkan GeoJSON
    fetch('/dumai.geojson')
        .then(response => response.json())
        .then(data => {
            L.geoJSON(data).addTo(map); // Menambahkan data GeoJSON ke peta
        })
        .catch(error => {
            console.error('Error loading GeoJSON:', error);
        });

    // Pembaruan kartu informasi
    document.getElementById('status-card').innerHTML = 'Status Siaga Dumai: <span>WASPADA</span>';
    document.getElementById('laporan-card').innerHTML = 'Jumlah Laporan Baru: <span>12</span>';
    document.getElementById('posko-card').innerHTML = 'Posko Aktif: <span>5</span>';
    document.getElementById('edukasi-card').innerHTML = 'Edukasi Bencana: <span>Evakuasi Saat Banjir</span>';

    // Floating Action Button untuk laporan warga
    const fab = document.getElementById('lapor-btn');
    fab.addEventListener('click', () => {
        window.location.href = '/laporan.html';  // Navigasi ke halaman laporan
    });
});
