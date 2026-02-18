import { useState, useCallback } from 'react';
import { generateDescription } from '../services/geminiService';
import { Task, LanguageOption } from '../types';
import { LANGUAGES } from '../constants';

interface UseImageProcessingProps {
    language: string;
    onStartProcessing: () => void;
    onSuccess: (result: string) => void;
    onError: (error: string) => void;
}

/**
 * Custom hook to manage image processing state and AI service integration.
 * 
 * @param props - Configuration properties for image processing.
 * @param props.language - The current language code (e.g., 'en-US').
 * @param props.onStartProcessing - Callback triggered when the AI analysis starts.
 * @param props.onSuccess - Callback triggered when the AI analysis succeeds, takes the result text.
 * @param props.onError - Callback triggered when the AI analysis fails, takes the error message.
 * 
 * @returns Object containing state and helper functions for image processing.
 */
export const useImageProcessing = ({ language, onStartProcessing, onSuccess, onError }: UseImageProcessingProps) => {
    const [image, setImage] = useState<string | null>(null);
    const [imageMimeType, setImageMimeType] = useState<string | null>(null);
    const [output, setOutput] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    /**
     * Captures an image (from camera or upload) and sends it for AI analysis.
     * 
     * @param imgData - The full data URL of the image.
     * @param mimeType - The MIME type of the image.
     * @param task - The current mode (DESCRIBE or READ).
     */
    const processImage = async (imgData: string, mimeType: string, task: Task) => {
        setImage(imgData);
        setImageMimeType(mimeType);
        setOutput('');
        setError(null);
        setIsLoading(true);

        onStartProcessing();

        const base64Data = imgData.split(',')[1];
        const selectedLanguage = LANGUAGES.find(l => l.code === language);

        try {
            const result = await generateDescription(base64Data, mimeType, task, selectedLanguage?.name || 'English');
            setOutput(result);
            setIsLoading(false);

            if (!result.startsWith('Error:')) {
                onSuccess(result);
            } else {
                setError(result);
                onError(result);
            }
        } catch (e) {
            const errorMsg = "Something went wrong.";
            setError(errorMsg);
            setIsLoading(false);
            onError(errorMsg);
        }
    };

    const reset = useCallback(() => {
        setImage(null);
        setOutput('');
        setError(null);
        setIsLoading(false);
    }, []);

    return {
        image,
        output,
        isLoading,
        error,
        processImage,
        reset
    };
};
