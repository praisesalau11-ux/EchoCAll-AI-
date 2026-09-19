import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { adminDb } from "../services/firebaseAdmin.js";


/* ==========================================
   TrustNet
   File: server/routes/authRoutes.js

   Authentication Routes
========================================== */


/* ==========================================
   CREATE ROUTER
========================================== */

const router =
    express.Router();


/* ==========================================
   AUTHENTICATION STATUS
========================================== */

router.get(
    "/status",
    authMiddleware,
    async (req, res) => {

        try {

            const userRecord =
                await adminDb
                    .collection("users")
                    .doc(req.user.uid)
                    .get();


            res.status(200).json({

                success: true,

                authenticated: true,

                user: {

                    uid:
                        req.user.uid,

                    email:
                        req.user.email || null,

                    emailVerified:
                        req.user.email_verified || false

                },

                profileExists:
                    userRecord.exists

            });

        } catch (error) {

            console.error(
                "Auth status error:",
                error
            );


            res.status(500).json({

                success: false,

                error:
                    "Unable to retrieve authentication status."

            });

        }

    }
);


/* ==========================================
   CURRENT USER
========================================== */

router.get(
    "/me",
    authMiddleware,
    async (req, res) => {

        try {

            const userRecord =
                await adminDb
                    .collection("users")
                    .doc(req.user.uid)
                    .get();


            res.status(200).json({

                success: true,

                user: {

                    uid:
                        req.user.uid,

                    email:
                        req.user.email || null,

                    emailVerified:
                        req.user.email_verified || false,

                    profile:
                        userRecord.exists
                            ? userRecord.data()
                            : null

                }

            });

        } catch (error) {

            console.error(
                "Current user error:",
                error
            );


            res.status(500).json({

                success: false,

                error:
                    "Unable to retrieve user profile."

            });

        }

    }
);


/* ==========================================
   EXPORT ROUTER
========================================== */

export default router;