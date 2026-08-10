// ==========================================
// EchoCall AI
// File: js/home.js
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
    navigate
} from "./router.js";

// ==========================================
// Toast
// ==========================================

import {
    showToast
} from "./toast.js";

// ==========================================
// AI
// ==========================================

import {
    initializeAI,
    clearConversation,
    startVoiceInput
} from "./ai.js";

// ==========================================
// Firebase SDK
// ==========================================

import {
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

import {
    ref,
    getDownloadURL
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-storage.js";

// ==========================================
// Backend
// ==========================================

const API_URL =
    "https://echocall-ai-backend.onrender.com";

// ==========================================
// State
// ==========================================

let homeInitialized = false;

let homeUser = null;

let homeUserData = null;

// ==========================================
// DOM Elements
// ==========================================

let homeGreeting = null;

let homeSubtitle = null;

let homeProfileImage = null;

let startAiChatButton = null;

let newCallButton = null;

let startVoiceInputButton = null;

// ==========================================
// Quick Actions
// ==========================================

let quickAi = null;

let quickTranslate = null;

let quickVoiceClone = null;

let quickContacts = null;

let quickCalls = null;

let quickHistory = null;

// ==========================================
// Initialize Home
// ==========================================

export async function initializeHome() {

    console.log(
        "EchoCall AI: Initializing Home..."
    );

    if (homeInitialized) {

        console.log(
            "Home already initialized."
        );

        return;

    }

    homeInitialized = true;

    // ======================================
    // Get Home Elements
    // ======================================

    cacheHomeElements();

    // ======================================
    // Initialize AI AFTER home.html loads
    // ======================================

    initializeAI();

    // ======================================
    // Authentication Check
    // ======================================

    if (!auth.currentUser) {

        console.warn(
            "No authenticated user."
        );

        return;

    }

    homeUser = auth.currentUser;

    // ======================================
    // Load User
    // ======================================

    await loadHomeUser();

    // ======================================
    // Initialize Buttons
    // ======================================

    initializeHomeButtons();

    // ======================================
    // Initialize Status
    // ======================================

    initializeNetworkStatus();

    console.log(
        "EchoCall AI: Home initialized."
    );

}

// ==========================================
// Cache Home Elements
// ==========================================

function cacheHomeElements() {

    homeGreeting =
        document.getElementById(
            "homeGreeting"
        );

    homeSubtitle =
        document.getElementById(
            "homeSubtitle"
        );

    homeProfileImage =
        document.getElementById(
            "homeProfileImage"
        );

    startAiChatButton =
        document.getElementById(
            "startAiChatButton"
        );

    newCallButton =
        document.getElementById(
            "newCallButton"
        );

    startVoiceInputButton =
        document.getElementById(
            "startVoiceInput"
        );

    // ======================================
    // Quick Actions
    // ======================================

    quickAi =
        document.getElementById(
            "quickAi"
        );

    quickTranslate =
        document.getElementById(
            "quickTranslate"
        );

    quickVoiceClone =
        document.getElementById(
            "quickVoiceClone"
        );

    quickContacts =
        document.getElementById(
            "quickContacts"
        );

    quickCalls =
        document.getElementById(
            "quickCalls"
        );

    quickHistory =
        document.getElementById(
            "quickHistory"
        );

}

// ==========================================
// Load Home User
// ==========================================

async function loadHomeUser() {

    try {

        const user = homeUser;

        if (!user) {

            return;

        }

        // ==================================
        // Basic Firebase Auth Information
        // ==================================

        if (homeGreeting) {

            homeGreeting.textContent =
                "Welcome 👋";

        }

        if (homeSubtitle) {

            homeSubtitle.textContent =
                "Your intelligent communication assistant.";

        }

        // ==================================
        // Firestore User Document
        // ==================================

        const userRef = doc(
            db,
            "users",
            user.uid
        );

        const userSnap =
            await getDoc(userRef);

        if (userSnap.exists()) {

            homeUserData =
                userSnap.data();

            const firstName =
                homeUserData.firstName ||
                homeUserData.name ||
                "there";

            if (homeGreeting) {

                homeGreeting.textContent =
                    `Welcome, ${firstName} 👋`;

            }

        }

        // ==================================
        // Load Profile Picture
        // ==================================

        await loadHomeProfileImage();

        // ==================================
        // Account Email
        // ==================================

        const accountEmail =
            document.getElementById(
                "accountEmail"
            );

        if (accountEmail) {

            accountEmail.textContent =
                user.email || "Not available";

        }

        // ==================================
        // Joined Date
        // ==================================

        const joinedDate =
            document.getElementById(
                "joinedDate"
            );

        if (
            joinedDate &&
            user.metadata &&
            user.metadata.creationTime
        ) {

            joinedDate.textContent =
                formatDate(
                    user.metadata.creationTime
                );

        }

        // ==================================
        // Last Login
        // ==================================

        const lastLogin =
            document.getElementById(
                "lastLogin"
            );

        if (
            lastLogin &&
            user.metadata &&
            user.metadata.lastSignInTime
        ) {

            lastLogin.textContent =
                formatDate(
                    user.metadata.lastSignInTime
                );

        }

    }

    catch (error) {

        console.error(
            "Home user loading failed:",
            error
        );

        showToast(
            "Unable to load your profile.",
            "error"
        );

    }

}

// ==========================================
// Load Profile Picture
// ==========================================

async function loadHomeProfileImage() {

    if (!homeProfileImage) {

        return;

    }

    if (!homeUser) {

        return;

    }

    // ======================================
    // First: Firestore profile photo URL
    // ======================================

    if (
        homeUserData &&
        homeUserData.profilePhoto
    ) {

        homeProfileImage.src =
            homeUserData.profilePhoto;

        return;

    }

    if (
        homeUserData &&
        homeUserData.photoURL
    ) {

        homeProfileImage.src =
            homeUserData.photoURL;

        return;

    }

    // ======================================
    // Second: Firebase Auth photoURL
    // ======================================

    if (homeUser.photoURL) {

        homeProfileImage.src =
            homeUser.photoURL;

        return;

    }

    // ======================================
    // Third: Firebase Storage
    // ======================================

    try {

        const imageRef = ref(
            storage,
            `profilePictures/${homeUser.uid}`
        );

        const imageURL =
            await getDownloadURL(
                imageRef
            );

        homeProfileImage.src =
            imageURL;

        return;

    }

    catch (error) {

        console.log(
            "No custom profile image found."
        );

    }

    // ======================================
    // Final Fallback
    // ======================================

    homeProfileImage.src =
        "assets/default-avatar.png";

}

// ==========================================
// Initialize Home Buttons
// ==========================================

function initializeHomeButtons() {

    // ======================================
    // AI CHAT
    // ======================================

    startAiChatButton?.addEventListener(

        "click",

        () => {

            openAIChat();

        }

    );

    // ======================================
    // VOICE CHAT
    // ======================================

    startVoiceInputButton?.addEventListener(

        "click",

        () => {

            startVoiceChat();

        }

    );

    // ======================================
    // NEW CALL
    // ======================================

    newCallButton?.addEventListener(

        "click",

        () => {

            navigate("calls");

        }

    );

    // ======================================
    // PROFILE
    // ======================================

    homeProfileImage?.addEventListener(

        "click",

        () => {

            navigate("profile");

        }

    );

    // ======================================
    // QUICK AI
    // ======================================

    quickAi?.addEventListener(

        "click",

        () => {

            openAIChat();

        }

    );

    // ======================================
    // QUICK CALLS
    // ======================================

    quickCalls?.addEventListener(

        "click",

        () => {

            navigate("calls");

        }

    );

    // ======================================
    // QUICK CONTACTS
    // ======================================

    quickContacts?.addEventListener(

        "click",

        () => {

            navigate("contacts");

        }

    );

    // ======================================
    // QUICK HISTORY
    // ======================================

    quickHistory?.addEventListener(

        "click",

        () => {

            navigate("history");

        }

    );

    // ======================================
    // QUICK VOICE CLONE
    // ======================================

    quickVoiceClone?.addEventListener(

        "click",

        () => {

            navigate("voiceClone");

        }

    );

    // ======================================
    // QUICK TRANSLATE
    // ======================================

    quickTranslate?.addEventListener(

        "click",

        () => {

            showToast(
                "Translation is coming soon.",
                "warning"
            );

        }

    );

}

// ==========================================
// Open AI Chat
// ==========================================

function openAIChat() {

    const aiModal =
        document.getElementById(
            "aiModal"
        );

    if (!aiModal) {

        showToast(
            "AI Assistant is not available.",
            "error"
        );

        return;

    }

    aiModal.classList.remove(
        "hidden"
    );

    const aiInput =
        document.getElementById(
            "aiInput"
        );

    aiInput?.focus();

}

// ==========================================
// Start Voice Chat
// ==========================================

function startVoiceChat() {

    openAIChat();

    setTimeout(

        () => {

            startVoiceInput();

        },

        300

    );

}

// ==========================================
// Network Status
// ==========================================

function initializeNetworkStatus() {

    const networkStatus =
        document.getElementById(
            "networkStatus"
        );

    if (!networkStatus) {

        return;

    }

    function update() {

        if (navigator.onLine) {

            networkStatus.textContent =
                "Online";

        }

        else {

            networkStatus.textContent =
                "Offline";

        }

    }

    update();

    window.addEventListener(
        "online",
        update
    );

    window.addEventListener(
        "offline",
        update
    );

}

// ==========================================
// Format Date
// ==========================================

function formatDate(date) {

    try {

        return new Date(date)
            .toLocaleDateString(
                undefined,
                {
                    year: "numeric",
                    month: "short",
                    day: "numeric"
                }
            );

    }

    catch {

        return "Unknown";

    }

}

// ==========================================
// Backend URL Getter
// ==========================================

export function getBackendURL() {

    return API_URL;

}

// ==========================================
// End Part 1
// ==========================================
// ==========================================
// EchoCall AI
// File: js/home.js
// Part 2
// Append below Part 1
// ==========================================

// ==========================================
// Dashboard Navigation Buttons
// ==========================================

const viewAllAiChats =
    document.getElementById("viewAllAiChats");

const viewAllCalls =
    document.getElementById("viewAllCalls");

const viewContacts =
    document.getElementById("viewContacts");

const viewTranslations =
    document.getElementById("viewTranslations");

const openVoiceClone =
    document.getElementById("openVoiceClone");

const createVoiceClone =
    document.getElementById("createVoiceClone");

const openImageStudio =
    document.getElementById("openImageStudio");

const generateImageButton =
    document.getElementById("generateImageButton");

const viewFiles =
    document.getElementById("viewFiles");

const viewActivity =
    document.getElementById("viewActivity");

const openProfile =
    document.getElementById("openProfile");

const openSettings =
    document.getElementById("openSettings");

const openSecurity =
    document.getElementById("openSecurity");

const openPremium =
    document.getElementById("openPremium");

const openSecurityCenter =
    document.getElementById("openSecurityCenter");

const manageStorage =
    document.getElementById("manageStorage");

const viewAllNotifications =
    document.getElementById("viewAllNotifications");


// ==========================================
// AI Chats
// ==========================================

viewAllAiChats?.addEventListener(
    "click",
    () => {

        openAIChat();

    }
);


// ==========================================
// Calls
// ==========================================

viewAllCalls?.addEventListener(
    "click",
    () => {

        navigate("calls");

    }
);


// ==========================================
// Contacts
// ==========================================

viewContacts?.addEventListener(
    "click",
    () => {

        navigate("contacts");

    }
);


// ==========================================
// Translations
// ==========================================

viewTranslations?.addEventListener(
    "click",
    () => {

        showToast(
            "Translation history is coming soon.",
            "warning"
        );

    }
);


// ==========================================
// Voice Clone
// ==========================================

openVoiceClone?.addEventListener(
    "click",
    () => {

        navigate("voiceClone");

    }
);


createVoiceClone?.addEventListener(
    "click",
    () => {

        navigate("voiceClone");

    }
);


// ==========================================
// Image Studio
// ==========================================

openImageStudio?.addEventListener(
    "click",
    () => {

        showToast(
            "Image Studio is coming soon.",
            "warning"
        );

    }
);


generateImageButton?.addEventListener(
    "click",
    () => {

        showToast(
            "Image generation is coming soon.",
            "warning"
        );

    }
);


// ==========================================
// Files
// ==========================================

viewFiles?.addEventListener(
    "click",
    () => {

        showToast(
            "File manager is coming soon.",
            "warning"
        );

    }
);


// ==========================================
// Activity
// ==========================================

viewActivity?.addEventListener(
    "click",
    () => {

        showToast(
            "Activity history is coming soon.",
            "warning"
        );

    }
);


// ==========================================
// Profile
// ==========================================

openProfile?.addEventListener(
    "click",
    () => {

        navigate("profile");

    }
);


// ==========================================
// Settings
// ==========================================

openSettings?.addEventListener(
    "click",
    () => {

        navigate("settings");

    }
);


// ==========================================
// Security
// ==========================================

openSecurity?.addEventListener(
    "click",
    () => {

        navigate("security");

    }
);


openSecurityCenter?.addEventListener(
    "click",
    () => {

        navigate("security");

    }
);


// ==========================================
// Premium
// ==========================================

openPremium?.addEventListener(
    "click",
    () => {

        navigate("premium");

    }
);


// ==========================================
// Notifications
// ==========================================

viewAllNotifications?.addEventListener(
    "click",
    () => {

        showToast(
            "Notification center is coming soon.",
            "warning"
        );

    }
);


// ==========================================
// Cloud Storage
// ==========================================

manageStorage?.addEventListener(
    "click",
    () => {

        showToast(
            "Storage manager is coming soon.",
            "warning"
        );

    }
);


// ==========================================
// Backend Status Elements
// ==========================================

const apiStatus =
    document.getElementById("apiStatus");

const firebaseStatus =
    document.getElementById("firebaseStatus");

const openaiStatus =
    document.getElementById("openaiStatus");

const storageStatus =
    document.getElementById("storageStatus");

const backendStatus =
    document.getElementById("backendStatus");

const refreshBackendStatus =
    document.getElementById("refreshBackendStatus");


// ==========================================
// Check Backend
// ==========================================

async function checkBackendStatus() {

    if (apiStatus) {

        apiStatus.textContent =
            "Checking...";

    }

    if (backendStatus) {

        backendStatus.textContent =
            "Checking...";

    }

    try {

        const response =
            await fetch(
                API_URL,
                {
                    method: "GET"
                }
            );

        if (response.ok) {

            if (apiStatus) {

                apiStatus.textContent =
                    "Online";

            }

            if (backendStatus) {

                backendStatus.textContent =
                    "Online";

            }

        }

        else {

            throw new Error(
                "Backend unavailable"
            );

        }

    }

    catch (error) {

        console.warn(
            "Backend status check failed:",
            error
        );

        if (apiStatus) {

            apiStatus.textContent =
                "Unavailable";

        }

        if (backendStatus) {

            backendStatus.textContent =
                "Unavailable";

        }

    }

}


// ==========================================
// Firebase Status
// ==========================================

function updateFirebaseStatus() {

    if (!firebaseStatus) {

        return;

    }

    if (auth.currentUser) {

        firebaseStatus.textContent =
            "Connected";

    }

    else {

        firebaseStatus.textContent =
            "Disconnected";

    }

}


// ==========================================
// Storage Status
// ==========================================

function updateStorageStatus() {

    if (!storageStatus) {

        return;

    }

    if (storage) {

        storageStatus.textContent =
            "Ready";

    }

    else {

        storageStatus.textContent =
            "Unavailable";

    }

}


// ==========================================
// OpenAI Status
// ==========================================
//
// IMPORTANT:
// We do NOT put the OpenAI API key here.
// The key remains on the Render backend.
//
// This checks the backend instead.
//

function updateOpenAIStatus() {

    if (!openaiStatus) {

        return;

    }

    openaiStatus.textContent =
        "Via API";

}


// ==========================================
// Refresh Backend Status
// ==========================================

refreshBackendStatus?.addEventListener(
    "click",
    async () => {

        await checkBackendStatus();

        updateFirebaseStatus();

        updateStorageStatus();

        updateOpenAIStatus();

        showToast(
            "Backend status refreshed."
        );

    }
);


// ==========================================
// Initialize Backend Status
// ==========================================

async function initializeBackendStatus() {

    await checkBackendStatus();

    updateFirebaseStatus();

    updateStorageStatus();

    updateOpenAIStatus();

}


// ==========================================
// Run Backend Status
// ==========================================

initializeBackendStatus();


// ==========================================
// End Part 2
// ==========================================