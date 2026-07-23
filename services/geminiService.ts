import { Task, AnalysisResult } from '../types';
import { PROMPT_TEMPLATES } from '../constants';
import { sanitizeKeyInput, sanitizeErrorMessage, cleanAIResponseText } from '../utils/security';

/**
 * Generates an AI-powered description or text extraction using Google Gemini REST API.
 * Uses zero external SDK dependencies for high performance and zero bundle overhead.
 * 
 * @param base64Data - Pure base64 image data string.
 * @param mimeType - MIME type of the image (e.g., 'image/jpeg', 'image/png').
 * @param task - Current task (DESCRIBE or READ).
 * @param languageName - Name of target language.
 * @param customApiKey - User-configured BYOK Gemini API key (AIzaSy...).
 * @param customModel - Optional user-configured model ID (e.g. gemini-2.5-flash).
 * 
 * @returns A promise resolving to an AnalysisResult.
 */
export const generateGeminiDescription = async (
    base64Data: string,
    mimeType: string,
    task: Task,
    languageName: string,
    customApiKey?: string,
    customModel?: string
): Promise<AnalysisResult> => {
    const apiKey = sanitizeKeyInput(customApiKey);
    if (!apiKey) {
        return {
            success: false,
            error: "No Google Gemini API key configured. Please click Settings (gear icon at top right) and enter your Gemini API key (starting with 'AIzaSy...')."
        };
    }

    if (!apiKey.startsWith("AIzaSy")) {
        return {
            success: false,
            error: "Invalid Gemini API key. API keys from Google AI Studio must start with 'AIzaSy...'. Get a key at https://aistudio.google.com/app/apikey."
        };
    }

    const fullPrompt = `${PROMPT_TEMPLATES[task]} Please provide the response in ${languageName}.`;

    // Production stable Gemini models
    const defaultModels = ['gemini-2.5-flash', 'gemini-2.5-flash-lite'];
    const models = customModel?.trim()
        ? [customModel.trim(), ...defaultModels.filter(m => m !== customModel.trim())]
        : defaultModels;

    let lastError: Error | unknown = null;

    for (const model of models) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000);

        try {
            const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    systemInstruction: {
                        parts: [{ text: 'You are a crisp, direct visual aid assistant for visually impaired users. Give immediate, clear, to-the-point descriptions without conversational fluff or introductory chatter.' }]
                    },
                    contents: [
                        {
                            parts: [
                                { inlineData: { mimeType, data: base64Data } },
                                { text: fullPrompt }
                            ]
                        }
                    ],
                    generationConfig: {
                        maxOutputTokens: 300,
                        temperature: 0.2
                    }
                }),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const rawMsg = errorData.error?.message || `HTTP ${response.status} ${response.statusText}`;
                throw new Error(sanitizeErrorMessage(rawMsg));
            }

            const data = await response.json();
            const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
            const textResult = cleanAIResponseText(rawText || '');

            if (textResult) {
                return {
                    success: true,
                    text: textResult
                };
            }
        } catch (error) {
            clearTimeout(timeoutId);
            const isAbort = error instanceof Error && error.name === 'AbortError';
            const errorMsg = isAbort ? `Model ${model} request timed out (30s limit).` : sanitizeErrorMessage(error);
            console.warn(`Gemini request for '${model}' failed:`, errorMsg);
            lastError = isAbort ? new Error(`Request timed out for ${model}`) : new Error(errorMsg);
        }
    }

    const rawError = lastError instanceof Error
        ? `${lastError.message}. Please check your Gemini API key and quota in Google AI Studio.`
        : "An unknown error occurred while contacting Google Gemini service.";

    return {
        success: false,
        error: sanitizeErrorMessage(rawError)
    };
};
