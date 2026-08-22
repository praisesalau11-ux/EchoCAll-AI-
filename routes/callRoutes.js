// ==========================================
// EchoCall AI Backend
// File: server/routes/callRoutes.js
// Part 1
// ==========================================

// ==========================================
// Imports
// ==========================================

import express from "express";

import multer from "multer";

import { v4 as uuidv4 } from "uuid";

import {

    authenticateUser

} from "../middleware/authMiddleware.js";

import {

    db,

    bucket

} from "../services/firebaseAdmin.js";

import {

    startPhoneCall,

    endPhoneCall

} from "../services/twilioService.js";

import {

    generateSummary,

    translateText,

    extractActions

} from "../services/openaiService.js";

// ==========================================
// Router
// ==========================================

const router = express.Router();

// ==========================================
// Start AI Call
// ==========================================

router.post(

    "/start",

    authenticateUser,

    async(req,res)=>{

        try{

            const {

                phoneNumber,

                language,

                voice,

                personality,

                tone,

                speechSpeed,

                prompt

            } = req.body;

            if(

                !phoneNumber ||

                phoneNumber.trim()===""

            ){

                return res.status(400).json({

                    success:false,

                    message:

                    "Phone number is required."

                });

            }

            const call =

                await startPhoneCall({

                    to:phoneNumber

                });

            const callData = {

                callSid:

                call.sid,

                phoneNumber,

                language:

                language || "en",

                voice:

                voice || "default",

                personality:

                personality ||

                "professional",

                tone:

                tone ||

                "neutral",

                speechSpeed:

                speechSpeed ||

                "normal",

                prompt:

                prompt || "",

                status:

                "calling",

                createdAt:

                new Date(),

                userId:

                req.user.uid

            };

            await db

                .collection("users")

                .doc(req.user.uid)

                .collection("calls")

                .doc(call.sid)

                .set(callData);

            return res.json({

                success:true,

                callSid:

                call.sid,

                status:

                "calling"

            });

        }

        catch(error){

            console.error(error);

            return res.status(500).json({

                success:false,

                message:

                "Unable to start call."

            });

        }

    }

);

// ==========================================
// End Part 1
// ==========================================
// ==========================================
// EchoCall AI Backend
// File: server/routes/callRoutes.js
// Part 2
// ==========================================

// ==========================================
// End Call
// ==========================================

router.post(

    "/end",

    authenticateUser,

    async(req,res)=>{

        try{

            const {

                callSid,

                duration = 0

            } = req.body;

            if(!callSid){

                return res.status(400).json({

                    success:false,

                    message:

                    "Call SID is required."

                });

            }

            await endPhoneCall(

                callSid

            );

            await db

                .collection("users")

                .doc(req.user.uid)

                .collection("calls")

                .doc(callSid)

                .set({

                    status:

                    "completed",

                    duration,

                    endedAt:

                    new Date()

                },

                {

                    merge:true

                });

            return res.json({

                success:true,

                message:

                "Call ended."

            });

        }

        catch(error){

            console.error(error);

            return res.status(500).json({

                success:false,

                message:

                "Unable to end call."

            });

        }

    }

);

// ==========================================
// Get Call History
// ==========================================

router.get(

    "/history",

    authenticateUser,

    async(req,res)=>{

        try{

            const snapshot =

                await db

                .collection("users")

                .doc(req.user.uid)

                .collection("calls")

                .orderBy(

                    "createdAt",

                    "desc"

                )

                .get();

            const calls = [];

            snapshot.forEach(doc=>{

                calls.push({

                    id:doc.id,

                    ...doc.data()

                });

            });

            return res.json({

                success:true,

                total:

                calls.length,

                calls

            });

        }

        catch(error){

            console.error(error);

            return res.status(500).json({

                success:false,

                message:

                "Unable to load call history."

            });

        }

    }

);



// ==========================================
// End Part 2
// ==========================================
// ==========================================
// EchoCall AI Backend
// File: server/routes/callRoutes.js
// Part 3
// ==========================================

// ==========================================
// Save Transcript
// ==========================================

router.post(

    "/transcript",

    authenticateUser,

    async(req,res)=>{

        try{

            const {

                callSid,

                transcript

            } = req.body;

            if(

                !callSid ||

                !transcript

            ){

                return res.status(400).json({

                    success:false,

                    message:

                    "Call SID and transcript are required."

                });

            }

            await db

                .collection("users")

                .doc(req.user.uid)

                .collection("calls")

                .doc(callSid)

                .set({

                    transcript,

                    transcriptUpdatedAt:

                    new Date()

                },

                {

                    merge:true

                });

            return res.json({

                success:true,

                message:

                "Transcript saved."

            });

        }

        catch(error){

            console.error(error);

            return res.status(500).json({

                success:false,

                message:

                "Unable to save transcript."

            });

        }

    }

);

// ==========================================
// Generate AI Summary
// ==========================================

router.post(

    "/summary",

    authenticateUser,

    async(req,res)=>{

        try{

            const {

                callSid,

                transcript

            } = req.body;

            if(

                !callSid ||

                !transcript

            ){

                return res.status(400).json({

                    success:false,

                    message:

                    "Transcript required."

                });

            }

            const summary =

                await generateSummary(

                    transcript

                );

            await db

                .collection("users")

                .doc(req.user.uid)

                .collection("calls")

                .doc(callSid)

                .set({

                    summary,

                    summaryCreatedAt:

                    new Date()

                },

                {

                    merge:true

                });

            return res.json({

                success:true,

                summary

            });

        }

        catch(error){

            console.error(error);

            return res.status(500).json({

                success:false,

                message:

                "Unable to generate summary."

            });

        }

    }

);

// ==========================================
// Translate Transcript
// ==========================================

router.post(

    "/translate",

    authenticateUser,

    async(req,res)=>{

        try{

            const {

                transcript,

                language

            } = req.body;

            if(

                !transcript ||

                !language

            ){

                return res.status(400).json({

                    success:false,

                    message:

                    "Transcript and language are required."

                });

            }

            const translation =

                await translateText(

                    transcript,

                    language

                );

            return res.json({

                success:true,

                translation

            });

        }

        catch(error){

            console.error(error);

            return res.status(500).json({

                success:false,

                message:

                "Translation failed."

            });

        }

    }

);

// ==========================================
// Extract Action Items
// ==========================================

router.post(

    "/actions",

    authenticateUser,

    async(req,res)=>{

        try{

            const {

                transcript

            } = req.body;

            if(!transcript){

                return res.status(400).json({

                    success:false,

                    message:

                    "Transcript required."

                });

            }

            const actions =

                await extractActions(

                    transcript

                );

            return res.json({

                success:true,

                actions

            });

        }

        catch(error){

            console.error(error);

            return res.status(500).json({

                success:false,

                message:

                "Unable to extract action items."

            });

        }

    }

);

// ==========================================
// End Part 3
// ==========================================
// ==========================================
// EchoCall AI Backend
// File: server/routes/callRoutes.js
// Part 4
// ==========================================

// ==========================================



// ==========================================
// Multer
// ==========================================

const upload = multer({

    storage:

    multer.memoryStorage(),

    limits:{

        fileSize:

        100 * 1024 * 1024

    }

});

// ==========================================
// Upload Recording
// ==========================================

router.post(

    "/recording",

    authenticateUser,

    upload.single(

        "recording"

    ),

    async(req,res)=>{

        try{

            const {

                callSid

            } = req.body;

            if(

                !req.file ||

                !callSid

            ){

                return res.status(400).json({

                    success:false,

                    message:

                    "Recording and Call SID are required."

                });

            }

            const fileName =

                `recordings/${req.user.uid}/${callSid}-${Date.now()}.webm`;

            const file =

                bucket.file(

                    fileName

                );

            const token = uuidv4();

await file.save(

    req.file.buffer,

    {

        metadata:{

            contentType:

            req.file.mimetype,

            metadata:{

                firebaseStorageDownloadTokens:

                token

            }

        }

    }

);

const recordingURL =

`https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(fileName)}?alt=media&token=${token}`;

            await db

                .collection("users")

                .doc(req.user.uid)

                .collection("calls")

                .doc(callSid)

                .set({

                    recordingURL,

                    recordingPath:

                    fileName,

                    uploadedAt:

                    new Date()

                },

                {

                    merge:true

                });

            return res.json({

                success:true,

                recordingURL

            });

        }

        catch(error){

            console.error(error);

            return res.status(500).json({

                success:false,

                message:

                "Recording upload failed."

            });

        }

    }

);

// ==========================================
// Get Recording
// ==========================================

router.get(

    "/recording/:callSid",

    authenticateUser,

    async(req,res)=>{

        try{

            const document =

                await db

                .collection("users")

                .doc(req.user.uid)

                .collection("calls")

                .doc(

                    req.params.callSid

                )

                .get();

            if(

                !document.exists

            ){

                return res.status(404).json({

                    success:false,

                    message:

                    "Call not found."

                });

            }

            const data =

                document.data();

            return res.json({

                success:true,

                recordingURL:

                data.recordingURL ||

                null

            });

        }

        catch(error){

            console.error(error);

            return res.status(500).json({

                success:false,

                message:

                "Unable to load recording."

            });

        }

    }

);

// ==========================================
// Delete Recording
// ==========================================

router.delete(

    "/recording/:callSid",

    authenticateUser,

    async(req,res)=>{

        try{

            const reference =

                db

                .collection("users")

                .doc(req.user.uid)

                .collection("calls")

                .doc(

                    req.params.callSid

                );

            const document =

                await reference.get();

            if(

                !document.exists

            ){

                return res.status(404).json({

                    success:false,

                    message:

                    "Recording not found."

                });

            }

            const data =

                document.data();

            if(

                data.recordingPath

            ){

                await bucket

                    .file(

                        data.recordingPath

                    )

                    .delete()

                    .catch(()=>{});

            }

            await reference.set({

                recordingURL:null,

                recordingPath:null

            },

            {

                merge:true

            });

            return res.json({

                success:true,

                message:

                "Recording deleted."

            });

        }

        catch(error){

            console.error(error);

            return res.status(500).json({

                success:false,

                message:

                "Unable to delete recording."

            });

        }

    }

);

// ==========================================
// End Part 4
// ==========================================
// ==========================================
// EchoCall AI Backend
// File: server/routes/callRoutes.js
// Part 5
// ==========================================

// ==========================================
// Delete Call History Item
// ==========================================

router.delete(

    "/:callSid",

    authenticateUser,

    async(req,res)=>{

        try{

            const {

                callSid

            } = req.params;

            await db

                .collection("users")

                .doc(req.user.uid)

                .collection("calls")

                .doc(callSid)

                .delete();

            return res.json({

                success:true,

                message:

                "Call deleted."

            });

        }

        catch(error){

            console.error(error);

            return res.status(500).json({

                success:false,

                message:

                "Unable to delete call."

            });

        }

    }

);

// ==========================================
// Favorite Contact
// ==========================================

router.post(

    "/favorite",

    authenticateUser,

    async(req,res)=>{

        try{

            const {

                phoneNumber,

                name

            } = req.body;

            if(!phoneNumber){

                return res.status(400).json({

                    success:false,

                    message:

                    "Phone number required."

                });

            }

            await db

                .collection("users")

                .doc(req.user.uid)

                .collection("favoriteContacts")

                .doc(phoneNumber)

                .set({

                    phoneNumber,

                    name:

                    name ||

                    phoneNumber,

                    createdAt:

                    new Date()

                });

            return res.json({

                success:true,

                message:

                "Added to favourites."

            });

        }

        catch(error){

            console.error(error);

            return res.status(500).json({

                success:false,

                message:

                "Unable to save favourite."

            });

        }

    }

);

// ==========================================
// Get Favourite Contacts
// ==========================================

router.get(

    "/favorites",

    authenticateUser,

    async(req,res)=>{

        try{

            const snapshot =

                await db

                .collection("users")

                .doc(req.user.uid)

                .collection("favoriteContacts")

                .orderBy(

                    "createdAt",

                    "desc"

                )

                .get();

            const favorites = [];

            snapshot.forEach(doc=>{

                favorites.push({

                    id:doc.id,

                    ...doc.data()

                });

            });

            return res.json({

                success:true,

                favorites

            });

        }

        catch(error){

            console.error(error);

            return res.status(500).json({

                success:false,

                message:

                "Unable to load favourites."

            });

        }

    }

);

// ==========================================
// Remove Favourite
// ==========================================

router.delete(

    "/favorite/:phoneNumber",

    authenticateUser,

    async(req,res)=>{

        try{

            await db

                .collection("users")

                .doc(req.user.uid)

                .collection("favoriteContacts")

                .doc(

                    req.params.phoneNumber

                )

                .delete();

            return res.json({

                success:true,

                message:

                "Favourite removed."

            });

        }

        catch(error){

            console.error(error);

            return res.status(500).json({

                success:false,

                message:

                "Unable to remove favourite."

            });

        }

    }

);

// ==========================================
// Call Statistics
// ==========================================

router.get(
    "/statistics",
    authenticateUser,
    async (req, res) => {

        try {

            const snapshot =
                await db
                    .collection("users")
                    .doc(req.user.uid)
                    .collection("calls")
                    .get();

            let totalCalls = 0;
            let completedCalls = 0;
            let totalDuration = 0;
            let todayCalls = 0;

            const today = new Date();

            today.setHours(0, 0, 0, 0);

            snapshot.forEach(doc => {

                const data = doc.data();

                totalCalls++;

                if (
                    data.status === "completed"
                ) {
                    completedCalls++;
                }

                totalDuration +=
                    Number(data.duration) || 0;

                if (data.createdAt) {

                    const callDate =
                        data.createdAt.toDate
                            ? data.createdAt.toDate()
                            : new Date(data.createdAt);

                    if (
                        callDate >= today
                    ) {
                        todayCalls++;
                    }

                }

            });

            return res.json({

                success: true,

                statistics: {

                    totalCalls,

                    todayCalls,

                    completedCalls,

                    totalDuration

                }

            });

        }
        catch (error) {

            console.error(
                "Call Statistics Error:",
                error
            );

            return res.status(500).json({

                success: false,

                message:
                    "Unable to load call statistics."

            });

        }

    }
);
 
// ==========================================
// End Part 5
// ==========================================
// ==========================================
// EchoCall AI Backend
// File: server/routes/callRoutes.js
// Part 6 (Final)
// ==========================================

// ==========================================
// Export Call History
// ==========================================

router.get(

    "/export",

    authenticateUser,

    async(req,res)=>{

        try{

            const snapshot =

                await db

                .collection("users")

                .doc(req.user.uid)

                .collection("calls")

                .orderBy(

                    "createdAt",

                    "desc"

                )

                .get();

            const calls = [];

            snapshot.forEach(doc=>{

                calls.push({

                    id:doc.id,

                    ...doc.data()

                });

            });

            return res.json({

                success:true,

                exportedAt:

                new Date(),

                total:

                calls.length,

                calls

            });

        }

        catch(error){

            console.error(error);

            return res.status(500).json({

                success:false,

                message:

                "Unable to export call history."

            });

        }

    }

);

// ==========================================
// Recent Calls
// ==========================================

router.get(

    "/recent",

    authenticateUser,

    async(req,res)=>{

        try{

            const snapshot =

                await db

                .collection("users")

                .doc(req.user.uid)

                .collection("calls")

                .orderBy(

                    "createdAt",

                    "desc"

                )

                .limit(10)

                .get();

            const recentCalls = [];

            snapshot.forEach(doc=>{

                recentCalls.push({

                    id:doc.id,

                    ...doc.data()

                });

            });

            return res.json({

                success:true,

                recentCalls

            });

        }

        catch(error){

            console.error(error);

            return res.status(500).json({

                success:false,

                message:

                "Unable to load recent calls."

            });

        }

    }

);

// ==========================================
// Search Calls
// ==========================================

router.get(

    "/search/:phone",

    authenticateUser,

    async(req,res)=>{

        try{

            const snapshot =

                await db

                .collection("users")

                .doc(req.user.uid)

                .collection("calls")

                .where(

                    "phoneNumber",

                    "==",

                    req.params.phone

                )

                .get();

            const results = [];

            snapshot.forEach(doc=>{

                results.push({

                    id:doc.id,

                    ...doc.data()

                });

            });

            return res.json({

                success:true,

                results

            });

        }

        catch(error){

            console.error(error);

            return res.status(500).json({

                success:false,

                message:

                "Search failed."

            });

        }

    }

);

// ==========================================
// Backend Information
// ==========================================

router.get(

    "/info",

    (req,res)=>{

        res.json({

            success:true,

            service:

            "EchoCall AI Calls API",

            version:

            "1.0.0",

            status:

            "Running"

        });

    }

);

// ==========================================
// Get Single Call
// ==========================================

router.get(

    "/:callSid",

    authenticateUser,

    async(req,res)=>{

        try{

            const document =

                await db

                .collection("users")

                .doc(req.user.uid)

                .collection("calls")

                .doc(

                    req.params.callSid

                )

                .get();

            if(!document.exists){

                return res.status(404).json({

                    success:false,

                    message:

                    "Call not found."

                });

            }

            return res.json({

                success:true,

                call:document.data()

            });

        }

        catch(error){

            console.error(error);

            return res.status(500).json({

                success:false,

                message:

                "Unable to load call."

            });

        }

    }

);

// ==========================================
// Export Router
// ==========================================

export default router;