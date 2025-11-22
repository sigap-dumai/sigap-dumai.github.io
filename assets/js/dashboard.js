document.addEventListener("DOMContentLoaded", () => {
    // Fungsi untuk memuat cuaca menggunakan OpenWeatherMap API
    async function fetchWeather() {
        const apiKey = 'd2482cbc5428fccde0297d4aab71e3ee';  // API key Anda
        const city = 'Dumai';  // Kota untuk cuaca
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

        try {
            const response = await fetch(url);
            const data = await response.json();

            // Cek jika data cuaca berhasil
            if (data.weather) {
                const temp = data.main.temp; // Suhu
                const description = data.weather[0].description; // Deskripsi cuaca
                document.getElementById('weather-card').innerHTML = `Cuaca di Dumai: ${temp}°C, ${description}`;
            } else {
                console.error('Data cuaca tidak ditemukan');
            }
        } catch (error) {
            console.error('Error fetching weather data:', error);
            document.getElementById('weather-card').innerHTML = 'Gagal memuat cuaca';
        }
    }

    // Fungsi untuk memuat data gempa menggunakan USGS API
    async function fetchEarthquakeData() {
        const url = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson';

        try {
            const response = await fetch(url);
            const data = await response.json();
            const earthquakes = data.features;
            let earthquakeList = '';
            earthquakes.forEach(earthquake => {
                earthquakeList += `<p>${earthquake.properties.title}</p>`;
            });
            document.getElementById('earthquake-card').innerHTML = `Gempa Terbaru:<br>${earthquakeList}`;
        } catch (error) {
            console.error('Error fetching earthquake data:', error);
            document.getElementById('earthquake-card').innerHTML = 'Gagal memuat data gempa';
        }
    }

    // Fungsi untuk memuat data karhutla (api bisa ditambahkan sesuai kebutuhan)
    async function fetchKarhutlaData() {
        // Misalnya menggunakan FIRMS NASA API atau API lainnya
        document.getElementById('karhutla-card').innerHTML = 'Data Karhutla belum tersedia';
    }

    // Memuat data saat halaman dimuat
    fetchWeather(); // Ambil cuaca
    fetchEarthquakeData(); // Ambil data gempa
    fetchKarhutlaData(); // Ambil data karhutla

    // Update kartu informasi lainnya
    document.getElementById('status-card').innerHTML = 'Status Siaga Dumai: <span>WASPADA</span>';
    document.getElementById('laporan-card').innerHTML = 'Jumlah Laporan Baru: <span>12</span>';
    document.getElementById('posko-card').innerHTML = 'Posko Aktif: <span>5</span>';
    document.getElementById('edukasi-card').innerHTML = 'Edukasi Bencana: <span>Evakuasi Saat Banjir</span>';

    // Floating Action Button (FAB) untuk laporan warga
    const fab = document.getElementById('lapor-btn');
    fab.addEventListener('click', () => {
        window.location.href = '/laporan.html';  // Navigasi ke halaman laporan
    });
});
