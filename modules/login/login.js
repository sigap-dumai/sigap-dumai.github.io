document.getElementById('login-form').addEventListener('submit', function(event) {
    event.preventDefault();
    let username = document.getElementById('username').value;
    let password = document.getElementById('password').value;

    fetch('../../json/users.json')
        .then(response => response.json())
        .then(users => {
            let user = users.find(u => u.username === username && u.password === password);
            if (user) {
                localStorage.setItem('user', JSON.stringify(user));
                window.location.href = "../../modules/dashboard/dashboard.html";
            } else {
                alert('Username atau password salah!');
            }
        });
});