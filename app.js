// ==========================================
// EchoCall AI
// File: js/app.js
// Part 1
// ==========================================

// ==========================================
// Firebase
// ==========================================

import {
    auth,
    db,
    storage
} from "./firebase.js";

// ==========================================
// Router
// ==========================================

import {
    initializeRouter,
    navigate
} from "./router.js";

// ==========================================
// AI
// ==========================================

import {
    initializeAI
} from "./ai.js";

// ==========================================
// Firebase Modules
// ==========================================

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

import {
    ref,
    getDownloadURL
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-storage.js";

// ==========================================
// Global Elements
// ==========================================

const welcomeText =
document.getElementById("welcomeText");

const profileImage =
document.getElementById("profileImage");

const searchButton =
document.getElementById("searchButton");

const notificationButton =
document.getElementById("notificationButton");

const floatingAiButton =
document.getElementById("floatingAiButton");

const searchOverlay =
document.getElementById("searchOverlay");

const notificationPanel =
document.getElementById("notificationPanel");

const aiModal =
document.getElementById("aiModal");

const settingsModal =
document.getElementById("settingsModal");

const offlineBanner =
document.getElementById("offlineBanner");

const toastContainer =
document.getElementById("toastContainer");

// ==========================================
// Global State
// ==========================================

let currentUser = null;

let currentUserData = null;

// ==========================================
// Start Application
// ==========================================

document.addEventListener(

    "DOMContentLoaded",

    async()=>{

        // Load the current page first
        await initializeRouter();

        // Initialize AI AFTER the page/router
        // has finished loading
        initializeAI();

    }

);

// ==========================================
// Authentication
// ==========================================

onAuthStateChanged(

    auth,

    async(user)=>{

        if(!user){

            window.location.replace(

                "login.html"

            );

            return;

        }

        currentUser = user;

        await loadUserProfile();

    }

);

// ==========================================
// End Part 1
// ==========================================
// ==========================================
// EchoCall AI
// File: js/app.js
// Part 2
// Append below Part 1
// ==========================================

// ==========================================
// Load User Profile
// ==========================================

async function loadUserProfile() {

    console.log("1. loadUserProfile started");

    try {

        console.log("2. UID:", currentUser.uid);

        const userRef = doc(db, "users", currentUser.uid);

        const userSnap = await getDoc(userRef);

        console.log("3. Document exists:", userSnap.exists());

        console.log("4. Data:", userSnap.data());

        if (userSnap.exists()) {

            const data = userSnap.data();
           
            currentUserData = data;
          
            welcomeText.textContent =
            "Welcome, " + data.firstName;
            
            await loadProfileImage();

        } else {

            welcomeText.textContent =
            "Welcome, " + currentUser.email;

        }

    } catch (error) {

        console.error(error);

        welcomeText.textContent = "Error Loading";

    }

}

// ==========================================
// Load Profile Image
// ==========================================

async function loadProfileImage(){

    if(!profileImage){

        return;

    }

    try{

        const imageRef = ref(

            storage,

            `profilePictures/${currentUser.uid}`

        );

        const imageURL =

        await getDownloadURL(imageRef);

        profileImage.src = imageURL;

    }

    catch{

        if(currentUser.photoURL){

            profileImage.src =

            currentUser.photoURL;

        }

        else if(

            currentUserData &&

            currentUserData.profilePhoto

        ){

            profileImage.src =

            currentUserData.profilePhoto;

        }

        else{

            profileImage.src =

            "assets/default-avatar.png";

        }

    }

}

// ==========================================
// Open Profile Page
// ==========================================

profileImage?.addEventListener(

    "click",

    ()=>{

        navigate("profile");

    }

);

// ==========================================
// End Part 2
// ==========================================
// ==========================================
// EchoCall AI
// File: js/app.js
// Part 3
// ==========================================

// ==========================================
// Additional Elements
// ==========================================

const closeSearch =
document.getElementById("closeSearch");

const closeNotifications =
document.getElementById("closeNotifications");

const closeAiModal =
document.getElementById("closeAiModal");

const closeSettings =
document.getElementById("closeSettings");

// ==========================================
// Search Overlay
// ==========================================

searchButton?.addEventListener(

    "click",

    ()=>{

        searchOverlay?.classList.remove(

            "hidden"

        );

        notificationPanel?.classList.add(

            "hidden"

        );

        document
        .getElementById("globalSearch")
        ?.focus();

    }

);

closeSearch?.addEventListener(

    "click",

    ()=>{

        searchOverlay?.classList.add(

            "hidden"

        );

    }

);

// ==========================================
// Notifications
// ==========================================

notificationButton?.addEventListener(

    "click",

    ()=>{

        notificationPanel?.classList.toggle(

            "hidden"

        );

        searchOverlay?.classList.add(

            "hidden"

        );

    }

);

closeNotifications?.addEventListener(

    "click",

    ()=>{

        notificationPanel?.classList.add(

            "hidden"

        );

    }

);

// ==========================================
// Floating AI
// ==========================================

floatingAiButton?.addEventListener(

    "click",

    ()=>{

        aiModal?.classList.remove(

            "hidden"

        );

    }

);

closeAiModal?.addEventListener(

    "click",

    ()=>{

        aiModal?.classList.add(

            "hidden"

        );

    }

);

// ==========================================
// Settings
// ==========================================

profileImage?.addEventListener(

    "dblclick",

    ()=>{

        settingsModal?.classList.remove(

            "hidden"

        );

    }

);

closeSettings?.addEventListener(

    "click",

    ()=>{

        settingsModal?.classList.add(

            "hidden"

        );

    }

);

// ==========================================
// Open Profile
// ==========================================

profileImage?.addEventListener(

    "click",

    ()=>{

        navigate("profile");

    }

);

// ==========================================
// Close Panels
// ==========================================

window.addEventListener(

    "click",

    (event)=>{

        if(event.target===searchOverlay){

            searchOverlay.classList.add(

                "hidden"

            );

        }

        if(event.target===aiModal){

            aiModal.classList.add(

                "hidden"

            );

        }

        if(event.target===settingsModal){

            settingsModal.classList.add(

                "hidden"

            );

        }

    }

);

// ==========================================
// End Part 3
// ==========================================
// ==========================================
// EchoCall AI
// File: js/app.js
// Part 4 (Final)
// ==========================================

// ==========================================
// Toast
// ==========================================

export function showToast(

    message,

    type = "success"

){

    if(!toastContainer){

        return;

    }

    const toast =

    document.createElement("div");

    toast.className =

    `toast ${type}`;

    toast.textContent =

    message;

    toastContainer.appendChild(toast);

    requestAnimationFrame(()=>{

        toast.classList.add("show");

    });

    setTimeout(()=>{

        toast.classList.remove("show");

        setTimeout(()=>{

            toast.remove();

        },300);

    },3000);

}

// ==========================================
// Network Status
// ==========================================

function updateNetworkStatus(){

    if(!offlineBanner){

        return;

    }

    if(navigator.onLine){

        offlineBanner.classList.add(

            "hidden"

        );

    }

    else{

        offlineBanner.classList.remove(

            "hidden"

        );

    }

}

window.addEventListener(

    "online",

    ()=>{

        updateNetworkStatus();

        showToast(

            "Back online."

        );

    }

);

window.addEventListener(

    "offline",

    ()=>{

        updateNetworkStatus();

        showToast(

            "You're offline.",

            "warning"

        );

    }

);

// ==========================================
// Logout
// ==========================================

export async function logout(){

    try{

        await signOut(auth);

        window.location.replace(

            "login.html"

        );

    }

    catch(error){

        console.error(error);

        showToast(

            "Unable to logout.",

            "error"

        );

    }

}

// ==========================================
// Initialize App
// ==========================================

function initializeApp(){

    updateNetworkStatus();

}

initializeApp();

// ==========================================
// Exports
// ==========================================

export {

    currentUser,

    currentUserData,

    loadUserProfile

};

// ==========================================
// End of app.js
// ==========================================