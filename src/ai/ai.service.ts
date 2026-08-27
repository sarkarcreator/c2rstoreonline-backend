import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenAI } from '@google/genai';
@Injectable() export class AiService {
  constructor(private readonly config: ConfigService) {}
  async generate(prompt: string, systemInstruction: string) { const key = this.config.get<string>('GEMINI_API_KEY'); if (!key) throw new ServiceUnavailableException('AI service is not configured'); const client = new GoogleGenAI({ apiKey: key }); const result = await Promise.race([client.models.generateContent({ model: this.config.get<string>('GEMINI_MODEL') || 'gemini-2.5-flash', contents: prompt, config: { systemInstruction, temperature: 0.7, maxOutputTokens: Number(this.config.get('AI_MAX_OUTPUT_TOKENS') || 1024) } }), new Promise<never>((_, reject) => setTimeout(() => reject(new ServiceUnavailableException('AI request timed out')), 20_000))]); if (!result.text) throw new ServiceUnavailableException('AI provider returned no content'); return result.text; }
}
