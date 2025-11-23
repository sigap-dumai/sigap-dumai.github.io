import fetch from "node-fetch";

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        const { jenis, lokasi, deskripsi } = req.body;

        if (!jenis || !lokasi || !deskripsi) {
            return res.status(400).json({ error: "Data tidak lengkap" });
        }

        const token = process.env.GH_TOKEN;
        const repo = process.env.GH_REPO;
        const user = process.env.GH_USER;

        const fileUrl = `https://api.github.com/repos/${user}/${repo}/contents/data/laporan.json`;

        // 1. Ambil versi terakhir laporan.json
        const currentRes = await fetch(fileUrl, {
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/vnd.github.raw"
            }
        });

        const currentJson = await currentRes.json();

        const updated = [
            ...currentJson,
            {
                jenis,
                lokasi,
                deskripsi,
                waktu: new Date().toISOString()
            }
        ];

        const newContent = Buffer.from(JSON.stringify(updated, null, 2)).toString("base64");

        // 2. Ambil SHA file terakhir
        const metaRes = await fetch(fileUrl, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        const meta = await metaRes.json();

        // 3. Update file di GitHub
        const updateRes = await fetch(fileUrl, {
            method: "PUT",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                message: "Update laporan.json",
                content: newContent,
                sha: meta.sha
            })
        });

        if (!updateRes.ok) {
            const err = await updateRes.text();
            console.error(err);
            return res.status(500).json({ error: "Gagal update laporan.json" });
        }

        return res.status(200).json({ success: true });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Server error" });
    }
}
