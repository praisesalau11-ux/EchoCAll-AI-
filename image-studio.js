// ==========================================
// EchoCall AI
// File: js/image-studio.js
// Image Studio frontend — Part A
// ==========================================

import { auth } from "./firebase.js";


// ==========================================
// CONFIG
// ==========================================

const API_BASE_URL =
    "https://echocall-ai-backend.onrender.com";

const RECENT_STORAGE_KEY =
    "echocall_ai_recent_images";

const MAX_RECENT_IMAGES = 12;


// ==========================================
// DOM ELEMENTS
// ==========================================

const imagePrompt =
    document.getElementById("imagePrompt");

const promptCounter =
    document.getElementById("promptCounter");

const styleOptions =
    document.querySelectorAll(".style-option");

const ratioOptions =
    document.querySelectorAll(".ratio-option");

const referenceImage =
    document.getElementById("referenceImage");

const referencePreview =
    document.getElementById("referencePreview");

const referencePreviewImage =
    document.getElementById("referencePreviewImage");

const referenceFileName =
    document.getElementById("referenceFileName");

const referenceEmpty =
    document.getElementById("referenceEmpty");

const removeReference =
    document.getElementById("removeReference");

const generateImageButton =
    document.getElementById("generateImage");

const generationStatus =
    document.getElementById("generationStatus");

const emptyPreview =
    document.getElementById("emptyPreview");

const loadingPreview =
    document.getElementById("loadingPreview");

const generatedImage =
    document.getElementById("generatedImage");

const previewActions =
    document.getElementById("previewActions");

const downloadImageButton =
    document.getElementById("downloadImage");

const saveImageButton =
    document.getElementById("saveImage");

const newImageButton =
    document.getElementById("newImage");

const recentGallery =
    document.getElementById("recentGallery");

const clearGalleryButton =
    document.getElementById("clearGallery");

const toast =
    document.getElementById("toast");


// ==========================================
// STATE
// ==========================================

let selectedStyle = "realistic";

let selectedRatio = "1:1";

let selectedReferenceFile = null;

let currentGeneratedImage = "";

let currentPrompt = "";

let currentImageSaved = false;

let toastTimer = null;


// ==========================================
// INITIALIZATION
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    initializeImageStudio
);


function initializeImageStudio() {

    updatePromptCounter();

    loadRecentImages();

    setupStyleOptions();

    setupRatioOptions();

    setupPromptCounter();

    setupReferenceUpload();

    setupGenerateButton();

    setupPreviewActions();

    setupGalleryActions();

    setupKeyboardShortcuts();
}


// ==========================================
// AUTHENTICATION
// ==========================================

function getCurrentUser() {

    return auth.currentUser || null;
}


async function waitForAuthentication() {

    if (auth.currentUser) {
        return auth.currentUser;
    }

    return new Promise((resolve) => {

        const unsubscribe =
            auth.onAuthStateChanged((user) => {

                unsubscribe();

                resolve(user || null);
            });
    });
}


// ==========================================
// PROMPT COUNTER
// ==========================================

function setupPromptCounter() {

    if (!imagePrompt) {
        return;
    }

    imagePrompt.addEventListener(
        "input",
        updatePromptCounter
    );
}


function updatePromptCounter() {

    if (!imagePrompt || !promptCounter) {
        return;
    }

    const length =
        imagePrompt.value.length;

    promptCounter.textContent =
        `${length} / 2000`;
}


// ==========================================
// STYLE OPTIONS
// ==========================================

function setupStyleOptions() {

    styleOptions.forEach((button) => {

        button.addEventListener(
            "click",
            () => {

                styleOptions.forEach(
                    (option) => {
                        option.classList.remove(
                            "active"
                        );
                    }
                );

                button.classList.add("active");

                selectedStyle =
                    button.dataset.style ||
                    "realistic";
            }
        );
    });
}


// ==========================================
// ASPECT RATIO
// ==========================================

function setupRatioOptions() {

    ratioOptions.forEach((button) => {

        button.addEventListener(
            "click",
            () => {

                ratioOptions.forEach(
                    (option) => {
                        option.classList.remove(
                            "active"
                        );
                    }
                );

                button.classList.add("active");

                selectedRatio =
                    button.dataset.ratio ||
                    "1:1";
            }
        );
    });
}


// ==========================================
// REFERENCE IMAGE
// ==========================================

function setupReferenceUpload() {

    if (!referenceImage) {
        return;
    }

    referenceImage.addEventListener(
        "change",
        handleReferenceSelection
    );

    if (removeReference) {

        removeReference.addEventListener(
            "click",
            (event) => {

                event.preventDefault();

                event.stopPropagation();

                clearReferenceImage();
            }
        );
    }
}


function handleReferenceSelection(event) {

    const file =
        event.target.files?.[0];

    if (!file) {
        return;
    }

    if (!file.type.startsWith("image/")) {

        showToast(
            "Please select an image file."
        );

        referenceImage.value = "";

        return;
    }

    const maxSize =
        10 * 1024 * 1024;

    if (file.size > maxSize) {

        showToast(
            "Reference image must be 10 MB or smaller."
        );

        referenceImage.value = "";

        return;
    }

    selectedReferenceFile = file;

    const objectUrl =
        URL.createObjectURL(file);

    if (referencePreviewImage) {

        referencePreviewImage.src =
            objectUrl;
    }

    if (referenceFileName) {

        referenceFileName.textContent =
            file.name;
    }

    if (referenceEmpty) {

        referenceEmpty.hidden = true;
    }

    if (referencePreview) {

        referencePreview.hidden = false;
    }
}


function clearReferenceImage() {

    selectedReferenceFile = null;

    if (referenceImage) {

        referenceImage.value = "";
    }

    if (referencePreviewImage) {

        referencePreviewImage.removeAttribute(
            "src"
        );
    }

    if (referencePreview) {

        referencePreview.hidden = true;
    }

    if (referenceEmpty) {

        referenceEmpty.hidden = false;
    }

    if (referenceFileName) {

        referenceFileName.textContent =
            "Reference image";
    }
}


// ==========================================
// GENERATE BUTTON
// ==========================================

function setupGenerateButton() {

    if (!generateImageButton) {
        return;
    }

    generateImageButton.addEventListener(
        "click",
        generateImage
    );
}


// ==========================================
// IMAGE GENERATION
// ==========================================

async function generateImage() {

    const prompt =
        imagePrompt?.value.trim() || "";

    if (!prompt) {

        setStatus(
            "Enter a prompt first.",
            "error"
        );

        imagePrompt?.focus();

        return;
    }

    if (prompt.length < 3) {

        setStatus(
            "Your prompt is too short.",
            "error"
        );

        imagePrompt?.focus();

        return;
    }

    const user =
        await waitForAuthentication();

    if (!user) {

        setStatus(
            "Please sign in before generating an image.",
            "error"
        );

        showToast(
            "Please sign in to use Image Studio."
        );

        return;
    }

    currentPrompt =
        prompt;

    currentImageSaved =
        false;

    setGeneratingState(true);

    try {

        const token =
            await user.getIdToken();

        const formData = new FormData();

formData.append(
    "prompt",
    prompt
);

formData.append(
    "aspectRatio",
    selectedRatio
);

formData.append(
    "style",
    selectedStyle
);

/*
|--------------------------------------------------------------------------
| Reference Image
|--------------------------------------------------------------------------
| Only attach the image when the user selected one.
*/

if (selectedReferenceFile) {

    formData.append(
        "referenceImage",
        selectedReferenceFile
    );

    /*
    | 0.7 = balanced reference influence.
    | Higher = follow reference more closely.
    */
    formData.append(
        "referenceStrength",
        "0.7"
    );
}


const response =
    await fetch(
        `${API_BASE_URL}/api/ai/generate-image`,
        {
            method: "POST",

            headers: {
                "Authorization":
                    `Bearer ${token}`
            },

            /*
            | IMPORTANT:
            | Do NOT manually set Content-Type here.
            | The browser automatically creates the
            | multipart/form-data boundary.
            */
            body: formData
        }
    );

        let data = null;

        try {

            data =
                await response.json();

        } catch {

            throw new Error(
                `Server returned an invalid response (${response.status}).`
            );
        }

        if (!response.ok) {

            throw new Error(
                data?.message ||
                data?.error ||
                `Image generation failed (${response.status}).`
            );
        }

        if (!data?.success) {

            throw new Error(
                data?.message ||
                "Image generation failed."
            );
        }

        const imageUrl =
            data.imageUrl ||
            data.dataUrl ||
            data.image?.dataUrl ||
            data.image?.imageUrl;

        if (!imageUrl) {

            throw new Error(
                "The server did not return an image."
            );
        }

        displayGeneratedImage(
            imageUrl
        );

        currentGeneratedImage =
            imageUrl;

        addRecentImage({
            imageUrl,
            prompt,
            style:
                selectedStyle,
            aspectRatio:
                selectedRatio,
            createdAt:
                new Date().toISOString()
        });

        setStatus(
            "Image generated successfully.",
            "success"
        );

        showToast(
            "Image generated."
        );

    }
    catch (error) {

        console.error(
            "Image Studio generation error:",
            error
        );

        setStatus(
            error.message ||
            "Image generation failed.",
            "error"
        );

        showToast(
            error.message ||
            "Image generation failed."
        );

    }
    finally {

        setGeneratingState(false);
    }
}


// ==========================================
// DISPLAY GENERATED IMAGE
// ==========================================

function displayGeneratedImage(
    imageUrl
) {

    if (!generatedImage) {
        return;
    }

    generatedImage.src =
        imageUrl;

    generatedImage.hidden =
        false;

    if (emptyPreview) {

        emptyPreview.hidden =
            true;
    }

    if (loadingPreview) {

        loadingPreview.hidden =
            true;
    }

    if (previewActions) {

        previewActions.hidden =
            false;
    }
}


// ==========================================
// GENERATING STATE
// ==========================================

function setGeneratingState(
    isGenerating
) {

    if (generateImageButton) {

        generateImageButton.disabled =
            isGenerating;

        generateImageButton.innerHTML =
            isGenerating
                ? `
                    <span class="generate-button-icon">
                        ✦
                    </span>
                    <span>Creating...</span>
                  `
                : `
                    <span class="generate-button-icon">
                        ✦
                    </span>
                    <span>Generate Image</span>
                  `;
    }

    if (isGenerating) {

        if (emptyPreview) {

            emptyPreview.hidden =
                true;
        }

        if (generatedImage) {

            generatedImage.hidden =
                true;
        }

        if (previewActions) {

            previewActions.hidden =
                true;
        }

        if (loadingPreview) {

            loadingPreview.hidden =
                false;
        }

        setStatus(
            "EchoCall AI is creating your image...",
            ""
        );

    } else {

        if (loadingPreview) {

            loadingPreview.hidden =
                true;
        }
    }
}


// ==========================================
// STATUS
// ==========================================

function setStatus(
    message,
    type = ""
) {

    if (!generationStatus) {
        return;
    }

    generationStatus.textContent =
        message;

    generationStatus.classList.remove(
        "error",
        "success"
    );

    if (type) {

        generationStatus.classList.add(
            type
        );
    }
}

// ==========================================
// PREVIEW ACTIONS
// ==========================================

function setupPreviewActions() {

    if (downloadImageButton) {

        downloadImageButton.addEventListener(
            "click",
            downloadGeneratedImage
        );
    }

    if (saveImageButton) {

        saveImageButton.addEventListener(
            "click",
            saveCurrentImage
        );
    }

    if (newImageButton) {

        newImageButton.addEventListener(
            "click",
            startNewImage
        );
    }
}


// ==========================================
// DOWNLOAD IMAGE
// ==========================================

async function downloadGeneratedImage() {

    if (!currentGeneratedImage) {

        showToast(
            "There is no generated image to download."
        );

        return;
    }

    try {

        showToast(
            "Preparing download..."
        );

        const response =
            await fetch(
                currentGeneratedImage
            );

        if (!response.ok) {

            throw new Error(
                "Unable to download the image."
            );
        }

        const blob =
            await response.blob();

        const url =
            URL.createObjectURL(blob);

        const link =
            document.createElement("a");

        link.href =
            url;

        link.download =
            `echocall-ai-${Date.now()}.png`;

        document.body.appendChild(
            link
        );

        link.click();

        link.remove();

        URL.revokeObjectURL(
            url
        );

        showToast(
            "Image downloaded."
        );

    }
    catch (error) {

        console.error(
            "Image download error:",
            error
        );

        showToast(
            "Download failed."
        );
    }
}


// ==========================================
// SAVE IMAGE
// ==========================================

function saveCurrentImage() {

    if (!currentGeneratedImage) {

        showToast(
            "Generate an image first."
        );

        return;
    }

    if (currentImageSaved) {

        showToast(
            "Image is already saved."
        );

        return;
    }

    const images =
        getRecentImages();

    const exists =
        images.some(
            (item) =>
                item.imageUrl ===
                currentGeneratedImage
        );

    if (!exists) {

        images.unshift({

            imageUrl:
                currentGeneratedImage,

            prompt:
                currentPrompt,

            style:
                selectedStyle,

            aspectRatio:
                selectedRatio,

            saved:
                true,

            createdAt:
                new Date().toISOString()
        });

        saveRecentImages(
            images.slice(
                0,
                MAX_RECENT_IMAGES
            )
        );
    }

    currentImageSaved =
        true;

    if (saveImageButton) {

        saveImageButton.innerHTML =
            "<span>♥</span> Saved";
    }

    renderRecentGallery();

    showToast(
        "Image saved."
    );
}


// ==========================================
// NEW IMAGE
// ==========================================

function startNewImage() {

    if (imagePrompt) {

        imagePrompt.value =
            "";

        updatePromptCounter();

        imagePrompt.focus();
    }

    clearReferenceImage();

    currentGeneratedImage =
        "";

    currentPrompt =
        "";

    currentImageSaved =
        false;

    if (generatedImage) {

        generatedImage.hidden =
            true;

        generatedImage.removeAttribute(
            "src"
        );
    }

    if (emptyPreview) {

        emptyPreview.hidden =
            false;
    }

    if (loadingPreview) {

        loadingPreview.hidden =
            true;
    }

    if (previewActions) {

        previewActions.hidden =
            true;
    }

    if (saveImageButton) {

        saveImageButton.innerHTML =
            "<span>♡</span> Save";
    }

    setStatus(
        "",
        ""
    );
}


// ==========================================
// RECENT IMAGE STORAGE
// ==========================================

function getRecentImages() {

    try {

        const stored =
            localStorage.getItem(
                RECENT_STORAGE_KEY
            );

        if (!stored) {

            return [];
        }

        const parsed =
            JSON.parse(stored);

        return Array.isArray(parsed)
            ? parsed
            : [];

    }
    catch (error) {

        console.error(
            "Recent images read error:",
            error
        );

        return [];
    }
}


function saveRecentImages(
    images
) {

    try {

        localStorage.setItem(
            RECENT_STORAGE_KEY,
            JSON.stringify(images)
        );

    }
    catch (error) {

        console.error(
            "Recent images save error:",
            error
        );
    }
}


function addRecentImage(
    image
) {

    const images =
        getRecentImages();

    const duplicateIndex =
        images.findIndex(
            (item) =>
                item.imageUrl ===
                image.imageUrl
        );

    if (duplicateIndex !== -1) {

        images.splice(
            duplicateIndex,
            1
        );
    }

    images.unshift(
        image
    );

    saveRecentImages(
        images.slice(
            0,
            MAX_RECENT_IMAGES
        )
    );

    renderRecentGallery();
}


function loadRecentImages() {

    renderRecentGallery();
}


// ==========================================
// RECENT GALLERY
// ==========================================

function renderRecentGallery() {

    if (!recentGallery) {

        return;
    }

    const images =
        getRecentImages();

    recentGallery.innerHTML =
        "";

    if (images.length === 0) {

        recentGallery.innerHTML =
            `
                <div class="recent-empty">
                    No recent creations yet.
                </div>
            `;

        return;
    }

    images.forEach(
        (item, index) => {

            const galleryItem =
                document.createElement(
                    "button"
                );

            galleryItem.type =
                "button";

            galleryItem.className =
                "recent-item";

            galleryItem.dataset.index =
                index;

            const image =
                document.createElement(
                    "img"
                );

            image.src =
                item.imageUrl;

            image.alt =
                "Recent AI creation";

            image.loading =
                "lazy";

            const overlay =
                document.createElement(
                    "div"
                );

            overlay.className =
                "recent-item-overlay";

            overlay.textContent =
                item.prompt ||
                "AI image";

            galleryItem.appendChild(
                image
            );

            galleryItem.appendChild(
                overlay
            );

            galleryItem.addEventListener(
                "click",
                () => {

                    openRecentImage(
                        item
                    );
                }
            );

            recentGallery.appendChild(
                galleryItem
            );
        }
    );
}


// ==========================================
// OPEN RECENT IMAGE
// ==========================================

function openRecentImage(
    item
) {

    if (!item?.imageUrl) {

        return;
    }

    currentGeneratedImage =
        item.imageUrl;

    currentPrompt =
        item.prompt || "";

    currentImageSaved =
        Boolean(item.saved);

    if (imagePrompt) {

        imagePrompt.value =
            item.prompt || "";

        updatePromptCounter();
    }

    if (item.style) {

        selectedStyle =
            item.style;

        styleOptions.forEach(
            (button) => {

                button.classList.toggle(
                    "active",
                    button.dataset.style ===
                    item.style
                );
            }
        );
    }

    if (item.aspectRatio) {

        selectedRatio =
            item.aspectRatio;

        ratioOptions.forEach(
            (button) => {

                button.classList.toggle(
                    "active",
                    button.dataset.ratio ===
                    item.aspectRatio
                );
            }
        );
    }

    displayGeneratedImage(
        item.imageUrl
    );

    if (saveImageButton) {

        saveImageButton.innerHTML =
            item.saved
                ? "<span>♥</span> Saved"
                : "<span>♡</span> Save";
    }

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


// ==========================================
// CLEAR RECENT GALLERY
// ==========================================

function setupGalleryActions() {

    if (!clearGalleryButton) {

        return;
    }

    clearGalleryButton.addEventListener(
        "click",
        clearRecentGallery
    );
}


function clearRecentGallery() {

    const images =
        getRecentImages();

    if (images.length === 0) {

        showToast(
            "Recent creations are already empty."
        );

        return;
    }

    const confirmed =
        window.confirm(
            "Clear all recent image creations?"
        );

    if (!confirmed) {

        return;
    }

    localStorage.removeItem(
        RECENT_STORAGE_KEY
    );

    renderRecentGallery();

    showToast(
        "Recent creations cleared."
    );
}


// ==========================================
// KEYBOARD SHORTCUT
// ==========================================

function setupKeyboardShortcuts() {

    if (!imagePrompt) {

        return;
    }

    imagePrompt.addEventListener(
        "keydown",
        (event) => {

            if (
                event.ctrlKey &&
                event.key === "Enter"
            ) {

                event.preventDefault();

                generateImage();
            }
        }
    );
}


// ==========================================
// TOAST
// ==========================================

function showToast(
    message
) {

    if (!toast) {

        return;
    }

    toast.textContent =
        message;

    toast.classList.add(
        "show"
    );

    clearTimeout(
        toastTimer
    );

    toastTimer =
        setTimeout(
            () => {

                toast.classList.remove(
                    "show"
                );

            },
            3000
        );
}


// ==========================================
// DEBUG
// ==========================================

console.log(
    "EchoCall AI Image Studio loaded."
);