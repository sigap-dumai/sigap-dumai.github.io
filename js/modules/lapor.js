const btnLokasi = document.getElementById('btnLokasi');
const lokasiStatus = document.getElementById('lokasiStatus');
let userCoords = null;

btnLokasi.addEventListener('click', () => {
    if (!navigator.geolocation) { alert("Browser tidak support GPS"); return; }
    lokasiStatus.innerText = "Mencari...";
    navigator.geolocation.getCurrentPosition(
        (pos) => {
            userCoords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
            lokasiStatus.innerText = `✅ ${userCoords.lat.toFixed(4)}, ${userCoords.lng.toFixed(4)}`;
            lokasiStatus.classList.add('text-success');
        },
        () => { lokasiStatus.innerText = "Gagal ambil lokasi"; }
    );
});

document.getElementById('formLapor').addEventListener('submit', (e) => {
    e.preventDefault();
    if(!userCoords) { alert("Wajib ambil lokasi!"); return; }
    const jenis = document.getElementById('jenisKejadian').value;
    const laporan = { waktu: new Date().toLocaleString(), jenis: jenis, lat: userCoords.lat, lng: userCoords.lng };
    let data = JSON.parse(localStorage.getItem("dataLaporan_SIGAP")) || [];
    data.push(laporan);
    localStorage.setItem("dataLaporan_SIGAP", JSON.stringify(data));
    alert("Laporan Terkirim!");
    window.location.href = "index.html";
});