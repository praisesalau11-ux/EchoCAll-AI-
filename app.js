// ==========================================
// EchoCall AI
// File: js/app.js
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
// Toast
// ==========================================

import {
    showToast
} from "./toast.js";

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
// DOM ELEMENTS
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


// ==========================================
// ADDITIONAL ELEMENTS
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
// GLOBAL STATE
// ==========================================

let currentUser = null;

let currentUserData = null;

let authResolved = false;

// ==========================================
// START APPLICATION
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        try {

            // Initialize router
            await initializeRouter();

            // Initialize AI
            await initializeAI();

            // Initialize network state
            updateNetworkStatus();

            console.log(
                "EchoCall AI initialized successfully."
            );

        }

        catch (error) {

            console.error(
                "EchoCall initialization error:",
                error
            );

            showToast(
                "Unable to initialize EchoCall AI.",
                "error"
            );

        }

    }
);


// ==========================================
// AUTHENTICATION
// ==========================================
onAuthStateChanged(
    auth,
    async (user) => {

        authResolved = true;

        if (!user) {

            currentUser = null;
            currentUserData = null;

            console.log(
                "No authenticated user."
            );

            window.location.replace(
                "login.html"
            );

            return;
        }

        currentUser = user;

        console.log(
            "Authenticated user:",
            user.uid
        );

        await loadUserProfile();

    }
);

// ==========================================
// LOAD USER PROFILE
// ==========================================

async function loadUserProfile() {

    if (!currentUser) {
        return;
    }

    try {

        console.log(
            "Loading user:",
            currentUser.uid
        );

        const userRef =
            doc(
                db,
                "users",
                currentUser.uid
            );

        const userSnap =
            await getDoc(userRef);


        if (userSnap.exists()) {

            currentUserData =
                userSnap.data();


            const firstName =
                currentUserData.firstName ||
                currentUserData.name ||
                currentUser.displayName ||
                "there";


            if (welcomeText) {

                welcomeText.textContent =
                    `Welcome, ${firstName}`;

            }


            await loadProfileImage();

        }

        else {

            currentUserData = null;


            if (welcomeText) {

                welcomeText.textContent =
                    `Welcome, ${
                        currentUser.displayName ||
                        currentUser.email ||
                        "there"
                    }`;

            }


            await loadProfileImage();

        }

    }

    catch (error) {

        console.error(
            "Load user profile error:",
            error
        );


        if (welcomeText) {

            welcomeText.textContent =
                "Welcome back";

        }

        showToast(
            "Unable to load your profile.",
            "error"
        );

    }

}


// ==========================================
// LOAD PROFILE IMAGE
// ==========================================

async function loadProfileImage() {

    if (!profileImage || !currentUser) {
        return;
    }


    try {

        const imageRef =
            ref(
                storage,
                `profilePictures/${currentUser.uid}`
            );


        const imageURL =
            await getDownloadURL(imageRef);


        profileImage.src =
            imageURL;

    }

    catch (error) {

        console.log(
            "No Storage profile image found."
        );


        if (currentUser.photoURL) {

            profileImage.src =
                currentUser.photoURL;

        }

        else if (
            currentUserData &&
            currentUserData.profilePhoto
        ) {

            profileImage.src =
                currentUserData.profilePhoto;

        }

        else {

            profileImage.src =
                "assets/default-avatar.png";

        }

    }

}


// ==========================================
// PROFILE BUTTON
// ==========================================

profileImage?.addEventListener(
    "click",
    async () => {

        try {

            await navigate(
                "profile"
            );

        }

        catch (error) {

            console.error(
                "Profile navigation error:",
                error
            );

            showToast(
                "Unable to open profile.",
                "error"
            );

        }

    }
);


// ==========================================
// SEARCH
// ==========================================

searchButton?.addEventListener(
    "click",
    () => {

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


// ==========================================
// CLOSE SEARCH
// ==========================================

closeSearch?.addEventListener(
    "click",
    () => {

        searchOverlay?.classList.add(
            "hidden"
        );

    }
);


// ==========================================
// NOTIFICATIONS
// ==========================================

notificationButton?.addEventListener(
    "click",
    () => {

        notificationPanel?.classList.toggle(
            "hidden"
        );

        searchOverlay?.classList.add(
            "hidden"
        );

    }
);


// ==========================================
// CLOSE NOTIFICATIONS
// ==========================================

closeNotifications?.addEventListener(
    "click",
    () => {

        notificationPanel?.classList.add(
            "hidden"
        );

    }
);


// ==========================================
// AI BUTTON
// ==========================================

floatingAiButton?.addEventListener(
    "click",
    () => {

        if (!aiModal) {
            return;
        }

        aiModal.classList.remove(
            "hidden"
        );

        document
            .getElementById("aiInput")
            ?.focus();

    }
);


// ==========================================
// CLOSE AI
// ==========================================

closeAiModal?.addEventListener(
    "click",
    () => {

        aiModal?.classList.add(
            "hidden"
        );

    }
);


// ==========================================
// SETTINGS
// ==========================================

profileImage?.addEventListener(
    "dblclick",
    () => {

        settingsModal?.classList.remove(
            "hidden"
        );

    }
);


// ==========================================
// CLOSE SETTINGS
// ==========================================

closeSettings?.addEventListener(
    "click",
    () => {

        settingsModal?.classList.add(
            "hidden"
        );

    }
);


// ==========================================
// CLOSE PANELS BY BACKDROP
// ==========================================

window.addEventListener(
    "click",
    (event) => {

        if (
            searchOverlay &&
            event.target === searchOverlay
        ) {

            searchOverlay.classList.add(
                "hidden"
            );

        }


        if (
            aiModal &&
            event.target === aiModal
        ) {

            aiModal.classList.add(
                "hidden"
            );

        }


        if (
            settingsModal &&
            event.target === settingsModal
        ) {

            settingsModal.classList.add(
                "hidden"
            );

        }

    }
);


// ==========================================
// NETWORK STATUS
// ==========================================

function updateNetworkStatus() {

    if (!offlineBanner) {
        return;
    }


    if (navigator.onLine) {

        offlineBanner.classList.add(
            "hidden"
        );

    }

    else {

        offlineBanner.classList.remove(
            "hidden"
        );

    }

}


// ==========================================
// ONLINE
// ==========================================

window.addEventListener(
    "online",
    () => {

        updateNetworkStatus();

        showToast(
            "Back online.",
            "success"
        );

    }
);


// ==========================================
// OFFLINE
// ==========================================

window.addEventListener(
    "offline",
    () => {

        updateNetworkStatus();

        showToast(
            "You're offline.",
            "warning"
        );

    }
);


// ==========================================
// LOGOUT
// ==========================================

export async function logout() {

    try {

        await signOut(auth);

        showToast(
            "Logged out successfully.",
            "success"
        );


        setTimeout(
            () => {

                window.location.replace(
                    "login.html"
                );

            },
            500
        );

    }

    catch (error) {

        console.error(
            "Logout error:",
            error
        );

        showToast(
            "Unable to logout.",
            "error"
        );

    }

}


// ==========================================
// GET CURRENT USER
// ==========================================

export function getCurrentUser() {

    return currentUser;

}


// ==========================================
// GET CURRENT USER DATA
// ==========================================

export function getCurrentUserData() {

    return currentUserData;

}


// ==========================================
// LOAD PROFILE EXPORT
// ==========================================

export {
    loadUserProfile
};

// ==========================================
// EchoCall AI
// REAL VOICE CHAT
// ==========================================

let voiceRecognition = null;
let voiceChatActive = false;
let voiceConversationId =
    localStorage.getItem("echoCallVoiceConversationId") ||
    `voice-${Date.now()}`;

// ==========================================
// Browser Speech Recognition
// ==========================================

function createVoiceRecognition() {

    const SpeechRecognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;

    if (!SpeechRecognition) {

        showToast(
            "Voice recognition is not supported in this browser.",
            "error"
        );

        return null;
    }

    const recognition = new SpeechRecognition();

    recognition.lang = "en-US";

    recognition.continuous = false;

    recognition.interimResults = false;

    recognition.maxAlternatives = 1;

    // ======================================
    // Started listening
    // ======================================

    recognition.onstart = () => {

        voiceChatActive = true;

        updateVoiceButtons(true);

        showToast(
            "Listening...",
            "success"
        );

    };

    // ======================================
    // Speech detected
    // ======================================

    recognition.onresult = async (event) => {

        const transcript =
            event.results[0][0].transcript.trim();

        console.log(
            "Voice transcript:",
            transcript
        );

        if (!transcript) {

            showToast(
                "I didn't hear anything.",
                "warning"
            );

            return;
        }

        // Show user's message inside AI chat
        addVoiceMessage(
            transcript,
            "user"
        );

        // Send to EchoCall AI
        await sendVoiceMessage(
            transcript
        );

    };

    // ======================================
    // Recognition ended
    // ======================================

    recognition.onend = () => {

        voiceChatActive = false;

        updateVoiceButtons(false);

    };

    // ======================================
    // Recognition error
    // ======================================

    recognition.onerror = (event) => {

        console.error(
            "Speech recognition error:",
            event.error
        );

        voiceChatActive = false;

        updateVoiceButtons(false);

        if (
            event.error === "not-allowed" ||
            event.error === "service-not-allowed"
        ) {

            showToast(
                "Microphone permission was denied.",
                "error"
            );

            return;
        }

        if (
            event.error === "no-speech"
        ) {

            showToast(
                "I didn't hear you. Try again.",
                "warning"
            );

            return;
        }

        showToast(
            "Voice recognition failed.",
            "error"
        );

    };

    return recognition;
}

// ==========================================
// Start / Stop Voice Chat
// ==========================================

function toggleVoiceChat() {

    if (!voiceRecognition) {

        voiceRecognition =
            createVoiceRecognition();

        if (!voiceRecognition) {

            return;
        }

    }

    if (voiceChatActive) {

        try {

            voiceRecognition.stop();

        }

        catch (error) {

            console.warn(error);

        }

        return;
    }

    try {

        voiceRecognition.start();

    }

    catch (error) {

        console.warn(
            "Could not start recognition:",
            error
        );

        // Recognition can throw if start()
        // is called twice.

        voiceRecognition =
            createVoiceRecognition();

    }

}

// ==========================================
// Update All Voice Buttons
// ==========================================

function updateVoiceButtons(active) {

    const buttons =
        document.querySelectorAll(
            "#startVoiceInput, #voiceChatButton, .voice-chat-button"
        );

    buttons.forEach(button => {

        if (!button) return;

        const icon =
            button.querySelector(
                ".material-symbols-rounded"
            );

        if (active) {

            button.classList.add(
                "voice-active"
            );

            button.setAttribute(
                "aria-label",
                "Stop listening"
            );

            if (icon) {

                icon.textContent =
                    "mic_off";

            }

            const text =
                button.querySelector(
                    ".voice-button-text"
                );

            if (text) {

                text.textContent =
                    "Listening...";

            }

        }

        else {

            button.classList.remove(
                "voice-active"
            );

            button.setAttribute(
                "aria-label",
                "Start voice chat"
            );

            if (icon) {

                icon.textContent =
                    "mic";

            }

            const text =
                button.querySelector(
                    ".voice-button-text"
                );

            if (text) {

                text.textContent =
                    "Voice Chat";

            }

        }

    });

}

// ==========================================
// IMPORTANT:
// Event delegation works even though
// home.html is loaded dynamically.
// ==========================================

document.addEventListener(
    "click",
    (event) => {

        const voiceButton =
            event.target.closest(
                "#startVoiceInput, #voiceChatButton, .voice-chat-button"
            );

        if (!voiceButton) {

            return;
        }

        event.preventDefault();

        event.stopPropagation();

        console.log(
            "Voice Chat button clicked"
        );

        toggleVoiceChat();

    },
    true
);

// ==========================================
// Send Voice Transcript To EchoCall AI
// ==========================================

async function sendVoiceMessage(message) {

    if (!currentUser) {

        showToast(
            "Please log in first.",
            "error"
        );

        return;
    }

    try {

        showToast(
            "EchoCall AI is thinking...",
            "success"
        );

        const token =
            await currentUser.getIdToken();

        const response =
            await fetch(
                "https://echocall-ai-backend.onrender.com/api/ai/chat",
                {

                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json",

                        "Authorization":
                            `Bearer ${token}`

                    },

                    body: JSON.stringify({

                        message: message,

                        conversationId:
                            voiceConversationId,

                        personality:
                            "helpful",

                        tone:
                            "natural"

                    })

                }
            );

        if (!response.ok) {

            const errorText =
                await response.text();

            console.error(
                "AI server error:",
                errorText
            );

            throw new Error(
                `AI server returned ${response.status}`
            );

        }

        const data =
            await response.json();

        console.log(
            "Voice AI response:",
            data
        );

        if (data.conversationId) {

            voiceConversationId =
                data.conversationId;

            localStorage.setItem(
                "echoCallVoiceConversationId",
                voiceConversationId
            );

        }

        const reply =
            data.reply ||
            data.message ||
            data.response;

        if (!reply) {

            throw new Error(
                "AI returned no response."
            );

        }

        // Display AI response
        addVoiceMessage(
            reply,
            "ai"
        );

        // Speak response
        speakAIResponse(
            reply
        );

    }

    catch (error) {

        console.error(
            "Voice AI error:",
            error
        );

        showToast(
            "Unable to connect to EchoCall AI.",
            "error"
        );

    }

}

// ==========================================
// Add Message To AI Modal
// ==========================================

function addVoiceMessage(
    message,
    type
) {

    const container =
        document.getElementById(
            "aiChatContainer"
        );

    if (!container) {

        console.warn(
            "aiChatContainer not found"
        );

        return;
    }

    const wrapper =
        document.createElement("div");

    if (type === "user") {

        wrapper.className =
            "user-message";

        wrapper.innerHTML = `
            <div class="user-bubble">
                ${escapeVoiceHTML(message)}
            </div>
        `;

    }

    else {

        wrapper.className =
            "ai-message";

        wrapper.innerHTML = `
            <div class="ai-avatar">
                🤖
            </div>

            <div class="ai-bubble">
                ${escapeVoiceHTML(message)}
            </div>
        `;

    }

    container.appendChild(
        wrapper
    );

    container.scrollTop =
        container.scrollHeight;

}

// ==========================================
// Prevent HTML injection
// ==========================================

function escapeVoiceHTML(value) {

    const div =
        document.createElement("div");

    div.textContent =
        value;

    return div.innerHTML;

}

// ==========================================
// AI Voice Output
// ==========================================

function speakAIResponse(text) {

    if (
        !("speechSynthesis" in window)
    ) {

        console.warn(
            "Speech synthesis not supported."
        );

        return;

    }

    window.speechSynthesis.cancel();

    const utterance =
        new SpeechSynthesisUtterance(
            text
        );

    utterance.lang =
        "en-US";

    utterance.rate =
        1;

    utterance.pitch =
        1;

    utterance.volume =
        1;

    utterance.onstart = () => {

        console.log(
            "AI started speaking"
        );

    };

    utterance.onend = () => {

        console.log(
            "AI finished speaking"
        );

    };

    utterance.onerror = (error) => {

        console.error(
            "Speech synthesis error:",
            error
        );

    };

    window.speechSynthesis.speak(
        utterance
    );

}

// ==========================================
// Reset Voice Conversation
// ==========================================

export function resetVoiceConversation() {

    voiceConversationId =
        `voice-${Date.now()}`;

    localStorage.setItem(
        "echoCallVoiceConversationId",
        voiceConversationId
    );

}

// ==========================================
// End Voice Chat
// ==========================================


// ==========================================
// END OF APP.JS
// ==========================================