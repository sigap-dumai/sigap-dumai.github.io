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

        // Simulasi pengiriman laporan
        const formData = new FormData();
        formData.append('jenisInsiden', jenisInsiden);
        formData.append('deskripsi', deskripsi);
        formData.append('lokasi', lokasi);
        if (foto) formData.append('foto', foto);

        // Kirim data ke server (dummy API endpoint)
        fetch('/api/reports', {
            method: 'POST',
            body: formData
        }).then(response => response.json())
        .then(data => {
            alert("Laporan berhasil dikirim!");
            form.reset();  // Reset form setelah pengiriman
        }).catch(error => {
            console.error("Error:", error);
            alert("Terjadi kesalahan saat mengirim laporan.");
        });
    });
});
