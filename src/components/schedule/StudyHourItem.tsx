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
  useEffect(() => {
    setLocalSeconds(hour.timerSeconds);
  }, [hour.timerSeconds]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // reusable completion sound helper (Web Audio API, small sine beep)
  // audio is now handled globally in AppContext so timers continue when components unmount

  const handlePlayPause = () => {
    updateTimer(dayId, hour.id, localSeconds, !hour.timerRunning);
  };

  const handleReset = () => {
    updateTimer(dayId, hour.id, 3600, false);
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
