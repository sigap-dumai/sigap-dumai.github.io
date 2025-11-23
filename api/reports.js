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
        const { jenis, lokasi, deskripsi, foto } = req.body;

        if (!jenis || !lokasi || !deskripsi) {
            return res.status(400).json({ error: "Data tidak lengkap" });
        }

        let foto_url = null;

        // Upload foto (base64 → Supabase Storage)
        if (foto) {
            const base64 = foto.split("base64,")[1];
            const buffer = Buffer.from(base64, "base64");
            const fileName = `laporan-${Date.now()}.jpg`;

            const { error: uploadError } = await supabase.storage
                .from("laporan-foto")
                .upload(fileName, buffer, {
                    contentType: "image/jpeg"
                });

            if (!uploadError) {
                foto_url =
                    `${process.env.SUPABASE_URL}/storage/v1/object/public/laporan-foto/${fileName}`;
            }
        }

        // Simpan ke tabel reports
        const { error } = await supabase
            .from("reports")
            .insert({
                jenis,
                lokasi,
                deskripsi,
                foto_url
            });

        if (error) {
            console.error(error);
            return res.status(500).json({ error: "Gagal menyimpan data" });
        }

        return res.status(200).json({
            success: true,
            message: "Laporan berhasil dikirim!"
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Server error" });
    }
}
