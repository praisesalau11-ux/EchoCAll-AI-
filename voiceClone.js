
/* ============================================================
   EchoCall AI - Voice Studio
   File: js/voiceClone.js
   Part 1 of 2
   ============================================================ */
const VOICE_API_BASE_URL =
  "https://echocall-ai-backend.onrender.com/api/ai/elevenlabs";

let selectedVoiceId = "";
let availableVoices = [];
let isGeneratingVoice = false;
let currentAudioUrl = "";
let currentAudioBlob = null;

let voicePreviewText;
let characterCount;
let generateVoiceButton;
let voiceAudioPlayer;
let audioSection;
let audioStatus;
let voiceStability;
let voiceSimilarity;
let stabilityValue;
let similarityValue;
let voiceBackButton;

/* ============================================================
   INITIALIZE AFTER DOM LOAD
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {
  voicePreviewText = document.getElementById("voicePreviewText");
  characterCount = document.getElementById("characterCount");
  generateVoiceButton =
    document.getElementById("generateVoiceButton");
  voiceAudioPlayer =
    document.getElementById("voiceAudioPlayer");
  audioSection = document.getElementById("audioSection");
  audioStatus = document.getElementById("audioStatus");
  voiceStability = document.getElementById("voiceStability");
  voiceSimilarity = document.getElementById("voiceSimilarity");
  stabilityValue = document.getElementById("stabilityValue");
  similarityValue = document.getElementById("similarityValue");
  voiceBackButton = document.getElementById("voiceBackButton");

  initializeVoiceStudio();
});

/* ============================================================
   STUDIO SETUP
   ============================================================ */

async function initializeVoiceStudio() {
  setupCharacterCounter();
  setupVoiceSliders();
  setupGenerateButton();
  setupBackButton();

  createVoiceSelector();
  await loadElevenLabsVoices();
}

/* ============================================================
   FIREBASE AUTHENTICATION
   ============================================================ */

async function getFirebaseAuthToken() {
  try {
    let firebaseAuth = null;

    if (typeof auth !== "undefined" && auth) {
      firebaseAuth = auth;
    }

    if (!firebaseAuth && window.auth) {
      firebaseAuth = window.auth;
    }

    if (
      !firebaseAuth &&
      window.firebase &&
      typeof window.firebase.auth === "function"
    ) {
      firebaseAuth = window.firebase.auth();
    }

    if (!firebaseAuth) {
      throw new Error("Firebase Authentication is unavailable.");
    }

    const currentUser = firebaseAuth.currentUser;

    if (!currentUser) {
      throw new Error("Please sign in before using Voice Studio.");
    }

    return await currentUser.getIdToken(true);
  } catch (error) {
    console.error("Firebase token error:", error);
    return null;
  }
}

/* ============================================================
   CHARACTER COUNTER
   ============================================================ */

function setupCharacterCounter() {
  if (!voicePreviewText || !characterCount) return;

  updateCharacterCount();

  voicePreviewText.addEventListener("input", updateCharacterCount);
}

function updateCharacterCount() {
  if (!voicePreviewText || !characterCount) return;

  characterCount.textContent =
    `${voicePreviewText.value.length} characters`;
}

/* ============================================================
   SLIDERS
   ============================================================ */

function setupVoiceSliders() {
  if (voiceStability) {
    updateStabilityValue();

    voiceStability.addEventListener(
      "input",
      updateStabilityValue
    );
  }

  if (voiceSimilarity) {
    updateSimilarityValue();

    voiceSimilarity.addEventListener(
      "input",
      updateSimilarityValue
    );
  }
}

function updateStabilityValue() {
  if (!voiceStability || !stabilityValue) return;

  stabilityValue.textContent =
    `${Math.round(Number(voiceStability.value) * 100)}%`;
}

function updateSimilarityValue() {
  if (!voiceSimilarity || !similarityValue) return;

  similarityValue.textContent =
    `${Math.round(Number(voiceSimilarity.value) * 100)}%`;
}

/* ============================================================
   VOICE SELECTOR
   ============================================================ */

function createVoiceSelector() {
  let selector = document.getElementById(
    "elevenLabsVoiceSelector"
  );

  if (selector) return;

  const selectedVoiceCard = document.querySelector(
    ".selected-voice-card"
  );

  if (!selectedVoiceCard) {
    console.warn("Selected voice card was not found.");
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
      <option value="">Loading voices...</option>
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

async function loadElevenLabsVoices() {
  const selector = document.getElementById(
    "elevenLabsVoiceSelector"
  );

  const status = document.getElementById(
    "voiceSelectorStatus"
  );

  try {
    if (!selector) {
      throw new Error("Voice selector was not found.");
    }

    selector.innerHTML =
      `<option value="">Loading voices...</option>`;

    if (status) {
      status.textContent = "Connecting to ElevenLabs...";
    }

    const token = await getFirebaseAuthToken();

    if (!token) {
      throw new Error("Please sign in before loading voices.");
    }

    const response = await fetch(
      `${VOICE_API_BASE_URL}/voices`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      }
    );

    const data = await parseJsonResponse(response);

    if (!response.ok) {
      throw new Error(
        data?.message || "Unable to load voices."
      );
    }

    if (!Array.isArray(data?.voices)) {
      throw new Error("Invalid voices response from server.");
    }

    availableVoices = data.voices;

    populateVoiceSelector(availableVoices);
  } catch (error) {
    console.error("Load voices error:", error);

    if (selector) {
      selector.innerHTML =
        `<option value="">Unable to load voices</option>`;
    }

    if (status) {
      status.textContent = error.message;
    }
  }
}

function populateVoiceSelector(voices) {
  const selector = document.getElementById(
    "elevenLabsVoiceSelector"
  );

  const status = document.getElementById(
    "voiceSelectorStatus"
  );

  if (!selector) return;

  selector.innerHTML = "";

  if (!voices.length) {
    selector.innerHTML =
      `<option value="">No voices available</option>`;

    if (status) {
      status.textContent = "No voices were returned.";
    }

    selectedVoiceId = "";
    return;
  }

  voices.forEach((voice) => {
    const voiceId = voice.voice_id || voice.id;
    const voiceName = voice.name || "Unnamed Voice";

    if (!voiceId) return;

    const option = document.createElement("option");

    option.value = voiceId;
    option.textContent = voiceName;

    selector.appendChild(option);
  });

  selectedVoiceId = selector.value || "";

  selector.addEventListener(
    "change",
    handleVoiceSelection
  );

  if (status) {
    status.textContent =
      `${voices.length} ElevenLabs voices available`;
  }

  updateSelectedVoiceDisplay();
}

function handleVoiceSelection(event) {
  selectedVoiceId = event.target.value || "";

  updateSelectedVoiceDisplay();
}

function updateSelectedVoiceDisplay() {
  const selectedVoice = availableVoices.find(
    (voice) =>
      (voice.voice_id || voice.id) === selectedVoiceId
  );

  if (!selectedVoice) return;

  const voiceName =
    selectedVoice.name || "ElevenLabs Voice";

  document.querySelectorAll(
    ".selected-voice-name, #selectedVoiceName, [data-selected-voice-name]"
  ).forEach((element) => {
    element.textContent = voiceName;
  });

  const card = document.querySelector(
    ".selected-voice-card"
  );

  if (card) {
    card.dataset.voiceId = selectedVoiceId;
    card.dataset.voiceName = voiceName;
  }
}

/* ============================================================
   GENERATE BUTTON
   ============================================================ */

function setupGenerateButton() {
  if (!generateVoiceButton) {
    console.warn("Generate voice button was not found.");
    return;
  }

  generateVoiceButton.addEventListener(
    "click",
    generateVoice
  );
}

async function generateVoice() {
  if (isGeneratingVoice) return;

  const text = voicePreviewText?.value?.trim() || "";

  if (!text) {
    showVoiceStatus("Enter some text first.", "error");
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
    const token = await getFirebaseAuthToken();

    if (!token) {
      throw new Error(
        "Please sign in before generating audio."
      );
    }

    const stability = voiceStability
      ? Number(voiceStability.value)
      : 0.5;

    const similarity = voiceSimilarity
      ? Number(voiceSimilarity.value)
      : 0.75;

    const response = await fetch(
      `${VOICE_API_BASE_URL}/text-to-speech`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          text,
          voiceId: selectedVoiceId,
          stability,
          similarity
        })
      }
    );

    const data = await parseJsonResponse(response);

    if (!response.ok) {
      throw new Error(
        data?.message || "Voice generation failed."
      );
    }

    const audioSource = extractAudioSource(data);

    if (!audioSource) {
      throw new Error(
        "No audio was returned by the server."
      );
    }

    await displayGeneratedAudio(audioSource);

    showVoiceStatus(
      "Voice generated successfully.",
      "success"
    );
  } catch (error) {
    console.error("Voice generation error:", error);

    showVoiceStatus(
      error.message || "Unable to generate voice.",
      "error"
    );
  } finally {
    isGeneratingVoice = false;
    setGenerateButtonLoading(false);
  }
}

/* ============================================================
   RESPONSE PARSER
   ============================================================ */

async function parseJsonResponse(response) {
  const contentType =
    response.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    return await response.json();
  }

  const text = await response.text();

  try {
    return JSON.parse(text);
  } catch {
    return {
      success: response.ok,
      message: text
    };
  }
}


/* ============================================================
   AUDIO SOURCE EXTRACTION
   ============================================================ */

function extractAudioSource(data) {
  if (!data) return null;

  if (
    typeof data.audio === "string" &&
    data.audio.startsWith("data:audio/")
  ) {
    return data.audio;
  }

  if (
    typeof data.audio === "string" &&
    (
      data.audio.startsWith("https://") ||
      data.audio.startsWith("http://")
    )
  ) {
    return data.audio;
  }

  if (
    typeof data.audio === "string" &&
    isProbablyBase64(data.audio)
  ) {
    return `data:audio/mpeg;base64,${data.audio}`;
  }

  if (
    data.audio &&
    typeof data.audio === "object"
  ) {
    const audio = data.audio;

    if (typeof audio.dataUrl === "string") {
      return audio.dataUrl;
    }

    if (typeof audio.url === "string") {
      return audio.url;
    }

    if (typeof audio.audioUrl === "string") {
      return audio.audioUrl;
    }

    if (typeof audio.base64 === "string") {
      return `data:audio/mpeg;base64,${audio.base64}`;
    }

    if (typeof audio.data === "string") {
      return `data:audio/mpeg;base64,${audio.data}`;
    }
  }

  const alternatives = [
    data.audioUrl,
    data.audioURL,
    data.url,
    data.audio_data,
    data.audioData,
    data.base64
  ];

  for (const value of alternatives) {
    if (typeof value !== "string") continue;

    if (value.startsWith("data:audio/")) {
      return value;
    }

    if (
      value.startsWith("https://") ||
      value.startsWith("http://")
    ) {
      return value;
    }

    if (isProbablyBase64(value)) {
      return `data:audio/mpeg;base64,${value}`;
    }
  }

  return null;
}

function isProbablyBase64(value) {
  if (typeof value !== "string") return false;

  const cleaned = value.replace(/\s/g, "");

  return (
    cleaned.length >= 50 &&
    /^[A-Za-z0-9+/=]+$/.test(cleaned)
  );
}

/* ============================================================
   DISPLAY AUDIO
   ============================================================ */

async function displayGeneratedAudio(audioSource) {
  if (!audioSection) {
    throw new Error("Audio section was not found.");
  }

  cleanupPreviousAudio();

  const audioUrl =
    await convertAudioSourceToUrl(audioSource);

  if (!audioUrl) {
    throw new Error("Unable to prepare generated audio.");
  }

  currentAudioUrl = audioUrl;

  if (voiceAudioPlayer) {
    voiceAudioPlayer.src = audioUrl;
    voiceAudioPlayer.controls = true;
    voiceAudioPlayer.preload = "metadata";
    voiceAudioPlayer.load();
  }

  audioSection.hidden = false;
  audioSection.style.display = "";

  createDownloadButton(audioUrl);

  try {
    await voiceAudioPlayer?.play();
  } catch {
    console.log("Autoplay was blocked.");
  }

  try {
    audioSection.scrollIntoView({
      behavior: "smooth",
      block: "center"
    });
  } catch (error) {
    console.warn("Audio scroll error:", error);
  }
}

async function convertAudioSourceToUrl(audioSource) {
  if (
    !audioSource ||
    typeof audioSource !== "string"
  ) {
    return null;
  }

  if (audioSource.startsWith("data:audio/")) {
    try {
      const blob = dataUrlToBlob(audioSource);

      currentAudioBlob = blob;

      return URL.createObjectURL(blob);
    } catch (error) {
      console.error("Data URL conversion error:", error);
      return audioSource;
    }
  }

  if (
    audioSource.startsWith("https://") ||
    audioSource.startsWith("http://")
  ) {
    try {
      const response = await fetch(audioSource);

      if (response.ok) {
        const blob = await response.blob();

        currentAudioBlob = blob;

        return URL.createObjectURL(blob);
      }
    } catch (error) {
      console.warn("Remote audio fetch failed:", error);
    }

    return audioSource;
  }

  return audioSource;
}

function dataUrlToBlob(dataUrl) {
  const parts = dataUrl.split(",");

  if (parts.length < 2) {
    throw new Error("Invalid audio data URL.");
  }

  const header = parts[0];
  const base64 = parts.slice(1).join(",");

  const mimeMatch =
    header.match(/data:([^;]+);base64/);

  const mimeType =
    mimeMatch?.[1] || "audio/mpeg";

  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);

  for (let index = 0; index < binaryString.length; index++) {
    bytes[index] = binaryString.charCodeAt(index);
  }

  return new Blob([bytes], {
    type: mimeType
  });
}

/* ============================================================
   DOWNLOAD BUTTON
   ============================================================ */

function createDownloadButton(audioUrl) {
  if (!audioSection) return;

  document.getElementById(
    "voiceDownloadWrapper"
  )?.remove();

  const wrapper = document.createElement("div");

  wrapper.id = "voiceDownloadWrapper";
  wrapper.className = "voice-download-wrapper";

  const button = document.createElement("button");

  button.type = "button";
  button.id = "downloadVoiceButton";
  button.className = "download-voice-button";

  button.innerHTML = `
    <span class="download-icon">↓</span>
    <span class="download-text">Download Voice</span>
  `;

  button.addEventListener("click", () => {
    downloadGeneratedVoice(audioUrl);
  });

  wrapper.appendChild(button);

  if (voiceAudioPlayer) {
    voiceAudioPlayer.insertAdjacentElement(
      "afterend",
      wrapper
    );
  } else {
    audioSection.appendChild(wrapper);
  }
}

async function downloadGeneratedVoice(audioUrl) {
  const button = document.getElementById(
    "downloadVoiceButton"
  );

  if (button) {
    button.disabled = true;
    button.textContent = "Preparing...";
  }

  try {
    let blob = currentAudioBlob;

    if (!blob) {
      const response = await fetch(audioUrl);

      if (!response.ok) {
        throw new Error("Unable to download audio.");
      }

      blob = await response.blob();
      currentAudioBlob = blob;
    }

    const downloadUrl = URL.createObjectURL(blob);
    const extension = getAudioFileExtension(blob.type);

    const link = document.createElement("a");

    link.href = downloadUrl;
    link.download =
      `EchoCall-Voice-${getTimestamp()}.${extension}`;

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(downloadUrl);

    showVoiceStatus(
      "Voice downloaded successfully.",
      "success"
    );
  } catch (error) {
    console.error("Download error:", error);

    showVoiceStatus(
      "Unable to download the generated voice.",
      "error"
    );
  } finally {
    if (button) {
      button.disabled = false;
      button.innerHTML = `
        <span class="download-icon">↓</span>
        <span class="download-text">Download Voice</span>
      `;
    }
  }
}

function getAudioFileExtension(mimeType) {
  const mime = (mimeType || "").toLowerCase();

  if (mime.includes("wav")) return "wav";
  if (mime.includes("ogg")) return "ogg";
  if (mime.includes("webm")) return "webm";
  if (mime.includes("mp4") || mime.includes("m4a")) {
    return "m4a";
  }

  return "mp3";
}

function getTimestamp() {
  const now = new Date();

  const parts = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
    String(now.getHours()).padStart(2, "0"),
    String(now.getMinutes()).padStart(2, "0"),
    String(now.getSeconds()).padStart(2, "0")
  ];

  return `${parts[0]}-${parts[1]}-${parts[2]}-${parts[3]}-${parts[4]}-${parts[5]}`;
}

/* ============================================================
   BUTTON LOADING STATE
   ============================================================ */

function setGenerateButtonLoading(loading) {
  if (!generateVoiceButton) return;

  generateVoiceButton.disabled = loading;

  if (loading) {
    generateVoiceButton.dataset.originalHTML =
      generateVoiceButton.innerHTML;

    generateVoiceButton.innerHTML = `
      <span class="voice-loading-spinner"></span>
      <span>Generating Voice...</span>
    `;

    generateVoiceButton.classList.add("is-loading");
  } else {
    const originalHTML =
      generateVoiceButton.dataset.originalHTML;

    if (originalHTML) {
      generateVoiceButton.innerHTML = originalHTML;
    }

    generateVoiceButton.classList.remove("is-loading");
  }
}

/* ============================================================
   STATUS MESSAGE
   ============================================================ */

function showVoiceStatus(message, type = "info") {
  if (!audioStatus) {
    console.warn(message);
    return;
  }

  audioStatus.textContent = message;
  audioStatus.className = "audio-status";
  audioStatus.classList.add(`status-${type}`);
}

/* ============================================================
   BACK BUTTON
   ============================================================ */

function setupBackButton() {
  if (!voiceBackButton) return;

  voiceBackButton.addEventListener(
    "click",
    handleVoiceBack
  );
}

function handleVoiceBack() {
  try {
    if (typeof window.navigateTo === "function") {
      window.navigateTo("home");
      return;
    }

    if (
      window.router &&
      typeof window.router.navigate === "function"
    ) {
      window.router.navigate("home");
      return;
    }

    if (window.history.length > 1) {
      window.history.back();
      return;
    }

    window.location.href = "../index.html";
  } catch (error) {
    console.error("Back navigation error:", error);
    window.location.href = "../index.html";
  }
}

/* ============================================================
   CLEANUP
   ============================================================ */

function cleanupPreviousAudio() {
  if (currentAudioUrl?.startsWith("blob:")) {
    URL.revokeObjectURL(currentAudioUrl);
  }

  currentAudioUrl = "";
  currentAudioBlob = null;

  if (voiceAudioPlayer) {
    voiceAudioPlayer.pause();
    voiceAudioPlayer.removeAttribute("src");
    voiceAudioPlayer.load();
  }

  document.getElementById(
    "voiceDownloadWrapper"
  )?.remove();
}

/* ============================================================
   AUDIO EVENTS
   ============================================================ */

function setupAudioEvents() {
  if (!voiceAudioPlayer) return;

  voiceAudioPlayer.addEventListener(
    "loadedmetadata",
    () => {
      console.log("Generated audio loaded.");
    }
  );

  voiceAudioPlayer.addEventListener(
    "play",
    () => {
      console.log("Playing generated audio.");
    }
  );

  voiceAudioPlayer.addEventListener(
    "ended",
    () => {
      console.log("Generated audio finished.");
    }
  );

  voiceAudioPlayer.addEventListener(
    "error",
    () => {
      console.error("Audio player error.");

      showVoiceStatus(
        "The generated audio could not be played.",
        "error"
      );
    }
  );
}

document.addEventListener("DOMContentLoaded", setupAudioEvents);

window.addEventListener("beforeunload", () => {
  if (currentAudioUrl?.startsWith("blob:")) {
    URL.revokeObjectURL(currentAudioUrl);
  }
});

/* ============================================================
   OPTIONAL GLOBAL ACCESS
   ============================================================ */

window.EchoCallVoiceStudio = {
  generateVoice,
  loadElevenLabsVoices,
  downloadGeneratedVoice,
  getFirebaseAuthToken
};
