// Origins allowed to call the telemetry endpoint
const PRODUCTION_ORIGINS = [
  'https://loop-iitd.web.app',
  'https://loop-iitd.firebaseapp.com',
  'https://loop-app-iitd.vercel.app',
];

const DEV_ORIGINS = [
  'http://localhost:8081',
  'http://localhost:19006',
];

const ALLOWED_ORIGINS = process.env.NODE_ENV === 'production'
  ? PRODUCTION_ORIGINS
  : [...PRODUCTION_ORIGINS, ...DEV_ORIGINS];

export default async function handler(req: any, res: any) {
  const origin = req.headers?.origin;
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  }

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const report = req.body;
    if (!report || typeof report !== 'object') {
      return res.status(400).json({ error: 'Invalid report payload' });
    }

    // Sanitize and log crash report to serverless logging stream
    const safeReport = {
      timestamp: report.timestamp || new Date().toISOString(),
      platform: String(report.platform || 'unknown').slice(0, 32),
      message: String(report.message || '').slice(0, 1024),
      stack: String(report.stack || '').slice(0, 4096),
      componentStack: String(report.componentStack || '').slice(0, 4096),
    };

    console.error('[CRASH_TELEMETRY]', JSON.stringify(safeReport));
    return res.status(200).json({ status: 'ok' });
  } catch (err: any) {
    console.error('Telemetry logging error:', err);
    return res.status(500).json({ error: 'Internal logging failure' });
  }
}
