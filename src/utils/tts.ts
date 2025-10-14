import { toast } from 'sonner';

/**
 * Secure TTS utility functions
 * Uses Vercel serverless function to keep API keys secure
 */

export interface TTSOptions {
  voiceId?: string;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error: string) => void;
}

/**
 * Play text-to-speech audio using secure API endpoint
 * @param text - Text to convert to speech
 * @param options - Optional configuration
 * @returns Promise<boolean> - Success status
 */
export async function playTTS(text: string, options: TTSOptions = {}): Promise<boolean> {
  const { voiceId, onStart, onEnd, onError } = options;
  const trimmed = text.trim();
  
  if (!trimmed) {
    onError?.('No text provided');
    return false;
  }

  try {
    onStart?.();

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
      const errorMessage = errorData.message || `HTTP ${response.status}: ${errorData.error}`;
      onError?.(errorMessage);
      toast.error('تعذر تشغيل الصوت', { description: errorMessage });
      return false;
    }

    // Create audio element and play
    const blob = await response.blob();
    const audio = new Audio();
    audio.src = URL.createObjectURL(blob);
    
    // Clean up object URL when done
    audio.onended = () => {
      URL.revokeObjectURL(audio.src);
      onEnd?.();
    };
    
    audio.onerror = () => {
      URL.revokeObjectURL(audio.src);
      const errorMessage = 'Audio playback failed';
      onError?.(errorMessage);
      toast.error('فشل تشغيل الصوت', { description: errorMessage });
    };

    await audio.play();
    return true;

  } catch (error) {
    console.error('TTS error:', error);
    const errorMessage = 'Network or audio error';
    onError?.(errorMessage);
    toast.error('حدث خطأ أثناء تشغيل الصوت', { 
      description: 'تأكد من اتصال الإنترنت وحاول مرة أخرى.' 
    });
    return false;
  }
}

/**
 * Preload TTS audio for faster playback
 * @param text - Text to preload
 * @param voiceId - Optional voice ID
 * @returns Promise<boolean> - Success status
 */
export async function preloadTTS(text: string, voiceId?: string): Promise<boolean> {
  const trimmed = text.trim();
  if (!trimmed) return false;

  try {
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
      console.warn('TTS preload failed:', response.status);
      return false;
    }

    // Just fetch the blob, don't play it
    await response.blob();
    return true;

  } catch (error) {
    console.warn('TTS preload error:', error);
    return false;
  }
}

/**
 * Batch preload multiple TTS audio files
 * @param texts - Array of texts to preload
 * @param voiceId - Optional voice ID
 * @returns Promise<number> - Number of successfully preloaded items
 */
export async function batchPreloadTTS(texts: string[], voiceId?: string): Promise<number> {
  const promises = texts.map(text => preloadTTS(text, voiceId));
  const results = await Promise.allSettled(promises);
  return results.filter(result => result.status === 'fulfilled' && result.value).length;
}
