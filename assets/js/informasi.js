document.addEventListener("DOMContentLoaded", () => {
    // Menangani klik pada kontak darurat
    const kontakItems = document.querySelectorAll('.kontak-item a');
    kontakItems.forEach(item => {
        item.addEventListener('click', () => {
            const contactName = item.textContent;
            alert(`Memanggil ${contactName}...`);
            window.location.href = `tel:${item.getAttribute('href').replace('tel:', '')}`;  // Panggil nomor telepon
        });
    });

    // Menangani klik pada SOP
    const sopItems = document.querySelectorAll('.sop-item a');
    sopItems.forEach(item => {
        item.addEventListener('click', () => {
            const sopName = item.textContent;
            alert(`Membuka SOP: ${sopName}`);
            window.location.href = `/sop/${sopName.toLowerCase()}.html`;  // Navigasi ke halaman SOP terkait
        });
    });
});
