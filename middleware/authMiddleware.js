// ==========================================
// EchoCall AI Backend
// File: server/middleware/authMiddleware.js
// ==========================================

// ==========================================
// Imports
// ==========================================

import { auth } from "../services/firebaseAdmin.js";

// ==========================================
// Firebase Authentication Middleware
// ==========================================

export async function authenticateUser(

    req,

    res,

    next

){

    try{

        const authorization =

            req.headers.authorization;

        if(

            !authorization ||

            !authorization.startsWith(

                "Bearer "

            )

        ){

            return res.status(401).json({

                success: false,

                error:

                "Authentication token is required."

            });

        }

        const idToken =

            authorization.replace(

                "Bearer ",

                ""

            ).trim();

        if(!idToken){

            return res.status(401).json({

                success: false,

                error:

                "Invalid authentication token."

            });

        }

        const decodedToken =

            await auth.verifyIdToken(

                idToken

            );

        req.user = {

            uid:

                decodedToken.uid,

            email:

                decodedToken.email ||

                null,

            name:

                decodedToken.name ||

                null,

            picture:

                decodedToken.picture ||

                null,

            emailVerified:

                decodedToken.email_verified ||

                false,

            firebase:

                decodedToken.firebase ||

                {}

        };

        next();

    }

    catch(error){

        console.error(

            "Authentication Error:",

            error

        );

        return res.status(401).json({

            success: false,

            error:

            "Authentication failed.",

            code:

            error.code ||

            "auth-error"

        });

    }

}

// ==========================================
// Optional Authentication Middleware
// ==========================================

export async function optionalAuthentication(

    req,

    res,

    next

){

    try{

        const authorization =

            req.headers.authorization;

        if(

            !authorization ||

            !authorization.startsWith(

                "Bearer "

            )

        ){

            req.user = null;

            return next();

        }

        const idToken =

            authorization.replace(

                "Bearer ",

                ""

            ).trim();

        const decodedToken =

            await auth.verifyIdToken(

                idToken

            );

        req.user = {

            uid:

                decodedToken.uid,

            email:

                decodedToken.email ||

                null,

            name:

                decodedToken.name ||

                null,

            picture:

                decodedToken.picture ||

                null,

            emailVerified:

                decodedToken.email_verified ||

                false,

            firebase:

                decodedToken.firebase ||

                {}

        };

        next();

    }

    catch{

        req.user = null;

        next();

    }

}

// ==========================================
// Admin Middleware
// ==========================================

export async function requireAdmin(

    req,

    res,

    next

){

    try{

        const decodedToken =

            await auth.verifyIdToken(

                req.headers.authorization

                .replace(

                    "Bearer ",

                    ""

                )

                .trim()

            );

        if(

            decodedToken.admin !== true

        ){

            return res.status(403).json({

                success: false,

                error:

                "Administrator access required."

            });

        }

        req.user = decodedToken;

        next();

    }

    catch(error){

        return res.status(401).json({

            success: false,

            error:

            "Authentication failed."

        });

    }

}

// ==========================================
// End of File
// ==========================================