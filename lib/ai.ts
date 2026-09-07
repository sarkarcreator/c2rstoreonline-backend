import { GoogleGenAI } from '@google/genai';

export async function generateAi(prompt: string, systemInstruction: string) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error('AI_NOT_CONFIGURED');
  const client = new GoogleGenAI({ apiKey: key });
  const result = await Promise.race([
    client.models.generateContent({ model: process.env.GEMINI_MODEL || 'gemini-2.5-flash', contents: prompt, config: { systemInstruction, temperature: 0.7, maxOutputTokens: Number(process.env.AI_MAX_OUTPUT_TOKENS || 1024) } }),
    new Promise<never>((_, reject) => setTimeout(() => reject(new Error('AI_TIMEOUT')), 20_000)),
  ]);
  if (!result.text) throw new Error('AI_NO_CONTENT');
  return result.text;
}
