import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';

const OTP_SECRET = process.env.OTP_SECRET || 'makefarmhub-otp-secret-key-2025';

function verifyToken(token: string, otp: string): { valid: boolean; identifier: string; error?: string } {
  try {
    const decoded = JSON.parse(Buffer.from(token, 'base64').toString('utf-8'));
    const { identifier, expiry, hmac } = decoded;

    // Check expiry
    if (Date.now() > expiry) {
      return { valid: false, identifier: '', error: 'Verification code has expired. Please request a new one.' };
    }

    // Verify HMAC
    const payload = `${identifier}:${otp}:${expiry}`;
    const expectedHmac = crypto.createHmac('sha256', OTP_SECRET).update(payload).digest('hex');

    if (hmac !== expectedHmac) {
      return { valid: false, identifier, error: 'Invalid verification code. Please try again.' };
    }

    return { valid: true, identifier };
  } catch (error) {
    return { valid: false, identifier: '', error: 'Invalid token. Please request a new verification code.' };
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { token, otp } = req.body || {};

  if (!token || !otp) {
    return res.status(400).json({ error: 'Token and OTP code are required' });
  }

  const result = verifyToken(token, otp);

  if (!result.valid) {
    return res.status(400).json({ error: result.error });
  }

  return res.status(200).json({
    success: true,
    identifier: result.identifier,
    message: 'Verification successful',
  });
}
