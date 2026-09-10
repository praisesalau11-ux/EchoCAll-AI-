// ==========================================
// EchoCall AI Backend
// File: server/services/imageService.js
// ==========================================

import {
    openai,
    MODEL
} from "./openaiService.js";


// ==========================================
// Stability AI Configuration
// ==========================================

const STABILITY_API_KEY =
    process.env.STABILITY_API_KEY;

const STABILITY_IMAGE_URL =
    "https://api.stability.ai/v2beta/stable-image/generate/core";


// ==========================================
// Image Generation - Stability AI
// ==========================================

export async function generateImage(
    prompt,
    options = {}
) {

    try {

        if (!STABILITY_API_KEY) {

            throw new Error(
                "STABILITY_API_KEY is not configured."
            );

        }

        if (!prompt || prompt.trim() === "") {

            throw new Error(
                "Image prompt is required."
            );

        }


        const formData =
            new FormData();


        formData.append(
            "prompt",
            prompt.trim()
        );


        formData.append(
            "output_format",
            "png"
        );


        // ======================================
        // Aspect Ratio
        // ======================================

        if (options.aspectRatio) {

            formData.append(
                "aspect_ratio",
                options.aspectRatio
            );

        }


        // ======================================
        // Style
        // ======================================

        if (options.style) {

            formData.append(
                "style_preset",
                options.style
            );

        }


        // ======================================
        // Request Stability
        // ======================================

        const response =
            await fetch(
                STABILITY_IMAGE_URL,
                {

                    method: "POST",

                    headers: {

                        Authorization:
                            `Bearer ${STABILITY_API_KEY}`,

                        Accept:
                            "image/*"

                    },

                    body:
                        formData

                }
            );


        if (!response.ok) {

            let errorMessage =
                "Stability image generation failed.";

            try {

                const errorData =
                    await response.json();

                errorMessage =
                    errorData.message ||
                    errorData.errors?.join(", ") ||
                    errorMessage;

            }

            catch {

                // Ignore JSON parsing failure

            }

            throw new Error(
                errorMessage
            );

        }


        // ======================================
        // Get Image Bytes
        // ======================================

        const imageBuffer =
            Buffer.from(
                await response.arrayBuffer()
            );


        // ======================================
        // Convert To Base64
        // ======================================

        const base64 =
            imageBuffer.toString(
                "base64"
            );


        return {

            success: true,

            mimeType:
                "image/png",

            base64,

            dataUrl:
                `data:image/png;base64,${base64}`

        };

    }

    catch (error) {

        console.error(
            "Stability Image Generation Error:",
            error
        );

        throw error;

    }

}


// ==========================================
// Image Analysis - OpenAI
// ==========================================

export async function analyzeImage(
    imageBuffer,
    mimeType,
    prompt = "Describe this image."
) {

    try {

        if (!imageBuffer) {

            throw new Error(
                "Image buffer is required."
            );

        }

        if (!mimeType) {

            throw new Error(
                "Image MIME type is required."
            );

        }


        const base64Image =
            imageBuffer.toString(
                "base64"
            );


        const imageDataURL =
            `data:${mimeType};base64,${base64Image}`;


        const response =
            await openai.chat.completions.create({

                model: MODEL,

                messages: [

                    {

                        role: "user",

                        content: [

                            {

                                type: "text",

                                text: prompt

                            },

                            {

                                type: "image_url",

                                image_url: {

                                    url:
                                        imageDataURL

                                }

                            }

                        ]

                    }

                ]

            });


        return response
            .choices[0]
            .message
            .content;

    }

    catch (error) {

        console.error(
            "Image Analysis Error:",
            error
        );

        throw error;

    }

}