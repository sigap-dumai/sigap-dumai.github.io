// modules/quick-response/quick-response.js
document.getElementById('quick-response-form').addEventListener('submit', function(event) {
    event.preventDefault();

    const unit = document.getElementById('unit').value;
    const command = document.getElementById('command').value;

    // Kirim perintah ke server atau simpan perintah untuk diproses lebih lanjut
    console.log('Perintah untuk ' + unit + ': ' + command);
    alert('Perintah berhasil dikirim ke ' + unit);
});
