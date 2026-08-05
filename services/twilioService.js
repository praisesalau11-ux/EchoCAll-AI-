// ==========================================
// EchoCall AI Backend
// File: server/services/twilioService.js
// ==========================================

// ==========================================
// Imports
// ==========================================

import twilio from "twilio";

// ==========================================
// Environment Variables
// ==========================================

const {

    TWILIO_ACCOUNT_SID,

    TWILIO_AUTH_TOKEN,

    TWILIO_PHONE_NUMBER,

    APP_URL

} = process.env;

// ==========================================
// Twilio Client
// ==========================================

const client = twilio(

    TWILIO_ACCOUNT_SID,

    TWILIO_AUTH_TOKEN

);

// ==========================================
// Start Phone Call
// ==========================================

export async function startPhoneCall({

    to,

    webhook = `${APP_URL}/api/twilio/voice`

}){

    try{

        const call =

            await client.calls.create({

                to,

                from: TWILIO_PHONE_NUMBER,

                url: webhook

            });

        return call;

    }

    catch(error){

        console.error(

            "Twilio Start Call Error:",

            error

        );

        throw error;

    }

}

// ==========================================
// End Phone Call
// ==========================================

export async function endPhoneCall(

    callSid

){

    try{

        return await client

            .calls(callSid)

            .update({

                status: "completed"

            });

    }

    catch(error){

        console.error(

            "Twilio End Call Error:",

            error

        );

        throw error;

    }

}

// ==========================================
// Get Call Details
// ==========================================

export async function getCall(

    callSid

){

    try{

        return await client

            .calls(callSid)

            .fetch();

    }

    catch(error){

        console.error(

            "Twilio Fetch Call Error:",

            error

        );

        throw error;

    }

}

// ==========================================
// List Recent Calls
// ==========================================

export async function listCalls(

    limit = 20

){

    try{

        return await client.calls.list({

            limit

        });

    }

    catch(error){

        console.error(

            "Twilio List Calls Error:",

            error

        );

        throw error;

    }

}

// ==========================================
// Send SMS
// ==========================================

export async function sendSMS({

    to,

    body

}){

    try{

        return await client.messages.create({

            to,

            from: TWILIO_PHONE_NUMBER,

            body

        });

    }

    catch(error){

        console.error(

            "Twilio SMS Error:",

            error

        );

        throw error;

    }

}

// ==========================================
// Health Check
// ==========================================

export async function testTwilio(){

    try{

        const account =

            await client.api.accounts(

                TWILIO_ACCOUNT_SID

            ).fetch();

        return {

            success: true,

            accountSid: account.sid,

            friendlyName:

                account.friendlyName,

            status:

                account.status

        };

    }

    catch(error){

        console.error(

            "Twilio Test Error:",

            error

        );

        throw error;

    }

}

// ==========================================
// Export Client
// ==========================================

export {

    client

};

// ==========================================
// End of File
// ==========================================