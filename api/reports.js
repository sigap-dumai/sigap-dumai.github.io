// /api/reports.js

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        const { jenis, lokasi, deskripsi } = req.body || {};

        if (!jenis || !lokasi || !deskripsi) {
            return res.status(400).json({ error: "Data tidak lengkap" });
        }

        const GH_TOKEN = process.env.GH_TOKEN;
        const GH_USER = process.env.GH_USER;
        const GH_REPO = process.env.GH_REPO;

        if (!GH_TOKEN || !GH_USER || !GH_REPO) {
            console.error("Environment GH_TOKEN/GH_USER/GH_REPO belum di-set");
            return res.status(500).json({ error: "Server belum dikonfigurasi" });
        }

        const fileUrl = `https://api.github.com/repos/${GH_USER}/${GH_REPO}/contents/data/laporan.json`;

        // 1) Ambil isi dan SHA file laporan.json saat ini
        let currentItems = [];
        let currentSha = null;

        const getRes = await fetch(fileUrl, {
            headers: {
                Authorization: `Bearer ${GH_TOKEN}`,
                Accept: "application/vnd.github+json"
            }
        });

        if (getRes.status === 200) {
            const meta = await getRes.json();
            currentSha = meta.sha;

            if (meta.content) {
                const decoded = Buffer.from(meta.content, "base64").toString("utf-8");
                try {
                    currentItems = JSON.parse(decoded) || [];
                } catch (e) {
                    console.warn("laporan.json tidak valid, akan diinisialisasi ulang");
                    currentItems = [];
                }
            }
        } else if (getRes.status === 404) {
            // file belum ada → akan dibuat baru
            currentItems = [];
        } else {
            const txt = await getRes.text();
            console.error("Gagal GET laporan.json:", getRes.status, txt);
            return res.status(500).json({ error: "Gagal membaca laporan.json" });
        }

        // 2) Tambah item baru
        const newItem = {
            jenis,
            lokasi,
            deskripsi,
            waktu: new Date().toISOString()
        };
        const updated = [...currentItems, newItem];

        const newContentBase64 = Buffer
            .from(JSON.stringify(updated, null, 2), "utf-8")
            .toString("base64");

        // 3) Push ke GitHub
        const body = {
            message: "Update laporan.json (tambah laporan baru)",
            content: newContentBase64
        };
        if (currentSha) body.sha = currentSha;

        const putRes = await fetch(fileUrl, {
            method: "PUT",
            headers: {
                Authorization: `Bearer ${GH_TOKEN}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(body)
        });

        if (!putRes.ok) {
            const txt = await putRes.text();
            console.error("Gagal PUT laporan.json:", putRes.status, txt);
            return res.status(500).json({ error: "Gagal menyimpan laporan" });
        }

        return res.status(200).json({ success: true });

    } catch (err) {
        console.error("Error /api/reports:", err);
        return res.status(500).json({ error: "Server error" });
    }
}
