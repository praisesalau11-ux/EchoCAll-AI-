// ==========================================
// EchoCall AI
// File: js/image-studio.js
// Purpose: Image Studio frontend
// ==========================================
import {
    auth,
    db,
    storage
} from "./firebase.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {
    ref,
    uploadBytes,
    getDownloadURL,
    deleteObject
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-storage.js";

import {
    collection,
    addDoc,
    getDocs,
    deleteDoc,
    doc,
    query,
    where,
    orderBy,
    limit
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

// ==========================================
// API
// ==========================================

const API_BASE_URL =
    "https://echocall-ai-backend.onrender.com";

// ==========================================
// STORAGE
// ==========================================

const RECENT_STORAGE_KEY =
    "echocall_image_studio_recent";

const MAX_RECENT_IMAGES = 12;

// ==========================================
// STATE
// ==========================================

let selectedStyle = "realistic";
let selectedRatio = "1:1";
let selectedReferenceFile = null;
let currentGeneratedImage = null;
let isGenerating = false;

let cleanupFunctions = [];

// ==========================================
// INITIALIZER
// ==========================================

export async function initializeImageStudio() {

    console.log(
        "EchoCall AI → Image Studio initializing..."
    );

    // Reset state
    selectedStyle = "realistic";
    selectedRatio = "1:1";
    selectedReferenceFile = null;
    currentGeneratedImage = null;
    isGenerating = false;

    setupImageStudio();

    console.log(
        "EchoCall AI → Image Studio initialized successfully."
    );
}

// ==========================================
// MAIN SETUP
// ==========================================

function setupImageStudio() {

    console.log(
        "Image Studio → Setting up controls..."
    );

    setupPrompt();
    setupStyleButtons();
    setupRatioButtons();
    setupReferenceUpload();
    setupGenerateButton();
    setupPreviewActions();
    setupClearGallery();
    setupKeyboardShortcut();

    renderRecentGallery();

    updateSelectedStyle();
    updateSelectedRatio();
    updatePromptCounter();
    updateGenerateButton();

    console.log(
        "Image Studio → Controls ready."
    );
}

// ==========================================
// DOM HELPERS
// ==========================================

function getElement(id) {
    return document.getElementById(id);
}

// ==========================================
// PROMPT
// ==========================================

function setupPrompt() {

    const prompt =
        getElement("imagePrompt");

    if (!prompt) {

        console.error(
            "Image Studio → #imagePrompt not found."
        );

        return;
    }

    const handler = () => {

        updatePromptCounter();
        updateGenerateButton();
    };

    prompt.addEventListener(
        "input",
        handler
    );

    cleanupFunctions.push(() => {

        prompt.removeEventListener(
            "input",
            handler
        );
    });
}

// ==========================================
// PROMPT COUNTER
// ==========================================

function updatePromptCounter() {

    const prompt =
        getElement("imagePrompt");

    const counter =
        getElement("promptCounter");

    if (!prompt || !counter) {
        return;
    }

    const length =
        prompt.value.length;

    counter.textContent =
        `${length} / 2000`;
}

// ==========================================
// STYLE BUTTONS
// ==========================================

function setupStyleButtons() {

    const buttons =
        document.querySelectorAll(
            "[data-style]"
        );

    buttons.forEach(button => {

        const handler = (event) => {

            event.preventDefault();

            const style =
                button.dataset.style;

            if (!style) {
                return;
            }

            selectedStyle =
                style;

            updateSelectedStyle();

            console.log(
                "Image Studio → Style:",
                selectedStyle
            );
        };

        button.addEventListener(
            "click",
            handler
        );

        cleanupFunctions.push(() => {

            button.removeEventListener(
                "click",
                handler
            );
        });
    });
}

// ==========================================
// UPDATE STYLE
// ==========================================

function updateSelectedStyle() {

    const buttons =
        document.querySelectorAll(
            "[data-style]"
        );

    buttons.forEach(button => {

        const active =
            button.dataset.style ===
            selectedStyle;

        button.classList.toggle(
            "active",
            active
        );

        button.setAttribute(
            "aria-pressed",
            active
                ? "true"
                : "false"
        );
    });
}

// ==========================================
// RATIO BUTTONS
// ==========================================

function setupRatioButtons() {

    const buttons =
        document.querySelectorAll(
            "[data-ratio]"
        );

    buttons.forEach(button => {

        const handler = (event) => {

            event.preventDefault();

            const ratio =
                button.dataset.ratio;

            if (!ratio) {
                return;
            }

            selectedRatio =
                ratio;

            updateSelectedRatio();

            console.log(
                "Image Studio → Aspect ratio:",
                selectedRatio
            );
        };

        button.addEventListener(
            "click",
            handler
        );

        cleanupFunctions.push(() => {

            button.removeEventListener(
                "click",
                handler
            );
        });
    });
}

// ==========================================
// UPDATE RATIO
// ==========================================

function updateSelectedRatio() {

    const buttons =
        document.querySelectorAll(
            "[data-ratio]"
        );

    buttons.forEach(button => {

        const active =
            button.dataset.ratio ===
            selectedRatio;

        button.classList.toggle(
            "active",
            active
        );

        button.setAttribute(
            "aria-pressed",
            active
                ? "true"
                : "false"
        );
    });
}

// ==========================================
// GENERATE BUTTON STATE
// ==========================================

function updateGenerateButton() {

    const button =
        getElement("generateImage");

    const prompt =
        getElement("imagePrompt");

    if (!button || !prompt) {
        return;
    }

    const hasPrompt =
        prompt.value.trim().length > 0;

    button.disabled =
        isGenerating ||
        !hasPrompt;
}

// ==========================================
// REFERENCE IMAGE UPLOAD
// ==========================================

function setupReferenceUpload() {

    const input =
        getElement("referenceImage");

    const removeButton =
        getElement("removeReference");

    if (!input) {

        console.error(
            "Image Studio → #referenceImage not found."
        );

        return;
    }

    // ------------------------------------------
    // File selected
    // ------------------------------------------

    const changeHandler = () => {

        const file =
            input.files?.[0];

        if (!file) {
            return;
        }

        handleReferenceFile(file);
    };

    input.addEventListener(
        "change",
        changeHandler
    );

    cleanupFunctions.push(() => {

        input.removeEventListener(
            "change",
            changeHandler
        );
    });

    // ------------------------------------------
    // Remove reference
    // ------------------------------------------

    if (removeButton) {

        const removeHandler = (event) => {

            event.preventDefault();
            event.stopPropagation();

            clearReferenceImage();
        };

        removeButton.addEventListener(
            "click",
            removeHandler
        );

        cleanupFunctions.push(() => {

            removeButton.removeEventListener(
                "click",
                removeHandler
            );
        });
    }
}

// ==========================================
// HANDLE REFERENCE FILE
// ==========================================

function handleReferenceFile(file) {

    // ------------------------------------------
    // Validate file type
    // ------------------------------------------

    if (!file.type.startsWith("image/")) {

        showToast(
            "Please select an image file.",
            "error"
        );

        return;
    }

    // ------------------------------------------
    // Validate file size
    // ------------------------------------------

    const maxSize =
        10 * 1024 * 1024;

    if (file.size > maxSize) {

        showToast(
            "Reference image must be 10 MB or smaller.",
            "error"
        );

        return;
    }

    selectedReferenceFile =
        file;

    // ------------------------------------------
    // Preview
    // ------------------------------------------

    const previewImage =
        getElement("referencePreviewImage");

    const preview =
        getElement("referencePreview");

    const empty =
        getElement("referenceEmpty");

    const fileName =
        getElement("referenceFileName");

    if (
        !previewImage ||
        !preview ||
        !empty
    ) {
        return;
    }

    const objectUrl =
        URL.createObjectURL(file);

    previewImage.src =
        objectUrl;

    previewImage.onload = () => {

        URL.revokeObjectURL(
            objectUrl
        );
    };

    if (fileName) {

        fileName.textContent =
            file.name;
    }

    empty.hidden =
        true;

    preview.hidden =
        false;

    showToast(
        "Reference image added.",
        "success"
    );

    console.log(
        "Image Studio → Reference image selected:",
        file.name
    );
}

// ==========================================
// CLEAR REFERENCE IMAGE
// ==========================================

function clearReferenceImage() {

    const input =
        getElement("referenceImage");

    const preview =
        getElement("referencePreview");

    const empty =
        getElement("referenceEmpty");

    const previewImage =
        getElement("referencePreviewImage");

    const fileName =
        getElement("referenceFileName");

    selectedReferenceFile =
        null;

    if (input) {
        input.value = "";
    }

    if (previewImage) {
        previewImage.removeAttribute("src");
    }

    if (fileName) {
        fileName.textContent =
            "Reference image";
    }

    if (preview) {
        preview.hidden = true;
    }

    if (empty) {
        empty.hidden = false;
    }

    console.log(
        "Image Studio → Reference image removed."
    );
}

// ==========================================
// GENERATE BUTTON
// ==========================================

function setupGenerateButton() {

    const button =
        getElement("generateImage");

    if (!button) {

        console.error(
            "Image Studio → #generateImage not found."
        );

        return;
    }

    const handler = async (event) => {

        event.preventDefault();

        await generateImage();
    };

    button.addEventListener(
        "click",
        handler
    );

    cleanupFunctions.push(() => {

        button.removeEventListener(
            "click",
            handler
        );
    });

    console.log(
        "Image Studio → Generate button found."
    );
}

// ==========================================
// GENERATE IMAGE
// ==========================================

async function generateImage() {

    if (isGenerating) {
        return;
    }

    const promptInput =
        getElement("imagePrompt");

    if (!promptInput) {
        return;
    }

    const prompt =
        promptInput.value.trim();

    // ------------------------------------------
    // Validate prompt
    // ------------------------------------------

    if (!prompt) {

        showToast(
            "Enter a description for your image.",
            "error"
        );

        promptInput.focus();

        return;
    }

    if (prompt.length < 3) {

        showToast(
            "Please provide a more detailed prompt.",
            "error"
        );

        promptInput.focus();

        return;
    }

    // ------------------------------------------
    // Authentication
    // ------------------------------------------

    const user =
        await getCurrentUser();

    if (!user) {

        showToast(
            "Please sign in before generating an image.",
            "error"
        );

        return;
    }

    // ------------------------------------------
    // Start generation
    // ------------------------------------------

    isGenerating =
        true;

    updateGenerateButton();

    showGenerationLoading();

    setGenerationStatus(
        "Preparing your image..."
    );

    try {

        console.log(
            "Image Studio → Starting generation."
        );

        console.log(
            "Image Studio → Style:",
            selectedStyle
        );

        console.log(
            "Image Studio → Ratio:",
            selectedRatio
        );

        // --------------------------------------
        // Firebase ID token
        // --------------------------------------

        const token =
            await user.getIdToken();

        // --------------------------------------
        // FormData
        // --------------------------------------

        const formData =
            new FormData();

        formData.append(
            "prompt",
            prompt
        );

        formData.append(
            "style",
            selectedStyle
        );

        /*
         * Stability's Core model supports
         * several standard aspect ratios.
         *
         * Your HTML contains 4:3.
         * For the current backend we map
         * 4:3 to the closest supported 3:2.
         */
        const backendRatio =
            selectedRatio === "4:3"
                ? "3:2"
                : selectedRatio;

        formData.append(
            "aspectRatio",
            backendRatio
        );

        // --------------------------------------
        // Reference image
        // --------------------------------------

        if (selectedReferenceFile) {

            formData.append(
                "referenceImage",
                selectedReferenceFile,
                selectedReferenceFile.name
            );

            formData.append(
                "referenceStrength",
                "0.7"
            );
        }

        setGenerationStatus(
            "Sending your request..."
        );

        // --------------------------------------
        // API request
        // --------------------------------------

        const response =
            await fetch(
                `${API_BASE_URL}/api/ai/generate-image`,
                {
                    method: "POST",

                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    },

                    /*
                     * IMPORTANT:
                     *
                     * Do NOT set Content-Type here.
                     *
                     * Because we are sending FormData,
                     * the browser automatically creates
                     * the correct multipart boundary.
                     */
                    body: formData
                }
            );

        setGenerationStatus(
            "Processing the generated image..."
        );

        // --------------------------------------
        // Parse response safely
        // --------------------------------------

        let result;

        try {

            result =
                await response.json();

        } catch (jsonError) {

            throw new Error(
                `Server returned an invalid response (${response.status}).`
            );
        }

        // --------------------------------------
        // Handle HTTP errors
        // --------------------------------------

        if (!response.ok) {

            throw new Error(
                result?.message ||
                `Image generation failed (${response.status}).`
            );
        }

        // --------------------------------------
        // Validate result
        // --------------------------------------

        if (
            !result ||
            !result.success ||
            !result.imageUrl
        ) {

            throw new Error(
                result?.message ||
                "The server did not return a generated image."
            );
        }

        // --------------------------------------
        // Display result
        // --------------------------------------

        currentGeneratedImage =
            result.imageUrl;

        displayGeneratedImage(
            result.imageUrl
        );

        setGenerationStatus(
            "Image created successfully."
        );

        // --------------------------------------
        // Add to recent creations
        // --------------------------------------
        showToast(
            "Image generated successfully.",
            "success"
        );

        console.log(
            "Image Studio → Image generated successfully."
        );

    } catch (error) {

        console.error(
            "Image Studio → Generation error:",
            error
        );

        hideGenerationLoading();

        setGenerationStatus(
            error?.message ||
            "Image generation failed."
        );

        showToast(
            error?.message ||
            "Image generation failed.",
            "error"
        );

    } finally {

        isGenerating =
            false;

        updateGenerateButton();

        /*
         * Only remove the loading screen if
         * generation did not leave a valid image.
         */
        if (!currentGeneratedImage) {
            hideGenerationLoading();
        }
    }
}

// ==========================================
// GET CURRENT FIREBASE USER
// ==========================================

async function getCurrentUser() {

    if (auth.currentUser) {
        return auth.currentUser;
    }

    return new Promise(resolve => {

        let unsubscribe;

        unsubscribe =
            onAuthStateChanged(
                auth,
                user => {

                    if (unsubscribe) {
                        unsubscribe();
                    }

                    resolve(user || null);
                }
            );
    });
}

// ==========================================
// PREVIEW DISPLAY
// ==========================================

function displayGeneratedImage(imageUrl) {

    const image =
        getElement("generatedImage");

    const empty =
        getElement("emptyPreview");

    const loading =
        getElement("loadingPreview");

    const actions =
        getElement("previewActions");

    if (!image) {

        console.error(
            "Image Studio → #generatedImage not found."
        );

        return;
    }

    // ------------------------------------------
    // Set image
    // ------------------------------------------

    image.src =
        imageUrl;

    image.hidden =
        false;

    // ------------------------------------------
    // Hide empty/loading states
    // ------------------------------------------

    if (empty) {
        empty.hidden = true;
    }

    if (loading) {
        loading.hidden = true;
    }

    // ------------------------------------------
    // Show action buttons
    // ------------------------------------------

    if (actions) {
        actions.hidden = false;
    }

    image.onload = () => {

        console.log(
            "Image Studio → Generated image loaded."
        );
    };

    image.onerror = () => {

        console.error(
            "Image Studio → Generated image could not be displayed."
        );

        showToast(
            "The generated image could not be displayed.",
            "error"
        );
    };
}

// ==========================================
// SHOW GENERATION LOADING
// ==========================================

function showGenerationLoading() {

    const empty =
        getElement("emptyPreview");

    const loading =
        getElement("loadingPreview");

    const image =
        getElement("generatedImage");

    const actions =
        getElement("previewActions");

    if (empty) {
        empty.hidden = true;
    }

    if (image) {

        image.hidden = true;

        /*
         * Clear the old image while a new one
         * is being generated.
         */
        image.removeAttribute("src");
    }

    if (actions) {
        actions.hidden = true;
    }

    if (loading) {
        loading.hidden = false;
    }
}

// ==========================================
// HIDE GENERATION LOADING
// ==========================================

function hideGenerationLoading() {

    const loading =
        getElement("loadingPreview");

    if (loading) {
        loading.hidden = true;
    }
}

// ==========================================
// PREVIEW ACTIONS
// ==========================================

function setupPreviewActions() {

    const downloadButton =
        getElement("downloadImage");

    const saveButton =
        getElement("saveImage");

    const newButton =
        getElement("newImage");

    // ------------------------------------------
    // Download
    // ------------------------------------------

    if (downloadButton) {

        const handler = async (event) => {

            event.preventDefault();

            await downloadCurrentImage();
        };

        downloadButton.addEventListener(
            "click",
            handler
        );

        cleanupFunctions.push(() => {

            downloadButton.removeEventListener(
                "click",
                handler
            );
        });
    }

    // ------------------------------------------
    // Save
    // ------------------------------------------

    if (saveButton) {

        const handler = async event => {
    event.preventDefault();
    await saveCurrentImage();
};

        saveButton.addEventListener(
            "click",
            handler
        );

        cleanupFunctions.push(() => {

            saveButton.removeEventListener(
                "click",
                handler
            );
        });
    }

    // ------------------------------------------
    // New image
    // ------------------------------------------

    if (newButton) {

        const handler = event => {

            event.preventDefault();

            startNewImage();
        };

        newButton.addEventListener(
            "click",
            handler
        );

        cleanupFunctions.push(() => {

            newButton.removeEventListener(
                "click",
                handler
            );
        });
    }
}

// ==========================================
// DOWNLOAD CURRENT IMAGE
// ==========================================

async function downloadCurrentImage() {

    if (!currentGeneratedImage) {

        showToast(
            "There is no generated image to download.",
            "error"
        );

        return;
    }

    try {

        showToast(
            "Preparing download...",
            "info"
        );

        /*
         * Fetching the data URL also keeps this
         * working with the backend's base64
         * response.
         */

        const response =
            await fetch(
                currentGeneratedImage
            );

        if (!response.ok) {

            throw new Error(
                "Unable to prepare image download."
            );
        }

        const blob =
            await response.blob();

        const blobUrl =
            URL.createObjectURL(blob);

        const link =
            document.createElement("a");

        link.href =
            blobUrl;

        link.download =
            `echocall-ai-${getTimestamp()}.png`;

        document.body.appendChild(link);

        link.click();

        link.remove();

        setTimeout(() => {

            URL.revokeObjectURL(
                blobUrl
            );

        }, 1000);

        showToast(
            "Image download started.",
            "success"
        );

    } catch (error) {

        console.error(
            "Image Studio → Download error:",
            error
        );

        /*
         * Fallback for browsers that block
         * fetching a data URL.
         */

        try {

            const link =
                document.createElement("a");

            link.href =
                currentGeneratedImage;

            link.download =
                `echocall-ai-${getTimestamp()}.png`;

            link.target =
                "_blank";

            document.body.appendChild(link);

            link.click();

            link.remove();

        } catch (fallbackError) {

            console.error(
                "Image Studio → Download fallback failed:",
                fallbackError
            );

            showToast(
                "Unable to download the image.",
                "error"
            );
        }
    }
}

// ==========================================
// SAVE CURRENT IMAGE
// ==========================================

async function saveCurrentImage() {

    if (
        !currentGeneratedImage
    ) {

        showToast(
            "Generate an image first.",
            "error"
        );

        return;
    }

    const saveButton =
        getElement("saveImage");

    if (saveButton) {
        saveButton.disabled = true;
    }

    const prompt =
        getElement(
            "imagePrompt"
        )?.value.trim() ||
        "Generated image";

    try {

        const saved =
            await saveImageToFirebase({

                imageUrl:
                    currentGeneratedImage,

                prompt,

                style:
                    selectedStyle,

                ratio:
                    selectedRatio
            });

        if (saved) {

            updateSaveButtonState(
                true
            );

            await renderRecentGallery();
        }

    } finally {

        if (saveButton) {
            saveButton.disabled = false;
        }
    }
}

// ==========================================
// FIREBASE IMAGE STORAGE
// ==========================================

const IMAGE_COLLECTION = "generatedImages";

// ==========================================
// SAVE IMAGE TO FIREBASE
// ==========================================

async function saveImageToFirebase(imageData) {

    const user = await getCurrentUser();

    if (!user) {

        showToast(
            "Please sign in before saving images.",
            "error"
        );

        return null;
    }

    if (
        !imageData ||
        !imageData.imageUrl
    ) {

        showToast(
            "There is no image to save.",
            "error"
        );

        return null;
    }

    try {

        showToast(
            "Saving image...",
            "info"
        );

        // --------------------------------------
        // Convert data URL to Blob
        // --------------------------------------

        const blob =
            await dataUrlToBlob(
                imageData.imageUrl
            );

        // --------------------------------------
        // Create unique Firebase Storage path
        // --------------------------------------

        const imageId =
            generateId();

        const storagePath =
            `users/${user.uid}/image-studio/${imageId}.png`;

        const storageReference =
            ref(
                storage,
                storagePath
            );

        // --------------------------------------
        // Upload image
        // --------------------------------------

        await uploadBytes(
            storageReference,
            blob,
            {
                contentType:
                    blob.type || "image/png"
            }
        );

        // --------------------------------------
        // Get permanent download URL
        // --------------------------------------

        const downloadURL =
            await getDownloadURL(
                storageReference
            );

        // --------------------------------------
        // Save metadata to Firestore
        // --------------------------------------

        const documentData = {

            userId:
                user.uid,

            imageUrl:
                downloadURL,

            storagePath,

            prompt:
                imageData.prompt ||
                "Generated image",

            style:
                imageData.style ||
                "realistic",

            ratio:
                imageData.ratio ||
                "1:1",

            createdAt:
                new Date().toISOString(),

            createdAtTimestamp:
                new Date()
        };

        const documentReference =
            await addDoc(
                collection(
                    db,
                    IMAGE_COLLECTION
                ),
                documentData
            );

        console.log(
            "Image Studio → Image saved:",
            documentReference.id
        );

        showToast(
            "Image saved successfully.",
            "success"
        );

        return {
            id:
                documentReference.id,

            ...documentData
        };

    } catch (error) {

        console.error(
            "Image Studio → Firebase save error:",
            error
        );

        showToast(
            getFirebaseErrorMessage(error),
            "error"
        );

        return null;
    }
}

// ==========================================
// DATA URL → BLOB
// ==========================================

async function dataUrlToBlob(dataUrl) {

    if (!dataUrl) {

        throw new Error(
            "Image data is missing."
        );
    }

    // --------------------------------------
    // Normal data URL
    // --------------------------------------

    if (
        dataUrl.startsWith(
            "data:"
        )
    ) {

        const response =
            await fetch(dataUrl);

        return await response.blob();
    }

    // --------------------------------------
    // Normal URL fallback
    // --------------------------------------

    const response =
        await fetch(dataUrl);

    if (!response.ok) {

        throw new Error(
            "Could not download generated image for saving."
        );
    }

    return await response.blob();
}

// ==========================================
// LOAD RECENT IMAGES FROM FIRESTORE
// ==========================================

async function getRecentImages() {

    const user = await getCurrentUser();

    if (!user) {
        return [];
    }

    try {

        const imagesReference = collection(
            db,
            IMAGE_COLLECTION
        );

        const imagesQuery = query(
            imagesReference,
            where("userId", "==", user.uid),
            orderBy("createdAtTimestamp", "desc"),
            limit(MAX_RECENT_IMAGES)
        );

        const snapshot = await getDocs(
            imagesQuery
        );

        const images = [];

        snapshot.forEach(documentSnapshot => {

            const data =
                documentSnapshot.data();

            images.push({
                id: documentSnapshot.id,
                ...data
            });

        });

        return images;

    } catch (error) {

        console.error(
            "Image Studio → Could not load Firebase gallery:",
            error
        );

        console.error(
            "Firebase error code:",
            error?.code
        );

        console.error(
            "Firebase error message:",
            error?.message
        );

        showToast(
            getFirebaseErrorMessage(error),
            "error"
        );

        return [];
    }
}


// ==========================================
// RENDER FIREBASE GALLERY
// ==========================================

async function renderRecentGallery() {

    const gallery =
        getElement("recentGallery");

    if (!gallery) {

        console.error(
            "Image Studio → #recentGallery not found."
        );

        return;
    }

    // --------------------------------------
    // Loading state
    // --------------------------------------

    gallery.innerHTML = "";

    const loading =
        document.createElement("div");

    loading.className =
        "recent-empty";

    loading.textContent =
        "Loading recent creations...";

    gallery.appendChild(
        loading
    );

    // --------------------------------------
    // Get Firebase images
    // --------------------------------------

    const recent =
        await getRecentImages();

    gallery.innerHTML = "";

    // --------------------------------------
    // Empty state
    // --------------------------------------

    if (
        recent.length === 0
    ) {

        const empty =
            document.createElement("div");

        empty.className =
            "recent-empty";

        empty.textContent =
            "No saved creations yet.";

        gallery.appendChild(
            empty
        );

        updateSaveButtonState();

        return;
    }

    // --------------------------------------
    // Render cards
    // --------------------------------------

    recent.forEach(
        item => {

            const card =
                createRecentCard(
                    item
                );

            gallery.appendChild(
                card
            );
        }
    );

    updateSaveButtonState();
}

// ==========================================
// CREATE RECENT IMAGE CARD
// ==========================================

function createRecentCard(item) {

    const card = document.createElement("div");

    card.className = "recent-card";

    card.dataset.imageId = item.id || "";

    const image = document.createElement("img");

    image.className = "recent-card-image";

    image.alt = item.prompt || "Saved AI image";

    image.loading = "lazy";

    // Firebase saves the image URL as imageUrl
    image.src = item.imageUrl || "";

    // Open the image when clicked
    card.addEventListener("click", () => {
        openRecentImage(item);
    });

    card.appendChild(image);

    return card;
}

// ==========================================
// OPEN RECENT IMAGE
// ==========================================

function openRecentImage(item) {

    if (
        !item ||
        !item.imageUrl
    ) {
        return;
    }

    currentGeneratedImage =
        item.imageUrl;

    displayGeneratedImage(
        item.imageUrl
    );

    const prompt =
        getElement("imagePrompt");

    if (prompt && item.prompt) {

        prompt.value =
            item.prompt;

        updatePromptCounter();
    }

    if (item.style) {

        selectedStyle =
            item.style;

        updateSelectedStyle();
    }

    if (item.ratio) {

        selectedRatio =
            item.ratio;

        updateSelectedRatio();
    }

    updateGenerateButton();
    updateSaveButtonState();

    showToast(
        "Image opened.",
        "info"
    );
}

// ==========================================
// DELETE FIREBASE IMAGE
// ==========================================

async function deleteRecentImage(
    imageId
) {

    if (!imageId) {
        return;
    }

    const confirmed =
        window.confirm(
            "Delete this saved image?"
        );

    if (!confirmed) {
        return;
    }

    try {

        const user =
            await getCurrentUser();

        if (!user) {

            showToast(
                "Please sign in.",
                "error"
            );

            return;
        }

        // --------------------------------------
        // Find image before deleting it
        // --------------------------------------

        const recent =
            await getRecentImages();

        const image =
            recent.find(
                item =>
                    item.id ===
                    imageId
            );

        if (!image) {

            showToast(
                "Image could not be found.",
                "error"
            );

            return;
        }

        // --------------------------------------
        // Delete Storage file
        // --------------------------------------

        if (image.storagePath) {

            try {

                const storageReference =
                    ref(
                        storage,
                        image.storagePath
                    );

                await deleteObject(
                    storageReference
                );

            } catch (storageError) {

                console.warn(
                    "Image Studio → Storage deletion warning:",
                    storageError
                );
            }
        }

        // --------------------------------------
        // Delete Firestore document
        // --------------------------------------

        await deleteDoc(
            doc(
                db,
                IMAGE_COLLECTION,
                imageId
            )
        );

        // --------------------------------------
        // Refresh gallery
        // --------------------------------------

        await renderRecentGallery();

        updateSaveButtonState();

        showToast(
            "Image deleted.",
            "success"
        );

    } catch (error) {

        console.error(
            "Image Studio → Delete error:",
            error
        );

        showToast(
            "Could not delete the image.",
            "error"
        );
    }
}

// ==========================================
// UPDATE SAVE BUTTON STATE
// ==========================================

async function updateSaveButtonState(
    forceSaved = false
) {

    const button =
        getElement("saveImage");

    if (!button) {
        return;
    }

    let saved =
        Boolean(forceSaved);

    if (
        !saved &&
        currentGeneratedImage
    ) {

        const recent =
            await getRecentImages();

        saved =
            recent.some(
                item =>
                    item.imageUrl ===
                    currentGeneratedImage
            );
    }

    button.classList.toggle(
        "saved",
        saved
    );

    const icon =
        button.querySelector("span");

    if (icon) {

        icon.textContent =
            saved
                ? "♥"
                : "♡";
    }
}

// ==========================================
// START NEW IMAGE
// ==========================================

function startNewImage() {

    const prompt =
        getElement("imagePrompt");

    const generatedImage =
        getElement("generatedImage");

    const actions =
        getElement("previewActions");

    const empty =
        getElement("emptyPreview");

    const loading =
        getElement("loadingPreview");

    // ------------------------------------------
    // Reset prompt
    // ------------------------------------------

    if (prompt) {
        prompt.value = "";
    }

    updatePromptCounter();

    // ------------------------------------------
    // Reset generated image
    // ------------------------------------------

    currentGeneratedImage =
        null;

    if (generatedImage) {

        generatedImage.hidden =
            true;

        generatedImage.removeAttribute(
            "src"
        );
    }

    if (actions) {
        actions.hidden = true;
    }

    if (loading) {
        loading.hidden = true;
    }

    if (empty) {
        empty.hidden = false;
    }

    // ------------------------------------------
    // Reset reference
    // ------------------------------------------

    clearReferenceImage();

    // ------------------------------------------
    // Reset status
    // ------------------------------------------

    setGenerationStatus("");

    updateGenerateButton();

    updateSaveButtonState();

    if (prompt) {
        prompt.focus();
    }

    showToast(
        "Ready for a new image.",
        "info"
    );
}

// ==========================================
// CLEAR GALLERY
// ==========================================

function setupClearGallery() {

    const button =
        getElement("clearGallery");

    if (!button) {

        console.error(
            "Image Studio → #clearGallery not found."
        );

        return;
    }

    const handler = event => {

        event.preventDefault();

        clearRecentGallery();
    };

    button.addEventListener(
        "click",
        handler
    );

    cleanupFunctions.push(() => {

        button.removeEventListener(
            "click",
            handler
        );
    });
}

// ==========================================
// CLEAR FIREBASE GALLERY
// ==========================================

async function clearRecentGallery() {

    const confirmed =
        window.confirm(
            "Delete all your saved Image Studio creations?"
        );

    if (!confirmed) {
        return;
    }

    try {

        const user =
            await getCurrentUser();

        if (!user) {

            showToast(
                "Please sign in.",
                "error"
            );

            return;
        }

        const recent =
            await getRecentImages();

        if (
            recent.length === 0
        ) {

            showToast(
                "There are no saved creations.",
                "info"
            );

            return;
        }

        showToast(
            "Deleting saved images...",
            "info"
        );

        // --------------------------------------
        // Delete each image
        // --------------------------------------

        for (
            const image of recent
        ) {

            // Delete Storage file
            if (
                image.storagePath
            ) {

                try {

                    await deleteObject(
                        ref(
                            storage,
                            image.storagePath
                        )
                    );

                } catch (storageError) {

                    console.warn(
                        "Storage delete warning:",
                        storageError
                    );
                }
            }

            // Delete Firestore document
            await deleteDoc(
                doc(
                    db,
                    IMAGE_COLLECTION,
                    image.id
                )
            );
        }

        await renderRecentGallery();

        updateSaveButtonState();

        showToast(
            "All saved creations deleted.",
            "success"
        );

    } catch (error) {

        console.error(
            "Image Studio → Clear gallery error:",
            error
        );

        showToast(
            "Could not clear the gallery.",
            "error"
        );
    }
}

// ==========================================
// KEYBOARD SHORTCUT
// ==========================================

function setupKeyboardShortcut() {

    const handler = event => {

        /*
         * Ctrl + Enter on desktop
         * or Meta + Enter on Mac.
         */

        if (
            event.key === "Enter" &&
            (event.ctrlKey || event.metaKey)
        ) {

            const prompt =
                getElement("imagePrompt");

            /*
             * Only trigger when the prompt
             * textarea is the active element.
             */

            if (
                prompt &&
                document.activeElement === prompt
            ) {

                event.preventDefault();

                generateImage();
            }
        }
    };

    document.addEventListener(
        "keydown",
        handler
    );

    cleanupFunctions.push(() => {

        document.removeEventListener(
            "keydown",
            handler
        );
    });
}

// ==========================================
// GENERATION STATUS
// ==========================================

function setGenerationStatus(message) {

    const status =
        getElement("generationStatus");

    if (!status) {
        return;
    }

    status.textContent =
        message || "";

    status.classList.toggle(
        "visible",
        Boolean(message)
    );
}

// ==========================================
// TOAST
// ==========================================

let toastTimer = null;

function showToast(
    message,
    type = "info"
) {

    const toast =
        getElement("toast");

    if (!toast) {

        console.log(
            `Image Studio Toast [${type}]:`,
            message
        );

        return;
    }

    // ------------------------------------------
    // Clear previous timer
    // ------------------------------------------

    if (toastTimer) {

        clearTimeout(
            toastTimer
        );

        toastTimer =
            null;
    }

    // ------------------------------------------
    // Set message
    // ------------------------------------------

    toast.textContent =
        message || "";

    // ------------------------------------------
    // Reset classes
    // ------------------------------------------

    toast.classList.remove(
        "show",
        "success",
        "error",
        "info"
    );

    toast.classList.add(
        type
    );

    // Force browser to recognize the
    // class change before showing it.
    void toast.offsetWidth;

    toast.classList.add(
        "show"
    );

    // ------------------------------------------
    // Hide automatically
    // ------------------------------------------

    toastTimer =
        setTimeout(() => {

            toast.classList.remove(
                "show"
            );

        }, 3500);
}

// ==========================================
// UTILITY: GENERATE ID
// ==========================================

function generateId() {

    if (
        typeof crypto !== "undefined" &&
        crypto.randomUUID
    ) {

        return crypto.randomUUID();
    }

    return (
        Date.now().toString(36) +
        "-" +
        Math.random()
            .toString(36)
            .slice(2, 10)
    );
}

// ==========================================
// UTILITY: TIMESTAMP
// ==========================================

function getTimestamp() {

    const now =
        new Date();

    const year =
        now.getFullYear();

    const month =
        String(
            now.getMonth() + 1
        ).padStart(2, "0");

    const day =
        String(
            now.getDate()
        ).padStart(2, "0");

    const hours =
        String(
            now.getHours()
        ).padStart(2, "0");

    const minutes =
        String(
            now.getMinutes()
        ).padStart(2, "0");

    const seconds =
        String(
            now.getSeconds()
        ).padStart(2, "0");

    return (
        `${year}-${month}-${day}` +
        `-${hours}-${minutes}-${seconds}`
    );
}

// ==========================================
// UTILITY: TRUNCATE TEXT
// ==========================================

function truncateText(
    text,
    maxLength = 70
) {

    if (!text) {
        return "";
    }

    const value =
        String(text);

    if (
        value.length <= maxLength
    ) {
        return value;
    }

    return (
        value.slice(
            0,
            maxLength - 1
        ) + "…"
    );
}

// ==========================================
// UTILITY: FORMAT STYLE
// ==========================================

function formatStyle(style) {

    if (!style) {
        return "Realistic";
    }

    const labels = {

        "realistic":
            "Realistic",

        "cinematic":
            "Cinematic",

        "digital-art":
            "Digital Art",

        "anime":
            "Anime",

        "3d":
            "3D",

        "illustration":
            "Illustration",

        "fantasy":
            "Fantasy"
    };

    return (
        labels[style] ||
        style
            .replaceAll(
                "-",
                " "
            )
            .replace(
                /\b\w/g,
                character =>
                    character.toUpperCase()
            )
    );
}

// ==========================================
// ROUTER CLEANUP
// ==========================================

export function cleanupImageStudio() {

    console.log(
        "Image Studio → Cleaning up..."
    );

    cleanupFunctions.forEach(
        cleanup => {

            try {

                cleanup();

            } catch (error) {

                console.error(
                    "Image Studio → Cleanup error:",
                    error
                );
            }
        }
    );

    cleanupFunctions = [];

    if (toastTimer) {

        clearTimeout(
            toastTimer
        );

        toastTimer =
            null;
    }

    selectedReferenceFile =
        null;

    currentGeneratedImage =
        null;

    isGenerating =
        false;

    console.log(
        "Image Studio → Cleanup complete."
    );
}

// ==========================================
// ROUTER COMPATIBILITY
// ==========================================

/*
 * The router looks for:
 *
 * initializeImageStudio
 *
 * That function is exported at the top
 * of this module.
 *
 * This file intentionally does NOT use
 * DOMContentLoaded because the EchoCall
 * router injects the page dynamically.
 */

// ==========================================
// FINAL DEBUG MESSAGE
// ==========================================

console.log(
    "EchoCall AI → image-studio.js module loaded."
);