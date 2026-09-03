import { v2 as cloudinary } from 'cloudinary';
import cors from 'cors';

const runCors = (req: any, res: any) => new Promise((resolve, reject) => {
  cors({ origin: true })(req, res, (result: any) => {
    if (result instanceof Error) return reject(result);
    return resolve(result);
  });
});

export default async function handler(req: any, res: any) {
  await runCors(req, res);
  if (req.method !== 'POST' && req.method !== 'OPTIONS') return res.status(405).json({ error: 'Method not allowed' });
  if (req.method === 'OPTIONS') return res.status(200).end();

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });

  try {
    const timestamp = Math.round(new Date().getTime() / 1000);
    const signature = cloudinary.utils.api_sign_request(
      { timestamp, folder: 'loop_events' },
      process.env.CLOUDINARY_API_SECRET || ''
    );

    res.status(200).json({
      data: {
        timestamp,
        signature,
        cloudName: process.env.CLOUDINARY_CLOUD_NAME,
        apiKey: process.env.CLOUDINARY_API_KEY,
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
