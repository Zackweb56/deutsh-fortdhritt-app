import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Play, Pause, RotateCcw, Volume2, AlertCircle, Loader2, Headphones } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AudioPlayerProps {
  src: string;
  maxPlays: number;
  playCount: number;
  onPlay: () => void;
  onPlayComplete?: () => void;
  onPlayEnd?: (playCount: number) => void;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({ 
  src, maxPlays, playCount, onPlay, onPlayComplete, onPlayEnd 
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    setProgress(0);
    setCurrentTime(0);
    setIsLoading(true);
    setError(null);
    setIsPlaying(false);
  }, [src]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      setProgress((audio.currentTime / audio.duration) * 100);
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      setIsLoading(false);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
      }
      
      if (onPlayEnd) onPlayEnd(playCount);
      
      if (playCount >= maxPlays && onPlayComplete) {
        onPlayComplete();
      }
      
      setProgress(0);
      setCurrentTime(0);
    };

    const handleError = () => {
      setError("Audio-Fehler");
      setIsLoading(false);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, [maxPlays, onPlayComplete, onPlayEnd, src, playCount]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio || isLoading || error) return;

    if (isPlaying) {
      audio.pause();
    } else {
      // Only increment playCount if starting from the beginning
      if (audio.currentTime === 0) {
        if (playCount < maxPlays) {
          onPlay();
          audio.play().catch(() => setError("Wiedergabe-Fehler"));
        }
      } else {
        // Resuming from pause
        audio.play().catch(() => setError("Wiedergabe-Fehler"));
      }
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Can play if we have attempts left OR if we are currently in the middle of a play (paused)
  const canPlay = (playCount < maxPlays) || (currentTime > 0);

  return (
    <Card className="bg-[#111] border-white/5 rounded-2xl overflow-hidden w-full max-w-full">
      <CardContent className="p-4 sm:p-6">
        <audio 
          ref={audioRef} 
          src={src} 
          preload="auto"
          className="hidden"
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        />
        
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className={cn(
                "h-10 w-10 rounded-xl flex items-center justify-center transition-all",
                isPlaying ? "bg-[#ffcc00] text-black" : "bg-white/5 text-white/40"
              )}>
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Headphones className="h-5 w-5" />
                )}
              </div>
              <div>
                <h4 className="text-sm font-black text-white uppercase tracking-tight">
                  {error ? <span className="text-red-500">{error}</span> : isPlaying ? "Wiedergabe..." : "Bereit"}
                </h4>
                <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">
                  {maxPlays - playCount} {maxPlays - playCount === 1 ? 'Versuch' : 'Versuche'} übrig
                </p>
              </div>
            </div>

            <Button
              size="icon"
              className={cn(
                "h-12 w-12 rounded-xl transition-all",
                !canPlay && "opacity-20 grayscale cursor-not-allowed",
                isPlaying ? "bg-white/10 text-[#ffcc00] hover:bg-white/20" : "bg-[#ffcc00] text-black hover:bg-[#ffcc00]/90"
              )}
              onClick={togglePlay}
              disabled={!canPlay || isLoading}
            >
              {isPlaying ? (
                <Pause className="h-6 w-6 fill-current" />
              ) : (
                <Play className="h-6 w-6 fill-current ml-1" />
              )}
            </Button>
          </div>

          <div className="space-y-2">
            <div className="relative h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
              <div 
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-black via-red-600 to-[#ffcc00] transition-all duration-300 ease-linear"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-white/20">
              <span className={cn(isPlaying && "text-[#ffcc00]")}>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
;
