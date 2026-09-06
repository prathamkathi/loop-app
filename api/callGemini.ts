import { GoogleGenerativeAI } from '@google/generative-ai';
import { guard, checkRateLimit } from './_lib/guard';

// Production model fallback chain prioritizing speed and free-tier quota resilience
const TEXT_MODELS = ['gemini-2.5-flash-lite', 'gemini-2.5-flash', 'gemini-2.0-flash'];

export default async function handler(req: any, res: any) {
  // Any signed-in user may ask the concierge (students sign in anonymously).
  const caller = await guard(req, res);
  if (!caller) return;

  const allowed = await checkRateLimit(caller.uid, 20);
  if (!allowed) {
    return res.status(429).json({ error: 'Rate limit exceeded. You can send up to 20 queries per hour.' });
  }

  try {
    const { prompt, systemInstruction } = req.body?.data || req.body || {};
    
    if (!prompt) return res.status(400).json({ error: 'Missing prompt.' });

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return res.status(500).json({ error: 'GEMINI_API_KEY is missing.' });

    const genAI = new GoogleGenerativeAI(apiKey);

    let lastError: any = null;
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
      } catch (e: any) {
        console.error(`[callGemini] Model ${modelName} failed:`, e?.message || e);
        lastError = e;
      }
    }

    return res.status(502).json({
      error: 'All AI models failed to respond. Please try again in a few moments.',
      details: lastError?.message || 'Upstream models unavailable',
    });
  } catch (error: any) {
    console.error('[callGemini] Fatal handler error:', error);
    res.status(500).json({ error: error.message });
  }
}
