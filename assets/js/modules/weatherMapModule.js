// weatherMapModule.js
export const weatherMapModule = {
  loadWeatherMap: function (map) {
    const weatherApiKey = 'YOUR_OPENWEATHERMAP_API_KEY'; // Ganti dengan API Key OpenWeatherMap
    const lat = 1.6349; // Koordinat Dumai (latitude)
    const lon = 101.4560; // Koordinat Dumai (longitude)

    fetch(\`https://api.openweathermap.org/data/2.5/weather?lat=\${lat}&lon=\${lon}&appid=\${weatherApiKey}\`)
      .then(response => response.json())
      .then(data => {
        const weather = data.weather[0].description;
        const temp = data.main.temp - 273.15; 

        const weatherIcon = L.icon({
          iconUrl: \`https://openweathermap.org/img/wn/\${data.weather[0].icon}.png\`,
          iconSize: [50, 50],
        });

        L.marker([lat, lon], { icon: weatherIcon })
          .addTo(map)
          .bindPopup(\`<b>Cuaca di Dumai:</b><br>\${weather}<br>Temperatur: \${temp.toFixed(2)}°C\`)
          .openPopup();
      })
      .catch(error => console.error('Error loading weather data:', error));
  }
};