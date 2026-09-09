import type { EventItem } from '../data/events';
import type { DirectoryItem } from '../data/directory';

import { httpsCallable } from './vercelClient';

// F—05: All Gemini calls now go through Cloud Functions. The API key
// stays server-side and is never bundled into the client.

async function callGeminiViaFunction(prompt: string, systemInstruction?: string): Promise<string> {
  const geminiCall = httpsCallable('callGemini');
  const { data }: any = await geminiCall({ prompt, systemInstruction });
  if (!data?.text) {
    throw new Error('No response text received from AI assistant.');
  }
  return data.text;
}

export async function askCampusAI(
  userQuery: string,
  events: EventItem[],
  directory: DirectoryItem[]
): Promise<string> {
  const eventsContext = events.slice(0, 10).map((e) => ({
    title: e.title,
    host: e.host,
    date: e.date,
    time: e.time,
    venue: e.venue,
    category: e.category,
    contacts: e.contacts?.map((c) => `${c.name} (${c.phone})`).join(', ') || 'None',
    summary: e.blurb?.substring(0, 120),
  }));

  const directoryContext = directory.slice(0, 10).map((d) => ({
    name: d.name,
    category: d.category,
    location: d.location,
    hours: d.hours,
    phone: d.phone,
    detail: d.detail,
  }));

  const systemInstruction = `
You are "Loop AI", the official campus concierge and intelligent assistant for IIT Delhi (Indian Institute of Technology Delhi).
You are witty, helpful, energetic, and highly knowledgeable about student life, hostels, BRCA cultural clubs, CAIC tech clubs, SAC, LHC classrooms, night messes, and campus navigation.

GUIDELINES:
1. Answer concisely using bullet points and friendly formatting.
2. Directly reference relevant events from the live feed or facilities from the campus directory if matching.
3. If an event has WhatsApp contacts or emergency phone numbers, mention them so students can reach out directly.
4. Keep the tone vibrant, collegiate, and encouraging.
`.trim();

  const prompt = `
STUDENT QUERY: "${userQuery}"

CURRENT LIVE CAMPUS EVENTS:
${JSON.stringify(eventsContext, null, 2)}

CAMPUS FACILITIES & DIRECTORY:
${JSON.stringify(directoryContext, null, 2)}

Answer the student's question accurately based on the campus data above:
`.trim();

  try {
    return await callGeminiViaFunction(prompt, systemInstruction);
  } catch (err) {
    console.error('askCampusAI error:', err);
    return 'I am temporarily unable to reach the campus AI servers. Please try again in a few moments.';
  }
}


export async function enhanceEventDraft(
  rawTitle: string,
  rawBlurb: string
): Promise<{ polishedTitle: string; polishedBlurb: string; tags: string[] }> {
  const systemInstruction = `
You are a creative copywriter for student events at IIT Delhi.
Return a valid JSON object with keys:
- "polishedTitle": A catchy, professional title.
- "polishedBlurb": A 2-3 sentence engaging description.
- "tags": Array of 3-4 trending campus tags (e.g. ["#Hackathon", "#FreePizza", "#BRCA"]).
`.trim();

  const prompt = `Raw Title: ${rawTitle}\nRaw Description: ${rawBlurb}\n\nReturn JSON only:`;

  try {
    const raw = await callGeminiViaFunction(prompt, systemInstruction);
    const clean = raw.replace(/```json|```/g, '').trim();
    return JSON.parse(clean);
  } catch {
    return {
      polishedTitle: rawTitle,
      polishedBlurb: rawBlurb,
      tags: ['#CampusLife', '#IITDelhi', '#Loop'],
    };
  }
}

export async function generateEventPitch(
  title: string,
  category: string,
  blurb: string
): Promise<string> {
  const systemInstruction = `
You are a campus event marketer.
Write a 1-sentence engaging pitch explaining why a student should attend this event.
Keep it under 100 characters.
`.trim();

  const prompt = `Title: ${title}\nCategory: ${category}\nDescription: ${blurb}\n\nPitch:`;

  try {
    return await callGeminiViaFunction(prompt, systemInstruction);
  } catch {
    return 'An exciting event you won\'t want to miss on campus!';
  }
}
