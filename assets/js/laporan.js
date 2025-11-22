// leaflet.js - Pustaka Leaflet untuk peta interaktif dan GeoJSON

var L = window.L || {};

// Function to initialize the map
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

// Function to create tile layer
L.tileLayer = function (url, options) {
    return {
        addTo: function (map) { 
            console.log("Tile layer added to map"); 
        },
    };
};

// Function to create a marker
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

// Function to load GeoJSON data
L.geoJSON = function (data, options) {
    return {
        addTo: function (map) {
            console.log("GeoJSON layer added to map with data:", data);
            // Assuming you have GeoJSON data to be added
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

// Load GeoJSON data from dumai.geojson file (using fetch or similar)
document.addEventListener("DOMContentLoaded", () => {
    const map = L.map('map').setView([0.4668, 101.4489], 12); // Koordinat Dumai

    // Adding the tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    // Fetch GeoJSON data and add it to the map
    fetch('/dumai.geojson')
        .then(response => response.json())
        .then(data => {
            L.geoJSON(data).addTo(map);
        })
        .catch(error => {
            console.error('Error loading GeoJSON data:', error);
        });
});
