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

// Helper for browser fallback
function fallbackBrowserTTS(text: string): Promise<boolean> {
  return new Promise((resolve) => {
    if (!('speechSynthesis' in window)) {
      resolve(false);
      return;
    }
    
    // Ensure voices are loaded
    let hasSpoken = false;
    const loadVoicesAndSpeak = () => {
      if (hasSpoken) return;
      hasSpoken = true;

      const voices = window.speechSynthesis.getVoices();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'de-DE'; // Force German
      
      const germanVoice = voices.find(v => v.lang.startsWith('de') && (v.name.includes('Google') || v.name.includes('Microsoft') || v.name.includes('Siri')));
      if (germanVoice) {
        utterance.voice = germanVoice;
      }

      utterance.onend = () => resolve(true);
      utterance.onerror = () => resolve(false);

      window.speechSynthesis.speak(utterance);
    };

    if (window.speechSynthesis.getVoices().length > 0) {
      loadVoicesAndSpeak();
    } else {
      window.speechSynthesis.onvoiceschanged = loadVoicesAndSpeak;
      setTimeout(loadVoicesAndSpeak, 1000);
    }
  });
}

// Helper for Google Translate Free TTS (High Quality)
function playGoogleTTS(text: string): Promise<boolean> {
  return new Promise((resolve) => {
    try {
      // Split text if it's too long (Google TTS limit is usually ~200 chars per request)
      // For short conversational sentences, this is fine.
      const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=de&client=tw-ob&q=${encodeURIComponent(text.substring(0, 200))}`;
      const audio = new Audio(url);
      
      audio.onended = () => resolve(true);
      audio.onerror = () => resolve(false);
      
      audio.play().catch(() => resolve(false));
    } catch (e) {
      resolve(false);
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
      // Try Google TTS first (Better quality)
      const googleSuccess = await playGoogleTTS(trimmed);
      if (googleSuccess) return true;
      
      // Ultimate fallback
      console.warn('Backend TTS failed, falling back to browser TTS');
      return await fallbackBrowserTTS(trimmed);
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
    console.warn('TTS fetch error, trying Google TTS:', error);
    const googleSuccess = await playGoogleTTS(trimmed);
    if (googleSuccess) return true;
    
    return await fallbackBrowserTTS(trimmed);
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