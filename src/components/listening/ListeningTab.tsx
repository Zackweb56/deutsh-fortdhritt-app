import React, { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Headphones, 
  Search, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX,
  GraduationCap,
  Clock,
  Languages
} from 'lucide-react';
import listeningData from '@/data/listening/listening-data.json';
import { isLimitedAccess } from '@/lib/access';
import LockOverlay from '@/components/ui/lock-overlay';
import { Slider } from '@/components/ui/slider';

interface ListeningExercise {
  id: string;
  title: string;
  german: string;
  arabic: string;
  audio_url: string;
}

interface LevelData {
  level_description: string;
  exercises: ListeningExercise[];
}

interface WordTiming {
  word: string;
  startTime: number;
  endTime: number;
  index: number;
  paragraphIndex: number;
}

const ListeningTab = () => {
  const [selectedLevel, setSelectedLevel] = useState<keyof typeof listeningData>('A1');
  const [selectedExercise, setSelectedExercise] = useState<ListeningExercise | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [showCaptions, setShowCaptions] = useState(true);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [currentWordIndex, setCurrentWordIndex] = useState(-1);
  const [wordTimings, setWordTimings] = useState<WordTiming[]>([]);
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const germanTextRef = useRef<HTMLDivElement>(null);

  const levels = Object.keys(listeningData) as Array<keyof typeof listeningData>;
  const currentLevelData = listeningData[selectedLevel] as LevelData;
  const limited = isLimitedAccess();

  // Filter exercises based on search term
  const filteredExercises = currentLevelData.exercises.filter(exercise =>
    exercise.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    exercise.german.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Reset when exercise changes
  useEffect(() => {
    if (selectedExercise) {
      setCurrentWordIndex(-1);
      setWordTimings([]);
      setCurrentTime(0);
    }
  }, [selectedExercise]);

  // Get actual duration and initialize timings
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !selectedExercise) return;

    const handleLoadedMetadata = () => {
      const actualDuration = audio.duration;
      setDuration(actualDuration);
      initializeWordTimings(selectedExercise.german, actualDuration);
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    
    // If metadata is already loaded
    if (audio.duration) {
      handleLoadedMetadata();
    }
    
    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, [selectedExercise]);

  // Split text into paragraphs and words
  const splitTextIntoParagraphsAndWords = (text: string): { paragraphs: string[][], words: string[] } => {
    // Split into paragraphs
    const paragraphs = text.split(/\.\s+/).filter(p => p.length > 0);
    
    const paragraphWords: string[][] = [];
    const allWords: string[] = [];
    let wordIndex = 0;

    paragraphs.forEach((paragraph, paraIndex) => {
      // Add period back to the last sentence of each paragraph except the last one
      const paragraphText = paraIndex < paragraphs.length - 1 ? paragraph + '.' : paragraph;
      
      // Split paragraph into words with punctuation
      const words = paragraphText.split(/(\s+)/).filter(part => part.trim().length > 0);
      
      paragraphWords.push(words);
      allWords.push(...words);
    });

    return { paragraphs: paragraphWords, words: allWords };
  };

  // Generate more accurate word timings
  const initializeWordTimings = (text: string, audioDuration: number) => {
    const { paragraphs, words } = splitTextIntoParagraphsAndWords(text);
    const estimatedTimings: WordTiming[] = [];
    
    // More sophisticated timing estimation
    const totalCharacters = text.replace(/\s/g, '').length;
    const charactersPerSecond = totalCharacters / audioDuration;
    
    let currentTime = 0;
    let wordIndex = 0;

    paragraphs.forEach((paragraphWords, paragraphIndex) => {
      paragraphWords.forEach((word) => {
        // Estimate time based on word complexity (length + punctuation)
        let wordDuration = (word.length / charactersPerSecond) * 0.8; // Base duration
        
        // Adjust for punctuation and word complexity
        if (word.match(/[.,!?;:]/)) {
          wordDuration *= 1.3; // Pause for punctuation
        }
        
        // Adjust for long words
        if (word.length > 8) {
          wordDuration *= 1.2;
        }
        
        // Minimum duration
        wordDuration = Math.max(wordDuration, 0.3);
        
        estimatedTimings.push({
          word,
          startTime: currentTime,
          endTime: currentTime + wordDuration,
          index: wordIndex,
          paragraphIndex
        });
        
        currentTime += wordDuration;
        wordIndex++;
      });
      
      // Add a small pause between paragraphs
      if (paragraphIndex < paragraphs.length - 1) {
        currentTime += 0.5; // 0.5 second pause between paragraphs
      }
    });

    // Normalize to fit actual audio duration
    const totalEstimatedTime = currentTime;
    const scaleFactor = audioDuration / totalEstimatedTime;
    
    const normalizedTimings = estimatedTimings.map(timing => ({
      ...timing,
      startTime: timing.startTime * scaleFactor,
      endTime: timing.endTime * scaleFactor
    }));

    setWordTimings(normalizedTimings);
  };

  // Audio event handlers
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      const time = audio.currentTime;
      setCurrentTime(time);
      
      // Find the current word based on timing
      if (wordTimings.length > 0) {
        const currentWord = wordTimings.find(
          timing => time >= timing.startTime && time < timing.endTime
        );
        
        if (currentWord && currentWord.index !== currentWordIndex) {
          setCurrentWordIndex(currentWord.index);
        } else if (!currentWord && currentWordIndex !== -1) {
          // Reset if no word found (between words or at end)
          setCurrentWordIndex(-1);
        }
      }
    };

    const handleDurationChange = () => {
      const newDuration = audio.duration;
      if (newDuration && newDuration !== duration) {
        setDuration(newDuration);
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentWordIndex(-1);
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('durationchange', handleDurationChange);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('durationchange', handleDurationChange);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
    };
  }, [selectedExercise, wordTimings, currentWordIndex, duration]);

  // Scroll to keep current word visible
  useEffect(() => {
    if (currentWordIndex >= 0 && germanTextRef.current) {
      const wordElements = germanTextRef.current.querySelectorAll('.word-highlight');
      if (wordElements[currentWordIndex]) {
        // Small delay to ensure the highlight is applied
        setTimeout(() => {
          wordElements[currentWordIndex].scrollIntoView({
            behavior: 'smooth',
            block: 'center',
            inline: 'nearest'
          });
        }, 100);
      }
    }
  }, [currentWordIndex]);

  // Audio controls
  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch(error => {
        console.error('Audio play failed:', error);
      });
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    const progressBar = progressRef.current;
    if (!audio || !progressBar) return;

    const rect = progressBar.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    const newTime = percentage * duration;
    
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (newVolume: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
    audio.volume = newVolume;
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isMuted) {
      audio.volume = volume;
      setIsMuted(false);
    } else {
      audio.volume = 0;
      setIsMuted(true);
    }
  };

  const handlePlaybackRateChange = (rate: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    
    setPlaybackRate(rate);
    audio.playbackRate = rate;
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Render German text with word highlighting in paragraphs
  const renderGermanText = () => {
    if (!selectedExercise || wordTimings.length === 0) {
      return (
        <div className="p-6 bg-gradient-to-br from-neutral-800 to-neutral-900 rounded-xl border border-neutral-700 shadow-sm">
          <p
            className="text-base leading-loose whitespace-pre-line text-neutral-100 font-medium text-left"
            dir="ltr"
            style={{
              direction: 'ltr',
              unicodeBidi: 'bidi-override',
              textAlign: 'left',
            }}
          >
            {selectedExercise?.german}
          </p>
        </div>
      );
    }

    // Group words by paragraph
    const paragraphs: WordTiming[][] = [];
    wordTimings.forEach((timing) => {
      if (!paragraphs[timing.paragraphIndex]) {
        paragraphs[timing.paragraphIndex] = [];
      }
      paragraphs[timing.paragraphIndex].push(timing);
    });

    return (
      <div
        className="p-6 bg-gradient-to-br from-neutral-800 to-neutral-900 rounded-xl border border-neutral-700 shadow-sm max-h-96 overflow-y-auto"
        dir="ltr"
        style={{
          direction: 'ltr',
          unicodeBidi: 'isolate', // key difference here!
        }}
      >
        <div className="space-y-5">
          {paragraphs.map((paragraphWords, paragraphIndex) => (
            <p
              key={paragraphIndex}
              className="text-base leading-loose mb-5 last:mb-0 text-left"
              dir="ltr"
              style={{
                direction: 'ltr',
                unicodeBidi: 'isolate',
                textAlign: 'left',
              }}
            >
              {paragraphWords.map((timing) => {
                const isCurrent = timing.index === currentWordIndex;
                const isPast = currentWordIndex !== -1 && timing.index < currentWordIndex;

                return (
                  <span
                    key={timing.index}
                    className={`word-highlight transition-all duration-300 mx-0.5 inline-block ${
                      isCurrent
                        ? 'bg-yellow-400 text-gray-900 font-bold px-2 py-1 rounded-md shadow-lg scale-110 ring-2 ring-yellow-500 ring-offset-1'
                        : isPast
                        ? 'text-neutral-400 opacity-70 font-medium'
                        : 'text-neutral-100 font-medium'
                    }`}
                    style={{
                      direction: 'ltr',
                      unicodeBidi: 'isolate',
                    }}
                  >
                    {timing.word}
                  </span>
                );
              })}
            </p>
          ))}
        </div>
      </div>
    );
  };

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Header and other components remain the same */}
      <Card className="p-6 bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <Headphones className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">الاستماع</h2>
              <p className="text-muted-foreground">
                {currentLevelData.exercises.length} تمرين • {currentLevelData.level_description}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Level Selection */}
      <Card className="p-4 overflow-x-auto">
        <div className="flex flex-nowrap sm:flex-wrap gap-2 min-w-max sm:min-w-0">
          {levels.map(level => (
            <Button
              key={level}
              variant={selectedLevel === level ? "default" : "outline"}
              onClick={() => setSelectedLevel(level)}
              className="flex items-center gap-2"
            >
              <GraduationCap className="h-4 w-4" />
              {level}
              <Badge variant="secondary" className="ml-1">
                {listeningData[level].exercises.length}
              </Badge>
            </Button>
          ))}
        </div>
      </Card>

      {/* Search */}
      <Card className="p-4">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="ابحث في تمارين الاستماع..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pr-10"
          />
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Exercises List */}
        <div className="lg:col-span-1">
          <Card className="p-4">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Headphones className="h-4 w-4" />
              تمارين الاستماع - {selectedLevel}
            </h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredExercises.map((exercise) => {
                const originalIndex = currentLevelData.exercises.findIndex(ex => ex.id === exercise.id);
                const shouldLock = limited && originalIndex >= 2;
                return (
                  <LockOverlay key={exercise.id} isLocked={shouldLock} message="تمارين محجوبة — تواصل عبر واتساب لفتح الوصول الكامل">
                    <div
                      className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 hover:shadow-md ${
                        selectedExercise?.id === exercise.id
                          ? 'border-primary bg-primary/10 shadow-lg'
                          : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => setSelectedExercise(exercise)}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold ${
                          selectedExercise?.id === exercise.id
                            ? 'bg-primary text-white'
                            : 'bg-muted text-muted-foreground'
                        }`}>
                          {originalIndex + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm truncate">{exercise.title}</h4>
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {exercise.german.substring(0, 100)}...
                          </p>
                        </div>
                      </div>
                    </div>
                  </LockOverlay>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Audio Player */}
        <div className="lg:col-span-2">
          {selectedExercise ? (
            <Card className="p-6">
              <div className="space-y-6">
                {/* Exercise Header */}
                <div>
                  <h3 className="text-xl font-bold mb-2">{selectedExercise.title}</h3>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {formatTime(duration)}
                    </div>
                    <div className="flex items-center gap-1">
                      <Languages className="h-4 w-4" />
                      ألماني - عربي
                    </div>
                  </div>
                </div>

                {/* Audio Player */}
                <div className="space-y-4">
                  <audio
                    ref={audioRef}
                    src={selectedExercise.audio_url}
                    preload="metadata"
                    onError={(e) => {
                      console.error('Audio error:', e);
                      console.error('Audio src:', selectedExercise.audio_url);
                    }}
                  />

                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div
                      ref={progressRef}
                      className="w-full h-2 bg-muted rounded-full cursor-pointer"
                      onClick={handleSeek}
                    >
                      <div
                        className="h-full bg-primary rounded-full transition-all duration-200"
                        style={{ width: `${progressPercentage}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{formatTime(currentTime)}</span>
                      <span>{formatTime(duration)}</span>
                    </div>
                  </div>

                  {/* Controls */}
                  <div className="backdrop-blur-lg bg-black/20 border border-white/10 rounded-2xl p-4 shadow-xl">
                    <div className="flex flex-col items-center gap-4">
                      <Button
                        size="lg"
                        onClick={togglePlayPause}
                        className="h-14 w-14 rounded-full backdrop-blur-sm bg-white/20 hover:bg-white/30 border border-white/30 shadow-lg"
                      >
                        {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
                      </Button>

                      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 w-full">
                        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                          {/* Volume Control */}
                          <div className="flex items-center gap-3 w-full sm:w-auto">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={toggleMute}
                              className="rounded-full h-10 w-10 p-0 backdrop-blur-sm bg-white/20 hover:bg-white/30 border border-white/30"
                            >
                              {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                            </Button>
                            <div className="flex-1 sm:w-32 min-w-0">
                              <Slider
                                value={[isMuted ? 0 : volume]}
                                min={0}
                                max={1}
                                step={0.1}
                                onValueChange={(v) => handleVolumeChange(v[0] ?? 0)}
                                className="w-full"
                              />
                            </div>
                          </div>

                          {/* Speed Control */}
                          <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
                            <span className="text-sm text-white/80 font-medium whitespace-nowrap">السرعة:</span>
                            <div className="flex gap-1 flex-wrap justify-center sm:justify-start">
                              {[0.5, 0.75, 1, 1.25, 1.5].map((rate) => (
                                <Button
                                  key={rate}
                                  variant={playbackRate === rate ? "default" : "outline"}
                                  size="sm"
                                  onClick={() => handlePlaybackRateChange(rate)}
                                  className={`h-9 w-12 text-xs rounded-full ${
                                    playbackRate === rate 
                                      ? 'bg-primary text-primary-foreground shadow-lg' 
                                      : 'backdrop-blur-sm bg-white/20 hover:bg-white/30 border-white/30 text-white hover:text-white'
                                  }`}
                                >
                                  {rate}x
                                </Button>
                              ))}
                            </div>
                          </div>
                        </div>

                        <Button
                          variant={showCaptions ? "default" : "outline"}
                          size="sm"
                          onClick={() => setShowCaptions(!showCaptions)}
                          className={`rounded-full px-4 py-2 ${
                            showCaptions 
                              ? 'bg-primary text-primary-foreground shadow-lg' 
                              : 'backdrop-blur-sm bg-white/20 hover:bg-white/30 border-white/30 text-white hover:text-white'
                          }`}
                        >
                          <Languages className="h-4 w-4 mr-2" />
                          الترجمة
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* German Text with Highlighting */}
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2 text-primary">النص الألماني</h4>
                    {renderGermanText()}
                  </div>

                  {/* Arabic Translation */}
                  {showCaptions && (
                    <div>
                      <h4 className="font-semibold mb-2 text-secondary">الترجمة العربية</h4>
                      <div className="p-4 bg-secondary/10 rounded-lg border border-secondary/20">
                        <p className="text-sm leading-relaxed text-right whitespace-pre-line">
                          {selectedExercise.arabic}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ) : (
            <Card className="p-8 text-center">
              <Headphones className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">اختر تمرين للاستماع</h3>
              <p className="text-muted-foreground">اختر تمرين من القائمة لبدء الاستماع</p>
            </Card>
          )}
        </div>
      </div>

      {/* Empty State */}
      {filteredExercises.length === 0 && (
        <Card className="p-8 text-center">
          <Headphones className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">لا توجد تمارين</h3>
          <p className="text-muted-foreground">لم يتم العثور على تمارين تطابق البحث "{searchTerm}"</p>
        </Card>
      )}
    </div>
  );
};

export default ListeningTab;