// main.js - Handling Initialization and General Functions

document.addEventListener("DOMContentLoaded", () => {
    // Example for initializing localStorage or app state
    if (!localStorage.getItem('firstVisit')) {
        localStorage.setItem('firstVisit', 'true');
        console.log("First time visiting SiGap App!");
    }

    // Example function to check internet connection
    function checkConnectivity() {
        if (navigator.onLine) {
            console.log("You are online!");
        } else {
            console.log("You are offline, please check your connection.");
        }
    }

    // Periodic connectivity check
    setInterval(checkConnectivity, 10000); // every 10 seconds
});
