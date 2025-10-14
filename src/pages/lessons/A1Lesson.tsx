import React, { useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { a1Lessons } from '@/data/lessonsData';
import { ArrowRight, BookOpen, Volume2, Info, Layers, MessageSquare, Loader2 } from 'lucide-react';
import a1Details from '@/data/lessons/a1-lessons-details.json';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { speakGerman } from '@/lib/tts';

const A1Lesson: React.FC = () => {
  const { lessonNumber } = useParams();
  const num = Number(lessonNumber);
  const [speakingText, setSpeakingText] = useState<string | null>(null);

  const lesson = useMemo(() => {
    return (a1Lessons?.lessons || []).find((l: any) => l.number === num);
  }, [num]);

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

  // Structured content from JSON (rich, categorized)
  const content = (a1Details as any[]).find((l) => l.lessonNumber === num);
  const vocabularyGroups: { category: string; words: { de: string; ar: string; pron?: string; usage?: string }[] }[] = content?.vocabulary || [];
  const phraseGroups: { category: string; items: { de: string; ar: string; pron?: string; context?: string }[] }[] = content?.phrases || [];
  const dialogues: { title: string; context?: string; level?: string; lines: { speaker?: string; de: string; ar: string }[] }[] = content?.dialogues || [];
  const grammar: { topic: string; explanation?: string; rules?: string[]; examples?: { de: string; ar: string }[]; common_mistakes?: string[] }[] = content?.grammar || [];
  const culturalNotes: { title: string; content: string }[] = content?.cultural_notes || [];
  const pronunciationTips: { tip: string; explanation: string }[] = content?.pronunciation_tips || [];
  const exercises: any[] = content?.exercises || [];
  const commonMistakes: { mistake: string; correction: string; example: string }[] = content?.common_mistakes || [];
  const resources: { type: string; title: string; url: string; description: string }[] = content?.resources || [];
  const reviewQuestions: { question: string; answer: string }[] = content?.review_questions || [];

  return (
    <div className="container mx-auto px-4 py-6 space-y-6" dir="rtl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
            <BookOpen className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">A1 — الدرس {lesson.number}</h1>
            <p className="text-muted-foreground">{lesson.title} — {lesson.title_en}</p>
          </div>
        </div>
        <Link to="/" className="text-sm text-primary hover:underline">الرجوع</Link>
      </div>

      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">ملخص الدرس</h2>
          <div className="flex gap-2 text-xs">
            {content?.duration && (
              <Badge variant="outline">{content.duration}</Badge>
            )}
            {content?.difficulty && (
              <Badge variant="secondary">{content.difficulty}</Badge>
            )}
          </div>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">{content?.summary || lesson.description}</p>
        
        {content?.detailed_description && (
          <div className="mt-4 p-3 bg-muted/50 rounded-lg">
            <h3 className="font-medium mb-2">وصف مفصل</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{content.detailed_description}</p>
          </div>
        )}
        
        {content?.target_audience && (
          <div className="mt-3 p-3 bg-gradient-to-r from-yellow-500/10 via-red-500/10 to-black/20 border border-yellow-500/30 rounded-lg">
            <h3 className="font-medium mb-1 text-yellow-400">الجمهور المستهدف</h3>
            <p className="text-sm text-yellow-300">{content.target_audience}</p>
          </div>
        )}
        
        {content?.objectives && (
          <div className="mt-4">
            <h3 className="font-medium mb-2">أهداف الدرس</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {content.objectives.map((o: string, i: number) => (
                <div key={i} className="text-sm px-3 py-2 rounded-lg border border-border bg-card/60">
                  {o}
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>

      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">المفردات الأساسية</h2>
          <Badge variant="secondary">
            {vocabularyGroups.reduce((n, g) => n + (g.words?.length || 0), 0)} كلمة
          </Badge>
        </div>
        <div className="space-y-4">
          {vocabularyGroups.map((group, gi) => (
            <div key={gi} className="space-y-2">
              <div className="text-sm font-medium flex items-center gap-2"><Layers className="h-4 w-4" />{group.category}</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {group.words.map((w, i) => (
                  <div key={i} className="p-3 rounded-lg border border-border flex items-start justify-between">
                    <div>
                      <div className="font-semibold text-accent" dir="ltr">{w.de}</div>
                      {w.pron && <div className="text-xs text-muted-foreground" dir="ltr">{w.pron}</div>}
                      <div className="text-sm">{w.ar}</div>
                      {w.usage && <div className="text-xs text-muted-foreground mt-1">{w.usage}</div>}
                    </div>
                    <button
                      className="p-2 rounded hover:bg-accent disabled:opacity-60"
                      aria-label="play pronunciation"
                      disabled={speakingText === w.de}
                      onClick={async () => {
                        try {
                          setSpeakingText(w.de);
                          await speakGerman(w.de);
                        } finally {
                          setSpeakingText((current) => (current === w.de ? null : current));
                        }
                      }}
                    >
                      {speakingText === w.de ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Volume2 className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {phraseGroups.length > 0 && (
        <Card className="p-6 space-y-3">
          <h2 className="text-xl font-semibold">عبارات مفيدة</h2>
          <div className="space-y-4">
            {phraseGroups.map((group, gi) => (
              <div key={gi} className="space-y-2">
                <div className="text-sm font-medium flex items-center gap-2"><MessageSquare className="h-4 w-4" />{group.category}</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {group.items.map((p, i) => (
                    <div key={i} className="p-3 rounded-lg border">
                      <div className="font-semibold" dir="ltr">{p.de}</div>
                      {p.pron && <div className="text-xs text-muted-foreground" dir="ltr">{p.pron}</div>}
                      <div className="text-sm">{p.ar}</div>
                      {p.context && <div className="text-xs text-muted-foreground mt-1">{p.context}</div>}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {dialogues.length > 0 && (
        <Card className="p-6 space-y-3">
          <h2 className="text-xl font-semibold">حوار</h2>
          {dialogues.map((d, i) => (
            <div key={i} className="space-y-2">
              <div className="font-medium flex items-center gap-2">
                {d.title}
                {d.level && <Badge variant="secondary">{d.level}</Badge>}
              </div>
              {d.context && <div className="text-xs text-muted-foreground -mt-1 mb-2 flex items-center gap-1"><Info className="h-3 w-3" />{d.context}</div>}
              <div className="space-y-2">
                {d.lines.map((line, idx) => (
                  <div key={idx} className="p-2 rounded border border-border">
                    <div className="font-medium" dir="ltr">{line.speaker ? `${line.speaker}: ` : ''}{line.de}</div>
                    <div className="text-sm text-muted-foreground">{line.ar}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </Card>
      )}

      {grammar.length > 0 && (
        <Card className="p-6 space-y-3">
          <h2 className="text-xl font-semibold">نقاط القواعد</h2>
          <Accordion type="single" collapsible className="space-y-2">
            {grammar.map((g, i) => (
              <AccordionItem key={i} value={`g-${i}`}>
                <AccordionTrigger className="text-right">{g.topic}</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2">
                    {g.explanation && (
                      <div className="text-sm text-muted-foreground">{g.explanation}</div>
                    )}
                    {g.rules && g.rules.length > 0 && (
                      <ul className="list-disc pr-5 text-sm space-y-1">
                        {g.rules.map((r, j) => (<li key={j}>{r}</li>))}
                      </ul>
                    )}
                    {g.examples && g.examples.length > 0 && (
                      <div className="mt-1 space-y-1">
                        {g.examples.map((ex, j) => (
                          <div key={j} className="text-sm">
                            <span className="font-medium" dir="ltr">{ex.de}</span>
                            <span className="text-muted-foreground"> — {ex.ar}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {g.common_mistakes && g.common_mistakes.length > 0 && (
                      <div className="text-xs text-muted-foreground">أخطاء شائعة: {g.common_mistakes.join('، ')}</div>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Card>
      )}

      {(culturalNotes.length > 0 || pronunciationTips.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {culturalNotes.length > 0 && (
            <Card className="p-6 space-y-3">
              <h2 className="text-xl font-semibold">ملاحظات ثقافية</h2>
              <div className="space-y-2">
                {culturalNotes.map((n, i) => (
                  <div key={i} className="p-3 rounded-lg border">
                    <div className="font-medium">{n.title}</div>
                    <div className="text-sm text-muted-foreground mt-1">{n.content}</div>
                  </div>
                ))}
              </div>
            </Card>
          )}
          {pronunciationTips.length > 0 && (
            <Card className="p-6 space-y-3">
              <h2 className="text-xl font-semibold">نصائح النطق</h2>
              <div className="space-y-2">
                {pronunciationTips.map((t, i) => (
                  <div key={i} className="p-3 rounded-lg border">
                    <div className="font-medium">{t.tip}</div>
                    <div className="text-sm text-muted-foreground mt-1">{t.explanation}</div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
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
        <Card className="p-6 space-y-4">
          <h2 className="text-xl font-semibold">أخطاء شائعة</h2>
          <div className="space-y-3">
            {commonMistakes.map((mistake, i) => (
              <div key={i} className="p-4 border border-red-500/30 rounded-lg bg-gradient-to-r from-red-500/10 to-red-600/10">
                <div className="flex items-start gap-3">
                  <div className="text-red-500 font-bold text-lg">❌</div>
                  <div className="flex-1">
                    <h3 className="font-medium text-red-400 mb-1">{mistake.mistake}</h3>
                    <p className="text-sm text-red-300 mb-2">{mistake.correction}</p>
                    {mistake.example && (
                      <div className="text-xs font-mono bg-red-500/10 border border-red-500/20 p-2 rounded" dir="ltr">
                        {mistake.example}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {resources.length > 0 && (
        <Card className="p-6 space-y-4">
          <h2 className="text-xl font-semibold">موارد إضافية</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {resources.map((resource, i) => (
              <div key={i} className="p-3 border border-border rounded-lg hover:bg-muted/30 transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline">{resource.type}</Badge>
                  <h3 className="font-medium">{resource.title}</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-2">{resource.description}</p>
                <a 
                  href={resource.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline text-sm"
                >
                  زيارة الرابط →
                </a>
              </div>
            ))}
          </div>
        </Card>
      )}

      {reviewQuestions.length > 0 && (
        <Card className="p-6 space-y-4">
          <h2 className="text-xl font-semibold">أسئلة المراجعة</h2>
          <div className="space-y-4">
            {reviewQuestions.map((qa, i) => (
              <div key={i} className="p-4 border border-border rounded-lg">
                <h3 className="font-medium mb-2 text-primary">سؤال {i + 1}:</h3>
                <p className="text-sm mb-3">{qa.question}</p>
                <details className="group">
                  <summary className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground">
                    عرض الإجابة
                  </summary>
                  <div className="mt-2 p-3 bg-muted/50 rounded text-sm">
                    {qa.answer}
                  </div>
                </details>
              </div>
            ))}
          </div>
        </Card>
      )}

    </div>
  );
};

export default A1Lesson;

