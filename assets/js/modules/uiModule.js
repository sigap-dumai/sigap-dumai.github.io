// uiModule.js
export const uiModule = {
  showLoginForm: function () {
    document.getElementById('login-form').classList.remove('hidden');
    document.getElementById('map').classList.add('hidden');
    document.getElementById('statistik').classList.add('hidden');
    document.getElementById('laporan-form').classList.add('hidden');
  },

  hideLoginForm: function () {
    document.getElementById('login-form').classList.add('hidden');
    document.getElementById('map').classList.remove('hidden');
    document.getElementById('statistik').classList.remove('hidden');
    document.getElementById('laporan-form').classList.add('hidden');
  },

  showDashboard: function () {
    document.getElementById('dashboard').classList.remove('hidden');
    document.getElementById('map').classList.remove('hidden');
    document.getElementById('statistik').classList.remove('hidden');
    document.getElementById('laporan-form').classList.add('hidden');
  },

  showLaporanForm: function () {
    document.getElementById('laporan-form').classList.remove('hidden');
  }
};