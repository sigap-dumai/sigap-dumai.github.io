// =============================================================
// Dashboard.js – SiGap Dumai
// =============================================================

// Initialize the Leaflet map
function initMap() {
    const map = L.map("map").setView([1.682, 101.448], 12);  // Set default center to Dumai

    // Set up the tile layer for the map
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    // Use dummy data to display markers
    const locations = [
        { name: "Bukit Kapur", lat: 1.727, lon: 101.372 },
        { name: "Dumai Timur", lat: 1.685, lon: 101.455 },
        { name: "Dumai Barat", lat: 1.668, lon: 101.420 },
        { name: "Dumai Kota", lat: 1.682, lon: 101.448 },
        { name: "Dumai Selatan", lat: 1.638, lon: 101.450 },
    ];

    locations.forEach(loc => {
        L.marker([loc.lat, loc.lon]).addTo(map)
            .bindPopup(`<b>${loc.name}</b>`);  // Display location name in popup
    });
}

// Call initMap when the page loads
document.addEventListener("DOMContentLoaded", initMap);
