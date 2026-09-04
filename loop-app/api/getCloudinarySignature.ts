import { v2 as cloudinary } from 'cloudinary';
import { guard } from './_lib/guard';

export default async function handler(req: any, res: any) {
  // Only coordinators may mint upload signatures.
  const caller = await guard(req, res, { requireCoordinator: true });
  if (!caller) return;

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
