// Tunggu hingga DOM dimuat sepenuhnya sebelum menambahkan event listener
document.addEventListener('DOMContentLoaded', function () {

    // Login Handling
    if (document.getElementById('loginForm')) {
        document.getElementById('loginForm').addEventListener('submit', function (event) {
            event.preventDefault();

            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;

            // Mengambil data dari users.json
            fetch('/json/users.json')
                .then(response => response.json())
                .then(users => {
                    const user = users.find(user => user.username === username && user.password === password);

                    if (user) {
                        // Menyimpan pengguna yang berhasil login ke sessionStorage
                        sessionStorage.setItem('loggedInUser', JSON.stringify(user));
                        // Redirect ke dashboard berdasarkan role
                        window.location.href = '/modules/dashboard/dashboard.html';
                    } else {
                        document.getElementById('error-message').style.display = 'block';
                    }
                })
                .catch(err => console.error('Error:', err));
        });
    }

    // Menyesuaikan konten dashboard berdasarkan role saat halaman dashboard dimuat
    if (window.location.pathname.includes('/modules/dashboard/dashboard.html')) {
        window.onload = function () {
            // Mengambil data pengguna yang login (dari sessionStorage)
            const user = JSON.parse(sessionStorage.getItem('loggedInUser'));

            if (!user) {
                // Jika tidak ada pengguna yang login, alihkan ke halaman login
                window.location.href = '/modules/login/login.html';
            }

            // Menyapa pengguna berdasarkan role
            document.getElementById('user-welcome').innerText = `Selamat datang, ${user.name}`;

            // Menambahkan notifikasi sesuai dengan role
            let notifications = [];
            switch (user.role) {
                case 'kalaksa':
                    notifications = [
                        "Ada laporan bencana terbaru yang membutuhkan perhatian Anda.",
                        "Pastikan kebijakan terbaru segera diterapkan di wilayah yang terdampak."
                    ];
                    break;
                case 'sekre':
                    notifications = [
                        "Dokumen administratif untuk pengarsipan harus segera diselesaikan.",
                        "Periksa laporan mingguan untuk pengajuan dokumen penting."
                    ];
                    break;
                case 'operator':
                    notifications = [
                        "Laporan darurat baru masuk. Segera verifikasi data."
                    ];
                    break;
                case 'admin_kecamatan':
                    notifications = [
                        "Pastikan laporan kelurahan terbaru sudah diverifikasi.",
                        "Data kecamatan harus diperbarui setiap bulan."
                    ];
                    break;
                case 'admin_kelurahan':
                    notifications = [
                        "Laporkan data terbaru dari kelurahan Anda.",
                        "Cek status laporan yang sudah diterima."
                    ];
                    break;
                default:
                    notifications = ["Tidak ada notifikasi baru."];
                    break;
            }

            // Menyimpan notifikasi di sessionStorage
            sessionStorage.setItem('notifications', JSON.stringify(notifications));

            // Tampilkan notifikasi
            displayNotifications(notifications);
        };
    }

    // Menampilkan notifikasi
    function displayNotifications(notifications) {
        const notificationContainer = document.getElementById('notification-container');
        if (!notificationContainer) {
            console.error('Notification container tidak ditemukan.');
            return;
        }
        notifications.forEach(notification => {
            const notificationElement = document.createElement('div');
            notificationElement.className = 'notification';
            notificationElement.innerHTML = `
                <p>${notification}</p>
                <button class="dismiss-btn" onclick="dismissNotification(this)">Tutup</button>
            `;
            notificationContainer.appendChild(notificationElement);
        });
    }

    // Menutup notifikasi
    window.dismissNotification = function (button) {
        button.parentElement.remove();
    };
});
