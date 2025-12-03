// assets/js/firebase-config.js

// Konfigurasi Firebase Anda (disesuaikan ke format CDN Global v8)
const firebaseConfig = {
    apiKey: "AIzaSyAPR3ExIZ9ldRbNN_nGQpnEwQl1uae1m80",
    authDomain: "sigap-dumai.firebaseapp.com",
    projectId: "sigap-dumai",
    storageBucket: "sigap-dumai.firebasestorage.app",
    messagingSenderId: "443399194204",
    appId: "1:443399194204:web:21c64355737f47e4304899"
    // measurementId: "G-R7PD1NV4CD" // Tidak diperlukan di versi ini
};

// Inisialisasi Firebase
// Note: Objek 'firebase' sudah tersedia karena kita memuat library di HTML
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

// Definisikan variabel database Firestore
const db = firebase.firestore(); 

// PENTING: Karena kita menggunakan Firestore (database) tanpa Firebase Auth (login user),
// pastikan aturan keamanan (security rules) Firestore Anda di set seperti ini:
/*
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /reports/{reportId} {
      allow read: if true;         // Siapapun bisa baca data laporan
      allow write: if true;        // Siapapun bisa kirim laporan (untuk publik)
    }
  }
}
*/