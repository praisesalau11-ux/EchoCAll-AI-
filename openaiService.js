// ==========================================
// EchoCall AI Backend
// File: server/services/openaiService.js
// ==========================================

// ==========================================
// Imports
// ==========================================

import OpenAI from "openai";

// ==========================================
// OpenAI Client
// ==========================================

const openai = new OpenAI({

    apiKey: process.env.OPENAI_API_KEY

});

export const MODEL = process.env.OPENAI_MODEL || "gpt-5.5";

// ==========================================
// Chat Completion
// ==========================================

export async function generateChatResponse({

    systemPrompt =

        "You are EchoCall AI.",

    messages = [],

    model =

        MODEL,

}){

    try{

        const response =

            await openai.chat.completions.create({

                model,

                messages: [

                    {

                        role: "system",

                        content: systemPrompt

                    },

                    ...messages

                ]

            });

        return response.choices[0].message;

    }

    catch(error){

        console.error(

            "OpenAI Chat Error:",

            error

        );

        throw error;

    }

}

// ==========================================
// Conversation Summary
// ==========================================

export async function generateSummary(

    transcript

){

    try{

        const response =

            await openai.chat.completions.create({

                model: MODEL,

                messages: [

                    {

                        role: "system",

                        content:

                        "Summarize conversations into concise notes with important action items."

                    },

                    {

                        role: "user",

                        content: transcript

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

            "Summary Error:",

            error

        );

        throw error;

    }

}

// ==========================================
// Translation
// ==========================================

export async function translateText(

    text,

    targetLanguage

){

    try{

        const response =

            await openai.chat.completions.create({

                model: MODEL,

                messages: [

                    {

                        role: "system",

                        content:

                        `Translate everything into ${targetLanguage}. Return only the translated text.`

                    },

                    {

                        role: "user",

                        content: text

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

            "Translation Error:",

            error

        );

        throw error;

    }

}

// ==========================================
// Extract Action Items
// ==========================================

export async function extractActions(

    transcript

){

    try{

        const response =

            await openai.chat.completions.create({

                model: MODEL,

                messages: [

                    {

                        role: "system",

                        content:

                        "Extract action items from this conversation. Return JSON array."

                    },

                    {

                        role: "user",

                        content: transcript

                    }

                ],

                response_format: {

                    type: "json_object"

                }

            });

        return JSON.parse(

            response

            .choices[0]

            .message

            .content

        );

    }

    catch(error){

        console.error(

            "Action Extraction Error:",

            error

        );

        throw error;

    }

}

// ==========================================
// Health Check
// ==========================================

export async function testOpenAI(){

    try{

        const response =

            await openai.chat.completions.create({

                model: MODEL,

                messages: [

                    {

                        role: "user",

                        content:

                        "Reply with OK"

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

            "OpenAI Test Error:",

            error

        );

        throw error;

    }

}

// ==========================================
// Streaming Chat Response
// ==========================================

export async function streamChatResponse({

    systemPrompt = "You are EchoCall AI.",

    messages = [],

    model = MODEL,

}){

    try{

        return await openai.chat.completions.create({

            model,

            stream: true,

            messages:[

                {

                    role:"system",

                    content:systemPrompt

                },

                ...messages

            ]

        });

    }

    catch(error){

        console.error(

            "Streaming Error:",

            error

        );

        throw error;

    }

}

// ==========================================
// Detect Language
// ==========================================

export async function detectLanguage(

    text

){

    try{

        const response =

            await openai.chat.completions.create({

                model: MODEL,

                messages:[

                    {

                        role:"system",

                        content:

                        "Detect the language of the text. Return only the language name."

                    },

                    {

                        role:"user",

                        content:text

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

            "Language Detection Error:",

            error

        );

        throw error;

    }

}

// ==========================================
// AI Memory
// ==========================================

export async function generateMemorySummary(

    messages = []

){

    try{

        const response =

            await openai.chat.completions.create({

                model: MODEL,

                messages:[

                    {

                        role:"system",

                        content:

                        "Summarize the conversation into a short memory that can help future conversations. Keep only important long-term information."

                    },

                    ...messages

                ]

            });

        return response

            .choices[0]

            .message

            .content;

    }

    catch(error){

        console.error(

            "Memory Error:",

            error

        );

        throw error;

    }

}

// ==========================================
// Speech To Text
// ==========================================

export async function transcribeAudio(

    audioFile

){

    try{

        const transcription =

            await openai.audio.transcriptions.create({

                file: audioFile,

                model: "gpt-4o-mini-transcribe"

            });

        return transcription.text;

    }

    catch(error){

        console.error(

            "Speech To Text Error:",

            error

        );

        throw error;

    }

}

// ==========================================
// Text To Speech
// ==========================================

export async function textToSpeech(

    text,

    voice = "alloy"

){

    try{

        const response =

            await openai.audio.speech.create({

                model: "gpt-4o-mini-tts",

                voice,

                input: text

            });

        return response;

    }

    catch(error){

        console.error(

            "Text To Speech Error:",

            error

        );

        throw error;

    }

}

// ==========================================
// Export Client
// ==========================================
export {

    openai

};

// ==========================================
// End of File
// ==========================================