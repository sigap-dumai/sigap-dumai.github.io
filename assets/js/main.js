import { mapModule } from './modules/mapModule.js';
import { statistikModule } from './modules/statistikModule.js';
import { laporanModule } from './modules/laporanModule.js';
import { authModule } from './modules/authModule.js';
import { uiModule } from './modules/uiModule.js';
import { weatherMapModule } from './modules/weatherMapModule.js';
import { karhutlaMapModule } from './modules/karhutlaMapModule.js';
import { earthquakeMapModule } from './modules/earthquakeMapModule.js';

// Inisialisasi Peta
const map = mapModule.initializeMap();

// Load Data GeoJSON untuk bencana
mapModule.loadBencanaData(map);

// Tambahkan Peta Cuaca
weatherMapModule.loadWeatherMap(map);

// Tambahkan Peta Hotspot Karhutla
karhutlaMapModule.loadKarhutlaMap(map);

// Tambahkan Peta Gempa Bumi
earthquakeMapModule.loadEarthquakeMap(map);

// Update Statistik
statistikModule.fetchAndUpdateStatistik();

// Login
authModule.checkLoginStatus();

document.getElementById('login-btn').addEventListener('click', () => {
  uiModule.showLoginForm();  // Menampilkan form login
});

document.getElementById('login-form-inner').addEventListener('submit', (e) => {
  e.preventDefault();
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  authModule.login(username, password);
  uiModule.hideLoginForm();  // Sembunyikan form login setelah login berhasil
  uiModule.showDashboard();  // Tampilkan dashboard setelah login
});

document.getElementById('logout-btn').addEventListener('click', () => {
  authModule.logout();
  uiModule.showLoginForm();  // Tampilkan form login lagi
});