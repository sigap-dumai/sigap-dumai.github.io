document.addEventListener("DOMContentLoaded", () => {
    // 1. Inisialisasi Peta
    // Menggunakan CONFIG.defaultLat/Lng dari file config.js
    // Zoom kita atur ke 11 supaya terlihat seluruh wilayah Kota Dumai (bukan cuma tengah kota)
    const map = L.map('map').setView([CONFIG.defaultLat, CONFIG.defaultLng], 11);

    // 2. Tambahkan Tampilan Peta Dasar (OpenStreetMap)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap'
    }).addTo(map);

    // 3. Data Posko Kecamatan (7 Kecamatan di Dumai)
    // Warna Hijau (#2ed573): Menandakan Posko Aman/Siaga
    const poskoKecamatan = [
        { nama: "Posko Dumai Kota", lat: 1.6815, lng: 101.4475 },
        { nama: "Posko Dumai Barat", lat: 1.6943, lng: 101.4098 },
        { nama: "Posko Dumai Timur", lat: 1.6662, lng: 101.4829 },
        { nama: "Posko Dumai Selatan", lat: 1.6498, lng: 101.4334 },
        { nama: "Posko Bukit Kapur", lat: 1.5714, lng: 101.3562 },
        { nama: "Posko Sungai Sembilan", lat: 1.7766, lng: 101.3262 },
        { nama: "Posko Medang Kampai", lat: 1.6214, lng: 101.5978 }
    ];

    // Fungsi untuk menampilkan Marker Posko ke Peta
    poskoKecamatan.forEach(posko => {
        L.circleMarker([posko.lat, posko.lng], {
            color: '#2ed573',       // Garis pinggir Hijau
            fillColor: '#2ed573',   // Isi Hijau
            fillOpacity: 0.8,       // Tingkat transparansi
            radius: 6               // Ukuran titik (sedang)
        }).addTo(map).bindPopup(`<b>🏕️ ${posko.nama}</b><br>Status: Siaga 24 Jam`);
    });

    // 4. Data Hotspot (Titik Api - Contoh Data Dummy)
    // Warna Merah (#ff4757): Menandakan Bahaya Kebakaran
    const hotspots = [
        { lat: 1.6900, lng: 101.4500, lokasi: "Simulasi - Jl. Putri Tujuh" },
        { lat: 1.6700, lng: 101.4300, lokasi: "Simulasi - Area Kilang" },
        { lat: 1.6000, lng: 101.5500, lokasi: "Simulasi - Pelintung" }
    ];

    // Fungsi untuk menampilkan Marker Hotspot ke Peta
    hotspots.forEach(h => {
        L.circleMarker([h.lat, h.lng], {
            color: '#ff4757',       // Garis pinggir Merah
            fillColor: '#ff4757',   // Isi Merah
            fillOpacity: 0.8,
            radius: 8               // Ukuran titik (lebih besar dari posko)
        }).addTo(map).bindPopup(`<b>🔥 HOTSPOT TERPANTAU</b><br>Lokasi: ${h.lokasi}`);
    });
});