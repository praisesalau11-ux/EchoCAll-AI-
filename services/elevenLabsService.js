// ==========================================
// EchoCall AI Backend
// File: server/services/elevenLabsService.js
// ==========================================

// ==========================================
// Constants
// ==========================================

const API_URL =

    "https://api.elevenlabs.io/v1";

// ==========================================
// API Key
// ==========================================

const API_KEY =

    process.env.ELEVENLABS_API_KEY;

// ==========================================
// Headers
// ==========================================

function getHeaders(){

    return {

        "xi-api-key": API_KEY,

        "Content-Type": "application/json"

    };

}

// ==========================================
// Text To Speech
// ==========================================

export async function textToSpeech({

    text,

    voiceId,

    model = "eleven_multilingual_v2"

}){

    const response =

        await fetch(

            `${API_URL}/text-to-speech/${voiceId}`,

            {

                method: "POST",

                headers: getHeaders(),

                body: JSON.stringify({

                    text,

                    model_id: model,

                    voice_settings: {

                        stability: 0.5,

                        similarity_boost: 0.75,

                        style: 0.2,

                        use_speaker_boost: true

                    }

                })

            }

        );

    if(!response.ok){

        throw new Error(

            await response.text()

        );

    }

    return await response.arrayBuffer();

}

// ==========================================
// Get Voices
// ==========================================

export async function getVoices(){

    const response =

        await fetch(

            `${API_URL}/voices`,

            {

                headers: getHeaders()

            }

        );

    if(!response.ok){

        throw new Error(

            await response.text()

        );

    }

    const data =

        await response.json();

    return data.voices;

}

// ==========================================
// Voice Details
// ==========================================

export async function getVoice(

    voiceId

){

    const response =

        await fetch(

            `${API_URL}/voices/${voiceId}`,

            {

                headers: getHeaders()

            }

        );

    if(!response.ok){

        throw new Error(

            await response.text()

        );

    }

    return await response.json();

}

// ==========================================
// Delete Voice
// ==========================================

export async function deleteVoice(

    voiceId

){

    const response =

        await fetch(

            `${API_URL}/voices/${voiceId}`,

            {

                method: "DELETE",

                headers: getHeaders()

            }

        );

    if(!response.ok){

        throw new Error(

            await response.text()

        );

    }

    return true;

}

// ==========================================
// Health Check
// ==========================================

export async function testElevenLabs(){

    const voices =

        await getVoices();

    return {

        success: true,

        totalVoices:

            voices.length

    };

}