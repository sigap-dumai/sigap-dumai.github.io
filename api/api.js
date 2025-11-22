// api.js - Menangani Permintaan API untuk Aplikasi SiGap

// Fungsi untuk mengambil data dari API (misalnya, untuk status bencana atau laporan)
async function fetchData(endpoint) {
    try {
        const response = await fetch(endpoint);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching data:', error);
        return null;
    }
}

// Fungsi untuk mengirim laporan ke server
async function sendReport(reportData) {
    try {
        const response = await fetch('/api/reports', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(reportData),
        });

        if (!response.ok) {
            throw new Error('Failed to send report');
        }

        const result = await response.json();
        console.log('Report sent successfully:', result);
        return result;
    } catch (error) {
        console.error('Error sending report:', error);
        return null;
    }
}

// Fungsi untuk mengupdate status siaga atau data lainnya (contoh)
async function updateStatus(statusData) {
    try {
        const response = await fetch('/api/status', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(statusData),
        });

        if (!response.ok) {
            throw new Error('Failed to update status');
        }

        const result = await response.json();
        console.log('Status updated successfully:', result);
        return result;
    } catch (error) {
        console.error('Error updating status:', error);
        return null;
    }
}

// Menyediakan API untuk digunakan di file lain
export { fetchData, sendReport, updateStatus };
