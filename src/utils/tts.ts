import { toast } from 'sonner';

export interface TTSOptions {
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error: string) => void;
}

/**
 * Google Translate TTS (Free & Human-like)
 */
async function playGoogleTTS(text: string): Promise<boolean> {
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
 * Native Browser TTS Fallback
 */
async function fallbackBrowserTTS(text: string): Promise<boolean> {
  return new Promise((resolve) => {
    if (!('speechSynthesis' in window)) {
      resolve(false);
      return;
    }
    
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'de-DE';
    
    const voices = window.speechSynthesis.getVoices();
    const premiumVoice = voices.find(v => 
      v.lang.startsWith('de') && 
      (v.name.includes('Google') || v.name.includes('Premium') || v.name.includes('Microsoft'))
    );
    
    if (premiumVoice) utterance.voice = premiumVoice;

    utterance.onend = () => resolve(true);
    utterance.onerror = () => resolve(false);

    window.speechSynthesis.speak(utterance);
  });
}

/**
 * Play text-to-speech audio using free high-quality sources
 */
export async function playTTS(text: string, options: TTSOptions = {}): Promise<boolean> {
  const { onStart, onEnd, onError } = options;
  const trimmed = text.trim();
  
  if (!trimmed) {
    onError?.('No text provided');
    return false;
  }

  try {
    onStart?.();

    // 1. Try Google TTS (Best free quality)
    const googleSuccess = await playGoogleTTS(trimmed);
    if (googleSuccess) {
      onEnd?.();
      return true;
    }

    // 2. Fallback to Browser
    const browserSuccess = await fallbackBrowserTTS(trimmed);
    if (browserSuccess) {
      onEnd?.();
      return true;
    }

    throw new Error('TTS generation failed');
  } catch (error) {
    console.error('TTS error:', error);
    onError?.('Failed to play audio');
    toast.error('تعذر تشغيل الصوت');
    return false;
  }
}

/**
 * Preload helper (stubbed as Google TTS doesn't need pre-fetching in the same way)
 */
export async function preloadTTS(text: string): Promise<boolean> {
  return true;
}

/**
 * Batch preload helper
 */
export async function batchPreloadTTS(texts: string[]): Promise<number> {
  return texts.length;
}
