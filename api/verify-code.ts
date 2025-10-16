import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Redis } from '@upstash/redis';

const ACCESS_CODES_B64: string[] = [
  "Rk1TLTk1MjEtMTIxMA==","T1VOLTAzMDktODgzMA==","UlFDLTc4NjEtOTczNA==","T0haLTE3NjctMjU0NA==","WlBPLTcwNTUtODE5MA==",
  "Q1lDLTg0NzQtNDIyNA==","S0dDLTExNjAtMzg0Nw==","QkZBLTg5NzYtNDI0Ng==","TkdNLTMyOTAtNzU3Mw==","U0pULTA2NTAtNDU2Nw==",
  "SjJDLTg0OTItOTIzMA==","T1pDLTMxNjgtNjM5NQ==","Q0tCLTk2NjItMzM4OA==","R0ZQLTQ3OTktOTQ3MQ==","Q1ZDLTcwMzItNTYwMQ==",
  "TUZFLTQyNzAtNzEwOA==","U0hBLTkwOTUtMTAzOQ==","Q1RBLTkyNzUtNzgzMA==","VUxFLTA0NTAtNDM2Mw==","UkpPLTY1ODItNDE4OA==",
  "RU9BLTQ5MjItMTU2OQ==","VE1WLTAwNDEtOTk1NQ==","QlpPLTUzNzctMTg1MQ==","R0tDLTk1MTYtMTk5OA==","RU5GLTQzMDgtNDY2MQ==",
  "Q1dSLTQ5NjMtMzg1MA==","T0tPLTg3MjItMzg0MA==","R1JNLTQxNjctNDE1Ng==","Qk5BLTExMTYtOTM2OQ==","Q2NGLTA4MjAtMTAyMQ==",
  "Uk5SLTQ1NjktNjU3NQ==","T1ZDLTQ1MDktNTAwMQ==","UEhNLTQxNjktMzk0NQ==","S0JQLTcyMjItNTIwMg==","Q1hNLTQzMDktNzYwMQ==",
  "TURNLTQ4MDItNDYyOA==","VFhBLTQ2NjQtNDk2MQ==","Q1JNLTg5NzItNzQ0MQ==","TlJDLTQ2OTYtNDc1Nw==","V1JNLTExOTAtNjQzMA==",
  "Qk5DLTk0NTctMTEyOA==","TU9GLTQ4ODktODQ0Ng==","T0RNLTExMjAtNjMwNg==","T0RSLTQ5NjMtNTA2NQ==","V0hFLTQxMzItNjA1MA==",
  "UUxELTkzODYtMjYxOA==","VUtGLTExMTUtNTAwNw==","Q09NLTgzMjAtOTYzNQ==","V1JDLTA1MjEtNTg0OA==","Q0tGLTg1NjItNjg0Mw==",
  "R0tGLTQ0OTQtNTAyNQ==","V0pNLTgxMzEtNTY2Nw==","T1RGLTQ3MDUtNDUzNQ==","V1ZQLTQ0NjktNjA4OA==","Q0JGLTExMjItNzQ1MA==",
  "Q0pGLTcyMDAtNjY1Ng==","Qk5GLTc4MDktNTI0MQ==","Q1RGLTg0MTQtNDYwMQ==","R0ZBLTY1MjAtNDQ1MQ==","T1VCLTExMjAtOTU1Nw==",
  "TkxSLTY1ODktMTIwOA==","TkhaLTU2MTgtNDg0Nw==","TUdGLTQzOTAtNTIwNQ==","R09NLTAzMjctNjY5Nw==","Q0lDLTg2MDgtNDI0OQ==",
  "V0pGLTk0NDQtNjQ2MQ==","Q1RDLTQ0NDAtNzA1Mg==","Q1FNLTExMDEtNzI1NQ==","U0pDLTk2NzAtNDg1NA==","Tk1DLTgyMDItNTEyNw==",
  "UEpNLTg0OTUtMzQyNg==","Q0NGLTg3MDQtNzc0Nw==","T1dBLTQyNzktNTk2Mw==","Uk1NLTcyMjktNTU0MQ==","Q0VTLTQ0MTgtNjc0Nw==",
  "V0NGLTQzOTYtNDM1OQ==","R0hGLTg2MjItNTAwNg==","U0FNLTEyMDAtNDYyMQ==","Q1VGLTQ3MzktNjg1NQ==","RlJGLTQ2MDUtNTk2Nw==",
  "U0FGLTg1ODgtNTA1Mg==","R0JDLTQ0OTktNDM0Nw==","V0RGLTQzNzktNjEwNQ==","Q1ZGLTExMTEtNzI0MA==","Q0JELTQwMDgtNDEyNw==",
  "Q1VNLTgwMDctNjM0Nw==","V0VNLTg0MDgtNDUyNQ==","Q1RJLTAzMDEtNDEyMQ==","V0ZGLTg1MTktNjUwMQ==","U0tGLTcwMDEtNDc1Nw==",
  "Q1ZDLTQ1MzktNDc0NQ==","Q0RGLTQ2OTAtNDM0OA==","R01DLTQyNTktNDQxMQ==","Q1pDLTQ1MDQtNDQyMg==","Q1dDLTg5MjAtNjUyMQ==",
  "UlJDLTQ0MDctNjI0MQ==","VVJGLTQyMTAtNDc1Nw==","R1NGLTQ1NTktNDU2MA==","Q0RNLTQyODAtNDE2Nw=="
];

const decode = (v: string) => Buffer.from(v, 'base64').toString('utf-8');
const ALLOWED = new Set(ACCESS_CODES_B64.map(decode).map((c) => c.toUpperCase()));
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


