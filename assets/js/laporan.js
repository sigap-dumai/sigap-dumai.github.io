document.addEventListener("DOMContentLoaded", () => {
    initGPS();
    initForm();
});

// ======================================
// GPS
// ======================================
function initGPS() {
    const btn = document.getElementById("btn-gps");
    const lokasi = document.getElementById("lokasi");

    btn.addEventListener("click", () => {
        btn.textContent = "Mengambil lokasi…";

        navigator.geolocation.getCurrentPosition(
            pos => {
                lokasi.value = `${pos.coords.latitude.toFixed(6)}, ${pos.coords.longitude.toFixed(6)}`;
                btn.textContent = "Lokasi ditemukan ✔";
                btn.style.background = "#16a34a";
            },
            () => {
                alert("Gagal mengambil GPS. Isi lokasi secara manual.");
                btn.textContent = "Gunakan GPS";
            },
            { enableHighAccuracy: true }
        );
    });
}

// ======================================
// Submit Laporan ke API /api/reports
// ======================================
function initForm() {
    const form = document.getElementById("lapor-form");

    form.addEventListener("submit", async e => {
        e.preventDefault();

        const jenis = document.getElementById("jenis").value;
        const lokasi = document.getElementById("lokasi").value.trim();
        const deskripsi = document.getElementById("deskripsi").value.trim();

        if (!jenis || !lokasi || !deskripsi) {
            alert("Semua kolom wajib diisi.");
            return;
        }

        const payload = { jenis, lokasi, deskripsi };

        const res = await fetch("/api/reports", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            alert("Laporan berhasil dikirim!");
            form.reset();
        } else {
            alert("Gagal membuat laporan!");
        }
    });
}
