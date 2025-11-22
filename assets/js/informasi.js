// informasi.js - Handling Contact and SOP Information

document.addEventListener("DOMContentLoaded", () => {
    // Contact List Click Event
    const kontakItems = document.querySelectorAll('.kontak-item a');
    kontakItems.forEach(item => {
        item.addEventListener('click', () => {
            const contactName = item.textContent;
            alert(`Memanggil ${contactName}...`);
            window.location.href = `tel:${item.getAttribute('href').replace('tel:', '')}`;
        });
    });

    // SOP List Navigation
    const sopItems = document.querySelectorAll('.sop-item a');
    sopItems.forEach(item => {
        item.addEventListener('click', () => {
            const sopName = item.textContent;
            alert(`Membuka SOP: ${sopName}`);
            window.location.href = `/sop/${sopName.toLowerCase()}.html`;  // Navigate to the respective SOP page
        });
    });
});
