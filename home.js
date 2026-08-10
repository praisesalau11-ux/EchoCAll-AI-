// ==========================================
// EchoCall AI
// File: js/home.js
// Part 1
// ==========================================

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
// Backend
// ==========================================

const API_URL =
    "https://echocall-ai-backend.onrender.com";

// ==========================================
// Initialize Home
// ==========================================

export function initializeHome() {

    console.log(
        "EchoCall AI Home initialized."
    );

    initializeHeroButtons();

    initializeQuickActions();

    initializeQuickSettings();

    initializeHomeStatus();

    initializeHomeUtilities();

}

// ==========================================
// Hero Buttons
// ==========================================

function initializeHeroButtons() {

    const startAiChatButton =
        document.getElementById(
            "startAiChatButton"
        );

    const newCallButton =
        document.getElementById(
            "newCallButton"
        );

    const voiceButton =
        document.getElementById(
            "startVoiceInput"
        );

    const homeProfileImage =
        document.getElementById(
            "homeProfileImage"
        );

    // ======================================
    // Chat With AI
    // ======================================

    startAiChatButton?.addEventListener(

        "click",

        () => {

            const floatingAiButton =
                document.getElementById(
                    "floatingAiButton"
                );

            if (floatingAiButton) {

                floatingAiButton.click();

            }
            else {

                showToast(
                    "AI Assistant is unavailable.",
                    "error"
                );

            }

        }

    );

    // ======================================
    // New Call
    // ======================================

    newCallButton?.addEventListener(

        "click",

        () => {

            navigate("calls");

        }

    );

    // ======================================
    // Voice Chat
    // ======================================

voiceButton?.addEventListener(

    "click",

    () => {

        const floatingAiButton =
            document.getElementById(
                "floatingAiButton"
            );

        if (floatingAiButton) {

            floatingAiButton.click();

        }

        setTimeout(() => {

            startVoiceInput();

        }, 300);

    }

);

    // ======================================
    // Profile Image
    // ======================================

    homeProfileImage?.addEventListener(

        "click",

        () => {

            navigate("profile");

        }

    );

}

// ==========================================
// Quick Actions
// ==========================================

function initializeQuickActions() {

    const quickAi =
        document.getElementById(
            "quickAi"
        );

    const quickTranslate =
        document.getElementById(
            "quickTranslate"
        );

    const quickVoiceClone =
        document.getElementById(
            "quickVoiceClone"
        );

    const quickContacts =
        document.getElementById(
            "quickContacts"
        );

    const quickCalls =
        document.getElementById(
            "quickCalls"
        );

    const quickHistory =
        document.getElementById(
            "quickHistory"
        );

    // ======================================
    // AI Assistant
    // ======================================

    quickAi?.addEventListener(

        "click",

        () => {

            const floatingAiButton =
                document.getElementById(
                    "floatingAiButton"
                );

            if (floatingAiButton) {

                floatingAiButton.click();

            }
            else {

                showToast(
                    "AI Assistant is unavailable.",
                    "error"
                );

            }

        }

    );

    // ======================================
    // Translation
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

    // ======================================
    // Voice Clone
    // ======================================

    quickVoiceClone?.addEventListener(

        "click",

        () => {

            navigate("voiceClone");

        }

    );

    // ======================================
    // Contacts
    // ======================================

    quickContacts?.addEventListener(

        "click",

        () => {

            navigate("contacts");

        }

    );

    // ======================================
    // Calls
    // ======================================

    quickCalls?.addEventListener(

        "click",

        () => {

            navigate("calls");

        }

    );

    // ======================================
    // History
    // ======================================

    quickHistory?.addEventListener(

        "click",

        () => {

            navigate("history");

        }

    );

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
// Quick Settings
// ==========================================

function initializeQuickSettings() {

    const openProfile =
        document.getElementById(
            "openProfile"
        );

    const openSettings =
        document.getElementById(
            "openSettings"
        );

    const openSecurity =
        document.getElementById(
            "openSecurity"
        );

    const openPremium =
        document.getElementById(
            "openPremium"
        );

    // ======================================
    // Profile
    // ======================================

    openProfile?.addEventListener(

        "click",

        () => {

            navigate("profile");

        }

    );

    // ======================================
    // Settings
    // ======================================

    openSettings?.addEventListener(

        "click",

        () => {

            navigate("settings");

        }

    );

    // ======================================
    // Security
    // ======================================

    openSecurity?.addEventListener(

        "click",

        () => {

            navigate("security");

        }

    );

    // ======================================
    // Premium
    // ======================================

    openPremium?.addEventListener(

        "click",

        () => {

            navigate("premium");

        }

    );

}

// ==========================================
// Home System Status
// ==========================================

function initializeHomeStatus() {

    updateNetworkStatus();

    checkBackendStatus();

    updateSyncStatus();

    updateSecurityStatus();

    window.addEventListener(

        "online",

        updateNetworkStatus

    );

    window.addEventListener(

        "offline",

        updateNetworkStatus

    );

}

// ==========================================
// Network Status
// ==========================================

function updateNetworkStatus() {

    const networkStatus =
        document.getElementById(
            "networkStatus"
        );

    const deviceNetwork =
        document.getElementById(
            "deviceNetwork"
        );

    if (navigator.onLine) {

        if (networkStatus) {

            networkStatus.textContent =
                "Online";

        }

        if (deviceNetwork) {

            deviceNetwork.textContent =
                "Connected";

        }

    }
    else {

        if (networkStatus) {

            networkStatus.textContent =
                "Offline";

        }

        if (deviceNetwork) {

            deviceNetwork.textContent =
                "Disconnected";

        }

    }

}

// ==========================================
// Backend Status
// ==========================================

async function checkBackendStatus() {

    const backendStatus =
        document.getElementById(
            "backendStatus"
        );

    const apiStatus =
        document.getElementById(
            "apiStatus"
        );

    if (!navigator.onLine) {

        setStatus(
            backendStatus,
            "Offline"
        );

        setStatus(
            apiStatus,
            "Offline"
        );

        return;

    }

    setStatus(
        backendStatus,
        "Checking..."
    );

    setStatus(
        apiStatus,
        "Checking..."
    );

    try {

        const response = await fetch(

            API_URL,

            {
                method: "GET"
            }

        );

        if (response.ok) {

            setStatus(
                backendStatus,
                "Online"
            );

            setStatus(
                apiStatus,
                "Online"
            );

        }
        else {

            setStatus(
                backendStatus,
                "Unavailable"
            );

            setStatus(
                apiStatus,
                "Unavailable"
            );

        }

    }
    catch (error) {

        console.warn(
            "Backend status check failed:",
            error
        );

        setStatus(
            backendStatus,
            "Unavailable"
        );

        setStatus(
            apiStatus,
            "Unavailable"
        );

    }

}

// ==========================================
// Firebase / Sync Status
// ==========================================

function updateSyncStatus() {

    const syncStatus =
        document.getElementById(
            "syncStatus"
        );

    const firebaseStatus =
        document.getElementById(
            "firebaseStatus"
        );

    if (syncStatus) {

        syncStatus.textContent =
            "Ready";

    }

    if (firebaseStatus) {

        firebaseStatus.textContent =
            "Connected";

    }

}

// ==========================================
// Security Status
// ==========================================

function updateSecurityStatus() {

    const securityStatus =
        document.getElementById(
            "securityStatus"
        );

    const authenticationStatus =
        document.getElementById(
            "authenticationStatus"
        );

    const securityScore =
        document.getElementById(
            "securityScore"
        );

    if (securityStatus) {

        securityStatus.textContent =
            "Protected";

    }

    if (authenticationStatus) {

        authenticationStatus.textContent =
            "Verified";

    }

    if (securityScore) {

        securityScore.textContent =
            "100%";

    }

}

// ==========================================
// Status Helper
// ==========================================

function setStatus(

    element,

    message

) {

    if (!element) {

        return;

    }

    element.textContent =
        message;

}

// ==========================================
// Home Utilities
// ==========================================

function initializeHomeUtilities() {

    initializeDashboardButtons();

    initializeDeviceInformation();

    initializeRefreshButtons();

}

// ==========================================
// Dashboard Buttons
// ==========================================

function initializeDashboardButtons() {

    document

        .getElementById(
            "viewAllAiChats"
        )

        ?.addEventListener(

            "click",

            () => {

                navigate("history");

            }

        );

    document

        .getElementById(
            "viewAllCalls"
        )

        ?.addEventListener(

            "click",

            () => {

                navigate("calls");

            }

        );

    document

        .getElementById(
            "viewContacts"
        )

        ?.addEventListener(

            "click",

            () => {

                navigate("contacts");

            }

        );

    document

        .getElementById(
            "viewTranslations"
        )

        ?.addEventListener(

            "click",

            () => {

                showToast(

                    "Translation history is coming soon.",

                    "warning"

                );

            }

        );

    document

        .getElementById(
            "openVoiceClone"
        )

        ?.addEventListener(

            "click",

            () => {

                navigate("voiceClone");

            }

        );

    document

        .getElementById(
            "createVoiceClone"
        )

        ?.addEventListener(

            "click",

            () => {

                navigate("voiceClone");

            }

        );

    document

        .getElementById(
            "openImageStudio"
        )

        ?.addEventListener(

            "click",

            () => {

                showToast(

                    "Image Studio is coming soon.",

                    "warning"

                );

            }

        );

    document

        .getElementById(
            "generateImageButton"
        )

        ?.addEventListener(

            "click",

            () => {

                showToast(

                    "AI Image Generator is coming soon.",

                    "warning"

                );

            }

        );

    document

        .getElementById(
            "viewFiles"
        )

        ?.addEventListener(

            "click",

            () => {

                showToast(

                    "Cloud files are coming soon.",

                    "warning"

                );

            }

        );

    document

        .getElementById(
            "viewActivity"
        )

        ?.addEventListener(

            "click",

            () => {

                showToast(

                    "Activity history is coming soon.",

                    "warning"

                );

            }

        );

}

// ==========================================
// Device Information
// ==========================================

function initializeDeviceInformation() {

    const deviceName =
        document.getElementById(
            "deviceName"
        );

    const browserName =
        document.getElementById(
            "browserName"
        );

    const osName =
        document.getElementById(
            "osName"
        );

    if (deviceName) {

        deviceName.textContent =
            getDeviceName();

    }

    if (browserName) {

        browserName.textContent =
            getBrowserName();

    }

    if (osName) {

        osName.textContent =
            getOperatingSystem();

    }

}

// ==========================================
// Device Name
// ==========================================

function getDeviceName() {

    const ua =
        navigator.userAgent;

    if (/Android/i.test(ua)) {

        return "Android Device";

    }

    if (/iPhone|iPad|iPod/i.test(ua)) {

        return "Apple Device";

    }

    if (/Windows/i.test(ua)) {

        return "Windows PC";

    }

    if (/Macintosh|Mac OS/i.test(ua)) {

        return "Mac";

    }

    return "Unknown Device";

}

// ==========================================
// Browser
// ==========================================

function getBrowserName() {

    const ua =
        navigator.userAgent;

    if (
        /Edg/i.test(ua)
    ) {

        return "Microsoft Edge";

    }

    if (
        /Chrome/i.test(ua)
    ) {

        return "Google Chrome";

    }

    if (
        /Firefox/i.test(ua)
    ) {

        return "Mozilla Firefox";

    }

    if (
        /Safari/i.test(ua) &&
        !/Chrome/i.test(ua)
    ) {

        return "Safari";

    }

    return "Unknown Browser";

}

// ==========================================
// Operating System
// ==========================================

function getOperatingSystem() {

    const ua =
        navigator.userAgent;

    if (/Android/i.test(ua)) {

        return "Android";

    }

    if (
        /iPhone|iPad|iPod/i.test(ua)
    ) {

        return "iOS";

    }

    if (/Windows/i.test(ua)) {

        return "Windows";

    }

    if (/Mac OS/i.test(ua)) {

        return "macOS";

    }

    if (/Linux/i.test(ua)) {

        return "Linux";

    }

    return "Unknown OS";

}

// ==========================================
// Refresh Buttons
// ==========================================

function initializeRefreshButtons() {

    document

        .getElementById(
            "refreshBackendStatus"
        )

        ?.addEventListener(

            "click",

            async () => {

                await checkBackendStatus();

                showToast(

                    "Backend status refreshed."

                );

            }

        );

    document

        .getElementById(
            "refreshDashboard"
        )

        ?.addEventListener(

            "click",

            () => {

                window.location.reload();

            }

        );

    document

        .getElementById(
            "syncNow"
        )

        ?.addEventListener(

            "click",

            () => {

                updateSyncStatus();

                showToast(

                    "Sync completed."

                );

            }

        );

}

// ==========================================
// End Part 2
// ==========================================
 // ==========================================
// EchoCall AI
// File: js/home.js
// Part 3
// Append below Part 2
// ==========================================

// ==========================================
// Account Information
// ==========================================

function initializeAccountInformation() {

    const accountEmail =
        document.getElementById(
            "accountEmail"
        );

    const membershipType =
        document.getElementById(
            "membershipType"
        );

    const joinedDate =
        document.getElementById(
            "joinedDate"
        );

    const lastLogin =
        document.getElementById(
            "lastLogin"
        );

    /*
     * app.js handles Firebase authentication.
     * We do not duplicate authentication here.
     *
     * Firebase user information can be exposed
     * through the current authenticated session.
     */

    if (
        typeof window !== "undefined" &&
        window.currentUser
    ) {

        const user =
            window.currentUser;

        if (accountEmail) {

            accountEmail.textContent =
                user.email || "Unavailable";

        }

        if (lastLogin) {

            lastLogin.textContent =
                formatDate(
                    user.metadata?.lastSignInTime
                );

        }

    }

    if (membershipType) {

        membershipType.textContent =
            "Free";

    }

    if (joinedDate) {

        joinedDate.textContent =
            "Available after account sync";

    }

}

// ==========================================
// Date Formatter
// ==========================================

function formatDate(dateValue) {

    if (!dateValue) {

        return "Unavailable";

    }

    const date =
        new Date(dateValue);

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "Unavailable";

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

// ==========================================
// AI Usage
// ==========================================

function initializeAIUsage() {

    const todayChats =
        document.getElementById(
            "todayChats"
        );

    const todayCalls =
        document.getElementById(
            "todayCalls"
        );

    const todayImages =
        document.getElementById(
            "todayImages"
        );

    const todayTranslations =
        document.getElementById(
            "todayTranslations"
        );

    /*
     * Calls, images and translations are not
     * connected yet, so we start them at zero.
     *
     * AI chat usage will be connected to
     * Firestore later.
     */

    if (todayChats) {

        todayChats.textContent =
            "0";

    }

    if (todayCalls) {

        todayCalls.textContent =
            "0";

    }

    if (todayImages) {

        todayImages.textContent =
            "0";

    }

    if (todayTranslations) {

        todayTranslations.textContent =
            "0";

    }

}

// ==========================================
// Account Summary
// ==========================================

function initializeAccountSummary() {

    const totalContacts =
        document.getElementById(
            "totalContacts"
        );

    const totalCalls =
        document.getElementById(
            "totalCalls"
        );

    const totalChats =
        document.getElementById(
            "totalChats"
        );

    const totalTranslations =
        document.getElementById(
            "totalTranslations"
        );

    if (totalContacts) {

        totalContacts.textContent =
            "0";

    }

    if (totalCalls) {

        totalCalls.textContent =
            "0";

    }

    if (totalChats) {

        totalChats.textContent =
            "0";

    }

    if (totalTranslations) {

        totalTranslations.textContent =
            "0";

    }

}

// ==========================================
// Storage
// ==========================================

function initializeStorage() {

    const storageUsage =
        document.getElementById(
            "storageUsage"
        );

    const storageProgressBar =
        document.getElementById(
            "storageProgressBar"
        );

    if (storageUsage) {

        storageUsage.textContent =
            "Storage usage unavailable";

    }

    if (storageProgressBar) {

        storageProgressBar.style.width =
            "0%";

    }

}

// ==========================================
// Daily Insight
// ==========================================

function initializeDailyInsight() {

    const dailyInsight =
        document.getElementById(
            "dailyInsight"
        );

    if (!dailyInsight) {

        return;

    }

    dailyInsight.textContent =
        "Start a conversation with EchoCall AI to receive personalized insights.";

}

// ==========================================
// Recommendations
// ==========================================

function initializeRecommendations() {

    const container =
        document.getElementById(
            "recommendationContainer"
        );

    if (!container) {

        return;

    }

    /*
     * Do not replace the HTML unnecessarily.
     * The default recommendation already exists
     * in home.html.
     */

}

// ==========================================
// Recent AI Chats
// ==========================================

function initializeRecentAIChats() {

    const container =
        document.getElementById(
            "recentAiChats"
        );

    if (!container) {

        return;

    }

    /*
     * The AI conversation itself is currently
     * managed by ai.js.
     *
     * Persistent chat history will be connected
     * to Firestore in a later step.
     */

}

// ==========================================
// Recent Calls
// ==========================================

function initializeRecentCalls() {

    const container =
        document.getElementById(
            "recentCalls"
        );

    if (!container) {

        return;

    }

    /*
     * Twilio calling is not connected yet.
     * Keep the empty state until the backend
     * calling system is implemented.
     */

}

// ==========================================
// Favorite Contacts
// ==========================================

function initializeFavoriteContacts() {

    const container =
        document.getElementById(
            "favoriteContacts"
        );

    if (!container) {

        return;

    }

    /*
     * Contacts will be connected to Firestore
     * later.
     */

}

// ==========================================
// Translation History
// ==========================================

function initializeTranslationHistory() {

    const container =
        document.getElementById(
            "translationHistory"
        );

    if (!container) {

        return;

    }

    /*
     * Translation backend is not connected yet.
     */

}

// ==========================================
// Recent Files
// ==========================================

function initializeRecentFiles() {

    const container =
        document.getElementById(
            "recentFiles"
        );

    if (!container) {

        return;

    }

    /*
     * Firebase Storage integration will populate
     * this section later.
     */

}

// ==========================================
// Recent Activity
// ==========================================

function initializeRecentActivity() {

    const container =
        document.getElementById(
            "recentActivity"
        );

    if (!container) {

        return;

    }

    /*
     * Activity history will eventually be loaded
     * from Firestore.
     */

}

// ==========================================
// Cloud Storage
// ==========================================

function initializeCloudStorage() {

    const manageStorage =
        document.getElementById(
            "manageStorage"
        );

    manageStorage?.addEventListener(

        "click",

        () => {

            showToast(

                "Cloud storage management is coming soon.",

                "warning"

            );

        }

    );

}

// ==========================================
// Security Center
// ==========================================

function initializeSecurityCenter() {

    const openSecurityCenter =
        document.getElementById(
            "openSecurityCenter"
        );

    openSecurityCenter?.addEventListener(

        "click",

        () => {

            navigate("security");

        }

    );

}

// ==========================================
// Notifications
// ==========================================

function initializeNotifications() {

    const viewAllNotifications =
        document.getElementById(
            "viewAllNotifications"
        );

    viewAllNotifications?.addEventListener(

        "click",

        () => {

            showToast(

                "Notifications are coming soon.",

                "warning"

            );

        }

    );

}

// ==========================================
// Initialize Part 3
// ==========================================

function initializePart3() {

    initializeAccountInformation();

    initializeAIUsage();

    initializeAccountSummary();

    initializeStorage();

    initializeDailyInsight();

    initializeRecommendations();

    initializeRecentAIChats();

    initializeRecentCalls();

    initializeFavoriteContacts();

    initializeTranslationHistory();

    initializeRecentFiles();

    initializeRecentActivity();

    initializeCloudStorage();

    initializeSecurityCenter();

    initializeNotifications();

}

// ==========================================
// Run Part 3
// ==========================================

initializePart3();

// ==========================================
// End Part 3
// ==========================================