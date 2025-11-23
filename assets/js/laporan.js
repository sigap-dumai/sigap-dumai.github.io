// /assets/js/laporan.js

document.addEventListener("DOMContentLoaded", () => {
    initGPS();
    initForm();
});

// ============================================
// GPS: isi input lokasi dengan "lat, lon"
// ============================================
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

// ============================================
// Submit laporan ke /api/reports
// ============================================
function initForm() {
    const form = document.getElementById("lapor-form");
    if (!form) return;

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const jenis = document.getElementById("jenis").value;
        const lokasi = document.getElementById("lokasi").value.trim();
        const deskripsi = document.getElementById("deskripsi").value.trim();

        if (!jenis || !lokasi || !deskripsi) {
            alert("Semua kolom wajib diisi.");
            return;
        }

        const payload = { jenis, lokasi, deskripsi };

        try {
            const res = await fetch("/api/reports", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                alert("Laporan berhasil dikirim!");
                form.reset();
            } else {
                const err = await res.json().catch(() => ({}));
                console.error("Respon gagal:", err);
                alert("Gagal membuat laporan!");
            }
        } catch (err) {
            console.error("Error fetch /api/reports:", err);
            alert("Terjadi kesalahan jaringan saat mengirim laporan.");
        }
    });
}
