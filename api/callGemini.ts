import { GoogleGenerativeAI } from '@google/generative-ai';
import { guard } from './_lib/guard';

// Prioritize flash-lite models to prevent 429 quota exhaustion on free/dev tiers
const TEXT_MODELS = ['gemini-2.5-flash-lite', 'gemini-flash-lite-latest', 'gemini-2.5-flash'];

export default async function handler(req: any, res: any) {
  // Any signed-in user may ask the concierge (students sign in anonymously).
  const caller = await guard(req, res);
  if (!caller) return;

  try {
    const { prompt, systemInstruction } = req.body?.data || req.body || {};
    
    if (!prompt) return res.status(400).json({ error: 'Missing prompt.' });

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return res.status(500).json({ error: 'GEMINI_API_KEY is missing.' });

    const genAI = new GoogleGenerativeAI(apiKey);

    for (const modelName of TEXT_MODELS) {
      try {
        const model = genAI.getGenerativeModel({
          model: modelName,
          ...(systemInstruction ? { systemInstruction } : {}),
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 800,
          },
        });

        const result = await model.generateContent(prompt);
        const text = result.response.text();
        if (text) return res.status(200).json({ data: { text: text.trim() } });
      } catch (e) {
        // Try next model
      }
    }

    res.status(200).json({ data: { text: 'I am temporarily unable to reach the campus AI servers. Please try again in a few moments.' } });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
