import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import artikelsData from '@/data/vocabulars/artikels.json';

interface Word {
  noun: string;
  artikel: string;
  arabic: string;
}

interface Category {
  category: string;
  words: Word[];
}

export const ArtikelQuiz = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [currentWord, setCurrentWord] = useState<Word | null>(null);
  const [selectedArtikel, setSelectedArtikel] = useState<string>('');
  const [score, setScore] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [incorrectCount, setIncorrectCount] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [quizWords, setQuizWords] = useState<Word[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [quizStarted, setQuizStarted] = useState(false);

  const startQuiz = () => {
    if (!selectedCategory) return;

    const categoryData = artikelsData.vocabulary.find(cat => cat.category === selectedCategory);
    if (!categoryData) return;

    const shuffledWords = [...categoryData.words].sort(() => Math.random() - 0.5);
    setQuizWords(shuffledWords);
    setCurrentWord(shuffledWords[0]);
    setQuizStarted(true);
    setScore(0);
    setTotalQuestions(0);
    setCurrentIndex(0);
    setSelectedArtikel('');
    setShowResult(false);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setQuizStarted(false);
  };

  const handleArtikelSelect = (artikel: string) => {
    setSelectedArtikel(artikel);
  };

  const handleSubmit = () => {
    if (!currentWord || !selectedArtikel) return;

    const correct = selectedArtikel === currentWord.artikel;
    setIsCorrect(correct);
    setShowResult(true);
    setTotalQuestions(prev => prev + 1);

    if (correct) {
      setScore(prev => prev + 1);
      setCorrectCount(prev => prev + 1);
    } else {
      setIncorrectCount(prev => prev + 1);
    }
  };

  const handleNext = () => {
    const nextIndex = currentIndex + 1;
    if (nextIndex < quizWords.length) {
      setCurrentWord(quizWords[nextIndex]);
      setCurrentIndex(nextIndex);
    } else {
      // Quiz completed, reset
      const shuffledWords = [...quizWords].sort(() => Math.random() - 0.5);
      setQuizWords(shuffledWords);
      setCurrentWord(shuffledWords[0]);
      setCurrentIndex(0);
      setScore(0);
      setTotalQuestions(0);
      setCorrectCount(0);
      setIncorrectCount(0);
    }
    setSelectedArtikel('');
    setShowResult(false);
  };

  const handleRestart = () => {
    const shuffledWords = [...quizWords].sort(() => Math.random() - 0.5);
    setQuizWords(shuffledWords);
    setCurrentWord(shuffledWords[0]);
    setCurrentIndex(0);
    setScore(0);
    setTotalQuestions(0);
    setCorrectCount(0);
    setIncorrectCount(0);
    setSelectedArtikel('');
    setShowResult(false);
  };

  const getArtikelColor = (artikel: string) => {
    switch (artikel) {
      case 'der': return 'bg-black text-white';
      case 'die': return 'bg-red-700 text-white';
      case 'das': return 'bg-yellow-500 text-white';
      default: return 'bg-neutral-400 text-white';
    }
  };

  const progress = quizWords.length > 0 ? ((currentIndex + 1) / quizWords.length) * 100 : 0;

  // Category selection screen
  if (!quizStarted) {
  return (
    <div className="space-y-6">
        <Card className="card-gradient">
          <CardHeader>
            <CardTitle className="text-2xl text-center">اختبار أدوات التعريف</CardTitle>
            <p className="text-center text-muted-foreground">اختر الفئة التي تريد اختبارها</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <label className="text-sm font-medium">اختر الفئة:</label>
              <Select value={selectedCategory} onValueChange={handleCategoryChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="اختر فئة..." />
                </SelectTrigger>
                <SelectContent>
                  {artikelsData.vocabulary.map((category) => (
                    <SelectItem key={category.category} value={category.category}>
                      {category.category} ({category.words.length} كلمة)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="text-center">
              <Button
                onClick={startQuiz}
                disabled={!selectedCategory}
                size="lg"
                className="w-full sm:w-auto"
              >
                ابدأ الاختبار
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Rules Reference */}
        <Card className="card-gradient">
          <CardHeader className="pb-3">
            <CardTitle className="text-base sm:text-lg text-right font-bold text-white">تذكير قواعد أدوات التعريف</CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {Object.entries(artikelsData.rules).map(([artikel, data]: [string, any]) => (
                <div key={artikel} className="space-y-3 bg-neutral-800 p-4 rounded-lg">
                  <Badge className={`${getArtikelColor(artikel)} w-full justify-center text-sm py-1.5 font-bold`}>
                    {artikel}
                  </Badge>
                  <ul className="text-xs sm:text-sm space-y-2 text-right pr-2">
                    {data.rules.map((rule: string, index: number) => (
                      <li key={index} className="text-neutral-400 flex items-start">
                        <span className="ml-2 mt-1.5 flex-shrink-0 w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                        <span>{rule}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Score and Progress */}
      <Card className="card-gradient">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <CardTitle className="text-lg sm:text-xl font-bold text-white">
              اختبار أدوات التعريف - <span className="text-red-500">{selectedCategory}</span>
            </CardTitle>
            <div className="flex flex-wrap gap-3 sm:gap-4 text-xs sm:text-sm">
              <div className="bg-neutral-800 px-3 py-1.5 rounded border border-neutral-700">
                <span className="text-green-400 font-bold">{correctCount}</span> صحيح
              </div>
              <div className="bg-neutral-800 px-3 py-1.5 rounded border border-neutral-700">
                <span className="text-red-400 font-bold">{incorrectCount}</span> خطأ
              </div>
              <div className="bg-neutral-800 px-3 py-1.5 rounded border border-neutral-700">
                <span className="text-yellow-400 font-bold">{quizWords.length - currentIndex - 1}</span> متبقي
              </div>
            </div>
          </div>
          <div className="pt-3">
            <div className="flex justify-between text-sm text-neutral-400 mb-2">
              <span>التقدم: {currentIndex + 1}/{quizWords.length}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="w-full h-2 bg-neutral-700 [&>div]:bg-red-500 rounded-full" />
          </div>
        </CardHeader>
      </Card>

      {/* Quiz Card */}
      <Card className="card-gradient">
        <CardContent className="p-4 sm:p-8">
          {!showResult ? (
            <div className="space-y-8">
              <div className="text-center space-y-4">
                <h3 className="text-xl sm:text-2xl font-bold text-white">ما هي الأداة الصحيحة لكلمة:</h3>
                <div className="bg-neutral-800 p-6 rounded-lg border border-neutral-700 mx-auto max-w-md">
                  <div className="text-3xl sm:text-4xl font-bold text-red-600 mb-3">{currentWord?.noun}</div>
                  <div className="text-lg sm:text-xl text-neutral-400 font-medium">{currentWord?.arabic}</div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                {['der', 'die', 'das'].map((artikel) => (
                  <Button
                    key={artikel}
                    variant={selectedArtikel === artikel ? "default" : "outline"}
                    className={`h-12 sm:h-16 text-lg sm:text-xl font-bold ${selectedArtikel === artikel ? getArtikelColor(artikel) : ''}`}
                    onClick={() => handleArtikelSelect(artikel)}
                  >
                    {artikel}
                  </Button>
                ))}
              </div>

              <div className="text-center pt-4">
                <Button
                  onClick={handleSubmit}
                  disabled={!selectedArtikel}
                  size="lg"
                  className="w-full sm:w-64 h-12 text-lg font-semibold bg-red-500 hover:bg-red-600 text-white border-0 disabled:bg-neutral-700 disabled:text-neutral-500"
                >
                  تحقق من الإجابة
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="text-center">
                {/* Result Icon */}
                <div className={`inline-flex items-center justify-center w-24 h-24 sm:w-28 sm:h-28 rounded-full mb-6 border-4 ${
                  isCorrect ? 'border-green-500 bg-green-900/20' : 'border-red-500 bg-red-900/20'
                }`}>
                  <div className={`text-5xl sm:text-6xl font-bold ${
                    isCorrect ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {isCorrect ? '✓' : '✗'}
                  </div>
                </div>
                
                <h3 className={`text-2xl sm:text-3xl font-bold mb-6 ${
                  isCorrect ? 'text-green-400' : 'text-red-400'
                }`}>
                  {isCorrect ? 'إجابة صحيحة!' : 'إجابة خاطئة'}
                </h3>
                
                {/* Word Display - Artikel + Noun together */}
                <div className="bg-neutral-800 p-6 sm:p-8 rounded-lg border border-neutral-700 mb-6 max-w-md mx-auto">
                  <div className="text-xl sm:text-2xl mb-3 flex items-center justify-center gap-3 flex-wrap">
                    <span className={`order-1 text-md rounded-2xl px-4 py-1 font-bold ${getArtikelColor(currentWord?.artikel || '')}`}>
                      {currentWord?.artikel}
                    </span>
                    <span className="font-bold text-white text-2xl sm:text-3xl">{currentWord?.noun}</span>
                  </div>
                  <div className="text-lg sm:text-xl text-neutral-400 font-medium text-center">{currentWord?.arabic}</div>
                </div>
                
                {/* User Answer Feedback */}
                {!isCorrect && (
                  <div className="bg-red-900/20 p-5 rounded-lg border border-red-800 max-w-md mx-auto">
                    <p className="text-sm text-red-400 mb-3 font-medium text-right">إجابتك:</p>
                    <div className="flex items-center justify-center gap-3 flex-wrap ltr">
                      <span className={`order-1 text-md rounded-2xl px-4 py-1 font-bold ${getArtikelColor(selectedArtikel)}`}>
                        {selectedArtikel}
                      </span>
                      <span className="font-bold text-red-400 text-xl">{currentWord?.noun}</span>
                    </div>
                  </div>
                )}
                
                {/* Encouragement Message */}
                {isCorrect && (
                  <div className="bg-green-900/20 p-5 rounded-lg border border-green-800 max-w-md mx-auto">
                    <p className="text-lg text-green-400 font-bold">ممتاز! استمر في هذا المستوى</p>
                  </div>
                )}
              </div>

              <div className="text-center pt-4">
                <Button 
                  onClick={handleNext} 
                  size="lg" 
                  className="w-full sm:w-64 h-12 text-lg font-semibold bg-green-500 hover:bg-green-600 text-white border-0"
                >
                  {currentIndex + 1 < quizWords.length ? 'الكلمة التالية' : 'إعادة الاختبار'}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Rules Reference */}
      <Card className="card-gradient">
        <CardHeader className="pb-3">
          <CardTitle className="text-base sm:text-lg text-right font-bold text-white">تذكير قواعد أدوات التعريف</CardTitle>
        </CardHeader>
        <CardContent className="pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {Object.entries(artikelsData.rules).map(([artikel, data]: [string, any]) => (
              <div key={artikel} className="space-y-3 bg-neutral-800 p-4 rounded-lg">
                <Badge className={`${getArtikelColor(artikel)} w-full justify-center text-sm py-1.5 font-bold`}>
                  {artikel}
                </Badge>
                <ul className="text-xs sm:text-sm space-y-2 text-right pr-2">
                  {data.rules.map((rule: string, index: number) => (
                    <li key={index} className="text-neutral-400 flex items-start">
                      <span className="ml-2 mt-1.5 flex-shrink-0 w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                      <span>{rule}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Control Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center pb-8">
        <Button 
          variant="outline" 
          onClick={handleRestart} 
          className="w-full sm:w-auto h-12 px-6 text-base border-2 border-neutral-600 text-white hover:text-white hover:border-red-500 hover:bg-red-800"
        >
          إعادة الاختبار
        </Button>
        <Button 
          variant="outline" 
          onClick={() => setQuizStarted(false)} 
          className="w-full sm:w-auto h-12 px-6 text-base border-2 border-neutral-600 text-white hover:text-white hover:border-yellow-500 hover:bg-yellow-800"
        >
          تغيير الفئة
        </Button>
      </div>
    </div>
  );
};
