// reports.js - Menangani Laporan dan Pengiriman Laporan ke Server

import { sendReport } from './api.js'; // Mengimpor fungsi sendReport dari api.js

// Fungsi untuk menangani pengiriman laporan
document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById('laporan-form');

    // Validasi dan kirim laporan
    form.addEventListener('submit', (event) => {
        event.preventDefault();

        // Ambil nilai dari form
        const jenisInsiden = document.getElementById('jenis-insiden').value;
        const deskripsi = document.getElementById('deskripsi').value;
        const lokasi = document.getElementById('lokasi').value;
        const foto = document.getElementById('foto').files[0];

        // Validasi form
        if (!jenisInsiden || !deskripsi || !lokasi) {
            alert("Semua bidang harus diisi!");
            return;
        }

        // Siapkan data laporan
        const reportData = {
            jenisInsiden,
            deskripsi,
            lokasi,
            foto: foto ? foto.name : null,  // Mengirim nama file foto, bisa disesuaikan
        };

        // Kirim laporan ke server
        sendReport(reportData).then(response => {
            if (response) {
                alert("Laporan berhasil dikirim!");
                form.reset();  // Reset form setelah pengiriman
            } else {
                alert("Gagal mengirim laporan.");
            }
        });
    });
});
