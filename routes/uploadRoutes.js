// ==========================================
// EchoCall AI Backend
// File: server/routes/uploadRoutes.js
// ==========================================

import express from "express";
import multer from "multer";
import { v4 as uuidv4 } from "uuid";

import { authenticateUser }
from "../middleware/authMiddleware.js";

import {
    bucket,
    db
}
from "../services/firebaseAdmin.js";

const router = express.Router();

// ==========================================
// Multer
// ==========================================

const upload = multer({

    storage: multer.memoryStorage(),

    limits: {

        fileSize: 10 * 1024 * 1024

    }

});

// ==========================================
// Upload Profile Picture
// ==========================================

router.post(

    "/profile-photo",

    authenticateUser,

    upload.single("photo"),

    async(req,res)=>{

        try{

            if(!req.file){

                return res.status(400).json({

                    success:false,

                    message:"No image uploaded."

                });

            }

            const extension =

                req.file.originalname

                .split(".")

                .pop();

            const fileName =

                `profilePictures/${req.user.uid}/${Date.now()}.${extension}`;

            const file =

                bucket.file(fileName);

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

            const photoURL =

                `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(fileName)}?alt=media&token=${token}`;

            await db

                .collection("users")

                .doc(req.user.uid)

                .set({

                    photoURL,

                    updatedAt:new Date()

                },

                {

                    merge:true

                });

            return res.json({

                success:true,

                photoURL

            });

        }

        catch(error){

            console.error(error);

            return res.status(500).json({

                success:false,

                message:"Image upload failed."

            });

        }

    }

);

export default router;