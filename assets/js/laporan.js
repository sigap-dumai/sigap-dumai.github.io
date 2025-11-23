document.addEventListener("DOMContentLoaded", () => {
    initGPS();
    initFotoPreview();
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
                const lat = pos.coords.latitude.toFixed(6);
                const lon = pos.coords.longitude.toFixed(6);
                lokasi.value = `${lat}, ${lon}`;
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

// Foto preview
function initFotoPreview() {
    const fotoInput = document.getElementById("foto");
    const preview = document.getElementById("foto-preview");

    fotoInput.addEventListener("change", () => {
        const file = fotoInput.files[0];
        if (!file) return (preview.innerHTML = "");

        const reader = new FileReader();
        reader.onload = () => {
            preview.innerHTML = `<img src="${reader.result}" />`;
        };
        reader.readAsDataURL(file);
    });
}

// Form submit → API
function initForm() {
    const form = document.getElementById("lapor-form");

    form.addEventListener("submit", async e => {
        e.preventDefault();

        const jenis = document.getElementById("jenis").value;
        const lokasi = document.getElementById("lokasi").value.trim();
        const deskripsi = document.getElementById("deskripsi").value.trim();
        const fotoFile = document.getElementById("foto").files[0];

        if (!jenis || !lokasi || !deskripsi) {
            alert("Mohon isi semua kolom.");
            return;
        }

        let fotoBase64 = null;
        if (fotoFile) fotoBase64 = await toBase64(fotoFile);

        const payload = { jenis, lokasi, deskripsi, foto: fotoBase64 };

        const res = await fetch("/api/reports", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            alert("Laporan berhasil dikirim!");
            form.reset();
            document.getElementById("foto-preview").innerHTML = "";
        } else {
            alert("Gagal mengirim laporan.");
        }
    });
}

function toBase64(file) {
    return new Promise(resolve => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.readAsDataURL(file);
    });
}
