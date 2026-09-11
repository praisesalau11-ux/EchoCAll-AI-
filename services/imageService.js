import { openai, MODEL } from "./openaiService.js";

const STABILITY_API_KEY = process.env.STABILITY_API_KEY;

const STABILITY_IMAGE_URL =
  "https://api.stability.ai/v2beta/stable-image/generate/core";

/*
|--------------------------------------------------------------------------
| EchoCall AI — Image Service
|--------------------------------------------------------------------------
| Uses Stability AI for real image generation.
|
| Supports:
| - Text → Image
| - Reference Image → Image
| - Aspect ratios
| - Style presets
| - PNG output
| - OpenAI image analysis
|--------------------------------------------------------------------------
*/


/*
|--------------------------------------------------------------------------
| Style Mapping
|--------------------------------------------------------------------------
|
| The Image Studio UI uses simple names.
| Stability AI uses specific style_preset values.
|
*/

const STYLE_PRESETS = {
  realistic: "photographic",
  cinematic: "cinematic",
  "digital-art": "digital-art",
  anime: "anime",
  "3d": "3d-model",
  illustration: "line-art",
  fantasy: "fantasy-art"
};


/*
|--------------------------------------------------------------------------
| Allowed Aspect Ratios
|--------------------------------------------------------------------------
*/

const ALLOWED_ASPECT_RATIOS = [
  "16:9",
  "1:1",
  "21:9",
  "2:3",
  "3:2",
  "4:5",
  "5:4",
  "9:16",
  "9:21"
];


/*
|--------------------------------------------------------------------------
| Get Valid Style Preset
|--------------------------------------------------------------------------
*/

function getStylePreset(style) {
  if (!style) {
    return null;
  }

  return STYLE_PRESETS[style] || null;
}


/*
|--------------------------------------------------------------------------
| Validate Aspect Ratio
|--------------------------------------------------------------------------
*/

function getAspectRatio(aspectRatio) {
  if (!aspectRatio) {
    return "1:1";
  }

  if (!ALLOWED_ASPECT_RATIOS.includes(aspectRatio)) {
    return "1:1";
  }

  return aspectRatio;
}


/*
|--------------------------------------------------------------------------
| Generate Image
|--------------------------------------------------------------------------
|
| Text → Image:
|
| generateImage("A futuristic city")
|
| Reference Image → Image:
|
| generateImage("Turn this into a cinematic poster", {
|   referenceBuffer,
|   referenceMimeType,
|   referenceStrength: 0.7
| })
|
|--------------------------------------------------------------------------
*/

export async function generateImage(prompt, options = {}) {
  try {
    /*
    |--------------------------------------------------------------------------
    | Configuration checks
    |--------------------------------------------------------------------------
    */

    if (!STABILITY_API_KEY) {
      throw new Error(
        "STABILITY_API_KEY is not configured on the server."
      );
    }

    if (!prompt || typeof prompt !== "string" || prompt.trim() === "") {
      throw new Error("Image prompt is required.");
    }


    /*
    |--------------------------------------------------------------------------
    | Options
    |--------------------------------------------------------------------------
    */

    const aspectRatio = getAspectRatio(options.aspectRatio);

    const stylePreset = getStylePreset(options.style);

    const referenceBuffer = options.referenceBuffer || null;

    const referenceMimeType =
      options.referenceMimeType || "image/png";

    let referenceStrength = Number(
      options.referenceStrength ?? 0.7
    );

    if (Number.isNaN(referenceStrength)) {
      referenceStrength = 0.7;
    }

    referenceStrength = Math.min(
      1,
      Math.max(0, referenceStrength)
    );


    /*
    |--------------------------------------------------------------------------
    | Build prompt
    |--------------------------------------------------------------------------
    |
    | Keep the user's original prompt intact.
    |
    */

    let finalPrompt = prompt.trim();


    /*
    |--------------------------------------------------------------------------
    | Build multipart request
    |--------------------------------------------------------------------------
    */

    const formData = new FormData();

    formData.append("prompt", finalPrompt);

    formData.append("output_format", "png");

    /*
    | Aspect ratio is supported for text-to-image.
    | For reference generation it is also supported by the
    | current Stability Core API.
    */

    formData.append("aspect_ratio", aspectRatio);


    /*
    |--------------------------------------------------------------------------
    | Style
    |--------------------------------------------------------------------------
    */

    if (stylePreset) {
      formData.append("style_preset", stylePreset);
    }


    /*
    |--------------------------------------------------------------------------
    | Reference image
    |--------------------------------------------------------------------------
    |
    | Stability requires:
    | - image
    | - strength
    | - mode=image-to-image
    |
    */

    if (referenceBuffer) {
      const imageBlob = new Blob(
        [referenceBuffer],
        {
          type: referenceMimeType
        }
      );

      formData.append(
        "image",
        imageBlob,
        "reference-image"
      );

      formData.append(
        "strength",
        String(referenceStrength)
      );

      formData.append(
        "mode",
        "image-to-image"
      );
    }


    /*
    |--------------------------------------------------------------------------
    | Send request to Stability AI
    |--------------------------------------------------------------------------
    */

    const response = await fetch(
      STABILITY_IMAGE_URL,
      {
        method: "POST",

        headers: {
          Authorization: `Bearer ${STABILITY_API_KEY}`,

          /*
          | image/* tells Stability to return the actual
          | generated image bytes.
          */
          Accept: "image/*"
        },

        body: formData
      }
    );


    /*
    |--------------------------------------------------------------------------
    | Handle errors
    |--------------------------------------------------------------------------
    */

    if (!response.ok) {
      let errorMessage =
        "Stability image generation failed.";

      try {
        const contentType =
          response.headers.get("content-type") || "";

        if (contentType.includes("application/json")) {
          const errorData =
            await response.json();

          if (Array.isArray(errorData.errors)) {
            errorMessage =
              errorData.errors.join(", ");
          } else if (errorData.message) {
            errorMessage =
              errorData.message;
          } else if (errorData.name) {
            errorMessage =
              errorData.name;
          }
        } else {
          const text =
            await response.text();

          if (text) {
            errorMessage = text;
          }
        }
      } catch {
        // Keep default error message.
      }


      /*
      |--------------------------------------------------------------------------
      | More useful status messages
      |--------------------------------------------------------------------------
      */

      if (response.status === 401) {
        errorMessage =
          "Stability AI API key is invalid or missing.";
      }

      if (response.status === 403) {
        errorMessage =
          "Stability AI rejected the request. The prompt or image may have been blocked.";
      }

      if (response.status === 413) {
        errorMessage =
          "The image request is too large. Reference images must stay within Stability AI's request limit.";
      }

      if (response.status === 422) {
        errorMessage =
          `Stability AI rejected the image parameters. ${errorMessage}`;
      }

      if (response.status === 429) {
        errorMessage =
          "Stability AI rate limit reached. Please try again shortly.";
      }

      throw new Error(errorMessage);
    }


    /*
    |--------------------------------------------------------------------------
    | Convert generated image to Base64
    |--------------------------------------------------------------------------
    */

    const imageBuffer =
      Buffer.from(
        await response.arrayBuffer()
      );

    const base64 =
      imageBuffer.toString("base64");


    /*
    |--------------------------------------------------------------------------
    | Return image
    |--------------------------------------------------------------------------
    */

    return {
      success: true,

      mimeType: "image/png",

      base64,

      dataUrl:
        `data:image/png;base64,${base64}`
    };

  } catch (error) {

    console.error(
      "Stability Image Generation Error:",
      error
    );

    throw error;
  }
}


/*
|--------------------------------------------------------------------------
| Analyze Image With OpenAI
|--------------------------------------------------------------------------
|
| Used by EchoCall AI's image analysis features.
|
*/

export async function analyzeImage(
  imageBuffer,
  mimeType,
  prompt = "Describe this image."
) {
  try {

    if (!imageBuffer) {
      throw new Error(
        "Image buffer is required."
      );
    }

    if (!mimeType) {
      throw new Error(
        "Image MIME type is required."
      );
    }

    if (!prompt || prompt.trim() === "") {
      prompt = "Describe this image.";
    }


    /*
    |--------------------------------------------------------------------------
    | Convert image to Data URL
    |--------------------------------------------------------------------------
    */

    const base64Image =
      imageBuffer.toString("base64");

    const imageDataURL =
      `data:${mimeType};base64,${base64Image}`;


    /*
    |--------------------------------------------------------------------------
    | OpenAI Vision
    |--------------------------------------------------------------------------
    */

    const response =
      await openai.chat.completions.create({

        model: MODEL,

        messages: [
          {
            role: "user",

            content: [
              {
                type: "text",
                text: prompt.trim()
              },

              {
                type: "image_url",

                image_url: {
                  url: imageDataURL
                }
              }
            ]
          }
        ]
      });


    /*
    |--------------------------------------------------------------------------
    | Extract answer
    |--------------------------------------------------------------------------
    */

    return (
      response.choices?.[0]?.message?.content ||
      "I could not analyze this image."
    );

  } catch (error) {

    console.error(
      "Image Analysis Error:",
      error
    );

    throw error;
  }
}