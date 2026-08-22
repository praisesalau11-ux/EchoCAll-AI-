// ==========================================
// EchoCall AI
// File: js/home.js
// Part 1
// ==========================================

import { navigate } from "./router.js";

import { showToast } from "./toast.js";

import {
    initializeAI,
    startVoiceInput
} from "./ai.js";

import { auth } from "./firebase.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

// ==========================================
// BACKEND
// ==========================================

const API_URL =
    "https://echocall-ai-backend.onrender.com";

const CALLS_API =
    `${API_URL}/api/calls`;

// ==========================================
// STATE
// ==========================================

let initialized = false;

let authUnsubscribe = null;

let homeAbortController = null;

let currentUser = null;

// ==========================================
// INITIALIZE HOME
// ==========================================

export function initializeHome(){

    if(initialized){

        refreshDashboard();

        return;
    }

    initialized = true;

    // --------------------------------------
    // AI
    // --------------------------------------

    initializeAI();

    // --------------------------------------
    // UI
    // --------------------------------------

    initializeHeroButtons();

    initializeQuickActions();

    initializeQuickSettings();

    initializeDashboardButtons();

    initializeRefreshButtons();

    initializeSecurityCenter();

    initializeCloudStorage();

    initializeNotifications();

    initializeDeviceInformation();

    // --------------------------------------
    // NETWORK
    // --------------------------------------

    updateNetworkStatus();

    window.addEventListener(
        "online",
        updateNetworkStatus
    );

    window.addEventListener(
        "offline",
        updateNetworkStatus
    );

    // --------------------------------------
    // AUTH
    // --------------------------------------

    initializeAuthentication();

    // --------------------------------------
    // BACKEND
    // --------------------------------------

    checkBackendStatus();

    return cleanupHome;
}

// ==========================================
// CLEANUP
// ==========================================

export function cleanupHome(){

    homeAbortController?.abort();

    homeAbortController = null;

    authUnsubscribe?.();

    authUnsubscribe = null;

    window.removeEventListener(
        "online",
        updateNetworkStatus
    );

    window.removeEventListener(
        "offline",
        updateNetworkStatus
    );

    initialized = false;
}

// ==========================================
// AUTHENTICATION
// ==========================================

function initializeAuthentication(){

    if(!auth){

        setText(
            "accountEmail",
            "Authentication unavailable"
        );

        setText(
            "authenticationStatus",
            "Unavailable"
        );

        setText(
            "securityScore",
            "0%"
        );

        return;
    }

    authUnsubscribe = onAuthStateChanged(

        auth,

        async(user)=>{

            currentUser =
                user || null;

            // ----------------------------------
            // SIGNED OUT
            // ----------------------------------

            if(!user){

                clearDashboardForSignedOutUser();

                return;
            }

            // ----------------------------------
            // ACCOUNT
            // ----------------------------------

            populateAccountInformation(
                user
            );

            populateProfile(
                user
            );

            // ----------------------------------
            // DASHBOARD
            // ----------------------------------

            await refreshDashboard();

        }

    );
}

// ==========================================
// HERO BUTTONS
// ==========================================

function initializeHeroButtons(){

    document
        .getElementById(
            "startAiChatButton"
        )
        ?.addEventListener(
            "click",
            openAI
        );

    document
        .getElementById(
            "newCallButton"
        )
        ?.addEventListener(
            "click",
            ()=>navigate("calls")
        );

    document
        .getElementById(
            "startVoiceInput"
        )
        ?.addEventListener(
            "click",
            ()=>{

                openAI();

                setTimeout(
                    ()=>{

                        try{

                            startVoiceInput();

                        }
                        catch(error){

                            console.error(
                                error
                            );

                            showToast(
                                "Voice input could not be started.",
                                "error"
                            );

                        }

                    },
                    300
                );

            }
        );

    document
        .getElementById(
            "homeProfileImage"
        )
        ?.addEventListener(
            "click",
            ()=>navigate("profile")
        );
}

// ==========================================
// OPEN AI
// ==========================================

function openAI(){

    const modal =
        document.getElementById(
            "aiModal"
        );

    if(modal){

        modal.classList.remove(
            "hidden"
        );

        document
            .getElementById(
                "aiInput"
            )
            ?.focus();

        return;
    }

    const floating =
        document.getElementById(
            "floatingAiButton"
        );

    if(floating){

        floating.click();

        return;
    }

    showToast(
        "AI Assistant is unavailable.",
        "error"
    );
}

// ==========================================
// QUICK ACTIONS
// ==========================================

function initializeQuickActions(){

    document
        .getElementById("quickAi")
        ?.addEventListener(
            "click",
            openAI
        );

    document
        .getElementById("quickTranslate")
        ?.addEventListener(
            "click",
            ()=>navigate("translate")
        );

    document
        .getElementById("quickVoiceClone")
        ?.addEventListener(
            "click",
            ()=>navigate("voiceClone")
        );

    document
        .getElementById("quickContacts")
        ?.addEventListener(
            "click",
            ()=>navigate("contacts")
        );

    document
        .getElementById("quickCalls")
        ?.addEventListener(
            "click",
            ()=>navigate("calls")
        );

    document
        .getElementById("quickHistory")
        ?.addEventListener(
            "click",
            ()=>navigate("history")
        );
}

// ==========================================
// QUICK SETTINGS
// ==========================================

function initializeQuickSettings(){

    document
        .getElementById("openProfile")
        ?.addEventListener(
            "click",
            ()=>navigate("profile")
        );

    document
        .getElementById("openSettings")
        ?.addEventListener(
            "click",
            ()=>navigate("settings")
        );

    document
        .getElementById("openSecurity")
        ?.addEventListener(
            "click",
            ()=>navigate("security")
        );

    document
        .getElementById("openPremium")
        ?.addEventListener(
            "click",
            ()=>navigate("premium")
        );
}

// ==========================================
// DASHBOARD BUTTONS
// ==========================================

function initializeDashboardButtons(){

    document
        .getElementById("viewAllAiChats")
        ?.addEventListener(
            "click",
            ()=>navigate("history")
        );

    document
        .getElementById("viewAllCalls")
        ?.addEventListener(
            "click",
            ()=>navigate("calls")
        );

    document
        .getElementById("viewContacts")
        ?.addEventListener(
            "click",
            ()=>navigate("contacts")
        );

    document
        .getElementById("viewTranslations")
        ?.addEventListener(
            "click",
            ()=>navigate("translate")
        );

    document
        .getElementById("openVoiceClone")
        ?.addEventListener(
            "click",
            ()=>navigate("voiceClone")
        );

    document
        .getElementById("createVoiceClone")
        ?.addEventListener(
            "click",
            ()=>navigate("voiceClone")
        );

    document
        .getElementById("openImageStudio")
        ?.addEventListener(
            "click",
            ()=>navigate("imageStudio")
        );

    document
        .getElementById("generateImageButton")
        ?.addEventListener(
            "click",
            ()=>navigate("imageStudio")
        );

    document
        .getElementById("viewFiles")
        ?.addEventListener(
            "click",
            ()=>navigate("files")
        );

    document
        .getElementById("viewActivity")
        ?.addEventListener(
            "click",
            ()=>navigate("activity")
        );
}

// ==========================================
// REFRESH BUTTONS
// ==========================================

function initializeRefreshButtons(){

    document
        .getElementById(
            "refreshBackendStatus"
        )
        ?.addEventListener(
            "click",
            ()=>checkBackendStatus(true)
        );

    document
        .getElementById(
            "refreshDashboard"
        )
        ?.addEventListener(
            "click",
            ()=>refreshDashboard(true)
        );

    document
        .getElementById(
            "syncNow"
        )
        ?.addEventListener(
            "click",
            async()=>{

                await refreshDashboard(
                    true
                );

                showToast(
                    "Dashboard synced.",
                    "success"
                );

            }
        );

    document
        .getElementById(
            "logoutAccount"
        )
        ?.addEventListener(
            "click",
            logoutAccount
        );
}

// ==========================================
// LOGOUT
// ==========================================

async function logoutAccount(){

    if(!auth){

        showToast(
            "Authentication is unavailable.",
            "error"
        );

        return;
    }

    try{

        await signOut(auth);

        showToast(
            "Logged out successfully.",
            "success"
        );

        navigate("login");

    }
    catch(error){

        console.error(
            error
        );

        showToast(
            "Logout failed.",
            "error"
        );

    }
}

// ==========================================
// EchoCall AI
// File: js/home.js
// Part 2A — Dashboard Core
// ==========================================

// ==========================================
// TEXT HELPER
// ==========================================

function setText(id, value){

    const element =
        document.getElementById(id);

    if(element){

        element.textContent =
            value ?? "";

    }

}

// ==========================================
// INITIAL DASHBOARD REFRESH
// ==========================================

async function refreshDashboard(
    force = false
){

    if(!currentUser){

        clearDashboardForSignedOutUser();

        return;

    }

    try{

        setText(
            "syncStatus",
            "Syncing..."
        );

        populateAccountInformation(
            currentUser
        );

        populateProfile(
            currentUser
        );

        updateDeviceInformation();

        updateNetworkStatus();

        updateSecurityStatus(
            currentUser
        );

        await loadBackendInformation();

        await loadRecentCalls();

        await loadFavoriteContacts();

        await loadCallStatistics();

        loadLocalDashboardData();

        generateDashboardInsight();

        generateRecommendations();

        updateRecentActivity();

        setText(
            "syncStatus",
            "Synced"
        );

    }

    catch(error){

        console.error(
            "Dashboard refresh error:",
            error
        );

        setText(
            "syncStatus",
            "Sync failed"
        );

    }

}

// ==========================================
// ACCOUNT INFORMATION
// ==========================================

function populateAccountInformation(
    user
){

    if(!user){

        return;

    }

    setText(
        "accountEmail",
        user.email ||
        "No email"
    );

    setText(
        "membershipType",
        "Free"
    );

    setText(
        "joinedDate",
        formatDate(
            user.metadata?.creationTime
        )
    );

    setText(
        "lastLogin",
        formatDate(
            user.metadata?.lastSignInTime
        )
    );

}

// ==========================================
// PROFILE
// ==========================================

function populateProfile(
    user
){

    if(!user){

        return;

    }

    const image =
        document.getElementById(
            "homeProfileImage"
        );

    if(image){

        image.src =
            user.photoURL ||
            "assets/default-avatar.png";

    }

    const name =
        user.displayName ||
        user.email?.split("@")[0] ||
        "there";

    setText(
        "homeGreeting",
        `Welcome, ${name} 👋`
    );

    setText(
        "homeSubtitle",
        "Your intelligent communication assistant."
    );

}

// ==========================================
// SECURITY
// ==========================================

function updateSecurityStatus(
    user
){

    if(!user){

        setText(
            "authenticationStatus",
            "Not authenticated"
        );

        setText(
            "securityScore",
            "0%"
        );

        return;

    }

    const verified =
        user.emailVerified;

    setText(
        "authenticationStatus",
        verified
            ? "Verified"
            : "Email not verified"
    );

    setText(
        "securityScore",
        verified
            ? "100%"
            : "60%"
    );

    setText(
        "securityStatus",
        verified
            ? "Protected"
            : "Email not verified"
    );

}

// ==========================================
// NETWORK
// ==========================================

function updateNetworkStatus(){

    const online =
        navigator.onLine;

    setText(
        "networkStatus",
        online
            ? "Online"
            : "Offline"
    );

    setText(
        "deviceNetwork",
        online
            ? "Online"
            : "Offline"
    );

}

// ==========================================
// DEVICE INFORMATION
// ==========================================

function updateDeviceInformation(){

    const ua =
        navigator.userAgent || "";

    let browser =
        "Unknown";

    let os =
        "Unknown";

    if(ua.includes("Edg/")){

        browser =
            "Microsoft Edge";

    }
    else if(ua.includes("Chrome/")){

        browser =
            "Google Chrome";

    }
    else if(ua.includes("Firefox/")){

        browser =
            "Firefox";

    }
    else if(ua.includes("Safari/")){

        browser =
            "Safari";

    }

    if(ua.includes("Android")){

        os = "Android";

    }
    else if(
        ua.includes("iPhone") ||
        ua.includes("iPad")
    ){

        os = "iOS";

    }
    else if(ua.includes("Windows")){

        os = "Windows";

    }
    else if(ua.includes("Mac OS")){

        os = "macOS";

    }
    else if(ua.includes("Linux")){

        os = "Linux";

    }

    setText(
        "browserName",
        browser
    );

    setText(
        "osName",
        os
    );

    setText(
        "deviceName",
        os === "Android"
            ? "Android Device"
            : os
    );

}

// ==========================================
// END OF PART 2A
// ==========================================

// ==========================================
// PART 2B — BACKEND STATUS
// ==========================================

// ==========================================
// BACKEND CHECK
// ==========================================

async function checkBackendStatus(
    showMessage = false
){

    setText(
        "backendStatus",
        "Checking..."
    );

    setText(
        "apiStatus",
        "Checking..."
    );

    try{

        const response =
            await fetch(
                `${API_URL}/api/calls/info`,
                {
                    method: "GET"
                }
            );

        if(!response.ok){

            throw new Error(
                `Backend returned ${response.status}`
            );

        }

        const data =
            await response.json();

        if(data.success){

            setText(
                "backendStatus",
                "Online"
            );

            setText(
                "apiStatus",
                "Online"
            );

            if(showMessage){

                showToast(
                    "Backend is online.",
                    "success"
                );

            }

        }
        else{

            throw new Error(
                "Backend health check failed."
            );

        }

    }

    catch(error){

        console.error(
            "Backend status error:",
            error
        );

        setText(
            "backendStatus",
            "Offline"
        );

        setText(
            "apiStatus",
            "Offline"
        );

        if(showMessage){

            showToast(
                "Backend is unavailable.",
                "error"
            );

        }

    }

}

// ==========================================
// BACKEND INFORMATION
// ==========================================

async function loadBackendInformation(){

    try{

        const response =
            await fetch(
                `${API_URL}/api/calls/info`
            );

        if(!response.ok){

            throw new Error(
                "Backend unavailable"
            );

        }

        const data =
            await response.json();

        if(data.success){

            setText(
                "backendStatus",
                "Online"
            );

            setText(
                "apiStatus",
                "Online"
            );

        }

        // Firebase is already connected
        // through Firebase Authentication.

        setText(
            "firebaseStatus",
            auth
                ? "Connected"
                : "Unavailable"
        );

        // OpenAI is handled by the backend.
        // Do not expose the API key to frontend.

        setText(
            "openaiStatus",
            data.success
                ? "Connected"
                : "Unavailable"
        );

        setText(
            "storageStatus",
            "Ready"
        );

    }

    catch(error){

        console.error(
            "Backend information error:",
            error
        );

        setText(
            "backendStatus",
            "Offline"
        );

        setText(
            "apiStatus",
            "Offline"
        );

        setText(
            "firebaseStatus",
            auth
                ? "Connected"
                : "Unavailable"
        );

        setText(
            "openaiStatus",
            "Unavailable"
        );

        setText(
            "storageStatus",
            "Unavailable"
        );

    }

}

// ==========================================
// AUTHENTICATED API REQUEST
// ==========================================

async function apiRequest(
    endpoint,
    options = {}
){

    if(!currentUser){

        throw new Error(
            "User is not authenticated."
        );

    }

    const token =
        await currentUser.getIdToken();

    const headers = {

        ...(options.headers || {}),

        Authorization:
            `Bearer ${token}`

    };

    if(
        options.body &&
        !(options.body instanceof FormData)
    ){

        headers["Content-Type"] =
            "application/json";

    }

    const response =
        await fetch(

            `${CALLS_API}${endpoint}`,

            {
                ...options,
                headers
            }

        );

    let data = null;

    try{

        data =
            await response.json();

    }
    catch{

        data = null;

    }

    if(!response.ok){

        throw new Error(

            data?.message ||
            data?.error ||
            `Request failed: ${response.status}`

        );

    }

    return data;

}

// ==========================================
// END OF PART 2B
// ==========================================

// ==========================================
// PART 2C — CALLS & FAVORITES
// ==========================================

// ==========================================
// LOAD RECENT CALLS
// ==========================================

async function loadRecentCalls(){

    const container =
        document.getElementById(
            "recentCalls"
        );

    if(!container || !currentUser){

        return;

    }

    try{

        const data =
            await apiRequest(
                "/recent"
            );

        const calls =
            data.recentCalls || [];

        if(!calls.length){

            container.innerHTML = `
                <div class="empty-card glass">

                    <span class="material-symbols-rounded">
                        call
                    </span>

                    <h3>
                        No recent calls
                    </h3>

                    <p>
                        Your recent calls will appear here.
                    </p>

                </div>
            `;

            return;

        }

        container.innerHTML =
            calls
                .slice(0,5)
                .map(
                    renderCall
                )
                .join("");

    }

    catch(error){

        console.error(
            "Recent calls error:",
            error
        );

    }

}

// ==========================================
// RENDER CALL
// ==========================================

function renderCall(call){

    const phone =
        call.phoneNumber ||
        "Unknown number";

    const status =
        call.status ||
        "unknown";

    const duration =
        formatDuration(
            call.duration || 0
        );

    const date =
        formatDate(
            call.createdAt
        );

    return `
        <div class="call-item glass">

            <div class="call-item-icon">

                <span class="material-symbols-rounded">
                    call
                </span>

            </div>

            <div class="call-item-info">

                <strong>
                    ${escapeHTML(phone)}
                </strong>

                <span>
                    ${escapeHTML(status)}
                    • ${duration}
                </span>

            </div>

            <small>
                ${escapeHTML(date)}
            </small>

        </div>
    `;

}

// ==========================================
// LOAD FAVORITE CONTACTS
// ==========================================

async function loadFavoriteContacts(){

    const container =
        document.getElementById(
            "favoriteContacts"
        );

    if(!container || !currentUser){

        return;

    }

    try{

        const data =
            await apiRequest(
                "/favorites"
            );

        const favorites =
            data.favorites || [];

        if(!favorites.length){

            container.innerHTML = `
                <div class="empty-card glass">

                    <span class="material-symbols-rounded">
                        contacts
                    </span>

                    <h3>
                        No favourite contacts
                    </h3>

                    <p>
                        Your favorite contacts will appear here.
                    </p>

                </div>
            `;

            return;

        }

        container.innerHTML =
            favorites
                .slice(0,6)
                .map(
                    renderFavorite
                )
                .join("");

    }

    catch(error){

        console.error(
            "Favorite contacts error:",
            error
        );

    }

}

// ==========================================
// RENDER FAVORITE
// ==========================================

function renderFavorite(
    contact
){

    const name =
        contact.name ||
        contact.phoneNumber ||
        "Unknown";

    const phone =
        contact.phoneNumber ||
        "";

    return `
        <div class="contact-item glass">

            <div class="contact-avatar">

                <span class="material-symbols-rounded">
                    person
                </span>

            </div>

            <div class="contact-info">

                <strong>
                    ${escapeHTML(name)}
                </strong>

                <span>
                    ${escapeHTML(phone)}
                </span>

            </div>

        </div>
    `;

}

// ==========================================
// CALL STATISTICS
// ==========================================

async function loadCallStatistics(){

    try{

        const data =
            await apiRequest(
                "/statistics"
            );

        const stats =
            data.statistics || {};

        setText(
            "totalCalls",
            stats.totalCalls || 0
        );

        setText(
            "todayCalls",
            stats.totalCalls || 0
        );

    }

    catch(error){

        console.error(
            "Call statistics error:",
            error
        );

        setText(
            "totalCalls",
            "0"
        );

        setText(
            "todayCalls",
            "0"
        );

    }

}

// ==========================================
// FORMAT DURATION
// ==========================================

function formatDuration(
    seconds
){

    const total =
        Number(seconds) || 0;

    if(total <= 0){

        return "0 sec";

    }

    const minutes =
        Math.floor(
            total / 60
        );

    const remaining =
        total % 60;

    if(minutes === 0){

        return `${remaining} sec`;

    }

    return `${minutes}m ${remaining}s`;

}

// ==========================================
// FORMAT DATE
// ==========================================

function formatDate(
    value
){

    if(!value){

        return "Unknown";

    }

    try{

        let date;

        if(
            typeof value === "object" &&
            value._seconds
        ){

            date =
                new Date(
                    value._seconds * 1000
                );

        }
        else{

            date =
                new Date(value);

        }

        if(
            Number.isNaN(
                date.getTime()
            )
        ){

            return "Unknown";

        }

        return date.toLocaleDateString(
            undefined,
            {
                day: "numeric",
                month: "short",
                year: "numeric"
            }
        );

    }

    catch{

        return "Unknown";

    }

}

// ==========================================
// ESCAPE HTML
// ==========================================

function escapeHTML(
    value
){

    return String(
        value ?? ""
    )
    .replace(
        /&/g,
        "&amp;"
    )
    .replace(
        /</g,
        "&lt;"
    )
    .replace(
        />/g,
        "&gt;"
    )
    .replace(
        /"/g,
        "&quot;"
    )
    .replace(
        /'/g,
        "&#039;"
    );

}

// ==========================================
// END OF PART 2C
// ==========================================
// ==========================================
// PART 2D — AI CHATS, TRANSLATIONS & USAGE
// ==========================================

// ==========================================
// LOAD LOCAL DASHBOARD DATA
// ==========================================

function loadLocalDashboardData(){

    loadRecentAIChats();

    loadRecentTranslations();

    loadRecentFiles();

    updateUsageCounters();

}

// ==========================================
// RECENT AI CHATS
// ==========================================

function loadRecentAIChats(){

    const container =
        document.getElementById(
            "recentAiChats"
        );

    if(!container){

        return;

    }

    try{

        const chats =
            JSON.parse(
                localStorage.getItem(
                    "echoCallAIChats"
                ) || "[]"
            );

        if(!Array.isArray(chats) || !chats.length){

            container.innerHTML = `
                <div class="empty-card glass">

                    <span class="material-symbols-rounded">
                        forum
                    </span>

                    <h3>
                        No AI conversations yet
                    </h3>

                    <p>
                        Start chatting with EchoCall AI.
                    </p>

                </div>
            `;

            setText(
                "totalChats",
                "0"
            );

            setText(
                "todayChats",
                "0"
            );

            return;

        }

        const recent =
            chats
                .slice(-5)
                .reverse();

        container.innerHTML =
            recent
                .map(
                    renderAIChat
                )
                .join("");

        setText(
            "totalChats",
            chats.length
        );

        setText(
            "todayChats",
            countToday(chats)
        );

    }

    catch(error){

        console.error(
            "AI chat loading error:",
            error
        );

    }

}

// ==========================================
// RENDER AI CHAT
// ==========================================

function renderAIChat(
    chat
){

    const title =
        chat.title ||
        chat.prompt ||
        "AI Conversation";

    const date =
        formatDate(
            chat.createdAt ||
            chat.date
        );

    return `
        <div class="chat-item glass">

            <span class="material-symbols-rounded">
                smart_toy
            </span>

            <div>

                <strong>
                    ${escapeHTML(title)}
                </strong>

                <small>
                    ${escapeHTML(date)}
                </small>

            </div>

        </div>
    `;

}

// ==========================================
// RECENT TRANSLATIONS
// ==========================================

function loadRecentTranslations(){

    const container =
        document.getElementById(
            "translationHistory"
        );

    if(!container){

        return;

    }

    try{

        const translations =
            JSON.parse(
                localStorage.getItem(
                    "echoCallTranslations"
                ) || "[]"
            );

        if(
            !Array.isArray(translations) ||
            !translations.length
        ){

            container.innerHTML = `
                <div class="empty-card glass">

                    <span class="material-symbols-rounded">
                        translate
                    </span>

                    <h3>
                        No translations yet
                    </h3>

                    <p>
                        Your translated messages will appear here.
                    </p>

                </div>
            `;

            setText(
                "totalTranslations",
                "0"
            );

            setText(
                "todayTranslations",
                "0"
            );

            return;

        }

        container.innerHTML =
            translations
                .slice(-5)
                .reverse()
                .map(
                    renderTranslation
                )
                .join("");

        setText(
            "totalTranslations",
            translations.length
        );

        setText(
            "todayTranslations",
            countToday(
                translations
            )
        );

    }

    catch(error){

        console.error(
            "Translation loading error:",
            error
        );

    }

}

// ==========================================
// RENDER TRANSLATION
// ==========================================

function renderTranslation(
    item
){

    const source =
        item.source ||
        item.text ||
        "Translation";

    const language =
        item.language ||
        item.targetLanguage ||
        "Unknown language";

    return `
        <div class="translation-item glass">

            <span class="material-symbols-rounded">
                translate
            </span>

            <div>

                <strong>
                    ${escapeHTML(
                        truncate(
                            source,
                            50
                        )
                    )}
                </strong>

                <small>
                    ${escapeHTML(language)}
                </small>

            </div>

        </div>
    `;

}

// ==========================================
// RECENT FILES
// ==========================================

function loadRecentFiles(){

    const container =
        document.getElementById(
            "recentFiles"
        );

    if(!container){

        return;

    }

    try{

        const files =
            JSON.parse(
                localStorage.getItem(
                    "echoCallFiles"
                ) || "[]"
            );

        if(
            !Array.isArray(files) ||
            !files.length
        ){

            return;

        }

        container.innerHTML =
            files
                .slice(-5)
                .reverse()
                .map(
                    renderFile
                )
                .join("");

    }

    catch(error){

        console.error(
            "File loading error:",
            error
        );

    }

}

// ==========================================
// RENDER FILE
// ==========================================

function renderFile(
    file
){

    const name =
        file.name ||
        file.fileName ||
        "File";

    const type =
        file.type ||
        "File";

    return `
        <div class="file-item glass">

            <span class="material-symbols-rounded">
                folder
            </span>

            <div>

                <strong>
                    ${escapeHTML(name)}
                </strong>

                <small>
                    ${escapeHTML(type)}
                </small>

            </div>

        </div>
    `;

}

// ==========================================
// USAGE COUNTERS
// ==========================================

function updateUsageCounters(){

    const chats =
        getLocalArray(
            "echoCallAIChats"
        );

    const translations =
        getLocalArray(
            "echoCallTranslations"
        );

    const images =
        getLocalArray(
            "echoCallImages"
        );

    setText(
        "totalChats",
        chats.length
    );

    setText(
        "todayChats",
        countToday(chats)
    );

    setText(
        "totalTranslations",
        translations.length
    );

    setText(
        "todayTranslations",
        countToday(
            translations
        )
    );

    setText(
        "todayImages",
        countToday(images)
    );

}

// ==========================================
// GET LOCAL ARRAY
// ==========================================

function getLocalArray(
    key
){

    try{

        const data =
            JSON.parse(
                localStorage.getItem(key) ||
                "[]"
            );

        return Array.isArray(data)
            ? data
            : [];

    }

    catch{

        return [];

    }

}

// ==========================================
// COUNT TODAY
// ==========================================

function countToday(
    items
){

    const today =
        new Date();

    return items.filter(
        item => {

            const value =
                item.createdAt ||
                item.date ||
                item.timestamp;

            if(!value){

                return false;

            }

            const date =
                new Date(value);

            return(
                date.getDate() ===
                today.getDate() &&

                date.getMonth() ===
                today.getMonth() &&

                date.getFullYear() ===
                today.getFullYear()
            );

        }
    ).length;

}

// ==========================================
// TRUNCATE TEXT
// ==========================================

function truncate(
    value,
    length = 50
){

    const text =
        String(
            value ?? ""
        );

    if(
        text.length <= length
    ){

        return text;

    }

    return (
        text.substring(
            0,
            length
        ) + "..."
    );

}

// ==========================================
// END OF PART 2D
// ==========================================

// ==========================================
// PART 2E — ACTIVITY, INSIGHTS & STORAGE
// ==========================================

// ==========================================
// RECENT ACTIVITY
// ==========================================

function updateRecentActivity(){

    const container =
        document.getElementById(
            "recentActivity"
        );

    if(!container){

        return;

    }

    const activity =
        getLocalArray(
            "echoCallActivity"
        );

    if(!activity.length){

        container.innerHTML = `
            <div class="empty-card glass">

                <span class="material-symbols-rounded">
                    schedule
                </span>

                <h3>
                    No activity yet
                </h3>

                <p>
                    Your latest EchoCall AI activity will appear here.
                </p>

            </div>
        `;

        return;

    }

    container.innerHTML =
        activity
            .slice(-6)
            .reverse()
            .map(
                renderActivity
            )
            .join("");

}

// ==========================================
// RENDER ACTIVITY
// ==========================================

function renderActivity(
    item
){

    const title =
        item.title ||
        item.action ||
        "Activity";

    const description =
        item.description ||
        "";

    const icon =
        item.icon ||
        "schedule";

    const date =
        formatDate(
            item.createdAt ||
            item.timestamp
        );

    return `
        <div class="activity-item glass">

            <span class="material-symbols-rounded">
                ${escapeHTML(icon)}
            </span>

            <div>

                <strong>
                    ${escapeHTML(title)}
                </strong>

                <p>
                    ${escapeHTML(description)}
                </p>

                <small>
                    ${escapeHTML(date)}
                </small>

            </div>

        </div>
    `;

}

// ==========================================
// RECOMMENDATIONS
// ==========================================

function generateRecommendations(){

    const container =
        document.getElementById(
            "recommendationContainer"
        );

    if(!container){

        return;

    }

    const recommendations = [

        {
            icon: "smart_toy",
            title: "Chat with Echo",
            text: "Ask EchoCall AI a question."
        },

        {
            icon: "call",
            title: "Make an AI Call",
            text: "Start a secure AI-powered call."
        },

        {
            icon: "translate",
            title: "Translate",
            text: "Translate text or voice."
        }

    ];

    container.innerHTML =
        recommendations
            .map(
                item => `

                    <div class="recommendation-card glass">

                        <span class="material-symbols-rounded">
                            ${item.icon}
                        </span>

                        <h3>
                            ${escapeHTML(
                                item.title
                            )}
                        </h3>

                        <p>
                            ${escapeHTML(
                                item.text
                            )}
                        </p>

                    </div>

                `
            )
            .join("");

}

// ==========================================
// DAILY INSIGHT
// ==========================================

function generateDashboardInsight(){

    const element =
        document.getElementById(
            "dailyInsight"
        );

    if(!element){

        return;

    }

    const chats =
        getLocalArray(
            "echoCallAIChats"
        );

    const translations =
        getLocalArray(
            "echoCallTranslations"
        );

    const calls =
        getLocalArray(
            "echoCallCalls"
        );

    let insight =
        "Explore EchoCall AI to chat, translate, and manage your calls.";

    if(chats.length > 5){

        insight =
            "You have been using EchoCall AI regularly. Keep your conversations organized in History.";

    }
    else if(translations.length > 0){

        insight =
            "You have used translation recently. Try Voice Chat for faster communication.";

    }
    else if(calls.length > 0){

        insight =
            "Your call activity is growing. Check your recent calls to review your communication history.";

    }

    element.textContent =
        insight;

}

// ==========================================
// CLOUD STORAGE
// ==========================================

function initializeCloudStorage(){

    document
        .getElementById(
            "manageStorage"
        )
        ?.addEventListener(
            "click",
            ()=>navigate("files")
        );

    updateStorageDisplay();

}

// ==========================================
// STORAGE DISPLAY
// ==========================================

function updateStorageDisplay(){

    setText(
        "storageUsage",
        "Cloud storage ready"
    );

    const bar =
        document.getElementById(
            "storageProgressBar"
        );

    if(bar){

        bar.style.width =
            "5%";

    }

}

// ==========================================
// NOTIFICATIONS
// ==========================================

function initializeNotifications(){

    document
        .getElementById(
            "viewAllNotifications"
        )
        ?.addEventListener(
            "click",
            ()=>navigate("notifications")
        );

    loadHomeNotifications();

}

// ==========================================
// LOAD NOTIFICATIONS
// ==========================================

function loadHomeNotifications(){

    const container =
        document.getElementById(
            "homeNotifications"
        );

    if(!container){

        return;

    }

    const notifications =
        getLocalArray(
            "echoCallNotifications"
        );

    if(!notifications.length){

        return;

    }

    container.innerHTML =
        notifications
            .slice(-5)
            .reverse()
            .map(
                renderNotification
            )
            .join("");

}

// ==========================================
// RENDER NOTIFICATION
// ==========================================

function renderNotification(
    notification
){

    const title =
        notification.title ||
        "Notification";

    const message =
        notification.message ||
        "";

    return `
        <div class="notification-item glass">

            <span class="material-symbols-rounded">
                notifications
            </span>

            <div>

                <strong>
                    ${escapeHTML(title)}
                </strong>

                <p>
                    ${escapeHTML(message)}
                </p>

            </div>

        </div>
    `;

}

// ==========================================
// END OF PART 2E
// ==========================================

// ==========================================
// EchoCall AI
// File: js/home.js
// Part 2F
// ==========================================

// ==========================================
// DEVICE INFORMATION
// ==========================================

function initializeDeviceInformation(){

    updateDeviceInformation();

    window.addEventListener(
        "resize",
        updateDeviceInformation
    );

}

// ==========================================
// UPDATE DEVICE INFORMATION
// ==========================================

function updateDeviceInformation(){

    setText(
        "deviceName",
        getDeviceName()
    );

    setText(
        "browserName",
        getBrowserName()
    );

    setText(
        "osName",
        getOperatingSystem()
    );

    setText(
        "deviceNetwork",
        navigator.onLine
            ? "Online"
            : "Offline"
    );

}

// ==========================================
// DEVICE NAME
// ==========================================

function getDeviceName(){

    const userAgent =
        navigator.userAgent.toLowerCase();

    if(
        userAgent.includes("android")
    ){

        return "Android Device";

    }

    if(
        userAgent.includes("iphone")
    ){

        return "iPhone";

    }

    if(
        userAgent.includes("ipad")
    ){

        return "iPad";

    }

    if(
        userAgent.includes("windows")
    ){

        return "Windows PC";

    }

    if(
        userAgent.includes("mac")
    ){

        return "Mac";

    }

    if(
        userAgent.includes("linux")
    ){

        return "Linux Device";

    }

    return "Unknown Device";

}

// ==========================================
// BROWSER
// ==========================================

function getBrowserName(){

    const userAgent =
        navigator.userAgent;

    if(
        /Edg/i.test(userAgent)
    ){

        return "Microsoft Edge";

    }

    if(
        /Chrome/i.test(userAgent) &&
        !/Edg/i.test(userAgent)
    ){

        return "Google Chrome";

    }

    if(
        /Firefox/i.test(userAgent)
    ){

        return "Mozilla Firefox";

    }

    if(
        /Safari/i.test(userAgent) &&
        !/Chrome/i.test(userAgent)
    ){

        return "Safari";

    }

    return "Unknown Browser";

}

// ==========================================
// OPERATING SYSTEM
// ==========================================

function getOperatingSystem(){

    const userAgent =
        navigator.userAgent;

    if(
        /Android/i.test(userAgent)
    ){

        return "Android";

    }

    if(
        /iPhone|iPad|iPod/i.test(userAgent)
    ){

        return "iOS";

    }

    if(
        /Windows/i.test(userAgent)
    ){

        return "Windows";

    }

    if(
        /Mac/i.test(userAgent)
    ){

        return "macOS";

    }

    if(
        /Linux/i.test(userAgent)
    ){

        return "Linux";

    }

    return "Unknown OS";

}

// ==========================================
// NETWORK STATUS
// ==========================================

function updateNetworkStatus(){

    const online =
        navigator.onLine;

    setText(
        "networkStatus",
        online
            ? "Online"
            : "Offline"
    );

    setText(
        "deviceNetwork",
        online
            ? "Online"
            : "Offline"
    );

    if(online){

        setText(
            "syncStatus",
            "Connected"
        );

    }
    else{

        setText(
            "syncStatus",
            "Offline"
        );

    }

}

// ==========================================
// SECURITY CENTER
// ==========================================

function initializeSecurityCenter(){

    document
        .getElementById(
            "openSecurityCenter"
        )
        ?.addEventListener(
            "click",
            ()=>{
                navigate("security");
            }
        );

}

// ==========================================
// CLOUD STORAGE
// ==========================================

function initializeCloudStorage(){

    document
        .getElementById(
            "manageStorage"
        )
        ?.addEventListener(
            "click",
            ()=>{
                navigate("files");
            }
        );

}

// ==========================================
// NOTIFICATIONS
// ==========================================

function initializeNotifications(){

    document
        .getElementById(
            "viewAllNotifications"
        )
        ?.addEventListener(
            "click",
            ()=>{
                navigate("notifications");
            }
        );

}

// ==========================================
// SIMPLE TEXT HELPER
// ==========================================

function setText(
    id,
    value
){

    const element =
        document.getElementById(id);

    if(element){

        element.textContent =
            value ?? "";

    }

}

// ==========================================
// EchoCall AI
// File: js/home.js
// Part 3A
// ==========================================

// ==========================================
// BACKEND STATUS
// ==========================================

async function checkBackendStatus(

    showMessage = false

){

    setText(
        "backendStatus",
        "Checking..."
    );

    setText(
        "apiStatus",
        "Checking..."
    );

    try{

        const response =

            await fetch(

                `${CALLS_API}/info`,

                {

                    method: "GET",

                    headers: {

                        "Accept":
                        "application/json"

                    }

                }

            );

        if(!response.ok){

            throw new Error(
                `Backend returned ${response.status}`
            );

        }

        const data =
            await response.json();

        if(
            data.success &&
            data.status === "Running"
        ){

            setText(
                "backendStatus",
                "Online"
            );

            setText(
                "apiStatus",
                "Online"
            );

            if(showMessage){

                showToast(
                    "Backend is online.",
                    "success"
                );

            }

        }
        else{

            setText(
                "backendStatus",
                "Unavailable"
            );

            setText(
                "apiStatus",
                "Unavailable"
            );

            if(showMessage){

                showToast(
                    "Backend is not responding correctly.",
                    "error"
                );

            }

        }

    }
    catch(error){

        console.error(
            "Backend Status Error:",
            error
        );

        setText(
            "backendStatus",
            "Offline"
        );

        setText(
            "apiStatus",
            "Offline"
        );

        if(showMessage){

            showToast(
                "Unable to connect to backend.",
                "error"
            );

        }

    }

}

// ==========================================
// REFRESH DASHBOARD
// ==========================================

async function refreshDashboard(

    showLoading = false

){

    if(!currentUser){

        return;

    }

    homeAbortController?.abort();

    homeAbortController =
        new AbortController();

    if(showLoading){

        setText(
            "syncStatus",
            "Syncing..."
        );

    }

    try{

        await Promise.all([

            loadRecentCalls(),

            loadFavoriteContacts(),

            loadCallStatistics(),

            checkBackendStatus()

        ]);

        setText(
            "syncStatus",
            "Synced"
        );

    }
    catch(error){

        console.error(
            "Dashboard Refresh Error:",
            error
        );

        setText(
            "syncStatus",
            "Sync failed"
        );

    }

}

// ==========================================
// AUTH TOKEN
// ==========================================

async function getAuthHeaders(){

    if(!currentUser){

        throw new Error(
            "User is not authenticated."
        );

    }

    const token =
        await currentUser.getIdToken();

    return {

        "Authorization":
            `Bearer ${token}`,

        "Accept":
            "application/json",

        "Content-Type":
            "application/json"

    };

}

// ==========================================
// EchoCall AI
// File: js/home.js
// Part 3B
// ==========================================

// ==========================================
// LOAD RECENT CALLS
// ==========================================

async function loadRecentCalls(){

    const container =
        document.getElementById(
            "recentCalls"
        );

    if(!container || !currentUser){

        return;

    }

    try{

        const headers =
            await getAuthHeaders();

        const response =
            await fetch(

                `${CALLS_API}/recent`,

                {
                    method: "GET",
                    headers
                }

            );

        if(!response.ok){

            throw new Error(
                `Calls request failed: ${response.status}`
            );

        }

        const data =
            await response.json();

        const calls =
            data.recentCalls || [];

        renderRecentCalls(
            calls
        );

    }
    catch(error){

        console.error(
            "Recent Calls Error:",
            error
        );

        container.innerHTML = `

            <div class="empty-card glass">

                <span class="material-symbols-rounded">
                    error
                </span>

                <h3>
                    Unable to load calls
                </h3>

                <p>
                    Please try again later.
                </p>

            </div>

        `;

    }

}

// ==========================================
// RENDER RECENT CALLS
// ==========================================

function renderRecentCalls(
    calls
){

    const container =
        document.getElementById(
            "recentCalls"
        );

    if(!container){

        return;

    }

    if(!calls.length){

        container.innerHTML = `

            <div class="empty-card glass">

                <span class="material-symbols-rounded">
                    call
                </span>

                <h3>
                    No recent calls
                </h3>

                <p>
                    Your recent calls will appear here.
                </p>

            </div>

        `;

        return;

    }

    container.innerHTML =
        calls
            .map(
                createCallCard
            )
            .join("");

}

// ==========================================
// CREATE CALL CARD
// ==========================================

function createCallCard(
    call
){

    const phone =
        escapeHTML(
            call.phoneNumber ||
            "Unknown number"
        );

    const status =
        escapeHTML(
            call.status ||
            "unknown"
        );

    const duration =
        formatDuration(
            call.duration || 0
        );

    const date =
        formatDate(
            call.createdAt
        );

    return `

        <div class="call-item glass">

            <div class="call-item-icon">

                <span class="material-symbols-rounded">
                    call
                </span>

            </div>

            <div class="call-item-info">

                <strong>
                    ${phone}
                </strong>

                <span>
                    ${date}
                </span>

            </div>

            <div class="call-item-meta">

                <span>
                    ${status}
                </span>

                <small>
                    ${duration}
                </small>

            </div>

        </div>

    `;

}

// ==========================================
// LOAD FAVORITE CONTACTS
// ==========================================

async function loadFavoriteContacts(){

    const container =
        document.getElementById(
            "favoriteContacts"
        );

    if(!container || !currentUser){

        return;

    }

    try{

        const headers =
            await getAuthHeaders();

        const response =
            await fetch(

                `${CALLS_API}/favorites`,

                {
                    method: "GET",
                    headers
                }

            );

        if(!response.ok){

            throw new Error(
                `Favorites request failed: ${response.status}`
            );

        }

        const data =
            await response.json();

        const favorites =
            data.favorites || [];

        renderFavoriteContacts(
            favorites
        );

    }
    catch(error){

        console.error(
            "Favorites Error:",
            error
        );

        container.innerHTML = `

            <div class="empty-card glass">

                <span class="material-symbols-rounded">
                    error
                </span>

                <h3>
                    Unable to load contacts
                </h3>

                <p>
                    Please try again later.
                </p>

            </div>

        `;

    }

}

// ==========================================
// RENDER FAVORITE CONTACTS
// ==========================================

function renderFavoriteContacts(
    favorites
){

    const container =
        document.getElementById(
            "favoriteContacts"
        );

    if(!container){

        return;

    }

    if(!favorites.length){

        container.innerHTML = `

            <div class="empty-card glass">

                <span class="material-symbols-rounded">
                    contacts
                </span>

                <h3>
                    No favorite contacts
                </h3>

                <p>
                    Your favorite contacts will appear here.
                </p>

            </div>

        `;

        return;

    }

    container.innerHTML =
        favorites
            .map(
                createContactCard
            )
            .join("");

}

// ==========================================
// CREATE CONTACT CARD
// ==========================================

function createContactCard(
    contact
){

    const name =
        escapeHTML(
            contact.name ||
            contact.phoneNumber ||
            "Contact"
        );

    const phone =
        escapeHTML(
            contact.phoneNumber ||
            ""
        );

    return `

        <div class="contact-item glass">

            <div class="contact-avatar">

                <span class="material-symbols-rounded">
                    person
                </span>

            </div>

            <div class="contact-info">

                <strong>
                    ${name}
                </strong>

                <span>
                    ${phone}
                </span>

            </div>

        </div>

    `;

}

// ==========================================
// LOAD CALL STATISTICS
// ==========================================

async function loadCallStatistics(){

    if(!currentUser){

        return;

    }

    try{

        const headers =
            await getAuthHeaders();

        const response =
            await fetch(

                `${CALLS_API}/statistics`,

                {
                    method: "GET",
                    headers
                }

            );

        if(!response.ok){

            throw new Error(
                `Statistics request failed: ${response.status}`
            );

        }

        const data =
            await response.json();

        const statistics =
            data.statistics || {};

        const totalCalls =
            Number(
                statistics.totalCalls || 0
            );

        setText(
            "totalCalls",
            totalCalls
        );

        setText(
    "todayCalls",
    statistics.todayCalls || 0
);

    }
    catch(error){

        console.error(
            "Call Statistics Error:",
            error
        );

        setText(
            "totalCalls",
            "0"
        );

        setText(
            "todayCalls",
            "0"
        );

    }

}

// ==========================================
// FORMAT DURATION
// ==========================================

function formatDuration(
    seconds
){

    seconds =
        Number(seconds) || 0;

    if(seconds < 60){

        return `${seconds}s`;

    }

    const minutes =
        Math.floor(
            seconds / 60
        );

    const remaining =
        seconds % 60;

    return `${minutes}m ${remaining}s`;

}

// ==========================================
// FORMAT DATE
// ==========================================

function formatDate(
    value
){

    if(!value){

        return "Unknown date";

    }

    try{

        let date;

        if(
            typeof value === "object" &&
            value._seconds
        ){

            date =
                new Date(
                    value._seconds * 1000
                );

        }
        else{

            date =
                new Date(value);

        }

        if(
            Number.isNaN(
                date.getTime()
            )
        ){

            return "Unknown date";

        }

        return date.toLocaleString();

    }
    catch{

        return "Unknown date";

    }

}

// ==========================================
// ESCAPE HTML
// ==========================================

function escapeHTML(
    value
){

    return String(value ?? "")
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}