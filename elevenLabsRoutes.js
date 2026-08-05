// ==========================================
// EchoCall AI Backend
// File: server/routes/elevenLabsRoutes.js
// Part 1
// ==========================================

// ==========================================
// Imports
// ==========================================

import express from "express";

import axios from "axios";

import multer from "multer";

import {

    authenticateUser

} from "../middleware/authMiddleware.js";

// ==========================================
// Router
// ==========================================

const router = express.Router();

const upload = multer({

    storage: multer.memoryStorage()

});

// ==========================================
// Environment
// ==========================================

const API_KEY =

    process.env.ELEVENLABS_API_KEY;

const BASE_URL =

    "https://api.elevenlabs.io/v1";

// ==========================================
// Get All Voices
// ==========================================

router.get(

    "/voices",

    authenticateUser,

    async(req,res)=>{

        try{

            const response =

                await axios.get(

                    `${BASE_URL}/voices`,

                    {

                        headers:{

                            "xi-api-key":

                            API_KEY

                        }

                    }

                );

            return res.json({

                success:true,

                voices:

                response.data.voices

            });

        }

        catch(error){

            console.error(error);

            return res.status(500).json({

                success:false,

                message:

                "Unable to load voices."

            });

        }

    }

);

// ==========================================
// End Part 1
// ==========================================

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

                voiceId = "JBFqnCBsd6RMkjVDRZzb"

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

            const response =

                await axios.post(

                    `${BASE_URL}/text-to-speech/${voiceId}`,

                    {

                        text,

                        model_id:

                        "eleven_multilingual_v2"

                    },

                    {

                        headers:{

                            "xi-api-key":

                            API_KEY,

                            "Content-Type":

                            "application/json",

                            "Accept":

                            "audio/mpeg"

                        },

                        responseType:

                        "arraybuffer"

                    }

                );

            res.set({

                "Content-Type":

                "audio/mpeg"

            });

            return res.send(

                response.data

            );

        }

        catch(error){

            console.error(error);

            return res.status(500).json({

                success:false,

                message:

                "Text to speech failed."

            });

        }

    }

);

// ==========================================
// End Part 2
// ==========================================

// ==========================================
// Get Voice Details
// ==========================================

router.get(

    "/voices/:voiceId",

    authenticateUser,

    async(req,res)=>{

        try{

            const { voiceId } = req.params;

            const response = await axios.get(

                `${BASE_URL}/voices/${voiceId}`,

                {

                    headers:{

                        "xi-api-key": API_KEY

                    }

                }

            );

            return res.json({

                success:true,

                voice: response.data

            });

        }

        catch(error){

            console.error(error);

            return res.status(500).json({

                success:false,

                message:"Unable to load voice."

            });

        }

    }

);

// ==========================================
// End Part 3
// ==========================================

// ==========================================
// Delete Voice
// ==========================================

router.delete(

    "/voices/:voiceId",

    authenticateUser,

    async(req,res)=>{

        try{

            const {

                voiceId

            } = req.params;

            await axios.delete(

                `${BASE_URL}/voices/${voiceId}`,

                {

                    headers:{

                        "xi-api-key":

                        API_KEY

                    }

                }

            );

            return res.json({

                success:true,

                message:

                "Voice deleted successfully."

            });

        }

        catch(error){

            console.error(error);

            return res.status(500).json({

                success:false,

                message:

                "Unable to delete voice."

            });

        }

    }

);

// ==========================================
// Get User Subscription
// ==========================================

router.get(

    "/subscription",

    authenticateUser,

    async(req,res)=>{

        try{

            const response =

                await axios.get(

                    `${BASE_URL}/user/subscription`,

                    {

                        headers:{

                            "xi-api-key":

                            API_KEY

                        }

                    }

                );

            return res.json({

                success:true,

                subscription:

                response.data

            });

        }

        catch(error){

            console.error(error);

            return res.status(500).json({

                success:false,

                message:

                "Unable to load subscription."

            });

        }

    }

);

// ==========================================
// End Part 4
// ==========================================

// ==========================================
// User Information
// ==========================================

router.get(

    "/user",

    authenticateUser,

    async(req,res)=>{

        try{

            const response =

                await axios.get(

                    `${BASE_URL}/user`,

                    {

                        headers:{

                            "xi-api-key":

                            API_KEY

                        }

                    }

                );

            return res.json({

                success:true,

                user:

                response.data

            });

        }

        catch(error){

            console.error(error);

            return res.status(500).json({

                success:false,

                message:

                "Unable to load user information."

            });

        }

    }

);

// ==========================================
// Voice Generation History
// ==========================================

router.get(

    "/history",

    authenticateUser,

    async(req,res)=>{

        try{

            const response =

                await axios.get(

                    `${BASE_URL}/history`,

                    {

                        headers:{

                            "xi-api-key":

                            API_KEY

                        }

                    }

                );

            return res.json({

                success:true,

                history:

                response.data

            });

        }

        catch(error){

            console.error(error);

            return res.status(500).json({

                success:false,

                message:

                "Unable to load history."

            });

        }

    }

);

// ==========================================
// Export Router
// ==========================================

export default router;

// ==========================================
// End of File
// ==========================================