import { useState, useEffect } from 'react';
import { StudyHour, useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw, Lock, CheckCircle2, Circle } from 'lucide-react';

interface StudyHourItemProps {
  hour: StudyHour;
  dayId: string;
  isLocked: boolean;
}

export const StudyHourItem = ({ hour, dayId, isLocked }: StudyHourItemProps) => {
  const { toggleHourComplete, updateTimer } = useApp();
  const [localSeconds, setLocalSeconds] = useState(hour.timerSeconds);
  const [warningPlayed, setWarningPlayed] = useState(false);

  useEffect(() => {
    setLocalSeconds(hour.timerSeconds);
  }, [hour.timerSeconds]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (hour.timerRunning && localSeconds > 0) {
      interval = setInterval(() => {
        setLocalSeconds(prev => {
          const newSeconds = prev - 1;
          if (newSeconds <= 0) {
            updateTimer(dayId, hour.id, 0, false);
            // play completion sound
            try { playCompletionSound(); } catch (e) {}
            return 0;
          }
          // if we crossed the 5-minute threshold, play warning once per run
          if (!warningPlayed && prev > 300 && newSeconds <= 300) {
            try { playFiveMinuteWarning(); } catch (e) {}
            setWarningPlayed(true);
          }
          updateTimer(dayId, hour.id, newSeconds, true);
          return newSeconds;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [hour.timerRunning, localSeconds, dayId, hour.id, updateTimer]);

  // reset warning flag when a timer starts or the hour changes
  useEffect(() => {
    if (hour.timerRunning) {
      setWarningPlayed(false);
    }
  }, [hour.timerRunning, hour.id]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // reusable completion sound helper (Web Audio API, small sine beep)
  const playCompletionSound = () => {
    try {
      const AudioCtor = (window as any).AudioContext || (window as any).webkitAudioContext;
      if (AudioCtor) {
        const ctx = new AudioCtor();
        if (ctx.state === 'suspended' && typeof ctx.resume === 'function') {
          ctx.resume().catch(() => {});
        }

        const gain = ctx.createGain();
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        osc.connect(gain);
        gain.connect(ctx.destination);
        gain.gain.setValueAtTime(0.0001, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + 0.01);
        osc.start(ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.45);
        osc.stop(ctx.currentTime + 0.5);
        setTimeout(() => {
          try { if (typeof ctx.close === 'function') ctx.close(); } catch (e) {}
        }, 1000);
      } else {
        const audio = new Audio();
        audio.play().catch(() => {});
      }
    } catch (e) {
      // ignore audio errors
    }
  };

  // five-minute warning sound (distinct pattern)
  const playFiveMinuteWarning = () => {
    try {
      const AudioCtor = (window as any).AudioContext || (window as any).webkitAudioContext;
      if (AudioCtor) {
        const ctx = new AudioCtor();
        if (ctx.state === 'suspended' && typeof ctx.resume === 'function') {
          ctx.resume().catch(() => {});
        }

        const gain = ctx.createGain();
        const osc = ctx.createOscillator();
        osc.type = 'triangle';
        // two short descending tones
        const now = ctx.currentTime;
        osc.frequency.setValueAtTime(1200, now);
        osc.connect(gain);
        gain.connect(ctx.destination);
        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.exponentialRampToValueAtTime(0.15, now + 0.01);
        osc.start(now);
        osc.frequency.exponentialRampToValueAtTime(800, now + 0.18);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);
        osc.stop(now + 0.25);

        // second short tone shortly after
        const osc2 = ctx.createOscillator();
        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(900, now + 0.28);
        const gain2 = ctx.createGain();
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        gain2.gain.setValueAtTime(0.0001, now + 0.28);
        gain2.gain.exponentialRampToValueAtTime(0.12, now + 0.29);
        osc2.start(now + 0.28);
        gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.6);
        osc2.stop(now + 0.62);

        setTimeout(() => {
          try { if (typeof ctx.close === 'function') ctx.close(); } catch (e) {}
        }, 1200);
      } else {
        const audio = new Audio();
        audio.play().catch(() => {});
      }
    } catch (e) {
      // ignore
    }
  };

  const handlePlayPause = () => {
    updateTimer(dayId, hour.id, localSeconds, !hour.timerRunning);
  };

  const handleReset = () => {
    updateTimer(dayId, hour.id, 3600, false);
    setWarningPlayed(false);
  };

  const handleToggleComplete = () => {
    if (!isLocked) {
      toggleHourComplete(dayId, hour.id);
    }
  };

  return (
    <div 
      className={`p-3 rounded-lg border transition-all ${
        hour.completed 
          ? 'completed-hour' 
          : isLocked
          ? 'bg-muted/20 border-muted opacity-50'
          : 'bg-card/50 border-border hover:border-primary'
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{hour.icon}</span>
          <div className="flex flex-col">
            <span className="text-lg font-bold leading-tight">{hour.title}</span>
            <span className="text-xs text-neutral-500 sm:text-sm">{hour.german}</span>
          </div>
        </div>

        <Button
          size="sm"
          variant="ghost"
          onClick={handleToggleComplete}
          disabled={isLocked}
          className="h-8 w-8 p-0"
        >
          {isLocked ? (
            <Lock className="h-4 w-4 text-muted-foreground" />
          ) : hour.completed ? (
            <CheckCircle2 className="h-4 w-4 icon-success" />
          ) : (
            <Circle className="h-4 w-4" />
          )}
        </Button>
      </div>

      {!isLocked && !hour.completed && (
        <div className="flex items-center gap-2 mt-2">
          <div className="flex-1 text-center font-mono text-lg font-bold bg-background/50 rounded px-2 py-1">
            {formatTime(localSeconds)}
          </div>
          
          <Button
            size="sm"
            variant="ghost"
            onClick={handlePlayPause}
            className="h-8 w-8 p-0"
          >
            {hour.timerRunning ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4" />
            )}
          </Button>
          
          <Button
            size="sm"
            variant="ghost"
            onClick={handleReset}
            className="h-8 w-8 p-0"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>

          {/* no test buttons — sounds play automatically when timer crosses thresholds */}
        </div>
      )}
    </div>
  );
};
