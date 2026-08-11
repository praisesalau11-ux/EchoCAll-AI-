// ==========================================
// EchoCall AI
// File: js/ai.js
// Part 1
// ==========================================

// ==========================================
// Toast
// ==========================================

import { showToast } from "./toast.js";

// ==========================================
// Firebase Authentication
// ==========================================

import {
    auth
} from "./firebase.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

// ==========================================
// Firebase Authentication State
// ==========================================

let currentAuthUser = null;

let aiInitialized = false;

let conversationRestoreStarted = false;

onAuthStateChanged(

    auth,

    async (user) => {

        if (!user) {

            currentAuthUser = null;

            console.warn(
                "EchoCall AI: No authenticated user."
            );

            return;

        }

        currentAuthUser = user;

        console.log(
            "EchoCall AI authenticated:",
            user.uid
        );

        // ======================================
        // Restore conversation if AI is ready
        // ======================================

        if (
            aiInitialized &&
            !conversationRestoreStarted
        ) {

            conversationRestoreStarted = true;

            loadSavedConversation().catch(
                error => {

                    console.error(
                        "AI conversation restore error:",
                        error
                    );

                }
            );

        }

    }

);

// ==========================================
// Configuration
// ==========================================

const API_BASE_URL =
"https://echocall-ai-backend.onrender.com/api/ai";

const API_URL =
`${API_BASE_URL}/chat`;

// ==========================================
// DOM Elements
// ==========================================

let aiModal = null;

let aiChatContainer = null;

let aiInput = null;

let sendAiMessage = null;

let floatingAiButton = null;

let closeAiModal = null;

// ==========================================
// State
// ==========================================

let isSending = false;

const conversation = [];

// ==========================================
// User-Specific Conversation Storage Key
// ==========================================

function getConversationStorageKey() {

    const user = auth.currentUser;

    if (!user) {

        return null;

    }

    return `echoCallConversationId_${user.uid}`;

}

// ==========================================
// Initialize AI
// ==========================================

export function initializeAI() {

    aiModal =
    document.getElementById("aiModal");

    aiChatContainer =
    document.getElementById("aiChatContainer");

    aiInput =
    document.getElementById("aiInput");

    sendAiMessage =
    document.getElementById("sendAiMessage");

    floatingAiButton =
    document.getElementById("floatingAiButton");

    closeAiModal =
    document.getElementById("closeAiModal");

    if (

        !aiModal ||

        !aiChatContainer ||

        !aiInput ||

        !sendAiMessage

    ) {

        console.warn(

            "AI elements not found."

        );

        return;

    }

    // ======================================
    // Initialize buttons/events
    // ======================================

    initializeEvents();

    // ======================================
    // Tell Firebase listener AI is ready
    // ======================================

    aiInitialized = true;

    // ======================================
    // Firebase may have authenticated
    // before initializeAI() finished.
    // Check again here.
    // ======================================

    if (
        currentAuthUser &&
        !conversationRestoreStarted
    ) {

        conversationRestoreStarted = true;

        loadSavedConversation().catch(
            error => {

                console.error(
                    "AI conversation restore error:",
                    error
                );

            }
        );

    }

}

// ==========================================
// Load Saved Conversation
// ==========================================

async function loadSavedConversation() {

    try {

        const user = auth.currentUser;

        if (!user) {

            console.log(
                "AI: No authenticated user yet."
            );

            return;

        }

        if (!aiChatContainer) {

            console.warn(
                "AI: Chat container is not initialized yet."
            );

            return;

        }

        const storageKey =
            getConversationStorageKey();

        if (!storageKey) {

            return;

        }

        const conversationId =
            localStorage.getItem(storageKey);

        if (!conversationId) {

            console.log(
                "AI: No saved conversation for this user."
            );

            return;

        }

        console.log(
            "AI: Restoring conversation:",
            conversationId
        );

        const token =
            await user.getIdToken();

        const response = await fetch(

            `${API_BASE_URL}/conversations/${conversationId}/messages`,

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
            "AI restore status:",
            response.status
        );

        console.log(
            "AI restore response:",
            rawResponse
        );

        if (!response.ok) {

            throw new Error(

                `Unable to load conversation: ${response.status} ${rawResponse}`

            );

        }

        const data =
            JSON.parse(rawResponse);

        if (!data.success) {

            throw new Error(

                data.message ||
                "Unable to load conversation."

            );

        }

        // ======================================
        // Clear current conversation
        // ======================================

        conversation.length = 0;

        // ======================================
        // Clear chat UI
        // ======================================

        aiChatContainer.innerHTML = "";

        // ======================================
        // Restore messages
        // ======================================

        for (
            const message of data.messages || []
        ) {

            if (
                message.role !== "user" &&
                message.role !== "assistant"
            ) {

                continue;

            }

            conversation.push({

                role:
                    message.role,

                content:
                    message.content

            });

            if (
                message.role === "user"
            ) {

                addUserMessage(
                    message.content
                );

            }
            else {

                addAIMessage(
                    message.content
                );

            }

        }

        console.log(

            `AI: Restored ${
                data.messages?.length || 0
            } messages.`

        );

        scrollToBottom();

    }

    catch (error) {

        console.error(
            "AI conversation restore error:",
            error
        );

    }

}

// ==========================================
// Events
// ==========================================

function initializeEvents() {

    floatingAiButton?.addEventListener(

        "click",

        openAI

    );

    closeAiModal?.addEventListener(

        "click",

        closeAI

    );

    sendAiMessage?.addEventListener(

        "click",

        sendMessage

    );

    aiInput?.addEventListener(

        "keydown",

        (event)=>{

            if(

                event.key==="Enter"

            ){

                event.preventDefault();

                sendMessage();

            }

        }

    );

}

// ==========================================
// Open AI
// ==========================================

function openAI(){

    aiModal.classList.remove(

        "hidden"

    );

    aiInput.focus();

}

// ==========================================
// Close AI
// ==========================================

function closeAI(){

    aiModal.classList.add(

        "hidden"

    );

}

// ==========================================
// End Part 1
// ==========================================
// ==========================================
// EchoCall AI
// File: js/ai.js
// Part 2
// Append below Part 1
// ==========================================

// ==========================================
// Send Message
// ==========================================

async function sendMessage(){

    if(isSending){

        return;

    }

    const message =

    aiInput.value.trim();

    if(!message){

        return;

    }

    isSending = true;

    aiInput.value = "";

    addUserMessage(message);

    conversation.push({

        role:"user",

        content:message

    });

    const typingBubble =

    addTypingBubble();

    try{

        await getAIResponse(

            message,

            typingBubble

        );

    }

    catch(error){

        console.error(error);

        typingBubble.remove();

        addAIMessage(

            "Sorry, I couldn't process your request."

        );

        showToast(

            "AI request failed.",

            "error"

        );

    }

    finally{

        isSending = false;

    }

}

// ==========================================
// User Message
// ==========================================

function addUserMessage(message){

    const wrapper =

    document.createElement("div");

    wrapper.className =

    "user-message";

    wrapper.innerHTML = `

        <div class="user-bubble">

            ${escapeHTML(message)}

        </div>

    `;

    aiChatContainer.appendChild(

        wrapper

    );

    scrollToBottom();

}

// ==========================================
// AI Message
// ==========================================

function addAIMessage(message){

    const wrapper =

    document.createElement("div");

    wrapper.className =

    "ai-message";

    wrapper.innerHTML = `

        <div class="ai-avatar">

            🤖

        </div>

        <div class="ai-bubble">

            ${escapeHTML(message)}

        </div>

    `;

    aiChatContainer.appendChild(

        wrapper

    );

    scrollToBottom();

}

// ==========================================
// Typing Bubble
// ==========================================

function addTypingBubble(){

    const wrapper =

    document.createElement("div");

    wrapper.className =

    "ai-message typing-message";

    wrapper.innerHTML = `

        <div class="ai-avatar">

            🤖

        </div>

        <div class="ai-bubble typing">

            <span></span>

            <span></span>

            <span></span>

        </div>

    `;

    aiChatContainer.appendChild(

        wrapper

    );

    scrollToBottom();

    return wrapper;

}

// ==========================================
// Scroll Chat
// ==========================================

function scrollToBottom(){

    aiChatContainer.scrollTop =

    aiChatContainer.scrollHeight;

}

// ==========================================
// Escape HTML
// ==========================================

function escapeHTML(text){

    const div =

    document.createElement("div");

    div.textContent = text;

    return div.innerHTML;

}

// ==========================================
// End Part 2
// ==========================================
// ==========================================
// EchoCall AI
// File: js/ai.js
// Part 3
// Append below Part 2
// ==========================================

// ==========================================
// Get AI Response
// ==========================================

async function getAIResponse(

    message,

    typingBubble

){

    try {

        console.log(
            "EchoCall AI → Sending request"
        );

        // ======================================
        // Get Firebase authenticated user
        // ======================================

        const user = auth.currentUser;

        if (!user) {

            throw new Error(
                "You are not signed in."
            );

        }

        // ======================================
        // Get Firebase ID Token
        // ======================================

        const token =
            await user.getIdToken();

        console.log(
            "Firebase authentication token obtained."
        );


// ======================================
// Get Saved Conversation ID
// ======================================

const storageKey =
    getConversationStorageKey();

const savedConversationId =
    storageKey
        ? localStorage.getItem(storageKey)
        : null;

// ======================================
// Send request to backend
// ======================================

const response = await fetch(

    API_URL,

    {

        method: "POST",

        headers: {

            "Content-Type":
                "application/json",

            "Authorization":
                `Bearer ${token}`,

            "Accept":
                "application/json"

        },

        body: JSON.stringify({

            message: message,

            conversationId:
                savedConversationId,

            personality:
                "professional",

            tone:
                "neutral"

        })

    }

);

        console.log(
            "AI server status:",
            response.status
        );

        const rawResponse =
            await response.text();

        console.log(
            "AI server response:",
            rawResponse
        );

        if (!response.ok) {

            throw new Error(

                `AI server error ${response.status}: ${rawResponse}`

            );

        }

        let data;

        try {

            data =
                JSON.parse(rawResponse);

        }

        catch {

            throw new Error(

                "Backend returned invalid JSON."

            );

        }

if (data.conversationId) {

    const storageKey =
        getConversationStorageKey();

    if (storageKey) {

        localStorage.setItem(

            storageKey,

            data.conversationId

        );

    }

}

        if (!data.success) {

            throw new Error(

                data.message ||
                "AI request failed."

            );

        }

        const reply =
            data.reply;

        if (!reply) {

            throw new Error(

                "Backend returned no AI reply."

            );

        }

        // ======================================
        // Remove typing indicator
        // ======================================

        typingBubble?.remove();

        // ======================================
        // Display AI response
        // ======================================

        addAIMessage(reply);

        // ======================================
        // Save response in local conversation
        // ======================================

        conversation.push({

            role: "assistant",

            content: reply

        });

        // ======================================
        // Speak AI response
        // ======================================

        speak(reply);

    }

    catch(error) {

    console.error(
        "EchoCall AI ERROR:",
        error
    );

    typingBubble?.remove();

    throw error;

}

}

// ==========================================
// Clear Conversation
// ==========================================

export function clearConversation(){

    conversation.length = 0;

    if(!aiChatContainer){

        return;

    }

    aiChatContainer.innerHTML = `

        <div class="ai-message">

            <div class="ai-avatar">

                🤖

            </div>

            <div class="ai-bubble">

                Hello! I'm EchoCall AI.<br><br>

                How can I help you today?

            </div>

        </div>

    `;

}

// ==========================================
// Conversation Getter
// ==========================================

export function getConversation(){

    return conversation;

}

// ==========================================
// AI Status
// ==========================================

export function isAIBusy(){

    return isSending;

}

// ==========================================
// End Part 3
// ==========================================
// ==========================================
// EchoCall AI
// File: js/ai.js
// Part 4 (Final)
// Append below Part 3
// ==========================================

// ==========================================
// Speech Recognition
// ==========================================

const SpeechRecognition =

    window.SpeechRecognition ||

    window.webkitSpeechRecognition;

let recognition = null;

if(SpeechRecognition){

    recognition =

    new SpeechRecognition();

    recognition.lang = "en-US";

    recognition.interimResults = false;

    recognition.continuous = false;

    recognition.onresult = (event)=>{

        const text =

        event.results[0][0].transcript;

        aiInput.value = text;

        sendMessage();

    };

    recognition.onerror = ()=>{

        showToast(

            "Voice recognition failed.",

            "error"

        );

    };

}

// ==========================================
// Start Voice Input
// ==========================================

export function startVoiceInput(){

    if(!recognition){

        showToast(

            "Voice recognition is not supported on this device.",

            "warning"

        );

        return;

    }

    recognition.start();

}

// ==========================================
// Text To Speech
// ==========================================

export function speak(text){

    if(!("speechSynthesis" in window)){

        return;

    }

    speechSynthesis.cancel();

    const utterance =

    new SpeechSynthesisUtterance(text);

    utterance.rate = 1;

    utterance.pitch = 1;

    utterance.volume = 1;

    speechSynthesis.speak(

        utterance

    );

}

// ==========================================
// Speak Latest AI Reply
// ==========================================

export function speakLatestReply(){

    const replies =

    conversation.filter(

        item=>item.role==="assistant"

    );

    if(!replies.length){

        return;

    }

    speak(

        replies[replies.length-1].content

    );

}

// ==========================================
// Stop Speaking
// ==========================================

export function stopSpeaking(){

    if("speechSynthesis" in window){

        speechSynthesis.cancel();

    }

}

// ==========================================
// Destroy AI
// ==========================================

export function destroyAI(){

    stopSpeaking();

    if(recognition){

        recognition.abort();

    }

}


// ==========================================
// End of ai.js
// ==========================================