async function initSummaryCards() {
    try {
        const res = await fetch(
            "https://ecjolinpqjqnrmuwfbai.supabase.co/rest/v1/reports?select=jenis",
            {
                headers: {
                    apikey:
                        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjam9saW5wcWpxbnJtdXdmYmFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM4NzQwOTgsImV4cCI6MjA3OTQ1MDA5OH0.v0WIwHzxRcUke1UogmNOAcOfLd10nk6Fk9M-6K8t1IM"
                }
            }
        );

        const data = await res.json();

        const stats = {
            total: data.length,
            banjir: data.filter(x => x.jenis === "banjir").length,
            karhutla: data.filter(x => x.jenis === "karhutla").length,
            kebakaran: data.filter(x => x.jenis === "kebakaran").length,
            lainnya: data.filter(x => x.jenis === "lainnya").length
        };

        document.querySelector("#laporan-card .laporan-total").textContent =
            `${stats.total} laporan`;

        document.querySelector("#laporan-card .laporan-detail").textContent =
            `Banjir: ${stats.banjir} • Karhutla: ${stats.karhutla} • Lainnya: ${stats.lainnya}`;
    } catch (err) {
        console.warn("Gagal memuat statistik:", err);
    }
}
