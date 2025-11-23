/* ============================================================
   LAPORAN.JS – LOGIKA FORM LAPORAN WARGA (GPS FIXED)
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {
    initGPS();
    initFotoPreview();
    initForm();
});

/* ------------------------------------------------------------
   GPS Handler – VERSI FIXED
   ------------------------------------------------------------ */
function initGPS() {
    const btn = document.getElementById("btn-gps");
    const lokasiInput = document.getElementById("lokasi");

    btn.addEventListener("click", () => {
        btn.textContent = "Mengambil lokasi…";

        if (!navigator.geolocation) {
            alert("Browser Anda tidak mendukung GPS.");
            btn.textContent = "Gunakan GPS";
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const lat = pos.coords.latitude;
                const lon = pos.coords.longitude;

                lokasiInput.value = `${lat.toFixed(6)}, ${lon.toFixed(6)}`;

                btn.textContent = "Lokasi ditemukan ✔";
                btn.style.background = "#16a34a";
            },
            (err) => {
                console.error("GPS error:", err);

                if (err.code === err.PERMISSION_DENIED) {
                    alert("Izin lokasi ditolak. Aktifkan GPS untuk situs ini.");
                } else if (err.code === err.POSITION_UNAVAILABLE) {
                    alert("Lokasi tidak tersedia. Coba aktifkan GPS.");
                } else if (err.code === err.TIMEOUT) {
                    alert("Timeout. Coba lagi.");
                }

                btn.textContent = "Gunakan GPS";
            },
            {
                enableHighAccuracy: true,
                timeout: 12000,
                maximumAge: 0
            }
        );
    });
}

/* ------------------------------------------------------------
   Foto Preview
   ------------------------------------------------------------ */
function initFotoPreview() {
    const fotoInput = document.getElementById("foto");
    const preview = document.getElementById("foto-preview");

    fotoInput.addEventListener("change", () => {
        const file = fotoInput.files[0];
        if (!file) {
            preview.innerHTML = "";
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            preview.innerHTML = `<img src="${reader.result}" alt="Foto laporan" />`;
        };
        reader.readAsDataURL(file);
    });
}

/* ------------------------------------------------------------
   Submit Form
   ------------------------------------------------------------ */
function initForm() {
    const form = document.getElementById("lapor-form");

    form.addEventListener("submit", (e) => {
        e.preventDefault();

        const jenis = document.getElementById("jenis").value;
        const lokasi = document.getElementById("lokasi").value.trim();
        const deskripsi = document.getElementById("deskripsi").value.trim();

        if (!jenis || !lokasi || !deskripsi) {
            alert("Mohon isi semua kolom.");
            return;
        }

        alert("Laporan berhasil dikirim!\n(Siap disambungkan ke backend /api/reports)");
        form.reset();
        document.getElementById("foto-preview").innerHTML = "";
    });
}
