import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Redis } from '@upstash/redis';

const ACCESS_CODES_B64: string[] = [
  'R0VSLTA5R08tRjZKUA==','REVVLTMzQ0QtQjlEUw==','WkFLLTE3UkEtTDFWUg==','R0VSLTc1QkYtRDhSTw==','REVVLTA0S0YtTzBKTQ==',
  'WkFLLTI3U0gtRzZGSA==','R0VSLTEzTVItRjZJUA==','REVVLTI4U0EtSDRESw==','WkFLLTA4WkYtTzJBTQ==','R0VSLTMxREItUjJOTw==',
  'REVVLTA3TEktRjFTUA==','WkFLLTEyRUctQzhZUg==','R0VSLTI0S0EtTzBRTQ==','REVVLTIzVkctRjRPUw==','WkFLLTI5QkItSDhGRA==',
  'R0VSLTIxSEYtTzRSTQ==','REVVLTI2U0YtRjBKUA==','WkFLLTE0TFAtQzNSTg==','R0VSLTM0Q0YtUjBFTw==','REVVLTA5V0EtRjhLUA==',
  'WkFLLTIxU0MtSDJYRA==','R0VSLTI4TUEtTzJRTQ==','REVVLTA1QkUtRjJPUw==','WkFLLTE4REctQzBWWg==','R0VSLTAyV0YtUjJSTw==',
  'REVVLTMxTEQtQjNWWg==','WkFLLTAxS1AtRzJOSw==','R0VSLTE2UEItRDZQTw==','REVVLTI5RkMtSDRSSw==','WkFLLTMwVEItTDFaUg==',
  'R0VSLTA1SkQtRjJCUw==','REVVLTA4TUctQzJQWg==','WkFLLTI0V0MtRzRSTg==','R0VSLTIzS1AtTzJZUg==','REVVLTI3VEQtRjBKUw==',
  'WkFLLTE5QkMtQzRWWg==','R0VSLTA3R0ItUjBQTw==','REVVLTAxR0YtQzBWWg==','WkFLLTA1TUUteFRZNA==','R0VSLTI2WkItSDJVTw==',
  'REVVLTI1U0QtRjBKUw==','WkFLLTA3TUQtTzZUUg==','R0VSLTA4Q0YtUjBVTw==','REVVLTAyUVAtQzJYWg==','WkFLLTI4RUEtRzBPSw==',
  'R0VSLTE4RkYtRDJRTw==','REVVLTIyS0MtSDJSTw==','WkFLLTA5UFItTzZWWg==','R0VSLTI5TUMtUjJWTw==','REVVLTI0QkYtRjBPUw=='
];

const decode = (v: string) => Buffer.from(v, 'base64').toString('utf-8');
const ALLOWED = new Set(ACCESS_CODES_B64.map(decode));
const USED_KEY = (code: string) => `access_used:${code}`;

const redisUrl = (process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL) as string | undefined;
const redisToken = (process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN) as string | undefined;

const redis = new Redis({
  url: redisUrl || '',
  token: redisToken || '',
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'method_not_allowed' });

  const { code } = req.body || {};
  if (typeof code !== 'string') return res.status(400).json({ ok: false, error: 'invalid_request' });

  const normalized = code.trim().toUpperCase();

  if (!redisUrl || !redisToken) {
    return res.status(500).json({ ok: false, error: 'server_not_configured' });
  }
  if (!ALLOWED.has(normalized)) return res.status(200).json({ ok: false, status: 'invalid' });

  const key = USED_KEY(normalized);
  const already = await redis.get<string>(key);
  if (already === 'true') return res.status(200).json({ ok: false, status: 'used' });

  // SET key true NX ensures single-writer; if returns null, someone else set it first
  const setResult = await redis.set<string>(key, 'true', { nx: true });
  if (setResult === null) {
    return res.status(200).json({ ok: false, status: 'used' });
  }
  return res.status(200).json({ ok: true, status: 'ok' });
}


