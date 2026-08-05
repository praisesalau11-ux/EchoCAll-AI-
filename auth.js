// ===============================
// EchoCall AI - auth.js
// Firebase Authentication
// ===============================

import { showToast } from "./toast.js";

import {
    auth,
    googleProvider
} from "./firebase.js";

import {
    signInWithPopup,
    signInWithRedirect,
    getRedirectResult
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

// Google Button
const googleBtn = document.getElementById("googleSignIn");

// Redirect after successful login
function goHome() {
    window.location.href = "home.html";
}

// Show message
function showMessage(message, type = "success") {
    showToast(message, type);
}

// Mobile-friendly Google Sign-In
if (googleBtn) {

    googleBtn.addEventListener("click", async () => {

        try {

            // Use Redirect (recommended for mobile)
            await signInWithRedirect(auth, googleProvider);

        } catch (error) {

            console.error(error);

            showMessage(error.message, "error");

        }

    });

}

// Handle Redirect Result
getRedirectResult(auth)

.then((result) => {

    if (result && result.user) {

        console.log("Welcome:", result.user.displayName);

        showMessage(
    "Welcome " + result.user.displayName + "!",
    "success"
);

        goHome();

    }

})

.catch((error) => {

    console.error(error);

});