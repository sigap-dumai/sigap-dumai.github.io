import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method Not Allowed" });
    }

    try {
        const { jenis, lokasi, deskripsi } = req.body;

        if (!jenis || !lokasi || !deskripsi) {
            return res.status(400).json({ error: "Data tidak lengkap" });
        }

        const { error } = await supabase
            .from("reports")
            .insert({ jenis, lokasi, deskripsi });

        if (error) {
            console.error(error);
            return res.status(500).json({ error: "Supabase insert gagal" });
        }

        return res.status(200).json({
            success: true,
            message: "Laporan berhasil disimpan!"
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Server error" });
    }
}
