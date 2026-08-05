// ==========================================
// EchoCall AI
// File: js/firebase.js
// ==========================================

// ==========================================
// Firebase App
// ==========================================

import { initializeApp }
from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";

// ==========================================
// Firebase Authentication
// ==========================================

import {
    getAuth,
    GoogleAuthProvider
}
from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

// ==========================================
// Cloud Firestore
// ==========================================

import {
    getFirestore
}
from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

// ==========================================
// Firebase Storage
// ==========================================

import {
    getStorage
}
from "https://www.gstatic.com/firebasejs/12.1.0/firebase-storage.js";

// ==========================================
// Realtime Database
// ==========================================

import {
    getDatabase
}
from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";

// ==========================================
// Firebase Configuration
// ==========================================

const firebaseConfig = {

    apiKey: "AIzaSyBt_-CXDaCXFRZFDtALgmJU_N8XcM07XfM",

    authDomain: "echocall--ai.firebaseapp.com",

    databaseURL:
    "https://echocall--ai-default-rtdb.europe-west1.firebasedatabase.app",

    projectId: "echocall--ai",

    storageBucket:
    "echocall--ai.firebasestorage.app",

    messagingSenderId:
    "825477654548",

    appId:
    "1:825477654548:web:67f40aeb68be77b3e25f01"

};

// ==========================================
// Initialize Firebase
// ==========================================

const app = initializeApp(firebaseConfig);

// ==========================================
// Firebase Services
// ==========================================

const auth = getAuth(app);

const db = getFirestore(app);

const storage = getStorage(app);

const realtimeDb = getDatabase(app);

// ==========================================
// Google Sign-In Provider
// ==========================================

const googleProvider = new GoogleAuthProvider();

googleProvider.setCustomParameters({

    prompt: "select_account"

});

// ==========================================
// Exports
// ==========================================

export {

    app,

    auth,

    db,

    storage,

    realtimeDb,

    googleProvider

};