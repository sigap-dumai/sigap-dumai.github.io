document.addEventListener('DOMContentLoaded', function () {

    // Mengambil dan menampilkan satu kutipan secara acak
    function loadQuotes() {
        fetch('/json/quotes.json')  // Pastikan path ini benar
            .then(response => response.json())
            .then(data => {
                const quoteList = document.getElementById('quote-list');
                quoteList.innerHTML = '';  // Mengosongkan daftar kutipan
                
                // Ambil kutipan acak dari array quotes
                const randomQuote = data.quotes[Math.floor(Math.random() * data.quotes.length)];

                // Menampilkan kutipan acak di #quote-list
                const listItem = document.createElement('li');
                listItem.textContent = `"${randomQuote}"`;
                quoteList.appendChild(listItem);
            })
            .catch(error => {
                console.error('Error loading quotes:', error);
            });
    }

    // Mengganti kutipan setiap 10 menit
    function refreshQuotes() {
        loadQuotes();
        setInterval(loadQuotes, 600000);  // Memuat kutipan setiap 10 menit (600000 ms)
    }

    // Memastikan kutipan dimuat pertama kali saat halaman dimuat
    refreshQuotes();

    // Inisialisasi Peta
    function initMap() {
        const map = L.map('map').setView([1.6406, 101.4475], 13);  // Koordinat Dumai

        // Menambahkan tile layer (OpenStreetMap)
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        // Menambahkan marker untuk Dumai
        L.marker([1.6406, 101.4475]).addTo(map)
            .bindPopup('Kota Dumai')
            .openPopup();
    }

    // Pastikan peta dimuat setelah DOM dimuat
    initMap();

});
