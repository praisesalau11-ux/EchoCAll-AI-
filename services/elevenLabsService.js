
/*
==========================================
EchoCall AI Backend
File: server/services/elevenLabsService.js
Provider: ElevenLabs
==========================================
*/


// ==========================================
// Constants
// ==========================================

const API_URL = "https://api.elevenlabs.io/v1";

const API_KEY = process.env.ELEVENLABS_API_KEY;


// ==========================================
// API Key Validation
// ==========================================

function validateApiKey() {

    if (!API_KEY || API_KEY.trim() === "") {

        throw new Error(
            "ELEVENLABS_API_KEY is missing from environment variables."
        );

    }

}


// ==========================================
// Headers
// ==========================================

function getHeaders() {

    validateApiKey();

    return {

        "xi-api-key": API_KEY,

        "Content-Type": "application/json",

        "Accept": "application/json"

    };

}


// ==========================================
// Text To Speech
// ==========================================

export async function textToSpeech({

    text,

    voiceId,

    model = "eleven_multilingual_v2",

    stability = 0.5,

    similarityBoost = 0.75

}) {

    validateApiKey();


    if (!text || text.trim() === "") {

        throw new Error("Text is required.");

    }


    if (!voiceId || voiceId.trim() === "") {

        throw new Error(
            "ElevenLabs voice ID is required."
        );

    }


    const safeStability = Math.max(
        0,
        Math.min(1, Number(stability))
    );


    const safeSimilarityBoost = Math.max(
        0,
        Math.min(1, Number(similarityBoost))
    );


    const response = await fetch(

        `${API_URL}/text-to-speech/${encodeURIComponent(voiceId)}`,

        {

            method: "POST",

            headers: {

                "xi-api-key": API_KEY,

                "Content-Type": "application/json",

                "Accept": "audio/mpeg"

            },

            body: JSON.stringify({

                text: text.trim(),

                model_id: model,

                voice_settings: {

                    stability: safeStability,

                    similarity_boost: safeSimilarityBoost,

                    style: 0.2,

                    use_speaker_boost: true

                }

            })

        }

    );


    if (!response.ok) {

        const errorText = await response.text();

        console.error(
            "ElevenLabs Text-to-Speech Error:",
            response.status,
            errorText
        );

        throw new Error(

            `ElevenLabs TTS failed with status ${response.status}.`

        );

    }


    return await response.arrayBuffer();

}


// ==========================================
// Get All Voices
// ==========================================

export async function getVoices() {

    const response = await fetch(

        `${API_URL}/voices`,

        {

            method: "GET",

            headers: getHeaders()

        }

    );


    if (!response.ok) {

        const errorText = await response.text();

        console.error(
            "ElevenLabs Get Voices Error:",
            response.status,
            errorText
        );

        throw new Error(

            `Unable to load ElevenLabs voices. Status: ${response.status}`

        );

    }


    const data = await response.json();


    return data.voices || [];

}


// ==========================================
// Get One Voice
// ==========================================

export async function getVoice(voiceId) {

    validateApiKey();


    if (!voiceId || voiceId.trim() === "") {

        throw new Error("Voice ID is required.");

    }


    const response = await fetch(

        `${API_URL}/voices/${encodeURIComponent(voiceId)}`,

        {

            method: "GET",

            headers: getHeaders()

        }

    );


    if (!response.ok) {

        const errorText = await response.text();

        throw new Error(

            `Unable to retrieve voice. Status: ${response.status}`

        );

    }


    return await response.json();

}


// ==========================================
// Delete Voice
// ==========================================

export async function deleteVoice(voiceId) {

    validateApiKey();


    if (!voiceId || voiceId.trim() === "") {

        throw new Error("Voice ID is required.");

    }


    const response = await fetch(

        `${API_URL}/voices/${encodeURIComponent(voiceId)}`,

        {

            method: "DELETE",

            headers: getHeaders()

        }

    );


    if (!response.ok) {

        const errorText = await response.text();

        throw new Error(

            `Unable to delete voice. Status: ${response.status}`

        );

    }


    return true;

}


// ==========================================
// ElevenLabs Health Check
// ==========================================

export async function testElevenLabs() {

    const voices = await getVoices();


    return {

        success: true,

        provider: "elevenlabs",

        totalVoices: voices.length

    };

}
