document.addEventListener("DOMContentLoaded", () => {
    // 1. GENERATE DATA SIMULASI (Agar peta ramai)
    seedDummyReports();

    // 2. INISIALISASI PETA
    initMap();

    // 3. TARIK DATA DARI BMKG (Gempa & Cuaca)
    initGempaBMKG();
    initCuacaBMKG(); // Fungsi Baru: Baca XML BMKG

    // 4. Update Status & Notifikasi
    updateStatusSiaga();
    updateJumlahLaporan();
    initNews();

    // Tombol Notifikasi
    const btnNotif = document.getElementById('btnNotifikasi');
    if(btnNotif){
        btnNotif.addEventListener('click', () => {
            const pesan = document.getElementById('notifikasi-jalan').innerText;
            alert("⚠️ INFO PERINGATAN DINI BPBD DUMAI:\n\n" + pesan);
        });
    }
});

// --- FUNGSI BARU: CUACA RESMI BMKG (XML PARSING) ---
async function initCuacaBMKG() {
    const displaySuhu = document.getElementById('cuaca-suhu');
    const displayDesc = document.getElementById('cuaca-desc');
    const displayIcon = document.getElementById('cuaca-icon');

    displayDesc.innerText = "Koneksi ke BMKG...";

    try {
        // URL Data Cuaca Provinsi Riau
        // Kita pakai Proxy 'cors-anywhere' atau sejenisnya untuk demo agar tidak diblokir browser
        // Jika sudah di server sendiri (hosting), bisa panggil langsung URL BMKG
        const urlBMKG = "https://data.bmkg.go.id/DataMKG/MEWS/DigitalForecast/DigitalForecast-Riau.xml";
        
        // Catatan: Fetching XML lintas domain sering diblokir browser (CORS).
        // Untuk DEMO yang stabil tanpa backend, kita gunakan Open-Meteo sebagai cadangan otomatis
        // jika BMKG gagal diakses langsung dari browser.
        
        const response = await fetch(urlBMKG);
        if (!response.ok) throw new Error("Gagal ambil data BMKG");

        const strXML = await response.text();
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(strXML, "text/xml");

        // Cari Data Khusus "Dumai"
        // BMKG menggunakan ID wilayah. Dumai biasanya punya beberapa ID kecamatan.
        // Kita cari area yang description-nya mengandung "Dumai"
        const areas = xmlDoc.getElementsByTagName("area");
        let foundArea = null;

        for(let i=0; i<areas.length; i++) {
            // Cari area "Dumai" atau kecamatan pusat kota
            if (areas[i].getAttribute("description").includes("Dumai")) {
                foundArea = areas[i];
                break;
            }
        }

        if (foundArea) {
            // Ambil Parameter Suhu (id="t") dan Cuaca (id="weather")
            // Timerange index 0 biasanya prediksi terdekat (sekarang/nanti)
            const params = foundArea.getElementsByTagName("parameter");
            let temp = "--";
            let weatherCode = "0";

            for(let j=0; j<params.length; j++) {
                if(params[j].getAttribute("id") === "t") {
                    temp = params[j].getElementsByTagName("timerange")[0].getElementsByTagName("value")[0].textContent;
                }
                if(params[j].getAttribute("id") === "weather") {
                    weatherCode = params[j].getElementsByTagName("timerange")[0].getElementsByTagName("value")[0].textContent;
                }
            }

            // Update Tampilan Dashboard
            displaySuhu.innerText = `${temp}°C`;
            displayDesc.innerText = translateKodeCuaca(weatherCode);
            
            // Icon
            let icon = "fa-cloud-sun text-warning";
            if (weatherCode == "60" || weatherCode == "61") icon = "fa-cloud-rain text-info"; // Hujan
            if (weatherCode == "95" || weatherCode == "97") icon = "fa-bolt text-warning"; // Petir
            if (weatherCode == "0") icon = "fa-sun text-warning"; // Cerah
            displayIcon.className = `fas ${icon} fs-4`;

            console.log("Berhasil menarik data BMKG XML");
        } else {
            throw new Error("Wilayah Dumai tidak ditemukan di XML Riau");
        }

    } catch (error) {
        console.warn("Gagal akses BMKG (CORS/Network), beralih ke Open-Meteo...", error);
        // FALLBACK: Pakai Open-Meteo jika BMKG Error (Supaya dashboard tidak rusak)
        initWeatherFallback(); 
    }
}

// Helper: Terjemahan Kode Cuaca BMKG
function translateKodeCuaca(code) {
    // Referensi: https://data.bmkg.go.id/prakiraan-cuaca/
    const codes = {
        "0": "Cerah", "1": "Cerah Berawan", "2": "Cerah Berawan", "3": "Berawan", "4": "Berawan Tebal",
        "5": "Udara Kabur", "10": "Asap", "60": "Hujan Ringan", "61": "Hujan Sedang", 
        "63": "Hujan Lebat", "80": "Hujan Lokal", "95": "Hujan Petir", "97": "Hujan Petir"
    };
    return codes[code] || "Berawan";
}

// Fungsi Cadangan (Open-Meteo) - Sama seperti sebelumnya
async function initWeatherFallback() {
    try {
        const r = await fetch("https://api.open-meteo.com/v1/forecast?latitude=1.68&longitude=101.45&current_weather=true&timezone=Asia%2FBangkok");
        const d = await r.json();
        document.getElementById('cuaca-suhu').innerText = d.current_weather.temperature+"°C";
        document.getElementById('cuaca-desc').innerText = "Cerah Berawan (OM)"; // Kode OM
    } catch(e){ 
        document.getElementById('cuaca-desc').innerText="-"; 
    } 
}

// --- FUNGSI GEMPA TERKINI (JSON BMKG) ---
async function initGempaBMKG() {
    const container = document.getElementById('list-gempa');
    try {
        const r = await fetch('https://data.bmkg.go.id/DataMKG/TEWS/gempaterkini.json');
        if(!r.ok) throw new Error();
        const d = await r.json();
        container.innerHTML="";
        
        // Ambil 3 Gempa Terakhir
        d.Infogempa.gempa.slice(0,3).forEach(g=>{ 
            // Cek apakah gempa dekat Riau/Sumatera (Filter sederhana)
            let highlight = "";
            if (g.Wilayah.includes("Riau") || g.Wilayah.includes("Sumatera") || g.Wilayah.includes("Mentawai")) {
                highlight = "bg-warning-subtle"; // Beri warna jika dekat
            }

            container.innerHTML+=`
            <div class="gempa-item ${highlight}">
                <span class="gempa-mag">${g.Magnitude}</span> 
                ${g.Wilayah}
                <br><small class="text-muted"><i class="far fa-clock"></i> ${g.Jam}, ${g.Tanggal}</small>
            </div>`; 
        });
    } catch(e){ 
        container.innerHTML=`<div class="gempa-item"><span class="gempa-mag">5.0</span> Simulasi Gempa Laut (Offline) <br><small>Baru saja</small></div>`; 
    } 
}

// --- FUNGSI LAINNYA (PETA, LAPORAN, BERITA) ---
// (Bagian ini tidak berubah, hanya saya ringkas agar muat. Pastikan copy semua bagian bawah ini)

function seedDummyReports() {
    if(localStorage.getItem("dataLaporan_SIGAP")) return; // Jangan timpa jika sudah ada
    // Generate data dummy seperti sebelumnya...
    const dummy = [
        {waktu:"5/12/2023, 10:00", jenis:"Jalan Rusak", lat:1.6780, lng:101.4450, wilayah:"Kec. Dumai Kota"},
        {waktu:"5/12/2023, 14:30", jenis:"Banjir", lat:1.7010, lng:101.3950, wilayah:"Kec. Dumai Barat"},
        {waktu:"5/12/2023, 16:15", jenis:"Karhutla", lat:1.6600, lng:101.4700, wilayah:"Kec. Dumai Timur"}
    ];
    localStorage.setItem("dataLaporan_SIGAP", JSON.stringify(dummy));
}

function initMap() {
    const map = L.map('map').setView([CONFIG.defaultLat, CONFIG.defaultLng], 11);
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', { attribution: 'Tiles © Esri' }).addTo(map);

    // Marker Statis (Posko, Hotspot, dll)
    const posko = [{n:"Posko Dumai Kota",lat:1.6815,lng:101.4475},{n:"Posko Dumai Barat",lat:1.6943,lng:101.4098},{n:"Posko Dumai Timur",lat:1.6662,lng:101.4829},{n:"Posko Dumai Selatan",lat:1.6498,lng:101.4334}];
    posko.forEach(p => L.circleMarker([p.lat,p.lng],{color:'#2ed573',fillColor:'#2ed573',fillOpacity:0.8,radius:6}).addTo(map).bindPopup(`<b>🏕️ ${p.n}</b>`));

    const hot = [{lat:1.6900,lng:101.4500,loc:"Jl. Putri Tujuh"},{lat:1.6700,lng:101.4300,loc:"Area Kilang"}];
    hot.forEach(h => L.circleMarker([h.lat,h.lng],{color:'#ff4757',fillColor:'#ff4757',fillOpacity:0.8,radius:8}).addTo(map).bindPopup(`<b>🔥 HOTSPOT:</b> ${h.loc}`));

    const floods = [{lat:1.6850,lng:101.4400,loc:"Jl. Cempedak"},{lat:1.6920,lng:101.4150,loc:"Pangkalan Sesai"}];
    floods.forEach(f => L.circleMarker([f.lat,f.lng],{color:'#1e90ff',fillColor:'#1e90ff',fillOpacity:0.8,radius:7}).addTo(map).bindPopup(`<b>🌊 BANJIR:</b> ${f.loc}`));

    // Marker Laporan Warga
    const laporanWarga = JSON.parse(localStorage.getItem("dataLaporan_SIGAP")) || [];
    laporanWarga.forEach(lap => {
        L.circleMarker([lap.lat, lap.lng], {
            color: '#fff', weight: 1, fillColor: '#9c27b0', fillOpacity: 1, radius: 5
        }).addTo(map).bindPopup(`<b>👤 LAPORAN: ${lap.jenis}</b><br>${lap.wilayah}<br><small>${lap.waktu}</small>`);
    });
}

function initNews() {
    const container = document.getElementById('berita-container');
    const newsData = [
        { title: "Peringatan Dini Cuaca Riau", desc: "BMKG: Potensi hujan lebat disertai petir di Dumai sore ini.", date: "Baru saja", img: "https://placehold.co/60x60/1e90ff/ffffff?text=BMKG" },
        { title: "Titik Panas Terpantau", desc: "Satelit Terra/Aqua mendeteksi 2 titik panas di Medang Kampai.", date: "2 Jam lalu", img: "https://placehold.co/60x60/ff4757/ffffff?text=API" }
    ];
    container.innerHTML = "";
    newsData.forEach(n => {
        container.innerHTML += `<div class="news-item"><img src="${n.img}" class="news-thumb"><div><h6>${n.title}</h6><p>${n.desc}</p><span class="news-date">${n.date}</span></div></div>`;
    });
}

function updateStatusSiaga() { document.getElementById('status-text').innerText="SIAGA 1"; document.getElementById('status-text').className="fw-bold fs-5 mb-1 text-danger"; document.getElementById('status-desc').innerText="Waspada Banjir Rob"; document.getElementById('notifikasi-jalan').innerText="⚠️ PERINGATAN DINI BMKG: Waspada potensi hujan lebat disertai angin kencang di wilayah Dumai Pesisir pada sore hingga malam hari."; }
function updateJumlahLaporan() { const data = JSON.parse(localStorage.getItem("dataLaporan_SIGAP")) || []; document.getElementById("jml-laporan").innerText = data.length + " Laporan"; }