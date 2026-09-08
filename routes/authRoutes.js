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
// Send 6-digit password reset code
// ==========================================

router.post(
    "/forgot-password",
    async (req, res) => {

        try {

            const email =
                req.body.email?.trim().toLowerCase();

            if (!email) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Email is required."

                });

            }

            // ==================================
            // Generate 6-digit OTP
            // ==================================

            const code =
                Math.floor(
                    100000 +
                    Math.random() * 900000
                ).toString();


            // ==================================
            // Find Firebase user
            // ==================================

            let userRecord;

            try {

                userRecord =
                    await admin
                        .auth()
                        .getUserByEmail(email);

            } catch (error) {

                // Do not reveal whether
                // the email exists.

                return res.json({

                    success: true,

                    message:
                        "If an account exists for this email, a verification code has been sent."

                });

            }


            // ==================================
            // Hash OTP
            // ==================================

            const crypto =
                await import("crypto");

            const codeHash =
                crypto
                    .createHash("sha256")
                    .update(code)
                    .digest("hex");


            // ==================================
            // Create reset challenge
            // ==================================

            const challengeRef =
                db
                    .collection("passwordResetChallenges")
                    .doc(userRecord.uid);


            await challengeRef.set({

                uid:
                    userRecord.uid,

                email:
                    email,

                codeHash:
                    codeHash,

                attempts:
                    0,

                verified:
                    false,

                createdAt:
                    admin
                        .firestore
                        .FieldValue
                        .serverTimestamp(),

                expiresAt:
                    new Date(
                        Date.now() +
                        10 * 60 * 1000
                    )

            });


            // ==================================
            // Send email with Resend
            // ==================================

            const resendResponse =
                await axios.post(

                    "https://api.resend.com/emails",

                    {

                        from: "EchoCall AI <noreply@echocall-ai.tech>",

                        to:
                            [email],

                        subject:
                            "Your EchoCall AI password reset code",

                        html: `
                            <div style="
                                font-family: Arial, sans-serif;
                                max-width: 500px;
                                margin: auto;
                                padding: 30px;
                                text-align: center;
                            ">

                                <h2>
                                    EchoCall AI
                                </h2>

                                <p>
                                    Use the verification code
                                    below to reset your password.
                                </p>

                                <div style="
                                    font-size: 32px;
                                    font-weight: bold;
                                    letter-spacing: 8px;
                                    margin: 30px 0;
                                ">
                                    ${code}
                                </div>

                                <p>
                                    This code expires in
                                    <strong>10 minutes</strong>.
                                </p>

                                <p style="
                                    color: #777;
                                    font-size: 13px;
                                ">
                                    If you did not request a
                                    password reset, you can
                                    safely ignore this email.
                                </p>

                            </div>
                        `

                    },

                    {

                        headers: {

                            Authorization:
                                `Bearer ${process.env.RESEND_API_KEY}`,

                            "Content-Type":
                                "application/json"

                        }

                    }

                );


            console.log(
                "Password reset email sent:",
                resendResponse.data?.id
            );


            // ==================================
            // Success
            // ==================================

            return res.json({

                success: true,

                message:
                    "If an account exists for this email, a verification code has been sent."

            });

        }

        catch (error) {

            console.error(
                "Forgot password error:",
                error.response?.data ||
                error.message
            );

            return res.status(500).json({

                success: false,

                message:
                    "Unable to process password reset."

            });

        }

    }

);

// ==========================================
// POST /api/auth/verify-reset-code
// Verify 6-digit password reset code
// ==========================================

router.post(
    "/verify-reset-code",
    async (req, res) => {

        try {

            const email =
                req.body.email?.trim().toLowerCase();

            const code =
                req.body.code?.trim();

            // ==================================
            // Validate input
            // ==================================

            if (!email || !code) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Email and verification code are required."

                });

            }

            if (!/^\d{6}$/.test(code)) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Verification code must be 6 digits."

                });

            }

            // ==================================
            // Find Firebase user
            // ==================================

            let userRecord;

            try {

                userRecord =
                    await admin
                        .auth()
                        .getUserByEmail(email);

            } catch (error) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid or expired verification code."

                });

            }

            const uid =
                userRecord.uid;

            // ==================================
            // Get reset challenge
            // ==================================

            const challengeRef =
                db
                    .collection("passwordResetChallenges")
                    .doc(uid);

            const challengeSnapshot =
                await challengeRef.get();

            if (!challengeSnapshot.exists) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid or expired verification code."

                });

            }

            const challenge =
                challengeSnapshot.data();

            // ==================================
            // Check if already verified
            // ==================================

            if (challenge.verified === true) {

                return res.status(400).json({

                    success: false,

                    message:
                        "This verification code has already been used."

                });

            }

            // ==================================
            // Check expiration
            // ==================================

            if (
                !challenge.expiresAt ||
                challenge.expiresAt.toDate() < new Date()
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Verification code has expired."

                });

            }

            // ==================================
            // Check attempts
            // ==================================

            const attempts =
                Number(challenge.attempts || 0);

            if (attempts >= 5) {

                return res.status(429).json({

                    success: false,

                    message:
                        "Too many incorrect attempts. Request a new code."

                });

            }

            // ==================================
            // Hash submitted code
            // ==================================

            const crypto =
                await import("crypto");

            const submittedCodeHash =
                crypto
                    .createHash("sha256")
                    .update(code)
                    .digest("hex");

            // ==================================
            // Compare hashes
            // ==================================

            if (
                submittedCodeHash !==
                challenge.codeHash
            ) {

                await challengeRef.update({

                    attempts:
                        attempts + 1

                });

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid or expired verification code."

                });

            }

            // ==================================
            // Generate reset token
            // ==================================

            const resetToken =
                crypto.randomBytes(32).toString("hex");

            const resetTokenHash =
                crypto
                    .createHash("sha256")
                    .update(resetToken)
                    .digest("hex");

            // ==================================
            // Mark challenge verified
            // ==================================

            await challengeRef.update({

                verified: true,

                verifiedAt:
                    admin
                        .firestore
                        .FieldValue
                        .serverTimestamp(),

                resetTokenHash:

                    resetTokenHash,

                resetTokenExpiresAt:

                    new Date(
                        Date.now() +
                        10 * 60 * 1000
                    )

            });

            // ==================================
            // Success
            // ==================================

            return res.json({

                success: true,

                message:
                    "Verification code confirmed.",

                resetToken

            });

        }

        catch (error) {

            console.error(
                "Verify reset code error:",
                error
            );

            return res.status(500).json({

                success: false,

                message:
                    "Unable to verify the code."

            });

        }

    }

);

// ==========================================
// POST /api/auth/reset-password
// Reset Firebase password using reset token
// ==========================================

router.post(
    "/reset-password",
    async (req, res) => {

        try {

            const email =
                req.body.email?.trim().toLowerCase();

            const resetToken =
                req.body.resetToken?.trim();

            const newPassword =
                req.body.newPassword;


            // ==================================
            // Validate input
            // ==================================

            if (
                !email ||
                !resetToken ||
                !newPassword
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Missing required fields."

                });

            }


            // ==================================
            // Validate password
            // ==================================

            if (
                typeof newPassword !== "string" ||
                newPassword.length < 6
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Password must be at least 6 characters."

                });

            }


            // ==================================
            // Find Firebase user
            // ==================================

            let userRecord;

            try {

                userRecord =
                    await admin
                        .auth()
                        .getUserByEmail(email);

            } catch (error) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid or expired reset session."

                });

            }


            const uid =
                userRecord.uid;


            // ==================================
            // Get reset challenge
            // ==================================

            const challengeRef =
                db
                    .collection(
                        "passwordResetChallenges"
                    )
                    .doc(uid);


            const challengeSnapshot =
                await challengeRef.get();


            if (!challengeSnapshot.exists) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid or expired reset session."

                });

            }


            const challenge =
                challengeSnapshot.data();


            // ==================================
            // Verify challenge
            // ==================================

            if (
                challenge.verified !== true
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Verification is required first."

                });

            }


            // ==================================
            // Check reset token
            // ==================================

            const crypto =
                await import("crypto");


            const resetTokenHash =
                crypto
                    .createHash("sha256")
                    .update(resetToken)
                    .digest("hex");


            if (
                resetTokenHash !==
                challenge.resetTokenHash
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid or expired reset session."

                });

            }


            // ==================================
            // Check token expiration
            // ==================================

            if (
                !challenge.resetTokenExpiresAt ||
                challenge
                    .resetTokenExpiresAt
                    .toDate() < new Date()
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Reset session has expired. Request a new code."

                });

            }


            // ==================================
            // Update Firebase password
            // ==================================

            await admin
                .auth()
                .updateUser(
                    uid,
                    {
                        password:
                            newPassword
                    }
                );


            // ==================================
            // Invalidate reset token
            // ==================================

            await challengeRef.update({

                resetTokenHash:
                    admin.firestore.FieldValue
                        .delete(),

                resetTokenExpiresAt:
                    admin.firestore.FieldValue
                        .delete(),

                verified:
                    false,

                completedAt:
                    admin.firestore.FieldValue
                        .serverTimestamp()

            });


            // ==================================
            // Success
            // ==================================

            return res.json({

                success: true,

                message:
                    "Password reset successfully."

            });

        }

        catch (error) {

            console.error(
                "Reset password error:",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    "Unable to reset password."

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
              
                "POST /verify-reset-code",

                "POST /reset-password",

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
// Export Router
// ==========================================

export default router;

//


// ==========================================
// End of File
// ==========================================