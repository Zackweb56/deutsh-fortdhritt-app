import React, { useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { ArrowLeft, ArrowRight, Check, HelpCircle, PenTool, Search, X, AlertCircle, FileText, Pointer, Shuffle, Lock, RotateCcw } from 'lucide-react';
import grammarRaw from '@/data/grammar/grammar_tab_exercises.json';
import { isLimitedAccess } from '@/lib/access';
import LockOverlay from '@/components/ui/lock-overlay';

type ExerciseType = 'multiple_choice' | 'fill_in_blank' | 'drag_drop_match' | 'sentence_reconstruction';

interface BaseQuestion {
  explanation_ar?: string;
}

interface MultipleChoiceQuestion extends BaseQuestion {
  question: string;
  choices: string[];
  correct: string;
}

interface FillInBlankQuestion extends BaseQuestion {
  question_sentence: string;
  correct: string;
  choices?: string[];
}

interface DragDropMatchItem extends BaseQuestion {
  noun_phrase: string;
  correct_drop: string;
  distractors: string[];
}

interface SentenceReconstructionQuestion extends BaseQuestion {
  scrambled_words: string[];
  correct_sentence: string;
}

interface Exercise {
  exercise_type: ExerciseType;
  instruction_ar: string;
  instruction_de: string;
  questions?: (MultipleChoiceQuestion | FillInBlankQuestion | SentenceReconstructionQuestion)[];
  items?: DragDropMatchItem[];
}

interface GrammarTopic {
  grammar_topic: string;
  exercises: Exercise[];
}

const grammarData = grammarRaw as GrammarTopic[];

export const GrammarExercisesTab = () => {
  const topics = useMemo(() => {
    return grammarData.map((topic) => {
      // Handle legacy format where topic has a flat `questions` array instead of `exercises`
      if (!topic.exercises && (topic as any).questions) {
        return {
          ...topic,
          exercises: [
            {
              exercise_type: 'multiple_choice',
              instruction_ar: 'اختر الإجابة الصحيحة',
              instruction_de: 'Wählen Sie die richtige Antwort',
              questions: (topic as any).questions,
            },
          ],
        } as GrammarTopic;
      }
      return topic;
    });
  }, []);

  const [selectedTopic, setSelectedTopic] = useState<GrammarTopic | null>(null);
  const [selectedTopicIndex, setSelectedTopicIndex] = useState<number>(-1);
  const [searchTerm, setSearchTerm] = useState('');
  
  // State for answers: key is `${eIdx}-${qIdx}`
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  // State to track if an answer has been explicitly checked (for text inputs / sentences)
  const [checkedState, setCheckedState] = useState<Record<string, boolean>>({});
  // Active selected item for click-to-move drag & drop
  const [activeDndSelection, setActiveDndSelection] = useState<{eIdx: number, qIdx: number, word: string} | null>(null);

  const filteredTopics = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return topics;
    return topics.filter((t) => {
      return t.grammar_topic.toLowerCase().includes(q);
    });
  }, [topics, searchTerm]);

  const limited = isLimitedAccess();

  const setAnswer = (eIdx: number, qIdx: number, value: string | string[]) => {
    setAnswers(prev => ({ ...prev, [`${eIdx}-${qIdx}`]: value }));
  };

  const setChecked = (eIdx: number, qIdx: number, value: boolean) => {
    setCheckedState(prev => ({ ...prev, [`${eIdx}-${qIdx}`]: value }));
  };

  const resetState = () => {
    setAnswers({});
    setCheckedState({});
    setActiveDndSelection(null);
  };

  const resetExercise = (eIdx: number) => {
    setAnswers(prev => {
      const next = { ...prev };
      Object.keys(next).forEach(k => {
        if (k.startsWith(`${eIdx}-`)) delete next[k];
      });
      return next;
    });
    setCheckedState(prev => {
      const next = { ...prev };
      Object.keys(next).forEach(k => {
        if (k.startsWith(`${eIdx}-`)) delete next[k];
      });
      return next;
    });
    setActiveDndSelection(null);
  };

  const getExerciseProgress = (ex: Exercise, eIdx: number) => {
    let total = 0;
    let correct = 0;
    let answered = 0;

    if (ex.exercise_type === 'multiple_choice') {
      const qs = ex.questions as MultipleChoiceQuestion[];
      total = qs.length;
      qs.forEach((q, qIdx) => {
        const key = `${eIdx}-${qIdx}`;
        if (answers[key] !== undefined) answered++;
        if (answers[key] === q.correct) correct++;
      });
    } else if (ex.exercise_type === 'fill_in_blank') {
      const qs = ex.questions as FillInBlankQuestion[];
      total = qs.length;
      qs.forEach((q, qIdx) => {
        const key = `${eIdx}-${qIdx}`;
        const ans = (answers[key] as string) || '';
        if (checkedState[key]) {
          answered++;
          if (ans.trim().toLowerCase() === (q.correct || '').trim().toLowerCase()) {
            correct++;
          }
        }
      });
    } else if (ex.exercise_type === 'drag_drop_match') {
      const items = ex.items as DragDropMatchItem[];
      total = items.length;
      items.forEach((item, qIdx) => {
        const key = `${eIdx}-${qIdx}`;
        if (answers[key]) answered++;
        if (answers[key] === item.correct_drop) correct++;
      });
    } else if (ex.exercise_type === 'sentence_reconstruction') {
      const qs = ex.questions as SentenceReconstructionQuestion[];
      total = qs.length;
      qs.forEach((q, qIdx) => {
        const key = `${eIdx}-${qIdx}`;
        const ans = (answers[key] as string[]) || [];
        if (checkedState[key]) {
          answered++;
          if (ans.join(' ') === q.correct_sentence) {
            correct++;
          }
        }
      });
    }

    return { total, correct, answered, passed: total === 0 || (correct / total) >= 0.6 };
  };

  // ----- EXERCISE RENDERERS -----

  const renderMultipleChoice = (ex: Exercise, eIdx: number) => {
    const questions = ex.questions as MultipleChoiceQuestion[];
    return questions.map((q, qIdx) => {
      const key = `${eIdx}-${qIdx}`;
      const rawSelectedAnswer = answers[key];
      const selectedAnswer = typeof rawSelectedAnswer === 'string' ? rawSelectedAnswer : undefined;
      const hasAnswered = selectedAnswer !== undefined;
      const isCorrect = selectedAnswer === q.correct;

      // Normalize choices
      const uniqueChoices = Array.from(new Set((q.choices || []).map((c) => c.trim()))).filter(Boolean);
      const withCorrect = uniqueChoices.includes(q.correct?.trim() || '') ? uniqueChoices : [q.correct, ...uniqueChoices].filter(Boolean);
      const displayChoices = withCorrect.slice(0, 4);

      return (
        <div key={qIdx} className="space-y-3 pb-4 border-b last:border-0 border-border/50">
          <div className="bg-black dark:bg-black rounded-lg p-3" dir="ltr" style={{ direction: 'ltr' }}>
            <div className="flex flex-row items-start justify-start gap-2 text-left w-full" style={{ direction: 'ltr' }}>
              <HelpCircle className="h-4 w-4 text-white flex-shrink-0 mt-0.5" />
              <p className="text-sm font-medium flex-1 text-white text-left" style={{ direction: 'ltr', textAlign: 'left' }}>
                {q.question}
              </p>
            </div>
          </div>

          <RadioGroup
            value={selectedAnswer || ''}
            onValueChange={(val) => setAnswer(eIdx, qIdx, val)}
            dir="ltr"
            style={{ direction: 'ltr' }}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left" style={{ direction: 'ltr' }}>
              {displayChoices.map((choice, oIndex) => {
                const isSelected = selectedAnswer === choice;
                const isThisCorrect = choice === q.correct;
                const showAsIncorrect = hasAnswered && isSelected && !isCorrect;
                const showAsCorrect = hasAnswered && isThisCorrect;

                return (
                  <div
                    key={oIndex}
                    className={`flex items-center gap-2 p-3 rounded-lg border transition-colors ${
                      showAsCorrect
                        ? 'bg-green-500/10 border-green-500/50 text-green-700 dark:text-green-400'
                        : showAsIncorrect
                          ? 'bg-red-500/10 border-red-500/50 text-red-700 dark:text-red-400'
                          : 'bg-card hover:bg-muted/50 border-border'
                    }`}
                  >
                    <RadioGroupItem
                      value={choice}
                      id={`q-${key}-${oIndex}`}
                      className="flex-shrink-0 border-primary text-primary"
                      disabled={hasAnswered}
                    />
                    <Label
                      htmlFor={`q-${key}-${oIndex}`}
                      className={`text-sm cursor-pointer flex-1 font-medium flex flex-row items-center gap-2 text-left ${
                        showAsIncorrect ? 'line-through opacity-70' : ''
                      }`}
                      dir="ltr"
                      style={{ direction: 'ltr', textAlign: 'left' }}
                    >
                      {choice}
                      {showAsCorrect && <Check className="h-4 w-4 text-green-500 ml-auto flex-shrink-0" />}
                      {showAsIncorrect && <X className="h-4 w-4 text-red-500 ml-auto flex-shrink-0" />}
                    </Label>
                  </div>
                );
              })}
            </div>
          </RadioGroup>

          {hasAnswered && q.explanation_ar && (
            <p className="text-sm text-muted-foreground mt-2 bg-muted/30 p-3 rounded-lg border border-border/50" dir="rtl">
              {q.explanation_ar}
            </p>
          )}
        </div>
      );
    });
  };

  const renderFillInBlank = (ex: Exercise, eIdx: number) => {
    const questions = ex.questions as FillInBlankQuestion[];
    return questions.map((q, qIdx) => {
      const key = `${eIdx}-${qIdx}`;
      const rawAnswer = answers[key];
      const answer = typeof rawAnswer === 'string' ? rawAnswer : '';
      const isChecked = checkedState[key];
      const isCorrect = answer.trim().toLowerCase() === (q.correct || '').trim().toLowerCase();

      // Split the sentence by ___ to insert the input
      const parts = q.question_sentence.split('___');

      return (
        <div key={qIdx} className="space-y-4 pb-4 border-b last:border-0 border-border/50">
          <div className="bg-card border rounded-lg p-3 sm:p-4 shadow-sm text-left" style={{ direction: 'ltr' }}>
            <div className="text-base sm:text-lg leading-loose flex flex-row flex-wrap justify-start items-center gap-1.5 sm:gap-2 text-left w-full" style={{ direction: 'ltr' }}>
              {parts.map((part, i) => (
                <React.Fragment key={i}>
                  <span className="font-medium" style={{ direction: 'ltr', unicodeBidi: 'isolate' }}>{part}</span>
                  {i < parts.length - 1 && (
                    <Input
                      value={answer}
                      onChange={(e) => {
                        setAnswer(eIdx, qIdx, e.target.value);
                        setChecked(eIdx, qIdx, false); // Reset check state on type
                      }}
                      disabled={isChecked && isCorrect}
                      className={`min-w-[80px] sm:min-w-[120px] w-auto inline-flex text-center h-8 sm:h-10 text-sm sm:text-base font-bold transition-colors ${
                        isChecked
                          ? isCorrect
                            ? 'bg-green-500/10 border-green-500 text-green-600 focus-visible:ring-green-500'
                            : 'bg-red-500/10 border-red-500 text-red-600 focus-visible:ring-red-500'
                          : 'bg-background'
                      }`}
                      placeholder="..."
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && answer.trim()) {
                          setChecked(eIdx, qIdx, true);
                        }
                      }}
                    />
                  )}
                </React.Fragment>
              ))}
            </div>
            
            <div className="mt-4 flex items-center justify-between" dir="rtl">
              {(!isChecked || !isCorrect) && (
                <Button 
                  size="sm" 
                  onClick={() => setChecked(eIdx, qIdx, true)}
                  disabled={!answer.trim() || (isChecked && isCorrect)}
                  className="bg-primary hover:bg-primary/90"
                >
                  تحقق
                </Button>
              )}
              {isChecked && (
                <div className={`flex items-center gap-2 text-sm font-semibold ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                  {isCorrect ? <><Check className="h-4 w-4"/> إجابة صحيحة</> : <><X className="h-4 w-4"/> حاول مرة أخرى</>}
                </div>
              )}
            </div>
          </div>

          {isChecked && q.explanation_ar && (
            <p className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg border border-border/50" dir="rtl">
              <span className="font-semibold block mb-1">توضيح:</span>
              {q.explanation_ar}
            </p>
          )}
        </div>
      );
    });
  };

  const renderDragDropMatch = (ex: Exercise, eIdx: number) => {
    const items = ex.items as DragDropMatchItem[];
    
    // Create a word bank per question, or globally per exercise? The JSON shows distractors per item.
    // So it's best to show the sentence with a blank, and the word bank right below it.
    
    return items.map((item, qIdx) => {
      const key = `${eIdx}-${qIdx}`;
      const rawAnswer = answers[key];
      const answer = typeof rawAnswer === 'string' ? rawAnswer : '';
      const hasAnswered = !!answer;
      const isCorrect = answer === item.correct_drop;

      // Prepare options: correct + distractors, sort alphabetically for stability
      const arr = [item.correct_drop, ...item.distractors];
      const options = arr.sort((a, b) => a.localeCompare(b));

      const parts = item.noun_phrase.split('___');

      return (
        <div key={qIdx} className="space-y-4 pb-6 border-b last:border-0 border-border/50">
          {/* Target Sentence Area */}
          <div className="bg-card border rounded-lg p-4 sm:p-5 shadow-sm transition-colors duration-300 relative overflow-hidden text-left" style={{ direction: 'ltr' }}>
             {hasAnswered && (
               <div className={`absolute top-0 left-0 w-1 h-full ${isCorrect ? 'bg-green-500' : 'bg-red-500'}`} />
             )}
            <div className="text-base sm:text-lg flex flex-row flex-wrap justify-start items-center gap-1.5 sm:gap-2 text-left w-full" style={{ direction: 'ltr' }}>
              {parts.map((part, i) => (
                <React.Fragment key={i}>
                  <span className="font-medium text-foreground" style={{ direction: 'ltr', unicodeBidi: 'isolate' }}>{part}</span>
                  {i < parts.length - 1 && (
                    <div 
                      className={`min-w-[80px] sm:min-w-[100px] h-8 sm:h-10 px-2 sm:px-3 flex items-center justify-center rounded-md border-2 border-dashed cursor-pointer transition-all text-sm sm:text-base
                        ${hasAnswered 
                          ? isCorrect 
                            ? 'bg-green-500/10 border-green-500 text-green-700 font-bold border-solid' 
                            : 'bg-red-500/10 border-red-500 text-red-700 font-bold border-solid'
                          : activeDndSelection && activeDndSelection.eIdx === eIdx && activeDndSelection.qIdx === qIdx
                            ? 'border-primary bg-primary/5 ring-2 ring-primary/20 scale-105' 
                            : 'border-muted-foreground/30 bg-muted/20 hover:border-primary/50'
                        }
                      `}
                      onClick={() => {
                        if (hasAnswered && isCorrect) return; // Locked if correct
                        
                        // If clicking drop zone with an active selection
                        if (activeDndSelection && activeDndSelection.eIdx === eIdx && activeDndSelection.qIdx === qIdx) {
                          setAnswer(eIdx, qIdx, activeDndSelection.word);
                          setActiveDndSelection(null);
                        } else if (hasAnswered) {
                          // Unset answer (move back to bank)
                          setAnswer(eIdx, qIdx, '');
                        }
                      }}
                    >
                      {answer ? (
                        <div className="flex flex-row items-center gap-2" style={{ direction: 'ltr' }}>
                          <span style={{ direction: 'ltr', unicodeBidi: 'isolate' }}>{answer}</span>
                          {isCorrect ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                        </div>
                      ) : (
                        <span className="text-muted-foreground/50 text-sm">أضف هنا</span>
                      )}
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Word Bank Area */}
          <div className="bg-muted/30 p-4 rounded-lg border border-border/50">
            <div className="flex items-center gap-2 mb-3 text-sm font-medium text-muted-foreground" dir="rtl">
              <Pointer className="h-4 w-4" />
              <span>اختر الكلمة المناسبة:</span>
            </div>
            <div className="flex flex-row flex-wrap justify-start items-center gap-2 text-left w-full" style={{ direction: 'ltr' }}>
              {options.map((opt, oIdx) => {
                const isSelected = answer === opt;
                const isActive = activeDndSelection?.word === opt && activeDndSelection?.eIdx === eIdx && activeDndSelection?.qIdx === qIdx;
                
                if (isSelected && isCorrect) return null; // Hide if correct and placed

                return (
                  <Button
                    key={oIdx}
                    variant={isActive ? "default" : isSelected ? "outline" : "secondary"}
                    size="sm"
                    disabled={isSelected && isCorrect}
                    className={`text-sm font-medium transition-all ${
                      isActive ? 'ring-2 ring-primary ring-offset-1 scale-105' : ''
                    } ${isSelected ? 'opacity-50' : ''}`}
                    onClick={() => {
                      if (isSelected) return;
                      // Toggle selection
                      if (isActive) {
                        setActiveDndSelection(null);
                      } else {
                        // Automatically place if it's the only blank
                        setAnswer(eIdx, qIdx, opt);
                        setActiveDndSelection(null);
                      }
                    }}
                  >
                    {opt}
                  </Button>
                );
              })}
            </div>
          </div>

          {hasAnswered && item.explanation_ar && (
            <p className="text-sm text-muted-foreground bg-card p-3 rounded-lg border border-border shadow-sm" dir="rtl">
              {item.explanation_ar}
            </p>
          )}
        </div>
      );
    });
  };

  const renderSentenceReconstruction = (ex: Exercise, eIdx: number) => {
    const questions = ex.questions as SentenceReconstructionQuestion[];
    
    return questions.map((q, qIdx) => {
      const key = `${eIdx}-${qIdx}`;
      const currentSentence = (answers[key] as string[]) || [];
      const isChecked = checkedState[key];
      
      const isCorrect = currentSentence.join(' ') === q.correct_sentence;
      const allWordsUsed = currentSentence.length === q.scrambled_words.length;

      // Available words are those not currently in the sentence
      // Since words can be duplicates, we need to track by index, but simpler: 
      // just count occurrences or use indices. Actually, storing words is fine, 
      // if there are duplicates, we just remove the first match from available.
      const availableWords = [...q.scrambled_words];
      currentSentence.forEach(w => {
        const idx = availableWords.indexOf(w);
        if (idx > -1) availableWords.splice(idx, 1);
      });

      const handleWordClick = (word: string, fromTarget: boolean, indexInTarget?: number) => {
        if (isChecked && isCorrect) return; // Locked

        const newSentence = [...currentSentence];
        if (fromTarget && indexInTarget !== undefined) {
          newSentence.splice(indexInTarget, 1);
        } else {
          newSentence.push(word);
        }
        setAnswer(eIdx, qIdx, newSentence);
        setChecked(eIdx, qIdx, false);
      };

      return (
        <div key={qIdx} className="space-y-4 pb-6 border-b last:border-0 border-border/50">
          
          {/* Target Area */}
          <div 
            className={`min-h-[80px] p-3 sm:p-4 rounded-xl border-2 transition-colors text-left w-full ${
              isChecked 
                ? isCorrect 
                  ? 'bg-green-500/10 border-green-500 shadow-sm' 
                  : 'bg-red-500/10 border-red-500 shadow-sm'
                : 'bg-card border-dashed border-border/60 hover:border-primary/50'
            }`}
            style={{ direction: 'ltr' }}
          >
            {currentSentence.length === 0 ? (
              <div className="h-full flex items-center justify-center text-muted-foreground/50 text-xs sm:text-sm py-4" dir="rtl" style={{ direction: 'rtl' }}>
                انقر على الكلمات بالأسفل لترتيبها هنا
              </div>
            ) : (
              <div className="flex flex-row flex-wrap justify-start items-center gap-2 text-left w-full" style={{ direction: 'ltr' }}>
                {currentSentence.map((word, idx) => (
                  <Button
                    key={`t-${idx}`}
                    variant={isChecked && isCorrect ? "default" : "secondary"}
                    size="sm"
                    onClick={() => handleWordClick(word, true, idx)}
                    className={`shadow-sm animate-in zoom-in duration-200 ${isChecked && isCorrect ? 'bg-green-600 hover:bg-green-600 text-white' : ''}`}
                    disabled={isChecked && isCorrect}
                  >
                    {word}
                  </Button>
                ))}
              </div>
            )}
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-between" dir="rtl">
            {(!isChecked || !isCorrect) && (
              <Button 
                size="sm" 
                onClick={() => setChecked(eIdx, qIdx, true)}
                disabled={currentSentence.length === 0 || (isChecked && isCorrect)}
                className="bg-primary hover:bg-primary/90 min-w-[100px]"
              >
                تحقق
              </Button>
            )}
            
            {isChecked && (
              <div className={`flex items-center gap-2 text-sm font-semibold ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                {isCorrect ? <><Check className="h-4 w-4"/> ترتيب صحيح</> : <><X className="h-4 w-4"/> ترتيب غير صحيح</>}
              </div>
            )}
          </div>

          {/* Source Area (Word Bank) */}
          {(!isChecked || !isCorrect) && availableWords.length > 0 && (
            <div className="bg-muted/30 p-4 rounded-lg border border-border/50 mt-2">
               <div className="flex items-center gap-2 mb-3 text-xs text-muted-foreground" dir="rtl" style={{ direction: 'rtl' }}>
                 <Shuffle className="h-3 w-3" /> الكلمات المتاحة:
               </div>
              <div className="flex flex-row flex-wrap justify-start items-center gap-2 text-left w-full" style={{ direction: 'ltr' }}>
                {availableWords.map((word, idx) => (
                  <Button
                    key={`s-${idx}`}
                    variant="outline"
                    size="sm"
                    onClick={() => handleWordClick(word, false)}
                    className="bg-background shadow-sm hover:border-primary hover:text-primary animate-in fade-in duration-200"
                  >
                    {word}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {isChecked && q.explanation_ar && (
            <p className="text-sm text-muted-foreground bg-card p-3 rounded-lg border border-border shadow-sm mt-4" dir="rtl">
              <span className="font-semibold block mb-1 text-foreground">القاعدة:</span>
              {q.explanation_ar}
            </p>
          )}
        </div>
      );
    });
  };

  // ----- MAIN RENDER -----

  return (
    <div className="space-y-6" dir="rtl">
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
            className="pr-10 bg-background"
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
            {filteredTopics.map((topic, idx) => {
              const originalIndex = topics.indexOf(topic);
              const qCount = topic.exercises.reduce((acc, ex) => acc + (ex.questions?.length || ex.items?.length || 0), 0);
              const shouldLock = limited && originalIndex >= 2;
              
              return (
                <LockOverlay key={topic.grammar_topic} isLocked={shouldLock} message="دروس محجوبة">
                  <Card
                    className={`p-3 lg:p-4 transition-all duration-200 ${shouldLock ? '' : 'cursor-pointer hover:shadow-md hover:border-primary/50 active:scale-[0.98]'}`}
                    onClick={() => {
                      if (shouldLock) return;
                      setSelectedTopic(topic);
                      setSelectedTopicIndex(originalIndex);
                      resetState();
                    }}
                  >
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary flex-shrink-0">
                      {idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold mb-2 text-base lg:text-lg line-clamp-2 text-left" dir="ltr">
                        {topic.grammar_topic}
                      </h3>
                      <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground" dir="rtl">
                        <span className="inline-flex items-center gap-1.5">
                          <FileText className="h-3.5 w-3.5" />
                          <span>{qCount} تدريب</span>
                        </span>
                        <Badge variant="secondary" className="font-normal text-[10px] lg:text-xs">درس #{originalIndex + 1}</Badge>
                      </div>
                    </div>
                  </div>
                </Card>
                </LockOverlay>
              );
            })}
          </div>

          {/* Empty State */}
          {topics.length > 0 && filteredTopics.length === 0 && (
            <Card className="p-8 text-center bg-muted/20 border-dashed">
              <Search className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">لا توجد نتائج</h3>
              <p className="text-muted-foreground">
                لم يتم العثور على دروس تطابق البحث "{searchTerm}"
              </p>
            </Card>
          )}
        </>
      ) : (
        <div className="space-y-4 lg:space-y-6">
          {/* Back Button & Progress Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <Button
              variant="outline"
              onClick={() => {
                setSelectedTopic(null);
                setSelectedTopicIndex(-1);
                resetState();
              }}
              className="w-fit flex items-center gap-2"
            >
              <ArrowRight className="h-4 w-4" />
              <span>العودة للدروس</span>
            </Button>


          </div>

          <Card className="p-4 sm:p-5 lg:p-8 bg-card border shadow-sm">
            <h2 className="text-xl sm:text-2xl font-bold mb-6 sm:mb-8 text-left border-b pb-4 sm:pb-6" dir="ltr">
              {selectedTopic.grammar_topic}
            </h2>

            <div className="flex flex-col gap-6 lg:gap-8">
              {selectedTopic.exercises.map((exercise, eIdx) => {
                const prevEx = eIdx > 0 ? selectedTopic.exercises[eIdx - 1] : null;
                const prevPassed = prevEx ? getExerciseProgress(prevEx, eIdx - 1).passed : true;
                const isLocked = !prevPassed;

                return (
                <Card key={eIdx} className={`flex flex-col h-full overflow-hidden bg-background relative ${isLocked ? 'opacity-80 pointer-events-none' : ''}`}>
                  {isLocked && (
                    <div className="absolute inset-0 z-10 bg-background/60 backdrop-blur-[1px] flex items-center justify-center">
                      <div className="bg-card p-6 rounded-2xl shadow-xl border flex flex-col items-center gap-4 text-center max-w-[80%]">
                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <Lock className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <p className="font-bold text-lg mb-1">التدريب مقفل</p>
                          <p className="text-sm text-muted-foreground">قم بإجابة 60% على الأقل من التدريب السابق لفتح هذا التدريب.</p>
                        </div>
                      </div>
                    </div>
                  )}
                  {/* Exercise Header */}
                  <div className="bg-muted/40 p-4 lg:p-5 border-b border-border/60" dir="rtl">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-primary/20 text-primary hover:bg-primary/30 font-bold px-3">
                          تدريب {eIdx + 1}
                        </Badge>
                        <span className="text-xs font-semibold text-muted-foreground bg-background px-2 py-1 rounded border">
                          {exercise.exercise_type === 'multiple_choice' && 'اختيار من متعدد'}
                          {exercise.exercise_type === 'fill_in_blank' && 'أكمل الفراغ'}
                          {exercise.exercise_type === 'drag_drop_match' && 'سحب وإفلات'}
                          {exercise.exercise_type === 'sentence_reconstruction' && 'ترتيب الجملة'}
                        </span>
                      </div>
                      
                      {/* Exercise specific progress & reset */}
                      {!isLocked && (
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                            <span>{getExerciseProgress(exercise, eIdx).correct} / {getExerciseProgress(exercise, eIdx).total} إجابة صحيحة</span>
                            <div className="h-1.5 w-16 bg-background rounded-full overflow-hidden border">
                              <div 
                                className="h-full bg-primary transition-all duration-500 ease-out"
                                style={{ width: `${getExerciseProgress(exercise, eIdx).total > 0 ? (getExerciseProgress(exercise, eIdx).correct / getExerciseProgress(exercise, eIdx).total) * 100 : 0}%` }}
                              />
                            </div>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-7 px-2 text-xs gap-1 text-muted-foreground hover:text-foreground"
                            onClick={() => resetExercise(eIdx)}
                          >
                            <RotateCcw className="h-3 w-3" />
                            إعادة
                          </Button>
                        </div>
                      )}
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-foreground mt-3">
                      {exercise.instruction_ar}
                    </h3>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1.5 text-left" dir="ltr">
                      {exercise.instruction_de}
                    </p>
                  </div>

                  {/* Exercise Content */}
                  <div className="p-4 lg:p-6 flex-1 text-left" dir="ltr">
                    {exercise.exercise_type === 'multiple_choice' && renderMultipleChoice(exercise, eIdx)}
                    {exercise.exercise_type === 'fill_in_blank' && renderFillInBlank(exercise, eIdx)}
                    {exercise.exercise_type === 'drag_drop_match' && renderDragDropMatch(exercise, eIdx)}
                    {exercise.exercise_type === 'sentence_reconstruction' && renderSentenceReconstruction(exercise, eIdx)}
                  </div>
                </Card>
                );
              })}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
