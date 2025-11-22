// mapModule.js
export const mapModule = {
  initializeMap: function () {
    const map = L.map('map').setView([0.0, 0.0], 2); // Set default view (latitude, longitude)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    return map;
  },

  addMarker: function (map, lat, lon, jenis) {
    const marker = L.marker([lat, lon]).addTo(map);
    marker.bindPopup(`<b>${jenis}</b><br>Lokasi: ${lat}, ${lon}`).openPopup();
  },

  loadBencanaData: function (map) {
    fetch('assets/geojson/bencana.geojson')
      .then(response => response.json())
      .then(data => {
        data.features.forEach(bencana => {
          const lat = bencana.geometry.coordinates[1];
          const lon = bencana.geometry.coordinates[0];
          const jenis = bencana.properties.jenis;
          this.addMarker(map, lat, lon, jenis);
        });
      })
      .catch(error => console.error('Error loading GeoJSON:', error));
  }
};
