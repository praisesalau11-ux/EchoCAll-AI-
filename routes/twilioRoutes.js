// ==========================================
// EchoCall AI Backend
// File: server/routes/twilioRoutes.js
// ==========================================

import express from "express";

const router = express.Router();

// ==========================================
// Twilio Voice Webhook
// ==========================================

router.post(
    "/voice",
    (req, res) => {

        console.log(
            "Twilio voice webhook received:",
            req.body
        );

        res.type("text/xml");

        res.send(`
            <?xml version="1.0" encoding="UTF-8"?>
            <Response>
                <Say>
                    Hello. You are connected to EchoCall AI.
                </Say>
            </Response>
        `);

    }
);

// ==========================================
// Export Router
// ==========================================

export default router;