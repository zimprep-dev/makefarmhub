import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Verify Mobile Money Payment Status
 */

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { transactionRef } = req.query;

    if (!transactionRef || typeof transactionRef !== 'string') {
      return res.status(400).json({ error: 'Transaction reference is required' });
    }

    // In production, verify with mobile money provider
    // const status = await verifyWithProvider(transactionRef);

    // Simulate verification
    await new Promise(resolve => setTimeout(resolve, 500));

    const statuses = ['pending', 'success', 'failed'];
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];

    return res.status(200).json({
      transactionRef,
      status: randomStatus,
      timestamp: new Date().toISOString(),
      verified: randomStatus === 'success',
    });

  } catch (error: any) {
    console.error('Mobile Money Verification Error:', error);
    return res.status(500).json({ 
      error: 'Verification failed',
      message: error.message 
    });
  }
}
