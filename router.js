// ==========================================
// EchoCall AI
// File: js/router.js
// Purpose: SPA Router with safe page lifecycle
// ==========================================

// ==========================================
// Page Routes
// ==========================================

const routes = {

    home: {
        html: "pages/home.html",
        css: "css/home.css",
        script: "./home.js",
        initializer: "initializeHome"
    },

    calls: {
        html: "pages/calls.html",
        css: "css/calls.css",
        script: "./calls.js",
        initializer: "initializeCalls"
    },

    history: {
        html: "pages/history.html",
        css: "css/history.css",
        script: "./history.js",
        initializer: "initializeHistory"
    },

    contacts: {
        html: "pages/contacts.html",
        css: "css/contacts.css",
        script: "./contacts.js",
        initializer: "initializeContacts"
    },

    profile: {
        html: "pages/profile.html",
        css: "css/profile.css",
        script: "./profile.js",
        initializer: "initializeProfile"
    },

    voiceClone: {
        html: "pages/voice-clone.html",
        css: "css/voice-clone.css",
        script: "./voiceClone.js",
        initializer: "initializeVoiceClone"
    },

    settings: {
        html: "pages/settings.html",
        css: "css/settings.css",
        script: "./settings.js",
        initializer: "initializeSettings"
    },

    premium: {
        html: "pages/premium.html",
        css: "css/premium.css",
        script: "./premium.js",
        initializer: "initializePremium"
    },

    security: {
        html: "pages/security.html",
        css: "css/security.css",
        script: "./security.js",
        initializer: "initializeSecurity"
    },

    imageStudio: {
        html: "pages/image-studio.html",
        css: "css/image-studio.css",
        script: "./image-studio.js",
        initializer: "initializeImageStudio"
    },

    notifications: {
        html: "pages/notifications.html",
        css: "css/notifications.css",
        script: "./notifications.js",
        initializer: "initializeNotifications"
    },

  calls: {
        html: "pages/call.html",
        css: "css/call.css",
        script: "./call.js",
        initializer: "initializeCalls"
    },

    messages: {
        html: "pages/messages.html",
        css: "css/messages.css",
        script: "./messages.js",
        initializer: "initializeMessages"
    },

    "voice-call": {
        html: "pages/voice-call.html",
        css: "css/voice-call.css",
        script: "./voice-call.js",
        initializer: "initializeVoiceCall"
    },

    "ai-voice-call": {
        html: "pages/ai-voice-call.html",
        css: "css/ai-voice-call.css",
        script: "./ai-voice-call.js",
        initializer: "initializeAIVoiceCall"
    },

    "video-call": {
        html: "pages/video-call.html",
        css: "css/video-call.css",
        script: "./video-call.js",
        initializer: "initializeVideoCall"
    },

    "ai-video-call": {
        html: "pages/ai-video-call.html",
        css: "css/ai-video-call.css",
        script: "./ai-video-call.js",
        initializer: "initializeAIVideoCall"
    },

    groups: {
        html: "pages/groups.html",
        css: "css/groups.css",
        script: "./groups.js",
        initializer: "initializeGroups"
    },

    communities: {
        html: "pages/communities.html",
        css: "css/communities.css",
        script: "./communities.js",
        initializer: "initializeCommunities"
    },

    channels: {
        html: "pages/channels.html",
        css: "css/channels.css",
        script: "./channels.js",
        initializer: "initializeChannels"
    },

    status: {
        html: "pages/status.html",
        css: "css/status.css",
        script: "./status.js",
        initializer: "initializeStatus"
    },

    contacts: {
        html: "pages/contacts.html",
        css: "css/contacts.css",
        script: "./contacts.js",
        initializer: "initializeContacts"
    },

    "call-history": {
        html: "pages/call-history.html",
        css: "css/call-history.css",
        script: "./call-history.js",
        initializer: "initializeCallHistory"
    },

    // ======================================
    // AI
    // ======================================

    "ai-chat": {
        html: "pages/ai-chat.html",
        css: "css/ai-chat.css",
        script: "./ai-chat.js",
        initializer: "initializeAIChat"
    },

    // ======================================
    // OTHER ECHOCALL PAGES
    // ======================================

    history: {
        html: "pages/history.html",
        css: "css/history.css",
        script: "./history.js",
        initializer: "initializeHistory"
    },

    profile: {
        html: "pages/profile.html",
        css: "css/profile.css",
        script: "./profile.js",
        initializer: "initializeProfile"
    },

    voiceClone: {
        html: "pages/voice-clone.html",
        css: "css/voice-clone.css",
        script: "./voiceClone.js",
        initializer: "initializeVoiceClone"
    },

    settings: {
        html: "pages/settings.html",
        css: "css/settings.css",
        script: "./settings.js",
        initializer: "initializeSettings"
    },

    premium: {
        html: "pages/premium.html",
        css: "css/premium.css",
        script: "./premium.js",
        initializer: "initializePremium"
    },

    security: {
        html: "pages/security.html",
        css: "css/security.css",
        script: "./security.js",
        initializer: "initializeSecurity"
    },


    

  
    // IMPORTANT:
    // Do not add "auth" here until you confirm
    // the exact auth HTML/JS filenames.
};

// ==========================================
// Router State
// ==========================================

let currentPage = null;
let currentModule = null;
let navigationInProgress = false;

// ==========================================
// DOM
// ==========================================

function getPageContainer() {

    const container = document.getElementById("pageContainer");

    if (!container) {
        console.error(
            "[Router] #pageContainer was not found."
        );

        return null;
    }

    return container;
}

// ==========================================
// CSS Loader
// ==========================================

function loadPageCSS(cssPath) {

    if (!cssPath) return;

    const oldStyles =
        document.querySelectorAll(
            "link[data-router-page-style]"
        );

    oldStyles.forEach(link => {
        link.remove();
    });

    const link = document.createElement("link");

    link.rel = "stylesheet";
    link.href = cssPath;
    link.dataset.routerPageStyle = "true";

    document.head.appendChild(link);
}

// ==========================================
// Cleanup Previous Page
// ==========================================

async function cleanupPreviousPage() {

    if (!currentModule) {
        return;
    }

    try {

        // Standard cleanup
        if (
            typeof currentModule.cleanup ===
            "function"
        ) {

            await currentModule.cleanup();

        }

        // Contacts cleanup
        else if (
            typeof currentModule.cleanupContactsPage ===
            "function"
        ) {

            await currentModule.cleanupContactsPage();

        }

        // Older Contacts cleanup
        else if (
            typeof currentModule.cleanupContacts ===
            "function"
        ) {

            await currentModule.cleanupContacts();

        }

    } catch (error) {

        console.error(
            "[Router] Page cleanup error:",
            error
        );

    }

    currentModule = null;
}



// ==========================================
// Load HTML
// ==========================================

async function loadHTML(htmlPath) {

    const response =
        await fetch(
            htmlPath,
            {
                cache: "no-cache"
            }
        );

    if (!response.ok) {

        throw new Error(
            `Failed to load ${htmlPath}: ${response.status}`
        );
    }

    return await response.text();
}

// ==========================================
// Load Page Module
// ==========================================

async function loadModule(scriptPath) {

    if (!scriptPath) {
        return null;
    }

    /*
     * IMPORTANT:
     *
     * ES modules are cached by the browser.
     *
     * Therefore:
     *
     * import("./home.js")
     *
     * does NOT execute the entire file again
     * when returning to Home.
     *
     * We intentionally import the module and then
     * explicitly call its initializer every time.
     */

    const module =
        await import(
            `${scriptPath}?router=${Date.now()}`
        );

    return module;
}

// ==========================================
// Initialize Current Page
// ==========================================

async function initializePage(
    pageName,
    module,
    route
) {

    if (!module) {
        return;
    }

    const initializerName =
        route.initializer;

    if (!initializerName) {
        return;
    }

    const initializer =
        module[initializerName];

    if (
        typeof initializer !==
        "function"
    ) {

        console.warn(
            `[Router] ${initializerName}() was not found in ${route.script}`
        );

        return;
    }

    try {

        /*
         * THIS IS THE IMPORTANT PART.
         *
         * The HTML has already been inserted.
         *
         * The page initializer now searches for
         * the NEW DOM elements and attaches all
         * listeners again.
         */

        await initializer();

        console.log(
            `[Router] ${pageName} initialized successfully.`
        );

    } catch (error) {

        console.error(
            `[Router] Failed to initialize ${pageName}:`,
            error
        );

        throw error;
    }
}

// ==========================================
// Update Active Navigation
// ==========================================

function updateActiveNavigation(
    pageName
) {

    const navItems =
        document.querySelectorAll(
            "[data-page]"
        );

    navItems.forEach(item => {

        const itemPage =
            item.dataset.page;

        item.classList.toggle(
            "active",
            itemPage === pageName
        );

        item.setAttribute(
            "aria-current",
            itemPage === pageName
                ? "page"
                : "false"
        );
    });
}

// ==========================================
// Navigate
// ==========================================

async function loadPage(
    pageName,
    options = {}
) {

    if (
        navigationInProgress &&
        !options.force
    ) {
        return;
    }

    const route =
        routes[pageName];

    if (!route) {

        console.error(
            `[Router] Unknown route: ${pageName}`
        );

        return;
    }

    const container =
        getPageContainer();

    if (!container) {
        return;
    }

    navigationInProgress = true;

    try {

        console.log(
            `[Router] Loading page: ${pageName}`
        );

        // --------------------------------------
        // 1. Cleanup previous page
        // --------------------------------------

        await cleanupPreviousPage();

        // --------------------------------------
        // 2. Load HTML
        // --------------------------------------

        const html =
            await loadHTML(
                route.html
            );

        // --------------------------------------
        // 3. Replace page DOM
        // --------------------------------------

        container.innerHTML =
            html;

        // --------------------------------------
        // 4. Load page CSS
        // --------------------------------------

        loadPageCSS(
            route.css
        );

        // --------------------------------------
        // 5. Import page JS module
        // --------------------------------------

        const module =
            await loadModule(
                route.script
            );

        currentModule =
            module;

        // --------------------------------------
        // 6. Update router state
        // --------------------------------------

        currentPage =
            pageName;

        // --------------------------------------
        // 7. Update navigation
        // --------------------------------------

        updateActiveNavigation(
            pageName
        );

        // --------------------------------------
        // 8. Initialize page AFTER HTML
        // --------------------------------------

        await initializePage(
            pageName,
            module,
            route
        );

        // --------------------------------------
        // 9. Browser history
        // --------------------------------------

        if (!options.skipHistory) {

            const newHash =
                `#${pageName}`;

            if (
                window.location.hash !==
                newHash
            ) {

                if (
                    options.replace
                ) {

                    window.history.replaceState(
                        {
                            page: pageName
                        },
                        "",
                        newHash
                    );

                } else {

                    window.history.pushState(
                        {
                            page: pageName
                        },
                        "",
                        newHash
                    );
                }
            }
        }

        console.log(
            `[Router] ${pageName} ready.`
        );

    } catch (error) {

        console.error(
    "[Router] Navigation failed:",
    error
);

console.error(
    "[Router] Error name:",
    error?.name
);

console.error(
    "[Router] Error message:",
    error?.message
);

console.error(
    "[Router] Error stack:",
    error?.stack
);

        container.innerHTML = `
            <div class="router-error">
                <h2>Unable to load this page</h2>
                <p>
                    Something went wrong while loading
                    <strong>${pageName}</strong>.
                </p>
                <button
                    type="button"
                    id="routerRetryButton"
                >
                    Try Again
                </button>
            </div>
        `;

        const retryButton =
            document.getElementById(
                "routerRetryButton"
            );

        if (retryButton) {

            retryButton.addEventListener(
                "click",
                () => {

                    loadPage(
                        pageName,
                        {
                            force: true
                        }
                    );
                }
            );
        }

    } finally {

        navigationInProgress =
            false;
    }
}

// ==========================================
// Public Navigate Function
// ==========================================

async function navigate(
    pageName,
    options = {}
) {

    return loadPage(
        pageName,
        options
    );
}

// ==========================================
// Navigation Click Handling
// ==========================================

function initializeNavigation() {

    /*
     * Event delegation means we only need ONE
     * listener on the document.
     *
     * This continues working even when the router
     * replaces page HTML.
     */

    if (
        window.__echoCallRouterNavigation
    ) {
        return;
    }

    window.__echoCallRouterNavigation =
        true;

    document.addEventListener(
        "click",
        event => {

            const navigationElement =
                event.target.closest(
                    "[data-page]"
                );

            if (!navigationElement) {
                return;
            }

            /*
             * Ignore links/buttons that explicitly
             * opt out of router navigation.
             */

            if (
                navigationElement.dataset.routerIgnore ===
                "true"
            ) {
                return;
            }

            const pageName =
                navigationElement.dataset.page;

            if (!pageName) {
                return;
            }

            event.preventDefault();

            navigate(pageName);
        }
    );
}

// ==========================================
// Browser Back / Forward
// ==========================================

function initializeHistoryNavigation() {

    if (
        window.__echoCallRouterHistory
    ) {
        return;
    }

    window.__echoCallRouterHistory =
        true;

    window.addEventListener(
        "popstate",
        () => {

            const pageName =
                getPageFromURL();

            loadPage(
                pageName,
                {
                    skipHistory: true,
                    force: true
                }
            );
        }
    );
}

// ==========================================
// Get Page From URL
// ==========================================

function getPageFromURL() {

    const hash =
        window.location.hash
            .replace("#", "")
            .trim();

    if (
        hash &&
        routes[hash]
    ) {
        return hash;
    }

    return "home";
}

// ==========================================
// Router Initialization
// ==========================================

async function initializeRouter() {

    console.log(
        "[Router] Initializing EchoCall router..."
    );

    initializeNavigation();

    initializeHistoryNavigation();

    const initialPage =
        getPageFromURL();

    await loadPage(
        initialPage,
        {
            replace: true,
            force: true
        }
    );
}

// ==========================================
// Preload Page
// ==========================================

async function preloadPage(
    pageName
) {

    const route =
        routes[pageName];

    if (!route) {
        return;
    }

    try {

        await fetch(
            route.html,
            {
                cache: "force-cache"
            }
        );

        /*
         * Do not initialize the page here.
         *
         * Initialization must happen only after
         * its HTML is actually inserted.
         */

    } catch (error) {

        console.warn(
            `[Router] Could not preload ${pageName}:`,
            error
        );
    }
}

// ==========================================
// Exports
// ==========================================

export {
    routes,
    navigate,
    loadPage,
    initializeRouter,
    preloadPage
};

// ==========================================
// Global Router API
// ==========================================

window.navigateTo =
    navigate;

window.echoCallRouter = {
    navigate,
    loadPage,
    initializeRouter,
    preloadPage,
    routes
};

