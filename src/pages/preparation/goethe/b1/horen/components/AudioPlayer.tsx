import React, { useState, useRef, useEffect } from 'react';
import { Play, Headphones } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AudioPlayerProps {
  src: string;
  maxPlays: number;
  onPlayComplete?: () => void;
  className?: string;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ src, maxPlays, onPlayComplete, className }) => {
  const [playCount, setPlayCount] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const isLimitReached = playCount >= maxPlays;

  const handlePlay = () => {
    if (!audioRef.current || isLimitReached || isPlaying) return;
    audioRef.current.play().catch(err => console.error('Playback failed:', err));
  };

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    const cur = audioRef.current.currentTime;
    const dur = audioRef.current.duration;
    setCurrentTime(cur);
    setProgress(dur > 0 ? (cur / dur) * 100 : 0);
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) setDuration(audioRef.current.duration);
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setPlayCount(prev => prev + 1);
    setProgress(0);
    setCurrentTime(0);
    if (audioRef.current) audioRef.current.currentTime = 0;
    if (onPlayComplete) onPlayComplete();
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onPlay  = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);
    return () => {
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  const fmt = (t: number) => {
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const playsLeft = maxPlays - playCount;

  return (
    <div className={cn('bg-[#f1f5f9] border border-gray-300 p-3 space-y-2 relative', className)}>
      <audio ref={audioRef} src={src} />

      {/* Top row: Play button + status */}
      <div className="flex items-center gap-3">
        {/* Play button */}
        <button
          onClick={handlePlay}
          disabled={isLimitReached || isPlaying}
          className={cn(
            'h-9 w-9 border flex items-center justify-center shrink-0 transition-none',
            isLimitReached
              ? 'bg-gray-100 border-gray-200 text-gray-300 cursor-not-allowed'
              : isPlaying
                ? 'bg-gray-200 border-gray-300 text-gray-400 cursor-not-allowed'
                : 'bg-[#1e293b] border-[#1e293b] text-white cursor-pointer'
          )}
        >
          {isPlaying ? (
            <Headphones className="h-3.5 w-3.5" />
          ) : (
            <Play className="h-3.5 w-3.5 fill-current ml-0.5" />
          )}
        </button>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5">
              {/* Play count dots */}
              <div className="flex gap-1">
                {Array.from({ length: maxPlays }).map((_, i) => (
                  <div
                    key={i}
                    className={cn(
                      'h-2 w-2 border',
                      i < playCount
                        ? 'bg-gray-400 border-gray-400'
                        : isPlaying && i === playCount
                          ? 'bg-[#1e293b] border-[#1e293b]'
                          : 'bg-white border-gray-400'
                    )}
                  />
                ))}
              </div>
              <span className="text-[8px] font-bold text-gray-500 uppercase tracking-wide">
                {isPlaying
                  ? 'Wiedergabe läuft...'
                  : isLimitReached
                    ? 'Abgespielt'
                    : `${playsLeft}x verbleibend`
                }
              </span>
            </div>
            <span className="text-[8px] font-bold text-gray-400 tabular-nums shrink-0">
              {fmt(currentTime)} / {fmt(duration || 0)}
            </span>
          </div>

          {/* Progress bar */}
          <div className="h-1 w-full bg-gray-200 border border-gray-300 overflow-hidden">
            <div
              className="h-full bg-[#1e293b] transition-none"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Limit reached banner */}
      {isLimitReached && !isPlaying && (
        <div className="border border-gray-300 bg-gray-100 px-3 py-1.5 text-center">
          <span className="text-[8px] font-bold text-gray-500 uppercase tracking-widest">
            Hörvorgang abgeschlossen — Keine weiteren Versuche
          </span>
        </div>
      )}

      {/* Seek-prevention overlay (covers timeline area only) */}
      <div className="absolute inset-0 cursor-default" style={{ pointerEvents: isPlaying ? 'all' : 'none' }} />
    </div>
  );
};

export default AudioPlayer;
