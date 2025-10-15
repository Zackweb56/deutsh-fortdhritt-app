import React, { useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { b1Lessons } from '@/data/lessonsData';
import { ArrowRight, BookOpen, Volume2, Info, Layers, MessageSquare, Loader2 } from 'lucide-react';
import b1Details from '@/data/lessons/b1-lessons-details.json';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { speakGerman } from '@/lib/tts';
import { isLimitedAccess } from '@/lib/access';

const B1Lesson: React.FC = () => {
  const { lessonNumber } = useParams();
  const num = Number(lessonNumber);
  const [speakingText, setSpeakingText] = useState<string | null>(null);

  const lesson = useMemo(() => {
    return (b1Lessons?.lessons || []).find((l: any) => l.number === num);
  }, [num]);

  // Check if lesson is locked for free users (first 2 lessons are free)
  const isLocked = isLimitedAccess() && num > 2;

  if (!lesson) {
    return (
      <div className="container mx-auto px-4 py-6">
        <Card className="p-6 text-center">
          <div className="text-lg font-semibold mb-2">الدرس غير موجود</div>
          <Link to="/" className="inline-flex items-center gap-2 text-primary hover:underline">
            <ArrowRight className="h-4 w-4" /> العودة للرئيسية
          </Link>
        </Card>
      </div>
    );
  }

  if (isLocked) {
    return (
      <div className="container mx-auto px-4 py-6">
        <Card className="p-6 text-center">
          <div className="text-lg font-semibold mb-2">الدرس محجوب</div>
          <p className="text-muted-foreground mb-4">
            هذا الدرس متاح فقط للمستخدمين المميزين. تواصل معنا عبر واتساب للحصول على الوصول الكامل.
          </p>
          <Link to="/" className="inline-flex items-center gap-2 text-primary hover:underline">
            <ArrowRight className="h-4 w-4" /> العودة للرئيسية
          </Link>
        </Card>
      </div>
    );
  }

  // Structured content from JSON (rich, categorized)
  const content = (b1Details as any[]).find((l) => l.lessonNumber === num);
  const vocabularyGroups: { category: string; words: { de: string; ar: string; pron?: string; usage?: string }[] }[] = content?.vocabulary || [];
  const phraseGroups: { category: string; items: { de: string; ar: string; pron?: string; context?: string }[] }[] = content?.phrases || [];
  const dialogues: { title: string; context?: string; level?: string; lines: { speaker?: string; de: string; ar: string }[] }[] = content?.dialogues || [];
  const grammar: { topic: string; explanation?: string; rules?: string[]; examples?: { de: string; ar: string }[]; common_mistakes?: string[] }[] = content?.grammar || [];
  const culturalNotes: { title: string; content: string }[] = content?.cultural_notes || [];
  const pronunciationTips: { tip: string; explanation: string }[] = content?.pronunciation_tips || [];
  const exercises: any[] = content?.exercises || [];
  const commonMistakes: { mistake: string; correction: string; example: string }[] = content?.common_mistakes || [];
  const resources: { type: string; title: string; url?: string; description: string }[] = content?.resources || [];
  const reviewQuestions: { question: string; answer: string }[] = content?.review_questions || [];

  return (
    <div className="container mx-auto px-4 py-6 space-y-6" dir="rtl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
            <BookOpen className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">B1 — الدرس {lesson.number}</h1>
            <p className="text-muted-foreground">{lesson.title} — {lesson.title_en}</p>
          </div>
        </div>
        <Link to="/" className="text-sm text-primary hover:underline">الرجوع</Link>
      </div>

      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Info className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">معلومات الدرس</h2>
          </div>
          <div className="flex gap-2">
            {content?.duration && (
              <Badge variant="outline" className="text-xs">{content.duration}</Badge>
            )}
            {content?.difficulty && (
              <Badge variant="secondary" className="text-xs">{content.difficulty}</Badge>
            )}
          </div>
        </div>
        
        {content && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium text-sm text-muted-foreground mb-1">الملخص</h3>
              <p className="text-sm">{content.summary || lesson.description}</p>
            </div>
            <div>
              <h3 className="font-medium text-sm text-muted-foreground mb-1">الجمهور المستهدف</h3>
              <p className="text-sm">{content.target_audience}</p>
            </div>
          </div>
        )}

        {content?.objectives && content.objectives.length > 0 && (
          <div>
            <h3 className="font-medium text-sm text-muted-foreground mb-2">أهداف التعلم</h3>
            <ul className="space-y-1">
              {content.objectives.map((objective: string, index: number) => (
                <li key={index} className="text-sm flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  {objective}
                </li>
              ))}
            </ul>
          </div>
        )}
      </Card>

      {vocabularyGroups.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Layers className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">المفردات</h2>
            </div>
            <Badge variant="secondary" className="text-xs">
              {vocabularyGroups.reduce((total, group) => total + (group.words?.length || 0), 0)} كلمة
            </Badge>
          </div>
          
          <Accordion type="multiple" className="space-y-2">
            {vocabularyGroups.map((group, groupIndex) => (
              <AccordionItem key={groupIndex} value={`vocab-${groupIndex}`} className="border rounded-lg px-4">
                <AccordionTrigger className="text-right">
                  <span className="font-medium">{group.category}</span>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                    {group.words.map((word, wordIndex) => (
                      <div key={wordIndex} className="p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-lg text-accent">{word.de}</span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setSpeakingText(word.de);
                              speakGerman(word.de);
                            }}
                            disabled={speakingText === word.de}
                          >
                            {speakingText === word.de ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Volume2 className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">{word.ar}</p>
                        {word.pron && (
                          <p className="text-xs text-muted-foreground mb-1">النطق: {word.pron}</p>
                        )}
                        {word.usage && (
                          <p className="text-xs text-muted-foreground">الاستخدام: {word.usage}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Card>
      )}

      {phraseGroups.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">العبارات والجمل</h2>
          </div>
          
          <Accordion type="multiple" className="space-y-2">
            {phraseGroups.map((group, groupIndex) => (
              <AccordionItem key={groupIndex} value={`phrases-${groupIndex}`} className="border rounded-lg px-4">
                <AccordionTrigger className="text-right">
                  <span className="font-medium">{group.category}</span>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3 pt-2">
                    {group.items.map((phrase, phraseIndex) => (
                      <div key={phraseIndex} className="p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-lg">{phrase.de}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">{phrase.ar}</p>
                        {phrase.pron && (
                          <p className="text-xs text-muted-foreground mb-1">النطق: {phrase.pron}</p>
                        )}
                        {phrase.context && (
                          <p className="text-xs text-muted-foreground">السياق: {phrase.context}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Card>
      )}

      {dialogues.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">الحوارات</h2>
          </div>
          
          <Accordion type="multiple" className="space-y-2">
            {dialogues.map((dialogue, index) => (
              <AccordionItem key={index} value={`dialogue-${index}`} className="border rounded-lg px-4">
                <AccordionTrigger className="text-right">
                  <span className="font-medium">{dialogue.title}</span>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3 pt-2">
                    {dialogue.context && (
                      <p className="text-sm text-muted-foreground">{dialogue.context}</p>
                    )}
                    
                    <div className="space-y-2">
                      {dialogue.lines.map((line, lineIndex) => (
                        <div key={lineIndex} className="p-3 bg-muted/50 rounded-lg">
                          {line.speaker && (
                            <p className="font-medium text-sm text-primary mb-1">{line.speaker}</p>
                          )}
                          <div className="flex items-center justify-between">
                            <p className="font-medium">{line.de}</p>
                          </div>
                          <p className="text-sm text-muted-foreground">{line.ar}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Card>
      )}

      {grammar.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">القواعد النحوية</h2>
          </div>
          
          <Accordion type="multiple" className="space-y-2">
            {grammar.map((grammarItem, index) => (
              <AccordionItem key={index} value={`grammar-${index}`} className="border rounded-lg px-4">
                <AccordionTrigger className="text-right">
                  <span className="font-medium">{grammarItem.topic}</span>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3 pt-2">
                    {grammarItem.explanation && (
                      <p className="text-sm">{grammarItem.explanation}</p>
                    )}
                    
                    {grammarItem.rules && grammarItem.rules.length > 0 && (
                      <div>
                        <h4 className="font-medium text-sm mb-2">القواعد:</h4>
                        <ul className="space-y-1">
                          {grammarItem.rules.map((rule, ruleIndex) => (
                            <li key={ruleIndex} className="text-sm flex items-start gap-2">
                              <span className="text-primary mt-1">•</span>
                              {rule}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {grammarItem.examples && grammarItem.examples.length > 0 && (
                      <div>
                        <h4 className="font-medium text-sm mb-2">أمثلة:</h4>
                        <div className="space-y-2">
                          {grammarItem.examples.map((example, exampleIndex) => (
                            <div key={exampleIndex} className="p-2 bg-muted/30 rounded">
                              <p className="font-medium text-sm">{example.de}</p>
                              <p className="text-sm text-muted-foreground">{example.ar}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {grammarItem.common_mistakes && grammarItem.common_mistakes.length > 0 && (
                      <div>
                        <h4 className="font-medium text-sm mb-2">أخطاء شائعة:</h4>
                        <ul className="space-y-1">
                          {grammarItem.common_mistakes.map((mistake, mistakeIndex) => (
                            <li key={mistakeIndex} className="text-sm flex items-start gap-2">
                              <span className="text-destructive mt-1">•</span>
                              {mistake}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Card>
      )}

      {culturalNotes.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Info className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">ملاحظات ثقافية</h2>
          </div>
          
          <div className="space-y-3">
            {culturalNotes.map((note, index) => (
              <div key={index} className="p-3 bg-muted/50 rounded-lg">
                <h3 className="font-medium mb-2">{note.title}</h3>
                <p className="text-sm">{note.content}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {pronunciationTips.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Volume2 className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">نصائح النطق</h2>
          </div>
          
          <div className="space-y-3">
            {pronunciationTips.map((tip, index) => (
              <div key={index} className="p-3 bg-muted/50 rounded-lg">
                <h3 className="font-medium mb-2">{tip.tip}</h3>
                <p className="text-sm">{tip.explanation}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {exercises.length > 0 && (
        <Card className="p-6 space-y-4">
          <h2 className="text-xl font-semibold">تمارين للتدريب</h2>
          <p className="text-sm text-muted-foreground">حل هذه التمارين على الورق لتعزيز فهمك للدرس</p>
          {exercises.map((ex, i) => (
            <div key={i} className="space-y-3 p-4 border border-border rounded-lg">
              <div className="flex items-center gap-2">
                <Badge variant="outline">{ex.type === 'matching' ? 'مطابقة' : ex.type === 'fill_blanks' ? 'إكمال الفراغات' : ex.type === 'role_play' ? 'تمثيل الأدوار' : ex.type}</Badge>
                <h3 className="font-medium">{ex.title}</h3>
              </div>
              
              {ex.instructions && (
                <p className="text-sm text-muted-foreground bg-muted/50 p-2 rounded">{ex.instructions}</p>
              )}
              
              {ex.type === 'match' || ex.type === 'matching' ? (
                <div className="space-y-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    {ex.pairs?.map((p: any, j: number) => (
                      <div key={j} className="p-3 rounded border border-border flex items-center justify-between hover:bg-muted/30 transition-colors">
                        <span dir="ltr" className="font-medium">{p.left}</span>
                        <span className="text-muted-foreground">{p.right}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : ex.type === 'fill_blanks' ? (
                <div className="space-y-3">
                  <div className="space-y-2">
                    {ex.dialogue?.map((d: any, j: number) => (
                      <div key={j} className="p-3 rounded border border-border text-sm bg-muted/20" dir="ltr">
                        <span className="font-medium">{d.speaker}: </span>
                        {d.text}
                      </div>
                    ))}
                  </div>
                  {ex.options && (
                    <div>
                      <p className="text-sm font-medium mb-2">الكلمات المتاحة:</p>
                      <div className="flex flex-wrap gap-2 text-xs">
                        {ex.options.map((op: string, k: number) => (
                          <span key={k} className="px-3 py-1 rounded-full border bg-card/60 hover:bg-primary/10 transition-colors" dir="ltr">{op}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : ex.type === 'role_play' ? (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">سيناريوهات للتدريب:</p>
                  <ul className="list-disc pr-5 text-sm space-y-1">
                    {ex.scenarios?.map((s: string, j: number) => (
                      <li key={j} className="p-2 rounded bg-muted/30">{s}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          ))}
        </Card>
      )}

      {commonMistakes.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Info className="h-5 w-5 text-destructive" />
            <h2 className="text-xl font-semibold">أخطاء شائعة</h2>
          </div>
          
          <div className="space-y-3">
            {commonMistakes.map((mistake, index) => (
              <div key={index} className="p-3 bg-destructive/10 rounded-lg border border-destructive/20">
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-destructive mb-1">خطأ: {mistake.mistake}</p>
                    <p className="text-sm text-green-600 mb-1">صحيح: {mistake.correction}</p>
                    <p className="text-xs text-muted-foreground">مثال: {mistake.example}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {resources.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">موارد إضافية</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {resources.map((resource, index) => (
              <div key={index} className="p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline">{resource.type}</Badge>
                </div>
                <h3 className="font-medium mb-1">{resource.title}</h3>
                <p className="text-sm text-muted-foreground mb-2">{resource.description}</p>
                {resource.url && (
                  <a 
                    href={resource.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline"
                  >
                    زيارة الرابط
                  </a>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {reviewQuestions.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">أسئلة المراجعة</h2>
          </div>
          
          <Accordion type="multiple" className="space-y-2">
            {reviewQuestions.map((qa, index) => (
              <AccordionItem key={index} value={`question-${index}`} className="border rounded-lg px-4">
                <AccordionTrigger className="text-right">
                  <span className="font-medium">{qa.question}</span>
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-sm pt-2">{qa.answer}</p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Card>
      )}

      <div className="flex justify-between items-center pt-6">
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-primary hover:underline"
        >
          <ArrowRight className="h-4 w-4" />
          العودة للرئيسية
        </Link>
        
        <div className="flex gap-2">
          {num > 1 && (
            <Link 
              to={`/lessons/b1/${num - 1}`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              الدرس السابق
            </Link>
          )}
          {num < (b1Lessons?.lessons?.length || 0) && (
            <Link 
              to={`/lessons/b1/${num + 1}`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              الدرس التالي
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default B1Lesson;


