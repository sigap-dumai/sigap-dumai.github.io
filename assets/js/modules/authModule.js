// authModule.js
export const authModule = {
  checkLoginStatus: function () {
    const user = localStorage.getItem('user');
    if (user) {
      document.getElementById('user-name').textContent = `Welcome, ${user}`;
      document.getElementById('login-btn').classList.add('hidden');
      document.getElementById('logout-btn').classList.remove('hidden');
    } else {
      document.getElementById('user-name').textContent = '';
      document.getElementById('login-btn').classList.remove('hidden');
      document.getElementById('logout-btn').classList.add('hidden');
    }
  },

  login: function (username, password) {
    fetch('/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    })
    .then(response => response.json())
    .then(data => {
      if (data.message === 'Login berhasil') {
        localStorage.setItem('user', username);
        this.checkLoginStatus();
        document.getElementById('login-form').classList.add('hidden');
      } else {
        alert(data.message); // Menampilkan pesan kesalahan
      }
    })
    .catch(error => {
      console.error('Error:', error);
      alert('Terjadi kesalahan pada server');
    });
  },

  logout: function () {
    localStorage.removeItem('user');
    this.checkLoginStatus();
  },

  showLoginForm: function () {
    document.getElementById('login-form').classList.remove('hidden');
  },

  hideLoginForm: function () {
    document.getElementById('login-form').classList.add('hidden');
  }
};
