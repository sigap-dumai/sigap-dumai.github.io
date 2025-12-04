document.addEventListener("DOMContentLoaded", () => {
    // 1. GENERATE DUMMY DATA (25+ Laporan)
    seedDummyReports();

    // 2. JALANKAN FITUR UTAMA
    initMap();
    initWeather();
    initGempa();
    initNews(); // Fitur Berita
    updateStatusSiaga();
    updateJumlahLaporan();

    // 3. Tombol Notifikasi
    const btnNotif = document.getElementById('btnNotifikasi');
    if(btnNotif){
        btnNotif.addEventListener('click', () => {
            const pesan = document.getElementById('notifikasi-jalan').innerText;
            alert("⚠️ INFO PERINGATAN DINI BPBD DUMAI:\n\n" + pesan);
        });
    }
});

// --- FUNGSI BARU: GENERATE 25 LAPORAN SIMULASI ---
function seedDummyReports() {
    // Kita reset data setiap kali reload agar posisinya acak terus (bagus untuk demo)
    // Jika ingin permanen, hapus baris localStorage.removeItem ini
    localStorage.removeItem("dataLaporan_SIGAP"); 

    const jenisList = ["Jalan Rusak", "Banjir", "Pohon Tumbang", "Hewan Buas", "Karhutla", "Kecelakaan"];
    const kelList = ["Dumai Kota", "Ratu Sima", "Bintan", "Sukajadi", "Purnama", "Bagan Besar", "Mundam", "Pelintung", "Gurun Panjang"];
    
    let dummyData = [];

    // Loop membuat 25 laporan
    for (let i = 0; i < 25; i++) {
        // Random Koordinat di sekitar Dumai (Lat 1.6xx, Lng 101.4xx)
        // Lat spread: 1.60 - 1.75 | Lng spread: 101.35 - 101.55
        const rLat = 1.60 + (Math.random() * 0.15);
        const rLng = 101.35 + (Math.random() * 0.20);
        
        // Random Waktu (Hari ini)
        const jam = Math.floor(Math.random() * 12) + 1;
        const menit = Math.floor(Math.random() * 60);
        
        dummyData.push({
            waktu: `5/12/2023, ${jam}:${menit < 10 ? '0'+menit : menit}:00`,
            jenis: jenisList[Math.floor(Math.random() * jenisList.length)],
            lat: rLat,
            lng: rLng,
            kelurahan: "Kel. " + kelList[Math.floor(Math.random() * kelList.length)]
        });
    }

    localStorage.setItem("dataLaporan_SIGAP", JSON.stringify(dummyData));
    console.log("25 Data simulasi laporan warga berhasil dibuat.");
}

// --- FUNGSI BARU: MENAMPILKAN BERITA BENCANA ---
function initNews() {
    const container = document.getElementById('berita-container');
    const newsData = [
        {
            title: "Waspada Pasang Air Laut (ROB) Sore Ini",
            desc: "BMKG memperingatkan potensi banjir rob di wilayah pesisir Dumai Kota dan Dumai Barat.",
            date: "1 Jam yang lalu",
            img: "https://placehold.co/60x60/1e90ff/ffffff?text=ROB"
        },
        {
            title: "Kebakaran Lahan di Medang Kampai Teratasi",
            desc: "Tim TRC BPBD Dumai berhasil memadamkan titik api di area gambut seluas 2 hektar.",
            date: "3 Jam yang lalu",
            img: "https://placehold.co/60x60/ff4757/ffffff?text=API"
        },
        {
            title: "Pohon Tumbang Menutup Jalan Sudirman",
            desc: "Akibat angin kencang, sebuah pohon trembesi tumbang. Lalu lintas dialihkan sementara.",
            date: "5 Jam yang lalu",
            img: "https://placehold.co/60x60/ffa500/ffffff?text=ANGIN"
        },
        {
            title: "Sosialisasi Pencegahan Karhutla",
            desc: "Camat Dumai Kota menghimbau warga untuk tidak membuka lahan dengan cara membakar.",
            date: "Kemarin",
            img: "https://placehold.co/60x60/2ed573/ffffff?text=INFO"
        }
    ];

    container.innerHTML = "";
    newsData.forEach(news => {
        container.innerHTML += `
            <div class="news-item">
                <img src="${news.img}" class="news-thumb" alt="thumb">
                <div class="news-content">
                    <h6>${news.title}</h6>
                    <p>${news.desc}</p>
                    <span class="news-date"><i class="far fa-clock"></i> ${news.date}</span>
                </div>
            </div>
        `;
    });
}

// --- INISIALISASI PETA (SATELIT + SEMUA MARKER) ---
function initMap() {
    const map = L.map('map').setView([CONFIG.defaultLat, CONFIG.defaultLng], 11);
    
    // Tampilan Satelit
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles © Esri'
    }).addTo(map);

    // A. Marker Posko (HIJAU)
    const posko = [
        { n: "Posko Dumai Kota", lat: 1.6815, lng: 101.4475 }, { n: "Posko Dumai Barat", lat: 1.6943, lng: 101.4098 },
        { n: "Posko Dumai Timur", lat: 1.6662, lng: 101.4829 }, { n: "Posko Dumai Selatan", lat: 1.6498, lng: 101.4334 },
        { n: "Posko Bukit Kapur", lat: 1.5714, lng: 101.3562 }, { n: "Posko Sei Sembilan", lat: 1.7766, lng: 101.3262 },
        { n: "Posko Medang Kampai", lat: 1.6214, lng: 101.5978 }
    ];
    posko.forEach(p => L.circleMarker([p.lat, p.lng], { color: '#2ed573', fillColor: '#2ed573', fillOpacity: 0.8, radius: 6 }).addTo(map).bindPopup(`<b>🏕️ ${p.n}</b>`));

    // B. Marker Hotspot (MERAH)
    const hot = [
        { lat: 1.6900, lng: 101.4500, loc: "Jl. Putri Tujuh" }, { lat: 1.6700, lng: 101.4300, loc: "Area Kilang" }, { lat: 1.6000, lng: 101.5500, loc: "Pelintung" }
    ];
    hot.forEach(h => L.circleMarker([h.lat, h.lng], { color: '#ff4757', fillColor: '#ff4757', fillOpacity: 0.8, radius: 8 }).addTo(map).bindPopup(`<b>🔥 HOTSPOT:</b> ${h.loc}`));

    // C. Marker Angin/Pohon (ORANGE)
    const wind = [
        { lat: 1.6960, lng: 101.4200, loc: "Pohon Tumbang Dock Yard" }, { lat: 1.6300, lng: 101.3800, loc: "Angin Kencang Bagan Besar" }, { lat: 1.6500, lng: 101.5200, loc: "Pohon Tumbang Mundam" }, { lat: 1.7400, lng: 101.3400, loc: "Badai Pesisir Sei Sembilan" }, { lat: 1.6100, lng: 101.5800, loc: "Angin Kencang Medang Kampai" }
    ];
    wind.forEach(w => L.circleMarker([w.lat, w.lng], { color: '#ffa500', fillColor: '#ffa500', fillOpacity: 0.8, radius: 7 }).addTo(map).bindPopup(`<b>💨 ANGIN KENCANG:</b> ${w.loc}`));

    // D. Marker Banjir/Pasang (BIRU)
    const floods = [
        { lat: 1.6850, lng: 101.4400, loc: "Banjir Rob Jl. Cempedak" }, { lat: 1.6920, lng: 101.4150, loc: "Pasang Kel. Pangkalan Sesai" }, { lat: 1.6750, lng: 101.4600, loc: "Genangan Jl. Jend. Sudirman" }, { lat: 1.6600, lng: 101.4250, loc: "Banjir Ratu Sima" }
    ];
    floods.forEach(f => L.circleMarker([f.lat, f.lng], { color: '#1e90ff', fillColor: '#1e90ff', fillOpacity: 0.8, radius: 7 }).addTo(map).bindPopup(`<b>🌊 BANJIR/PASANG:</b> ${f.loc}`));

    // E. MARKER LAPORAN WARGA (UNGU)
    const laporanWarga = JSON.parse(localStorage.getItem("dataLaporan_SIGAP")) || [];
    laporanWarga.forEach(lap => {
        L.circleMarker([lap.lat, lap.lng], {
            color: '#fff', weight: 1,
            fillColor: '#9c27b0', fillOpacity: 1, radius: 5
        }).addTo(map).bindPopup(`<b>👤 LAPORAN: ${lap.jenis}</b><br>Area: ${lap.kelurahan}<br><small>${lap.waktu}</small>`);
    });
}

// --- FITUR LAIN ---
async function initWeather() { try { const r = await fetch("https://api.open-meteo.com/v1/forecast?latitude=1.68&longitude=101.45&current_weather=true&timezone=Asia%2FBangkok"); const d = await r.json(); const c = d.current_weather.weathercode; document.getElementById('cuaca-suhu').innerText = d.current_weather.temperature+"°C"; let desc="Cerah", icon="fa-sun text-warning"; if(c>3){desc="Berawan";icon="fa-cloud text-secondary";} if(c>50){desc="Hujan";icon="fa-cloud-rain text-info";} document.getElementById('cuaca-desc').innerText=desc; document.getElementById('cuaca-icon').className=`fas ${icon} fs-4`; } catch(e){ document.getElementById('cuaca-desc').innerText="-"; } }

async function initGempa() { const c = document.getElementById('list-gempa'); try { const r = await fetch('https://data.bmkg.go.id/DataMKG/TEWS/gempaterkini.json'); if(!r.ok) throw new Error(); const d = await r.json(); c.innerHTML=""; d.Infogempa.gempa.slice(0,3).forEach(g=>{ c.innerHTML+=`<div class="gempa-item"><span class="gempa-mag">${g.Magnitude}</span> ${g.Wilayah}<br><small class="text-muted">${g.Jam}</small></div>`; }); } catch(e){ c.innerHTML=`<div class="gempa-item"><span class="gempa-mag">5.0</span> Simulasi Gempa Laut <br><small>Baru saja</small></div>`; } }

function updateStatusSiaga() { document.getElementById('status-text').innerText = "SIAGA 1"; document.getElementById('status-text').className = "fw-bold fs-5 mb-1 text-danger"; document.getElementById('status-desc').innerText = "Waspada Banjir Rob & Karhutla"; document.getElementById('notifikasi-jalan').innerText = "⚠️ PERINGATAN DINI: Waspada Pasang Air Laut (ROB) di wilayah Dumai Kota dan Dumai Barat sore ini. Hindari daerah pinggir pantai."; }

function updateJumlahLaporan() { const data = JSON.parse(localStorage.getItem("dataLaporan_SIGAP")) || []; document.getElementById("jml-laporan").innerText = data.length + " Laporan"; }