document.addEventListener("DOMContentLoaded", () => {
    seedDummyReports(); // Buat data simulasi
    initMap();
    initWeather();
    initGempa();
    initNews();
    updateStatusSiaga();
    updateJumlahLaporan();

    const btnNotif = document.getElementById('btnNotifikasi');
    if(btnNotif){
        btnNotif.addEventListener('click', () => {
            const pesan = document.getElementById('notifikasi-jalan').innerText;
            alert("⚠️ INFO PERINGATAN DINI BPBD DUMAI:\n\n" + pesan);
        });
    }
});

// --- FUNGSI BARU: GENERATE LAPORAN SIMULASI (DATA KECAMATAN) ---
function seedDummyReports() {
    localStorage.removeItem("dataLaporan_SIGAP"); // Reset tiap reload

    const jenisList = ["Jalan Rusak", "Banjir", "Pohon Tumbang", "Hewan Buas", "Karhutla", "Kecelakaan"];
    
    // UPDATE: Daftar Nama Kecamatan di Dumai (Agar Sinkron)
    const kecList = ["Dumai Kota", "Dumai Barat", "Dumai Timur", "Dumai Selatan", "Bukit Kapur", "Sungai Sembilan", "Medang Kampai"];
    
    let dummyData = [];

    // Loop membuat 25 laporan acak
    for (let i = 0; i < 25; i++) {
        const rLat = 1.60 + (Math.random() * 0.15);
        const rLng = 101.35 + (Math.random() * 0.20);
        const jam = Math.floor(Math.random() * 12) + 1;
        const menit = Math.floor(Math.random() * 60);
        
        dummyData.push({
            waktu: `5/12/2023, ${jam}:${menit < 10 ? '0'+menit : menit}:00`,
            jenis: jenisList[Math.floor(Math.random() * jenisList.length)],
            lat: rLat,
            lng: rLng,
            // Format Wilayah disesuaikan jadi "Kec. [Nama]"
            wilayah: "Kec. " + kecList[Math.floor(Math.random() * kecList.length)] 
        });
    }

    localStorage.setItem("dataLaporan_SIGAP", JSON.stringify(dummyData));
}

function initNews() {
    const container = document.getElementById('berita-container');
    const newsData = [
        { title: "Waspada Pasang Air Laut (ROB)", desc: "Potensi banjir rob di pesisir Dumai Kota.", date: "1 Jam lalu", img: "https://placehold.co/60x60/1e90ff/ffffff?text=ROB" },
        { title: "Kebakaran Lahan Padam", desc: "Tim TRC berhasil memadamkan api di Medang Kampai.", date: "3 Jam lalu", img: "https://placehold.co/60x60/ff4757/ffffff?text=API" },
        { title: "Pohon Tumbang Jl. Sudirman", desc: "Lalu lintas dialihkan sementara.", date: "5 Jam lalu", img: "https://placehold.co/60x60/ffa500/ffffff?text=POHON" },
        { title: "Himbauan Karhutla", desc: "Dilarang membuka lahan dengan membakar.", date: "Kemarin", img: "https://placehold.co/60x60/2ed573/ffffff?text=INFO" }
    ];
    container.innerHTML = "";
    newsData.forEach(n => {
        container.innerHTML += `<div class="news-item"><img src="${n.img}" class="news-thumb"><div><h6>${n.title}</h6><p>${n.desc}</p><span class="news-date">${n.date}</span></div></div>`;
    });
}

function initMap() {
    const map = L.map('map').setView([CONFIG.defaultLat, CONFIG.defaultLng], 11);
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', { attribution: 'Tiles © Esri' }).addTo(map);

    // Marker Posko
    const posko = [{n:"Posko Dumai Kota",lat:1.6815,lng:101.4475},{n:"Posko Dumai Barat",lat:1.6943,lng:101.4098},{n:"Posko Dumai Timur",lat:1.6662,lng:101.4829},{n:"Posko Dumai Selatan",lat:1.6498,lng:101.4334},{n:"Posko Bukit Kapur",lat:1.5714,lng:101.3562},{n:"Posko Sei Sembilan",lat:1.7766,lng:101.3262},{n:"Posko Medang Kampai",lat:1.6214,lng:101.5978}];
    posko.forEach(p => L.circleMarker([p.lat,p.lng],{color:'#2ed573',fillColor:'#2ed573',fillOpacity:0.8,radius:6}).addTo(map).bindPopup(`<b>🏕️ ${p.n}</b>`));

    // Marker Hotspot
    const hot = [{lat:1.6900,lng:101.4500,loc:"Jl. Putri Tujuh"},{lat:1.6700,lng:101.4300,loc:"Area Kilang"},{lat:1.6000,lng:101.5500,loc:"Pelintung"}];
    hot.forEach(h => L.circleMarker([h.lat,h.lng],{color:'#ff4757',fillColor:'#ff4757',fillOpacity:0.8,radius:8}).addTo(map).bindPopup(`<b>🔥 HOTSPOT:</b> ${h.loc}`));

    // Marker Angin
    const wind = [{lat:1.6960,lng:101.4200,loc:"Dock Yard"},{lat:1.6300,lng:101.3800,loc:"Bagan Besar"},{lat:1.6500,lng:101.5200,loc:"Mundam"},{lat:1.7400,lng:101.3400,loc:"Sei Sembilan"},{lat:1.6100,lng:101.5800,loc:"Medang Kampai"}];
    wind.forEach(w => L.circleMarker([w.lat,w.lng],{color:'#ffa500',fillColor:'#ffa500',fillOpacity:0.8,radius:7}).addTo(map).bindPopup(`<b>💨 ANGIN:</b> ${w.loc}`));

    // Marker Banjir
    const floods = [{lat:1.6850,lng:101.4400,loc:"Jl. Cempedak"},{lat:1.6920,lng:101.4150,loc:"Pangkalan Sesai"},{lat:1.6750,lng:101.4600,loc:"Jl. Jend. Sudirman"},{lat:1.6600,lng:101.4250,loc:"Ratu Sima"}];
    floods.forEach(f => L.circleMarker([f.lat,f.lng],{color:'#1e90ff',fillColor:'#1e90ff',fillOpacity:0.8,radius:7}).addTo(map).bindPopup(`<b>🌊 BANJIR:</b> ${f.loc}`));

    // MARKER LAPORAN WARGA (Data Real/Simulasi)
    const laporanWarga = JSON.parse(localStorage.getItem("dataLaporan_SIGAP")) || [];
    laporanWarga.forEach(lap => {
        // Gunakan properti 'wilayah' atau fallback ke 'kelurahan' jika data lama
        const area = lap.wilayah || lap.kelurahan || "-";
        L.circleMarker([lap.lat, lap.lng], {
            color: '#fff', weight: 1, fillColor: '#9c27b0', fillOpacity: 1, radius: 5
        }).addTo(map).bindPopup(`<b>👤 LAPORAN: ${lap.jenis}</b><br>Wilayah: ${area}<br><small>${lap.waktu}</small>`);
    });
}

// Fungsi Helper (Cuaca, Gempa, dll - Disingkat)
async function initWeather() { try { const r = await fetch("https://api.open-meteo.com/v1/forecast?latitude=1.68&longitude=101.45&current_weather=true&timezone=Asia%2FBangkok"); const d = await r.json(); document.getElementById('cuaca-suhu').innerText=d.current_weather.temperature+"°C"; document.getElementById('cuaca-desc').innerText=d.current_weather.weathercode>3?"Berawan":"Cerah"; } catch(e){ document.getElementById('cuaca-desc').innerText="-"; } }
async function initGempa() { const c = document.getElementById('list-gempa'); try { const r = await fetch('https://data.bmkg.go.id/DataMKG/TEWS/gempaterkini.json'); if(!r.ok) throw new Error(); const d = await r.json(); c.innerHTML=""; d.Infogempa.gempa.slice(0,3).forEach(g=>{ c.innerHTML+=`<div class="gempa-item"><span class="gempa-mag">${g.Magnitude}</span> ${g.Wilayah}<br><small>${g.Jam}</small></div>`; }); } catch(e){ c.innerHTML=`<div class="gempa-item"><span class="gempa-mag">5.0</span> Simulasi Gempa Laut <br><small>Baru saja</small></div>`; } }
function updateStatusSiaga() { document.getElementById('status-text').innerText="SIAGA 1"; document.getElementById('status-text').className="fw-bold fs-5 mb-1 text-danger"; document.getElementById('status-desc').innerText="Waspada Banjir Rob"; document.getElementById('notifikasi-jalan').innerText="⚠️ PERINGATAN DINI: Waspada Pasang Air Laut (ROB) di wilayah Dumai Kota dan Dumai Barat sore ini."; }
function updateJumlahLaporan() { const data = JSON.parse(localStorage.getItem("dataLaporan_SIGAP")) || []; document.getElementById("jml-laporan").innerText = data.length + " Laporan"; }