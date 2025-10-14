import React, { useState } from 'react';
import { Volume2, Loader2, Play, Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { playTTS, TTSOptions } from '@/utils/tts';

interface TtsPlayerProps {
  text: string;
  voiceId?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'ghost' | 'outline';
  showText?: boolean;
  autoPlay?: boolean;
}

export const TtsPlayer: React.FC<TtsPlayerProps> = ({
  text,
  voiceId,
  className = '',
  size = 'md',
  variant = 'ghost',
  showText = false,
  autoPlay = false,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-10 w-10',
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  const handlePlay = async () => {
    if (isPlaying || isLoading) return;

    const options: TTSOptions = {
      voiceId,
      onStart: () => {
        setIsLoading(true);
        setIsPlaying(true);
        setError(null);
      },
      onEnd: () => {
        setIsPlaying(false);
        setIsLoading(false);
      },
      onError: (errorMessage) => {
        setError(errorMessage);
        setIsPlaying(false);
        setIsLoading(false);
      },
    };

    await playTTS(text, options);
  };

  const getIcon = () => {
    if (isLoading) {
      return <Loader2 className={`${iconSizes[size]} animate-spin`} />;
    }
    if (isPlaying) {
      return <Pause className={iconSizes[size]} />;
    }
    return <Volume2 className={iconSizes[size]} />;
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Button
        variant={variant}
        size="icon"
        className={`${sizeClasses[size]} ${error ? 'border-red-500' : ''}`}
        onClick={handlePlay}
        disabled={isLoading || !text.trim()}
        aria-label={isPlaying ? 'Pause audio' : 'Play audio'}
      >
        {getIcon()}
      </Button>
      
      {showText && (
        <span className="text-sm text-muted-foreground" dir="ltr">
          {text}
        </span>
      )}
      
      {error && (
        <span className="text-xs text-red-500" title={error}>
          Error
        </span>
      )}
    </div>
  );
};

// Example usage component
export const TtsExample: React.FC = () => {
  const sampleTexts = [
    'Hallo, wie geht es dir?',
    'Guten Morgen!',
    'Danke schön',
    'Auf Wiedersehen',
  ];

  return (
    <div className="space-y-4 p-4">
      <h3 className="text-lg font-semibold">TTS Player Examples</h3>
      
      <div className="space-y-2">
        {sampleTexts.map((text, index) => (
          <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
            <span className="text-sm" dir="ltr">{text}</span>
            <TtsPlayer 
              text={text} 
              size="sm" 
              variant="outline"
            />
          </div>
        ))}
      </div>
      
      <div className="mt-6">
        <h4 className="text-md font-medium mb-2">With Text Display:</h4>
        <TtsPlayer 
          text="Das ist ein Beispiel" 
          showText={true}
          size="md"
        />
      </div>
    </div>
  );
};
