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

let aiAttachButton = null;

let aiFileInput = null;

let aiFilePreview = null;

// ==========================================
// State
// ==========================================

let isSending = false;

const conversation = [];

let selectedAIFile = null;

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

export async function initializeAI() {

    aiModal =
    document.getElementById("aiModal");

    aiChatContainer =
    document.getElementById("aiChatContainer");

    aiInput =
    document.getElementById("aiInput");

    sendAiMessage =
    document.getElementById("sendAiMessage");
    
    aiAttachButton =
    document.getElementById("aiAttachButton");

   aiFileInput =
    document.getElementById("aiFileInput");

   aiFilePreview =
    document.getElementById("aiFilePreview");

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

   aiAttachButton?.addEventListener(
    "click",
    () => {

        aiFileInput?.click();

    }
);

aiFileInput?.addEventListener(
    "change",
    handleAIFileSelection
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
// AI File Selection
// ==========================================

function handleAIFileSelection(event){

    const file =
        event.target.files?.[0];

    if(!file){

        return;

    }

    console.log(
        "EchoCall AI file selected:",
        file.name,
        file.type,
        file.size
    );

    // ======================================
    // Store selected file
    // ======================================

    selectedAIFile = file;

    // ======================================
    // Validate image
    // ======================================

    if(!file.type.startsWith("image/")){

        showToast(
            "For now, EchoCall AI can analyze images. Document analysis is the next step.",
            "warning"
        );

    }

    // ======================================
    // Show preview
    // ======================================

    if(!aiFilePreview){

        return;

    }

    aiFilePreview.classList.remove(
        "hidden"
    );

    aiFilePreview.innerHTML = `

        <div class="ai-selected-file">

            <span class="material-symbols-rounded">
                ${
                    file.type.startsWith("image/")
                        ? "image"
                        : "description"
                }
            </span>

            <div>

                <strong>
                    ${escapeHTML(file.name)}
                </strong>

                <small>
                    ${formatFileSize(file.size)}
                </small>

            </div>

            <button
                type="button"
                id="removeAIFile"
                class="icon-button">

                <span class="material-symbols-rounded">
                    close
                </span>

            </button>

        </div>

    `;

    document
        .getElementById("removeAIFile")
        ?.addEventListener(
            "click",
            clearAIFile
        );

}

// ==========================================
// Format File Size
// ==========================================

function formatFileSize(bytes) {

    if (bytes < 1024) {

        return `${bytes} B`;

    }

    if (bytes < 1024 * 1024) {

        return `${(
            bytes / 1024
        ).toFixed(1)} KB`;

    }

    return `${(
        bytes / (1024 * 1024)
    ).toFixed(1)} MB`;

}

// ==========================================
// Clear Selected AI File
// ==========================================

function clearAIFile(){

    selectedAIFile = null;

    if(aiFileInput){

        aiFileInput.value = "";

    }

    if(aiFilePreview){

        aiFilePreview.innerHTML = "";

        aiFilePreview.classList.add(
            "hidden"
        );

    }

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

    const file =
        selectedAIFile;

    // ======================================
    // Require either text OR a file
    // ======================================

    if(!message && !file){

        return;

    }

    // ======================================
    // Images can be analyzed
    // ======================================

    if(
        file &&
        !file.type.startsWith("image/")
    ){

        showToast(

            "Only images are connected to AI analysis right now.",

            "warning"

        );

        return;

    }

    isSending = true;

    aiInput.value = "";

    // ======================================
    // Display user message
    // ======================================

    if(message){

        addUserMessage(message);

    }

    // ======================================
    // Display selected image
    // ======================================

    if(file){

        addUserFileMessage(file);

    }

    // ======================================
    // Save text locally
    // ======================================

    if(message){

        conversation.push({

            role:"user",

            content:message

        });

    }

    const typingBubble =
        addTypingBubble();

    try{

        if(file){

            await analyzeSelectedImage(

                file,

                message ||
                "Describe this image in detail.",

                typingBubble

            );

        }
        else{

            await getAIResponse(

                message,

                typingBubble

            );

        }

    }

    catch(error){

        console.error(
            "EchoCall AI message error:",
            error
        );

        typingBubble?.remove();

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

function addUserFileMessage(file){

    const wrapper =
        document.createElement("div");

    wrapper.className =
        "user-message";

    const imageURL =
        URL.createObjectURL(file);

    wrapper.innerHTML = `

        <div class="user-bubble ai-image-message">

            <img
                src="${imageURL}"
                alt="${escapeHTML(file.name)}"
                class="ai-user-image"
            >

            <div class="ai-file-name">

                ${escapeHTML(file.name)}

            </div>

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

async function analyzeSelectedImage(

    file,

    prompt,

    typingBubble

){

    try{

        console.log(
            "EchoCall AI → Uploading image"
        );

        const user =
            auth.currentUser;

        if(!user){

            throw new Error(
                "You are not signed in."
            );

        }

        const token =
            await user.getIdToken();

        // ======================================
        // Create multipart form
        // ======================================

        const formData =
            new FormData();

        formData.append(
            "image",
            file
        );

        formData.append(
            "prompt",
            prompt
        );

        // ======================================
        // Send image to backend
        // ======================================

        const response =
            await fetch(

                `${API_BASE_URL}/analyze-image`,

                {

                    method:"POST",

                    headers:{

                        "Authorization":
                            `Bearer ${token}`,

                        "Accept":
                            "application/json"

                    },

                    body:formData

                }

            );

        console.log(
            "Image analysis status:",
            response.status
        );

        const rawResponse =
            await response.text();

        console.log(
            "Image analysis response:",
            rawResponse
        );

        if(!response.ok){

            throw new Error(

                `Image analysis failed: ${response.status} ${rawResponse}`

            );

        }

        let data;

        try{

            data =
                JSON.parse(rawResponse);

        }
        catch{

            throw new Error(
                "Backend returned invalid JSON."
            );

        }

        if(!data.success){

            throw new Error(

                data.message ||
                "Image analysis failed."

            );

        }

        const analysis =
            data.analysis;

        if(!analysis){

            throw new Error(
                "No image analysis returned."
            );

        }

        // ======================================
        // Remove typing
        // ======================================

        typingBubble?.remove();

        // ======================================
        // Display AI analysis
        // ======================================

        addAIMessage(
            analysis
        );

        // ======================================
        // Save AI response
        // ======================================

        conversation.push({

            role:"assistant",

            content:analysis

        });

        // ======================================
        // Speak response
        // ======================================

        speak(analysis);

        // ======================================
        // Clear selected image
        // ======================================

        clearAIFile();

    }

    catch(error){

        console.error(

            "EchoCall Image Analysis Error:",

            error

        );

        typingBubble?.remove();

        throw error;

    }

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
        
        console.log(
    "AI Saved Conversation ID:",
    data.conversationId
);

console.log(
    "AI Storage Key:",
    storageKey
);

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