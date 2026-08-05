// ==========================================
// EchoCall AI Backend
// File: server/services/imageService.js
// ==========================================

// ==========================================
// Imports
// ==========================================

import { openai, MODEL } from "./openaiService.js";

// ==========================================
// Image Generation
// ==========================================

export async function generateImage(

    prompt,

    size = "1024x1024"

){

    try{

        const response =

            await openai.images.generate({

                model: "gpt-image-1",

                prompt,

                size

            });

        return response;

    }

    catch(error){

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

    imageURL,

    prompt = "Describe this image."

){

    try{

        const response =

            await openai.chat.completions.create({

                model: MODEL,

                messages:[

                    {

                        role:"user",

                        content:[

                            {

                                type:"text",

                                text:prompt

                            },

                            {

                                type:"image_url",

                                image_url:{

                                    url:imageURL

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

    catch(error){

        console.error(

            "Image Analysis Error:",

            error

        );

        throw error;

    }

}

// ==========================================
// Export Services
// ==========================================

export {

    generateImage,

    analyzeImage

};