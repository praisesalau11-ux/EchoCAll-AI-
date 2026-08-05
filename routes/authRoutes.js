// ==========================================
// EchoCall AI Backend
// File: server/routes/authRoutes.js
// ==========================================

import express from "express";

import {

    authenticateUser

} from "../middleware/authMiddleware.js";

import {

    db

} from "../services/firebaseAdmin.js";

const router = express.Router();

// ==========================================
// GET /api/auth/me
// ==========================================

router.get(

    "/me",

    authenticateUser,

    async(req,res)=>{

        try{

            const userDoc =

                await db

                .collection("users")

                .doc(req.user.uid)

                .get();

            if(!userDoc.exists){

                return res.status(404).json({

                    success:false,

                    message:"User not found."

                });

            }

            return res.json({

                success:true,

                user:userDoc.data()

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
// POST /api/auth/profile
// Save Profile
// ==========================================

router.post(

    "/profile",

    authenticateUser,

    async(req,res)=>{

        try{

            const data = req.body;

            data.updatedAt =

                new Date();

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

                message:"Unable to save profile."

            });

        }

    }

);

// ==========================================
// GET /api/auth/session
// ==========================================

router.get(

    "/session",

    authenticateUser,

    async(req,res)=>{

        return res.json({

            success:true,

            authenticated:true,

            uid:req.user.uid,

            email:req.user.email

        });

    }

);

// ==========================================
// POST /api/auth/logout
// ==========================================

router.post(

    "/logout",

    authenticateUser,

    async(req,res)=>{

        return res.json({

            success:true,

            message:

            "Logged out successfully."

        });

    }

);

// ==========================================
// GET /api/auth/ping
// ==========================================

router.get(

    "/ping",

    (req,res)=>{

        res.json({

            success:true,

            server:"EchoCall AI",

            status:"Running",

            timestamp:

            Date.now()

        });

    }

);

// ==========================================
// Export
// ==========================================

export default router;