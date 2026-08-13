// ==========================================
// EchoCall AI Backend
// File: server/services/imageService.js
// ==========================================

import {
    openai,
    MODEL
} from "./openaiService.js";

// ==========================================
// Image Generation
// ==========================================

export async function generateImage(
    prompt,
    size = "1024x1024"
) {

    try {

        const response =
            await openai.images.generate({

                model: "gpt-image-1",

                prompt,

                size

            });

        return response;

    }

    catch (error) {

        console.error(
            "Image Generation Error:",
            error
        );

        throw error;

    }

}

// ==========================================
// Image Analysis
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

        // ======================================
        // Convert image to Base64
        // ======================================

        const base64Image =
            imageBuffer.toString("base64");

        const imageDataURL =
            `data:${mimeType};base64,${base64Image}`;

        // ======================================
        // Send image to OpenAI
        // ======================================

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