// ==========================================
// EchoCall AI Backend
// File: server/routes/aiRoutes.js
// Part 1
// ==========================================

// ==========================================
// Imports
// ==========================================

import express from "express";

import crypto from "crypto";

import multer from "multer";

import {

    authenticateUser

} from "../middleware/authMiddleware.js";

import {

    db

} from "../services/firebaseAdmin.js";

import {

    generateChatResponse,

    generateSummary,

    translateText,

    extractActions,

    generateMemorySummary,
  
    detectLanguage,

    transcribeAudio,

    textToSpeech

} from "../services/openaiService.js";

import {

    searchWeb

} from "../services/searchService.js";

import {

    generateImage,

    analyzeImage

} from "../services/imageService.js";

// ==========================================
// Router
// ==========================================

const router = express.Router();

const upload = multer({

    storage: multer.memoryStorage(),

    limits: {

        fileSize: 25 * 1024 * 1024

    }

});

// ==========================================
// AI Chat
// Persistent Conversation Memory
// ==========================================

router.post(

    "/chat",

    authenticateUser,

    async (req, res) => {

        try {

            const {

                message,

                conversationId,

                personality,

                tone

            } = req.body;

            // ======================================
            // Validate Message
            // ======================================

            if (
                !message ||
                message.trim() === ""
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Message is required."

                });

            }

            // ======================================
            // Get / Create Conversation ID
            // ======================================

            const finalConversationId =

                conversationId ||
                crypto.randomUUID();

            // ======================================
            // Firebase Conversation Reference
            // ======================================

            const conversationRef =

                db

                    .collection("users")

                    .doc(req.user.uid)

                    .collection("conversations")

                    .doc(finalConversationId);

// ======================================
// Load Persistent User Memory
// ======================================

const memoryRef =

    db

        .collection("users")

        .doc(req.user.uid)

        .collection("aiMemory")

        .doc("profile");

const memorySnap =
    await memoryRef.get();

const userMemory =
    memorySnap.exists
        ? memorySnap.data()
        : {};

console.log(
    "AI: Loaded user memory:",
    userMemory
);

            // ======================================
            // Load Previous Messages
            // ======================================

            const messagesSnapshot =

                await conversationRef

                    .collection("messages")

                    .orderBy(
                        "createdAt",
                        "asc"
                    )

                    .get();
                    
  console.log(
    "AI Conversation ID:",
    finalConversationId
);

console.log(
    "AI Previous Message Count:",
    messagesSnapshot.size
);

            // ======================================
            // Convert Firebase Messages
            // Into OpenAI Messages
            // ======================================

            const previousMessages = [];

            messagesSnapshot.forEach(

                (doc) => {

                    const data =
                        doc.data();

                    if (

                        data.role === "user" ||

                        data.role === "assistant"

                    ) {

                        previousMessages.push({

                            role:
                                data.role,

                            content:
                                data.content

                        });

                    }

                }

            );

console.log(
    "AI Previous Messages:",
    JSON.stringify(previousMessages, null, 2)
);
            // ======================================
            // Add Current User Message
            // ======================================

            previousMessages.push({

                role: "user",

                content: message.trim()

            });

            // ======================================
            // Generate AI Response
            // ======================================

console.log(
    "AI Messages Being Sent To OpenAI:",
    JSON.stringify(
        previousMessages,
        null,
        2
    )
);

            const aiResponse =

                await generateChatResponse({

                    systemPrompt: `

You are EchoCall AI.

You are a persistent AI assistant.

Use the user's persistent memory when it is
relevant to the user's request.

Only claim to remember information that
actually exists in the persistent memory
or conversation history provided to you.

Persistent User Memory:
${JSON.stringify(userMemory, null, 2)}

Conversation history should also be used when
relevant.

Personality:
${personality || "professional"}

Tone:
${tone || "neutral"}

Answer naturally, accurately and clearly.

`.trim(),

                    messages:
                        previousMessages

                });

            // ======================================
            // Get Reply
            // ======================================

            const reply =

                aiResponse?.content ||

                "I couldn't generate a response.";

            // ======================================
            // Save / Update Conversation
            // ======================================

            await conversationRef.set(

                {

                    personality:
                        personality ||
                        "professional",

                    tone:
                        tone ||
                        "neutral",

                    updatedAt:
                        new Date()

                },

                {

                    merge: true

                }

            );

            // ======================================
            // Save User Message
            // ======================================

            await conversationRef

                .collection("messages")

                .add({

                    role: "user",

                    content:
                        message.trim(),

                    createdAt:
                        new Date()

                });

            // ======================================
            // Save AI Message
            // ======================================

            await conversationRef

                .collection("messages")

                .add({

                    role: "assistant",

                    content:
                        reply,

                    createdAt:
                        new Date()

                });
                
                // ======================================
// Update Persistent AI Memory
// ======================================

try {

    const memoryMessages = [

        ...previousMessages,

        {
            role: "assistant",
            content: reply
        }

    ];

    const generatedMemory =
        await generateMemorySummary(
            memoryMessages
        );

    if (
        generatedMemory &&
        generatedMemory.trim()
    ) {

        await memoryRef.set(

            {
                summary:
                    generatedMemory.trim(),

                updatedAt:
                    new Date()

            },

            {
                merge: true
            }

        );

        console.log(
            "AI: Persistent memory updated."
        );

    }

}

catch (memoryError) {

    console.error(
        "AI Memory Update Error:",
        memoryError
    );

}

            // ======================================
            // Send Response
            // ======================================

            return res.json({

                success: true,

                conversationId:
                    finalConversationId,

                reply

            });

        }

        catch (error) {

            console.error(

                "AI Chat Error:",

                error

            );

            return res.status(500).json({

                success: false,

                message:
                    "AI request failed."

            });

        }

    }

);

// ==========================================
// List Conversations
// ==========================================

router.get(

    "/conversations",

    authenticateUser,

    async(req,res)=>{

        try{

            const snapshot =

                await db

                .collection("users")

                .doc(req.user.uid)

                .collection("conversations")

                .orderBy(

                    "updatedAt",

                    "desc"

                )

                .get();

            const conversations = [];

            snapshot.forEach(doc=>{

                conversations.push({

                    id:doc.id,

                    ...doc.data()

                });

            });

            return res.json({

                success:true,

                conversations

            });

        }

        catch(error){

            console.error(error);

            return res.status(500).json({

                success:false,

                message:

                "Unable to load conversations."

            });

        }

    }

);

// ==========================================
// Get Conversation Messages
// ==========================================

router.get(

    "/conversations/:conversationId/messages",

    authenticateUser,

    async (req, res) => {

        try {

            const {
                conversationId
            } = req.params;

            if (!conversationId) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Conversation ID is required."

                });

            }

            // ======================================
            // User's conversation
            // ======================================

            const conversationRef =

                db

                    .collection("users")

                    .doc(req.user.uid)

                    .collection("conversations")

                    .doc(conversationId);

            // ======================================
            // Verify conversation exists
            // ======================================

            const conversationSnap =
                await conversationRef.get();

            if (!conversationSnap.exists) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Conversation not found."

                });

            }

            // ======================================
            // Load messages
            // ======================================

            const messagesSnapshot =

                await conversationRef

                    .collection("messages")

                    .orderBy(
                        "createdAt",
                        "asc"
                    )

                    .get();

            const messages = [];

            messagesSnapshot.forEach(

                doc => {

                    const data =
                        doc.data();

                    messages.push({

                        id: doc.id,

                        role:
                            data.role,

                        content:
                            data.content,

                        createdAt:
                            data.createdAt

                    });

                }

            );

            return res.json({

                success: true,

                conversationId,

                messages

            });

        }

        catch (error) {

            console.error(

                "Load Conversation Error:",

                error

            );

            return res.status(500).json({

                success: false,

                message:
                    "Unable to load conversation."

            });

        }

    }

);

// ==========================================
// End Part 1
// ==========================================

// ==========================================
// Conversation Summary
// ==========================================

router.post(

    "/summary",

    authenticateUser,

    async(req,res)=>{

        try{

            const {

                transcript

            } = req.body;

            if(

                !transcript ||

                transcript.trim()===""

            ){

                return res.status(400).json({

                    success:false,

                    message:

                    "Transcript is required."

                });

            }

            const summary =

                await generateSummary(

                    transcript

                );

            return res.json({

                success:true,

                summary

            });

        }

        catch(error){

            console.error(error);

            return res.status(500).json({

                success:false,

                message:

                "Unable to generate summary."

            });

        }

    }

);

// ==========================================
// Speech To Text
// ==========================================

router.post(

    "/speech-to-text",

    authenticateUser,

    upload.single("audio"),

    async(req,res)=>{

        try{

            if(!req.file){

                return res.status(400).json({

                    success:false,

                    message:"Audio file is required."

                });

            }

            const transcript =

                await transcribeAudio(

                    req.file

                );

            return res.json({

                success:true,

                transcript

            });

        }

        catch(error){

            console.error(error);

            return res.status(500).json({

                success:false,

                message:

                "Speech transcription failed."

            });

        }

    }

);

// ==========================================
// Text To Speech
// ==========================================

router.post(

    "/text-to-speech",

    authenticateUser,

    async(req,res)=>{

        try{

            const {

                text,

                voice

            } = req.body;

            if(

                !text ||

                text.trim()===""

            ){

                return res.status(400).json({

                    success:false,

                    message:

                    "Text is required."

                });

            }

            const audio =

                await textToSpeech(

                    text,

                    voice || "alloy"

                );

            return res.json({

                success:true,

                audio

            });

        }

        catch(error){

            console.error(error);

            return res.status(500).json({

                success:false,

                message:

                "Text-to-Speech failed."

            });

        }

    }

);

// ==========================================
// Translation
// ==========================================

router.post(

    "/translate",

    authenticateUser,

    async(req,res)=>{

        try{

            const {

                text,

                targetLanguage

            } = req.body;

            if(

                !text ||

                !targetLanguage

            ){

                return res.status(400).json({

                    success:false,

                    message:

                    "Text and targetLanguage are required."

                });

            }

            const translation =

                await translateText(

                    text,

                    targetLanguage

                );

            return res.json({

                success:true,

                translation

            });

        }

        catch(error){

            console.error(error);

            return res.status(500).json({

                success:false,

                message:

                "Translation failed."

            });

        }

    }

);

// ==========================================
// Language Detection
// ==========================================

router.post(

    "/detect-language",

    authenticateUser,

    async(req,res)=>{

        try{

            const {

                text

            } = req.body;

            if(!text){

                return res.status(400).json({

                    success:false,

                    message:

                    "Text is required."

                });

            }

            const language =

                await detectLanguage(

                    text

                );

            return res.json({

                success:true,

                language

            });

        }

        catch(error){

            console.error(error);

            return res.status(500).json({

                success:false,

                message:

                "Language detection failed."

            });

        }

    }

);

// ==========================================
// AI Memory
// ==========================================

router.post(

    "/memory",

    authenticateUser,

    async(req,res)=>{

        try{

            const {

                messages

            } = req.body;

            const memory =

                await generateMemorySummary(

                    messages || []

                );

            return res.json({

                success:true,

                memory

            });

        }

        catch(error){

            console.error(error);

            return res.status(500).json({

                success:false,

                message:

                "Memory generation failed."

            });

        }

    }

);

// ==========================================
// Internet Search
// ==========================================

router.post(

    "/search",

    authenticateUser,

    async(req,res)=>{

        try{

            const {

                query,

                limit

            } = req.body;

            if(

                !query ||

                query.trim()===""

            ){

                return res.status(400).json({

                    success:false,

                    message:

                    "Search query is required."

                });

            }

            const results =

                await searchWeb(

                    query,

                    limit || 5

                );

            return res.json({

                success:true,

                query,

                results

            });

        }

        catch(error){

            console.error(

                "Search Error:",

                error

            );

            return res.status(500).json({

                success:false,

                message:

                "Internet search failed."

            });

        }

    }

);

// ==========================================
// Image Analysis
// ==========================================

router.post(

    "/analyze-image",

    authenticateUser,

    async(req,res)=>{

        try{

            const {

                imageURL,

                prompt

            } = req.body;

            if(!imageURL){

                return res.status(400).json({

                    success:false,

                    message:

                    "imageURL is required."

                });

            }

            const analysis =

                await analyzeImage(

                    imageURL,

                    prompt || "Describe this image."

                );

            return res.json({

                success:true,

                analysis

            });

        }

        catch(error){

            console.error(

                "Image Analysis Error:",

                error

            );

            return res.status(500).json({

                success:false,

                message:

                "Image analysis failed."

            });

        }

    }

);

// ==========================================
// Image Generation
// ==========================================

router.post(

    "/generate-image",

    authenticateUser,

    async(req,res)=>{

        try{

            const {

                prompt,

                size

            } = req.body;

            if(

                !prompt ||

                prompt.trim()===""

            ){

                return res.status(400).json({

                    success:false,

                    message:

                    "Prompt is required."

                });

            }

            const image =

                await generateImage(

                    prompt,

                    size || "1024x1024"

                );

            return res.json({

                success:true,

                image

            });

        }

        catch(error){

            console.error(

                "Image Generation Error:",

                error

            );

            return res.status(500).json({

                success:false,

                message:

                "Image generation failed."

            });

        }

    }

);

// ==========================================
// Export Router
// ==========================================

export default router;