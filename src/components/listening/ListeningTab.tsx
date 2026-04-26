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
  Languages,
  Check,
  X,
  HelpCircle,
  AlertCircle,
  ArrowRight
} from 'lucide-react';
import listeningData from '@/data/listening_reading/data.json';
import { isLimitedAccess } from '@/lib/access';
import LockOverlay from '@/components/ui/lock-overlay';
import { Slider } from '@/components/ui/slider';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Question {
  question: string;
  options: string[];
  correct_answer: string;
}

interface ListeningExercise {
  id: string;
  title: string;
  de_text: string;
  ar_text_translation: string;
  audio_url: string;
  exercises: Question[];
}

interface LevelData {
  level_description: string;
  texts: ListeningExercise[];
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
  const [answers, setAnswers] = useState<Record<number, string>>({});

  const audioRef = useRef<HTMLAudioElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const germanTextRef = useRef<HTMLDivElement>(null);

  const levels = Object.keys(listeningData) as Array<keyof typeof listeningData>;
  const currentLevelData = listeningData[selectedLevel] as LevelData;
  const limited = isLimitedAccess();

  // Filter exercises based on search term
  const filteredExercises = currentLevelData.texts.filter(exercise =>
    exercise.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    exercise.de_text.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Reset when exercise changes
  useEffect(() => {
    if (selectedExercise) {
      setCurrentWordIndex(-1);
      setWordTimings([]);
      setCurrentTime(0);
      setAnswers({}); // Reset answers
    }
  }, [selectedExercise]);

  // Get actual duration and initialize timings
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !selectedExercise) return;

    const handleLoadedMetadata = () => {
      const actualDuration = audio.duration;
      setDuration(actualDuration);
      initializeWordTimings(selectedExercise.de_text, actualDuration);
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
    const wordIndex = 0;

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

  const handleAnswerChange = (questionIndex: number, answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionIndex]: answer
    }));
  };

  const getAnsweredCount = () => {
    if (!selectedExercise?.exercises) return 0;
    return Object.keys(answers).length;
  };

  const getTotalQuestions = () => {
    return selectedExercise?.exercises?.length || 0;
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
            {selectedExercise?.de_text}
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
          unicodeBidi: 'isolate',
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
                    className={`word-highlight transition-all duration-300 mx-0.5 inline-block ${isCurrent
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

  // Helper function to get audio duration from URL
  const getAudioDuration = (url: string): Promise<number> => {
    return new Promise((resolve) => {
      const audio = new Audio(url);
      audio.addEventListener('loadedmetadata', () => {
        resolve(audio.duration);
      });
      audio.addEventListener('error', () => {
        resolve(0);
      });
    });
  };

  // State to store durations for exercises
  const [audioDurations, setAudioDurations] = useState<Record<string, number>>({});

  // Effect to load all audio durations when component mounts or levels change
  useEffect(() => {
    const loadAllDurations = async () => {
      const durations: Record<string, number> = {};
      
      for (const level of levels) {
        const levelData = listeningData[level] as LevelData;
        for (const exercise of levelData.texts) {
          if (!durations[exercise.id]) {
            try {
              const duration = await getAudioDuration(exercise.audio_url);
              durations[exercise.id] = duration;
            } catch (error) {
              console.error(`Failed to load duration for ${exercise.id}:`, error);
              durations[exercise.id] = 0;
            }
          }
        }
      }
      
      setAudioDurations(durations);
    };
    
    loadAllDurations();
  }, []);

  // Format duration function
  const formatDurationFromUrl = (audioUrl: string) => {
    // Find exercise by audio URL to get its duration
    const exercise = Object.values(listeningData)
      .flatMap((level: any) => level.texts)
      .find((ex: any) => ex.audio_url === audioUrl);
    
    const duration = exercise ? audioDurations[exercise.id] : 0;
    
    if (!duration || duration === 0) return '0:00';
    
    const minutes = Math.floor(duration / 60);
    const seconds = Math.floor(duration % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

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
              <h2 className="text-2xl font-bold">الاستماع والقراءة</h2>
              <p className="text-muted-foreground">
                {currentLevelData.texts.length} تمرين • {currentLevelData.level_description}
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
                {listeningData[level as keyof typeof listeningData].texts.length}
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
            placeholder="ابحث في التمارين..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pr-10"
          />
        </div>
      </Card>

      <div className="min-h-[400px]">
        {/* Exercises List - Dashboard View */}
        {!selectedExercise ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold flex items-center gap-2 text-xl">
                <Headphones className="h-5 w-5 text-primary" />
                قائمة التمارين - {selectedLevel}
              </h3>
              <Badge variant="outline" className="px-3 py-1">
                {filteredExercises.length} تمرين متاح
              </Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredExercises.map((exercise) => {
                const originalIndex = currentLevelData.texts.findIndex(ex => ex.id === exercise.id);
                const shouldLock = limited && originalIndex >= 2;
                return (
                  <LockOverlay key={exercise.id} isLocked={shouldLock} message="تمارين محجوبة — تواصل عبر واتساب لفتح الوصول الكامل">
                    <Card
                      className={`group relative overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-2 ${selectedExercise?.id === exercise.id
                        ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10'
                        : 'border-transparent hover:border-primary/30'
                        }`}
                      onClick={() => setSelectedExercise(exercise)}
                    >
                      <div className="p-5 space-y-4">
                        <div className="flex items-start justify-between">
                          <div className={`h-10 w-10 rounded-xl flex items-center justify-center text-sm font-bold transition-colors ${selectedExercise?.id === exercise.id
                            ? 'bg-primary text-white shadow-md shadow-primary/30'
                            : 'bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary'
                            }`}>
                            {originalIndex + 1}
                          </div>
                          {shouldLock && <div className="p-1 rounded bg-amber-500/10 text-amber-500"><GraduationCap className="h-4 w-4" /></div>}
                        </div>

                        <div className="space-y-2">
                          <h4 className="font-bold text-base leading-tight line-clamp-1 group-hover:text-primary transition-colors">
                            {exercise.title}
                          </h4>
                          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                            {exercise.de_text.substring(0, 80)}...
                          </p>
                        </div>

                        <div className="pt-2 flex items-center justify-between text-xs font-medium text-muted-foreground border-t border-border/50">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {exercise.audio_url && exercise.audio_url !== '#' ? formatDurationFromUrl(exercise.audio_url) : (
                              <span className="text-yellow-600 font-bold">قريباً</span>
                            )}
                          </span>
                          <span className="flex items-center gap-1 group-hover:text-primary transition-colors">
                            ابدأ الآن <ArrowRight className="h-3 w-3 mr-1" />
                          </span>
                        </div>
                      </div>
                    </Card>
                  </LockOverlay>
                );
              })}
            </div>

            {filteredExercises.length === 0 && (
              <Card className="p-12 text-center border-dashed">
                <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                  <Search className="h-8 w-8 text-muted-foreground opacity-50" />
                </div>
                <h3 className="text-lg font-semibold mb-2">لا توجد نتائج</h3>
                <p className="text-muted-foreground max-w-xs mx-auto">لم يتم العثور على أي تمارين تطابق "{searchTerm}" في هذا المستوى.</p>
                <Button variant="link" onClick={() => setSearchTerm('')} className="mt-2 text-primary">
                  مسح البحث
                </Button>
              </Card>
            )}
          </div>
        ) : (
          /* Exercise Active View - 2 Column Layout */
          <div className="space-y-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedExercise(null)}
              className="flex items-center gap-2 hover:bg-primary/10 hover:text-primary transition-all pr-4 pl-2 mb-2"
            >
              <ArrowRight className="h-4 w-4" />
              العودة لقائمة التمارين
            </Button>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Column 1: Audio & Text (8/12) */}
              <div className="lg:col-span-8 space-y-6">
                <Card className="p-0 overflow-hidden border-2 border-primary/10 shadow-lg bg-card">
                  {/* Header section with specific styling */}
                  <div className="bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10 p-6 border-b border-primary/20">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <Badge className="mb-3 bg-primary/20 text-primary hover:bg-primary/30 border-none px-3">تمرين الاستماع والقراءة</Badge>
                        <h3 className="text-2xl font-black tracking-tight">{selectedExercise.title}</h3>
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground font-medium">
                          <span className="flex items-center gap-1.5"><Clock className="h-4 w-4 text-primary" /> {formatTime(duration)}</span>
                          <span className="flex items-center gap-1.5"><Languages className="h-4 w-4 text-primary" /> ألماني - عربي</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant={showCaptions ? "default" : "outline"}
                          size="sm"
                          onClick={() => setShowCaptions(!showCaptions)}
                          className="rounded-full shadow-sm"
                        >
                          <Languages className="h-4 w-4 ml-2" />
                          {showCaptions ? "إخفاء الترجمة" : "إظهار الترجمة"}
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 md:p-8 space-y-8">
                    {/* Audio Player Component */}
                    {selectedExercise.audio_url && selectedExercise.audio_url !== '#' ? (
                      <div className="space-y-6 p-6 rounded-3xl bg-neutral-900 border border-neutral-800 shadow-inner">
                        <audio
                          ref={audioRef}
                          src={selectedExercise.audio_url}
                          preload="metadata"
                        />

                        <div className="space-y-4">
                          {/* Progress Bar */}
                          <div className="space-y-2">
                            <div
                              ref={progressRef}
                              className="w-full h-3 bg-neutral-800 rounded-full cursor-pointer relative group overflow-hidden"
                              onClick={handleSeek}
                            >
                              <div
                                className="h-full bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full transition-all duration-300 relative"
                                style={{ width: `${progressPercentage}%` }}
                              >
                                <div className="absolute right-0 top-0 h-full w-4 bg-yellow-300/20 blur-sm animate-pulse" />
                              </div>
                            </div>
                            <div className="flex justify-between text-[10px] uppercase tracking-widest font-bold text-neutral-500">
                              <span>{formatTime(currentTime)}</span>
                              <span>{formatTime(duration)}</span>
                            </div>
                          </div>

                          {/* Controls */}
                          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                            <div className="flex items-center gap-4">
                              <Button
                                size="icon"
                                onClick={togglePlayPause}
                                className="h-14 w-14 rounded-full bg-red-600 hover:bg-red-700 text-white transition-transform hover:scale-105 active:scale-95"
                              >
                                {isPlaying ? <Pause className="h-8 w-8" /> : <Play className="h-8 w-8 ml-1" />}
                              </Button>

                              <div className="flex flex-col gap-1.5">
                                <div className="flex items-center gap-2">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={toggleMute}
                                    className="h-8 w-8 text-neutral-400 hover:text-red-500"
                                  >
                                    {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                                  </Button>
                                  <Slider
                                    value={[isMuted ? 0 : volume]}
                                    min={0}
                                    max={1}
                                    step={0.1}
                                    onValueChange={(v) => handleVolumeChange(v[0] ?? 0)}
                                    className="w-24 md:w-32"
                                  />
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 bg-neutral-800/50 p-1 rounded-full border border-neutral-700">
                              {[0.5, 0.75, 1, 1.25, 1.5].map((rate) => (
                                <Button
                                  key={rate}
                                  variant={playbackRate === rate ? "default" : "ghost"}
                                  size="sm"
                                  onClick={() => handlePlaybackRateChange(rate)}
                                  className={`h-8 w-10 text-[10px] font-bold rounded-full transition-all ${playbackRate === rate
                                    ? 'bg-yellow-500 text-white shadow-lg hover:bg-yellow-600'
                                    : 'text-neutral-400 hover:text-yellow-500 hover:bg-neutral-700'
                                    }`}
                                >
                                  {rate}x
                                </Button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="p-10 rounded-3xl bg-neutral-900 border-2 border-dashed border-neutral-800 text-center space-y-4 animate-in fade-in zoom-in duration-500">
                        <div className="h-20 w-20 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(234,179,8,0.1)]">
                          <Clock className="h-10 w-10 text-yellow-500" />
                        </div>
                        <div className="space-y-2">
                          <h4 className="text-2xl font-black text-white tracking-tight">التسجيل الصوتي سيتوفر قريباً</h4>
                          <p className="text-neutral-400 max-w-sm mx-auto leading-relaxed">
                            نحن نقوم حالياً بتجهيز التسجيل الصوتي الاحترافي لهذا النص. ترقبوا التحديث القادم!
                          </p>
                        </div>
                        <div className="pt-2">
                          <Badge variant="outline" className="text-yellow-500 border-yellow-500/30 px-4 py-1">
                            قيد العمل (Coming Soon)
                          </Badge>
                        </div>
                      </div>
                    )}

                    {/* German Text with Highlighting */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="h-1.5 w-8 bg-red-600 rounded-full"></div>
                        <h4 className="font-bold text-lg text-red-600 uppercase tracking-wider">النص الألماني</h4>
                      </div>
                      <div ref={germanTextRef}>
                        {renderGermanText()}
                      </div>
                    </div>

                    {/* Arabic Translation */}
                    {showCaptions && (
                      <div className="space-y-4 pt-4 border-t border-border/50">
                        <div className="flex items-center gap-2 mb-2 justify-end">
                          <h4 className="font-bold text-lg text-secondary uppercase tracking-wider">الترجمة العربية</h4>
                          <div className="h-1.5 w-8 bg-secondary rounded-full"></div>
                        </div>
                        <div className="p-6 bg-secondary/5 rounded-2xl border border-secondary/20 shadow-sm">
                          <p className="text-lg leading-relaxed text-right whitespace-pre-line font-medium text-neutral-700 dark:text-neutral-300">
                            {selectedExercise.ar_text_translation}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              </div>

              {/* Column 2: Questions (4/12) - IMPROVED VERSION */}
              <div className="lg:col-span-4 space-y-6">
                <Card className="border-2 border-red-600/20 shadow-lg overflow-hidden sticky top-6">
                  <div className="bg-red-600/10 p-6 border-b border-red-600/20">
                    <h3 className="text-xl font-bold flex items-center gap-2">
                      <GraduationCap className="h-5 w-5 text-red-600" />
                      اختبر فهمك
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1 font-medium">أجب على الأسئلة بناءً على ما قرأت واستمعت إليه</p>
                  </div>

                  <div className="p-6 space-y-8 max-h-[calc(100vh-250px)] overflow-y-auto custom-scrollbar">
                    {selectedExercise.exercises && selectedExercise.exercises.length > 0 ? (
                      selectedExercise.exercises.map((question, qIndex) => {
                        const selectedAnswer = answers[qIndex];
                        const isCorrect = selectedAnswer === question.correct_answer;
                        const hasAnswered = selectedAnswer !== undefined;

                        return (
                          <div key={qIndex} className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${qIndex * 100}ms` }}>
                            <div className="flex items-start gap-3">
                              <div className="h-7 w-7 rounded-lg bg-gray-600/20 flex items-center justify-center text-gray-400 font-bold text-xs flex-shrink-0 mt-0.5 border border-gray-600/30 shadow-sm">
                                {qIndex + 1}
                              </div>
                              {/* Question - Force LTR for German, RTL for Arabic */}
                              <div className="flex-1">
                                <p 
                                  className="font-bold text-base leading-snug"
                                  style={{ 
                                    direction: 'ltr',
                                    textAlign: 'left',
                                    unicodeBidi: 'isolate'
                                  }}
                                >
                                  {question.question}
                                </p>
                              </div>
                            </div>

                            <RadioGroup
                              value={selectedAnswer || ''}
                              onValueChange={(value) => handleAnswerChange(qIndex, value)}
                              className="grid gap-2"
                            >
                              {question.options.map((option, oIndex) => {
                                const isSelected = selectedAnswer === option;
                                const isThisCorrect = option === question.correct_answer;
                                const showAsIncorrect = hasAnswered && isSelected && !isCorrect;
                                const showAsCorrect = hasAnswered && isThisCorrect;

                                return (
                                  <div
                                    key={oIndex}
                                    className={`group relative flex items-center gap-3 p-3 rounded-xl border-2 transition-all duration-200 ${
                                      showAsCorrect
                                        ? 'bg-green-500/5 border-green-500/50 shadow-sm'
                                        : showAsIncorrect
                                          ? 'bg-red-500/5 border-red-500/50 shadow-sm'
                                          : isSelected
                                            ? 'border-yellow-500 bg-yellow-500/5'
                                            : 'hover:bg-muted/50 border-transparent bg-muted/30'
                                    }`}
                                  >
                                    <RadioGroupItem
                                      value={option}
                                      id={`q${qIndex}-o${oIndex}`}
                                      className="h-4 w-4 border-2 border-yellow-500 text-yellow-600 flex-shrink-0"
                                      disabled={hasAnswered}
                                    />
                                    <Label
                                      htmlFor={`q${qIndex}-o${oIndex}`}
                                      className={`text-sm font-medium cursor-pointer flex-1 leading-relaxed flex justify-between items-center ${
                                        showAsIncorrect ? 'text-red-600' :
                                        showAsCorrect ? 'text-green-600 font-bold' : ''
                                      }`}
                                    >
                                      <span 
                                        style={{ 
                                          direction: 'ltr',
                                          textAlign: 'left',
                                          unicodeBidi: 'isolate',
                                          display: 'inline-block',
                                          width: '100%'
                                        }}
                                      >
                                        {option}
                                      </span>
                                      {showAsCorrect && <Check className="h-4 w-4 text-green-500 animate-in zoom-in duration-300 flex-shrink-0 ml-2" />}
                                      {showAsIncorrect && <X className="h-4 w-4 text-red-500 animate-in zoom-in duration-300 flex-shrink-0 ml-2" />}
                                    </Label>
                                  </div>
                                );
                              })}
                            </RadioGroup>
                          </div>
                        );
                      })
                    ) : (
                      <div className="py-12 text-center text-muted-foreground italic">
                        لا توجد أسئلة لهذا التمرين.
                      </div>
                    )}
                  </div>

                  {selectedExercise.exercises && selectedExercise.exercises.length > 0 && (
                    <div className="p-6 bg-muted/30 border-t border-border">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">التقدم</span>
                        <span className="text-sm font-black text-yellow-600">{getAnsweredCount()}/{getTotalQuestions()}</span>
                      </div>
                      <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-yellow-400 to-yellow-500 transition-all duration-700 ease-out shadow-[0_0_10px_rgba(234,179,8,0.5)]"
                          style={{ width: `${(getAnsweredCount() / getTotalQuestions()) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}
                </Card>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ListeningTab;