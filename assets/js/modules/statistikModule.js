// statistikModule.js
export const statistikModule = {
  updateStatistik: function (total, jenis) {
    document.getElementById('total-bencana').innerText = total;
    document.getElementById('jenis-bencana').innerText = jenis;
  },

  fetchAndUpdateStatistik: function () {
    let totalBencana = 10; // Asumsikan data ini datang dari API atau database
    let jenisBencanaTerkini = "Gempa"; // Bisa diupdate dari GeoJSON atau data lainnya
    this.updateStatistik(totalBencana, jenisBencanaTerkini);
  }
};