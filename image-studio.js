// ==========================================
// EchoCall AI - Image Studio
// ==========================================

export function initializeImageStudio() {

    console.log("Image Studio initialized");


    // ==========================================
    // DOM
    // ==========================================

    const prompt =
        document.getElementById("imagePrompt");

    const promptCounter =
        document.getElementById("promptCounter");

    const clearPrompt =
        document.getElementById("clearPrompt");

    const style =
        document.getElementById("imageStyle");

    const referenceImage =
        document.getElementById("referenceImage");

    const referencePreview =
        document.getElementById("referencePreview");

    const generateButton =
        document.getElementById("generateImage");

    const generateText =
        document.getElementById("generateText");

    const imagePreview =
        document.getElementById("imagePreview");

    const emptyPreview =
        document.getElementById("emptyPreview");

    const loadingPreview =
        document.getElementById("loadingPreview");

    const generatedImage =
        document.getElementById("generatedImage");

    const imageActions =
        document.getElementById("imageActions");

    const downloadImage =
        document.getElementById("downloadImage");

    const saveImage =
        document.getElementById("saveImage");

    const newImage =
        document.getElementById("newImage");

    const recentGallery =
        document.getElementById("recentGallery");

    const clearGallery =
        document.getElementById("clearGallery");

    const generationStatus =
        document.getElementById("generationStatus");


    // ==========================================
    // SELECTED RATIO
    // ==========================================

    let selectedRatio = "1:1";


    document
        .querySelectorAll(".ratio-option")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    document
                        .querySelectorAll(".ratio-option")
                        .forEach(item => {
                            item.classList.remove("active");
                        });

                    button.classList.add("active");

                    selectedRatio =
                        button.dataset.ratio;

                }
            );

        });


    // ==========================================
    // PROMPT COUNTER
    // ==========================================

    prompt?.addEventListener(
        "input",
        () => {

            if (promptCounter) {

                promptCounter.textContent =
                    `${prompt.value.length} / 2000`;

            }

        }
    );


    // ==========================================
    // CLEAR PROMPT
    // ==========================================

    clearPrompt?.addEventListener(
        "click",
        () => {

            prompt.value = "";

            prompt.dispatchEvent(
                new Event("input")
            );

            prompt.focus();

        }
    );


    // ==========================================
    // REFERENCE IMAGE
    // ==========================================

    referenceImage?.addEventListener(
        "change",
        () => {

            const file =
                referenceImage.files?.[0];

            if (!file) {

                referencePreview.innerHTML = "";

                referencePreview.classList.add(
                    "hidden"
                );

                return;
            }


            if (!file.type.startsWith("image/")) {

                referenceImage.value = "";

                return;
            }


            const reader =
                new FileReader();


            reader.onload = (event) => {

                referencePreview.innerHTML = `
                    <img
                        src="${event.target.result}"
                        alt="Reference image"
                    >
                `;

                referencePreview.classList.remove(
                    "hidden"
                );

            };


            reader.readAsDataURL(file);

        }
    );


    // ==========================================
    // GENERATE IMAGE
    // ==========================================

    generateButton?.addEventListener(
        "click",
        async () => {

            const imagePrompt =
                prompt.value.trim();


            if (!imagePrompt) {

                showImageStudioToast(
                    "Describe the image you want to create.",
                    "warning"
                );

                prompt.focus();

                return;
            }


            try {

                generateButton.disabled =
                    true;

                generateText.textContent =
                    "Creating...";

                generationStatus.textContent =
                    "Generating";

                generationStatus.style.color =
                    "#facc15";


                emptyPreview.classList.add(
                    "hidden"
                );

                generatedImage.classList.add(
                    "hidden"
                );

                imageActions.classList.add(
                    "hidden"
                );

                loadingPreview.classList.remove(
                    "hidden"
                );


                /*
                 * ==================================
                 * AI GENERATION BACKEND
                 * ==================================
                 *
                 * We will connect this to the
                 * EchoCall AI image-generation
                 * endpoint next.
                 */

                const response =
                    await fetch(
                        "https://echocall-ai-backend.onrender.com/api/ai/image",
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify({

                                prompt:
                                    imagePrompt,

                                style:
                                    style.value,

                                aspectRatio:
                                    selectedRatio

                            })

                        }
                    );


                const data =
                    await response.json();


                if (
                    !response.ok ||
                    !data.success ||
                    !data.imageUrl
                ) {

                    throw new Error(
                        data.message ||
                        "Image generation failed."
                    );

                }


                // ==================================
                // SHOW RESULT
                // ==================================

                generatedImage.src =
                    data.imageUrl;

                generatedImage.classList.remove(
                    "hidden"
                );

                loadingPreview.classList.add(
                    "hidden"
                );

                imageActions.classList.remove(
                    "hidden"
                );

                generationStatus.textContent =
                    "Complete";

                generationStatus.style.color =
                    "#86efac";


                // Save locally
                saveRecentImage(
                    data.imageUrl,
                    imagePrompt
                );


                showImageStudioToast(
                    "Image created successfully!",
                    "success"
                );

            }


            catch (error) {

                console.error(
                    "Image generation error:",
                    error
                );


                loadingPreview.classList.add(
                    "hidden"
                );

                emptyPreview.classList.remove(
                    "hidden"
                );

                generationStatus.textContent =
                    "Ready";

                generationStatus.style.color =
                    "#86efac";


                showImageStudioToast(
                    error.message ||
                    "Unable to generate image.",
                    "error"
                );

            }


            finally {

                generateButton.disabled =
                    false;

                generateText.textContent =
                    "Generate Image";

            }

        }
    );


    // ==========================================
    // DOWNLOAD
    // ==========================================

    downloadImage?.addEventListener(
        "click",
        async () => {

            if (!generatedImage.src) {
                return;
            }

            try {

                const response =
                    await fetch(
                        generatedImage.src
                    );

                const blob =
                    await response.blob();

                const url =
                    URL.createObjectURL(blob);

                const link =
                    document.createElement("a");

                link.href = url;

                link.download =
                    `echocall-ai-${Date.now()}.png`;

                document.body.appendChild(link);

                link.click();

                link.remove();

                URL.revokeObjectURL(url);

            }

            catch (error) {

                console.error(
                    "Download error:",
                    error
                );

                window.open(
                    generatedImage.src,
                    "_blank"
                );

            }

        }
    );


    // ==========================================
    // NEW IMAGE
    // ==========================================

    newImage?.addEventListener(
        "click",
        () => {

            prompt.value = "";

            prompt.dispatchEvent(
                new Event("input")
            );

            generatedImage.src = "";

            generatedImage.classList.add(
                "hidden"
            );

            imageActions.classList.add(
                "hidden"
            );

            emptyPreview.classList.remove(
                "hidden"
            );

            generationStatus.textContent =
                "Ready";

        }
    );


    // ==========================================
    // SAVE
    // ==========================================

    saveImage?.addEventListener(
        "click",
        () => {

            if (!generatedImage.src) {
                return;
            }

            showImageStudioToast(
                "Image saved to your creations.",
                "success"
            );

        }
    );


    // ==========================================
    // CLEAR GALLERY
    // ==========================================

    clearGallery?.addEventListener(
        "click",
        () => {

            localStorage.removeItem(
                "echoCallRecentImages"
            );

            renderRecentImages();

        }
    );


    // ==========================================
    // RECENT IMAGES
    // ==========================================

    function saveRecentImage(
        imageUrl,
        imagePrompt
    ) {

        const images =
            JSON.parse(
                localStorage.getItem(
                    "echoCallRecentImages"
                ) || "[]"
            );


        images.unshift({

            url:
                imageUrl,

            prompt:
                imagePrompt,

            createdAt:
                Date.now()

        });


        images.splice(12);


        localStorage.setItem(
            "echoCallRecentImages",
            JSON.stringify(images)
        );


        renderRecentImages();

    }


    function renderRecentImages() {

        const images =
            JSON.parse(
                localStorage.getItem(
                    "echoCallRecentImages"
                ) || "[]"
            );


        if (!images.length) {

            recentGallery.innerHTML = `
                <div class="gallery-empty">
                    <span class="material-symbols-rounded">
                        photo_library
                    </span>
                    <p>
                        Your generated images will appear here.
                    </p>
                </div>
            `;

            return;
        }


        recentGallery.innerHTML =
            images.map(image => `
                <div class="recent-image-card">

                    <img
                        src="${image.url}"
                        alt="${escapeHtml(image.prompt)}"
                    >

                </div>
            `).join("");

    }


    function escapeHtml(text) {

        return text
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");

    }


    // ==========================================
    // TOAST
    // ==========================================

    function showImageStudioToast(
        message,
        type
    ) {

        // Use existing global toast if available
        if (typeof window.showToast === "function") {

            window.showToast(
                message,
                type
            );

            return;
        }

        console.log(
            `[${type}] ${message}`
        );

    }


    // Initial gallery
    renderRecentImages();

}