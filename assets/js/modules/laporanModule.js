// laporanModule.js
export const laporanModule = {
  toggleForm: function () {
    document.getElementById('laporan-form').classList.toggle('hidden');
  },

  handleLaporanSubmit: function (map) {
    document.getElementById('form-lapor').addEventListener('submit', (e) => {
      e.preventDefault();

      const jenisBencana = document.getElementById('jenis-bencana').value;
      const deskripsi = document.getElementById('deskripsi').value;

      // Proses pengiriman laporan (misalnya, kirim ke API)
      alert(`Laporan: ${jenisBencana}, Deskripsi: ${deskripsi}`);

      // Menambahkan marker baru di peta
      const lat = map.getCenter().lat;
      const lon = map.getCenter().lng;
      mapModule.addMarker(map, lat, lon, jenisBencana);

      // Sembunyikan form setelah pengiriman
      document.getElementById('laporan-form').classList.add('hidden');
    });
  }
};