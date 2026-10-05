/* ==========================================================
   EchoCall AI
   File: js/messages.js

   Messages Engine
   Part 1/4

   Handles:
   - Firebase Auth
   - Firestore conversations
   - Firestore messages
   - Firebase Storage
   - Contact-only messaging
   - Conversation loading
   - Sending text
   - Message rendering
   - Read/unread state
   - Search
========================================================== */

import {
    auth,
    db,
    storage
} from "./firebase.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {
    collection,
    addDoc,
    setDoc,
    updateDoc,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    query,
    where,
    orderBy,
    limit,
    onSnapshot,
    serverTimestamp,
    arrayUnion,
    arrayRemove
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

import {
    ref,
    uploadBytes,
    getDownloadURL,
    deleteObject
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-storage.js";


/* ==========================================================
   CONFIGURATION
========================================================== */

const USERS_COLLECTION = "users";

const CONTACTS_SUBCOLLECTION = "contacts";

const CONVERSATIONS_COLLECTION =
    "conversations";

const MESSAGES_SUBCOLLECTION =
    "messages";

const STORAGE_ROOT =
    "message-files";

const MAX_FILE_SIZE =
    100 * 1024 * 1024;

const MAX_TEXT_LENGTH =
    5000;


/* ==========================================================
   STATE
========================================================== */

let currentUser = null;

let activeConversation = null;

let activeConversationId = null;

let conversationUnsubscribe = null;

let messageUnsubscribe = null;

let authUnsubscribe = null;

let currentFilter = "all";

let currentSearch = "";

let selectedMessages = new Set();

let replyingTo = null;

let editingMessageId = null;

let recording = false;

let mediaRecorder = null;

let recordedChunks = [];

let recordingStream = null;

let viewOnceMode = false;

let messageInitialized = false;


/* ==========================================================
   DOM HELPERS
========================================================== */

function getElement(id) {
    return document.getElementById(id);
}


function getElements(selector) {
    return Array.from(
        document.querySelectorAll(selector)
    );
}


/* ==========================================================
   INITIALIZER
   IMPORTANT:
   Keep this name for the EchoCall router.
========================================================== */

export function initializeMessages() {

    if (messageInitialized) {
        return;
    }

    messageInitialized = true;

    setupAuth();

    setupHeader();

    setupSearch();

    setupFilters();

    setupNewMessageModal();

    setupMessageComposer();

    setupMessageActions();

    setupBottomNavigation();

    setupKeyboardShortcuts();

    console.log(
        "[Messages] Initialized."
    );
}


/* ==========================================================
   AUTH
========================================================== */

function setupAuth() {

    if (!auth) {
        showError(
            "Firebase Authentication is unavailable."
        );

        return;
    }

    authUnsubscribe =
        onAuthStateChanged(
            auth,
            async (user) => {

                currentUser =
                    user || null;

                if (!user) {

                    showError(
                        "Please sign in to use Messages."
                    );

                    return;
                }

                await loadConversations();

                await updateUserPresence();

            }
        );
}


/* ==========================================================
   USER PRESENCE
========================================================== */

async function updateUserPresence() {

    if (!currentUser) {
        return;
    }

    try {

        const userRef =
            doc(
                db,
                USERS_COLLECTION,
                currentUser.uid
            );

        await setDoc(
            userRef,
            {
                uid: currentUser.uid,
                email:
                    currentUser.email || "",
                displayName:
                    currentUser.displayName || "",
                photoURL:
                    currentUser.photoURL || "",
                lastSeen:
                    serverTimestamp(),
                online: true
            },
            {
                merge: true
            }
        );

    } catch (error) {

        console.warn(
            "[Messages] Presence update failed:",
            error
        );

    }
}


/* ==========================================================
   HEADER
========================================================== */

function setupHeader() {

    const back =
        getElement(
            "messagesBackButton"
        );

    if (back) {

        back.addEventListener(
            "click",
            () => navigateTo("call")
        );

    }


    const searchButton =
        getElement(
            "messagesSearchButton"
        );

    if (searchButton) {

        searchButton.addEventListener(
            "click",
            toggleSearch
        );

    }


    const moreButton =
        getElement(
            "messagesMoreButton"
        );

    if (moreButton) {

        moreButton.addEventListener(
            "click",
            toggleMoreMenu
        );

    }


    const refresh =
        getElement(
            "refreshMessagesButton"
        );

    if (refresh) {

        refresh.addEventListener(
            "click",
            loadConversations
        );

    }

}


/* ==========================================================
   SEARCH
========================================================== */

function setupSearch() {

    const input =
        getElement(
            "messagesSearchInput"
        );

    const clear =
        getElement(
            "messagesSearchClear"
        );

    if (input) {

        input.addEventListener(
            "input",
            () => {

                currentSearch =
                    input.value
                        .trim()
                        .toLowerCase();

                renderConversationList();

            }
        );

    }


    if (clear) {

        clear.addEventListener(
            "click",
            () => {

                if (input) {
                    input.value = "";
                }

                currentSearch = "";

                renderConversationList();

            }
        );

    }

}


function toggleSearch() {

    const panel =
        getElement(
            "messagesSearchPanel"
        );

    if (!panel) {
        return;
    }

    const active =
        panel.classList.toggle(
            "active"
        );

    panel.setAttribute(
        "aria-hidden",
        String(!active)
    );

    if (active) {

        const input =
            getElement(
                "messagesSearchInput"
            );

        if (input) {
            setTimeout(
                () => input.focus(),
                50
            );
        }

    }

}


/* ==========================================================
   FILTERS
========================================================== */

function setupFilters() {

    getElements(
        ".message-filter"
    ).forEach(
        (button) => {

            button.addEventListener(
                "click",
                () => {

                    const filter =
                        button.dataset.filter ||
                        "all";

                    currentFilter =
                        filter;

                    getElements(
                        ".message-filter"
                    ).forEach(
                        (item) => {

                            item.classList.toggle(
                                "active",
                                item === button
                            );

                            if (
                                item === button
                            ) {

                                item.setAttribute(
                                    "aria-current",
                                    "true"
                                );

                            } else {

                                item.removeAttribute(
                                    "aria-current"
                                );

                            }

                        }
                    );

                    renderConversationList();

                }
            );

        }
    );

}


/* ==========================================================
   CONVERSATION STATE
========================================================== */

let conversations = [];


/* ==========================================================
   LOAD CONVERSATIONS
========================================================== */

async function loadConversations() {

    if (!currentUser) {
        return;
    }

    const loading =
        getElement(
            "messagesLoading"
        );

    const list =
        getElement(
            "conversationList"
        );

    const empty =
        getElement(
            "messagesEmpty"
        );

    if (loading) {
        loading.hidden = false;
    }

    if (empty) {
        empty.hidden = true;
    }

    try {

        const conversationsQuery =
            query(
                collection(
                    db,
                    CONVERSATIONS_COLLECTION
                ),
                where(
                    "members",
                    "array-contains",
                    currentUser.uid
                ),
                orderBy(
                    "updatedAt",
                    "desc"
                ),
                limit(100)
            );

        if (conversationUnsubscribe) {
            conversationUnsubscribe();
        }

        conversationUnsubscribe =
            onSnapshot(
                conversationsQuery,
                (snapshot) => {

                    conversations =
                        snapshot.docs.map(
                            (item) => ({
                                id: item.id,
                                ...item.data()
                            })
                        );

                    renderConversationList();

                },
                async (error) => {

                    console.error(
                        "[Messages] Conversation listener failed:",
                        error
                    );

                    await loadConversationsFallback();

                }
            );

    } catch (error) {

        console.error(
            "[Messages] Loading conversations failed:",
            error
        );

        await loadConversationsFallback();

    } finally {

        if (loading) {
            loading.hidden = true;
        }

    }

}


/* ==========================================================
   FALLBACK CONVERSATION LOADING
========================================================== */

async function loadConversationsFallback() {

    if (!currentUser) {
        return;
    }

    try {

        const snapshot =
            await getDocs(
                query(
                    collection(
                        db,
                        CONVERSATIONS_COLLECTION
                    ),
                    where(
                        "members",
                        "array-contains",
                        currentUser.uid
                    ),
                    limit(100)
                )
            );

        conversations =
            snapshot.docs.map(
                (item) => ({
                    id: item.id,
                    ...item.data()
                })
            );

        conversations.sort(
            (a, b) =>
                timestampValue(
                    b.updatedAt
                ) -
                timestampValue(
                    a.updatedAt
                )
        );

        renderConversationList();

    } catch (error) {

        console.error(
            "[Messages] Fallback failed:",
            error
        );

        showError(
            "Unable to load conversations."
        );

    }

}


/* ==========================================================
   RENDER CONVERSATION LIST
========================================================== */

function renderConversationList() {

    const list =
        getElement(
            "conversationList"
        );

    const loading =
        getElement(
            "messagesLoading"
        );

    const empty =
        getElement(
            "messagesEmpty"
        );

    const noResults =
        getElement(
            "messagesNoResults"
        );

    if (!list) {
        return;
    }

    list.innerHTML = "";

    let filtered =
        [...conversations];


    if (
        currentFilter ===
        "unread"
    ) {

        filtered =
            filtered.filter(
                (item) =>
                    Number(
                        item.unreadCount?.[
                            currentUser.uid
                        ] || 0
                    ) > 0
            );

    }


    if (
        currentFilter ===
        "groups"
    ) {

        filtered =
            filtered.filter(
                (item) =>
                    item.type === "group"
            );

    }


    if (currentSearch) {

        filtered =
            filtered.filter(
                (item) => {

                    const text =
                        [
                            item.name,
                            item.lastMessage,
                            item.phoneNumber,
                            item.username
                        ]
                        .filter(Boolean)
                        .join(" ")
                        .toLowerCase();

                    return text.includes(
                        currentSearch
                    );

                }
            );

    }


    if (loading) {
        loading.hidden = true;
    }


    if (
        !filtered.length
    ) {

        if (currentSearch) {

            if (noResults) {
                noResults.hidden = false;
            }

            if (empty) {
                empty.hidden = true;
            }

        } else {

            if (empty) {
                empty.hidden = false;
            }

            if (noResults) {
                noResults.hidden = true;
            }

        }

        updateUnreadCount();

        return;

    }


    if (empty) {
        empty.hidden = true;
    }

    if (noResults) {
        noResults.hidden = true;
    }


    filtered.forEach(
        (conversation) => {

            list.appendChild(
                createConversationElement(
                    conversation
                )
            );

        }
    );


    updateUnreadCount();

}


/* ==========================================================
   CREATE CONVERSATION ELEMENT
========================================================== */

function createConversationElement(
    conversation
) {

    const button =
        document.createElement(
            "button"
        );

    button.type = "button";

    button.className =
        "conversation-item glass";

    const unread =
        Number(
            conversation.unreadCount?.[
                currentUser.uid
            ] || 0
        );

    if (unread > 0) {
        button.classList.add(
            "unread"
        );
    }

    if (conversation.pinned) {
        button.classList.add(
            "pinned"
        );
    }


    const avatar =
        escapeHTML(
            conversation.photoURL ||
            ""
        );

    const name =
        escapeHTML(
            conversation.name ||
            conversation.username ||
            conversation.phoneNumber ||
            "Unknown"
        );

    const preview =
        escapeHTML(
            conversation.lastMessage ||
            "No messages yet"
        );

    const time =
        formatTime(
            conversation.updatedAt
        );


    button.innerHTML = `

        <span class="conversation-avatar">

            ${
                avatar
                ?
                `<img
                    src="${avatar}"
                    alt=""
                >`
                :
                `
                <span class="material-symbols-rounded">
                    person
                </span>
                `
            }

            ${
                conversation.online
                ?
                `
                <span
                    class="online-dot"
                ></span>
                `
                :
                ""
            }

        </span>


        <span class="conversation-content">

            <span class="conversation-top">

                <strong
                    class="conversation-name"
                >
                    ${name}
                </strong>

                <span
                    class="conversation-time"
                >
                    ${time}
                </span>

            </span>


            <span class="conversation-bottom">

                ${
                    conversation.pinned
                    ?
                    `
                    <span class="pinned-icon">

                        <span
                            class="material-symbols-rounded"
                        >
                            push_pin
                        </span>

                    </span>
                    `
                    :
                    ""
                }

                <span
                    class="conversation-preview"
                >
                    ${preview}
                </span>

                ${
                    unread > 0
                    ?
                    `
                    <span
                        class="unread-count"
                    >
                        ${unread > 99 ? "99+" : unread}
                    </span>
                    `
                    :
                    ""
                }

            </span>

        </span>

    `;


    button.addEventListener(
        "click",
        () =>
            openConversation(
                conversation
            )
    );


    return button;

}


/* ==========================================================
   UNREAD COUNT
========================================================== */

function updateUnreadCount() {

    const element =
        getElement(
            "unreadCount"
        );

    if (!element || !currentUser) {
        return;
    }

    const total =
        conversations.reduce(
            (
                sum,
                conversation
            ) =>
                sum +
                Number(
                    conversation.unreadCount?.[
                        currentUser.uid
                    ] || 0
                ),
            0
        );

    element.textContent =
        total > 99
            ? "99+"
            : String(total);

    element.hidden =
        total === 0;

}


/* ==========================================================
   OPEN CONVERSATION
========================================================== */

async function openConversation(
    conversation
) {

    activeConversation =
        conversation;

    activeConversationId =
        conversation.id;

    await markConversationRead(
        conversation.id
    );

    /*
       If the project later has a dedicated
       conversation screen, this function
       can navigate there.

       For now we keep the conversation
       engine ready for the message UI.
    */

    showToast(
        `Opening ${
            conversation.name ||
            conversation.username ||
            "conversation"
        }`
    );

    window.dispatchEvent(
        new CustomEvent(
            "echocall:conversation-opened",
            {
                detail: {
                    conversation
                }
            }
        )
    );

}


/* ==========================================================
   MARK CONVERSATION READ
========================================================== */

async function markConversationRead(
    conversationId
) {

    if (!currentUser) {
        return;
    }

    try {

        await updateDoc(
            doc(
                db,
                CONVERSATIONS_COLLECTION,
                conversationId
            ),
            {
                [`unreadCount.${currentUser.uid}`]:
                    0,

                [`lastReadAt.${currentUser.uid}`]:
                    serverTimestamp()
            }
        );

    } catch (error) {

        console.warn(
            "[Messages] Could not mark read:",
            error
        );

    }

}


/* ==========================================================
   SEND TEXT
========================================================== */

export async function sendTextMessage(
    text,
    options = {}
) {

    if (!currentUser) {
        throw new Error(
            "You must be signed in."
        );
    }

    const cleanText =
        String(text || "")
            .trim();

    if (!cleanText) {
        return null;
    }

    if (
        cleanText.length >
        MAX_TEXT_LENGTH
    ) {

        throw new Error(
            `Messages can contain up to ${MAX_TEXT_LENGTH} characters.`
        );

    }

    if (!activeConversationId) {

        throw new Error(
            "Open a conversation first."
        );

    }


    const messageRef =
        await addDoc(
            collection(
                db,
                CONVERSATIONS_COLLECTION,
                activeConversationId,
                MESSAGES_SUBCOLLECTION
            ),
            {
                senderId:
                    currentUser.uid,

                senderName:
                    currentUser.displayName ||
                    currentUser.email ||
                    "EchoCall User",

                type:
                    "text",

                text:
                    cleanText,

                createdAt:
                    serverTimestamp(),

                editedAt:
                    null,

                deletedForEveryone:
                    false,

                deletedFor:
                    [],

                delivered:
                    true,

                readBy:
                    [currentUser.uid],

                replyTo:
                    options.replyTo ||
                    null,

                viewOnce:
                    Boolean(
                        options.viewOnce
                    ),

                starredBy:
                    [],

                pinned:
                    false,

                reactions:
                    {},

                scheduled:
                    Boolean(
                        options.scheduled
                    ),

                scheduledFor:
                    options.scheduledFor ||
                    null
            }
        );


    await updateConversationPreview(
        cleanText,
        "text"
    );


    return messageRef.id;

}
/* ==========================================================
   UPDATE CONVERSATION PREVIEW
========================================================== */

async function updateConversationPreview(
    preview,
    type = "text"
) {

    if (
        !activeConversationId ||
        !currentUser
    ) {
        return;
    }

    const conversationRef =
        doc(
            db,
            CONVERSATIONS_COLLECTION,
            activeConversationId
        );


    const conversationSnap =
        await getDoc(
            conversationRef
        );

    if (!conversationSnap.exists()) {
        return;
    }


    const conversation =
        conversationSnap.data();


    const otherMembers =
        Array.isArray(
            conversation.members
        )
            ?
            conversation.members.filter(
                (uid) =>
                    uid !==
                    currentUser.uid
            )
            :
            [];


    const unreadCount =
        {
            ...(conversation.unreadCount || {})
        };


    otherMembers.forEach(
        (uid) => {

            unreadCount[uid] =
                Number(
                    unreadCount[uid] || 0
                ) + 1;

        }
    );


    const previewText =
        type === "voice"
            ? "🎤 Voice message"
            : type === "image"
                ? "📷 Photo"
                : type === "video"
                    ? "🎥 Video"
                    : type === "file"
                        ? "📎 File"
                        : preview;


    await updateDoc(
        conversationRef,
        {
            lastMessage:
                previewText,

            lastMessageType:
                type,

            lastSenderId:
                currentUser.uid,

            updatedAt:
                serverTimestamp(),

            unreadCount
        }
    );

}


/* ==========================================================
   OPEN A CONVERSATION BY USER ID
========================================================== */

export async function startConversationWithUser(
    otherUserId
) {

    if (
        !currentUser ||
        !otherUserId ||
        otherUserId ===
        currentUser.uid
    ) {
        return null;
    }


    const isContact =
        await isSavedContact(
            otherUserId
        );


    if (!isContact) {

        showToast(
            "You can only message saved contacts."
        );

        return null;

    }


    const conversationId =
        createDirectConversationId(
            currentUser.uid,
            otherUserId
        );


    const conversationRef =
        doc(
            db,
            CONVERSATIONS_COLLECTION,
            conversationId
        );


    const existing =
        await getDoc(
            conversationRef
        );


    if (!existing.exists()) {

        const contact =
            await getUserProfile(
                otherUserId
            );


        await setDoc(
            conversationRef,
            {
                id:
                    conversationId,

                type:
                    "direct",

                members:
                    [
                        currentUser.uid,
                        otherUserId
                    ],

                name:
                    contact?.displayName ||
                    contact?.username ||
                    contact?.phoneNumber ||
                    "Conversation",

                username:
                    contact?.username ||
                    "",

                phoneNumber:
                    contact?.phoneNumber ||
                    "",

                photoURL:
                    contact?.photoURL ||
                    "",

                online:
                    Boolean(
                        contact?.online
                    ),

                lastMessage:
                    "",

                lastMessageType:
                    "",

                lastSenderId:
                    "",

                unreadCount:
                    {
                        [currentUser.uid]: 0,
                        [otherUserId]: 0
                    },

                updatedAt:
                    serverTimestamp(),

                createdAt:
                    serverTimestamp()
            }
        );

    }


    const conversation =
        await getDoc(
            conversationRef
        );


    if (conversation.exists()) {

        await openConversation(
            {
                id:
                    conversation.id,
                ...conversation.data()
            }
        );

    }


    return conversationId;

}
/* ==========================================================
   CONTACTS
========================================================== */


/*
   EchoCall expects saved contacts at:

   users/{currentUserId}/contacts/{contactId}

   Each contact can contain:
   - uid
   - name
   - username
   - phoneNumber
   - photoURL
   - email
   - online
   - lastSeen

   If your contacts.js uses different field names,
   we can connect them later without changing
   the messaging engine.
*/


async function isSavedContact(
    otherUserId
) {

    if (
        !currentUser ||
        !otherUserId
    ) {
        return false;
    }

    try {

        const contactRef =
            doc(
                db,
                USERS_COLLECTION,
                currentUser.uid,
                CONTACTS_SUBCOLLECTION,
                otherUserId
            );

        const snapshot =
            await getDoc(
                contactRef
            );

        return snapshot.exists();

    } catch (error) {

        console.warn(
            "[Messages] Contact check failed:",
            error
        );

        return false;

    }

}


/* ==========================================================
   GET USER PROFILE
========================================================== */

async function getUserProfile(
    uid
) {

    try {

        const userRef =
            doc(
                db,
                USERS_COLLECTION,
                uid
            );

        const snapshot =
            await getDoc(
                userRef
            );

        if (
            !snapshot.exists()
        ) {
            return null;
        }

        return snapshot.data();

    } catch (error) {

        console.warn(
            "[Messages] Profile lookup failed:",
            error
        );

        return null;

    }

}


/* ==========================================================
   LOAD CONTACTS FOR NEW MESSAGE
========================================================== */

async function loadSavedContacts() {

    const list =
        getElement(
            "newMessageContactList"
        );

    const empty =
        getElement(
            "newMessageNoContacts"
        );

    if (!list || !currentUser) {
        return;
    }

    list.innerHTML = "";

    try {

        const snapshot =
            await getDocs(
                collection(
                    db,
                    USERS_COLLECTION,
                    currentUser.uid,
                    CONTACTS_SUBCOLLECTION
                )
            );


        if (
            snapshot.empty
        ) {

            if (empty) {
                empty.hidden = false;
            }

            return;

        }


        if (empty) {
            empty.hidden = true;
        }


        snapshot.docs.forEach(
            (contactDoc) => {

                const contact =
                    {
                        id:
                            contactDoc.id,
                        ...contactDoc.data()
                    };

                list.appendChild(
                    createContactElement(
                        contact
                    )
                );

            }
        );

    } catch (error) {

        console.error(
            "[Messages] Contact loading failed:",
            error
        );

        showError(
            "Unable to load contacts."
        );

    }

}


/* ==========================================================
   CONTACT ELEMENT
========================================================== */

function createContactElement(
    contact
) {

    const button =
        document.createElement(
            "button"
        );

    button.type =
        "button";

    button.className =
        "new-message-contact";


    const name =
        escapeHTML(
            contact.name ||
            contact.displayName ||
            contact.username ||
            contact.phoneNumber ||
            "Unknown contact"
        );


    const detail =
        escapeHTML(
            contact.username
                ? `@${contact.username}`
                : contact.phoneNumber ||
                  contact.email ||
                  ""
        );


    const photo =
        escapeHTML(
            contact.photoURL ||
            ""
        );


    button.innerHTML = `

        <span
            class="new-message-contact-avatar"
        >

            ${
                photo
                ?
                `<img
                    src="${photo}"
                    alt=""
                >`
                :
                `
                <span
                    class="material-symbols-rounded"
                >
                    person
                </span>
                `
            }

        </span>


        <span
            class="new-message-contact-info"
        >

            <strong
                class="new-message-contact-name"
            >
                ${name}
            </strong>

            <small
                class="new-message-contact-detail"
            >
                ${detail}
            </small>

        </span>


        ${
            contact.online
            ?
            `
            <span
                class="new-message-contact-status"
            >
                ● Online
            </span>
            `
            :
            ""
        }

    `;


    button.addEventListener(
        "click",
        async () => {

            closeNewMessageModal();

            await startConversationWithUser(
                contact.uid ||
                contact.id
            );

        }
    );


    return button;

}


/* ==========================================================
   NEW MESSAGE MODAL
========================================================== */

function setupNewMessageModal() {

    const open =
        getElement(
            "newMessageButton"
        );

    const emptyOpen =
        getElement(
            "emptyNewMessageButton"
        );

    const close =
        getElement(
            "closeNewMessageModal"
        );

    const openContacts =
        getElement(
            "openContactsFromModal"
        );


    if (open) {

        open.addEventListener(
            "click",
            openNewMessageModal
        );

    }


    if (emptyOpen) {

        emptyOpen.addEventListener(
            "click",
            openNewMessageModal
        );

    }


    if (close) {

        close.addEventListener(
            "click",
            closeNewMessageModal
        );

    }


    if (openContacts) {

        openContacts.addEventListener(
            "click",
            () => {

                closeNewMessageModal();

                navigateTo(
                    "contacts"
                );

            }
        );

    }


    const modal =
        getElement(
            "newMessageModal"
        );


    if (modal) {

        modal.addEventListener(
            "click",
            (event) => {

                if (
                    event.target ===
                    modal
                ) {

                    closeNewMessageModal();

                }

            }
        );

    }


    const search =
        getElement(
            "newMessageSearchInput"
        );


    if (search) {

        search.addEventListener(
            "input",
            () =>
                filterContactList(
                    search.value
                )
        );

    }

}


async function openNewMessageModal() {

    const modal =
        getElement(
            "newMessageModal"
        );

    if (!modal) {
        return;
    }

    modal.classList.add(
        "active"
    );

    modal.setAttribute(
        "aria-hidden",
        "false"
    );

    await loadSavedContacts();

}


function closeNewMessageModal() {

    const modal =
        getElement(
            "newMessageModal"
        );

    if (!modal) {
        return;
    }

    modal.classList.remove(
        "active"
    );

    modal.setAttribute(
        "aria-hidden",
        "true"
    );

}


function filterContactList(
    value
) {

    const search =
        String(value || "")
            .trim()
            .toLowerCase();


    getElements(
        ".new-message-contact"
    ).forEach(
        (element) => {

            const text =
                element.textContent
                    .toLowerCase();

            element.style.display =
                !search ||
                text.includes(search)
                    ? ""
                    : "none";

        }
    );

}


/* ==========================================================
   MESSAGE COMPOSER
========================================================== */

function setupMessageComposer() {

    /*
       The messages page is the conversation
       hub. A future conversation panel can use
       these global functions.

       We also support a composer if it exists
       in the DOM.
    */


    const sendButton =
        getElement(
            "sendMessageButton"
        );

    const input =
        getElement(
            "messageInput"
        );


    if (sendButton) {

        sendButton.addEventListener(
            "click",
            () => {

                if (editingMessageId) {

                    editMessage(
                        editingMessageId,
                        input?.value || ""
                    );

                } else {

                    sendTextMessage(
                        input?.value || "",
                        {
                            replyTo:
                                replyingTo
                        }
                    );

                }

                if (input) {
                    input.value = "";
                }

            }
        );

    }


    if (input) {

        input.addEventListener(
            "keydown",
            (event) => {

                if (
                    event.key === "Enter" &&
                    !event.shiftKey
                ) {

                    event.preventDefault();

                    sendButton?.click();

                }

            }
        );

    }

}


/* ==========================================================
   LOAD MESSAGES
========================================================== */

export function listenToMessages(
    conversationId,
    callback
) {

    if (!conversationId) {
        return () => {};
    }


    const messagesRef =
        collection(
            db,
            CONVERSATIONS_COLLECTION,
            conversationId,
            MESSAGES_SUBCOLLECTION
        );


    const messagesQuery =
        query(
            messagesRef,
            orderBy(
                "createdAt",
                "asc"
            )
        );


    if (messageUnsubscribe) {
        messageUnsubscribe();
    }


    messageUnsubscribe =
        onSnapshot(
            messagesQuery,
            (snapshot) => {

                const messages =
                    snapshot.docs.map(
                        (item) => ({
                            id:
                                item.id,
                            ...item.data()
                        })
                    );


                callback(
                    messages
                );

            },
            (error) => {

                console.error(
                    "[Messages] Message listener failed:",
                    error
                );

            }
        );


    return messageUnsubscribe;

}


/* ==========================================================
   RENDER MESSAGE
========================================================== */

export function renderMessage(
    message
) {

    const element =
        document.createElement(
            "article"
        );

    element.className =
        "message-bubble";


    element.dataset.messageId =
        message.id;


    if (
        message.senderId ===
        currentUser?.uid
    ) {

        element.classList.add(
            "sent"
        );

    } else {

        element.classList.add(
            "received"
        );

    }


    if (
        message.deletedForEveryone
    ) {

        element.innerHTML = `

            <div class="message-deleted">

                <span
                    class="material-symbols-rounded"
                >
                    block
                </span>

                <span>
                    This message was deleted
                </span>

            </div>

        `;

        return element;

    }


    let body = "";


    if (
        message.type ===
        "text"
    ) {

        body = `
            <p class="message-text">
                ${escapeHTML(
                    message.text || ""
                )}
            </p>
        `;

    }


    if (
        message.type ===
        "image"
    ) {

        body = `
            <div class="message-media">

                <img
                    src="${escapeHTML(
                        message.fileURL
                    )}"
                    alt="Shared image"
                    loading="lazy"
                >

            </div>
        `;

    }


    if (
        message.type ===
        "video"
    ) {

        body = `
            <div class="message-media">

                <video
                    src="${escapeHTML(
                        message.fileURL
                    )}"
                    controls
                    playsinline
                ></video>

            </div>
        `;

    }


    if (
        message.type ===
        "file"
    ) {

        body = `

            <a
                class="message-file"
                href="${escapeHTML(
                    message.fileURL
                )}"
                target="_blank"
                rel="noopener"
            >

                <span
                    class="material-symbols-rounded"
                >
                    description
                </span>

                <span>

                    <strong>
                        ${escapeHTML(
                            message.fileName ||
                            "File"
                        )}
                    </strong>

                    <small>
                        ${formatBytes(
                            message.fileSize
                        )}
                    </small>

                </span>

            </a>

        `;

    }


    if (
        message.type ===
        "voice"
    ) {

        body = `

            <div class="message-voice">

                <span
                    class="material-symbols-rounded"
                >
                    mic
                </span>

                <audio
                    src="${escapeHTML(
                        message.fileURL
                    )}"
                    controls
                ></audio>

            </div>

        `;

    }


    const edited =
        message.editedAt
            ? " • edited"
            : "";


    element.innerHTML = `

        ${
            message.replyTo
            ?
            `
            <div class="message-reply-preview">
                Replying to a message
            </div>
            `
            :
            ""
        }

        ${body}


        <div class="message-meta">

            <span>
                ${formatTime(
                    message.createdAt
                )}
                ${edited}
            </span>

            ${
                message.senderId ===
                currentUser?.uid
                    ?
                    `
                    <span
                        class="message-read-state"
                    >
                        ${
                            message.readBy?.length
                                ? "✓✓"
                                : "✓"
                        }
                    </span>
                    `
                    :
                    ""
            }

        </div>

    `;


    element.addEventListener(
        "contextmenu",
        (event) => {

            event.preventDefault();

            showMessageContextMenu(
                message,
                event.clientX,
                event.clientY
            );

        }
    );


    return element;

}


/* ==========================================================
   MESSAGE CONTEXT MENU
========================================================== */

function showMessageContextMenu(
    message,
    x,
    y
) {

    removeMessageContextMenu();


    const menu =
        document.createElement(
            "div"
        );

    menu.id =
        "dynamicMessageMenu";

    menu.className =
        "message-context-menu glass";


    const actions = [];


    actions.push({
        label: "Reply",
        icon: "reply",
        action: () =>
            setReplyMessage(
                message
            )
    });


    actions.push({
        label: "Copy",
        icon: "content_copy",
        action: () =>
            copyMessage(
                message
            )
    });


    if (
        message.type ===
        "text"
    ) {

        actions.push({
            label: "Edit",
            icon: "edit",
            action: () =>
                beginEditMessage(
                    message
                )
        });

    }


    actions.push({
        label:
            message.starredBy?.includes(
                currentUser?.uid
            )
                ? "Unstar"
                : "Star",
        icon: "star",
        action: () =>
            toggleStarMessage(
                message.id
            )
    });


    actions.push({
        label: "Select",
        icon: "check_box",
        action: () =>
            selectMessage(
                message.id
            )
    });


    if (
        message.senderId ===
        currentUser?.uid
    ) {

        actions.push({
            label: "Delete",
            icon: "delete",
            action: () =>
                deleteMessage(
                    message.id,
                    true
                )
        });

    }


    actions.forEach(
        (item) => {

            const button =
                document.createElement(
                    "button"
                );

            button.type =
                "button";

            button.innerHTML = `

                <span
                    class="material-symbols-rounded"
                >
                    ${item.icon}
                </span>

                <span>
                    ${item.label}
                </span>

            `;

            button.addEventListener(
                "click",
                () => {

                    removeMessageContextMenu();

                    item.action();

                }
            );

            menu.appendChild(
                button
            );

        }
    );


    document.body.appendChild(
        menu
    );


    const maxX =
        window.innerWidth -
        menu.offsetWidth -
        10;

    const maxY =
        window.innerHeight -
        menu.offsetHeight -
        10;


    menu.style.left =
        `${Math.max(
            10,
            Math.min(x, maxX)
        )}px`;


    menu.style.top =
        `${Math.max(
            10,
            Math.min(y, maxY)
        )}px`;

}


function removeMessageContextMenu() {

    const existing =
        getElement(
            "dynamicMessageMenu"
        );

    existing?.remove();

}
/* ==========================================================
   FILE / MEDIA SENDING
========================================================== */

export async function sendFileMessage(
    file,
    options = {}
) {

    if (!currentUser) {

        throw new Error(
            "You must be signed in."
        );

    }


    if (!activeConversationId) {

        throw new Error(
            "Open a conversation first."
        );

    }


    if (!file) {
        return null;
    }


    if (
        file.size >
        MAX_FILE_SIZE
    ) {

        throw new Error(
            "This file is larger than 100 MB."
        );

    }


    const type =
        getMessageFileType(
            file
        );


    const safeName =
        sanitizeFileName(
            file.name
        );


    const storagePath =
        [
            STORAGE_ROOT,
            currentUser.uid,
            activeConversationId,
            `${Date.now()}_${safeName}`
        ].join("/");


    const storageRef =
        ref(
            storage,
            storagePath
        );


    const uploadResult =
        await uploadBytes(
            storageRef,
            file,
            {
                contentType:
                    file.type ||
                    "application/octet-stream"
            }
        );


    const downloadURL =
        await getDownloadURL(
            uploadResult.ref
        );


    const messageRef =
        await addDoc(
            collection(
                db,
                CONVERSATIONS_COLLECTION,
                activeConversationId,
                MESSAGES_SUBCOLLECTION
            ),
            {
                senderId:
                    currentUser.uid,

                senderName:
                    currentUser.displayName ||
                    currentUser.email ||
                    "EchoCall User",

                type,

                text:
                    options.caption ||
                    "",

                fileURL:
                    downloadURL,

                storagePath,

                fileName:
                    file.name,

                fileSize:
                    file.size,

                mimeType:
                    file.type,

                createdAt:
                    serverTimestamp(),

                editedAt:
                    null,

                deletedForEveryone:
                    false,

                deletedFor:
                    [],

                delivered:
                    true,

                readBy:
                    [currentUser.uid],

                replyTo:
                    replyingTo ||
                    null,

                viewOnce:
                    Boolean(
                        options.viewOnce
                    ),

                viewedBy:
                    [],

                starredBy:
                    [],

                pinned:
                    false,

                reactions:
                    {}
            }
        );


    await updateConversationPreview(
        "",
        type
    );


    return messageRef.id;

}


/* ==========================================================
   FILE TYPE
========================================================== */

function getMessageFileType(
    file
) {

    if (
        file.type.startsWith(
            "image/"
        )
    ) {
        return "image";
    }


    if (
        file.type.startsWith(
            "video/"
        )
    ) {
        return "video";
    }


    return "file";

}


/* ==========================================================
   FILE INPUTS
========================================================== */

export function createMessageFileInput(
    options = {}
) {

    const input =
        document.createElement(
            "input"
        );

    input.type =
        "file";

    input.hidden =
        true;


    if (
        options.accept
    ) {

        input.accept =
            options.accept;

    }


    if (
        options.multiple
    ) {

        input.multiple =
            true;

    }


    if (
        options.capture
    ) {

        input.capture =
            options.capture;

    }


    input.addEventListener(
        "change",
        async () => {

            const files =
                Array.from(
                    input.files || []
                );


            for (
                const file
                of files
            ) {

                try {

                    await sendFileMessage(
                        file,
                        {
                            viewOnce:
                                viewOnceMode
                        }
                    );

                } catch (error) {

                    console.error(
                        "[Messages] Upload failed:",
                        error
                    );

                    showError(
                        error.message ||
                        "Unable to send file."
                    );

                }

            }


            input.remove();

        }
    );


    document.body.appendChild(
        input
    );


    input.click();

}


/* ==========================================================
   CAMERA
========================================================== */

export function openCamera() {

    createMessageFileInput({
        accept:
            "image/*,video/*",
        capture:
            "environment"
    });

}


/* ==========================================================
   PHOTO / VIDEO
========================================================== */

export function chooseMedia() {

    createMessageFileInput({
        accept:
            "image/*,video/*",
        multiple:
            true
    });

}


/* ==========================================================
   DOCUMENTS
========================================================== */

export function chooseDocument() {

    createMessageFileInput({
        accept:
            ".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.zip,.rar",
        multiple:
            true
    });

}


/* ==========================================================
   VOICE RECORDING
========================================================== */

export async function startVoiceRecording() {

    if (recording) {
        return;
    }


    if (!navigator.mediaDevices?.getUserMedia) {

        showError(
            "Voice recording is not supported here."
        );

        return;

    }


    try {

        recordingStream =
            await navigator.mediaDevices
                .getUserMedia({
                    audio: true
                });


        recordedChunks = [];


        mediaRecorder =
            new MediaRecorder(
                recordingStream
            );


        mediaRecorder.ondataavailable =
            (event) => {

                if (
                    event.data &&
                    event.data.size > 0
                ) {

                    recordedChunks.push(
                        event.data
                    );

                }

            };


        mediaRecorder.onstop =
            async () => {

                const blob =
                    new Blob(
                        recordedChunks,
                        {
                            type:
                                mediaRecorder.mimeType ||
                                "audio/webm"
                        }
                    );


                const file =
                    new File(
                        [
                            blob
                        ],
                        `voice_${Date.now()}.webm`,
                        {
                            type:
                                blob.type
                        }
                    );


                try {

                    await sendVoiceMessage(
                        file
                    );

                } catch (error) {

                    showError(
                        error.message ||
                        "Unable to send voice message."
                    );

                }


                recordingStream
                    ?.getTracks()
                    .forEach(
                        track =>
                            track.stop()
                    );

                recordingStream =
                    null;

            };


        mediaRecorder.start();

        recording = true;

        window.dispatchEvent(
            new CustomEvent(
                "echocall:voice-recording-started"
            )
        );


    } catch (error) {

        console.error(
            "[Messages] Microphone error:",
            error
        );

        showError(
            "Microphone permission was denied."
        );

    }

}


/* ==========================================================
   STOP VOICE RECORDING
========================================================== */

export function stopVoiceRecording() {

    if (
        !recording ||
        !mediaRecorder
    ) {
        return;
    }


    recording = false;

    mediaRecorder.stop();


    window.dispatchEvent(
        new CustomEvent(
            "echocall:voice-recording-stopped"
        )
    );

}


/* ==========================================================
   CANCEL VOICE RECORDING
========================================================== */

export function cancelVoiceRecording() {

    if (mediaRecorder) {

        mediaRecorder.onstop =
            null;

        if (
            mediaRecorder.state !==
            "inactive"
        ) {

            mediaRecorder.stop();

        }

    }


    recording = false;

    recordedChunks = [];


    recordingStream
        ?.getTracks()
        .forEach(
            track =>
                track.stop()
        );


    recordingStream =
        null;

}


/* ==========================================================
   SEND VOICE MESSAGE
========================================================== */

async function sendVoiceMessage(
    file
) {

    if (!currentUser) {

        throw new Error(
            "You must be signed in."
        );

    }


    if (!activeConversationId) {

        throw new Error(
            "Open a conversation first."
        );

    }


    const storagePath =
        [
            STORAGE_ROOT,
            currentUser.uid,
            activeConversationId,
            `voice_${Date.now()}.webm`
        ].join("/");


    const storageRef =
        ref(
            storage,
            storagePath
        );


    const uploadResult =
        await uploadBytes(
            storageRef,
            file,
            {
                contentType:
                    file.type ||
                    "audio/webm"
            }
        );


    const downloadURL =
        await getDownloadURL(
            uploadResult.ref
        );


    const messageRef =
        await addDoc(
            collection(
                db,
                CONVERSATIONS_COLLECTION,
                activeConversationId,
                MESSAGES_SUBCOLLECTION
            ),
            {
                senderId:
                    currentUser.uid,

                senderName:
                    currentUser.displayName ||
                    currentUser.email ||
                    "EchoCall User",

                type:
                    "voice",

                text:
                    "",

                fileURL:
                    downloadURL,

                storagePath,

                fileName:
                    file.name,

                fileSize:
                    file.size,

                mimeType:
                    file.type,

                createdAt:
                    serverTimestamp(),

                editedAt:
                    null,

                deletedForEveryone:
                    false,

                deletedFor:
                    [],

                delivered:
                    true,

                readBy:
                    [currentUser.uid],

                replyTo:
                    replyingTo ||
                    null,

                viewOnce:
                    false,

                viewedBy:
                    [],

                starredBy:
                    [],

                pinned:
                    false,

                reactions:
                    {}
            }
        );


    await updateConversationPreview(
        "",
        "voice"
    );


    return messageRef.id;

}


/* ==========================================================
   EDIT MESSAGE
========================================================== */

export async function editMessage(
    messageId,
    newText
) {

    if (
        !currentUser ||
        !activeConversationId ||
        !messageId
    ) {
        return;
    }


    const text =
        String(newText || "")
            .trim();


    if (!text) {

        showError(
            "Message cannot be empty."
        );

        return;

    }


    const messageRef =
        doc(
            db,
            CONVERSATIONS_COLLECTION,
            activeConversationId,
            MESSAGES_SUBCOLLECTION,
            messageId
        );


    const snapshot =
        await getDoc(
            messageRef
        );


    if (!snapshot.exists()) {
        return;
    }


    const message =
        snapshot.data();


    if (
        message.senderId !==
        currentUser.uid
    ) {

        showError(
            "You can only edit your own messages."
        );

        return;

    }


    await updateDoc(
        messageRef,
        {
            text,

            editedAt:
                serverTimestamp()
        }
    );


    editingMessageId =
        null;

    replyingTo =
        null;


    showToast(
        "Message edited."
    );

}


/* ==========================================================
   BEGIN EDIT
========================================================== */

function beginEditMessage(
    message
) {

    if (
        message.senderId !==
        currentUser?.uid
    ) {
        return;
    }


    editingMessageId =
        message.id;


    const input =
        getElement(
            "messageInput"
        );


    if (input) {

        input.value =
            message.text || "";

        input.focus();

    }


    showToast(
        "Editing message."
    );

}


/* ==========================================================
   DELETE MESSAGE
========================================================== */

export async function deleteMessage(
    messageId,
    forEveryone = false
) {

    if (
        !currentUser ||
        !activeConversationId
    ) {
        return;
    }


    const messageRef =
        doc(
            db,
            CONVERSATIONS_COLLECTION,
            activeConversationId,
            MESSAGES_SUBCOLLECTION,
            messageId
        );


    const snapshot =
        await getDoc(
            messageRef
        );


    if (!snapshot.exists()) {
        return;
    }


    const message =
        snapshot.data();


    if (
        forEveryone &&
        message.senderId ===
        currentUser.uid
    ) {

        await updateDoc(
            messageRef,
            {
                deletedForEveryone:
                    true,

                text:
                    "",

                deletedAt:
                    serverTimestamp()
            }
        );


        /*
           Keep Storage cleanup separate.
           The message remains in Firestore as
           a deleted-message record.
        */


        showToast(
            "Message deleted for everyone."
        );


        return;

    }


    await updateDoc(
        messageRef,
        {
            deletedFor:
                arrayUnion(
                    currentUser.uid
                )
        }
    );


    showToast(
        "Message deleted for you."
    );

}


/* ==========================================================
   COPY MESSAGE
========================================================== */

async function copyMessage(
    message
) {

    if (
        !message.text
    ) {

        showToast(
            "There is no text to copy."
        );

        return;

    }


    try {

        await navigator.clipboard.writeText(
            message.text
        );

        showToast(
            "Message copied."
        );

    } catch (error) {

        console.warn(
            error
        );

        showError(
            "Could not copy message."
        );

    }

}


/* ==========================================================
   REPLY
========================================================== */

function setReplyMessage(
    message
) {

    replyingTo = {
        messageId:
            message.id,

        senderId:
            message.senderId,

        text:
            message.text ||
            `[${message.type}]`
    };


    const input =
        getElement(
            "messageInput"
        );


    if (input) {
        input.focus();
    }


    showToast(
        "Replying to message."
    );

}


/* ==========================================================
   STAR
========================================================== */

async function toggleStarMessage(
    messageId
) {

    if (
        !currentUser ||
        !activeConversationId
    ) {
        return;
    }


    const messageRef =
        doc(
            db,
            CONVERSATIONS_COLLECTION,
            activeConversationId,
            MESSAGES_SUBCOLLECTION,
            messageId
        );


    const snapshot =
        await getDoc(
            messageRef
        );


    if (!snapshot.exists()) {
        return;
    }


    const message =
        snapshot.data();


    const starred =
        Array.isArray(
            message.starredBy
        ) &&
        message.starredBy.includes(
            currentUser.uid
        );


    await updateDoc(
        messageRef,
        {
            starredBy:
                starred
                    ?
                    arrayRemove(
                        currentUser.uid
                    )
                    :
                    arrayUnion(
                        currentUser.uid
                    )
        }
    );


    showToast(
        starred
            ? "Message unstarred."
            : "Message starred."
    );

}


/* ==========================================================
   SELECT MESSAGE
========================================================== */

function selectMessage(
    messageId
) {

    if (
        selectedMessages.has(
            messageId
        )
    ) {

        selectedMessages.delete(
            messageId
        );

    } else {

        selectedMessages.add(
            messageId
        );

    }


    window.dispatchEvent(
        new CustomEvent(
            "echocall:message-selection-changed",
            {
                detail: {
                    selectedIds:
                        [
                            ...selectedMessages
                        ]
                }
            }
        )
    );

}


/* ==========================================================
   SELECT ALL
========================================================== */

export async function selectAllMessages() {

    if (
        !activeConversationId
    ) {
        return;
    }


    const snapshot =
        await getDocs(
            collection(
                db,
                CONVERSATIONS_COLLECTION,
                activeConversationId,
                MESSAGES_SUBCOLLECTION
            )
        );


    selectedMessages =
        new Set(
            snapshot.docs.map(
                item =>
                    item.id
            )
        );


    window.dispatchEvent(
        new CustomEvent(
            "echocall:message-selection-changed",
            {
                detail: {
                    selectedIds:
                        [
                            ...selectedMessages
                        ]
                }
            }
        )
    );


    showToast(
        `${selectedMessages.size} messages selected.`
    );

}


/* ==========================================================
   CLEAR SELECTION
========================================================== */

export function clearMessageSelection() {

    selectedMessages.clear();

    window.dispatchEvent(
        new CustomEvent(
            "echocall:message-selection-changed",
            {
                detail: {
                    selectedIds: []
                }
            }
        )
    );

}
/* ==========================================================
   FORWARD MESSAGE
========================================================== */

export async function forwardMessage(
    message,
    targetConversationId
) {

    if (
        !currentUser ||
        !targetConversationId ||
        !message
    ) {
        return null;
    }


    const messageRef =
        await addDoc(
            collection(
                db,
                CONVERSATIONS_COLLECTION,
                targetConversationId,
                MESSAGES_SUBCOLLECTION
            ),
            {
                senderId:
                    currentUser.uid,

                senderName:
                    currentUser.displayName ||
                    currentUser.email ||
                    "EchoCall User",

                type:
                    message.type ||
                    "text",

                text:
                    message.text ||
                    "",

                fileURL:
                    message.fileURL ||
                    "",

                storagePath:
                    message.storagePath ||
                    "",

                fileName:
                    message.fileName ||
                    "",

                fileSize:
                    message.fileSize ||
                    0,

                mimeType:
                    message.mimeType ||
                    "",

                createdAt:
                    serverTimestamp(),

                editedAt:
                    null,

                deletedForEveryone:
                    false,

                deletedFor:
                    [],

                delivered:
                    true,

                readBy:
                    [
                        currentUser.uid
                    ],

                forwarded:
                    true,

                originalMessageId:
                    message.id || "",

                viewOnce:
                    false,

                starredBy:
                    [],

                pinned:
                    false,

                reactions:
                    {}
            }
        );


    showToast(
        "Message forwarded."
    );


    return messageRef.id;

}


/* ==========================================================
   REACT TO MESSAGE
========================================================== */

export async function reactToMessage(
    messageId,
    emoji
) {

    if (
        !currentUser ||
        !activeConversationId ||
        !messageId ||
        !emoji
    ) {
        return;
    }


    const messageRef =
        doc(
            db,
            CONVERSATIONS_COLLECTION,
            activeConversationId,
            MESSAGES_SUBCOLLECTION,
            messageId
        );


    const snapshot =
        await getDoc(
            messageRef
        );


    if (!snapshot.exists()) {
        return;
    }


    const message =
        snapshot.data();


    const reactions =
        {
            ...(message.reactions || {})
        };


    const users =
        Array.isArray(
            reactions[emoji]
        )
            ?
            [
                ...reactions[emoji]
            ]
            :
            [];


    const index =
        users.indexOf(
            currentUser.uid
        );


    if (index >= 0) {

        users.splice(
            index,
            1
        );

    } else {

        users.push(
            currentUser.uid
        );

    }


    reactions[emoji] =
        users;


    await updateDoc(
        messageRef,
        {
            reactions
        }
    );

}


/* ==========================================================
   PIN MESSAGE
========================================================== */

export async function pinMessage(
    messageId
) {

    if (
        !currentUser ||
        !activeConversationId
    ) {
        return;
    }


    const messageRef =
        doc(
            db,
            CONVERSATIONS_COLLECTION,
            activeConversationId,
            MESSAGES_SUBCOLLECTION,
            messageId
        );


    const snapshot =
        await getDoc(
            messageRef
        );


    if (!snapshot.exists()) {
        return;
    }


    const message =
        snapshot.data();


    await updateDoc(
        messageRef,
        {
            pinned:
                !Boolean(
                    message.pinned
                ),

            pinnedBy:
                currentUser.uid,

            pinnedAt:
                serverTimestamp()
        }
    );


    showToast(
        message.pinned
            ? "Message unpinned."
            : "Message pinned."
    );

}


/* ==========================================================
   DELETE SELECTED MESSAGES
========================================================== */

export async function deleteSelectedMessages(
    forEveryone = false
) {

    const ids =
        [
            ...selectedMessages
        ];


    if (!ids.length) {

        showToast(
            "No messages selected."
        );

        return;

    }


    for (
        const messageId
        of ids
    ) {

        try {

            await deleteMessage(
                messageId,
                forEveryone
            );

        } catch (error) {

            console.error(
                "[Messages] Delete failed:",
                error
            );

        }

    }


    clearMessageSelection();


    showToast(
        "Selected messages processed."
    );

}


/* ==========================================================
   VIEW-ONCE MEDIA
========================================================== */

export async function markViewOnceOpened(
    messageId
) {

    if (
        !currentUser ||
        !activeConversationId
    ) {
        return;
    }


    const messageRef =
        doc(
            db,
            CONVERSATIONS_COLLECTION,
            activeConversationId,
            MESSAGES_SUBCOLLECTION,
            messageId
        );


    const snapshot =
        await getDoc(
            messageRef
        );


    if (!snapshot.exists()) {
        return;
    }


    const message =
        snapshot.data();


    if (
        !message.viewOnce
    ) {
        return;
    }


    await updateDoc(
        messageRef,
        {
            viewedBy:
                arrayUnion(
                    currentUser.uid
                ),

            viewedAt:
                serverTimestamp()
        }
    );

}


/* ==========================================================
   SCHEDULE MESSAGE
========================================================== */

export async function scheduleMessage(
    text,
    date
) {

    if (!currentUser) {

        throw new Error(
            "You must be signed in."
        );

    }


    if (!activeConversationId) {

        throw new Error(
            "Open a conversation first."
        );

    }


    const scheduledDate =
        date instanceof Date
            ? date
            : new Date(date);


    if (
        Number.isNaN(
            scheduledDate.getTime()
        )
    ) {

        throw new Error(
            "Invalid scheduled time."
        );

    }


    if (
        scheduledDate <=
        new Date()
    ) {

        throw new Error(
            "Scheduled time must be in the future."
        );

    }


    const messageRef =
        await addDoc(
            collection(
                db,
                CONVERSATIONS_COLLECTION,
                activeConversationId,
                MESSAGES_SUBCOLLECTION
            ),
            {
                senderId:
                    currentUser.uid,

                senderName:
                    currentUser.displayName ||
                    currentUser.email ||
                    "EchoCall User",

                type:
                    "text",

                text:
                    String(text || "")
                        .trim(),

                createdAt:
                    serverTimestamp(),

                scheduled:
                    true,

                scheduledFor:
                    scheduledDate,

                delivered:
                    false,

                readBy:
                    [],

                deletedForEveryone:
                    false,

                deletedFor:
                    [],

                starredBy:
                    [],

                pinned:
                    false,

                reactions:
                    {}
            }
        );


    showToast(
        "Message scheduled."
    );


    return messageRef.id;

}


/* ==========================================================
   MESSAGE ACTIONS
========================================================== */

function setupMessageActions() {

    document.addEventListener(
        "click",
        (event) => {

            const action =
                event.target.closest(
                    "[data-message-action]"
                );


            if (!action) {
                return;
            }


            const type =
                action.dataset.messageAction;


            switch (type) {

                case "new-chat":

                    openNewMessageModal();

                    break;


                case "unread":

                    markAllUnread();

                    break;


                case "settings":

                    navigateTo(
                        "settings"
                    );

                    break;


                case "camera":

                    openCamera();

                    break;


                case "media":

                    chooseMedia();

                    break;


                case "file":

                    chooseDocument();

                    break;


                case "voice":

                    if (recording) {

                        stopVoiceRecording();

                    } else {

                        startVoiceRecording();

                    }

                    break;


                case "view-once":

                    viewOnceMode =
                        !viewOnceMode;

                    showToast(
                        viewOnceMode
                            ? "View-once mode enabled."
                            : "View-once mode disabled."
                    );

                    break;


                case "select-all":

                    selectAllMessages();

                    break;


                case "clear-selection":

                    clearMessageSelection();

                    break;

            }

        }
    );


    document.addEventListener(
        "click",
        (event) => {

            const menu =
                getElement(
                    "dynamicMessageMenu"
                );


            if (
                menu &&
                !menu.contains(
                    event.target
                )
            ) {

                removeMessageContextMenu();

            }

        }
    );

}


/* ==========================================================
   MARK ALL UNREAD
========================================================== */

async function markAllUnread() {

    if (!currentUser) {
        return;
    }


    for (
        const conversation
        of conversations
    ) {

        try {

            await updateDoc(
                doc(
                    db,
                    CONVERSATIONS_COLLECTION,
                    conversation.id
                ),
                {
                    [`unreadCount.${currentUser.uid}`]:
                        1
                }
            );

        } catch (error) {

            console.warn(
                "[Messages] Mark unread failed:",
                error
            );

        }

    }


    showToast(
        "Conversations marked unread."
    );

}


/* ==========================================================
   MORE MENU
========================================================== */

function toggleMoreMenu() {

    const menu =
        getElement(
            "messagesMoreMenu"
        );

    const button =
        getElement(
            "messagesMoreButton"
        );


    if (!menu) {
        return;
    }


    const active =
        menu.classList.toggle(
            "active"
        );


    menu.setAttribute(
        "aria-hidden",
        String(!active)
    );


    button?.setAttribute(
        "aria-expanded",
        String(active)
    );

}


/* ==========================================================
   BOTTOM NAVIGATION
========================================================== */

function setupBottomNavigation() {

    getElements(
        "#messagesBottomNav [data-route]"
    ).forEach(
        (button) => {

            button.addEventListener(
                "click",
                () => {

                    const route =
                        button.dataset.route;

                    if (route) {
                        navigateTo(
                            route
                        );
                    }

                }
            );

        }
    );

}


/* ==========================================================
   KEYBOARD SHORTCUTS
========================================================== */

function setupKeyboardShortcuts() {

    document.addEventListener(
        "keydown",
        (event) => {

            if (
                event.key === "Escape"
            ) {

                removeMessageContextMenu();

                closeNewMessageModal();

                const search =
                    getElement(
                        "messagesSearchPanel"
                    );

                search?.classList.remove(
                    "active"
                );

            }


            if (
                event.key === "/" &&
                !isTypingTarget(
                    event.target
                )
            ) {

                event.preventDefault();

                toggleSearch();

            }

        }
    );

}


/* ==========================================================
   NAVIGATION
========================================================== */

function navigateTo(
    route
) {

    if (!route) {
        return;
    }


    const router =
        window.EchoCallRouter;


    if (
        router &&
        typeof router.navigate ===
        "function"
    ) {

        router.navigate(
            route
        );

        return;

    }


    const routes = {

        home:
            "home.html",

        call:
            "call.html",

        contacts:
            "contacts.html",

        "voice-call":
            "voice-call.html",

        "video-call":
            "video-call.html",

        "ai-voice-call":
            "ai-voice-call.html",

        "ai-video-call":
            "ai-video-call.html",

        "call-history":
            "call-history.html",

        profile:
            "profile.html",

        settings:
            "settings.html"

    };


    if (
        routes[route]
    ) {

        window.location.href =
            routes[route];

        return;

    }


    console.warn(
        "[Messages] Unknown route:",
        route
    );

}


/* ==========================================================
   HELPERS
========================================================== */

function createDirectConversationId(
    firstUid,
    secondUid
) {

    return [
        firstUid,
        secondUid
    ]
        .sort()
        .join("_");

}


function timestampValue(
    timestamp
) {

    if (!timestamp) {
        return 0;
    }


    if (
        typeof timestamp.toMillis ===
        "function"
    ) {

        return timestamp.toMillis();

    }


    if (
        timestamp instanceof Date
    ) {

        return timestamp.getTime();

    }


    if (
        typeof timestamp.seconds ===
        "number"
    ) {

        return (
            timestamp.seconds * 1000
        );

    }


    return 0;

}


function formatTime(
    timestamp
) {

    const value =
        timestampValue(
            timestamp
        );


    if (!value) {
        return "";
    }


    const date =
        new Date(
            value
        );


    const now =
        new Date();


    const sameDay =
        date.toDateString() ===
        now.toDateString();


    if (sameDay) {

        return date.toLocaleTimeString(
            [],
            {
                hour:
                    "numeric",
                minute:
                    "2-digit"
            }
        );

    }


    return date.toLocaleDateString(
        [],
        {
            day:
                "numeric",
            month:
                "short"
        }
    );

}


function formatBytes(
    bytes
) {

    const value =
        Number(bytes || 0);


    if (!value) {
        return "0 B";
    }


    const units =
        [
            "B",
            "KB",
            "MB",
            "GB"
        ];


    const index =
        Math.floor(
            Math.log(
                value
            ) /
            Math.log(1024)
        );


    return (
        value /
        Math.pow(
            1024,
            index
        )
    ).toFixed(
        index === 0
            ? 0
            : 1
    ) +
    " " +
    (
        units[index] ||
        "GB"
    );

}


function sanitizeFileName(
    name
) {

    return String(
        name ||
        "file"
    )
        .replace(
            /[^a-zA-Z0-9._-]/g,
            "_"
        );

}


function escapeHTML(
    value
) {

    const element =
        document.createElement(
            "div"
        );

    element.textContent =
        String(
            value ?? ""
        );

    return element.innerHTML;

}


function isTypingTarget(
    element
) {

    if (!element) {
        return false;
    }


    const tag =
        element.tagName?.toLowerCase();


    return (
        tag === "input" ||
        tag === "textarea" ||
        tag === "select" ||
        element.isContentEditable
    );

}


/* ==========================================================
   UI MESSAGES
========================================================== */

function showToast(
    message
) {

    const toast =
        getElement(
            "messagesToast"
        );


    if (!toast) {
        return;
    }


    toast.textContent =
        String(
            message || ""
        );


    toast.classList.add(
        "show"
    );


    clearTimeout(
        showToast.timeout
    );


    showToast.timeout =
        setTimeout(
            () => {

                toast.classList.remove(
                    "show"
                );

            },
            3000
        );

}


function showError(
    message
) {

    const error =
        getElement(
            "messagesError"
        );


    if (!error) {
        return;
    }


    error.textContent =
        String(
            message ||
            "Something went wrong."
        );


    error.classList.add(
        "show"
    );


    clearTimeout(
        showError.timeout
    );


    showError.timeout =
        setTimeout(
            () => {

                error.classList.remove(
                    "show"
                );

            },
            5000
        );

}


/* ==========================================================
   PUBLIC API
========================================================== */

window.EchoCallMessages = {

    initializeMessages,

    sendTextMessage,

    sendFileMessage,

    startVoiceRecording,

    stopVoiceRecording,

    cancelVoiceRecording,

    openCamera,

    chooseMedia,

    chooseDocument,

    listenToMessages,

    renderMessage,

    editMessage,

    deleteMessage,

    selectAllMessages,

    clearMessageSelection,

    deleteSelectedMessages,

    forwardMessage,

    reactToMessage,

    pinMessage,

    markViewOnceOpened,

    scheduleMessage,

    startConversationWithUser,

    getActiveConversation:
        () =>
            activeConversation,

    getActiveConversationId:
        () =>
            activeConversationId,

    isRecording:
        () =>
            recording

};


/* ==========================================================
   AUTO INITIALIZATION
========================================================== */

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        () => {

            if (
                !messageInitialized
            ) {

                initializeMessages();

            }

        },
        {
            once: true
        }
    );

} else {

    initializeMessages();

}


/* ==========================================================
   CLEANUP
========================================================== */

window.addEventListener(
    "beforeunload",
    () => {

        if (
            typeof authUnsubscribe ===
            "function"
        ) {

            authUnsubscribe();

        }


        if (
            typeof conversationUnsubscribe ===
            "function"
        ) {

            conversationUnsubscribe();

        }


        if (
            typeof messageUnsubscribe ===
            "function"
        ) {

            messageUnsubscribe();

        }


        if (recordingStream) {

            recordingStream
                .getTracks()
                .forEach(
                    track =>
                        track.stop()
                );

        }

    }
);

/* ==========================================
   FILE INPUT INITIALIZATION
========================================== */

function initializeMessageFileInputs() {

    const imageInput =
        document.getElementById("messageImageInput");

    const mediaInput =
        document.getElementById("messageMediaInput");

    const fileInput =
        document.getElementById("messageFileInput");

    const cameraInput =
        document.getElementById("messageCameraInput");

    const imageButton =
        document.getElementById("messageImageButton");

    const mediaButton =
        document.getElementById("messageMediaButton");

    const fileButton =
        document.getElementById("messageFileButton");

    const cameraButton =
        document.getElementById("messageCameraButton");


    /* ==========================================
       IMAGE BUTTON
    ========================================== */

    imageButton?.addEventListener(
        "click",
        () => {

            if (!activeConversationId) {
                showToast(
                    "Open a conversation first."
                );

                return;
            }

            imageInput?.click();
        }
    );


    /* ==========================================
       PHOTO + VIDEO BUTTON
    ========================================== */

    mediaButton?.addEventListener(
        "click",
        () => {

            if (!activeConversationId) {
                showToast(
                    "Open a conversation first."
                );

                return;
            }

            mediaInput?.click();
        }
    );


    /* ==========================================
       FILE BUTTON
    ========================================== */

    fileButton?.addEventListener(
        "click",
        () => {

            if (!activeConversationId) {
                showToast(
                    "Open a conversation first."
                );

                return;
            }

            fileInput?.click();
        }
    );


    /* ==========================================
       CAMERA BUTTON
    ========================================== */

    cameraButton?.addEventListener(
        "click",
        () => {

            if (!activeConversationId) {
                showToast(
                    "Open a conversation first."
                );

                return;
            }

            cameraInput?.click();
        }
    );


    /* ==========================================
       IMAGE SELECTED
    ========================================== */

    imageInput?.addEventListener(
        "change",
        async (event) => {

            const file =
                event.target.files?.[0];

            if (!file) return;

            await handleSelectedMessageFile(
                file
            );

            event.target.value = "";
        }
    );


    /* ==========================================
       PHOTO / VIDEO SELECTED
    ========================================== */

    mediaInput?.addEventListener(
        "change",
        async (event) => {

            const file =
                event.target.files?.[0];

            if (!file) return;

            await handleSelectedMessageFile(
                file
            );

            event.target.value = "";
        }
    );


    /* ==========================================
       FILE SELECTED
    ========================================== */

    fileInput?.addEventListener(
        "change",
        async (event) => {

            const file =
                event.target.files?.[0];

            if (!file) return;

            await handleSelectedMessageFile(
                file
            );

            event.target.value = "";
        }
    );


    /* ==========================================
       CAMERA CAPTURED
    ========================================== */

    cameraInput?.addEventListener(
        "change",
        async (event) => {

            const file =
                event.target.files?.[0];

            if (!file) return;

            await handleSelectedMessageFile(
                file
            );

            event.target.value = "";
        }
    );
}

/* ==========================================
   HANDLE SELECTED MESSAGE FILE
========================================== */

async function handleSelectedMessageFile(file) {

    if (!currentUser) {
        showToast(
            "Please sign in first."
        );

        return;
    }

    if (!activeConversationId) {
        showToast(
            "Open a conversation first."
        );

        return;
    }


    /* ==========================================
       SIZE CHECK
    ========================================== */

    if (file.size > MAX_FILE_SIZE) {

        showToast(
            "File is too large. Maximum size is 100 MB."
        );

        return;
    }


    /* ==========================================
       DETERMINE TYPE
    ========================================== */

    let type = "file";

    if (
        file.type &&
        file.type.startsWith("image/")
    ) {
        type = "image";
    }

    else if (
        file.type &&
        file.type.startsWith("video/")
    ) {
        type = "video";
    }


    try {

        showToast(
            `Uploading ${file.name}...`
        );


        await sendFileMessage(
            file,
            {
                type,
                viewOnce: false
            }
        );


        showToast(
            "File sent."
        );

    }

    catch (error) {

        console.error(
            "[Messages] File upload error:",
            error
        );

        showError(
            "Unable to upload the file."
        );
    }
}
/* ==========================================================
   FINAL LOG
========================================================== */

console.log(
    "[Messages] messages.js loaded."
);


/* ==========================================================
   END OF messages.js
========================================================== */