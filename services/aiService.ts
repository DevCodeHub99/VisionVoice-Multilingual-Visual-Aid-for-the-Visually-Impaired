import { Task, AnalysisResult, UserSettings } from '../types';
import { generateOpenRouterDescription } from './openRouterService';
import { generateGeminiDescription } from './geminiService';

/**
 * Unified AI Provider Dispatcher.
 * Automatically routes image analysis requests to the selected provider (OpenRouter or Google Gemini)
 * with intelligent cross-provider fallback logic.
 * 
 * @param base64Data - Pure base64 image data.
 * @param mimeType - MIME type of the image.
 * @param task - Current task (DESCRIBE or READ).
 * @param languageName - Name of the target language.
 * @param userSettings - Optional user configured BYOK settings.
 * 
 * @returns A promise resolving to an AnalysisResult.
 */
export const generateDescription = async (
    base64Data: string,
    mimeType: string,
    task: Task,
    languageName: string,
    userSettings?: UserSettings
): Promise<AnalysisResult> => {
    const provider = userSettings?.provider || 'openrouter';

    if (provider === 'gemini') {
        const result = await generateGeminiDescription(
            base64Data,
            mimeType,
            task,
            languageName,
            userSettings?.geminiKey,
            userSettings?.model
        );
        if (result.success) {
            return result;
        }
        // Fallback to OpenRouter if OpenRouter key is configured
        if (userSettings?.openRouterKey?.trim()) {
            console.warn("Gemini provider failed, checking OpenRouter fallback...", result.error);
            return await generateOpenRouterDescription(
                base64Data,
                mimeType,
                task,
                languageName,
                userSettings.openRouterKey,
                undefined
            );
        }
        return result;
    }

    // Default provider: OpenRouter
    const result = await generateOpenRouterDescription(
        base64Data,
        mimeType,
        task,
        languageName,
        userSettings?.openRouterKey,
        userSettings?.model
    );

    if (result.success) {
        return result;
    }

    // Fallback to Gemini if Gemini key is configured
    if (userSettings?.geminiKey?.trim()?.startsWith("AIzaSy")) {
        console.warn("OpenRouter provider failed, checking Gemini fallback...", result.error);
        return await generateGeminiDescription(
            base64Data,
            mimeType,
            task,
            languageName,
            userSettings.geminiKey,
            undefined
        );
    }

    return result;
};
