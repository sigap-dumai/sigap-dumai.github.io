// modules/login/login.js
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
        // Redirect ke halaman dashboard jika login berhasil
        window.location.href = '/modules/dashboard/dashboard.html'; // Ganti dengan path dashboard yang sesuai
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
