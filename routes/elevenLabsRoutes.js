
/* ==========================================
   EchoCall AI
   File: server/routes/elevenLabsRoutes.js

   ElevenLabs Voice Routes
========================================== */

import express from "express";

import { authenticateUser } from "../middleware/authMiddleware.js";

import {
  textToSpeech,
  getVoices,
  getVoice,
  testElevenLabs
} from "../services/elevenLabsService.js";


/* ==========================================
   ROUTER
========================================== */

const router = express.Router();


/* ==========================================
   GET AVAILABLE VOICES
========================================== */

router.get(
  "/voices",
  authenticateUser,
  async (req, res) => {

    try {

      const voices = await getVoices();

      return res.status(200).json({

        success: true,

        provider: "elevenlabs",

        voices

      });

    } catch (error) {

      console.error(
        "ElevenLabs voices error:",
        error
      );

      return res.status(500).json({

        success: false,

        message: "Failed to load ElevenLabs voices."

      });

    }

  }
);


/* ==========================================
   GET ONE VOICE
========================================== */

router.get(
  "/voices/:voiceId",
  authenticateUser,
  async (req, res) => {

    try {

      const { voiceId } = req.params;

      if (!voiceId) {

        return res.status(400).json({

          success: false,

          message: "Voice ID is required."

        });

      }

      const voice = await getVoice(voiceId);

      return res.status(200).json({

        success: true,

        provider: "elevenlabs",

        voice

      });

    } catch (error) {

      console.error(
        "ElevenLabs single voice error:",
        error
      );

      return res.status(500).json({

        success: false,

        message: "Failed to load voice."

      });

    }

  }
);


/* ==========================================
   TEXT TO SPEECH
========================================== */

router.post(
  "/text-to-speech",
  authenticateUser,
  async (req, res) => {

    try {

      const {

        text,

        voiceId,

        model = "eleven_multilingual_v2",

        stability = 0.5,

        similarity = 0.75

      } = req.body;


      /* ==========================================
         VALIDATION
      ========================================== */

      if (
        !text ||
        typeof text !== "string" ||
        !text.trim()
      ) {

        return res.status(400).json({

          success: false,

          message: "Text is required."

        });

      }


      if (!voiceId || typeof voiceId !== "string") {

        return res.status(400).json({

          success: false,

          message: "Voice ID is required."

        });

      }


      if (text.trim().length > 5000) {

        return res.status(400).json({

          success: false,

          message: "Text cannot exceed 5000 characters."

        });

      }


      /* ==========================================
         SAFE SETTINGS
      ========================================== */

      const safeStability = Math.min(
        1,
        Math.max(0, Number(stability))
      );


      const safeSimilarity = Math.min(
        1,
        Math.max(0, Number(similarity))
      );


      /* ==========================================
         GENERATE AUDIO
      ========================================== */

      const audioBuffer = await textToSpeech({

        text: text.trim(),

        voiceId: voiceId.trim(),

        model,

        stability: safeStability,

        similarityBoost: safeSimilarity

      });


      /* ==========================================
         CONVERT AUDIO TO BASE64
      ========================================== */

      const base64Audio = Buffer
        .from(audioBuffer)
        .toString("base64");


      const audioDataUrl =
        `data:audio/mpeg;base64,${base64Audio}`;


      /* ==========================================
         RESPONSE
      ========================================== */

      return res.status(200).json({

        success: true,

        provider: "elevenlabs",

        audio: audioDataUrl,

        mimeType: "audio/mpeg",

        voiceId,

        model

      });


    } catch (error) {

      console.error(
        "ElevenLabs text-to-speech error:",
        error
      );


      return res.status(500).json({

        success: false,

        message:
          error.message ||
          "Failed to generate voice audio."

      });

    }

  }
);


/* ==========================================
   TEST ELEVENLABS CONNECTION
========================================== */

router.get(
  "/test",
  authenticateUser,
  async (req, res) => {

    try {

      const result = await testElevenLabs();

      return res.status(200).json({

        success: true,

        provider: "elevenlabs",

        result

      });

    } catch (error) {

      console.error(
        "ElevenLabs test error:",
        error
      );

      return res.status(500).json({

        success: false,

        message:
          error.message ||
          "ElevenLabs connection test failed."

      });

    }

  }
);


/* ==========================================
   EXPORT ROUTER
========================================== */

export default router;
