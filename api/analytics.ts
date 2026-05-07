import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Redis } from '@upstash/redis';

const redisUrl = (process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL) as string | undefined;
const redisToken = (process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN) as string | undefined;

const redis = new Redis({
  url: redisUrl || '',
  token: redisToken || '',
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-store');

  if (!redisUrl || !redisToken) {
    return res.status(500).json({ ok: false, error: 'server_not_configured' });
  }

  // GET: Fetch stats
  if (req.method === 'GET') {
    const { secret } = req.query;
    // Simple secret check to prevent public access to stats
    if (secret !== 'super-secret-analitics-2024') {
       return res.status(403).json({ ok: false, error: 'unauthorized' });
    }

    try {
      const totalVisits = await redis.get<number>('analytics:total_visits') || 0;
      const uniqueDevices = await redis.scard('analytics:unique_devices');
      
      // Get active users (keys matching analytics:active:*)
      // Scan is more efficient for larger sets, but for simple analytics dbsize/keys is fine if filtered.
      // Better: Count members of a set that we clean up or just use keys count.
      const activeKeys = await redis.keys('analytics:active:*');
      const activeUsersCount = activeKeys.length;

      return res.status(200).json({
        ok: true,
        stats: {
          totalVisits,
          uniqueDevices,
          activeUsersCount,
        }
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ ok: false, error: 'failed_to_fetch_stats' });
    }
  }

  // POST: Record visit
  if (req.method === 'POST') {
    const { deviceId } = req.body || {};
    if (!deviceId) return res.status(400).json({ ok: false, error: 'missing_device_id' });

    try {
      const pipeline = redis.pipeline();
      
      // Increment total visits
      pipeline.incr('analytics:total_visits');
      
      // Add to unique devices set
      pipeline.sadd('analytics:unique_devices', deviceId);
      
      // Set active user key with 5 minute expiration
      pipeline.set(`analytics:active:${deviceId}`, '1', { ex: 300 });
      
      await pipeline.exec();

      return res.status(200).json({ ok: true });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ ok: false, error: 'failed_to_record_visit' });
    }
  }

  return res.status(405).json({ ok: false, error: 'method_not_allowed' });
}
