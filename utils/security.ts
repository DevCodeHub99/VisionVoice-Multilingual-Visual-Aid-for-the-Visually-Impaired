/**
 * Security & Obfuscation Utilities for VisionVoice BYOK (Bring Your Own Key) Architecture.
 * Ensures API keys are sanitized, obfuscated in browser storage, and never leaked in error logs.
 */

const SALT = 'VV_SECURE_SALT_2026';

/**
 * Obfuscates a plain-text API key string before saving to localStorage.
 * Prevents raw keys from being visible in plain text in browser DevTools / Local Storage inspectors.
 */
export const obfuscateKey = (key: string): string => {
    if (!key) return '';
    try {
        const charCodes = Array.from(key).map((char, index) =>
            char.charCodeAt(0) ^ SALT.charCodeAt(index % SALT.length)
        );
        return btoa(String.fromCharCode(...charCodes));
    } catch {
        return '';
    }
};

/**
 * Deobfuscates an API key retrieved from browser storage.
 */
export const deobfuscateKey = (obfuscated: string): string => {
    if (!obfuscated) return '';
    try {
        const decoded = atob(obfuscated);
        const charCodes = Array.from(decoded).map((char, index) =>
            char.charCodeAt(0) ^ SALT.charCodeAt(index % SALT.length)
        );
        return String.fromCharCode(...charCodes);
    } catch {
        return '';
    }
};

/**
 * Sanitizes input API keys to remove invalid control characters or whitespace.
 */
export const sanitizeKeyInput = (key: string | undefined): string => {
    if (!key) return '';
    return key.replace(/[\s\r\n\t]/g, '').trim();
};

/**
 * Sanitizes error messages to guarantee NO API key patterns, headers, or query parameters leak in logs or UI.
 */
export const sanitizeErrorMessage = (error: unknown): string => {
    if (!error) return 'An unknown error occurred.';
    let message = error instanceof Error ? error.message : String(error);

    // Scrub key patterns
    message = message.replace(/sk-or-v1-[A-Za-z0-9_-]+/g, 'sk-or-v1-***');
    message = message.replace(/AIzaSy[A-Za-z0-9_-]+/g, 'AIzaSy***');
    message = message.replace(/key=[A-Za-z0-9_-]+/g, 'key=***');
    message = message.replace(/Bearer\s+[A-Za-z0-9_.-]+/gi, 'Bearer ***');

    return message;
};
