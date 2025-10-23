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
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  const levels = Object.keys(listeningData) as Array<keyof typeof listeningData>;
  const currentLevelData = listeningData[selectedLevel] as LevelData;
  const limited = isLimitedAccess();

  // Filter exercises based on search term
  const filteredExercises = currentLevelData.exercises.filter(exercise =>
    exercise.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    exercise.german.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Audio event handlers
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleDurationChange = () => setDuration(audio.duration);
    const handleEnded = () => setIsPlaying(false);
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
  }, [selectedExercise]);

  // Audio controls
  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    const progressBar = progressRef.current;
    if (!audio || !progressBar) return;

    const rect = progressBar.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    audio.currentTime = percentage * duration;
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
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
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
      <Card className="p-4">
        <div className="flex flex-wrap gap-2">
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
                // Find the original index in the level's exercises to determine locking
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
                    onLoadStart={() => {
                      console.log('Audio loading started:', selectedExercise.audio_url);
                    }}
                    onCanPlay={() => {
                      console.log('Audio can play:', selectedExercise.audio_url);
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

                  {/* All Controls in Glass Container */}
                  <div className="backdrop-blur-lg bg-black/20 border border-white/10 rounded-2xl p-4 shadow-xl">
                    <div className="flex flex-col items-center gap-4">
                      {/* Play/Pause Button */}
                      <Button
                        size="lg"
                        onClick={togglePlayPause}
                        className="h-14 w-14 rounded-full backdrop-blur-sm bg-white/20 hover:bg-white/30 border border-white/30 shadow-lg transition-all duration-200"
                      >
                        {isPlaying ? (
                          <Pause className="h-6 w-6" />
                        ) : (
                          <Play className="h-6 w-6" />
                        )}
                      </Button>

                      {/* Additional Controls */}
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
                              {isMuted ? (
                                <VolumeX className="h-4 w-4" />
                              ) : (
                                <Volume2 className="h-4 w-4" />
                              )}
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
                                  className={`h-9 w-12 text-xs rounded-full transition-all duration-200 ${
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

                        {/* Caption Toggle */}
                        <Button
                          variant={showCaptions ? "default" : "outline"}
                          size="sm"
                          onClick={() => setShowCaptions(!showCaptions)}
                          className={`rounded-full px-4 py-2 transition-all duration-200 ${
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

                {/* German Text */}
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2 text-primary">النص الألماني</h4>
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <p className="text-sm leading-relaxed text-left">{selectedExercise.german}</p>
                    </div>
                  </div>

                  {/* Arabic Translation (Captions) */}
                  {showCaptions && (
                    <div>
                      <h4 className="font-semibold mb-2 text-secondary">الترجمة العربية</h4>
                      <div className="p-4 bg-secondary/10 rounded-lg border border-secondary/20">
                        <p className="text-sm leading-relaxed text-right">{selectedExercise.arabic}</p>
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
              <p className="text-muted-foreground">
                اختر تمرين من القائمة لبدء الاستماع
              </p>
            </Card>
          )}
        </div>
      </div>

      {/* Empty State */}
      {filteredExercises.length === 0 && (
        <Card className="p-8 text-center">
          <Headphones className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">لا توجد تمارين</h3>
          <p className="text-muted-foreground">
            لم يتم العثور على تمارين تطابق البحث "{searchTerm}"
          </p>
        </Card>
      )}
    </div>
  );
};

export default ListeningTab;
