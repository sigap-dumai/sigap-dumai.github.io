document.getElementById('login-form').addEventListener('submit', function(e) {
  e.preventDefault();

  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  // Ambil data pengguna dari users.json
  fetch('../../json/users.json')
    .then(response => response.json())
    .then(users => {
      const user = users.find(user => user.username === username && user.password === password);

      if (user) {
        // Simpan nama user dan role ke localStorage
        localStorage.setItem('loggedInUser', user.username);
        localStorage.setItem('userRole', user.role);  // Menyimpan role user

        // Cek peran pengguna dan arahkan ke halaman yang sesuai
        if (user.role === 'admin_kecamatan' || user.role.includes('admin')) {
          // Jika pengguna adalah admin, arahkan ke admin-reports
          window.location.href = '/modules/admin-reports/admin-reports.html';
        } else {
          // Jika pengguna biasa, arahkan ke report
          window.location.href = '/modules/report/report.html';
        }
      } else {
        // Tampilkan pesan error jika login gagal
        alert('Username atau password salah!');
      }
    })
    .catch(error => {
      console.error('Terjadi kesalahan:', error);
      alert('Terjadi kesalahan dalam memproses login!');
    });
});
