// /assets/js/laporan.js
// Versi tanpa backend, semua laporan disimpan di localStorage

document.addEventListener("DOMContentLoaded", () => {
    initGPS();
    initForm();
});

// -------------------------------------------------
// GPS: mengisi input lokasi dengan "lat, lon"
// -------------------------------------------------
function initGPS() {
    const btn = document.getElementById("btn-gps");
    const lokasi = document.getElementById("lokasi");
    if (!btn || !lokasi) return;

    btn.addEventListener("click", () => {
        btn.textContent = "Mengambil lokasi…";

        if (!navigator.geolocation) {
            alert("Perangkat tidak mendukung GPS. Isi lokasi manual.");
            btn.textContent = "Gunakan GPS";
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const lat = pos.coords.latitude.toFixed(6);
                const lon = pos.coords.longitude.toFixed(6);
                lokasi.value = `${lat}, ${lon}`;
                btn.textContent = "Lokasi ditemukan ✔";
                btn.style.background = "#16a34a";
            },
            () => {
                alert("Gagal mengambil koordinat. Isi lokasi manual.");
                btn.textContent = "Gunakan GPS";
            },
            { enableHighAccuracy: true }
        );
    });
}

// -------------------------------------------------
// Helper: ambil & simpan laporan di localStorage
// -------------------------------------------------
function getStoredReports() {
    try {
        const raw = localStorage.getItem("sigap_laporan");
        if (!raw) return [];
        return JSON.parse(raw);
    } catch {
        return [];
    }
}

function saveStoredReports(list) {
    localStorage.setItem("sigap_laporan", JSON.stringify(list));
}

// -------------------------------------------------
// Form submit → simpan ke localStorage
// -------------------------------------------------
function initForm() {
    const form = document.getElementById("lapor-form");
    if (!form) return;

    form.addEventListener("submit", (e) => {
        e.preventDefault();

        const jenis = document.getElementById("jenis").value;
        const lokasi = document.getElementById("lokasi").value.trim();
        const deskripsi = document.getElementById("deskripsi").value.trim();

        if (!jenis || !lokasi || !deskripsi) {
            alert("Semua kolom wajib diisi.");
            return;
        }

        const reports = getStoredReports();
        reports.push({
            id: Date.now(),
            jenis,
            lokasi,
            deskripsi,
            waktu: new Date().toISOString()
        });
        saveStoredReports(reports);

        alert("Laporan tersimpan di perangkat ini (demo).");
        form.reset();
    });
}
