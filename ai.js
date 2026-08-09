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
// Configuration
// ==========================================

const API_URL =
"https://echocall-ai-backend.onrender.com/api/chat";

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

    initializeEvents();

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

    const response = await fetch(

        API_URL,

        {

            method:"POST",

            headers:{

                "Content-Type":"application/json"

            },

            body:JSON.stringify({

                message,

                conversation

            })

        }

    );

    if(!response.ok){

        throw new Error(

            "Unable to contact AI server."

        );

    }

    const data =

    await response.json();

    typingBubble.remove();

    const reply =

        data.reply ||

        "I couldn't generate a response.";

    addAIMessage(reply);

    conversation.push({

        role:"assistant",

        content:reply

    });

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