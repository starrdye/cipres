import { GoogleGenerativeAI } from "@google/generative-ai";
import { AISettings, DEFAULT_MODELS } from "../types/factsheet";

export class AIService {
  static async call(prompt: string, settings: AISettings): Promise<string> {
    if (!settings.apiKey) {
      throw new Error(`API Key for ${settings.provider} is missing.`);
    }

    const modelName = settings.model || DEFAULT_MODELS[settings.provider];
    const urlHint = settings.baseUrl ? "Custom URL" : "Proxy URL";
    
    console.log(`[AI REQUEST] Provider: ${settings.provider}, Model: ${modelName}, Type: ${urlHint}`);
    console.log(`[AI PROMPT]:\n${prompt}`);

    let response: string;
    try {
      switch (settings.provider) {
        case 'gemini':
          response = await this.callGemini(prompt, settings.apiKey, modelName);
          break;
        case 'claude':
          response = await this.callClaude(prompt, settings.apiKey, modelName, settings.baseUrl);
          break;
        case 'doubao':
          response = await this.callDoubao(prompt, settings.apiKey, modelName, settings.baseUrl);
          break;
        case 'doubao-coding':
          response = await this.callDoubaoCoding(prompt, settings.apiKey, modelName, settings.baseUrl);
          break;
        default:
          throw new Error(`Unsupported provider: ${settings.provider}`);
      }
    } catch (error: any) {
      console.error(`[AI ERROR]: ${error.message}`);
      throw error;
    }

    console.log(`[AI RESPONSE]:\n${response}`);
    return response;
  }

  private static async callGemini(prompt: string, apiKey: string, modelName: string): Promise<string> {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: modelName });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  }

  private static async callClaude(prompt: string, apiKey: string, modelName: string, baseUrl?: string): Promise<string> {
    const url = baseUrl || '/api/anthropic/v1/messages';
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'dangerouslyAllowBrowser': 'true'
      },
      body: JSON.stringify({
        model: modelName,
        max_tokens: 1024,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = response.statusText;
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.error?.message || errorMessage;
      } catch (e) {
        errorMessage = errorText || errorMessage;
      }
      throw new Error(`Claude API Error (${response.status}): ${errorMessage}`);
    }

    const data = await response.json();
    return data.content[0].text;
  }

  private static async callDoubao(prompt: string, apiKey: string, modelName: string, baseUrl?: string): Promise<string> {
    const url = baseUrl || '/api/doubao/api/v3/chat/completions';
    console.log(`[AI FETCH] URL: ${url}`);
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: modelName,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Doubao API Error (${response.status}): ${errorText || response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }

  private static async callDoubaoCoding(prompt: string, apiKey: string, modelName: string, baseUrl?: string): Promise<string> {
    const url = baseUrl || '/api/doubao/api/coding/v3/chat/completions';
    console.log(`[AI FETCH] URL: ${url}`);
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: modelName,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Doubao Coding API Error (${response.status}): ${errorText || response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }
}
