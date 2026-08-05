// ==========================================
// EchoCall AI Backend
// File: server/routes/contactRoutes.js
// Part 1
// ==========================================

// ==========================================
// Imports
// ==========================================

import express from "express";

import crypto from "crypto";

import {

    authenticateUser

} from "../middleware/authMiddleware.js";

import {

    db

} from "../services/firebaseAdmin.js";

// ==========================================
// Router
// ==========================================

const router = express.Router();

// ==========================================
// Add Contact
// ==========================================

router.post(

    "/",

    authenticateUser,

    async(req,res)=>{

        try{

            const{

                name,

                email,

                phone,

                photoURL

            } = req.body;

            if(

                !name ||

                name.trim()===""

            ){

                return res.status(400).json({

                    success:false,

                    message:

                    "Contact name is required."

                });

            }

            const contactId =

                crypto.randomUUID();

            const contact = {

                id:contactId,

                name,

                email:email || "",

                phone:phone || "",

                photoURL:photoURL || "",

                favorite:false,

                blocked:false,

                createdAt:new Date(),

                updatedAt:new Date()

            };

            await db

                .collection("users")

                .doc(req.user.uid)

                .collection("contacts")

                .doc(contactId)

                .set(contact);

            return res.status(201).json({

                success:true,

                contact

            });

        }

        catch(error){

            console.error(error);

            return res.status(500).json({

                success:false,

                message:

                "Unable to create contact."

            });

        }

    }

);

// ==========================================
// Get All Contacts
// ==========================================

router.get(

    "/",

    authenticateUser,

    async(req,res)=>{

        try{

            const snapshot =

                await db

                .collection("users")

                .doc(req.user.uid)

                .collection("contacts")

                .orderBy(

                    "name"

                )

                .get();

            const contacts = [];

            snapshot.forEach(doc=>{

                contacts.push(

                    doc.data()

                );

            });

            return res.json({

                success:true,

                total:

                contacts.length,

                contacts

            });

        }

        catch(error){

            console.error(error);

            return res.status(500).json({

                success:false,

                message:

                "Unable to load contacts."

            });

        }

    }

);

// ==========================================
// End Part 1
// ==========================================

// ==========================================
// Get Single Contact
// ==========================================

router.get(

    "/:contactId",

    authenticateUser,

    async(req,res)=>{

        try{

            const {

                contactId

            } = req.params;

            const contactRef =

                db

                .collection("users")

                .doc(req.user.uid)

                .collection("contacts")

                .doc(contactId);

            const contactDoc =

                await contactRef.get();

            if(

                !contactDoc.exists

            ){

                return res.status(404).json({

                    success:false,

                    message:

                    "Contact not found."

                });

            }

            return res.json({

                success:true,

                contact:

                contactDoc.data()

            });

        }

        catch(error){

            console.error(error);

            return res.status(500).json({

                success:false,

                message:

                "Unable to load contact."

            });

        }

    }

);

// ==========================================
// Update Contact
// ==========================================

router.put(

    "/:contactId",

    authenticateUser,

    async(req,res)=>{

        try{

            const {

                contactId

            } = req.params;

            const {

                name,

                email,

                phone,

                photoURL

            } = req.body;

            const contactRef =

                db

                .collection("users")

                .doc(req.user.uid)

                .collection("contacts")

                .doc(contactId);

            const contactDoc =

                await contactRef.get();

            if(

                !contactDoc.exists

            ){

                return res.status(404).json({

                    success:false,

                    message:

                    "Contact not found."

                });

            }

            await contactRef.update({

                name,

                email,

                phone,

                photoURL,

                updatedAt:

                new Date()

            });

            const updated =

                await contactRef.get();

            return res.json({

                success:true,

                contact:

                updated.data()

            });

        }

        catch(error){

            console.error(error);

            return res.status(500).json({

                success:false,

                message:

                "Unable to update contact."

            });

        }

    }

);

// ==========================================
// End Part 2
// ==========================================

// ==========================================
// Delete Contact
// ==========================================

router.delete(

    "/:contactId",

    authenticateUser,

    async(req,res)=>{

        try{

            const {

                contactId

            } = req.params;

            const contactRef =

                db

                .collection("users")

                .doc(req.user.uid)

                .collection("contacts")

                .doc(contactId);

            const contactDoc =

                await contactRef.get();

            if(

                !contactDoc.exists

            ){

                return res.status(404).json({

                    success:false,

                    message:

                    "Contact not found."

                });

            }

            await contactRef.delete();

            return res.json({

                success:true,

                message:

                "Contact deleted successfully."

            });

        }

        catch(error){

            console.error(error);

            return res.status(500).json({

                success:false,

                message:

                "Unable to delete contact."

            });

        }

    }

);

// ==========================================
// Favorite / Unfavorite Contact
// ==========================================

router.patch(

    "/:contactId/favorite",

    authenticateUser,

    async(req,res)=>{

        try{

            const {

                contactId

            } = req.params;

            const contactRef =

                db

                .collection("users")

                .doc(req.user.uid)

                .collection("contacts")

                .doc(contactId);

            const contactDoc =

                await contactRef.get();

            if(

                !contactDoc.exists

            ){

                return res.status(404).json({

                    success:false,

                    message:

                    "Contact not found."

                });

            }

            const current =

                contactDoc.data();

            await contactRef.update({

                favorite:

                !current.favorite,

                updatedAt:

                new Date()

            });

            const updated =

                await contactRef.get();

            return res.json({

                success:true,

                contact:

                updated.data()

            });

        }

        catch(error){

            console.error(error);

            return res.status(500).json({

                success:false,

                message:

                "Unable to update favorite status."

            });

        }

    }

);

// ==========================================
// End Part 3
// ==========================================

// ==========================================
// Block / Unblock Contact
// ==========================================

router.patch(

    "/:contactId/block",

    authenticateUser,

    async(req,res)=>{

        try{

            const {

                contactId

            } = req.params;

            const contactRef =

                db

                .collection("users")

                .doc(req.user.uid)

                .collection("contacts")

                .doc(contactId);

            const contactDoc =

                await contactRef.get();

            if(

                !contactDoc.exists

            ){

                return res.status(404).json({

                    success:false,

                    message:

                    "Contact not found."

                });

            }

            const current =

                contactDoc.data();

            await contactRef.update({

                blocked:

                !current.blocked,

                updatedAt:

                new Date()

            });

            const updated =

                await contactRef.get();

            return res.json({

                success:true,

                contact:

                updated.data()

            });

        }

        catch(error){

            console.error(error);

            return res.status(500).json({

                success:false,

                message:

                "Unable to update blocked status."

            });

        }

    }

);

// ==========================================
// Search Contacts
// ==========================================

router.get(

    "/search/:query",

    authenticateUser,

    async(req,res)=>{

        try{

            const {

                query

            } = req.params;

            const snapshot =

                await db

                .collection("users")

                .doc(req.user.uid)

                .collection("contacts")

                .orderBy("name")

                .get();

            const results = [];

            snapshot.forEach(doc=>{

                const contact =

                    doc.data();

                const name =

                    (contact.name || "")

                    .toLowerCase();

                const email =

                    (contact.email || "")

                    .toLowerCase();

                const phone =

                    (contact.phone || "");

                const search =

                    query.toLowerCase();

                if(

                    name.includes(search) ||

                    email.includes(search) ||

                    phone.includes(query)

                ){

                    results.push(contact);

                }

            });

            return res.json({

                success:true,

                total:

                results.length,

                contacts:

                results

            });

        }

        catch(error){

            console.error(error);

            return res.status(500).json({

                success:false,

                message:

                "Unable to search contacts."

            });

        }

    }

);

// ==========================================
// End Part 4
// ==========================================
// ==========================================
// Recent Contacts
// ==========================================

router.get(

    "/recent/list",

    authenticateUser,

    async(req,res)=>{

        try{

            const snapshot =

                await db

                .collection("users")

                .doc(req.user.uid)

                .collection("contacts")

                .orderBy(

                    "updatedAt",

                    "desc"

                )

                .limit(10)

                .get();

            const contacts = [];

            snapshot.forEach(doc=>{

                contacts.push(

                    doc.data()

                );

            });

            return res.json({

                success:true,

                total:

                contacts.length,

                contacts

            });

        }

        catch(error){

            console.error(error);

            return res.status(500).json({

                success:false,

                message:

                "Unable to load recent contacts."

            });

        }

    }

);

// ==========================================
// Contact Statistics
// ==========================================

router.get(

    "/stats/summary",

    authenticateUser,

    async(req,res)=>{

        try{

            const snapshot =

                await db

                .collection("users")

                .doc(req.user.uid)

                .collection("contacts")

                .get();

            let total = 0;

            let favorites = 0;

            let blocked = 0;

            snapshot.forEach(doc=>{

                total++;

                const contact =

                    doc.data();

                if(contact.favorite){

                    favorites++;

                }

                if(contact.blocked){

                    blocked++;

                }

            });

            return res.json({

                success:true,

                stats:{

                    total,

                    favorites,

                    blocked

                }

            });

        }

        catch(error){

            console.error(error);

            return res.status(500).json({

                success:false,

                message:

                "Unable to load contact statistics."

            });

        }

    }

);

// ==========================================
// Export Router
// ==========================================

export default router;

// ==========================================
// End of File
// ==========================================