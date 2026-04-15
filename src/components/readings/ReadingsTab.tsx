import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  BookOpen, 
  Search, 
  GraduationCap,
  ArrowLeft,
  FileText,
  AlertCircle,
  Check,
  X,
  HelpCircle
} from 'lucide-react';
import a1Data from '@/data/readings/a1.json';
import a2Data from '@/data/readings/a2.json';
import b1Data from '@/data/readings/b1.json';
import b2Data from '@/data/readings/b2.json';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { isLimitedAccess } from '@/lib/access';
import LockOverlay from '@/components/ui/lock-overlay';

interface Question {
  question: string;
  options: string[];
  correct_answer: string;
}

interface ReadingText {
  de_text: string;
  title?: string;
  questions: Question[];
}

type Level = 'A1' | 'A2' | 'B1' | 'B2';

const readingsData: Record<Level, ReadingText[]> = {
  A1: a1Data as ReadingText[],
  A2: a2Data as ReadingText[],
  B1: b1Data as ReadingText[],
  B2: b2Data as ReadingText[],
};

// Helper function to extract title from text
const extractTitle = (text: string): string => {
  // Try to get first sentence or first 50 characters
  const firstSentence = text.split(/[.!?]/)[0].trim();
  if (firstSentence.length > 0 && firstSentence.length <= 60) {
    return firstSentence;
  }
  // Otherwise, take first 50 characters
  return text.substring(0, 50).trim() + (text.length > 50 ? '...' : '');
};

const ReadingsTab = () => {
  const [selectedLevel, setSelectedLevel] = useState<Level>('A1');
  const [selectedText, setSelectedText] = useState<ReadingText | null>(null);
  const [selectedTextIndex, setSelectedTextIndex] = useState<number>(-1);
  const [searchTerm, setSearchTerm] = useState('');
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const limited = isLimitedAccess();

  const currentLevelData = readingsData[selectedLevel] || [];
  const hasData = currentLevelData.length > 0;

  // Filter texts based on search term
  const filteredTexts = currentLevelData.filter(text => {
    const title = text.title || extractTitle(text.de_text);
    return title.toLowerCase().includes(searchTerm.toLowerCase()) ||
           text.de_text.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleTextSelect = (text: ReadingText, index: number) => {
    setSelectedText(text);
    setSelectedTextIndex(index);
    setAnswers({}); // Reset answers when selecting new text
  };

  const handleAnswerChange = (questionIndex: number, answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionIndex]: answer
    }));
  };

  const getAnsweredCount = () => {
    if (!selectedText) return 0;
    return Object.keys(answers).length;
  };

  const getTotalQuestions = () => {
    return selectedText?.questions.length || 0;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6 bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">القراءة</h2>
              <p className="text-muted-foreground">
                {hasData ? `${currentLevelData.length} نص` : 'لا توجد نصوص'} • المستوى {selectedLevel}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Level Selection */}
      <Card className="p-4">
        <div className="flex flex-wrap gap-2">
          {(['A1', 'A2', 'B1', 'B2'] as Level[]).map(level => {
            const levelData = readingsData[level] || [];
            const levelCount = levelData.length;
            return (
              <Button
                key={level}
                variant={selectedLevel === level ? "default" : "outline"}
                onClick={() => {
                  setSelectedLevel(level);
                  setSelectedText(null);
                  setSelectedTextIndex(-1);
                  setAnswers({});
                }}
                className="flex items-center gap-2"
              >
                <GraduationCap className="h-4 w-4" />
                {level}
                <Badge variant="secondary" className="ml-1">
                  {levelCount}
                </Badge>
              </Button>
            );
          })}
        </div>
      </Card>

      {/* Alert if no data */}
      {!hasData && (
        <Alert className="border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20">
          <AlertCircle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800 dark:text-yellow-200">
            لا توجد نصوص متاحة لهذا المستوى حالياً
          </AlertDescription>
        </Alert>
      )}

      {/* Search */}
      {hasData && (
        <Card className="p-4">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="ابحث في النصوص..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10"
            />
          </div>
        </Card>
      )}

      {!selectedText ? (
        <>
          {/* Texts List View */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 lg:gap-4">
            {filteredTexts.map((text, index) => {
              const title = text.title || extractTitle(text.de_text);
              const originalIndex = currentLevelData.indexOf(text);
              const shouldLock = limited && originalIndex >= 2;
              return (
                <LockOverlay
                  key={index}
                  isLocked={shouldLock}
                  message="تمارين القراءة المحجوبة متاحة في الخطة المدفوعة."
                >
                  <Card
                    className="p-3 lg:p-4 cursor-pointer transition-all duration-200 hover:shadow-md hover:border-primary/50 active:scale-[0.98]"
                    onClick={() => {
                      if (shouldLock) return;
                      handleTextSelect(text, index);
                    }}
                  >
                    <div className="flex items-start gap-2 lg:gap-3">
                      <div className="h-8 w-8 lg:h-10 lg:w-10 rounded-full bg-primary/10 flex items-center justify-center text-xs lg:text-sm font-bold text-primary flex-shrink-0">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold mb-1 lg:mb-2 text-base lg:text-lg line-clamp-2">{title}</h3>
                        <p className="text-xs lg:text-sm text-muted-foreground line-clamp-2 lg:line-clamp-3 mb-2">
                          {text.de_text.substring(0, 120)}...
                        </p>
                        <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                          <span className="inline-flex items-center gap-2">
                            <FileText className="h-3 w-3" />
                            <span>{text.questions.length} سؤال</span>
                          </span>
                          <Badge variant={shouldLock ? 'outline' : 'secondary'}>
                            {shouldLock ? 'مدفوع' : 'مجاني'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </Card>
                </LockOverlay>
              );
            })}
          </div>

          {/* Subscription Alert */}
          {hasData && filteredTexts.length > 0 && (
            <Card className="mt-6 bg-gradient-to-br from-yellow-500/10 via-yellow-500/5 to-transparent dark:from-yellow-500/20 dark:via-yellow-500/10 dark:to-transparent border border-yellow-500/30 dark:border-yellow-500/40">
              <div className="p-4 lg:p-5">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-full bg-yellow-500/20 dark:bg-yellow-500/30 flex items-center justify-center flex-shrink-0">
                    <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-500" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-base lg:text-lg mb-1.5 text-foreground">
                      المزيد من النصوص قادمة قريباً
                    </h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      اشترك في التطبيق لتكون أول من يحصل على النصوص الجديدة والمميزة
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          )}
        </>
      ) : (
        /* Reading Detail View */
        <div className="space-y-3 lg:space-y-4">
          {/* Back Button */}
          <Button
            variant="outline"
            onClick={() => {
              setSelectedText(null);
              setSelectedTextIndex(-1);
              setAnswers({});
            }}
            className="mb-2 lg:mb-4 text-sm"
          >
            <ArrowLeft className="h-4 w-4 ml-2" />
            جميع النصوص
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
            {/* Left Column - Text */}
            <Card className="p-4 lg:p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg lg:text-xl font-bold" dir="ltr" style={{ direction: 'ltr', textAlign: 'left' }}>
                    {selectedText.title || extractTitle(selectedText.de_text)}
                  </h3>
                </div>
                <div className="bg-muted/50 dark:bg-muted/30 rounded-xl p-4 lg:p-6 overflow-hidden">
                  <p
                    className="text-sm lg:text-base leading-loose whitespace-pre-line text-foreground font-medium text-left"
                    dir="ltr"
                    style={{
                      direction: 'ltr',
                      unicodeBidi: 'bidi-override',
                      textAlign: 'left',
                    }}
                  >
                    {selectedText.de_text}
                  </p>
                </div>
              </div>
            </Card>

            {/* Right Column - Questions */}
            <Card className="p-4 lg:p-6">
              <div className="space-y-4 lg:space-y-6">
                <div>
                  <h3 className="text-lg lg:text-xl font-bold mb-2">هل فهمت النص؟</h3>
                  <p className="text-xs lg:text-sm text-muted-foreground mb-4">
                    يرجى الإجابة على الأسئلة التالية:
                  </p>
                </div>

                <div className="space-y-4 lg:space-y-6 overflow-hidden">
                  {selectedText.questions.map((question, qIndex) => {
                    const selectedAnswer = answers[qIndex];
                    const isCorrect = selectedAnswer === question.correct_answer;
                    const hasAnswered = selectedAnswer !== undefined;
                    
                    return (
                      <div key={qIndex} className="space-y-3 pb-4 border-b last:border-0">
                        <div className="bg-black dark:bg-black rounded-lg p-3">
                          <div className="flex items-start gap-2" dir="rtl">
                            <HelpCircle className="h-4 w-4 text-white flex-shrink-0 mt-0.5" />
                            <span className="text-white font-bold text-xs lg:text-sm whitespace-nowrap">السؤال {qIndex + 1}:</span>
                            <p className="text-xs lg:text-sm font-medium flex-1 text-white" dir="ltr" style={{ direction: 'ltr', textAlign: 'left' }}>
                              {question.question}
                            </p>
                          </div>
                        </div>
                        <RadioGroup
                          value={selectedAnswer || ''}
                          onValueChange={(value) => handleAnswerChange(qIndex, value)}
                        >
                          <div className="space-y-2" dir="ltr">
                            {question.options.map((option, oIndex) => {
                              const isSelected = selectedAnswer === option;
                              const isThisCorrect = option === question.correct_answer;
                              const showAsIncorrect = hasAnswered && isSelected && !isCorrect;
                              const showAsCorrect = hasAnswered && isThisCorrect;
                              
                              return (
                                <div 
                                  key={oIndex} 
                                  className={`flex items-center gap-2 p-2 rounded-lg transition-colors ${
                                    showAsCorrect 
                                      ? 'bg-green-500/20 border border-green-500/50' 
                                      : showAsIncorrect 
                                      ? 'bg-red-500/20 border border-red-500/50' 
                                      : 'hover:bg-muted/50'
                                  }`}
                                >
                                  <RadioGroupItem 
                                    value={option} 
                                    id={`q${qIndex}-o${oIndex}`} 
                                    className="flex-shrink-0 border-yellow-500 text-yellow-500 data-[state=checked]:bg-yellow-500 data-[state=checked]:border-yellow-500"
                                    disabled={hasAnswered}
                                  />
                                  <Label
                                    htmlFor={`q${qIndex}-o${oIndex}`}
                                    className={`text-xs lg:text-sm cursor-pointer flex-1 leading-relaxed flex items-center gap-2 ${
                                      showAsIncorrect ? 'line-through text-muted-foreground' : ''
                                    }`}
                                    dir="ltr"
                                    style={{ direction: 'ltr', textAlign: 'left' }}
                                  >
                                    <span>{String.fromCharCode(97 + oIndex)}) {option}</span>
                                    {showAsCorrect && (
                                      <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                                    )}
                                    {showAsIncorrect && (
                                      <X className="h-4 w-4 text-red-500 flex-shrink-0" />
                                    )}
                                  </Label>
                                </div>
                              );
                            })}
                          </div>
                        </RadioGroup>
                      </div>
                    );
                  })}
                </div>

                {/* Progress Footer */}
                <div className="pt-4 border-t">
                  <Alert className="bg-primary/10 border-primary/20">
                    <AlertCircle className="h-4 w-4 text-primary" />
                    <AlertDescription className="text-xs lg:text-sm">
                      لقد أجبت على {getAnsweredCount()} من أصل {getTotalQuestions()} أسئلة
                    </AlertDescription>
                  </Alert>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Empty State */}
      {hasData && filteredTexts.length === 0 && (
        <Card className="p-8 text-center">
          <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">لا توجد نصوص</h3>
          <p className="text-muted-foreground">
            لم يتم العثور على نصوص تطابق البحث "{searchTerm}"
          </p>
        </Card>
      )}
    </div>
  );
};

export default ReadingsTab;

