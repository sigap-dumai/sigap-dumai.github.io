// karhutlaMapModule.js
export const karhutlaMapModule = {
  loadKarhutlaMap: function (map) {
    const karhutlaUrl = 'https://firms.modaps.eosdis.nasa.gov/active_fire/viirs/';
    fetch(karhutlaUrl)
      .then(response => response.json())
      .then(data => {
        data.features.forEach(fire => {
          const lat = fire.geometry.coordinates[1];
          const lon = fire.geometry.coordinates[0];

          L.circleMarker([lat, lon], { color: 'red', radius: 6 })
            .addTo(map)
            .bindPopup(\`<b>Hotspot Karhutla:</b><br>Latitude: \${lat}<br>Longitude: \${lon}\`)
            .openPopup();
        });
      })
      .catch(error => console.error('Error loading karhutla data:', error));
  }
};