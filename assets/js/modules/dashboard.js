document.addEventListener("DOMContentLoaded", () => {
    const map = L.map('map').setView([CONFIG.defaultLat, CONFIG.defaultLng], 12);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap' }).addTo(map);
    const hotspots = [{lat: 1.6900, lng: 101.4500}, {lat: 1.6700, lng: 101.4300}];
    hotspots.forEach(h => L.circleMarker([h.lat, h.lng], {color: '#ff4757', radius: 8, fillOpacity: 1}).addTo(map).bindPopup("Hotspot"));
    L.circleMarker([1.6815, 101.4475], {color: '#2ed573', radius: 8, fillOpacity: 1}).addTo(map).bindPopup("Posko Utama");
});