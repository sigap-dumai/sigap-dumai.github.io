// leaflet.js - Pustaka Leaflet untuk peta interaktif

var L = window.L || {};

// Fungsi untuk inisialisasi peta
L.map = function (id) {
    return {
        setView: function (coords, zoom) { 
            console.log(`Setting view to ${coords} with zoom ${zoom}`);
        },
        addLayer: function () { 
            console.log("Layer added"); 
        },
    };
};

// Fungsi untuk membuat tile layer
L.tileLayer = function (url, options) {
    return {
        addTo: function (map) { 
            console.log("Tile layer added to map"); 
        },
    };
};

// Fungsi untuk membuat marker
L.marker = function (coords) {
    return {
        addTo: function (map) { 
            console.log("Marker added to map"); 
        },
        bindPopup: function (content) { 
            console.log(`Popup bound: ${content}`);
        },
    };
};

// Fungsi untuk memuat data GeoJSON
L.geoJSON = function (data, options) {
    return {
        addTo: function (map) {
            console.log("GeoJSON layer added to map with data:", data);
            // Misalnya, tambahkan marker dari GeoJSON
            if (data.features) {
                data.features.forEach(feature => {
                    L.marker([feature.geometry.coordinates[1], feature.geometry.coordinates[0]])
                        .bindPopup(feature.properties.name || "No Name")
                        .addTo(map);
                });
            }
        }
    };
};

// Fungsi untuk menambahkan layer peta GeoJSON
document.addEventListener("DOMContentLoaded", () => {
    const map = L.map('map').setView([0.4668, 101.4489], 12); // Koordinat Dumai

    // Menambahkan tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    // Memuat GeoJSON data dari server
    fetch('/dumai.geojson')
        .then(response => response.json())
        .then(data => {
            L.geoJSON(data).addTo(map);  // Menambahkan GeoJSON ke peta
        })
        .catch(error => console.error('Error loading GeoJSON:', error));
});
