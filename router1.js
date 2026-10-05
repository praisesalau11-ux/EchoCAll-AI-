/* =========================================================
   EchoCall AI
   File: js/router.js

   Global SPA Router
   Part 1 of 2
========================================================= */

const ROUTER_CONFIG = {
    rootElementId: "app",
    defaultRoute: "home",
    cssAttribute: "data-echocall-router-css"
};


/* =========================================================
   ROUTES
========================================================= */

const ROUTES = {

    /* =========================
       MAIN APP
    ========================= */

    home: {
        html: "pages/home.html",
        css: "css/home.css",
        script: "./home.js",
        initializer: "initializeHome"
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

    notifications: {
        html: "pages/notifications.html",
        css: "css/notifications.css",
        script: "./notifications.js",
        initializer: "initializeNotifications"
    },

    imageStudio: {
        html: "pages/image-studio.html",
        css: "css/image-studio.css",
        script: "./imageStudio.js",
        initializer: "initializeImageStudio"
    },

    voiceClone: {
        html: "pages/voice-clone.html",
        css: "css/voice-clone.css",
        script: "./voiceClone.js",
        initializer: "initializeVoiceClone"
    },


    /* =========================
       AI CHAT
    ========================= */

    "ai-chat": {
        html: "pages/ai-chat.html",
        css: "css/ai-chat.css",
        script: "./ai-chat.js",
        initializer: "initializeAIChat"
    },


    /* =========================
       COMMUNICATION HUB
    ========================= */

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

    "call-history": {
        html: "pages/call-history.html",
        css: "css/call-history.css",
        script: "./call-history.js",
        initializer: "initializeCallHistory"
    }
};


/* =========================================================
   ROUTE ALIASES
========================================================= */

const ROUTE_ALIASES = {

    /* Main */
    call: "calls",
    communication: "calls",

    message: "messages",
    chat: "messages",

    /* Voice */
    voice: "voice-call",
    voiceCall: "voice-call",

    aiVoice: "ai-voice-call",
    aiVoiceCall: "ai-voice-call",

    /* Video */
    video: "video-call",
    videoCall: "video-call",

    aiVideo: "ai-video-call",
    aiVideoCall: "ai-video-call",

    /* Communication */
    group: "groups",
    community: "communities",
    channel: "channels",

    callHistory: "call-history",
    call_history: "call-history",

    /* AI */
    ai: "ai-chat",
    aiChat: "ai-chat",
    ai_chat: "ai-chat",

    /* Image */
    image: "imageStudio",
    image_studio: "imageStudio",

    /* Voice clone */
    voice_clone: "voiceClone",
    voiceclone: "voiceClone"
};


/* =========================================================
   ROUTER STATE
========================================================= */

let currentPage = null;
let currentModule = null;
let currentInitializer = null;
let currentCleanup = null;

let routerInitialized = false;
let navigationInProgress = false;
let navigationRequestId = 0;
let routerEventsReady = false;


/* =========================================================
   BASIC HELPERS
========================================================= */

function normalizeRoute(route) {

    if (!route) {
        return ROUTER_CONFIG.defaultRoute;
    }

    let value = String(route)
        .trim()
        .replace(/^#/, "")
        .replace(/^\/+/, "")
        .replace(/\/+$/, "");

    if (!value) {
        return ROUTER_CONFIG.defaultRoute;
    }

    if (ROUTE_ALIASES[value]) {
        return ROUTE_ALIASES[value];
    }

    return value;
}


function getRoute(route) {

    const normalizedRoute = normalizeRoute(route);

    return ROUTES[normalizedRoute] || null;
}


function hasRoute(route) {

    return Boolean(getRoute(route));
}


function getCurrentPage() {

    return currentPage;
}


function getCurrentModule() {

    return currentModule;
}


function isRouterInitialized() {

    return routerInitialized;
}


function isNavigationInProgress() {

    return navigationInProgress;
}


/* =========================================================
   ROOT ELEMENT
========================================================= */

function getRootElement() {

    const root = document.getElementById(
        ROUTER_CONFIG.rootElementId
    );

    if (!root) {

        throw new Error(
            `Router root element "#${ROUTER_CONFIG.rootElementId}" was not found.`
        );
    }

    return root;
}


/* =========================================================
   HTML LOADER
========================================================= */

async function loadHTML(path) {

    const root = getRootElement();

    const response = await fetch(
        `${path}?router=${Date.now()}`,
        {
            cache: "no-store"
        }
    );

    if (!response.ok) {

        throw new Error(
            `Failed to load HTML: ${path} (${response.status})`
        );
    }

    const html = await response.text();

    root.innerHTML = html;

    return root;
}


/* =========================================================
   CSS LOADER
========================================================= */

async function loadCSS(path) {

    if (!path) {
        return null;
    }

    const previousStyles = document.querySelectorAll(
        `link[${ROUTER_CONFIG.cssAttribute}]`
    );

    previousStyles.forEach(link => {
        link.remove();
    });


    const link = document.createElement("link");

    link.rel = "stylesheet";

    link.href = `${path}?router=${Date.now()}`;

    link.setAttribute(
        ROUTER_CONFIG.cssAttribute,
        "true"
    );


    await new Promise((resolve, reject) => {

        link.onload = resolve;

        link.onerror = () => {
            reject(
                new Error(
                    `Failed to load CSS: ${path}`
                )
            );
        };

        document.head.appendChild(link);
    });


    return link;
}


/* =========================================================
   JAVASCRIPT MODULE LOADER
========================================================= */

async function loadModule(scriptPath) {

    if (!scriptPath) {
        return {};
    }

    const module = await import(
        `${scriptPath}?router=${Date.now()}`
    );

    return module;
}


/* =========================================================
   INITIALIZER FINDER
========================================================= */

function findInitializer(
    module,
    initializerName
) {

    if (
        initializerName &&
        typeof module?.[initializerName] === "function"
    ) {
        return module[initializerName];
    }


    if (
        typeof module?.initialize === "function"
    ) {
        return module.initialize;
    }


    return null;
}


/* =========================================================
   CLEANUP FINDER
========================================================= */

function findCleanup(module) {

    if (
        typeof module?.cleanup === "function"
    ) {
        return module.cleanup;
    }

    return null;
}


/* =========================================================
   PAGE INITIALIZER
========================================================= */

async function initializePage(
    module,
    routeConfig
) {

    const initializer = findInitializer(
        module,
        routeConfig.initializer
    );

    currentInitializer = initializer;


    if (!initializer) {

        console.warn(
            `[EchoCall Router] No initializer found for "${routeConfig.html}".`
        );

        return;
    }


    await initializer();
}


/* =========================================================
   PAGE CLEANUP
========================================================= */

async function cleanupCurrentPage() {

    if (
        typeof currentCleanup === "function"
    ) {

        try {

            await currentCleanup();

        } catch (error) {

            console.warn(
                "[EchoCall Router] Page cleanup failed:",
                error
            );
        }
    }


    currentCleanup = null;
    currentInitializer = null;
    currentModule = null;
}


/* =========================================================
   LOAD PAGE
========================================================= */

async function loadPage(route) {

    const normalizedRoute = normalizeRoute(route);

    const routeConfig = getRoute(
        normalizedRoute
    );


    if (!routeConfig) {

        throw new Error(
            `Unknown route: "${normalizedRoute}"`
        );
    }


    const requestId = ++navigationRequestId;

    navigationInProgress = true;


    try {

        await cleanupCurrentPage();


        if (
            requestId !== navigationRequestId
        ) {
            return false;
        }


        /* =========================
           HTML
        ========================= */

        await loadHTML(
            routeConfig.html
        );


        if (
            requestId !== navigationRequestId
        ) {
            return false;
        }


        /* =========================
           CSS
        ========================= */

        await loadCSS(
            routeConfig.css
        );


        if (
            requestId !== navigationRequestId
        ) {
            return false;
        }


        /* =========================
           JAVASCRIPT
        ========================= */

        const module = await loadModule(
            routeConfig.script
        );


        if (
            requestId !== navigationRequestId
        ) {
            return false;
        }


        currentModule = module;

        currentCleanup = findCleanup(
            module
        );


        /* =========================
           INITIALIZE
        ========================= */

        await initializePage(
            module,
            routeConfig
        );


        if (
            requestId !== navigationRequestId
        ) {
            return false;
        }


        currentPage = normalizedRoute;


        updateActiveNavigation(
            normalizedRoute
        );


        dispatchRouterEvent(
            "echocall:route-changed",
            {
                route: normalizedRoute,
                previousRoute: currentPage
            }
        );


        return true;

    } catch (error) {

        console.error(
            `[EchoCall Router] Failed to load "${normalizedRoute}".`,
            error
        );


        renderRouterError(
            normalizedRoute,
            error
        );


        throw error;

    } finally {

        if (
            requestId === navigationRequestId
        ) {
            navigationInProgress = false;
        }
    }
}


/* =========================================================
   URL ROUTE
========================================================= */

function getPageFromURL() {

    const hash = window.location.hash;

    if (hash) {

        const route = normalizeRoute(
            hash
        );

        if (hasRoute(route)) {
            return route;
        }
    }


    const path = window.location.pathname
        .replace(/^\/+/, "")
        .replace(/\/+$/, "");


    if (
        path &&
        path !== "index.html" &&
        hasRoute(path)
    ) {
        return normalizeRoute(path);
    }


    return ROUTER_CONFIG.defaultRoute;
}


/* =========================================================
   URL UPDATE
========================================================= */

function updateURL(route) {

    const normalizedRoute = normalizeRoute(
        route
    );

    const newHash = `#${normalizedRoute}`;


    if (
        window.location.hash !== newHash
    ) {

        history.pushState(
            {
                route: normalizedRoute
            },
            "",
            newHash
        );
    }
}


/* =========================================================
   ROUTER ERROR SCREEN
========================================================= */

function renderRouterError(
    route,
    error
) {

    let root;

    try {

        root = getRootElement();

    } catch {

        return;
    }


    root.innerHTML = `
        <section
            style="
                min-height:100vh;
                display:flex;
                align-items:center;
                justify-content:center;
                padding:24px;
                background:#0B1120;
                color:#fff;
                font-family:system-ui,sans-serif;
            "
        >

            <div
                style="
                    width:min(500px,100%);
                    padding:30px;
                    border-radius:24px;
                    background:rgba(255,255,255,.055);
                    border:1px solid rgba(255,255,255,.09);
                    backdrop-filter:blur(20px);
                    text-align:center;
                "
            >

                <h2
                    style="
                        margin:0 0 12px;
                        font-size:24px;
                    "
                >
                    EchoCall couldn't load this page
                </h2>


                <p
                    style="
                        margin:0 0 18px;
                        color:#B8C5D6;
                    "
                >
                    Route:
                    <strong>${route}</strong>
                </p>


                <button
                    id="routerRetryButton"
                    type="button"
                    style="
                        border:0;
                        padding:13px 20px;
                        border-radius:14px;
                        background:#1E3A8A;
                        color:#fff;
                        font-weight:700;
                        cursor:pointer;
                    "
                >
                    Try Again
                </button>

            </div>

        </section>
    `;


    const retryButton = document.getElementById(
        "routerRetryButton"
    );


    if (retryButton) {

        retryButton.addEventListener(
            "click",
            () => {

                navigate(
                    route,
                    {
                        replace: true,
                        force: true
                    }
                );

            }
        );
    }


    if (error) {
        console.error(
            "[EchoCall Router] Route error:",
            error
        );
    }
}


/* =========================================================
   NAVIGATION
========================================================= */

async function navigate(
    route,
    options = {}
) {

    const {
        replace = false,
        force = false,
        skipURL = false
    } = options;


    const normalizedRoute = normalizeRoute(
        route
    );


    if (!hasRoute(normalizedRoute)) {

        console.warn(
            `[EchoCall Router] Unknown route "${route}".`
        );

        return false;
    }


    if (
        !force &&
        currentPage === normalizedRoute &&
        !navigationInProgress
    ) {

        updateActiveNavigation(
            normalizedRoute
        );

        return true;
    }


    try {

        const previousRoute =
            currentPage;


        if (!skipURL) {

            if (replace) {

                history.replaceState(
                    {
                        route: normalizedRoute
                    },
                    "",
                    `#${normalizedRoute}`
                );

            } else {

                updateURL(
                    normalizedRoute
                );
            }
        }


        const result = await loadPage(
            normalizedRoute
        );


        dispatchRouterEvent(
            "echocall:navigated",
            {
                route: normalizedRoute,
                previousRoute
            }
        );


        return result;

    } catch (error) {

        console.error(
            "[EchoCall Router] Navigation failed:",
            error
        );

        return false;
    }
}


/* =========================================================
   HOME
========================================================= */

async function goHome() {

    return navigate(
        ROUTER_CONFIG.defaultRoute
    );
}


/* =========================================================
   BACK
========================================================= */

function goBack() {

    if (history.length > 1) {

        history.back();

        return true;
    }


    return goHome();
}


/* =========================================================
   REFRESH
========================================================= */

async function refreshPage() {

    if (!currentPage) {
        return goHome();
    }


    return navigate(
        currentPage,
        {
            force: true,
            replace: true
        }
    );
}


/* =========================================================
   ROUTER EVENTS
========================================================= */
function dispatchRouterEvent(
    eventName,
    detail = {}
) {

    window.dispatchEvent(
        new CustomEvent(
            eventName,
            {
                detail
            }
        )
    );
}
/* =========================================================
   ACTIVE NAVIGATION
========================================================= */

function updateActiveNavigation(route) {

    const normalizedRoute =
        normalizeRoute(route);


    const selectors = [
        "[data-page]",
        "[data-route]",
        "[data-messages-route]",
        "[data-contacts-route]",
        "[data-calls-route]"
    ];


    const elements = document.querySelectorAll(
        selectors.join(",")
    );


    elements.forEach(element => {

        const page =
            element.getAttribute("data-page");

        const dataRoute =
            element.getAttribute("data-route");

        const messagesRoute =
            element.getAttribute(
                "data-messages-route"
            );

        const contactsRoute =
            element.getAttribute(
                "data-contacts-route"
            );

        const callsRoute =
            element.getAttribute(
                "data-calls-route"
            );


        const values = [
            page,
            dataRoute,
            messagesRoute,
            contactsRoute,
            callsRoute
        ]
            .filter(Boolean)
            .map(normalizeRoute);


        const isActive =
            values.includes(normalizedRoute);


        element.classList.toggle(
            "active",
            isActive
        );


        element.setAttribute(
            "aria-current",
            isActive ? "page" : "false"
        );
    });
}


/* =========================================================
   ROUTER CLICK HANDLER
========================================================= */

async function handleRouterClick(event) {

    const target =
        event.target.closest(
            "[data-route]"
        );


    if (!target) {
        return;
    }


    if (
        target.hasAttribute("data-no-router")
    ) {
        return;
    }


    const route =
        target.getAttribute(
            "data-route"
        );


    if (!route) {
        return;
    }


    if (!hasRoute(route)) {
        return;
    }


    event.preventDefault();


    await navigate(route);
}


/* =========================================================
   HASH CHANGE
========================================================= */

async function handleHashChange() {

    const route =
        getPageFromURL();


    if (
        route === currentPage &&
        !navigationInProgress
    ) {

        updateActiveNavigation(
            route
        );

        return;
    }


    await navigate(
        route,
        {
            skipURL: true
        }
    );
}


/* =========================================================
   POP STATE
========================================================= */

async function handlePopState() {

    const route =
        getPageFromURL();


    await navigate(
        route,
        {
            skipURL: true,
            force: true
        }
    );
}


/* =========================================================
   ROUTER EVENTS SETUP
========================================================= */

function setupRouterEvents() {

    if (routerEventsReady) {
        return;
    }


    document.addEventListener(
        "click",
        handleRouterClick
    );


    window.addEventListener(
        "hashchange",
        handleHashChange
    );


    window.addEventListener(
        "popstate",
        handlePopState
    );


    routerEventsReady = true;
}


/* =========================================================
   PRELOAD PAGE
========================================================= */

async function preloadPage(route) {

    const normalizedRoute =
        normalizeRoute(route);


    const routeConfig =
        getRoute(normalizedRoute);


    if (!routeConfig) {

        console.warn(
            `[EchoCall Router] Cannot preload unknown route "${route}".`
        );

        return false;
    }


    try {

        await fetch(
            `${routeConfig.html}?preload=${Date.now()}`,
            {
                cache: "no-store"
            }
        );


        if (routeConfig.css) {

            const cssResponse =
                await fetch(
                    `${routeConfig.css}?preload=${Date.now()}`,
                    {
                        cache: "no-store"
                    }
                );


            if (!cssResponse.ok) {
                console.warn(
                    `[EchoCall Router] Could not preload CSS for "${normalizedRoute}".`
                );
            }
        }


        return true;

    } catch (error) {

        console.warn(
            `[EchoCall Router] Preload failed for "${normalizedRoute}".`,
            error
        );

        return false;
    }
}


/* =========================================================
   INITIALIZE ROUTER
========================================================= */

async function initializeRouter() {

    if (routerInitialized) {

        return true;
    }


    setupRouterEvents();


    const initialRoute =
        getPageFromURL();


    try {

        await navigate(
            initialRoute,
            {
                force: true,
                skipURL: true
            }
        );


        routerInitialized = true;


        dispatchRouterEvent(
            "echocall:router-ready",
            {
                route: currentPage
            }
        );


        return true;

    } catch (error) {

        console.error(
            "[EchoCall Router] Initialization failed:",
            error
        );


        return false;
    }
}


/* =========================================================
   ROUTER API
========================================================= */

const routerAPI = {

    /* Navigation */

    navigate,

    goHome,

    goBack,

    refreshPage,


    /* Loading */

    loadPage,

    preloadPage,


    /* Router startup */

    initializeRouter,


    /* State */

    getCurrentPage,

    getCurrentModule,

    isRouterInitialized,

    isNavigationInProgress,


    /* Route helpers */

    normalizeRoute,

    getRoute,

    hasRoute,


    /* Configuration */

    routes: ROUTES,

    aliases: ROUTE_ALIASES
};


/* =========================================================
   GLOBAL ROUTER ACCESS
========================================================= */

window.EchoCallRouter =
    routerAPI;


window.echoCallRouter =
    routerAPI;


window.router =
    routerAPI;


window.navigateTo =
    navigate;


window.loadEchoCallPage =
    loadPage;


window.initializeEchoCallRouter =
    initializeRouter;


window.preloadEchoCallPage =
    preloadPage;


/* =========================================================
   INITIAL PAGE ACTIVE STATE
========================================================= */

window.addEventListener(
    "load",
    () => {

        if (currentPage) {

            updateActiveNavigation(
                currentPage
            );
        }
    }
);


/* =========================================================
   ROUTE CHANGE LISTENER
========================================================= */

window.addEventListener(
    "echocall:route-changed",
    event => {

        const route =
            event.detail?.route;


        if (route) {

            updateActiveNavigation(
                route
            );
        }
    }
);


/* =========================================================
   KEYBOARD SHORTCUTS
========================================================= */

document.addEventListener(
    "keydown",
    event => {

        /* Alt + H = Home */

        if (
            event.altKey &&
            event.key.toLowerCase() === "h"
        ) {

            event.preventDefault();

            goHome();

            return;
        }


        /* Alt + B = Back */

        if (
            event.altKey &&
            event.key.toLowerCase() === "b"
        ) {

            event.preventDefault();

            goBack();

            return;
        }
    }
);


/* =========================================================
   DEBUG API
========================================================= */

window.EchoCallRouterDebug = {

    getState() {

        return {
            currentPage,
            currentModule,
            routerInitialized,
            navigationInProgress,
            navigationRequestId,
            routerEventsReady
        };
    },


    getRoutes() {

        return {
            ...ROUTES
        };
    },


    getAliases() {

        return {
            ...ROUTE_ALIASES
        };
    }
};


/* =========================================================
   EXPORTS
========================================================= */

export {

    ROUTES,

    ROUTE_ALIASES,

    normalizeRoute,

    getRoute,

    hasRoute,

    getCurrentPage,

    getCurrentModule,

    isRouterInitialized,

    isNavigationInProgress,

    navigate,

    loadPage,

    preloadPage,

    goHome,

    goBack,

    refreshPage,

    initializeRouter
};


export default routerAPI;