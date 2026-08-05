// ==========================================
// EchoCall AI Backend
// File: server/services/firebaseAdmin.js
// ==========================================

// ==========================================
// Imports
// ==========================================

import admin from "firebase-admin";

// ==========================================
// Environment Variables
// ==========================================

const {

    FIREBASE_PROJECT_ID,

    FIREBASE_CLIENT_EMAIL,

    FIREBASE_PRIVATE_KEY,

    FIREBASE_STORAGE_BUCKET

} = process.env;

// ==========================================
// Initialize Firebase Admin
// ==========================================

if (!admin.apps.length) {

    admin.initializeApp({

        credential: admin.credential.cert({

            projectId: FIREBASE_PROJECT_ID,

            clientEmail: FIREBASE_CLIENT_EMAIL,

            privateKey: FIREBASE_PRIVATE_KEY
                ?.replace(/\\n/g, "\n")

        }),

        storageBucket: FIREBASE_STORAGE_BUCKET

    });

}

// ==========================================
// Firebase Services
// ==========================================

const auth = admin.auth();

const db = admin.firestore();

const bucket = admin.storage().bucket();

// ==========================================
// Export Services
// ==========================================

export {

    admin,

    auth,

    db,

    bucket

};