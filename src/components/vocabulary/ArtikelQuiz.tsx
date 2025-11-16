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
      case 'der': return 'bg-black';
      case 'die': return 'bg-red-500';
      case 'das': return 'bg-yellow-500';
      default: return 'bg-neutral-500';
    }
  };

  const progress = quizWords.length > 0 ? ((currentIndex + 1) / quizWords.length) * 100 : 0;

  // Category selection screen
  if (!quizStarted) {
  return (
    <div className="space-y-6">
        <Card className="card-gradient">
          <CardHeader>
            <CardTitle className="text-2xl text-center">اختبار المقالات</CardTitle>
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
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">تذكير قواعد المقالات</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(artikelsData.rules).map(([artikel, data]: [string, any]) => (
                <div key={artikel} className="space-y-2">
                  <Badge className={`${getArtikelColor(artikel)} text-white w-full justify-center text-sm`}>
                    {artikel}
                  </Badge>
                  <ul className="text-xs space-y-1 text-right">
                    {data.rules.map((rule: string, index: number) => (
                      <li key={index} className="text-muted-foreground">• {rule}</li>
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
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center flex-wrap gap-2">
            <CardTitle className="text-lg sm:text-xl">اختبار المقالات - {selectedCategory}</CardTitle>
            <div className="text-xs sm:text-sm text-muted-foreground">
              التقدم: {currentIndex + 1}/{quizWords.length} ({Math.round(progress)}%) | صحيح: {correctCount} | خطأ: {incorrectCount} | متبقي: {quizWords.length - currentIndex - 1}
            </div>
          </div>
          <Progress value={progress} className="w-full bg-neutral-700 [&>div]:bg-red-500" />
        </CardHeader>
      </Card>

      {/* Quiz Card */}
      <Card className="card-gradient">
        <CardContent className="p-4 sm:p-6">
          {!showResult ? (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-xl sm:text-2xl font-bold mb-2">ما هو المقال الصحيح لكلمة:</h3>
                <div className="text-3xl sm:text-4xl font-bold text-primary mb-2">{currentWord.noun}</div>
                <div className="text-base sm:text-lg text-muted-foreground">{currentWord.arabic}</div>
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

              <div className="text-center">
                <Button
                  onClick={handleSubmit}
                  disabled={!selectedArtikel}
                  size="lg"
                  className="w-full sm:w-auto"
                >
                  تحقق من الإجابة
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="text-center">
                <div className={`inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 rounded-full mb-6 ${isCorrect ? 'bg-green-100 border-4 border-green-500' : 'bg-red-100 border-4 border-red-500'}`}>
                  <div className={`text-4xl sm:text-5xl font-bold ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                    {isCorrect ? '✓' : '✗'}
                  </div>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold mb-4">
                  {isCorrect ? 'إجابة صحيحة!' : 'إجابة خاطئة'}
                </h3>
                <div className="bg-gradient-to-r from-gray-800 to-gray-900 p-6 rounded-xl border border-gray-700 mb-4">
                  <div className="text-lg sm:text-xl mb-2">
                    <span className="font-bold text-white">{currentWord.noun}</span>
                    <span className="mx-2 text-gray-400">=</span>
                    <Badge className={`${getArtikelColor(currentWord.artikel)} text-white text-sm px-3 py-1`}>
                      {currentWord.artikel}
                    </Badge>
                  </div>
                  <div className="text-base sm:text-lg text-gray-300 font-medium">{currentWord.arabic}</div>
                </div>
                {!isCorrect && (
                  <div className="bg-red-900/20 p-4 rounded-lg border border-red-800">
                    <p className="text-sm text-red-300 mb-2 font-medium">إجابتك:</p>
                    <Badge variant="outline" className="border-red-600 text-red-300">
                      {selectedArtikel}
                    </Badge>
                  </div>
                )}
                {isCorrect && (
                  <div className="bg-yellow-900/20 p-4 rounded-lg border border-yellow-800">
                    <p className="text-sm text-yellow-300 font-medium">ممتاز! استمر في هذا المستوى</p>
                  </div>
                )}
              </div>

              <div className="text-center">
                <Button onClick={handleNext} size="lg" className="w-full sm:w-auto px-8 py-3 text-lg font-semibold bg-red-500 hover:bg-red-600 text-white shadow-lg hover:shadow-xl transition-all duration-200">
                  {currentIndex + 1 < quizWords.length ? 'الكلمة التالية' : 'إعادة الاختبار'}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Rules Reference */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">تذكير قواعد المقالات</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(artikelsData.rules).map(([artikel, data]: [string, any]) => (
              <div key={artikel} className="space-y-2">
                <Badge className={`${getArtikelColor(artikel)} text-white w-full justify-center text-sm`}>
                  {artikel}
                </Badge>
                <ul className="text-xs space-y-1 text-right">
                  {data.rules.map((rule: string, index: number) => (
                    <li key={index} className="text-muted-foreground">• {rule}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Control Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button variant="outline" onClick={handleRestart} className="w-full sm:w-auto">
          إعادة الاختبار
        </Button>
        <Button variant="outline" onClick={() => setQuizStarted(false)} className="w-full sm:w-auto">
          تغيير الفئة
        </Button>
      </div>
    </div>
  );
};
