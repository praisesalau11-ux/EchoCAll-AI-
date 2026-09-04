// ==========================================
// EchoCall AI - login.js
// Google Login + Email Login + Password Reset
// ==========================================

import {
    auth,
    googleProvider
} from "./firebase.js";

import {
    signInWithEmailAndPassword,
    signInWithRedirect,
    getRedirectResult,
    sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import { showToast } from "./toast.js";

// ==========================================
// DOM Elements
// ==========================================

const loginForm =
    document.getElementById("loginForm");

const email =
    document.getElementById("email");

const password =
    document.getElementById("password");

const togglePassword =
    document.getElementById("togglePassword");

const googleLogin =
    document.getElementById("googleLogin");

const forgotPassword =
    document.getElementById("forgotPassword");


// ==========================================
// Password Visibility
// ==========================================

togglePassword?.addEventListener(
    "click",
    () => {

        if (password.type === "password") {

            password.type = "text";

            togglePassword.innerHTML = `
                <span class="material-symbols-rounded">
                    visibility_off
                </span>
            `;

        } else {

            password.type = "password";

            togglePassword.innerHTML = `
                <span class="material-symbols-rounded">
                    visibility
                </span>
            `;

        }

    }
);


// ==========================================
// GOOGLE LOGIN
// ==========================================

googleLogin?.addEventListener(
    "click",
    async (e) => {

        e.preventDefault();

        try {

            showToast(
                "Opening Google sign-in...",
                "success"
            );

            await signInWithRedirect(
                auth,
                googleProvider
            );

        }

        catch (error) {

            console.error(
                "Google login error:",
                error
            );

            showToast(
                getAuthErrorMessage(error),
                "error"
            );

        }

    }
);


// ==========================================
// GOOGLE REDIRECT RESULT
// ==========================================

async function handleGoogleRedirect() {

    try {

        const result =
            await getRedirectResult(auth);

        if (!result || !result.user) {

            return;
        }

        const user =
            result.user;

        console.log(
            "Google login successful:",
            user.uid
        );

        showToast(
            `Welcome ${user.displayName || "back"}!`,
            "success"
        );

        // Give Firebase Auth a moment to finish
        // updating the persistent authentication state.

        setTimeout(
            () => {

                window.location.replace(
                    "app.html"
                );

            },
            500
        );

    }

    catch (error) {

        console.error(
            "Google redirect error:",
            error
        );

        showToast(
            getAuthErrorMessage(error),
            "error"
        );

    }

}


// ==========================================
// Run Google Redirect Handler
// ==========================================

handleGoogleRedirect();


// ==========================================
// EMAIL + PASSWORD LOGIN
// ==========================================

loginForm?.addEventListener(
    "submit",
    async (e) => {

        e.preventDefault();

        const emailValue =
            email.value.trim();

        const passwordValue =
            password.value;

        if (!emailValue || !passwordValue) {

            showToast(
                "Enter your email and password.",
                "warning"
            );

            return;
        }

        try {

            await signInWithEmailAndPassword(
                auth,
                emailValue,
                passwordValue
            );

            showToast(
                "Login successful!",
                "success"
            );

            setTimeout(
                () => {

                    window.location.replace(
                        "app.html"
                    );

                },
                500
            );

        }

        catch (error) {

            console.error(
                "Email login error:",
                error
            );

            showToast(
                getAuthErrorMessage(error),
                "error"
            );

        }

    }
);


// ==========================================
// FORGOT PASSWORD
// ==========================================

forgotPassword?.addEventListener(
    "click",
    async (e) => {

        e.preventDefault();

        const emailValue =
            email.value.trim();

        if (!emailValue) {

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
                emailValue
            );

            showToast(
                "Password reset email sent.",
                "success"
            );

        }

        catch (error) {

            console.error(
                "Password reset error:",
                error
            );

            showToast(
                getAuthErrorMessage(error),
                "error"
            );

        }

    }
);


// ==========================================
// AUTH ERROR MESSAGES
// ==========================================

function getAuthErrorMessage(error) {

    switch (error.code) {

        case "auth/invalid-credential":
            return "Incorrect email or password.";

        case "auth/user-not-found":
            return "No account found.";

        case "auth/wrong-password":
            return "Incorrect password.";

        case "auth/invalid-email":
            return "Invalid email address.";

        case "auth/too-many-requests":
            return "Too many attempts. Try again later.";

        case "auth/network-request-failed":
            return "No internet connection.";

        case "auth/popup-closed-by-user":
            return "Google sign-in was cancelled.";

        case "auth/cancelled-popup-request":
            return "Google sign-in was cancelled.";

        case "auth/account-exists-with-different-credential":
            return "An account already exists with a different sign-in method.";

        case "auth/unauthorized-domain":
            return "This website is not authorized for Google sign-in.";

        default:
            return error.message || "Authentication failed.";

    }

}