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

let aiCameraButton = null;

let aiCameraInput = null;

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

    aiCameraButton =
        document.getElementById("aiCameraButton");

    aiCameraInput =
        document.getElementById("aiCameraInput");

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

    initializeEvents();

    aiInitialized = true;

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

window.addEventListener(
    "echocall:open-ai-conversation",
    async (event) => {

        const conversationId =
            event.detail?.conversationId;

        if (!conversationId) {
            return;
        }

        await loadConversationById(
            conversationId
        );

        openAI();
    }
);

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
        message.content,

    attachment:
        message.attachment ||
        null
});

            if (
    message.role === "user"
) {

    if (
        message.content
    ) {
        addUserMessage(
            message.content
        );
    }

    if (
        message.attachment
    ) {
        addSavedUserFileMessage(
            message.attachment
        );
    }

}

                      else {

                addAIMessage(
                    message.content
                );

            }

        } // closes the for...of loop

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
// Load ANY EchoCall conversation
// ==========================================

export async function loadConversationById(conversationId) {

    if (!conversationId) {
        console.warn(
            "AI: No conversation ID supplied."
        );
        return;
    }

    const user = auth.currentUser;

    if (!user) {
        console.warn(
            "AI: Cannot load conversation without user."
        );
        return;
    }

    if (!aiChatContainer) {
        console.warn(
            "AI: Chat container not available."
        );
        return;
    }

    try {

        console.log(
            "AI: Loading conversation:",
            conversationId
        );

        // Save active conversation ID
        const storageKey =
            getConversationStorageKey();

        if (storageKey) {
            localStorage.setItem(
                storageKey,
                conversationId
            );
        }

        // Firebase authentication token
        const token =
            await user.getIdToken();

        const response =
            await fetch(
                `${API_BASE_URL}/conversations/${encodeURIComponent(conversationId)}/messages`,
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
            "AI conversation load status:",
            response.status
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
        // CLEAR CURRENT CHAT
        // ======================================

        conversation.length = 0;

        aiChatContainer.innerHTML = "";

        // ======================================
        // RESTORE SAVED MESSAGES
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

            // Restore internal conversation state
            conversation.push({

                role:
                    message.role,

                content:
                    message.content || "",

                attachment:
                    message.attachment || null

            });

            // ==================================
            // USER MESSAGE
            // ==================================

            if (
                message.role === "user"
            ) {

                if (
                    message.content &&
                    message.content.trim()
                ) {

                    addUserMessage(
                        message.content
                    );

                }

                if (
                    message.attachment
                ) {

                    addSavedUserFileMessage(
                        message.attachment
                    );

                }

            }

            // ==================================
            // AI MESSAGE
            // ==================================

            else {

                if (
                    message.content
                ) {

                    addAIMessage(
                        message.content
                    );

                }

            }

        }

        console.log(
            `AI: Restored ${
                data.messages?.length || 0
            } messages from ${conversationId}`
        );

        scrollToBottom();

    }

    catch (error) {

        console.error(
            "AI: Failed to load conversation:",
            error
        );

        showToast(
            "Unable to load this conversation.",
            "error"
        );

    }

}


// ==========================================
// Events
// ==========================================

function initializeEvents() {

  const debugTokenBtn =
    document.getElementById("debugTokenBtn");

debugTokenBtn?.addEventListener(
    "click",
    debugFirebaseToken
);

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

    // ======================================
    // Attach File
    // ======================================

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

    // ======================================
    // Camera
    // ======================================

    aiCameraButton?.addEventListener(
        "click",
        () => {

            aiCameraInput?.click();

        }
    );

    aiCameraInput?.addEventListener(
        "change",
        handleAICameraCapture
    );

    // ======================================
    // Enter Key
    // ======================================

    aiInput?.addEventListener(
        "keydown",
        (event) => {

            if (event.key === "Enter") {

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
// AI Camera Capture
// ==========================================

function handleAICameraCapture(event) {

    const file =
        event.target.files?.[0];

    if (!file) {

        return;

    }

    console.log(
        "EchoCall AI camera photo:",
        file.name,
        file.type,
        file.size
    );

    selectedAIFile = file;

    if (!aiFilePreview) {

        return;

    }

    aiFilePreview.classList.remove(
        "hidden"
    );

    aiFilePreview.innerHTML = `

        <div class="ai-selected-file">

            <span class="material-symbols-rounded">
                photo_camera
            </span>

            <div>

                <strong>
                    Camera photo
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

function clearAIFile() {

    selectedAIFile = null;

    if (aiFileInput) {

        aiFileInput.value = "";

    }

    if (aiCameraInput) {

        aiCameraInput.value = "";

    }

    if (aiFilePreview) {

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
    // Require text OR file
    // ======================================

    if(!message && !file){

        return;

    }

    isSending = true;

    aiInput.value = "";

    // ======================================
    // Display user text
    // ======================================

    if (message || file) {

    if (message) {

        addUserMessage(message);

    }

    conversation.push({

        role: "user",

        content:
            message || "",

        attachment:
            file
                ? {
                    name: file.name,
                    type: file.type,
                    size: file.size
                }
                : null

    });

}
  
    // ======================================
    // Display selected file
    // ======================================

    if(file){

        addUserFileMessage(file);

    }

    const typingBubble =
        addTypingBubble();

    try{

        if(file){

            await analyzeSelectedFile(

                file,

                message ||
                "Analyze this file and explain its important contents.",

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

            "Sorry, I couldn't process that file or request."

        );

        showToast(

            error.message ||
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
// Render newly selected/uploaded file
// ==========================================

function addUserFileMessage(file) {
    if (!file || !aiChatContainer) return;

    const wrapper = document.createElement("div");
    wrapper.className = "user-message";

    const fileURL = URL.createObjectURL(file);

    let mediaHTML = "";

    if (file.type.startsWith("image/")) {

        mediaHTML = `
            <img
                src="${fileURL}"
                alt="${escapeHTML(file.name)}"
                class="ai-user-image"
            >
        `;

    } else if (file.type.startsWith("video/")) {

        mediaHTML = `
            <video
                src="${fileURL}"
                controls
                preload="metadata"
                class="ai-user-video">
            </video>
        `;

    } else if (file.type.startsWith("audio/")) {

        mediaHTML = `
            <audio
                src="${fileURL}"
                controls
                preload="metadata"
                class="ai-user-audio">
            </audio>
        `;

    } else {

        mediaHTML = `
            <div class="ai-file-document-icon">
                <span class="material-symbols-rounded">
                    description
                </span>
            </div>
        `;
    }

    wrapper.innerHTML = `
        <div class="user-bubble ai-file-message">

            ${mediaHTML}

            <div class="ai-file-name">
                ${escapeHTML(file.name)}
            </div>

            <div class="ai-file-size">
                ${formatFileSize(file.size)}
            </div>

        </div>
    `;

    aiChatContainer.appendChild(wrapper);

    scrollToBottom();
}


// ==========================================
// Render SAVED file from Firebase Storage
// ==========================================

function addSavedUserFileMessage(attachment) {

    if (!attachment || !aiChatContainer) {
        return;
    }

    const wrapper = document.createElement("div");

    wrapper.className = "user-message";

    const type =
        attachment.type || "";

    const downloadURL =
        attachment.downloadURL || "";

    let mediaHTML = "";


    // ======================================
    // SAVED IMAGE
    // ======================================

    if (
        type.startsWith("image/") &&
        downloadURL
    ) {

        mediaHTML = `
            <img
                src="${escapeHTML(downloadURL)}"
                alt="${escapeHTML(
                    attachment.name || "Image"
                )}"
                class="ai-user-image"
                loading="lazy"
            >
        `;

    }


    // ======================================
    // SAVED VIDEO
    // ======================================

    else if (
        type.startsWith("video/") &&
        downloadURL
    ) {

        mediaHTML = `
            <video
                src="${escapeHTML(downloadURL)}"
                controls
                preload="metadata"
                class="ai-user-video">
            </video>
        `;

    }


    // ======================================
    // SAVED AUDIO
    // ======================================

    else if (
        type.startsWith("audio/") &&
        downloadURL
    ) {

        mediaHTML = `
            <audio
                src="${escapeHTML(downloadURL)}"
                controls
                preload="metadata"
                class="ai-user-audio">
            </audio>
        `;

    }


    // ======================================
    // SAVED DOCUMENT / OTHER FILE
    // ======================================

    else {

        mediaHTML = `
            <div class="ai-file-document-icon">

                <span class="material-symbols-rounded">
                    description
                </span>

            </div>
        `;
    }


    // ======================================
    // File card
    // ======================================

    wrapper.innerHTML = `
        <div class="user-bubble ai-file-message">

            ${mediaHTML}

            <div class="ai-file-name">
                ${escapeHTML(
                    attachment.name ||
                    "Attached file"
                )}
            </div>

            <div class="ai-file-size">
                ${formatFileSize(
                    attachment.size || 0
                )}
            </div>

            ${
                downloadURL
                    ? `
                        <a
                            href="${escapeHTML(downloadURL)}"
                            target="_blank"
                            rel="noopener noreferrer"
                            class="ai-file-open">
                            Open file
                        </a>
                    `
                    : ""
            }

        </div>
    `;

    aiChatContainer.appendChild(wrapper);

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

async function analyzeSelectedFile(

    file,

    prompt,

    typingBubble

){

    try{

        console.log(

            "EchoCall AI → Uploading file:",

            file.name

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
            const storageKey =
    getConversationStorageKey();

const conversationId =
    storageKey
        ? localStorage.getItem(storageKey)
        : null;

        // ======================================
        // Images use existing vision endpoint
        // ======================================

        if(
            file.type.startsWith("image/")
        ){

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

           if (conversationId) {
    formData.append(
        "conversationId",
        conversationId
    );
           }
          
            const response =
                await fetch(

                    `${API_BASE_URL}/analyze-image`,

                    {

                        method: "POST",

                        headers: {

                            "Authorization":
                                `Bearer ${token}`,

                            "Accept":
                                "application/json"

                        },

                        body:
                            formData

                    }

                );

            const rawResponse =
                await response.text();

            if(!response.ok){

                throw new Error(

                    `Image analysis failed: ${response.status} ${rawResponse}`

                );

            }

            const data =
                JSON.parse(
                    rawResponse
                );

            if (!data.success) {

    throw new Error(
        data.message ||
        "Image analysis failed."
    );
}

// Save the conversation ID returned by the backend
if (
    data.conversationId &&
    auth.currentUser
) {

    const storageKey =
        getConversationStorageKey();

    if (storageKey) {

        localStorage.setItem(
            storageKey,
            data.conversationId
        );

    }

}

            const answer =
                data.analysis;

            if(!answer){

                throw new Error(

                    "No image analysis returned."

                );

            }

            typingBubble?.remove();

            addAIMessage(
                answer
            );

            conversation.push({

                role: "assistant",

                content: answer

            });

            speak(answer);

            clearAIFile();

            return;

        }

        // ======================================
        // All other files
        // ======================================

        const formData =
            new FormData();

        formData.append(
            "file",
            file
        );

        formData.append(
            "prompt",
            prompt
        );

      if (conversationId) {
    formData.append(
        "conversationId",
        conversationId
    );
      }

        const response =
            await fetch(

                `${API_BASE_URL}/analyze-file`,

                {

                    method: "POST",

                    headers: {

                        "Authorization":
                            `Bearer ${token}`,

                        "Accept":
                            "application/json"

                    },

                    body:
                        formData

                }

            );

        const rawResponse =
            await response.text();

        console.log(

            "File analysis response:",

            rawResponse

        );

        if(!response.ok){

            let serverMessage =
                "File analysis failed.";

            try{

                const errorData =
                    JSON.parse(
                        rawResponse
                    );

                serverMessage =
                    errorData.message ||
                    serverMessage;

            }

            catch{

                if(rawResponse){

                    serverMessage =
                        rawResponse;

                }

            }

            throw new Error(
                serverMessage
            );

        }

        const data =
            JSON.parse(
                rawResponse
            );

        if (!data.success) {

    throw new Error(
        data.message ||
        "File analysis failed."
    );
}

// Save the conversation ID returned by the backend
if (
    data.conversationId &&
    auth.currentUser
) {

    const storageKey =
        getConversationStorageKey();

    if (storageKey) {

        localStorage.setItem(
            storageKey,
            data.conversationId
        );

    }

}

        const answer =
            data.answer;

        if(!answer){

            throw new Error(

                "EchoCall AI returned no answer."

            );

        }

        typingBubble?.remove();

        addAIMessage(
            answer
        );

        conversation.push({

            role: "assistant",

            content: answer

        });

        speak(answer);

        clearAIFile();

    }

    catch(error){

        console.error(

            "EchoCall AI File Analysis Error:",

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

export function clearConversation() {

    conversation.length = 0;

    if (!aiChatContainer) {
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
// Speech Recognition
// ==========================================

const SpeechRecognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;

let recognition = null;
let isRecognizing = false;

if (SpeechRecognition) {

    recognition = new SpeechRecognition();

    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.continuous = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {

        isRecognizing = true;

        console.log(
            "EchoCall AI microphone started."
        );

        showToast(
            "Listening... Speak now.",
            "success"
        );

    };

    recognition.onresult = (event) => {

        const text =
            event.results?.[0]?.[0]?.transcript?.trim();

        console.log(
            "Voice recognition result:",
            text
        );

        if (!text) {

            showToast(
                "I didn't hear anything.",
                "warning"
            );

            return;

        }

        if (aiInput) {

            aiInput.value = text;

        }

        sendMessage();

    };

    recognition.onerror = (event) => {

        console.error(
            "Speech recognition error:",
            event.error
        );

        isRecognizing = false;

        switch (event.error) {

            case "not-allowed":
            case "service-not-allowed":

                showToast(
                    "Microphone permission was denied. Allow microphone access for EchoCall AI.",
                    "error"
                );

                break;

            case "no-speech":

                showToast(
                    "I didn't hear you. Tap Voice Chat and speak.",
                    "warning"
                );

                break;

            case "audio-capture":

                showToast(
                    "The microphone could not be accessed.",
                    "error"
                );

                break;

            case "network":

                showToast(
                    "Voice recognition needs a network connection.",
                    "error"
                );

                break;

            case "aborted":

                console.log(
                    "Speech recognition aborted."
                );

                break;

            default:

                showToast(
                    `Voice recognition failed: ${event.error}`,
                    "error"
                );

        }

    };

    recognition.onend = () => {

        isRecognizing = false;

        console.log(
            "EchoCall AI microphone stopped."
        );

    };

}


// ==========================================
// Start Voice Input
// ==========================================

export function startVoiceInput() {

    if (!recognition) {

        showToast(
            "Voice recognition is not supported by this browser.",
            "warning"
        );

        console.error(
            "SpeechRecognition API unavailable."
        );

        return;

    }

    if (isRecognizing) {

        console.log(
            "Voice recognition is already running."
        );

        return;

    }

    try {

        recognition.start();

        console.log(
            "Starting EchoCall AI voice recognition..."
        );

    }

    catch (error) {

        console.error(
            "Unable to start voice recognition:",
            error
        );

        showToast(
            "Could not start the microphone.",
            "error"
        );

    }

}


// ==========================================
// Text To Speech
// ==========================================

export function speak(text) {

    if (!("speechSynthesis" in window)) {

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

export function speakLatestReply() {

    const replies =
        conversation.filter(
            item => item.role === "assistant"
        );

    if (!replies.length) {

        return;

    }

    speak(
        replies[replies.length - 1].content
    );

}


// ==========================================
// Stop Speaking
// ==========================================

export function stopSpeaking() {

    if ("speechSynthesis" in window) {

        speechSynthesis.cancel();

    }

}


// ==========================================
// Destroy AI
// ==========================================

export function destroyAI() {

    stopSpeaking();

    if (recognition) {

        recognition.abort();

    }

}                
        

// ==========================================
// End of ai.js
// ==========================================
