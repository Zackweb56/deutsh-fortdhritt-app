import { toast } from 'sonner';

// ---------------- Secure TTS via Vercel API Route ----------------
// Uses server-side ElevenLabs API key for security

// In-memory cache to avoid repeated network calls for the same text
const ttsCache: Map<string, string> = new Map(); // text -> objectURL

async function playAudioFromBlob(blob: Blob): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audio.onended = () => {
        URL.revokeObjectURL(url);
        resolve();
      };
      audio.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Audio playback error'));
      };
      audio.play().catch(err => {
        URL.revokeObjectURL(url);
        reject(err);
      });
    } catch (e) {
      reject(e as Error);
    }
  });
}

async function secureTTS(text: string, voiceId?: string): Promise<boolean> {
  const trimmed = text.trim();
  if (!trimmed) return false;

  try {
    // Check cache first
    const cacheKey = `${trimmed}-${voiceId || 'default'}`;
    const cached = ttsCache.get(cacheKey);
    if (cached) {
      const audio = new Audio(cached);
      await audio.play();
      return true;
    }

    // Call our secure API endpoint
    const response = await fetch('/api/tts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: trimmed,
        voiceId: voiceId,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      toast.error('تعذر تشغيل الصوت', { 
        description: errorData.message || `HTTP ${response.status}: ${errorData.error}` 
      });
      return false;
    }

    // Get audio blob and cache it
    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    ttsCache.set(cacheKey, objectUrl);
    
    // Play the audio
    const audio = new Audio(objectUrl);
    await audio.play();
    return true;

  } catch (error) {
    console.error('TTS error:', error);
    toast.error('حدث خطأ أثناء تشغيل الصوت', { 
      description: 'تأكد من اتصال الإنترنت وحاول مرة أخرى.' 
    });
    return false;
  }
}

export async function speakGerman(text: string, voiceId?: string) {
  const success = await secureTTS(text, voiceId);
  if (!success) {
    toast.error('تعذر تشغيل الصوت', { 
      description: 'تأكد من أن الخادم يعمل وأن خدمة TTS متاحة.' 
    });
  }
}

// Helper function for custom voice usage
export async function playTTS(text: string, voiceId?: string): Promise<boolean> {
  return await secureTTS(text, voiceId);
}