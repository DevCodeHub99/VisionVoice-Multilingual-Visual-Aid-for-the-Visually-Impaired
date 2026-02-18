import { useRef, useCallback, useEffect, useState } from 'react';

interface UseSpeechProps {
    language: string;
}

/**
 * Custom hook to manage Text-to-Speech (TTS) functionality.
 * Provides methods for results reading and situational announcements.
 * 
 * @param props - Configuration properties.
 * @param props.language - The current BCP 47 language code for synthesized speech.
 */
export const useSpeech = ({ language }: UseSpeechProps) => {
    const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
    const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

    const speakAnnouncement = useCallback((text: string) => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 1.0;
            window.speechSynthesis.speak(utterance);
        }
    }, []);

    const speak = useCallback((text: string, lang: string) => {
        if (typeof window === 'undefined' || !window.speechSynthesis) return;

        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = lang;
        utterance.rate = 0.9;
        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);
        utteranceRef.current = utterance;

        window.speechSynthesis.speak(utterance);
    }, []);

    const toggleSpeech = useCallback((text: string) => {
        if (!window.speechSynthesis) return;

        if (isSpeaking) {
            window.speechSynthesis.pause();
            setIsSpeaking(false);
        } else {
            if (window.speechSynthesis.paused) {
                window.speechSynthesis.resume();
                setIsSpeaking(true);
            } else if (text) {
                speak(text, language);
            }
        }
    }, [isSpeaking, speak, language]);

    const stopSpeech = useCallback(() => {
        if (window.speechSynthesis) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
        }
    }, []);

    useEffect(() => {
        return () => {
            if (window.speechSynthesis) {
                window.speechSynthesis.cancel();
            }
        };
    }, []);


    return {
        isSpeaking,
        speak,
        speakAnnouncement,
        toggleSpeech,
        stopSpeech
    };
};
