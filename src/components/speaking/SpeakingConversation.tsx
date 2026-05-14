import React, { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Info,
  BookOpen,
  CheckCircle2,
  RefreshCw,
  MoreVertical,
  Flag,
  Lightbulb,
  ChevronLeft,
  MessageSquare,
  ArrowUp,
  BarChart2,
  TrendingUp,
  AlertCircle,
  Zap,
  Loader2,
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Message {
  role: 'user' | 'ai';
  text: string;
  timestamp: Date;
}

interface SpeakingConversationProps {
  scenario: {
    id: string;
    topic: string;
    icon: string;
    difficulty: string;
    ai_name: string;
    ai_gender: string;
    description: { de: string; ar: string };
    system_prompt: string;
    user_role: string;
    initial_message: string;
    ending_triggers: string[];
    tips: { de: string; ar: string };
    key_vocab: { de: string[]; ar: string[] };
  };
  onBack: () => void;
  onEnd: () => void;
}

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY as string;
const GROQ_MODEL = "llama-3.3-70b-versatile";
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";



interface FeedbackData {
  overall_score: number;
  level_assessment: string;
  level_assessment_ar: string;
  grammar: { score: number; notes: string; notes_ar: string };
  vocabulary: { score: number; notes: string; notes_ar: string };
  sentence_structure: { score: number; notes: string; notes_ar: string };
  strengths: string[];
  strengths_ar: string[];
  improvements: string[];
  improvements_ar: string[];
  summary: string;
  summary_ar: string;
}

const SpeakingConversation = ({ scenario, onBack, onEnd }: SpeakingConversationProps) => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'ai', text: scenario.initial_message, timestamp: new Date() }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isEnded, setIsEnded] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackData, setFeedbackData] = useState<FeedbackData | null>(null);
  const [isFeedbackLoading, setIsFeedbackLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      const scrollContainer = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages, isLoading]);

  const callAI = async (currentMessages: Message[]) => {
    try {
      const history = currentMessages.map(m => ({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: m.text
      }));

      const response = await fetch(GROQ_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: GROQ_MODEL,
          messages: [
            {
              role: 'system',
              content: `LANGUAGE LEVEL INSTRUCTION (follow strictly):
This conversation is at CEFR level ${scenario.difficulty}. You MUST adapt every reply to match this level exactly:
- A1: Use only the simplest present-tense sentences, basic vocabulary (up to ~500 words), very short replies (1-2 sentences), no subordinate clauses.
- A2: Use present and simple past tense, everyday vocabulary, short sentences, minimal subordinate clauses with "weil" or "dass".
- B1: Use present, past (Perfekt/Präteritum) and future tenses, broader vocabulary, moderate sentence length, some subordinate clauses.
- B2: Use a wide range of tenses and moods (Konjunktiv II), richer vocabulary, natural varied sentence structure, idiomatic expressions.

NEVER use grammar or vocabulary above level ${scenario.difficulty}. Keep your messages natural and appropriate for a ${scenario.difficulty} learner.

${scenario.system_prompt}`,
            },
            ...history
          ],
          temperature: 0.7,
          max_tokens: 1000,
        }),
      });

      if (!response.ok) throw new Error('AI connection failed');
      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error(error);
      return "Entschuldigung, ich habe ein technisches Problem. Können wir das später fortsetzen?";
    }
  };

  const handleSend = async () => {
    if (!inputText.trim() || isLoading || isEnded) return;

    const userText = inputText.trim();
    const newUserMessage: Message = { role: 'user', text: userText, timestamp: new Date() };

    setMessages(prev => [...prev, newUserMessage]);
    setInputText('');
    setIsLoading(true);

    const triggerFound = scenario.ending_triggers.some(trigger =>
      userText.toLowerCase().includes(trigger.toLowerCase())
    );

    if (triggerFound) {
      const aiResponse = await callAI([...messages, newUserMessage]);
      setMessages(prev => [...prev, { role: 'ai', text: aiResponse, timestamp: new Date() }]);
      setIsEnded(true);
      setIsLoading(false);
      toast.success("تم إنهاء المحادثة بنجاح!");
      return;
    }

    const aiResponse = await callAI([...messages, newUserMessage]);
    setMessages(prev => [...prev, { role: 'ai', text: aiResponse, timestamp: new Date() }]);
    setIsLoading(false);
  };

  const requestFeedback = async () => {
    setIsFeedbackLoading(true);
    setShowFeedback(true);
    const userMessages = messages.filter(m => m.role === 'user');
    const conversation = messages.map(m => `${m.role === 'user' ? 'You (student)' : scenario.ai_name}: ${m.text}`).join('\n');
    const prompt = `You are an expert German language teacher giving personalized written feedback to a student.

Scenario: "${scenario.topic}" at level ${scenario.difficulty}.
Your role in the scenario: ${scenario.user_role}

Conversation transcript (this is text-based writing, NOT speaking):
${conversation}

Analyze ONLY the lines starting with "You (student)". Address the student directly using "you" and "your" in all notes and feedback (never say "the student" or "student").
Return a valid JSON object (no markdown, no extra text) with this exact structure:
{
  "overall_score": <number 0-100>,
  "level_assessment": "<one sentence in English: your actual written level vs expected ${scenario.difficulty}>",
  "level_assessment_ar": "<same in Arabic, addressing student directly>",
  "grammar": { "score": <0-100>, "notes": "<English, use 'you'>", "notes_ar": "<Arabic, address student directly>" },
  "vocabulary": { "score": <0-100>, "notes": "<English, use 'you'>", "notes_ar": "<Arabic, address student directly>" },
  "sentence_structure": { "score": <0-100>, "notes": "<English feedback on your sentence construction and variety, use 'you'>", "notes_ar": "<Arabic, address student directly>" },
  "strengths": ["<strength 1 in English using 'you'>", "<strength 2>"],
  "strengths_ar": ["<strength 1 in Arabic>", "<strength 2>"],
  "improvements": ["<area 1 in English using 'you'>", "<area 2>"],
  "improvements_ar": ["<area 1 in Arabic>", "<area 2>"],
  "summary": "<2-3 sentences overall English summary using 'you'>",
  "summary_ar": "<same in Arabic, addressing student directly>"
}`;
    try {
      const response = await fetch(GROQ_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${GROQ_API_KEY}` },
        body: JSON.stringify({ model: GROQ_MODEL, messages: [{ role: 'user', content: prompt }], temperature: 0.3, max_tokens: 1500 }),
      });
      const data = await response.json();
      const raw = data.choices[0].message.content.trim();
      const jsonStart = raw.indexOf('{');
      const jsonEnd = raw.lastIndexOf('}');
      const parsed: FeedbackData = JSON.parse(raw.slice(jsonStart, jsonEnd + 1));
      setFeedbackData(parsed);
    } catch (e) {
      toast.error('تعذّر تحميل التقييم. حاول مرة أخرى.');
      setShowFeedback(false);
    } finally {
      setIsFeedbackLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-background text-xs">

      {/* Header */}
      <div className="bg-card border-b border-border p-2.5 flex items-center justify-between z-20 shrink-0">
        <div className="flex items-center gap-1">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[320px] p-0 border-l border-border/40 overflow-hidden bg-card" dir="rtl">
              {/* Modal Header */}
              <div className="px-5 pt-5 pb-3 border-b border-border/40" dir="rtl">
                <div className="flex items-center justify-start gap-3">
                  <div className="h-9 w-9 rounded-xl bg-muted/30 border border-border/40 flex items-center justify-center shrink-0">
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="text-right">
                    <h2 className="text-base font-semibold text-foreground">دليل الموقف</h2>
                    <p className="text-[10px] text-muted-foreground mt-0.5">كل ما تحتاجه للنجاح في هذه المحادثة</p>
                  </div>
                </div>
              </div>

              <div className="overflow-y-auto max-h-[calc(100vh-80px)] custom-scrollbar divide-y divide-border/30">

                {/* Description Section */}
                <div className="px-5 py-4">
                  <div className="flex items-center justify-end gap-2 mb-3" dir="rtl">
                    <span className="text-[11px] font-medium text-foreground/80">وصف الموقف</span>
                    <MessageSquare className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                  <div className="space-y-2.5">
                    <p className="text-[11px] leading-relaxed text-foreground/90 text-left" dir="ltr">
                      {scenario.description.de}
                    </p>
                    <div className="h-px bg-border/30" />
                    <p className="text-[11px] leading-relaxed text-muted-foreground text-right" dir="rtl">
                      {scenario.description.ar}
                    </p>
                  </div>
                </div>

                {/* Tips Section */}
                <div className="px-5 py-4">
                  <div className="flex items-center justify-end gap-2 mb-3" dir="rtl">
                    <span className="text-[11px] font-medium text-foreground/80">نصيحة ذكية</span>
                    <Lightbulb className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                  <div className="space-y-2.5 bg-muted/20 rounded-lg p-3">
                    <p className="text-[11px] leading-relaxed text-foreground/90 text-left" dir="ltr">
                      {scenario.tips.de}
                    </p>
                    <div className="h-px bg-border/30" />
                    <p className="text-[11px] leading-relaxed text-muted-foreground text-right" dir="rtl">
                      {scenario.tips.ar}
                    </p>
                  </div>
                </div>

                {/* Vocabulary Section — German LEFT, Arabic RIGHT, always LTR layout */}
                <div className="px-5 py-4">
                  <div className="flex items-center justify-end gap-2 mb-3" dir="rtl">
                    <span className="text-[11px] font-medium text-foreground/80">المفردات الأساسية</span>
                    <BookOpen className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>

                  {/* Column Headers — always LTR: Deutsch on left, العربية on right */}
                  <div className="grid grid-cols-2 gap-3 px-1 mb-2" dir="ltr">
                    <span className="text-[9px] font-medium text-primary/70 uppercase tracking-wide text-left">
                      Deutsch
                    </span>
                    <span className="text-[9px] font-medium text-muted-foreground/60 text-right">
                      العربية
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    {scenario.key_vocab.de.map((word, idx) => (
                      <div
                        key={idx}
                        className="grid grid-cols-2 gap-3 px-1 py-1.5 rounded-md hover:bg-muted/20 transition-colors"
                        dir="ltr"
                      >
                        {/* German word — LEFT, accented */}
                        <span className="text-[11px] font-semibold text-primary text-left">
                          {word}
                        </span>
                        {/* Arabic translation — RIGHT */}
                        <span className="text-[11px] text-muted-foreground text-right" dir="rtl">
                          {scenario.key_vocab.ar[idx]}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Ending Triggers Section */}
                <div className="px-5 py-4">
                  <div className="flex items-center justify-end gap-2 mb-3" dir="rtl">
                    <span className="text-[11px] font-medium text-foreground/80">عبارات الإنهاء</span>
                    <Flag className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                  <div className="flex flex-wrap gap-1.5 justify-end">
                    {scenario.ending_triggers.map((trigger, idx) => (
                      <span
                        key={idx}
                        className="text-[9px] bg-primary/10 text-primary px-2.5 py-0.5 rounded-full font-medium"
                        dir="ltr"
                      >
                        {trigger}
                      </span>
                    ))}
                  </div>
                </div>

              </div>
            </SheetContent>
          </Sheet>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="min-w-0">
            <h3 className="font-bold text-xs text-primary" dir='ltr'>{scenario.ai_name}</h3>
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] text-muted-foreground" dir='ltr'>{scenario.topic}</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Button variant="ghost" size="icon" onClick={onBack} className="md:hidden h-8 w-8 rounded-full">
              <ChevronLeft className="h-5 w-5" />
            </Button>

            {/* Profile Icon with Online Dot */}
            <div className="relative shrink-0">
              <div className="h-9 w-9 rounded-full bg-neutral-300/10 flex items-center justify-center text-lg border border-border/50">
                {scenario.icon}
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-green-500 ring-2 ring-background"></span>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-hidden relative bg-background">
        <ScrollArea className="h-full" ref={scrollRef}>
          <div className="p-3 space-y-3 max-w-2xl mx-auto pb-20">
            <div className="flex justify-center mb-4">
              <Badge variant="outline" className="bg-card/90 backdrop-blur-sm text-[9px] text-muted-foreground border-border px-3 py-0.5">
                {scenario.difficulty} • {scenario.ai_name}
              </Badge>
            </div>

            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex flex-col max-w-[85%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <div
                    className={`px-3 py-2 rounded-2xl relative ${msg.role === 'user'
                      ? 'bg-primary text-primary-foreground rounded-tr-none'
                      : 'bg-card border border-border rounded-tl-none shadow-sm'
                      }`}
                  >
                    <p className="text-[11px] sm:text-xs leading-relaxed text-left" dir="ltr">
                      {msg.text}
                    </p>
                    <div className={`flex items-center gap-1 mt-1 opacity-60 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <span className="text-[8px]">
                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {msg.role === 'user' && <CheckCircle2 className="h-2.5 w-2.5" />}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-card border border-border px-3 py-2 rounded-xl rounded-tl-none flex gap-1 shadow-sm">
                  <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                </div>
              </div>
            )}

            {isEnded && (
              <div className="flex justify-center my-6">
                <Card className="bg-card/95 border-yellow-500/20 p-4 text-center max-w-xs w-full">
                  <div className="h-10 w-10 rounded-full bg-yellow-500/10 flex items-center justify-center mx-auto mb-3">
                    <Flag className="h-5 w-5 text-yellow-600" />
                  </div>
                  <h4 className="font-bold text-sm mb-1" dir="rtl">انتهت المهمة</h4>
                  <p className="text-[10px] text-muted-foreground mb-4" dir="rtl">لقد أتممت هذا الموقف بنجاح. أحسنت!</p>
                  <div className="flex flex-col gap-2">
                    <Button
                      onClick={requestFeedback}
                      size="sm"
                      className="w-full rounded-full gap-1.5 h-8 text-xs bg-yellow-500 hover:bg-yellow-500/90 text-white"
                    >
                      <BarChart2 className="h-3.5 w-3.5" />
                      تقييم المحادثة
                    </Button>
                    <Button onClick={onEnd} variant="ghost" size="sm" className="w-full rounded-full gap-1.5 h-8 text-xs" dir="rtl">
                      <RefreshCw className="h-3.5 w-3.5" />
                      العودة للمواقف
                    </Button>
                  </div>
                </Card>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Input Bar */}
      <div className="p-3 bg-card border-t border-border shrink-0">
        <div className="max-w-2xl mx-auto flex items-center gap-2">
          <div className="flex-1">
            <Input
              placeholder={isEnded ? "Die Aufgabe ist beendet" : "Hier auf Deutsch schreiben..."}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              disabled={isLoading || isEnded}
              className="w-full bg-muted/50 border-border rounded-xl h-9 px-4 focus-visible:ring-primary/30 text-xs"
              dir="ltr"
            />
          </div>
          <Button
            onClick={handleSend}
            disabled={!inputText.trim() || isLoading || isEnded}
            size="icon"
            className="h-9 w-9 rounded-full bg-primary hover:bg-primary/90 shrink-0"
          >
            <ArrowUp className="h-4 w-4" />
          </Button>
        </div>
      </div>
      {/* AI Feedback Dialog */}
      <Dialog open={showFeedback} onOpenChange={setShowFeedback}>
        <DialogContent className="max-w-[380px] p-0 overflow-hidden border-border/60" dir="rtl">
          <DialogHeader className="px-5 pt-5 pb-3 border-b border-border/40 bg-card">
            <DialogTitle className="flex items-center justify-end gap-2 text-sm text-foreground">
              تقييم المحادثة
              <div className="h-7 w-7 rounded-lg bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center">
                <BarChart2 className="h-3.5 w-3.5 text-yellow-600" />
              </div>
            </DialogTitle>
            <p className="text-[10px] text-muted-foreground text-right mt-0.5">
              {scenario.topic} • مستوى {scenario.difficulty}
            </p>
          </DialogHeader>

          {isFeedbackLoading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-yellow-500" />
              <p className="text-xs text-muted-foreground" dir="rtl">جاري تحليل محادثتك...</p>
            </div>
          ) : feedbackData ? (
            <ScrollArea className="max-h-[70vh]">
              <div className="divide-y divide-border/30">

                {/* Overall Score */}
                <div className="px-5 py-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-2xl font-bold text-primary">{feedbackData.overall_score}<span className="text-sm text-muted-foreground">/100</span></span>
                    <div className="text-right">
                      <p className="text-[10px] font-semibold text-foreground">التقييم العام</p>
                      <p className="text-[9px] text-muted-foreground">{feedbackData.level_assessment_ar}</p>
                    </div>
                  </div>
                  {/* Score bar */}
                  <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${feedbackData.overall_score}%`, background: feedbackData.overall_score >= 70 ? '#22c55e' : feedbackData.overall_score >= 45 ? '#eab308' : '#ef4444' }}
                    />
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="px-5 py-4 grid grid-cols-3 gap-3">
                  {[
                    { label: 'قواعد', score: feedbackData.grammar.score, icon: <CheckCircle2 className="h-3 w-3" /> },
                    { label: 'مفردات', score: feedbackData.vocabulary.score, icon: <BookOpen className="h-3 w-3" /> },
                    { label: 'بنية الجمل', score: feedbackData.sentence_structure.score, icon: <Zap className="h-3 w-3" /> },
                  ].map(({ label, score, icon }) => (
                    <div key={label} className="flex flex-col items-center gap-1.5 bg-muted/20 rounded-xl p-2.5">
                      <div className={`h-6 w-6 rounded-full flex items-center justify-center ${ score >= 70 ? 'bg-green-500/10 text-green-500' : score >= 45 ? 'bg-yellow-500/10 text-yellow-500' : 'bg-red-500/10 text-red-500' }`}>
                        {icon}
                      </div>
                      <span className="text-base font-bold">{score}</span>
                      <span className="text-[9px] text-muted-foreground">{label}</span>
                    </div>
                  ))}
                </div>

                {/* Detailed Notes */}
                <div className="px-5 py-4 space-y-3">
                  {[
                    { key: 'قواعد اللغة', data: feedbackData.grammar },
                    { key: 'المفردات', data: feedbackData.vocabulary },
                    { key: 'بنية الجمل', data: feedbackData.sentence_structure },
                  ].map(({ key, data }) => (
                    <div key={key}>
                      <p className="text-[10px] font-semibold text-foreground/80 text-right mb-1">{key}</p>
                      <p className="text-[10px] text-muted-foreground text-right leading-relaxed" dir="rtl">{data.notes_ar}</p>
                    </div>
                  ))}
                </div>

                {/* Strengths */}
                <div className="px-5 py-4">
                  <div className="flex items-center justify-end gap-1.5 mb-2">
                    <span className="text-[10px] font-semibold text-green-500">نقاط القوة</span>
                    <TrendingUp className="h-3 w-3 text-green-500" />
                  </div>
                  <ul className="space-y-1">
                    {feedbackData.strengths_ar.map((s, i) => (
                      <li key={i} className="flex items-start justify-end gap-1.5 text-[10px] text-muted-foreground" dir="rtl">
                        <span>{s}</span>
                        <span className="mt-0.5 shrink-0 h-1.5 w-1.5 rounded-full bg-green-500" />
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Improvements */}
                <div className="px-5 py-4">
                  <div className="flex items-center justify-end gap-1.5 mb-2">
                    <span className="text-[10px] font-semibold text-yellow-600">نقاط للتحسين</span>
                    <AlertCircle className="h-3 w-3 text-yellow-600" />
                  </div>
                  <ul className="space-y-1">
                    {feedbackData.improvements_ar.map((s, i) => (
                      <li key={i} className="flex items-start justify-end gap-1.5 text-[10px] text-muted-foreground" dir="rtl">
                        <span>{s}</span>
                        <span className="mt-0.5 shrink-0 h-1.5 w-1.5 rounded-full bg-yellow-500" />
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Summary */}
                <div className="px-5 py-4">
                  <p className="text-[10px] font-semibold text-foreground/70 text-right mb-1.5">ملخص عام</p>
                  <p className="text-[10px] text-muted-foreground leading-relaxed text-right" dir="rtl">{feedbackData.summary_ar}</p>
                </div>

                {/* Actions */}
                <div className="px-5 py-4 flex gap-2">
                  <Button onClick={onEnd} size="sm" className="flex-1 h-8 rounded-full text-xs bg-primary" dir="rtl">
                    <RefreshCw className="h-3 w-3 ml-1" />
                    موقف جديد
                  </Button>
                  <Button onClick={() => setShowFeedback(false)} variant="ghost" size="sm" className="flex-1 h-8 rounded-full text-xs" dir="rtl">
                    إغلاق
                  </Button>
                </div>

              </div>
            </ScrollArea>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SpeakingConversation;