// ==========================================
// EchoCall AI - login.js (Part 1)
// Imports + Google Login + Password Toggle
// ==========================================

import {
    auth,
    googleProvider
} from "./firebase.js";

import {
    signInWithEmailAndPassword,
    signInWithRedirect,
    getRedirectResult,
    sendPasswordResetEmail,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import { showToast } from "./toast.js";

// =============================
// DOM Elements
// =============================

const loginForm = document.getElementById("loginForm");

const email = document.getElementById("email");

const password = document.getElementById("password");

const togglePassword =
    document.getElementById("togglePassword");

const googleLogin =
    document.getElementById("googleLogin");

const forgotPassword =
    document.getElementById("forgotPassword");

// =============================
// Password Visibility
// =============================

togglePassword.addEventListener("click", () => {

    if (password.type === "password") {

        password.type = "text";

        togglePassword.innerHTML =
        `<span class="material-symbols-rounded">
        visibility_off
        </span>`;

    } else {

        password.type = "password";

        togglePassword.innerHTML =
        `<span class="material-symbols-rounded">
        visibility
        </span>`;

    }

});

// =============================
// Google Login
// =============================

googleLogin.addEventListener("click", async (e) => {

    e.preventDefault();

    try {

        await signInWithRedirect(

            auth,

            googleProvider

        );

    }

    catch (error) {

        console.error(error);

        showToast(

            error.message,

            "error"

        );

    }

});

// =============================
// Google Redirect Result
// =============================

getRedirectResult(auth)

.then((result) => {

    if (result && result.user) {

        showToast(

            "Welcome " +

            result.user.displayName,

            "success"

        );

        setTimeout(() => {

            window.location.href =
            "app.html";

        }, 1200);

    }

})

.catch((error) => {

    console.error(error);

});

// ==========================================
// Part 2 starts below this line.
// ==========================================
// ==========================================
// EchoCall AI - login.js (Part 2)
// Append below Part 1
// ==========================================

// =============================
// Email & Password Login
// =============================

loginForm.addEventListener("submit", async (e) => {

    e.preventDefault();

    try {

        const userCredential =
            await signInWithEmailAndPassword(

                auth,

                email.value.trim(),

                password.value

            );

        showToast(

            "Login successful!",

            "success"

        );

        setTimeout(() => {

            window.location.href =
            "app.html";

        }, 1200);

    }

    catch (error) {

        console.error(error);

        let message = "Login failed.";

        switch (error.code) {

            case "auth/invalid-credential":

                message =
                "Incorrect email or password.";

                break;

            case "auth/user-not-found":

                message =
                "No account found.";

                break;

            case "auth/wrong-password":

                message =
                "Incorrect password.";

                break;

            case "auth/invalid-email":

                message =
                "Invalid email address.";

                break;

            case "auth/too-many-requests":

                message =
                "Too many attempts. Try again later.";

                break;

            case "auth/network-request-failed":

                message =
                "No internet connection.";

                break;

            default:

                message = error.message;

        }

        showToast(

            message,

            "error"

        );

    }

});

// =============================
// Forgot Password
// =============================

forgotPassword.addEventListener("click", async (e) => {

    e.preventDefault();

    if (email.value.trim() === "") {

        showToast(

            "Enter your email first.",

            "warning"

        );

        email.focus();

        return;

    }

    try {

        await sendPasswordResetEmail(

            auth,

            email.value.trim()

        );

        showToast(

            "Password reset email sent.",

            "success"

        );

    }

    catch (error) {

        console.error(error);

        let message = error.message;

        switch (error.code) {

            case "auth/user-not-found":

                message =
                "No account exists with this email.";

                break;

            case "auth/invalid-email":

                message =
                "Invalid email address.";

                break;

        }

        showToast(

            message,

            "error"

        );

    }

});

// =============================
// Already Logged In
// =============================

onAuthStateChanged(auth, (user) => {

    if (user) {

        console.log("Logged in:", user.email);

        // Optional:
        // window.location.href = "home.html";

    }

});