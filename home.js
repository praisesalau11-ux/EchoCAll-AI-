// ==========================================
// EchoCall AI
// File: js/home.js
// Home Dashboard
// Part 1
// ==========================================


// ==========================================
// Firebase Authentication
// ==========================================

import {
    auth
} from "./firebase.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {
    showToast
} from "./toast.js";


// ==========================================
// State
// ==========================================

let currentUser = null;

let homeInitialized = false;


// ==========================================
// DOM Elements
// ==========================================

// ------------------------------------------
// Hero
// ------------------------------------------

let homeGreeting = null;
let homeSubtitle = null;
let homeProfileImage = null;

let startAiChatButton = null;
let newCallButton = null;
let startVoiceInputButton = null;


// ------------------------------------------
// Quick Actions
// ------------------------------------------

let quickAi = null;
let quickTranslate = null;
let quickContacts = null;
let quickCalls = null;
let quickHistory = null;
let quickNotifications = null;


// ------------------------------------------
// Recent Sections
// ------------------------------------------

let recentAiChats = null;
let recentCalls = null;
let favoriteContacts = null;
let homeNotifications = null;


// ------------------------------------------
// Voice Clone
// ------------------------------------------

let openVoiceClone = null;
let createVoiceClone = null;


// ------------------------------------------
// Image Studio
// ------------------------------------------

let openImageStudio = null;
let generateImageButton = null;


// ------------------------------------------
// Dashboard Controls
// ------------------------------------------

let viewAllAiChats = null;
let viewAllCalls = null;
let viewContacts = null;
let viewAllNotifications = null;

let refreshDashboard = null;
let logoutAccount = null;


// ==========================================
// Initialize Home
// ==========================================

export function initializeHome() {

    console.log(
        "EchoCall AI → Initializing Home"
    );


    // ======================================
    // Prevent Duplicate Initialization
    // ======================================

    if (homeInitialized) {

        console.log(
            "EchoCall Home → Already initialized."
        );

        return;

    }


    // ======================================
    // Find Hero Elements
    // ======================================

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
    // Find Quick Actions
    // ======================================

    quickAi =
        document.getElementById(
            "quickAi"
        );

    quickTranslate =
        document.getElementById(
            "quickTranslate"
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

    quickNotifications =
        document.getElementById(
            "quickNotifications"
        );


    // ======================================
    // Find Recent Sections
    // ======================================

    recentAiChats =
        document.getElementById(
            "recentAiChats"
        );

    recentCalls =
        document.getElementById(
            "recentCalls"
        );

    favoriteContacts =
        document.getElementById(
            "favoriteContacts"
        );

    homeNotifications =
        document.getElementById(
            "homeNotifications"
        );


    // ======================================
    // Find Voice Clone Controls
    // ======================================

    openVoiceClone =
        document.getElementById(
            "openVoiceClone"
        );

    createVoiceClone =
        document.getElementById(
            "createVoiceClone"
        );


    // ======================================
    // Find Image Studio Controls
    // ======================================

    openImageStudio =
        document.getElementById(
            "openImageStudio"
        );

    generateImageButton =
        document.getElementById(
            "generateImageButton"
        );


    // ======================================
    // Find Dashboard Controls
    // ======================================

    viewAllAiChats =
        document.getElementById(
            "viewAllAiChats"
        );

    viewAllCalls =
        document.getElementById(
            "viewAllCalls"
        );

    viewContacts =
        document.getElementById(
            "viewContacts"
        );

    viewAllNotifications =
        document.getElementById(
            "viewAllNotifications"
        );

    refreshDashboard =
        document.getElementById(
            "refreshDashboard"
        );

    logoutAccount =
        document.getElementById(
            "logoutAccount"
        );


    // ======================================
    // Initialize Home Events
    // ======================================

    initializeHomeEvents();


    // ======================================
    // Initialize Authentication
    // ======================================

    initializeHomeAuth();


    // ======================================
    // Mark Home Initialized
    // ======================================

    homeInitialized = true;


    console.log(
        "EchoCall AI → Home Part 1 initialized."
    );

}


// ==========================================
// Authentication
// ==========================================

function initializeHomeAuth() {

    onAuthStateChanged(
        auth,
        async (user) => {

            // ==================================
            // No User
            // ==================================

            if (!user) {

    currentUser = null;

    console.warn(
        "EchoCall Home → No authenticated user."
    );

    clearHomeUserData();

    return;
            }


            // ==================================
            // Store Current User
            // ==================================

            currentUser = user;


            console.log(
                "EchoCall Home → Authenticated user:",
                user.uid
            );


            // ==================================
            // Update Basic Home UI
            // ==================================

            updateHomeGreeting(
                user
            );

            updateHomeProfileImage(
                user
            );


            // ==================================
            // Firestore Dashboard Loading
            // ==================================
            //
            // Part 2A / Part 2B will provide
            // the actual dashboard data functions.
            //
            // ==================================

            if (
                typeof loadHomeData ===
                "function"
            ) {

                await loadHomeData();

            }

        }
    );

}


// ==========================================
// Update Home Greeting
// ==========================================

function updateHomeGreeting(user) {

    if (!homeGreeting) {

        return;

    }


    const displayName =
        getUserDisplayName(
            user
        );


    homeGreeting.textContent =
        `${getGreeting()}, ${displayName} 👋`;

}


// ==========================================
// Default Home Greeting
// ==========================================

function setDefaultHomeGreeting() {

    if (!homeGreeting) {

        return;

    }


    homeGreeting.textContent =
        "Welcome 👋";

}


// ==========================================
// Get Greeting
// ==========================================

function getGreeting() {

    const hour =
        new Date().getHours();


    // --------------------------------------
    // Morning
    // --------------------------------------

    if (hour < 12) {

        return "Good morning";

    }


    // --------------------------------------
    // Afternoon
    // --------------------------------------

    if (hour < 18) {

        return "Good afternoon";

    }


    // --------------------------------------
    // Evening
    // --------------------------------------

    if (hour < 21) {

        return "Good evening";

    }


    // --------------------------------------
    // Night
    // --------------------------------------

    return "Good night";

}


// ==========================================
// Get User Display Name
// ==========================================

function getUserDisplayName(user) {

    if (!user) {

        return "there";

    }


    // --------------------------------------
    // Firebase Auth Display Name
    // --------------------------------------

    if (
        user.displayName &&
        user.displayName.trim()
    ) {

        return user.displayName.trim();

    }


    // --------------------------------------
    // Email Fallback
    // --------------------------------------

    if (user.email) {

        const emailName =
            user.email.split("@")[0];


        if (emailName) {

            return emailName;

        }

    }


    return "there";

}


// ==========================================
// Update Home Profile Image
// ==========================================

function updateHomeProfileImage(user) {

    if (!homeProfileImage) {

        return;

    }


    // --------------------------------------
    // Firebase Profile Image
    // --------------------------------------

    if (
        user &&
        user.photoURL
    ) {

        homeProfileImage.src =
            user.photoURL;


        homeProfileImage.onerror =
            () => {

                homeProfileImage.src =
                    "assets/default-avatar.png";

            };


        return;

    }


    // --------------------------------------
    // Default Avatar
    // --------------------------------------

    homeProfileImage.src =
        "assets/default-avatar.png";

}


// ==========================================
// Home Events
// ==========================================

function initializeHomeEvents() {


    // ======================================
    // Hero Buttons
    // ======================================

    startAiChatButton?.addEventListener(
        "click",
        handleStartAIChat
    );


    newCallButton?.addEventListener(
        "click",
        handleNewCall
    );


    startVoiceInputButton?.addEventListener(
        "click",
        handleVoiceChat
    );


    // ======================================
    // Quick AI
    // ======================================

    quickAi?.addEventListener(
        "click",
        handleStartAIChat
    );


    // ======================================
    // Quick Translate
    // ======================================

    quickTranslate?.addEventListener(
        "click",
        handleTranslate
    );


    // ======================================
    // Quick Contacts
    // ======================================

    quickContacts?.addEventListener(
        "click",
        handleContacts
    );


    // ======================================
    // Quick Calls
    // ======================================

    quickCalls?.addEventListener(
        "click",
        handleCalls
    );


    // ======================================
    // Quick History
    // ======================================

    quickHistory?.addEventListener(
        "click",
        handleHistory
    );


    // ======================================
    // Quick Notifications
    // ======================================

    quickNotifications?.addEventListener(
        "click",
        handleNotifications
    );

}


// ==========================================
// Start AI Chat
// ==========================================

function handleStartAIChat() {

    console.log(
        "EchoCall Home → Opening AI"
    );


    const aiButton =
        document.getElementById(
            "floatingAiButton"
        );


    if (aiButton) {

        aiButton.click();

        return;

    }


    showToast(
        "EchoCall AI is not available right now.",
        "warning"
    );

}


// ==========================================
// Voice Chat
// ==========================================

async function handleVoiceChat() {

    console.log(
        "EchoCall Home → Starting Voice Chat"
    );


    try {

        const aiModule =
            await import(
                "./ai.js"
            );


        if (
            typeof aiModule.startVoiceInput ===
            "function"
        ) {

            aiModule.startVoiceInput();

            return;

        }


        showToast(
            "Voice Chat is not available right now.",
            "warning"
        );

    }

    catch (error) {

        console.error(
            "EchoCall Home → Voice Chat error:",
            error
        );


        showToast(
            "Could not start Voice Chat.",
            "error"
        );

    }

}


// ==========================================
// New Call
// ==========================================

function handleNewCall() {

    console.log(
        "EchoCall Home → New Call"
    );


    navigateTo(
        "calls"
    );

}


// ==========================================
// Translate
// ==========================================

function handleTranslate() {

    console.log(
        "EchoCall Home → Translate"
    );


    navigateTo(
        "translate"
    );

}


// ==========================================
// Contacts
// ==========================================

function handleContacts() {

    console.log(
        "EchoCall Home → Contacts"
    );


    navigateTo(
        "contacts"
    );

}


// ==========================================
// Calls
// ==========================================

function handleCalls() {

    console.log(
        "EchoCall Home → Calls"
    );


    navigateTo(
        "calls"
    );

}


// ==========================================
// History
// ==========================================

function handleHistory() {

    console.log(
        "EchoCall Home → History"
    );


    navigateTo(
        "history"
    );

}


// ==========================================
// Notifications
// ==========================================

function handleNotifications() {

    console.log(
        "EchoCall Home → Notifications"
    );


    navigateTo(
        "notifications"
    );

}


// ==========================================
// Navigation
// ==========================================

function navigateTo(page) {

    console.log(
        `EchoCall Home → Navigate to: ${page}`
    );


    // ======================================
    // Global Navigation Function
    // ======================================

    if (
        typeof window.navigateTo ===
        "function"
    ) {

        window.navigateTo(
            page
        );

        return;

    }


    // ======================================
    // Router Object
    // ======================================

    if (
        window.router &&
        typeof window.router.navigate ===
        "function"
    ) {

        window.router.navigate(
            page
        );

        return;

    }


    // ======================================
    // Navigation Not Available
    // ======================================

    console.warn(
        "EchoCall Home → No router found:",
        page
    );


    showToast(
        `${page} is not connected yet.`,
        "info"
    );

}


// ==========================================
// End Part 1
// ==========================================
// ==========================================
// EchoCall AI
// File: js/home.js
// Home Dashboard
// Part 2A
// ==========================================


// ==========================================
// AI BACKEND
// ==========================================

const HOME_AI_API_BASE_URL =
    "https://echocall-ai-backend.onrender.com/api/ai";


// ==========================================
// UPDATED HOME DATA CONTROLLER
// ==========================================

async function loadHomeData() {

    if (!currentUser) {

        console.warn(
            "EchoCall Home → Cannot load data without user."
        );

        return;

    }


    console.log(
        "EchoCall Home → Loading complete dashboard..."
    );


    try {

        // ==================================
        // Part 2A
        // ==================================

        await loadRecentAiChats();


        // ==================================
        // Part 2B
        // ==================================

        await loadHomePart2BData();


        console.log(
            "EchoCall Home → Complete dashboard loaded."
        );

    }

    catch (error) {

        console.error(
            "EchoCall Home → Dashboard loading error:",
            error
        );

    }

}

// ==========================================
// LOAD RECENT AI CHATS
// ==========================================

async function loadRecentAiChats() {

    if (
        !currentUser ||
        !recentAiChats
    ) {

        return;

    }

    try {

        console.log(
            "EchoCall Home → Loading recent AI chats..."
        );


        // ======================================
        // Firebase ID Token
        // ======================================

        const token =
            await currentUser.getIdToken();


        // ======================================
        // Get Conversations
        // ======================================

        const response =
            await fetch(

                `${HOME_AI_API_BASE_URL}/conversations`,

                {

                    method: "GET",

                    headers: {

                        "Authorization":
                            `Bearer ${token}`,

                        "Accept":
                            "application/json"

                    }

                }

            );


        const rawResponse =
            await response.text();


        console.log(
            "EchoCall Home → Conversations status:",
            response.status
        );


        console.log(
            "EchoCall Home → Conversations response:",
            rawResponse
        );


        if (!response.ok) {

            throw new Error(

                `Unable to load conversations: ${response.status}`

            );

        }


        let data;


        try {

            data =
                JSON.parse(
                    rawResponse
                );

        }

        catch (error) {

            throw new Error(
                "Backend returned invalid conversation JSON."
            );

        }


        if (!data.success) {

            throw new Error(

                data.message ||
                "Unable to load conversations."

            );

        }


        const conversations =
            Array.isArray(
                data.conversations
            )

                ? data.conversations

                : [];


        // ======================================
        // No Conversations
        // ======================================

        if (
            conversations.length === 0
        ) {

            renderEmptyAiChats();

            return;

        }


        // ======================================
        // Only use recent conversations
        // ======================================

        const recentConversations =
            conversations.slice(
                0,
                5
            );


        // ======================================
        // Get actual messages for each
        // conversation
        // ======================================

        const recentChats = [];


        for (
            const conversationItem
            of recentConversations
        ) {

            try {

                const messages =
                    await loadConversationMessages(

                        conversationItem.id,

                        token

                    );


                if (
                    !messages.length
                ) {

                    continue;

                }


                // ==================================
                // Find first user message
                // ==================================

                const firstUserMessage =
                    messages.find(

                        message =>
                            message.role ===
                            "user" &&
                            message.content

                    );


                // ==================================
                // Find latest message
                // ==================================

                const latestMessage =
                    messages[
                        messages.length - 1
                    ];


                // ==================================
                // Create chat information
                // ==================================

                recentChats.push({

                    id:
                        conversationItem.id,

                    title:
                        firstUserMessage?.content ||
                        "EchoCall AI Chat",

                    preview:
                        latestMessage?.content ||
                        "Continue your conversation with EchoCall AI.",

                    updatedAt:
                        conversationItem.updatedAt ||
                        latestMessage?.createdAt ||
                        null

                });

            }

            catch (error) {

                console.error(

                    "EchoCall Home → Could not load conversation:",

                    conversationItem.id,

                    error

                );

            }

        }


        // ======================================
        // Render
        // ======================================

        if (
            recentChats.length === 0
        ) {

            renderEmptyAiChats();

            return;

        }


        renderRecentAiChats(
            recentChats
        );


    }

    catch (error) {

        console.error(
            "EchoCall Home → Recent AI chats error:",
            error
        );


        renderEmptyAiChats();

    }

}


// ==========================================
// LOAD CONVERSATION MESSAGES
// ==========================================

async function loadConversationMessages(

    conversationId,

    token

) {

    if (!conversationId) {

        return [];

    }


    const response =
        await fetch(

            `${HOME_AI_API_BASE_URL}/conversations/${encodeURIComponent(
                conversationId
            )}/messages`,

            {

                method: "GET",

                headers: {

                    "Authorization":
                        `Bearer ${token}`,

                    "Accept":
                        "application/json"

                }

            }

        );


    const rawResponse =
        await response.text();


    if (!response.ok) {

        throw new Error(

            `Unable to load messages: ${response.status}`

        );

    }


    let data;


    try {

        data =
            JSON.parse(
                rawResponse
            );

    }

    catch (error) {

        throw new Error(
            "Invalid messages response."
        );

    }


    if (!data.success) {

        throw new Error(

            data.message ||
            "Unable to load conversation messages."

        );

    }


    return Array.isArray(
        data.messages
    )

        ? data.messages

        : [];

}


// ==========================================
// RENDER RECENT AI CHATS
// ==========================================

function renderRecentAiChats(
    chats
) {

    if (!recentAiChats) {

        return;

    }


    recentAiChats.innerHTML = "";


    chats.forEach(
        (chat) => {

            const item =
                document.createElement(
                    "button"
                );


            item.type =
                "button";


            item.className =
                "chat-list-item glass";


            item.innerHTML = `

                <div class="chat-list-icon">

                    <span class="material-symbols-rounded">
                        smart_toy
                    </span>

                </div>


                <div class="chat-list-content">

                    <h3>
                        ${escapeHomeText(
                            createChatTitle(
                                chat.title
                            )
                        )}
                    </h3>


                    <p>
                        ${escapeHomeText(
                            createChatPreview(
                                chat.preview
                            )
                        )}
                    </p>

                </div>


                <span class="material-symbols-rounded chat-list-arrow">
                    chevron_right
                </span>

            `;


            // ==================================
            // Open Conversation
            // ==================================

            item.addEventListener(
                "click",
                () => {

                    openAIConversation(
                        chat.id
                    );

                }
            );


            recentAiChats.appendChild(
                item
            );

        }
    );

}


// ==========================================
// CREATE CHAT TITLE
// ==========================================

function createChatTitle(
    text
) {

    if (!text) {

        return "EchoCall AI Chat";

    }


    const cleaned =
        String(text)
            .replace(
                /\s+/g,
                " "
            )
            .trim();


    if (!cleaned) {

        return "EchoCall AI Chat";

    }


    // Keep the Home card title short.

    if (
        cleaned.length > 55
    ) {

        return (
            cleaned.substring(
                0,
                55
            ) +
            "..."
        );

    }


    return cleaned;

}


// ==========================================
// CREATE CHAT PREVIEW
// ==========================================

function createChatPreview(
    text
) {

    if (!text) {

        return "Continue your conversation with EchoCall AI.";

    }


    const cleaned =
        String(text)
            .replace(
                /\s+/g,
                " "
            )
            .trim();


    if (!cleaned) {

        return "Continue your conversation with EchoCall AI.";

    }


    if (
        cleaned.length > 90
    ) {

        return (
            cleaned.substring(
                0,
                90
            ) +
            "..."
        );

    }


    return cleaned;

}


// ==========================================
// EMPTY AI CHATS
// ==========================================

function renderEmptyAiChats() {

    if (!recentAiChats) {

        return;

    }


    recentAiChats.innerHTML = `

        <div class="empty-card glass">

            <span class="material-symbols-rounded">
                forum
            </span>


            <h3>
                No AI conversations yet
            </h3>


            <p>
                Start a conversation with EchoCall AI.
            </p>


            <button
                id="emptyAiChatButton"
                class="small-primary-button">

                Start Chat

            </button>

        </div>

    `;


    document
        .getElementById(
            "emptyAiChatButton"
        )
        ?.addEventListener(

            "click",

            handleStartAIChat

        );

}


// ==========================================
// OPEN AI CONVERSATION
// ==========================================

function openAIConversation(
    conversationId
) {

    if (!conversationId) {

        return;

    }


    console.log(
        "EchoCall Home → Opening AI conversation:",
        conversationId
    );


    // ======================================
    // Save conversation ID
    // ======================================

    if (currentUser) {

        const storageKey =
            `echoCallConversationId_${currentUser.uid}`;


        localStorage.setItem(

            storageKey,

            conversationId

        );

    }


    // ======================================
    // Open AI
    // ======================================

    const aiButton =
        document.getElementById(
            "floatingAiButton"
        );


    if (aiButton) {

        aiButton.click();

        return;

    }


    showToast(
        "EchoCall AI is not available right now.",
        "warning"
    );

}


// ==========================================
// ESCAPE HOME TEXT
// ==========================================

function escapeHomeText(
    text
) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        text ?? "";


    return div.innerHTML;

}


// ==========================================
// END PART 2A
// ==========================================
// ==========================================
// EchoCall AI
// File: js/home.js
// Home Dashboard
// Part 2Bi
// ==========================================


// ==========================================
// FIRESTORE
// ==========================================

import {
    collection,
    query,
    orderBy,
    limit,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

import {
    db
} from "./firebase.js";


// ==========================================
// HOME PART 2B STATE
// ==========================================

let homeCallsData = [];

let homeContactsData = [];

let homeNotificationsData = [];


// ==========================================
// FIRESTORE PATH HELPERS
// ==========================================

function getUserCollectionPath(
    collectionName
) {

    if (!currentUser) {

        return null;

    }


    return collection(
        db,
        "users",
        currentUser.uid,
        collectionName
    );

}


// ==========================================
// LOAD HOME CALLS
// ==========================================

async function loadHomeCalls() {

    if (
        !currentUser ||
        !recentCalls
    ) {

        return;

    }


    console.log(
        "EchoCall Home → Loading calls..."
    );


    /*
     * IMPORTANT:
     *
     * Your current Firestore structure does NOT
     * contain:
     *
     * users/{USER_ID}/calls
     *
     * Therefore we do NOT query a fake collection.
     *
     * The empty state will remain visible until
     * your Calls system creates a real Firestore
     * collection.
     */


    homeCallsData = [];


    renderEmptyCalls();


}


// ==========================================
// LOAD FAVORITE CONTACTS
// ==========================================

async function loadFavoriteContacts() {

    if (
        !currentUser ||
        !favoriteContacts
    ) {

        return;

    }


    console.log(
        "EchoCall Home → Loading contacts..."
    );


    /*
     * Your current Firestore structure does NOT
     * contain:
     *
     * users/{USER_ID}/contacts
     *
     * So we safely show the empty state.
     *
     * We will connect this later when the Contacts
     * system has its real Firestore structure.
     */


    homeContactsData = [];


    renderEmptyContacts();

}


// ==========================================
// LOAD NOTIFICATIONS
// ==========================================

async function loadHomeNotifications() {

    if (
        !currentUser ||
        !homeNotifications
    ) {

        return;

    }


    console.log(
        "EchoCall Home → Loading notifications..."
    );


    /*
     * Your current Firestore structure does NOT
     * contain:
     *
     * users/{USER_ID}/notifications
     *
     * Therefore we do not query it yet.
     */


    homeNotificationsData = [];


    renderEmptyNotifications();

}


// ==========================================
// LOAD ALL PART 2B DATA
// ==========================================

async function loadHomePart2BData() {

    if (!currentUser) {

        console.warn(
            "EchoCall Home → Part 2B cannot load without user."
        );

        return;

    }


    console.log(
        "EchoCall Home → Loading Part 2B data..."
    );


    try {

        await Promise.all([

            loadHomeCalls(),

            loadFavoriteContacts(),

            loadHomeNotifications()

        ]);


        console.log(
            "EchoCall Home → Part 2B data loaded."
        );

    }

    catch (error) {

        console.error(
            "EchoCall Home → Part 2B loading error:",
            error
        );

    }

}


// ==========================================
// EMPTY CALLS
// ==========================================

function renderEmptyCalls() {

    if (!recentCalls) {

        return;

    }


    recentCalls.innerHTML = `

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

            <button
                id="emptyCallButton"
                class="small-primary-button">

                Make a Call

            </button>

        </div>

    `;


    document
        .getElementById(
            "emptyCallButton"
        )
        ?.addEventListener(

            "click",

            handleNewCall

        );

}


// ==========================================
// EMPTY CONTACTS
// ==========================================

function renderEmptyContacts() {

    if (!favoriteContacts) {

        return;

    }


    favoriteContacts.innerHTML = `

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

            <button
                id="emptyContactsButton"
                class="small-primary-button">

                Add Contact

            </button>

        </div>

    `;


    document
        .getElementById(
            "emptyContactsButton"
        )
        ?.addEventListener(

            "click",

            handleContacts

        );

}


// ==========================================
// EMPTY NOTIFICATIONS
// ==========================================

function renderEmptyNotifications() {

    if (!homeNotifications) {

        return;

    }


    homeNotifications.innerHTML = `

        <div class="empty-card glass">

            <span class="material-symbols-rounded">
                notifications_none
            </span>

            <h3>
                You're all caught up
            </h3>

            <p>
                New notifications will appear here.
            </p>

        </div>

    `;

}


// ==========================================
// END PART 2Bi
// ==========================================
// ==========================================
// EchoCall AI
// File: js/home.js
// Home Dashboard
// Part 2Bii
// ==========================================


// ==========================================
// FIREBASE AUTHENTICATION
// ==========================================

import {
    signOut
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";


// ==========================================
// PART 2Bii STATE
// ==========================================

let homePart2BiiInitialized = false;

let homeRefreshInProgress = false;

let homeLogoutInProgress = false;


// ==========================================
// INITIALIZE PART 2Bii
// ==========================================

function initializeHomePart2Bii() {

    console.log(
        "EchoCall Home → Initializing Part 2Bii..."
    );


    // --------------------------------------
    // Prevent duplicate initialization
    // --------------------------------------

    if (homePart2BiiInitialized) {

        console.log(
            "EchoCall Home → Part 2Bii already initialized."
        );

        return;

    }


    // --------------------------------------
    // Get existing dashboard elements
    // --------------------------------------

    refreshDashboard =
        document.getElementById(
            "refreshDashboard"
        );

    logoutAccount =
        document.getElementById(
            "logoutAccount"
        );

    openVoiceClone =
        document.getElementById(
            "openVoiceClone"
        );

    createVoiceClone =
        document.getElementById(
            "createVoiceClone"
        );

    openImageStudio =
        document.getElementById(
            "openImageStudio"
        );

    generateImageButton =
        document.getElementById(
            "generateImageButton"
        );

    viewAllAiChats =
        document.getElementById(
            "viewAllAiChats"
        );

    viewAllCalls =
        document.getElementById(
            "viewAllCalls"
        );

    viewContacts =
        document.getElementById(
            "viewContacts"
        );

    viewAllNotifications =
        document.getElementById(
            "viewAllNotifications"
        );


    // --------------------------------------
    // Initialize events
    // --------------------------------------

    initializeHomePart2BiiEvents();


    // --------------------------------------
    // Mark initialized
    // --------------------------------------

    homePart2BiiInitialized = true;


    console.log(
        "EchoCall Home → Part 2Bii initialized successfully."
    );

}


// ==========================================
// PART 2Bii EVENTS
// ==========================================

function initializeHomePart2BiiEvents() {


    // ======================================
    // REFRESH
    // ======================================

    refreshDashboard?.addEventListener(
        "click",
        handleRefreshDashboard
    );


    // ======================================
    // LOGOUT
    // ======================================

    logoutAccount?.addEventListener(
        "click",
        handleLogoutAccount
    );


    // ======================================
    // VOICE CLONE
    // ======================================

    openVoiceClone?.addEventListener(
        "click",
        handleOpenVoiceClone
    );


    createVoiceClone?.addEventListener(
        "click",
        handleCreateVoiceClone
    );


    // ======================================
    // IMAGE STUDIO
    // ======================================

    openImageStudio?.addEventListener(
        "click",
        handleOpenImageStudio
    );


    generateImageButton?.addEventListener(
        "click",
        handleGenerateImage
    );


    // ======================================
    // VIEW ALL AI CHATS
    // ======================================

    viewAllAiChats?.addEventListener(
        "click",
        handleViewAllAiChats
    );


    // ======================================
    // VIEW ALL CALLS
    // ======================================

    viewAllCalls?.addEventListener(
        "click",
        handleViewAllCalls
    );


    // ======================================
    // VIEW ALL CONTACTS
    // ======================================

    viewContacts?.addEventListener(
        "click",
        handleViewContacts
    );


    // ======================================
    // VIEW ALL NOTIFICATIONS
    // ======================================

    viewAllNotifications?.addEventListener(
        "click",
        handleViewAllNotifications
    );


    // ======================================
    // EMPTY CALL BUTTON
    // ======================================

    document
        .getElementById(
            "emptyCallButton"
        )
        ?.addEventListener(
            "click",
            handleNewCall
        );


    // ======================================
    // EMPTY CONTACTS BUTTON
    // ======================================

    document
        .getElementById(
            "emptyContactsButton"
        )
        ?.addEventListener(
            "click",
            handleContacts
        );

}


// ==========================================
// REFRESH DASHBOARD
// ==========================================

async function handleRefreshDashboard() {

    console.log(
        "EchoCall Home → Refresh requested."
    );


    // --------------------------------------
    // Prevent duplicate refresh
    // --------------------------------------

    if (homeRefreshInProgress) {

        return;

    }


    // --------------------------------------
    // Check authentication
    // --------------------------------------

    if (!currentUser) {

        showToast(
            "Please sign in again.",
            "warning"
        );

        return;

    }


    homeRefreshInProgress = true;


    setRefreshButtonLoading(
        true
    );


    try {

        console.log(
            "EchoCall Home → Reloading dashboard..."
        );


        // ==================================
        // Use the existing Part 2A loader
        // ==================================

        await loadHomeData();


        showToast(
            "Dashboard refreshed.",
            "success"
        );


    }

    catch (error) {

        console.error(
            "EchoCall Home → Refresh error:",
            error
        );


        showToast(
            "Could not refresh the dashboard.",
            "error"
        );

    }

    finally {

        homeRefreshInProgress =
            false;


        setRefreshButtonLoading(
            false
        );

    }

}


// ==========================================
// REFRESH BUTTON STATE
// ==========================================

function setRefreshButtonLoading(
    isLoading
) {

    if (!refreshDashboard) {

        return;

    }


    if (isLoading) {

        refreshDashboard.disabled =
            true;


        refreshDashboard.innerHTML = `

            <span class="material-symbols-rounded">
                sync
            </span>

            Refreshing...

        `;


        refreshDashboard.classList.add(
            "is-loading"
        );


        return;

    }


    refreshDashboard.disabled =
        false;


    refreshDashboard.classList.remove(
        "is-loading"
    );


    refreshDashboard.innerHTML = `

        <span class="material-symbols-rounded">
            refresh
        </span>

        Refresh

    `;

}


// ==========================================
// LOGOUT
// ==========================================

async function handleLogoutAccount() {

    console.log(
        "EchoCall Home → Logout requested."
    );


    // --------------------------------------
    // Prevent duplicate logout
    // --------------------------------------

    if (homeLogoutInProgress) {

        return;

    }


    // --------------------------------------
    // Confirmation
    // --------------------------------------

    const confirmed =
        window.confirm(
            "Are you sure you want to log out of EchoCall AI?"
        );


    if (!confirmed) {

        return;

    }


    homeLogoutInProgress =
        true;


    // --------------------------------------
    // Disable logout button
    // --------------------------------------

    if (logoutAccount) {

        logoutAccount.disabled =
            true;


        logoutAccount.innerHTML = `

            <span class="material-symbols-rounded">
                progress_activity
            </span>

            Logging out...

        `;

    }


    try {

        console.log(
            "EchoCall Home → Signing out..."
        );


        // ==================================
        // Firebase logout
        // ==================================

        await signOut(
            auth
        );


        // ==================================
        // Clear local conversation
        // ==================================

        clearHomeLocalState();


        // ==================================
        // Clear current user
        // ==================================

        currentUser =
            null;


        console.log(
            "EchoCall Home → Firebase logout successful."
        );


        showToast(
            "You have been logged out.",
            "success"
        );


        // ==================================
        // Go directly to authentication
        // ==================================

        goToLoginPage();

    }

    catch (error) {

        console.error(
            "EchoCall Home → Logout error:",
            error
        );


        showToast(
            "Could not log out. Please try again.",
            "error"
        );


        if (logoutAccount) {

            logoutAccount.disabled =
                false;


            logoutAccount.innerHTML = `

                <span class="material-symbols-rounded">
                    logout
                </span>

                Logout

            `;

        }

        homeLogoutInProgress =
            false;

    }

}


// ==========================================
// CLEAR HOME LOCAL STATE
// ==========================================

function clearHomeLocalState() {

    try {

        // ----------------------------------
        // Find authenticated user ID
        // ----------------------------------

        const uid =
            currentUser?.uid;


        if (uid) {

            localStorage.removeItem(
                `echoCallConversationId_${uid}`
            );

        }

    }

    catch (error) {

        console.warn(
            "EchoCall Home → Local state cleanup failed:",
            error
        );

    }

}


// ==========================================
// GO TO LOGIN PAGE
// ==========================================
//
// IMPORTANT:
//
// We DO NOT call:
//
// navigateTo("auth")
//
// because "auth" is not currently present
// in the router you showed me.
//
// We also do not send the user to:
//
// auth.html
//
// unless that is actually your real login
// file.
//
// Instead, this function checks the most
// common authentication-page locations.
// ==========================================

function goToLoginPage() {

    console.log(
        "EchoCall Home → Opening login page..."
    );


    // ======================================
    // OPTION 1
    // ======================================
    // If your authentication page is
    // index.html, use it.
    //
    // Change this to auth.html ONLY if your
    // actual login page is auth.html.
    // ======================================

    window.location.href =
        "index.html";

}


// ==========================================
// VOICE CLONE
// ==========================================

function handleOpenVoiceClone() {

    console.log(
        "EchoCall Home → Opening Voice Clone Studio."
    );


    navigateTo(
        "voiceClone"
    );

}


function handleCreateVoiceClone() {

    console.log(
        "EchoCall Home → Creating Voice Clone."
    );


    navigateTo(
        "voiceClone"
    );

}


// ==========================================
// IMAGE STUDIO
// ==========================================

function handleOpenImageStudio() {

    console.log(
        "EchoCall Home → Opening Image Studio."
    );


    navigateTo(
        "imageStudio"
    );

}


function handleGenerateImage() {

    console.log(
        "EchoCall Home → Opening Image Studio."
    );


    navigateTo(
        "imageStudio"
    );

}


// ==========================================
// VIEW ALL AI CHATS
// ==========================================

function handleViewAllAiChats() {

    console.log(
        "EchoCall Home → Opening AI chats."
    );


    navigateTo(
        "ai"
    );

}


// ==========================================
// VIEW ALL CALLS
// ==========================================

function handleViewAllCalls() {

    console.log(
        "EchoCall Home → Opening calls."
    );


    navigateTo(
        "calls"
    );

}


// ==========================================
// VIEW ALL CONTACTS
// ==========================================

function handleViewContacts() {

    console.log(
        "EchoCall Home → Opening contacts."
    );


    navigateTo(
        "contacts"
    );

}


// ==========================================
// VIEW ALL NOTIFICATIONS
// ==========================================

function handleViewAllNotifications() {

    console.log(
        "EchoCall Home → Opening notifications."
    );


    navigateTo(
        "notifications"
    );

}


// ==========================================
// PART 2Bii INITIALIZATION
// ==========================================
//
// IMPORTANT:
//
// We do NOT use DOMContentLoaded here.
//
// Your router dynamically loads home.html,
// then imports home.js.
//
// Therefore initializeHome() is already
// responsible for starting the Home page.
// ==========================================

initializeHomePart2Bii();


// ==========================================
// END PART 2Bii
// ==========================================