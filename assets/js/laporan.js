document.addEventListener("DOMContentLoaded", () => {
    initGPS();
    initForm();
});

// GPS
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
            err => {
                alert("Tidak bisa mengambil GPS.");
                btn.textContent = "Gunakan GPS";
            },
            { enableHighAccuracy: true }
        );
    });
}

// Submit laporan
function initForm() {
    const form = document.getElementById("lapor-form");

    form.addEventListener("submit", async e => {
        e.preventDefault();

        const jenis = document.getElementById("jenis").value;
        const lokasi = document.getElementById("lokasi").value.trim();
        const deskripsi = document.getElementById("deskripsi").value.trim();

        if (!jenis || !lokasi || !deskripsi) {
            alert("Mohon isi semua kolom.");
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
            alert("Gagal mengirim laporan.");
        }
    });
}
