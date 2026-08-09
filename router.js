// ==========================================
// EchoCall AI
// File: js/router.js
// Part 1
// ==========================================

// ==========================================
// Routes
// ==========================================

const routes = {

home: {  

    html: "pages/home.html",  

    css: "css/home.css",  

    script: "./home.js"  

},  

calls: {  

    html: "pages/calls.html",  

    css: "css/calls.css",  

    script: "./calls.js"  

},  

history: {  

    html: "pages/history.html",  

    css: "css/history.css",  

    script: "./history.js"  

},  

contacts: {  

    html: "pages/contacts.html",  

    css: "css/contacts.css",  

    script: "./contacts.js"  

},  

profile: {  

    html: "pages/profile.html",  

    css: "css/profile.css",  

    script: "./profile.js"  

},  
  
voiceClone: {  
    html: "pages/voice-clone.html",  
    css: "css/voice-clone.css",  
    script: "./voice-clone.js"  
},  

settings: {  
    html: "pages/settings.html",  
    css: "css/settings.css",  
    script: "./settings.js"  
},  

premium: {  
    html: "pages/premium.html",  
    css: "css/premium.css",  
    script: "./premium.js"  
},  

security: {  
    html: "pages/security.html",  
    css: "css/security.css",  
    script: "./security.js"  
}

};

// ==========================================
// Elements
// ==========================================

const pageContainer =
document.getElementById("pageContainer");

const navItems =
document.querySelectorAll(".nav-item");

// ==========================================
// Router State
// ==========================================

let currentPage = null;

const pageCache = {};

// ==========================================
// Load Page
// ==========================================

async function loadPage(pageName) {

const route = routes[pageName];  

if (!route) {  

    console.error(  
        "Unknown page:",  
        pageName  
    );  

    return;  

}  

try {  
  // ==========================================

// Load Page CSS
// ==========================================

document
.querySelectorAll("link[data-page-style]")
.forEach(link => link.remove());

if (route.css) {

const css = document.createElement("link");  

css.rel = "stylesheet";  

css.href = route.css;  

css.setAttribute(  
    "data-page-style",  
    "true"  
);  

document.head.appendChild(css);

}

pageContainer.innerHTML = `  

        <div class="loading-screen">  

            <div class="loader"></div>  

            <h2>Loading...</h2>  

        </div>  

    `;  

    let html;  

    if (pageCache[pageName]) {  

        html = pageCache[pageName];  

    } else {  

        const response =  
        await fetch(route.html);  

        if (!response.ok) {  

            throw new Error(  
                "Unable to load page."  
            );  

        }  

        html =  
        await response.text();  

        pageCache[pageName] = html;  

    }  

    pageContainer.innerHTML = html;  

    currentPage = pageName;  

}  

catch (error) {  

    console.error(error);  

    pageContainer.innerHTML = `  

        <div class="error-page">  

            <h2>  

                Failed to load page  

            </h2>  

            <p>  

                ${error.message}  

            </p>  

        </div>  

    `;  

}

}

// ==========================================
// End Part 1
// ==========================================
// ==========================================
// EchoCall AI
// File: js/router.js
// Part 2
// Append below Part 1
// ==========================================

// ==========================================
// Navigate
// ==========================================

export async function navigate(pageName) {

if (!routes[pageName]) {  

    return;  

}  

await loadPage(pageName);  

// Update Navigation  

navItems.forEach((item) => {  

    item.classList.remove("active");  

    if (  

        item.dataset.page === pageName  

    ) {  

        item.classList.add("active");  

    }  

});  

// Load JavaScript Module  

try {  

const module = await import(  

    routes[pageName].script  

);  

switch(pageName){

    case "home":
        module.initializeHome?.();
        break;

    case "calls":
        module.initializeCalls?.();
        break;

    case "history":
        module.initializeHistory?.();
        break;

    case "contacts":
        module.initializeContacts?.();
        break;

    case "profile":
        module.initializeProfile?.();
        break;

    case "voiceClone":
        module.initializeVoiceClone?.();
        break;

    case "settings":
        module.initializeSettings?.();
        break;

    case "premium":
        module.initializePremium?.();
        break;

    case "security":
        module.initializeSecurity?.();
        break;

}

}

catch(error){

console.error(  

    "Module Load Error:",  

    error  

);

}

// Browser History  

if (  

    window.location.hash !==  

    "#" + pageName  

) {  

    history.pushState(  

        {  

            page: pageName  

        },  

        "",  

        "#" + pageName  

    );  

}

}

// ==========================================
// Navigation Buttons
// ==========================================

navItems.forEach((item) => {

item.addEventListener(  

    "click",  

    () => {  

        const page =  

        item.dataset.page;  

        navigate(page);  

    }  

);

});

// ==========================================
// Browser Back / Forward
// ==========================================

window.addEventListener(

"popstate",  

(event) => {  

    if (  

        event.state &&  

        event.state.page  

    ) {  

        navigate(  

            event.state.page  

        );  

    }  

}

);

// ==========================================
// Current Page
// ==========================================

export function getCurrentPage() {

return currentPage;

}

// ==========================================
// End Part 2
// ==========================================
// ==========================================
// EchoCall AI
// File: js/router.js
// Part 3
// Append below Part 2
// ==========================================

// ==========================================
// Refresh Current Page
// ==========================================

export async function refreshCurrentPage() {

if (!currentPage) {  

    return;  

}  

delete pageCache[currentPage];  

await navigate(currentPage);

}

// ==========================================
// Clear Cache
// ==========================================

export function clearPageCache() {

Object.keys(pageCache).forEach((page) => {  

    delete pageCache[page];  

});

}

// ==========================================
// Preload Pages
// ==========================================

async function preloadPages() {

for (const pageName of Object.keys(routes)) {  

    if (pageCache[pageName]) {  

        continue;  

    }  

    try {  

        const response =  
        await fetch(routes[pageName].html);  

        if (response.ok) {  

            pageCache[pageName] =  
            await response.text();  

        }  

    }  

    catch (error) {  

        console.warn(  

            "Failed to preload:",  

            pageName,  

            error  

        );  

    }  

}

}

// ==========================================
// Initialize Router
// ==========================================

export async function initializeRouter() {

let startPage =  

window.location.hash.replace("#", "");  

if (!routes[startPage]) {  

    startPage = "home";  

}  

await navigate(startPage);  

preloadPages();

}


// ==========================================
// Exports
// ==========================================

export {

routes

};

// ==========================================
// End of router.js
// ==========================================