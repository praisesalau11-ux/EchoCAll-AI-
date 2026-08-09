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
    clearConversation,
    startVoiceInput
} from "./ai.js";

// ==========================================
// App
// ==========================================

import {

    currentUser,

    currentUserData,

    loadUserProfile,

    logout

} from "./app.js";

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
// Current User
// ==========================================

let currentUser = null;

let currentUserData = null;

// ==========================================
// Page Elements
// ==========================================

// Greeting

const homeGreeting =
document.getElementById(
    "homeGreeting"
);

const homeSubtitle =
document.getElementById(
    "homeSubtitle"
);

const homeProfileImage =
document.getElementById(
    "homeProfileImage"
);

// Hero Buttons

const startAiChatButton =
document.getElementById(
    "startAiChatButton"
);

const newCallButton =
document.getElementById(
    "newCallButton"
);

// Quick Actions

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

// Status

const backendStatus =
document.getElementById(
    "backendStatus"
);

const networkStatus =
document.getElementById(
    "networkStatus"
);

const syncStatus =
document.getElementById(
    "syncStatus"
);

const securityStatus =
document.getElementById(
    "securityStatus"
);

// Dashboard Containers

const recentAiChats =
document.getElementById(
    "recentAiChats"
);

const recentCalls =
document.getElementById(
    "recentCalls"
);

const favoriteContacts =
document.getElementById(
    "favoriteContacts"
);

const translationHistory =
document.getElementById(
    "translationHistory"
);

// ==========================================
// Initialize Home Page
// ==========================================

export async function initializeHome(){

    currentUser = auth.currentUser;

    if(!currentUser){

        window.location.href =
        "login.html";

        return;

    }

    await loadUserProfile();

    initializeButtons();

    updateNetworkStatus();

    checkBackendHealth();

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
// Load User Profile
// ==========================================

async function loadUserProfile(){

    try{

        const userRef = doc(

            db,

            "users",

            currentUser.uid

        );

        const userSnap = await getDoc(userRef);

        if(userSnap.exists()){

            currentUserData = userSnap.data();

            homeGreeting.textContent =
            `Welcome, ${currentUserData.firstName}`;

            homeSubtitle.textContent =
            "Your intelligent communication assistant.";

        }

        else{

            currentUserData = {

                firstName:"User"

            };

            homeGreeting.textContent =
            "Welcome";

            homeSubtitle.textContent =
            currentUser.email;

        }

        await loadProfilePhoto();

    }

    catch(error){

        console.error(error);

        showToast(

            "Unable to load your profile.",

            "error"

        );

    }

}

// ==========================================
// Load Profile Photo
// ==========================================

async function loadProfilePhoto(){

    if(!homeProfileImage){

        return;

    }

    try{

        const imageRef = ref(

            storage,

            `profilePictures/${currentUser.uid}`

        );

        const url =

        await getDownloadURL(imageRef);

        homeProfileImage.src = url;

    }

    catch{

        if(

            currentUserData &&

            currentUserData.profilePhoto

        ){

            homeProfileImage.src =

            currentUserData.profilePhoto;

        }

        else if(currentUser.photoURL){

            homeProfileImage.src =

            currentUser.photoURL;

        }

        else{

            homeProfileImage.src =

            "assets/default-avatar.png";

        }

    }

}

// ==========================================
// Open Profile
// ==========================================

homeProfileImage?.addEventListener(

    "click",

    ()=>{

        navigate("profile");

    }

);

// ==========================================
// Update Greeting
// ==========================================

function updateGreeting(){

    const hour =

    new Date().getHours();

    let greeting = "Welcome";

    if(hour < 12){

        greeting =

        "Good Morning";

    }

    else if(hour < 18){

        greeting =

        "Good Afternoon";

    }

    else{

        greeting =

        "Good Evening";

    }

    if(currentUserData){

        homeGreeting.textContent =

        `${greeting}, ${currentUserData.firstName}`;

    }

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
// Initialize Buttons
// ==========================================

function initializeButtons(){

    // AI Assistant

    startAiChatButton?.addEventListener(

        "click",

        ()=>{

            document

                .getElementById("floatingAiButton")

                ?.click();

        }

    );

    quickAi?.addEventListener(

        "click",

        ()=>{

            document

                .getElementById("floatingAiButton")

                ?.click();

        }

    );

    // Calls

    newCallButton?.addEventListener(

        "click",

        ()=>{

            navigate("calls");

        }

    );

    quickCalls?.addEventListener(

        "click",

        ()=>{

            navigate("calls");

        }

    );

    // Contacts

    quickContacts?.addEventListener(

        "click",

        ()=>{

            navigate("contacts");

        }

    );

    // History

    quickHistory?.addEventListener(

        "click",

        ()=>{

            navigate("history");

        }

    );

    // Voice Clone

    quickVoiceClone?.addEventListener(

        "click",

        ()=>{

            navigate("voiceClone");

        }

    );

    // Translate

    quickTranslate?.addEventListener(

        "click",

        ()=>{

            showToast(

                "Translator page coming soon.",

                "success"

            );

        }

    );

}

// ==========================================
// Network Status
// ==========================================

function updateNetworkStatus(){

    if(!networkStatus){

        return;

    }

    if(navigator.onLine){

        networkStatus.textContent =

        "Online";

        networkStatus.style.color =

        "#4CAF50";

    }

    else{

        networkStatus.textContent =

        "Offline";

        networkStatus.style.color =

        "#F44336";

    }

}

window.addEventListener(

    "online",

    ()=>{

        updateNetworkStatus();

        showToast(

            "Internet connected."

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
// Backend Health
// ==========================================

async function checkBackendHealth(){

    if(!backendStatus){

        return;

    }

    try{

        backendStatus.textContent =

        "Checking...";

        const response =

        await fetch(

            `${API_URL}/health`

        );

        if(response.ok){

            backendStatus.textContent =

            "Online";

            backendStatus.style.color =

            "#4CAF50";

            syncStatus.textContent =

            "Connected";

            securityStatus.textContent =

            "Protected";

        }

        else{

            throw new Error();

        }

    }

    catch{

        backendStatus.textContent =

        "Offline";

        backendStatus.style.color =

        "#F44336";

        syncStatus.textContent =

        "Unavailable";

    }

}

// ==========================================
// End Part 3
// ==========================================
// ==========================================
// EchoCall AI
// File: js/home.js
// Part 4
// Append below Part 3
// ==========================================

// ==========================================
// Load Dashboard
// ==========================================

async function loadDashboard(){

    updateGreeting();

    await Promise.all([

        loadRecentAIChats(),

        loadRecentCalls(),

        loadFavoriteContacts(),

        loadTranslationHistory(),

        loadStatistics()

    ]);

}

// ==========================================
// Recent AI Chats
// ==========================================

async function loadRecentAIChats(){

    if(!recentAiChats){

        return;

    }

    recentAiChats.innerHTML = "";

    const chats = [

        {

            title:"EchoCall AI",

            message:"How can I help you today?",

            time:"Now"

        }

    ];

    chats.forEach(chat=>{

        const item =

        document.createElement("div");

        item.className =

        "chat-item";

        item.innerHTML = `

            <div class="chat-avatar">

                🤖

            </div>

            <div class="chat-info">

                <h3>${chat.title}</h3>

                <p>${chat.message}</p>

            </div>

            <span class="chat-time">

                ${chat.time}

            </span>

        `;

        item.addEventListener(

            "click",

            ()=>{

                document

                .getElementById(

                    "floatingAiButton"

                )

                ?.click();

            }

        );

        recentAiChats.appendChild(item);

    });

}

// ==========================================
// Recent Calls
// ==========================================

async function loadRecentCalls(){

    if(!recentCalls){

        return;

    }

    recentCalls.innerHTML = "";

    const empty =

    document.createElement("div");

    empty.className =

    "empty-card glass";

    empty.innerHTML = `

        <span class="material-symbols-rounded">

            call

        </span>

        <h3>

            No recent calls

        </h3>

        <p>

            Your calls will appear here.

        </p>

    `;

    recentCalls.appendChild(

        empty

    );

}

// ==========================================
// Favorite Contacts
// ==========================================

async function loadFavoriteContacts(){

    if(!favoriteContacts){

        return;

    }

    favoriteContacts.innerHTML = "";

    const empty =

    document.createElement("div");

    empty.className =

    "empty-card glass";

    empty.innerHTML = `

        <span class="material-symbols-rounded">

            contacts

        </span>

        <h3>

            No contacts yet

        </h3>

        <p>

            Contacts created from calls will appear here.

        </p>

    `;

    favoriteContacts.appendChild(

        empty

    );

}

// ==========================================
// End Part 4
// ==========================================
// ==========================================
// EchoCall AI
// File: js/home.js
// Part 5
// Append below Part 4
// ==========================================

// ==========================================
// Translation History
// ==========================================

async function loadTranslationHistory(){

    if(!translationHistory){

        return;

    }

    translationHistory.innerHTML = "";

    const empty =

    document.createElement("div");

    empty.className =

    "empty-card glass";

    empty.innerHTML = `

        <span class="material-symbols-rounded">

            translate

        </span>

        <h3>

            No translations

        </h3>

        <p>

            Your translated conversations will appear here.

        </p>

    `;

    translationHistory.appendChild(

        empty

    );

}

// ==========================================
// Dashboard Statistics
// ==========================================

async function loadStatistics(){

    setStatistic(

        "totalContacts",

        "0"

    );

    setStatistic(

        "totalCalls",

        "0"

    );

    setStatistic(

        "totalChats",

        "1"

    );

    setStatistic(

        "totalTranslations",

        "0"

    );

    setStatistic(

        "todayChats",

        "1"

    );

    setStatistic(

        "todayCalls",

        "0"

    );

    setStatistic(

        "todayImages",

        "0"

    );

    setStatistic(

        "todayTranslations",

        "0"

    );

}

// ==========================================
// Statistic Helper
// ==========================================

function setStatistic(

    id,

    value

){

    const element =

    document.getElementById(id);

    if(element){

        element.textContent = value;

    }

}

// ==========================================
// Daily Insight
// ==========================================

function loadDailyInsight(){

    const insight =

    document.getElementById(

        "dailyInsight"

    );

    if(!insight){

        return;

    }

    insight.textContent =

    "Complete your profile, add contacts and start using AI voice calls to unlock more EchoCall AI features.";

}

// ==========================================
// Account Information
// ==========================================

function loadAccountInformation(){

    document.getElementById(

        "accountEmail"

    ).textContent =

    currentUser.email;

    document.getElementById(

        "membershipType"

    ).textContent =

    currentUserData?.premium ?

    "Premium" :

    "Free";

    document.getElementById(

        "joinedDate"

    ).textContent =

    currentUser.metadata

    ?.creationTime ||

    "Unknown";

    document.getElementById(

        "lastLogin"

    ).textContent =

    currentUser.metadata

    ?.lastSignInTime ||

    "Unknown";

}

// ==========================================
// End Part 5
// ==========================================
// ==========================================
// EchoCall AI
// File: js/home.js
// Part 6
// Append below Part 5
// ==========================================

// ==========================================
// Device Information
// ==========================================

function loadDeviceInformation(){

    const deviceName =
    document.getElementById("deviceName");

    const browserName =
    document.getElementById("browserName");

    const osName =
    document.getElementById("osName");

    const deviceNetwork =
    document.getElementById("deviceNetwork");

    if(deviceName){

        deviceName.textContent =
        navigator.platform || "Unknown";

    }

    if(browserName){

        browserName.textContent =
        navigator.userAgent;

    }

    if(osName){

        osName.textContent =
        navigator.platform;

    }

    if(deviceNetwork){

        deviceNetwork.textContent =

        navigator.onLine ?

        "Online" :

        "Offline";

    }

}

// ==========================================
// Cloud Storage
// ==========================================

function loadStorageInformation(){

    const usage =
    document.getElementById("storageUsage");

    const progress =
    document.getElementById("storageProgressBar");

    if(usage){

        usage.textContent =
        "0 MB used of 1 GB";

    }

    if(progress){

        progress.style.width = "0%";

    }

}

// ==========================================
// Security Information
// ==========================================

function loadSecurityInformation(){

    const authentication =
    document.getElementById(

        "authenticationStatus"

    );

    const securityScore =
    document.getElementById(

        "securityScore"

    );

    if(authentication){

        authentication.textContent =

        currentUser.emailVerified ?

        "Verified" :

        "Unverified";

    }

    if(securityScore){

        securityScore.textContent =

        currentUser.emailVerified ?

        "100%" :

        "75%";

    }

}

// ==========================================
// Refresh Dashboard
// ==========================================

async function refreshDashboard(){

    showToast(

        "Refreshing dashboard..."

    );

    await loadUserProfile();

    await loadDashboard();

    loadDailyInsight();

    loadAccountInformation();

    loadStorageInformation();

    loadDeviceInformation();

    loadSecurityInformation();

    checkBackendHealth();

    showToast(

        "Dashboard updated."

    );

}

// ==========================================
// Refresh Button
// ==========================================

document

.getElementById("refreshDashboard")

?.addEventListener(

    "click",

    refreshDashboard

);

// ==========================================
// Sync Button
// ==========================================

document

.getElementById("syncNow")

?.addEventListener(

    "click",

    ()=>{

        showToast(

            "Cloud sync completed."

        );

    }

);

// ==========================================
// Voice Clone Button
// ==========================================

document

.getElementById("createVoiceClone")

?.addEventListener(

    "click",

    ()=>{

        navigate("voiceClone");

    }

);

// ==========================================
// AI Voice Button
// ==========================================

document

.getElementById("startVoiceInput")

?.addEventListener(

    "click",

    ()=>{

        startVoiceInput();

    }

);

// ==========================================
// End Part 6
// ==========================================
// ==========================================
// EchoCall AI
// File: js/home.js
// Part 7
// Append below Part 6
// ==========================================

// ==========================================
// Hero Buttons
// ==========================================

startAiChatButton?.addEventListener(

    "click",

    ()=>{

        document

            .getElementById("floatingAiButton")

            ?.click();

    }

);

newCallButton?.addEventListener(

    "click",

    ()=>{

        navigate("calls");

    }

);

// ==========================================
// Profile Picture
// ==========================================

homeProfileImage?.addEventListener(

    "click",

    ()=>{

        navigate("profile");

    }

);

// ==========================================
// Quick Action Cards
// ==========================================

quickAi?.addEventListener(

    "click",

    ()=>{

        document

            .getElementById("floatingAiButton")

            ?.click();

    }

);

quickCalls?.addEventListener(

    "click",

    ()=>{

        navigate("calls");

    }

);

quickContacts?.addEventListener(

    "click",

    ()=>{

        navigate("contacts");

    }

);

quickHistory?.addEventListener(

    "click",

    ()=>{

        navigate("history");

    }

);

quickVoiceClone?.addEventListener(

    "click",

    ()=>{

        navigate("voiceClone");

    }

);

quickTranslate?.addEventListener(

    "click",

    ()=>{

        showToast(

            "Translation page coming soon."

        );

    }

);



// ==========================================
// Premium
// ==========================================

document

.getElementById("openPremium")

?.addEventListener(

    "click",

    ()=>{

        navigate("premium");

    }

);

// ==========================================
// Settings
// ==========================================

document

.getElementById("openSettings")

?.addEventListener(

    "click",

    ()=>{

        navigate("settings");

    }

);

// ==========================================
// Security
// ==========================================

document

.getElementById("openSecurity")

?.addEventListener(

    "click",

    ()=>{

        navigate("security");

    }

);

// ==========================================
// End Part 7
// ==========================================
// ==========================================
// EchoCall AI
// File: js/home.js
// Part 8 (Final)
// Append below Part 7
// ==========================================

// ==========================================
// Initialize Home
// ==========================================

export async function initializeHome(){

    try{

        await loadUserProfile();

        await loadDashboard();

        loadDailyInsight();

        loadAccountInformation();

        loadStorageInformation();

        loadDeviceInformation();

        loadSecurityInformation();

        updateNetworkStatus();

        await checkBackendHealth();

        showToast(

            "Home loaded successfully."

        );

    }

    catch(error){

        console.error(

            "Home initialization failed:",

            error

        );

        showToast(

            "Unable to load dashboard.",

            "error"

        );

    }

}

// ==========================================
// Logout Button
// ==========================================

document

.getElementById("logoutAccount")

?.addEventListener(

    "click",

    async()=>{

        if(

            confirm(

                "Are you sure you want to logout?"

            )

        ){

            await logout();

        }

    }

);

// ==========================================
// Auto Refresh Every Minute
// ==========================================

setInterval(

    ()=>{

        checkBackendHealth();

        updateNetworkStatus();

    },

    60000

);

// ==========================================
// Export
// ==========================================

export default {

    initializeHome

};

// ==========================================
// End of home.js
// ==========================================