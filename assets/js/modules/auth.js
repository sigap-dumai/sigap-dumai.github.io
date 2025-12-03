document.getElementById('formLogin').addEventListener('submit', (e) => {
    e.preventDefault();
    const user = document.getElementById('username').value.toLowerCase().trim();
    const pass = document.getElementById('password').value;
    
    // Daftar User yang diizinkan
    const validUsers = ['kalaksa', 'sekre', 'operator'];
    const validPass = 'dumaisiaga';

    if (validUsers.includes(user) && pass === validPass) {
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("currentUser", user); // Simpan siapa yang login
        window.location.href = "admin.html";
    } else { 
        alert("Username atau Password Salah!\nPastikan Anda terdaftar (kalaksa/sekre/operator)."); 
    }
});