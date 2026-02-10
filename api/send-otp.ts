import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';

const OTP_SECRET = process.env.OTP_SECRET || 'makefarmhub-otp-secret-key-2025';
const OTP_EXPIRY_MINUTES = 10;

function generateOTP(): string {
  return crypto.randomInt(100000, 999999).toString();
}

function createToken(identifier: string, otp: string): string {
  const expiry = Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000;
  const payload = `${identifier}:${otp}:${expiry}`;
  const hmac = crypto.createHmac('sha256', OTP_SECRET).update(payload).digest('hex');
  // Base64 encode the payload + hmac
  const token = Buffer.from(JSON.stringify({ identifier, expiry, hmac })).toString('base64');
  return token;
}

async function sendOTPEmail(email: string, otp: string, name?: string): Promise<boolean> {
  const sendgridKey = process.env.SENDGRID_API_KEY;
  if (!sendgridKey) {
    console.log(`[DEV] OTP for ${email}: ${otp}`);
    return true; // In dev mode without SendGrid, just log
  }

  try {
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${sendgridKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email }] }],
        from: { email: 'noreply@makefarmhub.com', name: 'MakeFarmHub' },
        subject: `Your MakeFarmHub Verification Code: ${otp}`,
        content: [
          {
            type: 'text/html',
            value: `
              <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px;">
                <div style="text-align: center; margin-bottom: 24px;">
                  <h1 style="color: #0a6b2b; margin: 0;">🌾 MakeFarmHub</h1>
                </div>
                <h2 style="color: #333;">Your Verification Code</h2>
                <p style="color: #555;">Hi${name ? ` ${name}` : ''},</p>
                <p style="color: #555;">Use the following code to verify your account:</p>
                <div style="background: #f0fdf4; border: 2px solid #0a6b2b; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0;">
                  <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #0a6b2b;">${otp}</span>
                </div>
                <p style="color: #888; font-size: 14px;">This code expires in ${OTP_EXPIRY_MINUTES} minutes. Do not share it with anyone.</p>
                <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
                <p style="color: #aaa; font-size: 12px; text-align: center;">
                  MakeFarmHub - Zimbabwe's Digital Agriculture Marketplace
                </p>
              </div>
            `,
          },
        ],
      }),
    });
    return response.ok;
  } catch (error) {
    console.error('SendGrid error:', error);
    return false;
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

  const { email, phone, name } = req.body || {};

  if (!email && !phone) {
    return res.status(400).json({ error: 'Email or phone number is required' });
  }

  const identifier = email || phone;
  const otp = generateOTP();
  const token = createToken(identifier, otp);

  // Send OTP via email if email is provided
  if (email) {
    const sent = await sendOTPEmail(email, otp, name);
    if (!sent) {
      return res.status(500).json({ error: 'Failed to send verification email. Please try again.' });
    }
  }

  // For phone-based OTP, we'd integrate with an SMS gateway here
  // For now, if only phone is provided and no email, log it server-side
  if (!email && phone) {
    console.log(`[SMS OTP] ${phone}: ${otp}`);
  }

  return res.status(200).json({
    success: true,
    token,
    message: email
      ? `Verification code sent to ${email}`
      : `Verification code sent to ${phone}`,
    // In development (no SendGrid key), return the OTP for testing
    ...(process.env.SENDGRID_API_KEY ? {} : { dev_otp: otp }),
  });
}
