import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, Headphones, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AudioPlayerProps {
  src: string;
  maxPlays: number;
  onPlayComplete?: () => void;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ src, maxPlays, onPlayComplete }) => {
  const [playCount, setPlayCount] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      if (playCount >= maxPlays && audioRef.current.currentTime === 0) return;
      
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.error("Playback failed:", error);
        });
      }
    }
  };

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    const current = audioRef.current.currentTime;
    const dur = audioRef.current.duration;
    setCurrentTime(current);
    setProgress((current / dur) * 100);
  };

  const handleLoadedMetadata = () => {
    if (!audioRef.current) return;
    setDuration(audioRef.current.duration);
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setProgress(100);
    setPlayCount(prev => prev + 1);
    if (onPlayComplete) onPlayComplete();
    
    // Auto-reset for next play if allowed
    if (audioRef.current) {
        audioRef.current.currentTime = 0;
        setProgress(0);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onPlay = () => setIsPlaying(true);
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

  const isLimitReached = playCount >= maxPlays;

  return (
    <div className="flex items-center gap-4 bg-black/40 p-4 rounded-xl border border-white/5 group relative overflow-hidden">
      <audio ref={audioRef} src={src} />
      
      <button 
        onClick={togglePlay}
        disabled={isLimitReached && !isPlaying}
        className={cn(
          "h-10 w-10 rounded-full flex items-center justify-center text-black transition-all shadow-lg",
          isLimitReached && !isPlaying 
            ? "bg-white/10 text-white/20 cursor-not-allowed" 
            : "bg-[#ffcc00] hover:scale-105 active:scale-95 shadow-[#ffcc00]/20"
        )}
      >
        {isPlaying ? (
          <Pause className="h-5 w-5 fill-current" />
        ) : (
          <Play className="h-5 w-5 fill-current ml-0.5" />
        )}
      </button>

      <div className="flex-1 space-y-1">
        <div className="flex justify-between items-center mb-1">
            <span className="text-[10px] font-black text-white/30 uppercase tracking-widest flex items-center gap-1">
                <RotateCcw className="h-2.5 w-2.5" />
                {playCount} / {maxPlays} {playCount === 1 ? 'Wiederholung' : 'Wiederholungen'}
            </span>
            <span className="text-[10px] font-black text-white/30 tabular-nums uppercase tracking-widest">
                {formatTime(currentTime)} / {formatTime(duration || 0)}
            </span>
        </div>
        <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
          <div 
            className="h-full bg-[#ffcc00] rounded-full transition-all duration-300" 
            style={{ width: `${progress}%` }} 
          />
        </div>
      </div>

      <Headphones className={cn(
        "h-4 w-4 transition-colors",
        isPlaying ? "text-[#ffcc00] animate-pulse" : "text-white/20"
      )} />

      {isLimitReached && !isPlaying && (
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-[2px] animate-in fade-in duration-300">
            <span className="text-[10px] font-black text-[#ffcc00] uppercase tracking-[0.2em]">Hörvorgänge beendet</span>
        </div>
      )}
    </div>
  );
};

export default AudioPlayer;
