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
        <h2 className="text-xl font-semibold">ملخص الدرس</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">{content?.summary || lesson.description}</p>
        {content?.objectives && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
            {content.objectives.map((o: string, i: number) => (
              <div key={i} className="text-sm px-3 py-2 rounded-lg border border-border bg-card/60">
                {o}
              </div>
            ))}
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
        <Card className="p-6 space-y-3">
          <h2 className="text-xl font-semibold">تمارين سريعة</h2>
          {exercises.map((ex, i) => (
            <div key={i} className="space-y-2">
              <div className="font-medium">{ex.title}</div>
              {ex.type === 'match' || ex.type === 'matching' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  {ex.pairs?.map((p: any, j: number) => (
                    <div key={j} className="p-2 rounded border border-border flex items-center justify-between">
                      <span dir="ltr">{p.left}</span>
                      <span className="text-muted-foreground">{p.right}</span>
                    </div>
                  ))}
                </div>
              ) : ex.type === 'fill_blanks' ? (
                <div className="space-y-2">
                  {ex.dialogue?.map((d: any, j: number) => (
                    <div key={j} className="p-2 rounded border border-border text-sm" dir="ltr">{d.text}</div>
                  ))}
                  {ex.options && (
                    <div className="flex flex-wrap gap-2 text-xs">
                      {ex.options.map((op: string, k: number) => (
                        <span key={k} className="px-2 py-1 rounded border bg-card/60" dir="ltr">{op}</span>
                      ))}
                    </div>
                  )}
                </div>
              ) : ex.type === 'role_play' ? (
                <ul className="list-disc pr-5 text-sm space-y-1">
                  {ex.scenarios?.map((s: string, j: number) => (<li key={j}>{s}</li>))}
                </ul>
              ) : null}
            </div>
          ))}
        </Card>
      )}
    </div>
  );
};

export default A1Lesson;

