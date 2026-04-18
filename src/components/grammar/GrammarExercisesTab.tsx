import { useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Check, HelpCircle, PenTool, Search, X, AlertCircle, FileText } from 'lucide-react';
import grammarRaw from '@/data/grammar/grammar_tab_exercises.json';

interface GrammarQuestion {
  question: string;
  choices: string[];
  correct: string;
  explanation_ar?: string;
}

interface GrammarTopic {
  grammar_topic: string;
  questions: GrammarQuestion[];
}

const grammarData = grammarRaw as GrammarTopic[];

const normalizeTopic = (topic: GrammarTopic): GrammarTopic => {
  const fixedQuestions = (topic.questions || []).map((q) => {
    const uniqueChoices = Array.from(new Set((q.choices || []).map((c) => c.trim()))).filter(Boolean);
    const withCorrect = uniqueChoices.includes(q.correct?.trim?.() || '') ? uniqueChoices : [q.correct, ...uniqueChoices].filter(Boolean);
    const fourChoices = withCorrect.slice(0, 4);

    return {
      ...q,
      choices: fourChoices,
      correct: (q.correct || '').trim(),
      explanation_ar: q.explanation_ar?.trim() || 'اختر الإجابة الصحيحة بناءً على القاعدة.',
    };
  });

  return { ...topic, questions: fixedQuestions };
};

export const GrammarExercisesTab = () => {
  const topics = useMemo(() => grammarData.map(normalizeTopic), []);

  const [selectedTopic, setSelectedTopic] = useState<GrammarTopic | null>(null);
  const [selectedTopicIndex, setSelectedTopicIndex] = useState<number>(-1);
  const [searchTerm, setSearchTerm] = useState('');
  const [answers, setAnswers] = useState<Record<number, string>>({});

  const filteredTopics = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return topics;
    return topics.filter((t) => {
      const hay = [t.grammar_topic, ...(t.questions || []).map((qq) => qq.question)].join(' ').toLowerCase();
      return hay.includes(q);
    });
  }, [topics, searchTerm]);

  const answeredCount = useMemo(() => Object.keys(answers).length, [answers]);
  const totalQuestions = selectedTopic?.questions.length || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6 bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <PenTool className="h-6 w-6 text-white" />
            </div>
            <div dir="rtl">
              <h2 className="text-2xl font-bold">تمارين القواعد</h2>
              <p className="text-muted-foreground">
                {topics.length} درس • اختر درسًا وابدأ بالإجابة
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Search */}
      <Card className="p-4">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="ابحث في الدروس أو الأسئلة..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pr-10"
          />
        </div>
      </Card>

      {topics.length === 0 && (
        <Alert className="border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20">
          <AlertCircle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800 dark:text-yellow-200">
            لا توجد تمارين قواعد متاحة حالياً
          </AlertDescription>
        </Alert>
      )}

      {!selectedTopic ? (
        <>
          {/* Topics List View */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 lg:gap-4">
            {filteredTopics.map((topic, idx) => {
              const originalIndex = topics.indexOf(topic);
              return (
                <Card
                  key={topic.grammar_topic}
                  className="p-3 lg:p-4 cursor-pointer transition-all duration-200 hover:shadow-md hover:border-primary/50 active:scale-[0.98]"
                  onClick={() => {
                    setSelectedTopic(topic);
                    setSelectedTopicIndex(originalIndex);
                    setAnswers({});
                  }}
                >
                  <div className="flex items-start gap-2 lg:gap-3">
                    <div className="h-8 w-8 lg:h-10 lg:w-10 rounded-full bg-primary/10 flex items-center justify-center text-xs lg:text-sm font-bold text-primary flex-shrink-0">
                      {idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold mb-1 lg:mb-2 text-base lg:text-lg line-clamp-2" dir="rtl">
                        {topic.grammar_topic}
                      </h3>
                      <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-2">
                          <FileText className="h-3 w-3" />
                          <span>{topic.questions.length} سؤال</span>
                        </span>
                        <Badge variant="secondary">درس #{originalIndex + 1}</Badge>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Empty State */}
          {topics.length > 0 && filteredTopics.length === 0 && (
            <Card className="p-8 text-center">
              <PenTool className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">لا توجد نتائج</h3>
              <p className="text-muted-foreground">
                لم يتم العثور على دروس أو أسئلة تطابق البحث "{searchTerm}"
              </p>
            </Card>
          )}
        </>
      ) : (
        <div className="space-y-3 lg:space-y-4">
          {/* Back Button */}
          <Button
            variant="outline"
            onClick={() => {
              setSelectedTopic(null);
              setSelectedTopicIndex(-1);
              setAnswers({});
            }}
            className="mb-2 lg:mb-4 text-sm"
          >
            <ArrowLeft className="h-4 w-4 ml-2" />
            جميع الدروس
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
            {/* Left Column - Lesson Info */}
            <Card className="p-4 lg:p-6">
              <div className="space-y-4" dir="rtl">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="text-lg lg:text-xl font-bold">{selectedTopic.grammar_topic}</h3>
                    <p className="text-xs lg:text-sm text-muted-foreground mt-1">
                      الدرس #{selectedTopicIndex + 1} • {totalQuestions} سؤال
                    </p>
                  </div>
                  <Badge variant="secondary" className="shrink-0">
                    {answeredCount}/{totalQuestions}
                  </Badge>
                </div>

                <Alert className="bg-primary/10 border-primary/20">
                  <AlertCircle className="h-4 w-4 text-primary" />
                  <AlertDescription className="text-xs lg:text-sm">
                    لقد أجبت على {answeredCount} من أصل {totalQuestions} أسئلة
                  </AlertDescription>
                </Alert>
              </div>
            </Card>

            {/* Right Column - Questions (match Lesen look) */}
            <Card className="p-4 lg:p-6">
              <div className="space-y-4 lg:space-y-6">
                <div dir="rtl">
                  <h3 className="text-lg lg:text-xl font-bold mb-2">اختبر نفسك</h3>
                  <p className="text-xs lg:text-sm text-muted-foreground mb-4">
                    اختر الإجابة الصحيحة لكل سؤال:
                  </p>
                </div>

                <div className="space-y-4 lg:space-y-6 overflow-hidden">
                  {selectedTopic.questions.map((question, qIndex) => {
                    const selectedAnswer = answers[qIndex];
                    const isCorrect = selectedAnswer === question.correct;
                    const hasAnswered = selectedAnswer !== undefined;

                    return (
                      <div key={qIndex} className="space-y-3 pb-4 border-b last:border-0">
                        <div className="bg-black dark:bg-black rounded-lg p-3">
                          <div className="flex items-start gap-2" dir="rtl">
                            <HelpCircle className="h-4 w-4 text-white flex-shrink-0 mt-0.5" />
                            <span className="text-white font-bold text-xs lg:text-sm whitespace-nowrap">
                              السؤال {qIndex + 1}:
                            </span>
                            <p className="text-xs lg:text-sm font-medium flex-1 text-white" dir="ltr" style={{ direction: 'ltr', textAlign: 'left' }}>
                              {question.question}
                            </p>
                          </div>
                        </div>

                        <RadioGroup
                          value={selectedAnswer || ''}
                          onValueChange={(value) => setAnswers((prev) => ({ ...prev, [qIndex]: value }))}
                        >
                          <div className="space-y-2" dir="ltr">
                            {question.choices.map((choice, oIndex) => {
                              const isSelected = selectedAnswer === choice;
                              const isThisCorrect = choice === question.correct;
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
                                    value={choice}
                                    id={`g-q${qIndex}-o${oIndex}`}
                                    className="flex-shrink-0 border-yellow-500 text-yellow-500 data-[state=checked]:bg-yellow-500 data-[state=checked]:border-yellow-500"
                                    disabled={hasAnswered}
                                  />
                                  <Label
                                    htmlFor={`g-q${qIndex}-o${oIndex}`}
                                    className={`text-xs lg:text-sm cursor-pointer flex-1 leading-relaxed flex items-center gap-2 ${
                                      showAsIncorrect ? 'line-through text-muted-foreground' : ''
                                    }`}
                                    dir="ltr"
                                    style={{ direction: 'ltr', textAlign: 'left' }}
                                  >
                                    <span>{String.fromCharCode(97 + oIndex)}) {choice}</span>
                                    {showAsCorrect && <Check className="h-4 w-4 text-green-500 flex-shrink-0" />}
                                    {showAsIncorrect && <X className="h-4 w-4 text-red-500 flex-shrink-0" />}
                                  </Label>
                                </div>
                              );
                            })}
                          </div>
                        </RadioGroup>

                        {hasAnswered && (
                          <p className="text-xs lg:text-sm text-muted-foreground leading-relaxed" dir="rtl">
                            {question.explanation_ar}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

