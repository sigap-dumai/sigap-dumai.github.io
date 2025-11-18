document.getElementById('report-form').addEventListener('submit', function(event) {
    event.preventDefault();
    let location = document.getElementById('location').value;
    let description = document.getElementById('description').value;
    
    // Simulasi pengiriman laporan
    console.log("Laporan Warga:");
    console.log("Lokasi: " + location);
    console.log("Deskripsi: " + description);
    
    // Lanjutkan untuk menyimpan laporan (misalnya API atau local storage)
});