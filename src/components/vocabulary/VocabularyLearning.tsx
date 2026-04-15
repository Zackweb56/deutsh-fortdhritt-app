import { useState, useEffect, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { RotateCcw, CheckCircle, XCircle, Volume2, VolumeX, Plus, ArrowLeft, BookOpen } from 'lucide-react';
import { toast } from 'sonner';
import vocabularsData from '@/data/vocabulars/vocabulars.json';
import { playTTS } from '@/utils/tts';
import { useApp } from '@/contexts/AppContext';
import { isLimitedAccess } from '@/lib/access';
import LockOverlay from '@/components/ui/lock-overlay';

interface VocabularyItem {
  id: number;
  arabic: string;
  german: string;
  pronunciation_ar: string;
  notes: string;
}

interface Category {
  id: number;
  name_arabic: string;
  name_german: string;
  icon: string;
  vocab: VocabularyItem[];
}

interface Level {
  level: string;
  categories: Category[];
}

interface VocabularyLearningProps {
  onScoreUpdate?: (correct: number, total: number) => void;
}

export const VocabularyLearning = ({ onScoreUpdate }: VocabularyLearningProps) => {
  const { addVocabulary } = useApp();
  const [viewMode, setViewMode] = useState<'levels' | 'categories' | 'cards'>('levels');
  const [selectedLevel, setSelectedLevel] = useState<string>('A1');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
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

  // Shuffle cards when category changes
  useEffect(() => {
    if (selectedCategory) {
      const shuffled = [...selectedCategory.vocab].sort(() => Math.random() - 0.5);
      setShuffledCards(shuffled);
      setCurrentCardIndex(0);
      setUserGuess('');
      setIsFlipped(false);
      setIsCorrect(null);
      setScore({ correct: 0, total: 0 });
    }
  }, [selectedCategory]);

  // Handle level selection
  const handleLevelSelect = (level: string) => {
    setSelectedLevel(level);
    setViewMode('categories');
  };

  // Handle category selection
  const handleCategorySelect = (category: Category) => {
    setSelectedCategory(category);
    setViewMode('cards');
  };

  // Handle back navigation
  const handleBack = () => {
    if (viewMode === 'cards') {
      setViewMode('categories');
      setSelectedCategory(null);
    } else if (viewMode === 'categories') {
      setViewMode('levels');
    }
  };

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
    if (selectedCategory) {
      const shuffled = [...selectedCategory.vocab].sort(() => Math.random() - 0.5);
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

  // Levels View
  if (viewMode === 'levels') {
    return (
      <div className="space-y-6">
        <Card className="card-gradient p-6">
          <div className="flex items-center gap-3 mb-6">
            <BookOpen className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold">اختر مستوى التعلم</h2>
          </div>
          <div className="overflow-x-auto">
            <div className="flex flex-nowrap md:flex-wrap gap-4 min-w-max md:min-w-0">
            {levels.map((level) => (
              <Button
                key={level.level}
                onClick={() => handleLevelSelect(level.level)}
                className="h-20 min-w-[96px] text-lg font-bold bg-primary hover:bg-primary/90 text-primary-foreground"
                variant="default"
              >
                {level.level}
              </Button>
            ))}
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // Categories View
  if (viewMode === 'categories') {
    if (!currentLevel) {
      return (
        <Card className="card-gradient p-6">
          <div className="text-center text-muted-foreground">
            <p>لا توجد فئات متاحة للمستوى المحدد</p>
          </div>
        </Card>
      );
    }

    const limited = isLimitedAccess();

    return (
      <div className="space-y-6">
        <Card className="card-gradient p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold">مستوى {selectedLevel} - اختر الفئة</h2>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="gap-2 self-start sm:self-auto"
            >
              <ArrowLeft className="h-4 w-4" />
              العودة
            </Button>
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            {currentLevel.categories.map((category) => {
              const shouldLock = limited && category.id > 2;
              return (
                <LockOverlay key={category.id} isLocked={shouldLock} message="فئات محجوبة — تواصل عبر واتساب لفتح الوصول الكامل">
                  <Card
                    className="overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105 w-fit max-w-xs"
                    onClick={() => handleCategorySelect(category)}
                  >
                    {/* Card Header - Image Based Size */}
                    <div className="bg-primary/10 relative flex items-center justify-center">
                      <img
                        src={category.icon}
                        alt={category.name_arabic}
                        className="w-auto h-48 object-contain"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                      <div className="absolute inset-0 w-full h-full bg-primary/10 flex items-center justify-center hidden">
                        <BookOpen className="w-16 h-16 text-primary" />
                      </div>
                    </div>

                    {/* Card Body - Category Information */}
                    <div className="p-4 text-center space-y-2 min-w-[200px]">
                      <h3 className="font-bold text-sm leading-tight">{category.name_arabic}</h3>
                      <p className="text-xs text-muted-foreground leading-tight">{category.name_german}</p>
                      <Badge variant="secondary" className="text-xs">
                        {category.vocab.length} مفردة
                      </Badge>
                    </div>
                  </Card>
                </LockOverlay>
              );
            })}
          </div>
        </Card>
      </div>
    );
  }

  // Cards View
  if (!selectedCategory || shuffledCards.length === 0) {
    return (
      <Card className="card-gradient p-6">
        <div className="text-center text-muted-foreground">
          <p>لا توجد مفردات متاحة للفئة المحددة</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Back Button and Score */}
      <Card className="card-gradient p-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              العودة
            </Button>
            <div>
              <h2 className="text-lg font-bold">{selectedCategory.name_arabic}</h2>
              <p className="text-sm text-muted-foreground">{selectedCategory.name_german}</p>
            </div>
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
                  <h3
                    dir="rtl"
                    className="text-2xl font-bold text-card-foreground mb-4 text-right"
                    style={{ unicodeBidi: "bidi-override" }}
                  >
                    {currentCard?.arabic}
                  </h3>
                  <p className="text-sm text-muted-foreground" dir="rtl" 
                    style={{ unicodeBidi: "bidi-override" }}
                  >
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
