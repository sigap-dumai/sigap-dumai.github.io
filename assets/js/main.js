function getUser() {
    return JSON.parse(localStorage.getItem('user'));
}

document.getElementById('logout-btn').addEventListener('click', function () {
    localStorage.removeItem('user');
    window.location.href = "modules/login/login.html";
});

const user = getUser();
if (user) {
    document.getElementById('username').innerText = user.name;
}
