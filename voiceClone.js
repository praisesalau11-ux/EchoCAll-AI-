// ============================================================
// EchoCall AI - Voice Studio
// File: js/voiceClone.js
// Part 1 of 2
// ============================================================

// ------------------------------------------------------------
// API CONFIGURATION
// ------------------------------------------------------------

const VOICE_API_BASE_URL =
  "https://echocall-ai-backend.onrender.com/api/ai";

// ------------------------------------------------------------
// STATE
// ------------------------------------------------------------

let selectedVoiceId = "";
let availableVoices = [];
let isLoadingVoices = false;
let isGeneratingVoice = false;
let currentAudioUrl = "";
let currentAudioBlob = null;


// ------------------------------------------------------------
// DOM ELEMENTS
// ------------------------------------------------------------

const voicePreviewText = document.getElementById("voicePreviewText");
const characterCount = document.getElementById("characterCount");

const generateVoiceButton =
  document.getElementById("generateVoiceButton");

const voiceAudioPlayer =
  document.getElementById("voiceAudioPlayer");

const audioSection =
  document.getElementById("audioSection");

const audioStatus =
  document.getElementById("audioStatus");

const voiceStability =
  document.getElementById("voiceStability");

const voiceSimilarity =
  document.getElementById("voiceSimilarity");

const stabilityValue =
  document.getElementById("stabilityValue");

const similarityValue =
  document.getElementById("similarityValue");

const voiceBackButton =
  document.getElementById("voiceBackButton");


// ------------------------------------------------------------
// INITIALIZE
// ------------------------------------------------------------

document.addEventListener("DOMContentLoaded", () => {
  initializeVoiceStudio();
});

async function initializeVoiceStudio() {
  setupCharacterCounter();
  setupVoiceSliders();
  setupGenerateButton();
  setupBackButton();

  await createVoiceSelector();
  await loadElevenLabsVoices();
}


// ------------------------------------------------------------
// FIREBASE AUTH TOKEN
// ------------------------------------------------------------

async function getFirebaseAuthToken() {
  try {
    let firebaseAuth = null;

    // Check normal global auth variable
    if (typeof auth !== "undefined" && auth) {
      firebaseAuth = auth;
    }

    // Check window.auth
    if (!firebaseAuth && window.auth) {
      firebaseAuth = window.auth;
    }

    // Check Firebase compat
    if (
      !firebaseAuth &&
      window.firebase &&
      typeof window.firebase.auth === "function"
    ) {
      firebaseAuth = window.firebase.auth();
    }

    if (!firebaseAuth) {
      console.warn("Firebase Auth is not available.");
      return null;
    }

    const currentUser = firebaseAuth.currentUser;

    if (!currentUser) {
      console.warn("No authenticated Firebase user.");
      return null;
    }

    const token = await currentUser.getIdToken();

    return token;
  } catch (error) {
    console.error(
      "Failed to get Firebase authentication token:",
      error
    );

    return null;
  }
}


// ------------------------------------------------------------
// CHARACTER COUNTER
// ------------------------------------------------------------

function setupCharacterCounter() {
  if (!voicePreviewText || !characterCount) {
    return;
  }

  updateCharacterCount();

  voicePreviewText.addEventListener("input", () => {
    updateCharacterCount();
  });
}

function updateCharacterCount() {
  if (!voicePreviewText || !characterCount) {
    return;
  }

  const length = voicePreviewText.value.length;

  characterCount.textContent = `${length} characters`;
}


// ------------------------------------------------------------
// VOICE SLIDERS
// ------------------------------------------------------------

function setupVoiceSliders() {
  if (voiceStability && stabilityValue) {
    updateStabilityValue();

    voiceStability.addEventListener("input", () => {
      updateStabilityValue();
    });
  }

  if (voiceSimilarity && similarityValue) {
    updateSimilarityValue();

    voiceSimilarity.addEventListener("input", () => {
      updateSimilarityValue();
    });
  }
}

function updateStabilityValue() {
  if (!voiceStability || !stabilityValue) {
    return;
  }

  const value = Number(voiceStability.value);

  stabilityValue.textContent =
    `${Math.round(value * 100)}%`;
}

function updateSimilarityValue() {
  if (!voiceSimilarity || !similarityValue) {
    return;
  }

  const value = Number(voiceSimilarity.value);

  similarityValue.textContent =
    `${Math.round(value * 100)}%`;
}


// ------------------------------------------------------------
// CREATE ELEVENLABS VOICE SELECTOR
// ------------------------------------------------------------

async function createVoiceSelector() {
  const existingSelector =
    document.getElementById("elevenLabsVoiceSelector");

  if (existingSelector) {
    return;
  }

  const selectedVoiceCard =
    document.querySelector(".selected-voice-card");

  if (!selectedVoiceCard) {
    console.warn(
      "Selected voice card was not found."
    );

    return;
  }

  const wrapper = document.createElement("div");

  wrapper.className = "voice-selector-wrapper";

  wrapper.innerHTML = `
    <label
      for="elevenLabsVoiceSelector"
      class="voice-selector-label"
    >
      ElevenLabs Voice
    </label>

    <select
      id="elevenLabsVoiceSelector"
      class="elevenlabs-voice-selector"
    >
      <option value="">
        Loading voices...
      </option>
    </select>

    <div
      id="voiceSelectorStatus"
      class="voice-selector-status"
    >
      Loading available voices...
    </div>
  `;

  selectedVoiceCard.insertAdjacentElement(
    "afterend",
    wrapper
  );
}


// ------------------------------------------------------------
// LOAD ELEVENLABS VOICES
// ------------------------------------------------------------

async function loadElevenLabsVoices() {
  if (isLoadingVoices) {
    return;
  }

  isLoadingVoices = true;

  const selector =
    document.getElementById(
      "elevenLabsVoiceSelector"
    );

  const selectorStatus =
    document.getElementById(
      "voiceSelectorStatus"
    );

  try {
    if (selector) {
      selector.innerHTML = `
        <option value="">
          Loading voices...
        </option>
      `;
    }

    if (selectorStatus) {
      selectorStatus.textContent =
        "Connecting to ElevenLabs...";
    }

    const token =
      await getFirebaseAuthToken();

    if (!token) {
      throw new Error(
        "You must be signed in before loading voices."
      );
    }

    const response = await fetch(
      `${VOICE_API_BASE_URL}/voices`,
      {
        method: "GET",

        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      }
    );

    const data =
      await parseJsonResponse(response);

    if (!response.ok) {
      throw new Error(
        data?.message ||
        "Unable to load ElevenLabs voices."
      );
    }

    if (
      !data ||
      !Array.isArray(data.voices)
    ) {
      throw new Error(
        "The server returned an invalid voices response."
      );
    }

    availableVoices = data.voices;

    populateVoiceSelector(
      availableVoices
    );

  } catch (error) {
    console.error(
      "Load ElevenLabs voices error:",
      error
    );

    if (selector) {
      selector.innerHTML = `
        <option value="">
          Unable to load voices
        </option>
      `;
    }

    if (selectorStatus) {
      selectorStatus.textContent =
        error.message ||
        "Unable to load ElevenLabs voices.";
    }

  } finally {
    isLoadingVoices = false;
  }
}


// ------------------------------------------------------------
// POPULATE VOICE SELECTOR
// ------------------------------------------------------------

function populateVoiceSelector(voices) {
  const selector =
    document.getElementById(
      "elevenLabsVoiceSelector"
    );

  const selectorStatus =
    document.getElementById(
      "voiceSelectorStatus"
    );

  if (!selector) {
    return;
  }

  selector.innerHTML = "";

  if (!voices.length) {
    selector.innerHTML = `
      <option value="">
        No voices available
      </option>
    `;

    if (selectorStatus) {
      selectorStatus.textContent =
        "No ElevenLabs voices were returned.";
    }

    selectedVoiceId = "";

    return;
  }

  voices.forEach((voice) => {
    const option =
      document.createElement("option");

    option.value =
      voice.voice_id ||
      voice.id ||
      "";

    option.textContent =
      voice.name ||
      "Unnamed Voice";

    selector.appendChild(option);
  });

  selectedVoiceId =
    selector.value || "";

  selector.addEventListener(
    "change",
    handleVoiceSelection
  );

  if (selectorStatus) {
    selectorStatus.textContent =
      `${voices.length} ElevenLabs voice${
        voices.length === 1 ? "" : "s"
      } available`;
  }

  updateSelectedVoiceDisplay();
}


// ------------------------------------------------------------
// HANDLE VOICE SELECTION
// ------------------------------------------------------------

function handleVoiceSelection(event) {
  selectedVoiceId =
    event.target.value || "";

  updateSelectedVoiceDisplay();
}


// ------------------------------------------------------------
// UPDATE SELECTED VOICE DISPLAY
// ------------------------------------------------------------

function updateSelectedVoiceDisplay() {
  const selectedVoice =
    availableVoices.find(
      (voice) =>
        (voice.voice_id || voice.id) ===
        selectedVoiceId
    );

  if (!selectedVoice) {
    return;
  }

  const voiceName =
    selectedVoice.name ||
    "ElevenLabs Voice";

  // Try several possible existing elements
  const voiceNameElements =
    document.querySelectorAll(
      ".selected-voice-name, #selectedVoiceName, [data-selected-voice-name]"
    );

  voiceNameElements.forEach((element) => {
    element.textContent = voiceName;
  });

  // Store useful information on the card
  const selectedVoiceCard =
    document.querySelector(".selected-voice-card");

  if (selectedVoiceCard) {
    selectedVoiceCard.dataset.voiceId =
      selectedVoiceId;

    selectedVoiceCard.dataset.voiceName =
      voiceName;
  }
}


// ------------------------------------------------------------
// GENERATE BUTTON
// ------------------------------------------------------------

function setupGenerateButton() {
  if (!generateVoiceButton) {
    console.warn(
      "Generate voice button was not found."
    );

    return;
  }

  generateVoiceButton.addEventListener(
    "click",
    generateVoice
  );
}


// ------------------------------------------------------------
// GENERATE VOICE
// ------------------------------------------------------------

async function generateVoice() {
  if (isGeneratingVoice) {
    return;
  }

  const text =
    voicePreviewText?.value?.trim() || "";

  if (!text) {
    showVoiceStatus(
      "Enter some text first.",
      "error"
    );

    voicePreviewText?.focus();

    return;
  }

  if (!selectedVoiceId) {
    showVoiceStatus(
      "Please select an ElevenLabs voice.",
      "error"
    );

    return;
  }

  isGeneratingVoice = true;

  setGenerateButtonLoading(true);

  showVoiceStatus(
    "Generating your voice...",
    "loading"
  );

  try {
    const token =
      await getFirebaseAuthToken();

    if (!token) {
      throw new Error(
        "You must be signed in to generate audio."
      );
    }

    const stability =
      voiceStability
        ? Number(voiceStability.value)
        : 0.5;

    const similarity =
      voiceSimilarity
        ? Number(voiceSimilarity.value)
        : 0.75;

    const response = await fetch(
      `${VOICE_API_BASE_URL}/text-to-speech`,
      {
        method: "POST",

        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },

        body: JSON.stringify({
          text: text,

          voiceId:
            selectedVoiceId,

          stability:
            stability,

          similarity:
            similarity
        })
      }
    );

    const data =
      await parseJsonResponse(response);

    if (!response.ok) {
      throw new Error(
        data?.message ||
        "Voice generation failed."
      );
    }

    if (!data) {
      throw new Error(
        "The server returned an empty response."
      );
    }

    const audioSource =
      await extractAudioSource(data);

    if (!audioSource) {
      throw new Error(
        "No audio was returned by the server."
      );
    }

    await displayGeneratedAudio(
      audioSource
    );

    showVoiceStatus(
      "Voice generated successfully.",
      "success"
    );

  } catch (error) {
    console.error(
      "Voice generation error:",
      error
    );

    showVoiceStatus(
      error.message ||
      "Unable to generate voice.",
      "error"
    );

  } finally {
    isGeneratingVoice = false;

    setGenerateButtonLoading(false);
  }
}


// ------------------------------------------------------------
// PARSE JSON RESPONSE
// ------------------------------------------------------------

async function parseJsonResponse(response) {
  const contentType =
    response.headers.get(
      "content-type"
    ) || "";

  if (
    contentType.includes(
      "application/json"
    )
  ) {
    return await response.json();
  }

  const text =
    await response.text();

  try {
    return JSON.parse(text);
  } catch {
    return {
      success: response.ok,
      message: text
    };
  }
}


// ============================================================
// END OF PART 1
// ============================================================
//
// PART 2 will contain:
//
// - audio extraction
// - audio player setup
// - DOWNLOAD VOICE button
// - Blob conversion
// - download handling
// - status messages
// - loading button animation
// - back button
// - navigation fallback
// - cleanup
//
// ============================================================
// ============================================================
// EchoCall AI - Voice Studio
// File: js/voiceClone.js
// Part 2 of 2
// ============================================================


// ------------------------------------------------------------
// EXTRACT AUDIO SOURCE
// ------------------------------------------------------------

async function extractAudioSource(data) {
  if (!data) {
    return null;
  }

  // ----------------------------------------------------------
  // CASE 1: Server returned audio directly as a data URL
  // ----------------------------------------------------------

  if (
    typeof data.audio === "string" &&
    data.audio.startsWith("data:audio/")
  ) {
    return data.audio;
  }


  // ----------------------------------------------------------
  // CASE 2: Server returned a normal HTTP/HTTPS URL
  // ----------------------------------------------------------

  if (
    typeof data.audio === "string" &&
    (
      data.audio.startsWith("https://") ||
      data.audio.startsWith("http://")
    )
  ) {
    return data.audio;
  }


  // ----------------------------------------------------------
  // CASE 3: Server returned base64 audio
  // ----------------------------------------------------------

  if (
    typeof data.audio === "string" &&
    isProbablyBase64(data.audio)
  ) {
    return `data:audio/mpeg;base64,${data.audio}`;
  }


  // ----------------------------------------------------------
  // CASE 4: Server returned an audio object
  // ----------------------------------------------------------

  if (
    data.audio &&
    typeof data.audio === "object"
  ) {
    const audioObject = data.audio;

    // data URL
    if (
      typeof audioObject.dataUrl === "string"
    ) {
      return audioObject.dataUrl;
    }

    if (
      typeof audioObject.url === "string"
    ) {
      return audioObject.url;
    }

    if (
      typeof audioObject.audioUrl === "string"
    ) {
      return audioObject.audioUrl;
    }

    if (
      typeof audioObject.base64 === "string"
    ) {
      return (
        `data:audio/mpeg;base64,` +
        audioObject.base64
      );
    }

    if (
      typeof audioObject.data === "string"
    ) {
      return (
        `data:audio/mpeg;base64,` +
        audioObject.data
      );
    }
  }


  // ----------------------------------------------------------
  // CASE 5: Alternative response property names
  // ----------------------------------------------------------

  const possibleAudioFields = [
    data.audioUrl,
    data.audioURL,
    data.url,
    data.audio_data,
    data.audioData,
    data.base64
  ];

  for (
    const possibleAudio of possibleAudioFields
  ) {
    if (
      typeof possibleAudio !== "string"
    ) {
      continue;
    }

    if (
      possibleAudio.startsWith(
        "data:audio/"
      )
    ) {
      return possibleAudio;
    }

    if (
      possibleAudio.startsWith(
        "https://"
      ) ||
      possibleAudio.startsWith(
        "http://"
      )
    ) {
      return possibleAudio;
    }

    if (
      isProbablyBase64(possibleAudio)
    ) {
      return (
        `data:audio/mpeg;base64,` +
        possibleAudio
      );
    }
  }


  return null;
}


// ------------------------------------------------------------
// CHECK IF STRING IS PROBABLY BASE64
// ------------------------------------------------------------

function isProbablyBase64(value) {
  if (
    typeof value !== "string"
  ) {
    return false;
  }

  if (value.length < 50) {
    return false;
  }

  // Remove whitespace
  const cleaned =
    value.replace(/\s/g, "");

  // Base64 characters only
  if (
    !/^[A-Za-z0-9+/=]+$/.test(
      cleaned
    )
  ) {
    return false;
  }

  return true;
}


// ------------------------------------------------------------
// DISPLAY GENERATED AUDIO
// ------------------------------------------------------------

async function displayGeneratedAudio(
  audioSource
) {
  if (!audioSection) {
    console.warn(
      "Audio section was not found."
    );

    return;
  }

  // ----------------------------------------------------------
  // Clean up previous audio
  // ----------------------------------------------------------

  cleanupPreviousAudio();


  // ----------------------------------------------------------
  // Convert source into a usable audio URL
  // ----------------------------------------------------------

  let audioUrl =
    await convertAudioSourceToUrl(
      audioSource
    );

  if (!audioUrl) {
    throw new Error(
      "Unable to prepare generated audio."
    );
  }

  currentAudioUrl = audioUrl;


  // ----------------------------------------------------------
  // Set audio player
  // ----------------------------------------------------------

  if (voiceAudioPlayer) {
    voiceAudioPlayer.src =
      audioUrl;

    voiceAudioPlayer.controls =
      true;

    voiceAudioPlayer.preload =
      "metadata";

    voiceAudioPlayer.load();
  }


  // ----------------------------------------------------------
  // Make audio section visible
  // ----------------------------------------------------------

  audioSection.hidden =
    false;

  audioSection.style.display =
    "";


  // ----------------------------------------------------------
  // Create download button
  // ----------------------------------------------------------

  createDownloadButton(
    audioUrl
  );


  // ----------------------------------------------------------
  // Scroll to generated audio
  // ----------------------------------------------------------

  setTimeout(() => {
    try {
      audioSection.scrollIntoView({
        behavior: "smooth",
        block: "center"
      });
    } catch (error) {
      console.warn(
        "Could not scroll to audio section:",
        error
      );
    }
  }, 100);


  // ----------------------------------------------------------
  // Try to automatically load the audio
  // ----------------------------------------------------------

  if (voiceAudioPlayer) {
    try {
      await voiceAudioPlayer.play();

      // Some browsers block autoplay.
      // If blocked, the audio player remains available.

    } catch (error) {
      console.log(
        "Autoplay was blocked by the browser."
      );
    }
  }
}


// ------------------------------------------------------------
// CONVERT AUDIO SOURCE TO URL
// ------------------------------------------------------------

async function convertAudioSourceToUrl(
  audioSource
) {
  if (
    !audioSource ||
    typeof audioSource !== "string"
  ) {
    return null;
  }


  // ----------------------------------------------------------
  // DATA URL
  // ----------------------------------------------------------

  if (
    audioSource.startsWith(
      "data:audio/"
    )
  ) {
    try {
      const blob =
        dataUrlToBlob(
          audioSource
        );

      currentAudioBlob =
        blob;

      return URL.createObjectURL(
        blob
      );

    } catch (error) {
      console.error(
        "Data URL conversion failed:",
        error
      );

      // Fall back to original data URL
      return audioSource;
    }
  }


  // ----------------------------------------------------------
  // HTTP URL
  // ----------------------------------------------------------

  if (
    audioSource.startsWith(
      "https://"
    ) ||
    audioSource.startsWith(
      "http://"
    )
  ) {
    try {
      const response =
        await fetch(
          audioSource
        );

      if (response.ok) {
        const blob =
          await response.blob();

        currentAudioBlob =
          blob;

        return URL.createObjectURL(
          blob
        );
      }

    } catch (error) {
      console.warn(
        "Could not download remote audio:",
        error
      );
    }

    return audioSource;
  }


  return audioSource;
}


// ------------------------------------------------------------
// DATA URL → BLOB
// ------------------------------------------------------------

function dataUrlToBlob(
  dataUrl
) {
  const parts =
    dataUrl.split(",");

  if (parts.length < 2) {
    throw new Error(
      "Invalid audio data URL."
    );
  }

  const header =
    parts[0];

  const base64 =
    parts.slice(1).join(",");

  const mimeMatch =
    header.match(
      /data:([^;]+);base64/
    );

  const mimeType =
    mimeMatch
      ? mimeMatch[1]
      : "audio/mpeg";

  const binaryString =
    atob(base64);

  const length =
    binaryString.length;

  const bytes =
    new Uint8Array(length);

  for (
    let index = 0;
    index < length;
    index++
  ) {
    bytes[index] =
      binaryString.charCodeAt(index);
  }

  return new Blob(
    [bytes],
    {
      type: mimeType
    }
  );
}


// ------------------------------------------------------------
// CREATE DOWNLOAD BUTTON
// ------------------------------------------------------------

function createDownloadButton(
  audioUrl
) {
  if (!audioSection) {
    return;
  }


  // ----------------------------------------------------------
  // Remove previous download button
  // ----------------------------------------------------------

  const oldButton =
    document.getElementById(
      "downloadVoiceButton"
    );

  if (oldButton) {
    oldButton.remove();
  }


  // ----------------------------------------------------------
  // Create button wrapper
  // ----------------------------------------------------------

  const wrapper =
    document.createElement("div");

  wrapper.id =
    "voiceDownloadWrapper";

  wrapper.className =
    "voice-download-wrapper";


  // ----------------------------------------------------------
  // Create button
  // ----------------------------------------------------------

  const button =
    document.createElement("button");

  button.type =
    "button";

  button.id =
    "downloadVoiceButton";

  button.className =
    "download-voice-button";

  button.innerHTML = `
    <span class="download-icon">
      ↓
    </span>

    <span class="download-text">
      Download Voice
    </span>
  `;


  // ----------------------------------------------------------
  // Download event
  // ----------------------------------------------------------

  button.addEventListener(
    "click",
    () => {
      downloadGeneratedVoice(
        audioUrl
      );
    }
  );


  wrapper.appendChild(
    button
  );


  // ----------------------------------------------------------
  // Put button underneath audio player
  // ----------------------------------------------------------

  const audioPlayer =
    document.getElementById(
      "voiceAudioPlayer"
    );

  if (audioPlayer) {
    audioPlayer.insertAdjacentElement(
      "afterend",
      wrapper
    );

    return;
  }


  // Fallback
  audioSection.appendChild(
    wrapper
  );
}


// ------------------------------------------------------------
// DOWNLOAD GENERATED VOICE
// ------------------------------------------------------------

async function downloadGeneratedVoice(
  audioUrl
) {
  const button =
    document.getElementById(
      "downloadVoiceButton"
    );

  if (button) {
    button.disabled =
      true;

    button.innerHTML = `
      <span class="download-icon">
        ↓
      </span>

      <span class="download-text">
        Preparing...
      </span>
    `;
  }

  try {
    let blob =
      currentAudioBlob;


    // --------------------------------------------------------
    // If no cached blob, fetch the audio
    // --------------------------------------------------------

    if (!blob) {
      const response =
        await fetch(
          audioUrl
        );

      if (!response.ok) {
        throw new Error(
          "Unable to download the audio."
        );
      }

      blob =
        await response.blob();

      currentAudioBlob =
        blob;
    }


    // --------------------------------------------------------
    // Determine file extension
    // --------------------------------------------------------

    const extension =
      getAudioFileExtension(
        blob.type
      );


    // --------------------------------------------------------
    // Create temporary download URL
    // --------------------------------------------------------

    const downloadUrl =
      URL.createObjectURL(
        blob
      );


    // --------------------------------------------------------
    // Create invisible download link
    // --------------------------------------------------------

    const link =
      document.createElement("a");

    link.href =
      downloadUrl;

    link.download =
      `EchoCall-Voice-${getTimestamp()}.${extension}`;

    link.style.display =
      "none";


    document.body.appendChild(
      link
    );

    link.click();

    link.remove();


    // --------------------------------------------------------
    // Clean temporary URL
    // --------------------------------------------------------

    setTimeout(() => {
      URL.revokeObjectURL(
        downloadUrl
      );
    }, 1000);


    showVoiceStatus(
      "Voice downloaded successfully.",
      "success"
    );


  } catch (error) {
    console.error(
      "Voice download error:",
      error
    );

    showVoiceStatus(
      "Unable to download the generated voice.",
      "error"
    );

  } finally {
    if (button) {
      button.disabled =
        false;

      button.innerHTML = `
        <span class="download-icon">
          ↓
        </span>

        <span class="download-text">
          Download Voice
        </span>
      `;
    }
  }
}


// ------------------------------------------------------------
// GET AUDIO FILE EXTENSION
// ------------------------------------------------------------

function getAudioFileExtension(
  mimeType
) {
  const mime =
    (mimeType || "").toLowerCase();

  if (
    mime.includes(
      "audio/wav"
    ) ||
    mime.includes(
      "audio/wave"
    ) ||
    mime.includes(
      "audio/x-wav"
    )
  ) {
    return "wav";
  }

  if (
    mime.includes(
      "audio/ogg"
    )
  ) {
    return "ogg";
  }

  if (
    mime.includes(
      "audio/webm"
    )
  ) {
    return "webm";
  }

  if (
    mime.includes(
      "audio/mp4"
    ) ||
    mime.includes(
      "audio/m4a"
    )
  ) {
    return "m4a";
  }

  // ElevenLabs normally returns MP3
  return "mp3";
}


// ------------------------------------------------------------
// TIMESTAMP FOR FILE NAME
// ------------------------------------------------------------

function getTimestamp() {
  const now =
    new Date();

  const year =
    now.getFullYear();

  const month =
    String(
      now.getMonth() + 1
    ).padStart(2, "0");

  const day =
    String(
      now.getDate()
    ).padStart(2, "0");

  const hours =
    String(
      now.getHours()
    ).padStart(2, "0");

  const minutes =
    String(
      now.getMinutes()
    ).padStart(2, "0");

  const seconds =
    String(
      now.getSeconds()
    ).padStart(2, "0");

  return (
    `${year}-${month}-${day}-` +
    `${hours}-${minutes}-${seconds}`
  );
}


// ------------------------------------------------------------
// GENERATE BUTTON LOADING STATE
// ------------------------------------------------------------

function setGenerateButtonLoading(
  loading
) {
  if (!generateVoiceButton) {
    return;
  }

  generateVoiceButton.disabled =
    loading;


  if (loading) {
    generateVoiceButton.dataset.originalHTML =
      generateVoiceButton.innerHTML;

    generateVoiceButton.innerHTML = `
      <span class="voice-loading-spinner"></span>
      <span>Generating Voice...</span>
    `;

    generateVoiceButton.classList.add(
      "is-loading"
    );

  } else {
    const originalHTML =
      generateVoiceButton.dataset.originalHTML;

    if (originalHTML) {
      generateVoiceButton.innerHTML =
        originalHTML;
    }

    generateVoiceButton.classList.remove(
      "is-loading"
    );
  }
}


// ------------------------------------------------------------
// VOICE STATUS
// ------------------------------------------------------------

function showVoiceStatus(
  message,
  type = "info"
) {
  if (!audioStatus) {
    return;
  }

  audioStatus.textContent =
    message;

  audioStatus.className =
    "audio-status";

  audioStatus.classList.add(
    `status-${type}`
  );
}


// ------------------------------------------------------------
// BACK BUTTON
// ------------------------------------------------------------

function setupBackButton() {
  if (!voiceBackButton) {
    return;
  }

  voiceBackButton.addEventListener(
    "click",
    handleVoiceBack
  );
}


// ------------------------------------------------------------
// HANDLE BACK NAVIGATION
// ------------------------------------------------------------

function handleVoiceBack() {
  try {

    // --------------------------------------------------------
    // Custom global navigation
    // --------------------------------------------------------

    if (
      typeof window.navigateTo ===
      "function"
    ) {
      window.navigateTo(
        "home"
      );

      return;
    }


    // --------------------------------------------------------
    // Router navigation
    // --------------------------------------------------------

    if (
      window.router &&
      typeof window.router.navigate ===
      "function"
    ) {
      window.router.navigate(
        "home"
      );

      return;
    }


    // --------------------------------------------------------
    // Browser history
    // --------------------------------------------------------

    if (
      window.history.length > 1
    ) {
      window.history.back();

      return;
    }


    // --------------------------------------------------------
    // Fallback
    // --------------------------------------------------------

    window.location.href =
      "../index.html";

  } catch (error) {
    console.error(
      "Voice Studio navigation error:",
      error
    );

    window.location.href =
      "../index.html";
  }
}


// ------------------------------------------------------------
// CLEANUP PREVIOUS AUDIO
// ------------------------------------------------------------

function cleanupPreviousAudio() {
  if (
    currentAudioUrl &&
    currentAudioUrl.startsWith(
      "blob:"
    )
  ) {
    try {
      URL.revokeObjectURL(
        currentAudioUrl
      );
    } catch (error) {
      console.warn(
        "Could not revoke old audio URL:",
        error
      );
    }
  }

  currentAudioUrl =
    "";

  currentAudioBlob =
    null;


  if (voiceAudioPlayer) {
    try {
      voiceAudioPlayer.pause();

      voiceAudioPlayer.removeAttribute(
        "src"
      );

      voiceAudioPlayer.load();

    } catch (error) {
      console.warn(
        "Could not reset audio player:",
        error
      );
    }
  }


  const oldDownloadWrapper =
    document.getElementById(
      "voiceDownloadWrapper"
    );

  if (oldDownloadWrapper) {
    oldDownloadWrapper.remove();
  }
}


// ------------------------------------------------------------
// AUDIO PLAYER EVENTS
// ------------------------------------------------------------

if (voiceAudioPlayer) {

  voiceAudioPlayer.addEventListener(
    "loadedmetadata",
    () => {
      console.log(
        "Generated voice audio loaded."
      );
    }
  );


  voiceAudioPlayer.addEventListener(
    "play",
    () => {
      console.log(
        "Playing generated voice."
      );
    }
  );


  voiceAudioPlayer.addEventListener(
    "ended",
    () => {
      console.log(
        "Generated voice finished."
      );
    }
  );


  voiceAudioPlayer.addEventListener(
    "error",
    (event) => {
      console.error(
        "Audio player error:",
        event
      );

      showVoiceStatus(
        "The generated audio could not be played.",
        "error"
      );
    }
  );
}


// ------------------------------------------------------------
// PAGE VISIBILITY CLEANUP
// ------------------------------------------------------------

window.addEventListener(
  "beforeunload",
  () => {
    if (
      currentAudioUrl &&
      currentAudioUrl.startsWith(
        "blob:"
      )
    ) {
      try {
        URL.revokeObjectURL(
          currentAudioUrl
        );
      } catch (error) {
        // Ignore cleanup errors
      }
    }
  }
);


// ------------------------------------------------------------
// OPTIONAL GLOBAL ACCESS
// ------------------------------------------------------------

window.EchoCallVoiceStudio = {
  generateVoice,
  loadElevenLabsVoices,
  downloadGeneratedVoice,
  getFirebaseAuthToken
};


// ============================================================
// END OF voiceClone.js
// ============================================================