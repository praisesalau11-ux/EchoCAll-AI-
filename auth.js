// ===============================
// EchoCall AI - auth.js
// Firebase Google Signup
// ===============================

import {
    auth,
    db,
    googleProvider
} from "./firebase.js";

import {
    signInWithPopup
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {
    doc,
    getDoc,
    setDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

import {
    showToast
} from "./toast.js";


// ==========================================
// Google Button
// ==========================================

const googleBtn =
    document.getElementById("googleSignIn");


// ==========================================
// Google Signup
// ==========================================

if (googleBtn) {

    googleBtn.addEventListener(
        "click",
        async (e) => {

            e.preventDefault();

            try {

                showToast(
                    "Opening Google sign-in...",
                    "success"
                );


                // ==================================
                // Sign in with Google
                // ==================================

                const result =
                    await signInWithPopup(
                        auth,
                        googleProvider
                    );

                const user =
                    result.user;


                console.log(
                    "Google authentication successful:",
                    user.uid
                );


                // ==================================
                // User Information
                // ==================================

                const displayName =
                    user.displayName || "";

                const nameParts =
                    displayName.trim().split(/\s+/);

                const firstName =
                    nameParts[0] || "";

                const lastName =
                    nameParts
                        .slice(1)
                        .join(" ") || "";


                const email =
                    user.email || "";


                // ==================================
                // Generate Username
                // ==================================

                const emailName =
                    email
                        .split("@")[0]
                        .toLowerCase()
                        .replace(
                            /[^a-z0-9._]/g,
                            ""
                        );

                const username =
                    emailName ||
                    "user_" + user.uid.slice(0, 8);


                // ==================================
                // Firestore User Reference
                // ==================================

                const userRef =
                    doc(
                        db,
                        "users",
                        user.uid
                    );


                const userSnapshot =
                    await getDoc(userRef);


                // ==================================
                // Create Google User
                // ==================================

                if (!userSnapshot.exists()) {

                    await setDoc(
                        userRef,
                        {

                            uid:
                                user.uid,

                            firstName:
                                firstName,

                            lastName:
                                lastName,

                            displayName:
                                displayName,

                            username:
                                username,

                            email:
                                email,

                            country:
                                "",

                            phone:
                                "",

                            gender:
                                "",

                            dob:
                                "",

                            profilePhoto:
                                user.photoURL || "",

                            bio:
                                "",

                            verified:
                                true,

                            premium:
                                false,

                            createdAt:
                                serverTimestamp(),

                            updatedAt:
                                serverTimestamp()

                        }
                    );

                    console.log(
                        "Google user saved to Firestore."
                    );

                }

                else {

                    // ==================================
                    // Existing Google User
                    // ==================================

                    await setDoc(
                        userRef,
                        {

                            displayName:
                                displayName,

                            profilePhoto:
                                user.photoURL || "",

                            updatedAt:
                                serverTimestamp()

                        },
                        {
                            merge: true
                        }
                    );

                    console.log(
                        "Existing Google user updated."
                    );

                }


                // ==================================
                // Success
                // ==================================

                showToast(
                    "Google Sign Up Successful!",
                    "success"
                );


                // ==================================
                // Go to App
                // ==================================

                setTimeout(
                    () => {

                        window.location.replace(
                            "app.html"
                        );

                    },
                    800
                );

            }

            catch (error) {

                console.error(
                    "Google signup error:",
                    error
                );


                let message =
                    error.message;


                switch (error.code) {

                    case "auth/popup-closed-by-user":

                        message =
                            "Google sign-in was cancelled.";

                        break;


                    case "auth/popup-blocked":

                        message =
                            "Google sign-in popup was blocked.";

                        break;


                    case "auth/cancelled-popup-request":

                        message =
                            "Google sign-in was cancelled.";

                        break;


                    case "auth/account-exists-with-different-credential":

                        message =
                            "An account already exists with this email using another sign-in method.";

                        break;


                    case "auth/unauthorized-domain":

                        message =
                            "This website is not authorized for Google sign-in.";

                        break;


                    case "auth/network-request-failed":

                        message =
                            "No internet connection.";

                        break;

                }


                showToast(
                    message,
                    "error"
                );

            }

        }
    );

}