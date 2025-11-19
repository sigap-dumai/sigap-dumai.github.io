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
        localStorage.setItem('loggedIn', 'true');  // Menyimpan status login
        localStorage.setItem('username', username);  // Menyimpan username
        localStorage.setItem('role', user.role);  // Menyimpan role pengguna
        window.location.href = '../../index.html'; // Redirect ke halaman utama
      } else {
        document.getElementById('login-error').style.display = 'block'; // Tampilkan error
      }
    })
    .catch(err => console.error('Error fetching users:', err));
});
