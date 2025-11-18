const map = L.map('map').setView([1.6349, 101.4509], 13);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

L.marker([1.6349, 101.4509]).addTo(map)
    .bindPopup('Lokasi Laporan Bencana')
    .openPopup();