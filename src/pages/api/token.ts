// File: pages/api/token.ts

import { NextApiRequest, NextApiResponse } from 'next';
import { AccessToken } from 'livekit-server-sdk';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow GET
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { room, username } = req.query;

  if (!room) {
    return res
      .status(400)
      .json({ error: 'Missing "room" query parameter' });
  } else if (!username) {
    return res
      .status(400)
      .json({ error: 'Missing "username" query parameter' });
  }

  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;
  const wsUrl = process.env.LIVEKIT_URL;

  if (!apiKey || !apiSecret || !wsUrl) {
    return res
      .status(500)
      .json({ error: 'Server misconfigured' });
  }

  const at = new AccessToken(apiKey, apiSecret, { identity: String(username) });
  at.addGrant({ room: String(room), roomJoin: true, canPublish: true, canSubscribe: true });

  const token = await at.toJwt();

  // Disable caching
  res.setHeader('Cache-Control', 'no-store');

  return res.status(200).json({ token });
}
