// ==========================================
// EchoCall AI Backend
// File: server/services/openaiService.js
// ==========================================

// ==========================================
// Imports
// ==========================================

import OpenAI from "openai";
import { PDFParse } from "pdf-parse";
import mammoth from "mammoth";
import XLSX from "xlsx";
import { spawn } from "child_process";
import ffmpegPath from "ffmpeg-static";
import { toFile } from "openai/uploads";
import path from "path";

// ==========================================
// OpenAI Client
// ==========================================

const openai = new OpenAI({

    apiKey: process.env.OPENAI_API_KEY

});

export const MODEL = process.env.OPENAI_MODEL || "gpt-5.5";

// ==========================================
// Chat Completion
// ==========================================

export async function generateChatResponse({

    systemPrompt =

        "You are EchoCall AI.",

    messages = [],

    model =

        MODEL,

}){

    try{

        const response =

            await openai.chat.completions.create({

                model,

                messages: [

                    {

                        role: "system",

                        content: systemPrompt

                    },

                    ...messages

                ]

            });

        return response.choices[0].message;

    }

    catch(error){

        console.error(

            "OpenAI Chat Error:",

            error

        );

        throw error;

    }

}

// ==========================================
// Conversation Summary
// ==========================================

export async function generateSummary(

    transcript

){

    try{

        const response =

            await openai.chat.completions.create({

                model: MODEL,

                messages: [

                    {

                        role: "system",

                        content:

                        "Summarize conversations into concise notes with important action items."

                    },

                    {

                        role: "user",

                        content: transcript

                    }

                ]

            });

        return response

            .choices[0]

            .message

            .content;

    }

    catch(error){

        console.error(

            "Summary Error:",

            error

        );

        throw error;

    }

}

// ==========================================
// Translation
// ==========================================

export async function translateText(

    text,

    targetLanguage

){

    try{

        const response =

            await openai.chat.completions.create({

                model: MODEL,

                messages: [

                    {

                        role: "system",

                        content:

                        `Translate everything into ${targetLanguage}. Return only the translated text.`

                    },

                    {

                        role: "user",

                        content: text

                    }

                ]

            });

        return response

            .choices[0]

            .message

            .content;

    }

    catch(error){

        console.error(

            "Translation Error:",

            error

        );

        throw error;

    }

}

// ==========================================
// Extract Action Items
// ==========================================

export async function extractActions(

    transcript

){

    try{

        const response =

            await openai.chat.completions.create({

                model: MODEL,

                messages: [

                    {

                        role: "system",

                        content:

                        "Extract action items from this conversation. Return JSON array."

                    },

                    {

                        role: "user",

                        content: transcript

                    }

                ],

                response_format: {

                    type: "json_object"

                }

            });

        return JSON.parse(

            response

            .choices[0]

            .message

            .content

        );

    }

    catch(error){

        console.error(

            "Action Extraction Error:",

            error

        );

        throw error;

    }

}

// ==========================================
// Health Check
// ==========================================

export async function testOpenAI(){

    try{

        const response =

            await openai.chat.completions.create({

                model: MODEL,

                messages: [

                    {

                        role: "user",

                        content:

                        "Reply with OK"

                    }

                ]

            });

        return response

            .choices[0]

            .message

            .content;

    }

    catch(error){

        console.error(

            "OpenAI Test Error:",

            error

        );

        throw error;

    }

}

// ==========================================
// Streaming Chat Response
// ==========================================

export async function streamChatResponse({

    systemPrompt = "You are EchoCall AI.",

    messages = [],

    model = MODEL,

}){

    try{

        return await openai.chat.completions.create({

            model,

            stream: true,

            messages:[

                {

                    role:"system",

                    content:systemPrompt

                },

                ...messages

            ]

        });

    }

    catch(error){

        console.error(

            "Streaming Error:",

            error

        );

        throw error;

    }

}

// ==========================================
// Detect Language
// ==========================================

export async function detectLanguage(

    text

){

    try{

        const response =

            await openai.chat.completions.create({

                model: MODEL,

                messages:[

                    {

                        role:"system",

                        content:

                        "Detect the language of the text. Return only the language name."

                    },

                    {

                        role:"user",

                        content:text

                    }

                ]

            });

        return response

            .choices[0]

            .message

            .content;

    }

    catch(error){

        console.error(

            "Language Detection Error:",

            error

        );

        throw error;

    }

}

// ==========================================
// AI Memory
// ==========================================

export async function generateMemorySummary(

    messages = []

){

    try{

        const response =

            await openai.chat.completions.create({

                model: MODEL,

                messages:[

                    {

                        role:"system",

                        content:

                        "Summarize the conversation into a short memory that can help future conversations. Keep only important long-term information."

                    },

                    ...messages

                ]

            });

        return response

            .choices[0]

            .message

            .content;

    }

    catch(error){

        console.error(

            "Memory Error:",

            error

        );

        throw error;

    }

}

// ==========================================
// Speech To Text
// ==========================================

export async function transcribeAudio(

    audioFile

){

    try{

        const transcription =

            await openai.audio.transcriptions.create({

                file: audioFile,

                model: "gpt-4o-mini-transcribe"

            });

        return transcription.text;

    }

    catch(error){

        console.error(

            "Speech To Text Error:",

            error

        );

        throw error;

    }

}

// ==========================================
// Text To Speech
// ==========================================

export async function textToSpeech(

    text,

    voice = "alloy"

){

    try{

        const response =

            await openai.audio.speech.create({

                model: "gpt-4o-mini-tts",

                voice,

                input: text

            });

        return response;

    }

    catch(error){

        console.error(

            "Text To Speech Error:",

            error

        );

        throw error;

    }

}

// ==========================================
// EchoCall AI
// File Understanding
// ==========================================

// ==========================================
// Supported File Types
// ==========================================

const TEXT_EXTENSIONS = new Set([
    ".txt",
    ".md",
    ".csv",
    ".json",

    ".js",
    ".jsx",
    ".ts",
    ".tsx",

    ".html",
    ".htm",

    ".css",
    ".scss",
    ".sass",
    ".less",

    ".xml",
    ".svg",
    ".sql",

    ".py",
    ".java",
    ".c",
    ".cpp",
    ".h",
    ".hpp",
    ".cs",
    ".php",
    ".go",
    ".rs",
    ".swift",
    ".kt",
    ".kts",
    ".dart",

    ".sh",
    ".bash",
    ".yaml",
    ".yml",
    ".toml",
    ".ini",
    ".env"
]);

const DOCUMENT_EXTENSIONS = new Set([
    ".pdf",
    ".docx",
    ".xlsx",
    ".xls"
]);

const AUDIO_EXTENSIONS = new Set([
    ".mp3",
    ".wav",
    ".m4a",
    ".mp4",
    ".mpeg",
    ".mpga",
    ".webm"
]);

const VIDEO_EXTENSIONS = new Set([
    ".mp4",
    ".mov",
    ".avi",
    ".mkv",
    ".webm",
    ".m4v"
]);

// ==========================================
// Get File Extension
// ==========================================

function getFileExtension(filename = "") {

    return path
        .extname(filename)
        .toLowerCase();

}

// ==========================================
// Extract Text From Uploaded File
// ==========================================

export async function extractTextFromFile(file) {

    if (!file || !file.buffer) {

        throw new Error(
            "A valid uploaded file is required."
        );

    }

    const filename =
        file.originalname || "uploaded-file";

    const extension =
        getFileExtension(filename);

    // ======================================
    // Plain Text / Markdown / CSV / JSON
    // ======================================

    if (
        TEXT_EXTENSIONS.has(extension)
    ) {

        const text =
            file.buffer.toString("utf8");

        return {

            type: extension.substring(1),

            text

        };

    }

    // ======================================
// PDF
// ======================================

if (extension === ".pdf") {

    const parser =
        new PDFParse({
            data: file.buffer
        });

    try {

        const result =
            await parser.getText();

        return {

            type: "pdf",

            text:
                result.text || ""

        };

    }
    finally {

        await parser.destroy();

    }

}
  
    // ======================================
    // DOCX
    // ======================================

    if (extension === ".docx") {

        const result =
            await mammoth.extractRawText({
                buffer: file.buffer
            });

        return {

            type: "docx",

            text:
                result.value || ""

        };

    }

    // ======================================
    // XLSX / XLS
    // ======================================

    if (
        extension === ".xlsx" ||
        extension === ".xls"
    ) {

        const workbook =
            XLSX.read(
                file.buffer,
                {
                    type: "buffer"
                }
            );

        const sheets = [];

        for (
            const sheetName of
            workbook.SheetNames
        ) {

            const worksheet =
                workbook.Sheets[sheetName];

            const csv =
                XLSX.utils.sheet_to_csv(
                    worksheet
                );

            sheets.push(
                `SHEET: ${sheetName}\n${csv}`
            );

        }

        return {

            type: "spreadsheet",

            text:
                sheets.join("\n\n")

        };

    }

    throw new Error(
        `Unsupported document format: ${extension || "unknown"}`
    );

}

// ==========================================
// Convert Video To Audio
// ==========================================

export async function extractAudioFromVideo(
    videoFile
) {

    if (
        !videoFile ||
        !videoFile.buffer
    ) {

        throw new Error(
            "A valid video file is required."
        );

    }

    if (!ffmpegPath) {

        throw new Error(
            "FFmpeg is not available on the server."
        );

    }

    return new Promise(
        (resolve, reject) => {

            const chunks = [];

            const ffmpeg =
                spawn(
                    ffmpegPath,
                    [
                        "-hide_banner",
                        "-loglevel",
                        "error",

                        "-i",
                        "pipe:0",

                        "-vn",

                        "-acodec",
                        "libmp3lame",

                        "-f",
                        "mp3",

                        "pipe:1"
                    ]
                );

            ffmpeg.stdout.on(
                "data",
                chunk => {
                    chunks.push(chunk);
                }
            );

            let errorOutput = "";

            ffmpeg.stderr.on(
                "data",
                chunk => {
                    errorOutput +=
                        chunk.toString();
                }
            );

            ffmpeg.on(
                "error",
                error => {
                    reject(error);
                }
            );

            ffmpeg.on(
                "close",
                code => {

                    if (code !== 0) {

                        reject(
                            new Error(
                                errorOutput ||
                                "Unable to extract audio from video."
                            )
                        );

                        return;

                    }

                    resolve(
                        Buffer.concat(chunks)
                    );

                }
            );

            ffmpeg.stdin.on(
                "error",
                () => {}
            );

            ffmpeg.stdin.end(
                videoFile.buffer
            );

        }
    );

}

// ==========================================
// Transcribe Uploaded Audio File
// ==========================================

export async function transcribeUploadedAudio(
    file
) {

    if (
        !file ||
        !file.buffer
    ) {

        throw new Error(
            "A valid audio file is required."
        );

    }

    const uploadFile =
        await toFile(
            file.buffer,
            file.originalname ||
            "audio.mp3",
            {
                type:
                    file.mimetype ||
                    "audio/mpeg"
            }
        );

    return await transcribeAudio(
        uploadFile
    );

}

// ==========================================
// Analyze Any Supported File
// ==========================================

export async function analyzeUploadedFile(
    file
) {

    if (
        !file ||
        !file.buffer
    ) {

        throw new Error(
            "A valid file is required."
        );

    }

    const filename =
        file.originalname ||
        "uploaded-file";

    const extension =
        getFileExtension(filename);

    // ======================================
    // Images
    // ======================================

    if (
        file.mimetype &&
        file.mimetype.startsWith("image/")
    ) {

        return {

            category: "image",

            filename,

            mimetype:
                file.mimetype,

            buffer:
                file.buffer

        };

    }

    // ======================================
    // Video
    // ======================================

    if (
        file.mimetype?.startsWith("video/") ||
        VIDEO_EXTENSIONS.has(extension)
    ) {

        const audioBuffer =
            await extractAudioFromVideo(
                file
            );

        const audioFile =
            await toFile(
                audioBuffer,
                `${filename}.mp3`,
                {
                    type: "audio/mpeg"
                }
            );

        const transcript =
            await transcribeAudio(
                audioFile
            );

        return {

            category: "video",

            filename,

            mimetype:
                file.mimetype,

            text:
                transcript || "",

            note:
                "The current video pipeline extracts and understands the video's spoken audio. Visual-frame understanding can be added as a later video-processing layer."

        };

    }

    // ======================================
    // Audio / Song
    // ======================================

    if (
        file.mimetype?.startsWith("audio/") ||
        AUDIO_EXTENSIONS.has(extension)
    ) {

        const transcript =
            await transcribeUploadedAudio(
                file
            );

        return {

            category: "audio",

            filename,

            mimetype:
                file.mimetype,

            text:
                transcript || ""

        };

    }

    // ======================================
    // Documents
    // ======================================

    if (
        TEXT_EXTENSIONS.has(extension) ||
        DOCUMENT_EXTENSIONS.has(extension)
    ) {

        const extracted =
            await extractTextFromFile(
                file
            );

        return {

            category: "document",

            filename,

            mimetype:
                file.mimetype,

            text:
                extracted.text || "",

            documentType:
                extracted.type

        };

    }

    throw new Error(
        `Unsupported file type: ${file.mimetype || extension || "unknown"}`
    );

}

// ==========================================
// Ask EchoCall AI About Uploaded File
// ==========================================

export async function askAIAboutFile({

    fileName,

    fileType,

    fileText,

    question,

    systemPrompt = "You are EchoCall AI."

}) {

    const MAX_FILE_TEXT = 120000;

const fullText =
    String(fileText || "");

const safeText =
    fullText.slice(0, MAX_FILE_TEXT);

    const userQuestion =
        question &&
        question.trim()
            ? question.trim()
            : "Analyze this file and explain its important contents.";

    const response =
        await generateChatResponse({

            systemPrompt: `

${systemPrompt}

You are analyzing a file supplied by the user.

File name:
${fileName}

File type:
${fileType}

Rules:
- Answer using the supplied file content.
- Do not invent information that is not present.
- If the requested information is not present, say so.
- For tables or structured data, explain the relevant values clearly.
- If the file is a transcript, treat it as the transcript of the uploaded media.
- Be concise unless the user asks for detail.

Uploaded file content:
${safeText}

`.trim(),

            messages: [

                {

                    role: "user",

                    content:
                        userQuestion

                }

            ]

        });

    return (
        response?.content ||
        "I couldn't analyze the uploaded file."
    );

}

// ==========================================
// Export Client
// ==========================================
export {

    openai

};

// ==========================================
// End of File
// ==========================================