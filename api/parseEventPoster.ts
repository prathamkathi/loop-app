export const config = { api: { bodyParser: { sizeLimit: "10mb" } } };

import { GoogleGenerativeAI } from '@google/generative-ai';
import { guard } from './_lib/guard';

const ALLOWED_CATEGORIES = [
  'Cultural & Arts', 'Tech & Innovation', 'Fests & Major Events', 
  'Competitions & Quizzes', 'Talks & Workshops', 'Sports & Fitness', 
  'Social & Wellness', 'Campus Notices'
];

const SYSTEM_PROMPT = `You are an elite data-extraction parser for "Loop", the premium IIT Delhi campus concierge app. Your job is to receive an image of a campus event flyer (and occasionally its Instagram caption) and extract the exact event metadata into a strict, predictable JSON format.

RULES & CONSTRAINTS:
1. Normalize Venues: Map common acronyms to their full names (e.g., "OAT" -> "Open Air Theater", "LHC" -> "Lecture Hall Complex", "Dogra" -> "Dogra Hall", "SAC" -> "Student Activity Centre").
2. Time Formatting: Convert all times to 24-hour HH:MM format. If an end time is missing, estimate a standard 2-hour duration from the start time.
3. Date Formatting: Convert all dates to YYYY-MM-DD. Assume the current year is 2026 unless specified otherwise.
4. Categorization: You MUST categorize the event into strictly ONE of these exact tags: ${JSON.stringify(ALLOWED_CATEGORIES)}.
5. Missing Data: If a field genuinely cannot be deduced from the image or caption, output null (do not guess blindly).
6. Host Identification: If you can identify the organizing club or board, use their Instagram handle format (e.g., @pac_iitd, @brcaiitd). If unsure, use the full name.

OUTPUT SCHEMA (STRICT JSON ONLY):
{"title": "String", "host": "String", "date": "YYYY-MM-DD", "startTime": "HH:MM", "endTime": "HH:MM", "venue": "String", "category": "String", "summary": "String", "confidenceScore": 0.0}`;

export default async function handler(req: any, res: any) {
  // Poster parsing is a Club Studio capability and is the most expensive
  // call in the app — coordinators only.
  const caller = await guard(req, res, { requireCoordinator: true });
  if (!caller) return;

  try {
    // Vercel parses the JSON body automatically into req.body
    const { imageB64, mimeType = 'image/jpeg', caption } = req.body?.data || req.body || {};
    
    if (!imageB64) {
      return res.status(400).json({ error: 'Missing imageB64 parameter.' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return res.status(500).json({ error: 'GEMINI_API_KEY is missing' });

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-pro',
      systemInstruction: SYSTEM_PROMPT,
      generationConfig: {
        temperature: 0.1,
        topP: 0.95,
        maxOutputTokens: 1024,
        responseMimeType: 'application/json',
      },
    });

    const userPrompt = caption
      ? 'Extract this event poster. The Instagram caption reads: "' + caption + '"'
      : 'Extract this.';

    const base64Data = imageB64.includes(',') ? imageB64.split(',')[1] : imageB64;

    const result = await model.generateContent([
      userPrompt,
      { inlineData: { data: base64Data, mimeType } },
    ]);

    const text = result.response.text();
    const cleanText = text.replace(/```(?:json)?|```/gi, '').trim();
    const parsed = JSON.parse(cleanText);

    if (parsed.category && !ALLOWED_CATEGORIES.includes(parsed.category)) {
      parsed.category = null;
    }

    // Wrap in { data: ... } to match Firebase callable response format in frontend
    res.status(200).json({ data: parsed });
  } catch (error: any) {
    console.error('Gemini error:', error);
    res.status(500).json({ error: 'Gemini extraction failed.', details: error.message });
  }
}
