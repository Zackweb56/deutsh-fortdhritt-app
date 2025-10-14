# Secure ElevenLabs TTS Setup Guide

This guide explains how to set up secure Text-to-Speech using ElevenLabs API through a Vercel serverless function.

## 🔐 Security Benefits

- **API Key Protection**: ElevenLabs API key is stored server-side only
- **Rate Limiting**: Built-in protection against abuse (30 requests/minute per IP)
- **Caching**: Audio responses are cached to reduce API costs
- **Error Handling**: Secure error messages without exposing sensitive data

## 🚀 Quick Setup

### 1. Environment Variables

#### For Vercel Deployment:
1. Go to your Vercel dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. Add these variables:

```
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
ELEVENLABS_VOICE_ID=your_preferred_voice_id_here
```

#### For Local Development:
Create a `.env` file in your project root:

```env
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
ELEVENLABS_VOICE_ID=your_preferred_voice_id_here
```

### 2. Get ElevenLabs Credentials

1. Sign up at [ElevenLabs](https://elevenlabs.io)
2. Go to Profile → API Key
3. Copy your API key
4. Go to Voice Library to find voice IDs (or use default: `21m00Tcm4TlvDq8ikWAM`)

### 3. Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# For local development with serverless functions
vercel dev
```

## 📁 File Structure

```
├── api/
│   └── tts.ts                 # Serverless function
├── src/
│   ├── lib/
│   │   └── tts.ts            # Updated TTS client
│   ├── utils/
│   │   └── tts.ts            # TTS utilities
│   └── components/
│       └── TtsPlayer.tsx     # Example TTS component
└── .env                      # Local environment variables
```

## 🔧 Usage Examples

### Basic Usage
```typescript
import { speakGerman } from '@/lib/tts';

// Simple usage
await speakGerman('Hallo, wie geht es dir?');

// With custom voice
await speakGerman('Guten Morgen!', 'your-voice-id');
```

### Advanced Usage
```typescript
import { playTTS } from '@/utils/tts';

await playTTS('Das ist ein Beispiel', {
  voiceId: 'custom-voice-id',
  onStart: () => console.log('Started'),
  onEnd: () => console.log('Finished'),
  onError: (error) => console.error(error),
});
```

### React Component
```tsx
import { TtsPlayer } from '@/components/TtsPlayer';

<TtsPlayer 
  text="Hallo Welt" 
  voiceId="german-voice-id"
  size="md"
  showText={true}
/>
```

## 🛡️ Security Features

### Rate Limiting
- 30 requests per minute per IP address
- Automatic reset after 1 minute
- 429 status code when exceeded

### Caching
- Audio responses cached for 1 hour
- Reduces API costs and improves performance
- ETag headers for efficient caching

### Error Handling
- Secure error messages
- No sensitive data exposure
- Proper HTTP status codes

## 🚀 Performance Optimization

### Preloading
```typescript
import { preloadTTS, batchPreloadTTS } from '@/utils/tts';

// Preload single audio
await preloadTTS('Common phrase');

// Preload multiple
const texts = ['Hello', 'Goodbye', 'Thank you'];
await batchPreloadTTS(texts);
```

### Caching Strategy
- Browser cache: 1 hour
- CDN cache: 1 hour
- Server cache: In-memory for session

## 🔍 Troubleshooting

### Common Issues

1. **"TTS service not configured"**
   - Check environment variables are set
   - Restart Vercel deployment after adding env vars

2. **"Rate limit exceeded"**
   - Wait 1 minute before retrying
   - Consider implementing user-based rate limiting

3. **Audio not playing**
   - Check browser console for errors
   - Ensure audio autoplay is allowed
   - Verify network connectivity

### Debug Mode
Add to your component for debugging:
```typescript
console.log('TTS API response:', response);
```

## 📊 Monitoring

### Vercel Analytics
- Monitor function invocations
- Track response times
- Watch for errors

### Custom Logging
The API logs errors to Vercel function logs:
```bash
vercel logs
```

## 💰 Cost Optimization

### Free Tier Limits
- ElevenLabs: 10,000 characters/month
- Vercel: 100GB bandwidth/month

### Optimization Tips
1. Use caching effectively
2. Preload common phrases
3. Consider audio file hosting for static content
4. Implement user-based rate limiting

## 🔄 Migration from Direct API

If migrating from direct ElevenLabs calls:

1. Remove `VITE_ELEVENLABS_API_KEY` from frontend
2. Update imports to use new TTS functions
3. Test with `vercel dev` locally
4. Deploy and set server environment variables

## 📝 API Reference

### POST /api/tts

**Request:**
```json
{
  "text": "Text to convert",
  "voiceId": "optional-voice-id"
}
```

**Response:**
- Success: `audio/mpeg` binary data
- Error: JSON with error details

**Headers:**
- `Content-Type: application/json` (request)
- `Content-Type: audio/mpeg` (response)
- `Cache-Control: public, max-age=3600` (response)

## 🎯 Best Practices

1. **Always use HTTPS** in production
2. **Implement user authentication** for rate limiting
3. **Monitor API usage** to avoid overages
4. **Cache aggressively** for common phrases
5. **Handle errors gracefully** with user feedback
6. **Test with different voices** for quality
7. **Consider audio compression** for large files

## 🆘 Support

- Check Vercel function logs: `vercel logs`
- Monitor ElevenLabs dashboard for usage
- Test API endpoint directly: `curl -X POST /api/tts`
- Review browser network tab for request/response details
