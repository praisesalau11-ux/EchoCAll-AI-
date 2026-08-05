// ==========================================
// EchoCall AI Backend
// File: server/server.js
// ==========================================

// ==========================================
// Imports
// ==========================================

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import morgan from "morgan";

import authRoutes from "./routes/authRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import callRoutes from "./routes/callRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import contactsRoutes from "./routes/contactsRoutes.js";
import elevenLabsRoutes from "./routes/elevenLabsRoutes.js";

// ==========================================
// Load Environment Variables
// ==========================================

dotenv.config();

// ==========================================
// Create Express App
// ==========================================

const app = express();

// ==========================================
// Configuration
// ==========================================

const PORT = process.env.PORT || 3000;

// ==========================================
// Middleware
// ==========================================

app.use(helmet());

app.use(cors());

app.use(express.json({
    limit: "50mb"
}));

app.use(express.urlencoded({
    extended: true,
    limit: "50mb"
}));

app.use(morgan("dev"));

// ==========================================
// Root Route
// ==========================================

app.get("/", (req, res) => {

    res.json({

        success: true,

        app: "EchoCall AI Backend",

        version: "1.0.0",

        status: "Running"

    });

});

// ==========================================
// Health Check
// ==========================================

app.get("/health", (req, res) => {

    res.json({

        success: true,

        status: "healthy",

        timestamp: new Date().toISOString()

    });

});

// ==========================================
//  API Routes
// ==========================================
 app.use("/api/auth", authRoutes);
 app.use("/api/profile", profileRoutes);
 app.use("/api/upload", uploadRoutes);
 app.use("/api/calls", callRoutes);
 app.use("/api/contacts", contactsRoutes);
 app.use("/api/ai", aiRoutes);
// app.use("/api/twilio", twilioRoutes);
 app.use("/api/voice-clone", elevenLabsRoutes);

// ==========================================
// 404 Handler
// ==========================================

app.use((req, res) => {

    res.status(404).json({

        success: false,

        message: "Endpoint not found."

    });

});

// ==========================================
// Error Handler
// ==========================================

app.use((err, req, res, next) => {

    console.error(err);

    res.status(500).json({

        success: false,

        message: "Internal server error."

    });

});

// ==========================================
// Start Server
// ==========================================

app.listen(PORT, () => {

    console.log("");

    console.log("===================================");

    console.log(" EchoCall AI Backend Started");

    console.log("===================================");

    console.log(`Server : http://localhost:${PORT}`);

    console.log(`Port   : ${PORT}`);

    console.log("===================================");

});