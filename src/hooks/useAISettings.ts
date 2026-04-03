import { useState, useEffect } from 'react';
import { AISettings, AIProvider, DEFAULT_MODELS } from '../types/factsheet';

const STORAGE_KEY = 'factsheet_ai_settings';

export function useAISettings() {
  const [showSettings, setShowSettings] = useState(false);
  const [aiSettings, setAiSettings] = useState<AISettings>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : {
      provider: 'gemini',
      apiKey: '',
      model: DEFAULT_MODELS.gemini
    };
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(aiSettings));
  }, [aiSettings]);

  const updateProvider = (provider: AIProvider) => {
    setAiSettings({
      ...aiSettings,
      provider,
      model: DEFAULT_MODELS[provider]
    });
  };

  const updateSettings = (updates: Partial<AISettings>) => {
    setAiSettings(prev => ({ ...prev, ...updates }));
  };

  return {
    aiSettings,
    showSettings,
    setShowSettings,
    updateProvider,
    updateSettings
  };
}
