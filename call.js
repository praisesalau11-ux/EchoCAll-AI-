/* ==========================================================
   EchoCall AI
   File: js/call.js

   Communication Hub Controller
   Part 1/3

   Handles:
   - Communication Hub initialization
   - Firebase authentication
   - Navigation configuration
   - DOM helpers
   - Header
   - Back button
   - Section navigation
   - Hero actions
   - Quick actions
   - Feature rows
========================================================== */


/* ==========================================================
   FIREBASE
========================================================== */

import { auth } from "./firebase.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";


/* ==========================================================
   COMMUNICATION PAGE ROUTES
========================================================== */

const COMMUNICATION_PAGES = {

    messages:
        "messages.html",

    "voice-call":
        "voice-call.html",

    "ai-voice-call":
        "ai-voice-call.html",

    "video-call":
        "video-call.html",

    "ai-video-call":
        "ai-video-call.html",

    groups:
        "groups.html",

    communities:
        "communities.html",

    channels:
        "channels.html",

    status:
        "status.html",

    contacts:
        "contacts.html",

    "call-history":
        "call-history.html"
};


/* ==========================================================
   SEARCHABLE COMMUNICATION FEATURES
========================================================== */

const SEARCH_ITEMS = [

    {
        name: "Messages",
        description:
            "Send and receive messages",
        route: "messages",
        icon: "chat"
    },

    {
        name: "Voice Calls",
        description:
            "Make voice calls",
        route: "voice-call",
        icon: "call"
    },

    {
        name: "AI Voice Calls",
        description:
            "Use AI during voice calls",
        route: "ai-voice-call",
        icon: "smart_toy"
    },

    {
        name: "Video Calls",
        description:
            "Start video calls",
        route: "video-call",
        icon: "videocam"
    },

    {
        name: "AI Video Calls",
        description:
            "Use AI during video calls",
        route: "ai-video-call",
        icon: "video_chat"
    },

    {
        name: "Groups",
        description:
            "Communicate with groups",
        route: "groups",
        icon: "groups"
    },

    {
        name: "Communities",
        description:
            "Manage your communities",
        route: "communities",
        icon: "hub"
    },

    {
        name: "Channels",
        description:
            "Follow communication channels",
        route: "channels",
        icon: "campaign"
    },

    {
        name: "Status",
        description:
            "Share temporary updates",
        route: "status",
        icon: "update"
    },

    {
        name: "Contacts",
        description:
            "Manage your saved contacts",
        route: "contacts",
        icon: "contacts"
    },

    {
        name: "Call History",
        description:
            "View previous calls",
        route: "call-history",
        icon: "history"
    }
];


/* ==========================================================
   STATE
========================================================== */

let currentUser = null;

let communicationInitialized = false;

let searchOpen = false;

let moreMenuOpen = false;

let authUnsubscribe = null;


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
   MAIN ROUTER INITIALIZER
========================================================== */

/*
   IMPORTANT:

   Your EchoCall router expects:

   initializeCalls()
*/

export function initializeCalls() {

    if (communicationInitialized) {
        return;
    }

    communicationInitialized = true;


    setupAuth();

    setupHeader();

    setupSectionNavigation();

    setupHeroActions();

    setupQuickActions();

    setupFeatureRows();

    setupContactPreview();

    setupRecentConversations();

    setupSearch();

    setupMoreMenu();

    setupBottomNavigation();

    setupKeyboardShortcuts();

    setInitialActiveSection();

    loadCommunicationPreview();


    console.log(
        "[Communication Hub] Initialized successfully."
    );
}


/* ==========================================================
   FIREBASE AUTHENTICATION
========================================================== */

function setupAuth() {

    if (!auth) {

        console.warn(
            "[Communication Hub] Firebase Auth is unavailable."
        );

        return;
    }


    authUnsubscribe =
        onAuthStateChanged(
            auth,
            (user) => {

                currentUser =
                    user || null;

                handleAuthState(user);
            }
        );
}


/* ==========================================================
   AUTH STATE
========================================================== */

function handleAuthState(user) {

    const hub =
        getElement(
            "communicationHub"
        );


    if (!hub) {
        return;
    }


    if (user) {

        hub.dataset.authenticated =
            "true";

        hub.dataset.userId =
            user.uid;

        updateAuthenticatedUI(
            user
        );


        console.log(
            "[Communication Hub] User authenticated."
        );

    } else {

        hub.dataset.authenticated =
            "false";

        delete hub.dataset.userId;


        console.log(
            "[Communication Hub] No authenticated user."
        );
    }
}


/* ==========================================================
   AUTHENTICATED USER UI
========================================================== */

function updateAuthenticatedUI(user) {

    const userName =
        user.displayName ||
        user.email ||
        "EchoCall User";


    const userEmail =
        user.email || "";


    /*
       Elements can optionally use:

       data-current-user-name
    */

    const userElements =
        document.querySelectorAll(
            "[data-current-user-name]"
        );


    userElements.forEach(
        (element) => {

            element.textContent =
                userName;
        }
    );


    /*
       Optional email elements.
    */

    const emailElements =
        document.querySelectorAll(
            "[data-current-user-email]"
        );


    emailElements.forEach(
        (element) => {

            element.textContent =
                userEmail;
        }
    );


    /*
       Optional profile images.
    */

    const photoElements =
        document.querySelectorAll(
            "[data-current-user-photo]"
        );


    photoElements.forEach(
        (element) => {

            if (user.photoURL) {

                element.src =
                    user.photoURL;

                element.style.display =
                    "block";

            } else {

                element.removeAttribute(
                    "src"
                );
            }
        }
    );
}


/* ==========================================================
   HEADER
========================================================== */

function setupHeader() {

    const backButton =
        getElement(
            "callBackButton"
        );


    if (backButton) {

        backButton.addEventListener(
            "click",
            handleBackButton
        );
    }


    const searchButton =
        getElement(
            "openCallSearch"
        );


    if (searchButton) {

        searchButton.addEventListener(
            "click",
            openSearch
        );
    }


    const moreButton =
        getElement(
            "callMoreButton"
        );


    if (moreButton) {

        moreButton.addEventListener(
            "click",
            toggleMoreMenu
        );
    }
}


/* ==========================================================
   BACK BUTTON
========================================================== */

function handleBackButton() {

    /*
       Go back when browser history
       is available.
    */

    if (window.history.length > 1) {

        window.history.back();

        return;
    }


    /*
       Otherwise return to Home.
    */

    navigateTo(
        "home"
    );
}


/* ==========================================================
   SECTION NAVIGATION
========================================================== */

function setupSectionNavigation() {

    const buttons =
        getElements(
            ".communication-section-nav [data-route]"
        );


    buttons.forEach(
        (button) => {

            button.addEventListener(
                "click",
                () => {

                    const route =
                        button.dataset.route;


                    if (!route) {
                        return;
                    }


                    navigateTo(
                        route
                    );
                }
            );
        }
    );
}


/* ==========================================================
   HERO ACTIONS
========================================================== */

function setupHeroActions() {

    const actions =
        getElements(
            "#communicationHub [data-route]"
        );


    actions.forEach(
        (element) => {

            /*
               Section navigation handles
               its own buttons.
            */

            if (
                element.closest(
                    ".communication-section-nav"
                )
            ) {

                return;
            }


            /*
               Bottom navigation handles
               its own buttons.
            */

            if (
                element.closest(
                    ".bottom-nav"
                )
            ) {

                return;
            }


            /*
               More menu handles
               its own items.
            */

            if (
                element.closest(
                    ".more-menu"
                )
            ) {

                return;
            }


            element.addEventListener(
                "click",
                () => {

                    const route =
                        element.dataset.route;


                    if (!route) {
                        return;
                    }


                    navigateTo(
                        route
                    );
                }
            );
        }
    );
}


/* ==========================================================
   QUICK ACTION CARDS
========================================================== */

function setupQuickActions() {

    const cards =
        getElements(
            ".quick-action-card[data-route]"
        );


    cards.forEach(
        (card) => {

            card.setAttribute(
                "role",
                "button"
            );


            card.setAttribute(
                "tabindex",
                "0"
            );


            card.addEventListener(
                "click",
                () => {

                    const route =
                        card.dataset.route;


                    if (!route) {
                        return;
                    }


                    navigateTo(
                        route
                    );
                }
            );


            card.addEventListener(
                "keydown",
                (event) => {

                    if (
                        event.key === "Enter" ||
                        event.key === " "
                    ) {

                        event.preventDefault();


                        const route =
                            card.dataset.route;


                        if (!route) {
                            return;
                        }


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
   FEATURE ROWS
========================================================== */

function setupFeatureRows() {

    const rows =
        getElements(
            ".feature-row[data-route]"
        );


    rows.forEach(
        (row) => {

            row.setAttribute(
                "role",
                "button"
            );


            row.setAttribute(
                "tabindex",
                "0"
            );


            row.addEventListener(
                "click",
                () => {

                    const route =
                        row.dataset.route;


                    if (!route) {
                        return;
                    }


                    navigateTo(
                        route
                    );
                }
            );


            row.addEventListener(
                "keydown",
                (event) => {

                    if (
                        event.key === "Enter" ||
                        event.key === " "
                    ) {

                        event.preventDefault();


                        const route =
                            row.dataset.route;


                        if (!route) {
                            return;
                        }


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
   CONTACT PREVIEW HOOK
========================================================== */

function setupContactPreview() {

    const list =
        getElement(
            "contactPreviewList"
        );


    if (!list) {
        return;
    }


    /*
       contacts.js will eventually handle
       the actual contact database.

       call.js only prepares the preview.
    */

    list.dataset.initialized =
        "true";
}


/* ==========================================================
   RECENT CONVERSATIONS HOOK
========================================================== */

function setupRecentConversations() {

    const list =
        getElement(
            "recentConversations"
        );


    if (!list) {
        return;
    }


    /*
       messages.js will handle the
       actual conversation data.
    */

    list.dataset.initialized =
        "true";
}
/* ==========================================================
   COMMUNICATION HUB
   File: js/call.js

   Part 2/3

   Continues from:
   setupRecentConversations()
========================================================== */


/* ==========================================================
   PREVIEW LOADING
========================================================== */

function loadCommunicationPreview() {

    /*
       The Communication Hub does not own the actual
       contacts or message database.

       contacts.js and messages.js will handle that data.

       This file only controls the loading/empty UI.
    */

    hidePreviewLoading(
        "contactsPreviewLoading"
    );


    hidePreviewLoading(
        "recentConversationsLoading"
    );


    showEmptyPreviewIfNeeded(
        "contactPreviewList",
        "contactsPreviewLoading",
        null
    );


    showEmptyPreviewIfNeeded(
        "recentConversations",
        "recentConversationsLoading",
        "recentConversationsEmpty"
    );
}


/* ==========================================================
   HIDE PREVIEW LOADING
========================================================== */

function hidePreviewLoading(id) {

    const element =
        getElement(id);


    if (!element) {
        return;
    }


    element.style.display =
        "none";
}


/* ==========================================================
   SHOW PREVIEW LOADING
========================================================== */

function showPreviewLoading(id) {

    const element =
        getElement(id);


    if (!element) {
        return;
    }


    element.style.display =
        "";
}


/* ==========================================================
   EMPTY PREVIEW CHECK
========================================================== */

function showEmptyPreviewIfNeeded(
    contentId,
    loadingId,
    emptyId
) {

    const content =
        getElement(contentId);


    if (!content) {
        return;
    }


    const hasContent =
        content.children.length > 0;


    if (
        emptyId &&
        !hasContent
    ) {

        const empty =
            getElement(emptyId);


        if (empty) {

            empty.style.display =
                "";
        }
    }
}


/* ==========================================================
   SEARCH SYSTEM
========================================================== */

function setupSearch() {

    const input =
        getElement(
            "callSearchInput"
        );


    const closeButton =
        getElement(
            "closeCallSearch"
        );


    if (input) {

        input.addEventListener(
            "input",
            () => {

                performSearch(
                    input.value
                );
            }
        );


        input.addEventListener(
            "keydown",
            (event) => {

                if (
                    event.key === "Escape"
                ) {

                    closeSearch();

                    return;
                }


                if (
                    event.key === "Enter"
                ) {

                    handleSearchEnter(
                        input.value
                    );
                }
            }
        );
    }


    if (closeButton) {

        closeButton.addEventListener(
            "click",
            closeSearch
        );
    }
}


/* ==========================================================
   OPEN SEARCH
========================================================== */

function openSearch() {

    const panel =
        getElement(
            "callSearchPanel"
        );


    const input =
        getElement(
            "callSearchInput"
        );


    if (!panel) {
        return;
    }


    searchOpen = true;


    panel.classList.add(
        "active"
    );


    panel.setAttribute(
        "aria-hidden",
        "false"
    );


    if (input) {

        setTimeout(
            () => {

                input.focus();

            },
            50
        );
    }
}


/* ==========================================================
   CLOSE SEARCH
========================================================== */

function closeSearch() {

    const panel =
        getElement(
            "callSearchPanel"
        );


    const input =
        getElement(
            "callSearchInput"
        );


    searchOpen = false;


    if (panel) {

        panel.classList.remove(
            "active"
        );


        panel.setAttribute(
            "aria-hidden",
            "true"
        );
    }


    if (input) {

        input.value = "";

        performSearch("");
    }
}


/* ==========================================================
   SEARCH FEATURES
========================================================== */

function performSearch(query) {

    const normalizedQuery =
        String(query || "")
            .trim()
            .toLowerCase();


    /*
       The current call.html may not yet contain
       #callSearchResults.

       If it does not, the search still works
       through Enter-key navigation.
    */

    const results =
        getElement(
            "callSearchResults"
        );


    if (!results) {
        return;
    }


    results.innerHTML = "";


    if (!normalizedQuery) {

        results.style.display =
            "none";

        return;
    }


    const matches =
        SEARCH_ITEMS.filter(
            (item) => {

                return (
                    item.name
                        .toLowerCase()
                        .includes(
                            normalizedQuery
                        ) ||

                    item.description
                        .toLowerCase()
                        .includes(
                            normalizedQuery
                        )
                );
            }
        );


    if (matches.length === 0) {

        results.style.display =
            "";


        results.innerHTML = `
            <div class="search-empty-state">

                <span class="material-symbols-rounded">
                    search_off
                </span>

                <span>
                    No communication features found
                </span>

            </div>
        `;


        return;
    }


    results.style.display =
        "";


    matches.forEach(
        (item) => {

            const result =
                document.createElement(
                    "button"
                );


            result.type =
                "button";


            result.className =
                "call-search-result";


            result.innerHTML = `
                <span class="material-symbols-rounded">
                    ${escapeHTML(item.icon)}
                </span>

                <span class="call-search-result-content">

                    <strong>
                        ${escapeHTML(item.name)}
                    </strong>

                    <small>
                        ${escapeHTML(
                            item.description
                        )}
                    </small>

                </span>
            `;


            result.addEventListener(
                "click",
                () => {

                    closeSearch();


                    navigateTo(
                        item.route
                    );
                }
            );


            results.appendChild(
                result
            );
        }
    );
}


/* ==========================================================
   SEARCH ENTER
========================================================== */

function handleSearchEnter(query) {

    const normalizedQuery =
        String(query || "")
            .trim()
            .toLowerCase();


    if (!normalizedQuery) {
        return;
    }


    /*
       First try an exact match.
    */

    const exactMatch =
        SEARCH_ITEMS.find(
            (item) => {

                return (
                    item.name
                        .toLowerCase() ===
                    normalizedQuery
                );
            }
        );


    if (exactMatch) {

        closeSearch();


        navigateTo(
            exactMatch.route
        );


        return;
    }


    /*
       Then try a partial match.
    */

    const partialMatch =
        SEARCH_ITEMS.find(
            (item) => {

                return (
                    item.name
                        .toLowerCase()
                        .includes(
                            normalizedQuery
                        )
                );
            }
        );


    if (partialMatch) {

        closeSearch();


        navigateTo(
            partialMatch.route
        );


        return;
    }


    showToast(
        "No matching communication feature found."
    );
}


/* ==========================================================
   MORE MENU
========================================================== */

function setupMoreMenu() {

    const menu =
        document.querySelector(
            "#callMoreMenu, .more-menu"
        );


    if (!menu) {
        return;
    }


    const routeItems =
        menu.querySelectorAll(
            "[data-route]"
        );


    routeItems.forEach(
        (item) => {

            item.addEventListener(
                "click",
                () => {

                    const route =
                        item.dataset.route;


                    closeMoreMenu();


                    if (route) {

                        navigateTo(
                            route
                        );
                    }
                }
            );
        }
    );


    /*
       Close the menu when the user
       clicks outside it.
    */

    document.addEventListener(
        "click",
        (event) => {

            if (!moreMenuOpen) {
                return;
            }


            const clickedInsideMenu =
                menu.contains(
                    event.target
                );


            const moreButton =
                getElement(
                    "callMoreButton"
                );


            const clickedMoreButton =
                moreButton &&
                moreButton.contains(
                    event.target
                );


            if (
                !clickedInsideMenu &&
                !clickedMoreButton
            ) {

                closeMoreMenu();
            }
        }
    );
}


/* ==========================================================
   TOGGLE MORE MENU
========================================================== */

function toggleMoreMenu(event) {

    if (event) {

        event.stopPropagation();
    }


    const menu =
        document.querySelector(
            "#callMoreMenu, .more-menu"
        );


    if (!menu) {

        showToast(
            "More options are not available."
        );


        return;
    }


    if (moreMenuOpen) {

        closeMoreMenu();

    } else {

        openMoreMenu();
    }
}


/* ==========================================================
   OPEN MORE MENU
========================================================== */

function openMoreMenu() {

    const menu =
        document.querySelector(
            "#callMoreMenu, .more-menu"
        );


    if (!menu) {
        return;
    }


    moreMenuOpen = true;


    menu.classList.add(
        "active"
    );


    menu.setAttribute(
        "aria-hidden",
        "false"
    );
}


/* ==========================================================
   CLOSE MORE MENU
========================================================== */

function closeMoreMenu() {

    const menu =
        document.querySelector(
            "#callMoreMenu, .more-menu"
        );


    if (!menu) {
        return;
    }


    moreMenuOpen = false;


    menu.classList.remove(
        "active"
    );


    menu.setAttribute(
        "aria-hidden",
        "true"
    );
}


/* ==========================================================
   BOTTOM NAVIGATION
========================================================== */

function setupBottomNavigation() {

    const items =
        getElements(
            ".bottom-nav [data-route]"
        );


    items.forEach(
        (item) => {

            item.addEventListener(
                "click",
                () => {

                    const route =
                        item.dataset.route;


                    if (!route) {
                        return;
                    }


                    navigateTo(
                        route
                    );
                }
            );
        }
    );
}


/* ==========================================================
   ACTIVE SECTION
========================================================== */

function setInitialActiveSection() {

    const currentPath =
        window.location.pathname
            .toLowerCase();


    let activeRoute = "";


    for (
        const [route, page]
        of Object.entries(
            COMMUNICATION_PAGES
        )
    ) {

        if (
            currentPath.endsWith(
                page
            )
        ) {

            activeRoute =
                route;

            break;
        }
    }


    if (activeRoute) {

        setActiveNavigation(
            activeRoute
        );
    }
}


/* ==========================================================
   ACTIVE NAVIGATION
========================================================== */

function setActiveNavigation(route) {

    const sectionItems =
        getElements(
            ".communication-section-nav [data-route]"
        );


    sectionItems.forEach(
        (item) => {

            const isActive =
                item.dataset.route ===
                route;


            item.classList.toggle(
                "active",
                isActive
            );


            if (isActive) {

                item.setAttribute(
                    "aria-current",
                    "page"
                );

            } else {

                item.removeAttribute(
                    "aria-current"
                );
            }
        }
    );


    const bottomItems =
        getElements(
            ".bottom-nav [data-route]"
        );


    bottomItems.forEach(
        (item) => {

            const isActive =
                item.dataset.route ===
                route;


            item.classList.toggle(
                "active",
                isActive
            );


            if (isActive) {

                item.setAttribute(
                    "aria-current",
                    "page"
                );

            } else {

                item.removeAttribute(
                    "aria-current"
                );
            }
        }
    );
}
/* ==========================================================
   COMMUNICATION HUB
   File: js/call.js

   Part 3/3

   Continues from:
   setActiveNavigation()
========================================================== */


/* ==========================================================
   MAIN NAVIGATION
========================================================== */

function navigateTo(route) {

    if (!route) {
        return;
    }


    /*
       Main EchoCall application routes.
    */

    const mainRoutes = {

        home:
            "home.html",

        call:
            "call.html",

        profile:
            "profile.html",

        settings:
            "settings.html"
    };


    /* ======================================================
       USE ECHOCALL ROUTER WHEN AVAILABLE
    ====================================================== */

    const router =
        window.EchoCallRouter;


    if (
        router &&
        typeof router.navigate === "function"
    ) {

        router.navigate(
            route
        );

        return;
    }


    /*
       Support another global navigation
       function if the main application provides one.
    */

    if (
        typeof window.navigateTo === "function" &&
        window.navigateTo !== navigateTo
    ) {

        window.navigateTo(
            route
        );

        return;
    }


    /* ======================================================
       COMMUNICATION HUB PAGES
    ====================================================== */

    if (
        Object.prototype.hasOwnProperty.call(
            COMMUNICATION_PAGES,
            route
        )
    ) {

        setActiveNavigation(
            route
        );


        window.location.href =
            COMMUNICATION_PAGES[route];


        return;
    }


    /* ======================================================
       MAIN APP PAGES
    ====================================================== */

    if (
        Object.prototype.hasOwnProperty.call(
            mainRoutes,
            route
        )
    ) {

        window.location.href =
            mainRoutes[route];


        return;
    }


    /* ======================================================
       UNKNOWN ROUTE
    ====================================================== */

    console.warn(
        `[Communication Hub] Unknown route: ${route}`
    );


    showToast(
        "This section is not available yet."
    );
}


/* ==========================================================
   KEYBOARD SHORTCUTS
========================================================== */

function setupKeyboardShortcuts() {

    document.addEventListener(
        "keydown",
        (event) => {

            /* ==============================================
               ESCAPE
            ============================================== */

            if (
                event.key === "Escape"
            ) {

                if (searchOpen) {

                    closeSearch();
                }


                if (moreMenuOpen) {

                    closeMoreMenu();
                }


                return;
            }


            /* ==============================================
               "/" OPENS SEARCH
            ============================================== */

            if (
                event.key === "/" &&
                !isTypingTarget(
                    event.target
                )
            ) {

                event.preventDefault();

                openSearch();
            }
        }
    );
}


/* ==========================================================
   CHECK IF USER IS TYPING
========================================================== */

function isTypingTarget(element) {

    if (!element) {
        return false;
    }


    const tag =
        element.tagName
            ?.toLowerCase();


    return (

        tag === "input" ||

        tag === "textarea" ||

        tag === "select" ||

        element.isContentEditable
    );
}


/* ==========================================================
   TOAST
========================================================== */

function showToast(message) {

    const toast =
        getElement(
            "callToast"
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


/* ==========================================================
   ERROR DISPLAY
========================================================== */

function showError(message) {

    const error =
        getElement(
            "callError"
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
   HTML ESCAPING
========================================================== */

function escapeHTML(value) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        String(
            value ?? ""
        );


    return div.innerHTML;
}


/* ==========================================================
   CURRENT USER
========================================================== */

function getCurrentUser() {

    return currentUser;
}


/* ==========================================================
   AUTHENTICATION CHECK
========================================================== */

function isAuthenticated() {

    return Boolean(
        currentUser
    );
}


/* ==========================================================
   PUBLIC COMMUNICATION HUB API
========================================================== */

window.EchoCallCommunicationHub = {

    initializeCalls,

    navigateTo,

    openSearch,

    closeSearch,

    openMoreMenu,

    closeMoreMenu,

    showToast,

    showError,

    getCurrentUser,

    isAuthenticated
};


/* ==========================================================
   AUTO INITIALIZATION FALLBACK
========================================================== */

/*
   Normally your main EchoCall router should call:

   initializeCalls();

   This fallback allows call.html to still work if the
   router has not initialized the page yet.
*/

if (
    document.readyState === "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        () => {

            if (
                !communicationInitialized
            ) {

                initializeCalls();
            }
        },
        {
            once: true
        }
    );

} else {

    if (
        !communicationInitialized
    ) {

        initializeCalls();
    }
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
    }
);


/* ==========================================================
   FINAL LOG
========================================================== */

console.log(
    "[Communication Hub] call.js loaded."
);


/* ==========================================================
   END OF call.js
========================================================== */