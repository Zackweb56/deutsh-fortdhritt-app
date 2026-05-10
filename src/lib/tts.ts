import { toast } from 'sonner';

// In-memory cache to avoid repeated network calls for the same text
const ttsCache: Map<string, string> = new Map(); // text -> objectURL

/**
 * Native Browser TTS Fallback (Free)
 */
function fallbackBrowserTTS(text: string): Promise<boolean> {
  return new Promise((resolve) => {
    if (!('speechSynthesis' in window)) {
      resolve(false);
      return;
    }
    
    // Stop any current speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'de-DE'; // Force German
    
    // Try to find a high-quality native voice
    const voices = window.speechSynthesis.getVoices();
    const premiumVoice = voices.find(v => 
      v.lang.startsWith('de') && 
      (v.name.includes('Google') || v.name.includes('Premium') || v.name.includes('Siri') || v.name.includes('Microsoft'))
    );
    
    if (premiumVoice) {
      utterance.voice = premiumVoice;
    }

    utterance.onend = () => resolve(true);
    utterance.onerror = () => resolve(false);

    window.speechSynthesis.speak(utterance);
  });
}

/**
 * Google Translate TTS (Free & Human-like)
 * This is an unofficial but widely used high-quality free TTS service.
 */
function playGoogleTTS(text: string): Promise<boolean> {
  return new Promise((resolve) => {
    try {
      const trimmed = text.trim().substring(0, 200);
      const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=de&client=tw-ob&q=${encodeURIComponent(trimmed)}`;
      
      const audio = new Audio(url);
      audio.onended = () => resolve(true);
      audio.onerror = () => resolve(false);
      
      audio.play().catch(() => resolve(false));
    } catch (e) {
      resolve(false);
    }
  });
}

/**
 * Main TTS function
 * Prioritizes Google TTS (Free, high quality) then Browser fallback
 */
export async function speakGerman(text: string) {
  const trimmed = text.trim();
  if (!trimmed) return;

  try {
    // 1. Try Google TTS (Best free quality)
    const googleSuccess = await playGoogleTTS(trimmed);
    if (googleSuccess) return;

    // 2. Fallback to Browser Speech Synthesis
    console.warn('Google TTS failed, falling back to browser TTS');
    const browserSuccess = await fallbackBrowserTTS(trimmed);
    
    if (!browserSuccess) {
      throw new Error('TTS Failed');
    }
  } catch (error) {
    console.error('TTS Error:', error);
    toast.error('تعذر تشغيل الصوت');
  }
}

/**
 * Compatibility helper for existing code using playTTS
 */
export async function playTTS(text: string): Promise<boolean> {
  try {
    await speakGerman(text);
    return true;
  } catch {
    return false;
  }
}