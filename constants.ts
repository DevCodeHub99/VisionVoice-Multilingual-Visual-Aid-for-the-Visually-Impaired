import { LanguageOption, Task } from './types';

export const LANGUAGES: LanguageOption[] = [
  { code: 'en-US', name: 'English' },
  { code: 'hi-IN', name: 'हिन्दी' },
  { code: 'es-ES', name: 'Español' },
  { code: 'fr-FR', name: 'Français' },
  { code: 'de-DE', name: 'Deutsch' },
  { code: 'ja-JP', name: '日本語' },
  { code: 'it-IT', name: 'Italiano' },
  { code: 'pt-BR', name: 'Português' },
];

export const PROMPT_TEMPLATES: Record<Task, string> = {
  [Task.DESCRIBE]: 'Describe the key elements of this image for a visually impaired person. Keep the description crisp, direct, and concise (2 to 3 sentences max). State the main subject and any critical safety details or hazards immediately. Do not use filler introductory phrases.',
  [Task.READ]: 'Extract all visible text from this image accurately. Output only the extracted text without any preamble, explanation, or conversational filler. If no text is present, respond with "No text detected in image."',
};