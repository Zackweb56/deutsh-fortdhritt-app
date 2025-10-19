import { useState, useEffect, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { RotateCcw, CheckCircle, XCircle, Volume2, VolumeX, Plus } from 'lucide-react';
import { toast } from 'sonner';
import vocabularsData from '@/data/vocabulars/vocabulars.json';
import { playTTS } from '@/utils/tts';
import { useApp } from '@/contexts/AppContext';

interface VocabularyItem {
  id: number;
  arabic: string;
  german: string;
  pronunciation_ar: string;
  notes: string;
}

interface Level {
  level: string;
  vocab: VocabularyItem[];
}

interface VocabularyLearningProps {
  onScoreUpdate?: (correct: number, total: number) => void;
}

export const VocabularyLearning = ({ onScoreUpdate }: VocabularyLearningProps) => {
  const { addVocabulary } = useApp();
  const [selectedLevel, setSelectedLevel] = useState<string>('A1');
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [userGuess, setUserGuess] = useState('');
  const [isFlipped, setIsFlipped] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [shuffledCards, setShuffledCards] = useState<VocabularyItem[]>([]);

  const levels = vocabularsData.levels as Level[];

  const currentLevel = useMemo(() => 
    levels.find(level => level.level === selectedLevel), 
    [levels, selectedLevel]
  );

  const currentCard = shuffledCards[currentCardIndex];

  // Shuffle cards when level changes
  useEffect(() => {
    if (currentLevel) {
      const shuffled = [...currentLevel.vocab].sort(() => Math.random() - 0.5);
      setShuffledCards(shuffled);
      setCurrentCardIndex(0);
      setUserGuess('');
      setIsFlipped(false);
      setIsCorrect(null);
      setScore({ correct: 0, total: 0 });
    }
  }, [selectedLevel, currentLevel]);

  const handleGuess = () => {
    if (!currentCard || !userGuess.trim()) {
      toast.error('يرجى إدخال تخمينك');
      return;
    }

    const guess = userGuess.trim().toLowerCase();
    const correctAnswer = currentCard.german.toLowerCase();
    
    const isAnswerCorrect = guess === correctAnswer;
    setIsCorrect(isAnswerCorrect);
    setIsFlipped(true);

    const newScore = {
      correct: score.correct + (isAnswerCorrect ? 1 : 0),
      total: score.total + 1
    };
    setScore(newScore);
    onScoreUpdate?.(newScore.correct, newScore.total);

    if (isAnswerCorrect) {
      toast.success('إجابة صحيحة! 🎉');
    } else {
      toast.error(`إجابة خاطئة. الإجابة الصحيحة: ${currentCard.german}`);
    }
  };

  const handleNextCard = () => {
    if (currentCardIndex < shuffledCards.length - 1) {
      setCurrentCardIndex(prev => prev + 1);
      setUserGuess('');
      setIsFlipped(false);
      setIsCorrect(null);
    } else {
      toast.success('انتهيت من جميع البطاقات! 🎊');
    }
  };

  const handleRestart = () => {
    if (currentLevel) {
      const shuffled = [...currentLevel.vocab].sort(() => Math.random() - 0.5);
      setShuffledCards(shuffled);
      setCurrentCardIndex(0);
      setUserGuess('');
      setIsFlipped(false);
      setIsCorrect(null);
      setScore({ correct: 0, total: 0 });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isFlipped) {
      handleGuess();
    } else if (e.key === 'Enter' && isFlipped) {
      handleNextCard();
    }
  };

  const playAudio = async () => {
    if (!currentCard) return;
    
    const success = await playTTS(currentCard.german, {
      onStart: () => setIsAudioPlaying(true),
      onEnd: () => setIsAudioPlaying(false),
      onError: () => setIsAudioPlaying(false)
    });
    
    if (!success) {
      setIsAudioPlaying(false);
    }
  };

  const handleAddToVocabulary = () => {
    if (!currentCard) return;
    
    addVocabulary({
      german: currentCard.german,
      pronunciation: currentCard.pronunciation_ar,
      translation: currentCard.arabic,
    });
    
    toast.success('تمت إضافة المفردة إلى قائمة المفردات', {
      description: `${currentCard.arabic} - ${currentCard.german}`
    });
  };

  if (!currentLevel || shuffledCards.length === 0) {
    return (
      <Card className="card-gradient p-6">
        <div className="text-center text-muted-foreground">
          <p>لا توجد مفردات متاحة للمستوى المحدد</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Level Selection and Score */}
      <Card className="card-gradient p-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <Select value={selectedLevel} onValueChange={setSelectedLevel}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {levels.map(level => (
                  <SelectItem key={`level-${level.level}`} value={level.level}>
                    {level.level}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Badge variant="secondary" className="text-sm">
              {currentCardIndex + 1} / {shuffledCards.length}
            </Badge>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-sm text-muted-foreground">
              النتيجة: {score.correct} / {score.total}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRestart}
              className="gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              إعادة
            </Button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-muted rounded-full h-2 mb-6">
          <div 
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentCardIndex + 1) / shuffledCards.length) * 100}%` }}
          />
        </div>
      </Card>

      {/* Learning Card */}
      <Card className="card-gradient p-8 min-h-[400px] flex items-center justify-center">
        <div className="w-full max-w-md">
          {/* Card Container */}
          <div className="relative w-full h-64 perspective-1000">
            <div 
              className={`relative w-full h-full transition-transform duration-700 transform-style-preserve-3d ${
                isFlipped ? 'rotate-y-180' : ''
              }`}
            >
              {/* Front of Card (Arabic) */}
              <div className="absolute inset-0 w-full h-full backface-hidden bg-card rounded-lg border-2 border-border flex flex-col items-center justify-center p-6">
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-card-foreground mb-4">
                    {currentCard?.arabic}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    ما هي الكلمة الألمانية؟
                  </p>
                </div>
              </div>

              {/* Back of Card (German + Details) */}
              <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 bg-card rounded-lg border-2 border-border flex flex-col items-center justify-center p-6">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <h3 className="text-2xl font-bold text-card-foreground">
                      {currentCard?.german}
                    </h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={playAudio}
                      disabled={isAudioPlaying}
                      className="p-1 text-muted-foreground hover:text-foreground"
                    >
                      {isAudioPlaying ? (
                        <VolumeX className="h-4 w-4" />
                      ) : (
                        <Volume2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  
                  <p className="text-lg text-muted-foreground mb-2">
                    {currentCard?.arabic}
                  </p>
                  
                  {currentCard?.pronunciation_ar && (
                    <p className="text-sm text-muted-foreground mb-4">
                      {currentCard.pronunciation_ar}
                    </p>
                  )}
                  
                  {currentCard?.notes && (
                    <p className="text-sm text-muted-foreground bg-muted p-2 rounded">
                      {currentCard.notes}
                    </p>
                  )}

                  {/* Result Indicator */}
                  {isCorrect !== null && (
                    <div className="flex items-center justify-center gap-2 mt-4">
                      {isCorrect ? (
                        <CheckCircle className="h-6 w-6 text-green-500" />
                      ) : (
                        <XCircle className="h-6 w-6 text-destructive" />
                      )}
                      <span className={`text-sm font-medium ${
                        isCorrect ? 'text-green-500' : 'text-destructive'
                      }`}>
                        {isCorrect ? 'صحيح!' : 'خطأ'}
                      </span>
                    </div>
                  )}

                  {/* Add to Vocabulary Button - Only show when card is flipped */}
                  {isFlipped && (
                    <div className="mt-4">
                      <Button
                        onClick={handleAddToVocabulary}
                        variant="outline"
                        size="sm"
                        className="gap-2 text-xs"
                      >
                        <Plus className="h-3 w-3" />
                        إضافة إلى قائمة المفردات
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Input and Controls */}
          <div className="mt-8 space-y-4">
            {!isFlipped ? (
              <div className="space-y-4">
                <Input
                  value={userGuess}
                  onChange={(e) => setUserGuess(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="اكتب تخمينك هنا..."
                  className="text-center text-lg"
                  dir="ltr"
                />
                <Button 
                  onClick={handleGuess}
                  className="w-full bg-primary hover:bg-primary/90"
                  size="lg"
                >
                  تحقق من الإجابة
                </Button>
              </div>
            ) : (
              <Button 
                onClick={handleNextCard}
                className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
                size="lg"
              >
                {currentCardIndex < shuffledCards.length - 1 ? 'البطاقة التالية' : 'انتهاء'}
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};
