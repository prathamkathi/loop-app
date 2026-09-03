import { GoogleGenerativeAI } from '@google/generative-ai';
import cors from 'cors';

const runCors = (req: any, res: any) => new Promise((resolve, reject) => {
  cors({ origin: true })(req, res, (result: any) => {
    if (result instanceof Error) return reject(result);
    return resolve(result);
  });
});

const TEXT_MODELS = ['gemini-2.5-flash', 'gemini-flash-lite-latest'];

export default async function handler(req: any, res: any) {
  await runCors(req, res);
  if (req.method !== 'POST' && req.method !== 'OPTIONS') return res.status(405).json({ error: 'Method not allowed' });
  if (req.method === 'OPTIONS') return res.status(200).end();

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
