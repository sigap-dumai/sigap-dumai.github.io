// Memuat GeoJSON dari /dumai.geojson dan menambahkannya ke peta
fetch('/dumai.geojson')
    .then(response => response.json())
    .then(data => {
        L.geoJSON(data).addTo(map); // Menambahkan data GeoJSON ke peta
    })
    .catch(error => console.error("Error loading GeoJSON:", error));
