document.getElementById('loginForm').addEventListener('submit', function (event) {
    event.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // Mengambil data dari users.json
    fetch('/json/users.json')
        .then(response => response.json())
        .then(users => {
            // Mencari pengguna yang sesuai dengan username dan password
            const user = users.find(user => user.username === username && user.password === password);

            if (user) {
                // Jika login berhasil, cek role dan arahkan pengguna ke halaman yang sesuai
                switch(user.role) {
                    case 'kalaksa':
                        window.location.href = '/modules/dashboard/dashboard.html'; // Halaman Kepala Pelaksana
                        break;
                    case 'sekre':
                        window.location.href = '/modules/dashboard/dashboard.html'; // Halaman Sekretaris
                        break;
                    case 'operator':
                        window.location.href = '/modules/dashboard/dashboard.html'; // Halaman Operator BPBD
                        break;
                    case 'admin_kecamatan':
                        window.location.href = '/modules/dashboard/dashboard.html'; // Halaman Admin Kecamatan
                        break;
                    case 'admin_kelurahan':
                        window.location.href = '/modules/dashboard/dashboard.html'; // Halaman Admin Kelurahan
                        break;
                    default:
                        window.location.href = '/modules/dashboard/dashboard.html'; // Halaman Default
                        break;
                }
            } else {
                // Jika login gagal, tampilkan pesan kesalahan
                document.getElementById('error-message').style.display = 'block';
            }
        })
        .catch(err => console.error('Error:', err));
});
