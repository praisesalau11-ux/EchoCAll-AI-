// ==========================================
// EchoCall AI Backend
// File: server/routes/authRoutes.js
// Part 1
// ==========================================

// ==========================================
// Imports
// ==========================================

import express from "express";

import axios from "axios";

import {

    authenticateUser

} from "../middleware/authMiddleware.js";

import {

    admin,

    db

} from "../services/firebaseAdmin.js";

// ==========================================
// Router
// ==========================================

const router = express.Router();

// ==========================================
// Firebase
// ==========================================

const FIREBASE_API_KEY =
    process.env.FIREBASE_API_KEY;

// ==========================================
// End Part 1
// ==========================================

const FIREBASE_API_KEY =
    process.env.FIREBASE_API_KEY;
    
    // ==========================================
// POST /api/auth/signup
// ==========================================

router.post(

    "/signup",

    async(req,res)=>{

        try{

            const {

                firstName,

                lastName,

                email,

                password,

                phone,

                country,

                gender,

                dateOfBirth

            } = req.body;

            if(

                !firstName ||

                !lastName ||

                !email ||

                !password

            ){

                return res.status(400).json({

                    success:false,

                    message:

                    "Missing required fields."

                });

            }

            const response =

                await axios.post(

                    `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${FIREBASE_API_KEY}`,

                    {

                        email,

                        password,

                        returnSecureToken:true

                    }

                );

            const uid =

                response.data.localId;

            await db

                .collection("users")

                .doc(uid)

                .set({

                    uid,

                    firstName,

                    lastName,

                    email,

                    phone:

                    phone || "",

                    country:

                    country || "",

                    gender:

                    gender || "",

                    dateOfBirth:

                    dateOfBirth || "",

                    createdAt:

                    admin.firestore.FieldValue.serverTimestamp()

                });

            return res.status(201).json({

                success:true,

                message:

                "Account created successfully.",

                uid,

                idToken:

                response.data.idToken,

                refreshToken:

                response.data.refreshToken

            });

        }

        catch(error){

            console.error(

                error.response?.data ||

                error.message

            );

            return res.status(400).json({

                success:false,

                message:

                error.response?.data?.error?.message ||

                "Signup failed."

            });

        }

    }

);

// ==========================================
// End Part 2
// ==========================================
// ==========================================
// POST /api/auth/login
// ==========================================

router.post(

    "/login",

    async(req,res)=>{

        try{

            const {

                email,

                password

            } = req.body;

            if(

                !email ||

                !password

            ){

                return res.status(400).json({

                    success:false,

                    message:

                    "Email and password are required."

                });

            }

            const response =

                await axios.post(

                    `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_API_KEY}`,

                    {

                        email,

                        password,

                        returnSecureToken:true

                    }

                );

            const userDoc =

                await db

                .collection("users")

                .doc(response.data.localId)

                .get();

            return res.json({

                success:true,

                message:

                "Login successful.",

                uid:

                response.data.localId,

                idToken:

                response.data.idToken,

                refreshToken:

                response.data.refreshToken,

                expiresIn:

                response.data.expiresIn,

                user:

                userDoc.exists ?

                userDoc.data() :

                null

            });

        }

        catch(error){

            console.error(

                error.response?.data ||

                error.message

            );

            return res.status(401).json({

                success:false,

                message:

                error.response?.data?.error?.message ||

                "Invalid email or password."

            });

        }

    }

);

// ==========================================
// End Part 3
// ==========================================

// ==========================================
// POST /api/auth/forgot-password
// ==========================================

router.post(

    "/forgot-password",

    async(req,res)=>{

        try{

            const {

                email

            } = req.body;

            if(!email){

                return res.status(400).json({

                    success:false,

                    message:"Email is required."

                });

            }

            await axios.post(

                `https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${FIREBASE_API_KEY}`,

                {

                    requestType:"PASSWORD_RESET",

                    email

                }

            );

            return res.json({

                success:true,

                message:

                "Password reset email sent."

            });

        }

        catch(error){

            console.error(

                error.response?.data ||

                error.message

            );

            return res.status(400).json({

                success:false,

                message:

                error.response?.data?.error?.message ||

                "Unable to send password reset email."

            });

        }

    }

);

// ==========================================
// POST /api/auth/verify-token
// ==========================================

router.post(

    "/verify-token",

    async(req,res)=>{

        try{

            const {

                idToken

            } = req.body;

            if(!idToken){

                return res.status(400).json({

                    success:false,

                    message:"ID Token is required."

                });

            }

            const decodedToken =

                await admin.auth()

                .verifyIdToken(idToken);

            const userDoc =

                await db

                .collection("users")

                .doc(decodedToken.uid)

                .get();

            return res.json({

                success:true,

                authenticated:true,

                user:

                userDoc.exists ?

                userDoc.data() :

                null,

                decodedToken

            });

        }

        catch(error){

            console.error(error);

            return res.status(401).json({

                success:false,

                authenticated:false,

                message:"Invalid or expired token."

            });

        }

    }

);

// ==========================================
// End Part 4
// ==========================================
// ==========================================
// DELETE /api/auth/delete-account
// ==========================================

router.delete(

    "/delete-account",

    authenticateUser,

    async(req,res)=>{

        try{

            const uid = req.user.uid;

            await db

                .collection("users")

                .doc(uid)

                .delete();

            await admin.auth()

                .deleteUser(uid);

            return res.json({

                success:true,

                message:

                "Account deleted successfully."

            });

        }

        catch(error){

            console.error(error);

            return res.status(500).json({

                success:false,

                message:

                "Failed to delete account."

            });

        }

    }

);

// ==========================================
// GET /api/auth/refresh-profile
// ==========================================

router.get(

    "/refresh-profile",

    authenticateUser,

    async(req,res)=>{

        try{

            const uid = req.user.uid;

            const userRecord =

                await admin.auth()

                .getUser(uid);

            const userDoc =

                await db

                .collection("users")

                .doc(uid)

                .get();

            return res.json({

                success:true,

                auth:{

                    uid:userRecord.uid,

                    email:userRecord.email,

                    displayName:userRecord.displayName,

                    phoneNumber:userRecord.phoneNumber,

                    photoURL:userRecord.photoURL,

                    emailVerified:userRecord.emailVerified,

                    disabled:userRecord.disabled

                },

                profile:

                    userDoc.exists ?

                    userDoc.data() :

                    null

            });

        }

        catch(error){

            console.error(error);

            return res.status(500).json({

                success:false,

                message:

                "Unable to refresh profile."

            });

        }

    }

);

// ==========================================
// End Part 5
// ==========================================
// ==========================================
// GET /api/auth/status
// ==========================================

router.get(

    "/status",

    (req,res)=>{

        return res.json({

            success:true,

            service:"EchoCall AI Authentication",

            version:"1.0.0",

            status:"Online",

            timestamp:new Date().toISOString()

        });

    }

);

// ==========================================
// GET /api/auth/routes
// ==========================================

router.get(

    "/routes",

    (req,res)=>{

        return res.json({

            success:true,

            routes:[

                "POST /signup",

                "POST /login",

                "POST /forgot-password",

                "POST /verify-token",

                "GET /me",

                "POST /profile",

                "GET /session",

                "POST /logout",

                "DELETE /delete-account",

                "GET /refresh-profile",

                "GET /ping",

                "GET /status"

            ]

        });

    }

);



// ==========================================
// End of File
// ==========================================