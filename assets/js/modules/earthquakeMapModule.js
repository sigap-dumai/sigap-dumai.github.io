// earthquakeMapModule.js
export const earthquakeMapModule = {
  loadEarthquakeMap: function (map) {
    const earthquakeApiUrl = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson';

    fetch(earthquakeApiUrl)
      .then(response => response.json())
      .then(data => {
        data.features.forEach(earthquake => {
          const lat = earthquake.geometry.coordinates[1];
          const lon = earthquake.geometry.coordinates[0];
          const magnitude = earthquake.properties.mag;

          L.circleMarker([lat, lon], { color: 'blue', radius: magnitude * 2 })
            .addTo(map)
            .bindPopup(\`<b>Gempa Bumi:</b><br>Magnitude: \${magnitude}<br>Latitude: \${lat}<br>Longitude: \${lon}\`)
            .openPopup();
        });
      })
      .catch(error => console.error('Error loading earthquake data:', error));
  }
};