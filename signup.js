// ==========================================
// EchoCall AI
// File: js/signup.js
// Part 1A
// ==========================================

// Firebase
import {
    auth,
    db,
    googleProvider
} from "./firebase.js";

// Firebase Authentication
import {
    createUserWithEmailAndPassword,
    signInWithPopup,
    updateProfile
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

// Cloud Firestore
import {
    doc,
    setDoc,
    collection,
    query,
    where,
    getDocs,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

// Countries
import {
    countries
} from "../data/countries.js";

// Toast
import {
    showToast
} from "./toast.js";

// ==========================================
// DOM Elements
// ==========================================

const signupForm =
document.getElementById("signupForm");

const firstName =
document.getElementById("firstName");

const lastName =
document.getElementById("lastName");

const username =
document.getElementById("username");

const email =
document.getElementById("email");

const country =
document.getElementById("country");

const phone =
document.getElementById("phone");

const gender =
document.getElementById("gender");

const dob =
document.getElementById("dob");

const password =
document.getElementById("password");

const confirmPassword =
document.getElementById("confirmPassword");

const terms =
document.getElementById("terms");

// Google Signup Button
const googleSignup =
document.getElementById("googleSignup");

// ==========================================
// End Part 1A
// ==========================================
// ==========================================
// EchoCall AI
// File: js/signup.js
// Part 1B
// Append below Part 1A
// ==========================================

// ==========================================
// Load Countries
// ==========================================

function loadCountries() {

    country.innerHTML =
        `<option value="">Select Country</option>`;

    countries
        .sort((a, b) => a.name.localeCompare(b.name))
        .forEach((item) => {

            const option =
                document.createElement("option");

            option.value = item.name;

            option.dataset.code = item.code;

            option.dataset.dialCode =
                item.dialCode;

            option.textContent =
                `${item.flag} ${item.name} (${item.dialCode})`;

            country.appendChild(option);

        });

}

loadCountries();

// ==========================================
// Auto Phone Code
// ==========================================

country.addEventListener("change", () => {

    const selected =
        country.options[country.selectedIndex];

    const dialCode =
        selected.dataset.dialCode;

    if (!dialCode) return;

    phone.value = dialCode + " ";

    phone.focus();

});

// ==========================================
// Username Formatting
// ==========================================

username.addEventListener("input", () => {

    username.value =
        username.value
        .toLowerCase()
        .replace(/[^a-z0-9._]/g, "");

});

// ==========================================
// Calculate Age
// ==========================================

function calculateAge(date) {

    const today = new Date();

    const birth =
        new Date(date);

    let age =
        today.getFullYear() -
        birth.getFullYear();

    const month =
        today.getMonth() -
        birth.getMonth();

    if (

        month < 0 ||

        (

            month === 0 &&

            today.getDate() <
            birth.getDate()

        )

    ) {

        age--;

    }

    return age;

}

// ==========================================
// Username Exists
// ==========================================

async function usernameExists(name) {

    const q = query(

        collection(db, "users"),

        where(

            "username",

            "==",

            name.toLowerCase()

        )

    );

    const snapshot =
        await getDocs(q);

    return !snapshot.empty;

}

// ==========================================
// Form Validation
// ==========================================

function validateForm() {

    if (

        firstName.value.trim() === "" ||

        lastName.value.trim() === "" ||

        username.value.trim() === "" ||

        email.value.trim() === "" ||

        country.value === "" ||

        phone.value.trim() === "" ||

        gender.value === "" ||

        dob.value === "" ||

        password.value === "" ||

        confirmPassword.value === ""

    ) {

        showToast(

            "Please complete all fields.",

            "warning"

        );

        return false;

    }

    if (

        password.value !==

        confirmPassword.value

    ) {

        showToast(

            "Passwords do not match.",

            "error"

        );

        return false;

    }

    if (

        password.value.length < 6

    ) {

        showToast(

            "Password must be at least 6 characters.",

            "error"

        );

        return false;

    }

    if (

        calculateAge(dob.value) < 13

    ) {

        showToast(

            "You must be at least 13 years old.",

            "error"

        );

        return false;

    }

    if (!terms.checked) {

        showToast(

            "Please accept the Terms & Conditions.",

            "warning"

        );

        return false;

    }

    return true;

}

// ==========================================
// End Part 1B
// ==========================================

// ==========================================
// EchoCall AI
// File: js/signup.js
// Part 2
// Append below Part 1B
// ==========================================

// ==========================================
// Email & Password Signup
// ==========================================

signupForm.addEventListener("submit", async (e) => {

    e.preventDefault();

    if (!validateForm()) return;

    const userName =
        username.value.trim().toLowerCase();

    try {

        // Check username
        const exists =
            await usernameExists(userName);

        if (exists) {

            showToast(
                "Username is already taken.",
                "error"
            );

            return;

        }

        // Create account
        const userCredential =
            await createUserWithEmailAndPassword(

                auth,

                email.value.trim(),

                password.value

            );

        const user = userCredential.user;

        // Update Firebase profile
        await updateProfile(user, {

            displayName:
                firstName.value.trim() +
                " " +
                lastName.value.trim()

        });

        // Save Firestore document
        await setDoc(

            doc(db, "users", user.uid),

            {

                uid: user.uid,

                firstName:
                    firstName.value.trim(),

                lastName:
                    lastName.value.trim(),

                displayName:
                    firstName.value.trim() +
                    " " +
                    lastName.value.trim(),

                username: userName,

                email:
                    email.value.trim(),

                country:
                    country.value,

                phone:
                    phone.value.trim(),

                gender:
                    gender.value,

                dob:
                    dob.value,

                profilePhoto: "",

                bio: "",

                verified: false,

                premium: false,

                createdAt:
                    serverTimestamp(),

                updatedAt:
                    serverTimestamp()

            }

        );

        showToast(

            "Account created successfully!",

            "success"

        );

        setTimeout(() => {

            window.location.href =
                "app.html";

        }, 1500);

    }

    catch (error) {

        console.error(error);

        let message =
            error.message;

        switch (error.code) {

            case "auth/email-already-in-use":

                message =
                    "This email is already in use.";

                break;

            case "auth/invalid-email":

                message =
                    "Invalid email address.";

                break;

            case "auth/weak-password":

                message =
                    "Password must be at least 6 characters.";

                break;

            case "permission-denied":

                message =
                    "Firestore permission denied.";

                break;

        }

        showToast(

            message,

            "error"

        );

    }

});

// ==========================================
// Google Signup
// ==========================================

googleSignup.addEventListener("click", async () => {

    try {

        const result =
            await signInWithPopup(

                auth,

                googleProvider

            );

        const user =
            result.user;

        const userRef =
            doc(db, "users", user.uid);

        await setDoc(

            userRef,

            {

                uid: user.uid,

                firstName:
                    user.displayName?.split(" ")[0] || "",

                lastName:
                    user.displayName?.split(" ").slice(1).join(" ") || "",

                displayName:
                    user.displayName || "",

                username:
                    user.email.split("@")[0].toLowerCase(),

                email:
                    user.email,

                profilePhoto:
                    user.photoURL || "",

                verified: true,

                premium: false,

                createdAt:
                    serverTimestamp(),

                updatedAt:
                    serverTimestamp()

            },

            {

                merge: true

            }

        );

        showToast(

            "Google Sign Up Successful!",

            "success"

        );

        setTimeout(() => {

            window.location.href =
                "home.html";

        }, 1500);

    }

    catch (error) {

        console.error(error);

        showToast(

            error.message,

            "error"

        );

    }

});

// ==========================================
// End Part 2
// ==========================================
