// ==========================================
// EchoCall AI Backend
// File: server/routes/profileRoutes.js
// ==========================================

// ==========================================
// Imports
// ==========================================

import express from "express";

import {

    authenticateUser

} from "../middleware/authMiddleware.js";

import {

    db

} from "../services/firebaseAdmin.js";

// ==========================================
// Router
// ==========================================

const router = express.Router();

// ==========================================
// GET Profile
// ==========================================

router.get(

    "/",

    authenticateUser,

    async(req,res)=>{

        try{

            const document =

                await db

                .collection("users")

                .doc(req.user.uid)

                .get();

            if(!document.exists){

                return res.status(404).json({

                    success:false,

                    message:"Profile not found."

                });

            }

            return res.json({

                success:true,

                profile:document.data()

            });

        }

        catch(error){

            console.error(error);

            return res.status(500).json({

                success:false,

                message:"Failed to load profile."

            });

        }

    }

);

// ==========================================
// Save Profile
// ==========================================

router.put(

    "/",

    authenticateUser,

    async(req,res)=>{

        try{

            const data = {

                ...req.body,

                updatedAt:new Date()

            };

            await db

                .collection("users")

                .doc(req.user.uid)

                .set(

                    data,

                    {

                        merge:true

                    }

                );

            return res.json({

                success:true,

                message:"Profile updated."

            });

        }

        catch(error){

            console.error(error);

            return res.status(500).json({

                success:false,

                message:"Unable to update profile."

            });

        }

    }

);

// ==========================================
// Profile Statistics
// ==========================================

router.get(

    "/stats",

    authenticateUser,

    async(req,res)=>{

        try{

            const calls =

                await db

                .collection("users")

                .doc(req.user.uid)

                .collection("calls")

                .get();

            let totalMinutes = 0;

            let totalSummaries = 0;

            const languages =

                new Set();

            calls.forEach(doc=>{

                const data = doc.data();

                totalMinutes +=

                    data.duration || 0;

                if(data.summary){

                    totalSummaries++;

                }

                if(data.language){

                    languages.add(

                        data.language

                    );

                }

            });

            return res.json({

                success:true,

                stats:{

                    totalCalls:

                        calls.size,

                    totalMinutes,

                    totalSummaries,

                    languagesUsed:

                        languages.size

                }

            });

        }

        catch(error){

            console.error(error);

            return res.status(500).json({

                success:false,

                message:

                "Unable to load statistics."

            });

        }

    }

);

// ==========================================
// AI Preferences
// ==========================================

router.put(

    "/preferences",

    authenticateUser,

    async(req,res)=>{

        try{

            await db

                .collection("users")

                .doc(req.user.uid)

                .set({

                    aiPreferences:

                    req.body,

                    updatedAt:

                    new Date()

                },

                {

                    merge:true

                });

            return res.json({

                success:true,

                message:

                "Preferences updated."

            });

        }

        catch(error){

            console.error(error);

            return res.status(500).json({

                success:false,

                message:

                "Unable to save preferences."

            });

        }

    }

);

// ==========================================
// Delete Profile
// ==========================================

router.delete(

    "/",

    authenticateUser,

    async(req,res)=>{

        try{

            await db

                .collection("users")

                .doc(req.user.uid)

                .delete();

            return res.json({

                success:true,

                message:

                "Profile deleted."

            });

        }

        catch(error){

            console.error(error);

            return res.status(500).json({

                success:false,

                message:

                "Unable to delete profile."

            });

        }

    }

);

// ==========================================
// Export
// ==========================================

export default router;