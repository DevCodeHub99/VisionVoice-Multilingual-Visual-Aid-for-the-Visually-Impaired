
export enum Task {
  DESCRIBE = 'describe',
  READ = 'read',
}

export interface LanguageOption {
  code: string;
  name: string;
}

export type AnalysisResult =
  | { success: true; text: string }
  | { success: false; error: string };

export type AIProvider = 'openrouter' | 'gemini';

export interface UserSettings {
  provider: AIProvider;
  openRouterKey: string;
  geminiKey: string;
  model: string;
  rememberKey: boolean;
}

