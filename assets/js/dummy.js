
// Function to display notification message
function showNotification() {
    const notifMessage = document.getElementById('notif-message');
    notifMessage.innerHTML = 'Peringatan: Terjadi gempa bumi di Dumai!';
}

// Function to send report and display it on the dashboard
function sendReport() {
    const jenis = document.getElementById('jenis').value;
    const lokasi = document.getElementById('lokasi').value;
    const deskripsi = document.getElementById('deskripsi').value;

    // Create a new report object
    const reportData = {
        jenis,
        lokasi,
        deskripsi
    };

    // Simulate sending report (add to localStorage and the reports array)
    let storedReports = JSON.parse(localStorage.getItem('reports')) || [];
    storedReports.push(reportData);
    localStorage.setItem('reports', JSON.stringify(storedReports));

    // Log the report to console
    console.log('Laporan dikirim:', reportData);

    // Display success alert
    alert('Laporan berhasil dikirim!');

    // Update the dashboard with the new report
    updateReportList();
}

// Function to update the report list displayed on the dashboard
function updateReportList() {
    const reportList = document.getElementById('report-list');
    reportList.innerHTML = '';  // Clear the existing list

    // Retrieve reports from localStorage
    const storedReports = JSON.parse(localStorage.getItem('reports')) || [];

    // Loop through all reports and add them to the list
    storedReports.forEach((report, index) => {
        const reportItem = document.createElement('div');
        reportItem.classList.add('report-item');
        reportItem.innerHTML = `
            <strong>Jenis Bencana:</strong> ${report.jenis} <br>
            <strong>Lokasi:</strong> ${report.lokasi} <br>
            <strong>Deskripsi:</strong> ${report.deskripsi}
        `;
        reportList.appendChild(reportItem);
    });
}

// Ensure that reports are displayed on page load
document.addEventListener('DOMContentLoaded', updateReportList);
