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
  ChevronRight,
  ChevronDown,
  MessageSquare,
  ArrowUp,
  BarChart2,
  TrendingUp,
  AlertCircle,
  Zap,
  Loader2,
  Phone,
  Mic,
  MicOff,
  PhoneOff,
  Volume2,
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

interface MenuItem {
  name: string;
  description?: string;
  price: string;
}

interface MenuCategory {
  name: string;
  items: MenuItem[];
}

interface VisualMenu {
  title: string;
  icon: string;
  categories: MenuCategory[];
}

interface ReceiptItem {
  name: string;
  price: string;
}

interface ReceiptData {
  items: ReceiptItem[];
  total: string;
}

interface Message {
  role: 'user' | 'ai';
  text: string;
  timestamp: Date;
  showMenu?: boolean;
  receiptData?: ReceiptData;
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
    scenario_context?: string;
    user_role: string;
    initial_message: string;
    ending_triggers: string[];
    tips: { de: string; ar: string };
    visual_menu?: VisualMenu;
    key_vocab: { de: string[]; ar: string[] };
  };
  onBack: () => void;
  onEnd: () => void;
}

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY as string;
const GROQ_MODEL = "openai/gpt-oss-120b";
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";



interface FeedbackData {
  overall_score: number;
  level_assessment: string;
  level_assessment_ar: string;
  grammar: { score: number; notes: string; notes_ar: string };
  vocabulary: { score: number; notes: string; notes_ar: string };
  sentence_structure: { score: number; notes: string; notes_ar: string };
  strengths_ar: string[];
  improvements: string[];
  improvements_ar: string[];
  specific_corrections: { original: string; correction: string; explanation: string; explanation_ar: string; }[];
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

  // Call Mode States
  const [isCallActive, setIsCallActive] = useState(false);
  const [showCallOverlay, setShowCallOverlay] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isUserSpeaking, setIsUserSpeaking] = useState(false);
  const [waveHeights, setWaveHeights] = useState<number[]>([20, 35, 50, 80, 60, 90, 70, 45, 30, 25, 40, 60]);

  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const isCallActiveRef = useRef(false);
  const isLoadingRef = useRef(false);
  const isSpeakingRef = useRef(false);
  const isEndedRef = useRef(false);
  const messagesRef = useRef<Message[]>(messages);
  const sendUserMessageRef = useRef<any>(null);
  const speakingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    isCallActiveRef.current = isCallActive;
  }, [isCallActive]);

  useEffect(() => {
    isLoadingRef.current = isLoading;
  }, [isLoading]);

  useEffect(() => {
    isEndedRef.current = isEnded;
  }, [isEnded]);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    sendUserMessageRef.current = sendUserMessage;
  });

  // Animated voice waves simulation
  useEffect(() => {
    if (!isRecording) {
      setWaveHeights(Array(12).fill(6));
      return;
    }
    if (!isUserSpeaking) {
      const interval = setInterval(() => {
        setWaveHeights(prev => prev.map(() => Math.floor(Math.random() * 15) + 8));
      }, 400);
      return () => clearInterval(interval);
    } else {
      const interval = setInterval(() => {
        setWaveHeights(prev => prev.map((_, i) => {
          const min = i > 3 && i < 8 ? 50 : 20;
          const max = i > 3 && i < 8 ? 100 : 70;
          return Math.floor(Math.random() * (max - min + 1)) + min;
        }));
      }, 120);
      return () => clearInterval(interval);
    }
  }, [isRecording, isUserSpeaking]);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.lang = 'de-DE';
      recognition.continuous = false;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsRecording(true);
      };

      recognition.onsoundstart = () => {
        setIsUserSpeaking(true);
      };

      recognition.onsoundend = () => {
        setIsUserSpeaking(false);
      };

      recognition.onresult = (event: any) => {
        let finalTranscript = '';
        let interimTranscript = '';

        setIsUserSpeaking(true);
        if (speakingTimeoutRef.current) clearTimeout(speakingTimeoutRef.current);
        speakingTimeoutRef.current = setTimeout(() => setIsUserSpeaking(false), 800);

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        if (interimTranscript.trim()) {
          setIsTranscribing(true);
        }

        if (finalTranscript.trim()) {
          setIsTranscribing(false);
          if (sendUserMessageRef.current) {
            sendUserMessageRef.current(finalTranscript.trim());
          }
        }
      };

      recognition.onend = () => {
        setIsRecording(false);
        setIsUserSpeaking(false);
        setIsTranscribing(false);
        if (isCallActiveRef.current && !isLoadingRef.current && !isSpeakingRef.current) {
          try {
            recognitionRef.current.start();
          } catch (e) {}
        }
      };

      recognition.onerror = (e: any) => {
        console.error("Speech recognition error:", e.error);
        setIsRecording(false);
        setIsUserSpeaking(false);
        setIsTranscribing(false);
        if (e.error === 'no-speech') {
          if (isCallActiveRef.current && !isLoadingRef.current && !isSpeakingRef.current) {
            try { recognitionRef.current.start(); } catch (err) { }
          }
        } else if (e.error === 'not-allowed') {
          toast.error("Mikrofonzugriff verweigert!");
        }
      };

      recognitionRef.current = recognition;
    }
  }, []);

  useEffect(() => {
    if (!isCallActive) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      isSpeakingRef.current = false;
      setIsUserSpeaking(false);
      setIsTranscribing(false);
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) { }
      }
    } else {
      const currentMessages = messagesRef.current;
      const lastAiMsg = currentMessages.slice().reverse().find(m => m.role === 'ai');
      if (lastAiMsg) {
        speakText(lastAiMsg.text);
      }
    }
  }, [isCallActive]);

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

STRICT CONVERSATION RULES:
1. Stay STRICTLY on the topic of the scenario: "${scenario.topic}".
2. Do not answer questions or discuss anything outside of this topic. If the user goes off-topic, politely bring them back to the scenario in German.
3. Act your role in a REAL-WORLD physical setting (e.g., at a clinic, a restaurant). Do NOT act like an AI or an online chat. Simulate a real, face-to-face human interaction.
4. PACE THE CONVERSATION LOGICALLY AND STEP-BY-STEP. You MUST guide the flow naturally. For example: if it's a clinic, ask about symptoms BEFORE scheduling the appointment. If it's a restaurant, ask about drinks BEFORE food.
5. Ask ONLY ONE short question at a time and WAIT for the user to answer. Do NOT rush to the conclusion. Keep responses very concise (1-2 sentences).

${scenario.system_prompt}${scenario.scenario_context ? `\n\nSCENARIO CONTEXT (Use this information if the user asks for details like a menu, prices, places, etc.):\n${scenario.scenario_context}` : ""}`,
            },
            ...history
          ],
          temperature: 0.7,
          max_tokens: 1000,
        }),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Groq API ${response.status}: ${errorBody}`);
      }
      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error(error);
      return "Entschuldigung, ich habe ein technisches Problem. Können wir das später fortsetzen?";
    }
  };

  const speakText = (text: string) => {
    window.speechSynthesis.cancel();

    const cleanText = text.replace(/\[.*?\]/g, '').trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'de-DE';
    utterance.rate = 0.95;

    const voices = window.speechSynthesis.getVoices();
    const germanVoices = voices.filter(v => v.lang.startsWith('de'));

    if (germanVoices.length > 0) {
      let selectedVoice = germanVoices.find(v => v.name.includes('Premium') || v.name.includes('Google'));

      if (!selectedVoice) {
        selectedVoice = germanVoices.find(v => v.name.includes('Hedda') || v.name.includes('Katja'));
      }

      if (scenario.ai_gender === 'male') {
        const maleVoice = germanVoices.find(v => v.name.includes('Stefan') || v.name.includes('Conrad') || v.name.includes('Klaus'));
        if (maleVoice) selectedVoice = maleVoice;
      }

      if (selectedVoice) {
        utterance.voice = selectedVoice;
      } else {
        utterance.voice = germanVoices[0];
      }
    }

    utterance.onstart = () => {
      setIsSpeaking(true);
      isSpeakingRef.current = true;
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) { }
      }
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      isSpeakingRef.current = false;
      if (isCallActiveRef.current && recognitionRef.current && !isLoadingRef.current) {
        try { recognitionRef.current.start(); } catch (e) { }
      }
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      isSpeakingRef.current = false;
      if (isCallActiveRef.current && recognitionRef.current && !isLoadingRef.current) {
        try { recognitionRef.current.start(); } catch (e) { }
      }
    };

    window.speechSynthesis.speak(utterance);
  };

  const toggleRecording = () => {
    if (isRecording) {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) { }
      }
      setIsRecording(false);
    } else {
      if (isSpeaking) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
        isSpeakingRef.current = false;
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
          setIsRecording(true);
        } catch (e) {
          toast.error("Mikrofon konnte nicht gestartet werden");
        }
      } else {
        toast.error("Spracherkennung wird in diesem Browser nicht unterstützt.");
      }
    }
  };

  const sendUserMessage = async (userText: string) => {
    if (!userText.trim() || isLoadingRef.current || isEndedRef.current) return;

    isLoadingRef.current = true;
    setIsLoading(true);

    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) {}
    }

    const currentMessages = messagesRef.current;
    const newUserMessage: Message = { role: 'user', text: userText, timestamp: new Date() };

    setMessages(prev => [...prev, newUserMessage]);
    setInputText('');

    const triggerFound = scenario.ending_triggers.some(trigger =>
      userText.toLowerCase().includes(trigger.toLowerCase())
    );

    let aiResponse = await callAI([...currentMessages, newUserMessage]);

    let showMenu = false;
    if (aiResponse.includes('[SHOW_MENU]')) {
      showMenu = true;
      aiResponse = aiResponse.replace(/\[SHOW_MENU\]/g, '').trim();
      setShowCallOverlay(false);
    }

    let receiptData: ReceiptData | undefined = undefined;
    const receiptMatch = aiResponse.match(/\[RECEIPT\]([\s\S]*?)\[\/RECEIPT\]/);
    if (receiptMatch) {
      try {
        receiptData = JSON.parse(receiptMatch[1].trim());
        aiResponse = aiResponse.replace(receiptMatch[0], '').trim();
        setShowCallOverlay(false);
      } catch (e) {
        console.error("Failed to parse receipt JSON", e);
      }
    }

    setMessages(prev => [...prev, { role: 'ai', text: aiResponse, timestamp: new Date(), showMenu, receiptData }]);
    setIsLoading(false);
    isLoadingRef.current = false;

    if (isCallActiveRef.current) {
      speakText(aiResponse);
    }

    if (triggerFound) {
      setIsEnded(true);
      setIsCallActive(false);
      setShowCallOverlay(false);
      toast.success("تم إنهاء المحادثة بنجاح!");
    }
  };

  const handleSend = () => sendUserMessage(inputText);

  const requestFeedback = async () => {
    setIsFeedbackLoading(true);
    setShowFeedback(true);
    const userMessages = messages.filter(m => m.role === 'user');
    const conversation = messages.map(m => `${m.role === 'user' ? 'You (student)' : scenario.ai_name}: ${m.text}`).join('\n');
    const prompt = `You are an elite, highly rigorous German language university professor evaluating a student's conversation in scenario "${scenario.topic}" (CEFR level ${scenario.difficulty}).
Scenario Context: ${scenario.topic} - Student plays role: ${scenario.user_role}.

Conversation Transcript:
${conversation}

EXPERT EVALUATION & CORRECTION DIRECTIVES:
1. Address the student directly as "you" in English and "أنت" in Arabic. Only evaluate lines spoken by "You (student)".
2. CRITICAL LANGUAGE RESTRAINT (STRICT MANDATE):
   All Arabic fields (especially explanation_ar, notes_ar, summary_ar, improvements_ar) MUST be written in 100% pure, flawless, professional Modern Standard Arabic (الفصحى). NEVER output Chinese characters, strange symbols, or broken machine translation. Use precise Arabic pedagogical terminology for German grammar (e.g., حالة النصب الأكوزاتيف, حالة الجر الداتيف, الموقع الثاني للفعل V2, ترتيب الظروف والمفعول به).
3. RIGOROUS & DEEP CORRECTIONS:
   Identify every single mistake in grammar (cases, noun gender, verb conjugations), word order, prepositions, or unnatural phrasing.
   For each mistake, add an entry to "specific_corrections" with:
   - "original": the exact incorrect snippet.
   - "correction": the flawless, idiomatic, natural German phrasing for that real-world situation.
   - "explanation": a concise English summary of the rule.
   - "explanation_ar": a DEEP, EXPERT pedagogical explanation in flawless Arabic. Do not give shallow or generic reasons. Explain the exact German grammatical rule or syntactic principle in detail. For example, if correcting word order (like placing 'bitte' before 'mit Karte'), explain German adverbial and prepositional object placement. If correcting a case or gender, explain the governing verb or preposition and the exact declension rule. Give the student clear understanding of *why* the correction is correct and how to avoid the mistake in the future. Wrap all German words or grammar terminology inside double asterisks like **mit Karte** or **Akkusativ**.

Return ONLY a valid JSON object matching this exact structure (no markdown formatting, no extra text outside the JSON):
{
  "overall_score": <number 0-100>,
  "level_assessment": "<English level assessment vs ${scenario.difficulty}>",
  "level_assessment_ar": "<same in fluent Arabic, addressing student directly>",
  "grammar": { "score": <number 0-100>, "notes": "<Specific English notes on grammar>", "notes_ar": "<Specific Arabic notes explaining their grammar mistakes precisely>" },
  "vocabulary": { "score": <number 0-100>, "notes": "<Specific English notes on vocabulary>", "notes_ar": "<Specific Arabic notes on vocabulary choice>" },
  "sentence_structure": { "score": <number 0-100>, "notes": "<Specific English notes on sentence structure>", "notes_ar": "<Specific Arabic notes on sentence structure and word order>" },
  "strengths_ar": ["<strength 1 in Arabic>", "<strength 2 in Arabic>"],
  "improvements": ["<improvement 1 in English>", "<improvement 2>"],
  "improvements_ar": ["<improvement 1 in Arabic explaining exactly what rule to practice>", "<improvement 2>"],
  "specific_corrections": [
    {
      "original": "<exact incorrect phrase>",
      "correction": "<flawless, natural native German phrasing>",
      "explanation": "<short English explanation>",
      "explanation_ar": "<DEEP, thorough pedagogical explanation in flawless Arabic wrapping German words in **asterisks**>"
    }
  ],
  "summary": "<Overall summary in English>",
  "summary_ar": "<Overall summary in Arabic>"
}`;
    try {
      const response = await fetch(GROQ_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${GROQ_API_KEY}` },
        body: JSON.stringify({ model: GROQ_MODEL, messages: [{ role: 'user', content: prompt }], temperature: 0.2, max_tokens: 2500 }),
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
    <div className="flex flex-col h-full bg-background text-xs relative overflow-hidden">

      {/* Call Mode Overlay */}
      {showCallOverlay && isCallActive && (
        <div className="absolute inset-0 z-50 bg-[#0a0c10] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(34,197,94,0.15),rgba(255,255,255,0))] flex flex-col items-center justify-between p-6 overflow-hidden animate-in fade-in zoom-in-95 duration-300">
          {/* Header */}
          <div className="w-full flex justify-between items-center text-neutral-300 mt-2 z-10">
            <Button variant="ghost" size="icon" onClick={() => setShowCallOverlay(false)} className="hover:bg-white/10 rounded-full h-11 w-11 text-neutral-400 hover:text-white transition-colors">
              <ChevronDown className="h-6 w-6" />
            </Button>
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-base font-bold text-white tracking-wide" dir="ltr">{scenario.ai_name}</span>
              </div>
              <span className={`text-xs mt-1 px-2.5 py-0.5 rounded-full font-medium border ${isSpeaking ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : isTranscribing || isLoading ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : isRecording ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-neutral-800 text-neutral-400 border-neutral-700'}`}>
                {isSpeaking ? "Spricht gerade..." : isLoading ? "Denkt nach..." : isTranscribing ? "Verarbeitet..." : isRecording ? "Hört zu..." : "Verbunden"}
              </span>
            </div>
            <div className="w-11"></div>
          </div>

          {/* Center Avatar & Visualizer */}
          <div className="flex-1 flex flex-col items-center justify-center relative w-full my-6 max-w-md mx-auto z-10">
            {/* Glowing Avatar */}
            <div className={`relative flex items-center justify-center w-40 h-40 rounded-full bg-neutral-900 border-2 transition-all duration-500 ${isSpeaking ? 'scale-110 shadow-[0_0_60px_rgba(52,211,153,0.4)] border-emerald-500' : isLoading ? 'border-amber-500/60 shadow-[0_0_40px_rgba(245,158,11,0.3)] animate-pulse' : 'border-neutral-700 shadow-xl'}`}>
              <span className="text-7xl select-none">{scenario.icon}</span>

              {/* Pulsing aura rings when AI is speaking */}
              {isSpeaking && (
                <>
                  <span className="absolute inset-0 rounded-full border border-emerald-500/40 animate-ping [animation-duration:2.5s]"></span>
                  <span className="absolute inset-[-24px] rounded-full border border-emerald-500/20 animate-ping [animation-duration:3s] [animation-delay:0.5s]"></span>
                </>
              )}
              {/* Spinner border when AI is thinking */}
              {isLoading && (
                <div className="absolute inset-[-6px] rounded-full border-2 border-transparent border-t-amber-500 animate-spin"></div>
              )}
            </div>

            {/* AI Text Speech / Transcript Subtitle Box */}
            <div className="mt-10 w-full min-h-[80px] flex items-center justify-center px-6">
              {isLoading ? (
                <div className="flex gap-2 items-center bg-neutral-900/60 border border-neutral-800 px-5 py-3 rounded-2xl backdrop-blur-sm">
                  <span className="w-2.5 h-2.5 bg-amber-500 rounded-full animate-bounce"></span>
                  <span className="w-2.5 h-2.5 bg-amber-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-2.5 h-2.5 bg-amber-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                </div>
              ) : messages[messages.length - 1]?.role === 'ai' ? (
                <div className="bg-neutral-900/40 border border-neutral-800/80 p-4 rounded-2xl backdrop-blur-md max-w-sm text-center shadow-lg transition-all duration-300">
                  <p className="text-sm md:text-base text-neutral-200 leading-relaxed font-medium line-clamp-3" dir="ltr">
                    "{messages[messages.length - 1].text.replace(/\[.*?\]/g, '')}"
                  </p>
                </div>
              ) : (
                <p className="text-xs text-neutral-500 italic">Sprechen Sie jetzt, ich höre zu...</p>
              )}
            </div>
          </div>

          {/* Controls & User Voice Waves Dock */}
          <div className="w-full max-w-md mx-auto flex flex-col items-center gap-6 pb-6 z-10">
            {/* Dynamic Voice Waves */}
            <div className="flex items-center justify-center gap-1.5 h-16 px-6 py-2 bg-neutral-900/80 backdrop-blur-xl rounded-2xl border border-neutral-800 shadow-2xl w-64">
              {waveHeights.map((h, i) => (
                <div
                  key={i}
                  className={`w-1 rounded-full transition-all duration-150 ${isUserSpeaking ? 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]' : isRecording ? 'bg-emerald-500/40' : 'bg-neutral-700'}`}
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>

            {/* Action Buttons */}
            <div className="w-full flex items-center justify-center gap-8">
              {/* Text Chat Toggle */}
              <Button
                size="icon"
                variant="ghost"
                className="h-14 w-14 rounded-full bg-neutral-900/80 border border-neutral-800 hover:bg-neutral-800 text-neutral-300 hover:text-white transition-all shadow-lg"
                onClick={() => setShowCallOverlay(false)}
                title="Zum Text-Chat wechseln"
              >
                <MessageSquare className="h-6 w-6" />
              </Button>

              {/* Mic Toggle Button */}
              <Button
                size="icon"
                className={`h-20 w-20 rounded-full shadow-2xl transition-all border-4 ${isRecording ? 'bg-emerald-600 hover:bg-emerald-500 border-emerald-400/40 shadow-[0_0_30px_rgba(16,185,129,0.3)]' : 'bg-neutral-800 hover:bg-neutral-700 border-neutral-700 text-neutral-400'}`}
                onClick={toggleRecording}
                title={isRecording ? "Mikrofon stummschalten" : "Mikrofon aktivieren"}
              >
                {isRecording ? (
                  <Mic className="h-8 w-8 text-white animate-pulse" />
                ) : (
                  <MicOff className="h-8 w-8 text-neutral-400" />
                )}
              </Button>

              {/* End Call Button */}
              <Button
                size="icon"
                className="h-14 w-14 rounded-full bg-red-600 hover:bg-red-700 border border-red-500 text-white transition-all shadow-[0_0_20px_rgba(220,38,38,0.4)] hover:scale-105"
                onClick={() => {
                  setIsCallActive(false);
                  setShowCallOverlay(false);
                  toast.info("Anruf beendet");
                }}
                title="Anruf beenden"
              >
                <PhoneOff className="h-6 w-6" />
              </Button>
            </div>

            <div className="text-[11px] text-neutral-400 font-medium tracking-wide">
              {isRecording ? 'Mikrofon aktiv • Sprechen Sie jetzt' : 'Mikrofon stummgeschaltet'}
            </div>
          </div>
        </div>
      )}

      {/* Active Call Banner (when overlay is minimized) */}
      {isCallActive && !showCallOverlay && (
        <div className="bg-emerald-600 w-full text-white px-4 py-2.5 flex items-center justify-between z-30 shrink-0 shadow-lg">
          <div onClick={() => setShowCallOverlay(true)} className="flex items-center gap-2.5 cursor-pointer flex-1 py-0.5">
            <div className="h-2 w-2 rounded-full bg-white animate-pulse"></div>
            <Phone className="h-4 w-4 animate-bounce" />
            <span className="font-semibold text-xs tracking-wide">Anruf mit {scenario.ai_name} läuft... Tippen zum Öffnen</span>
          </div>
          <Button
            size="sm"
            onClick={() => {
              setIsCallActive(false);
              setShowCallOverlay(false);
              toast.info("Anruf beendet");
            }}
            className="h-7 px-3 rounded-full bg-red-600 border border-red-500 text-white hover:bg-red-700 transition-all font-bold text-xs shadow-md flex items-center gap-1.5"
          >
            <PhoneOff className="h-3.5 w-3.5" />
            <span>Beenden</span>
          </Button>
        </div>
      )}

      {/* Header */}
      <div className="bg-card border-b border-border p-2.5 flex items-center justify-between z-20 shrink-0">
        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="h-8 w-8 rounded-full md:hidden"  // ← hides on medium screens and up
          >
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </Button>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full h-8 w-8">
                <MoreVertical className="h-4 w-4 text-muted-foreground" />
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

          {isCallActive ? (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setIsCallActive(false);
                setShowCallOverlay(false);
                toast.info("Anruf beendet");
              }}
              className="h-8 w-8 rounded-full text-red-500 bg-red-500/10 hover:bg-red-500/20 transition-colors"
              title="Anruf beenden"
            >
              <PhoneOff className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setIsCallActive(true);
                setShowCallOverlay(true);
              }}
              className="h-8 w-8 rounded-full text-emerald-600 bg-emerald-500/10 hover:bg-emerald-500/20 transition-colors"
              title="Anruf starten"
            >
              <Phone className="h-4 w-4" />
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2.5">
          <div className="min-w-0 text-right">
            <h3 className="font-bold text-xs text-primary" dir='ltr'>{scenario.ai_name}</h3>
            <div className="flex items-center gap-1.5 justify-end">
              <span className="text-[9px] text-muted-foreground" dir='ltr'>{scenario.topic}</span>
            </div>

          </div>

          <div className="flex items-center gap-2.5">

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

                  {/* Visual Menu Component */}
                  {msg.showMenu && scenario.visual_menu && (
                    <div className="mt-2 w-full max-w-[280px] sm:max-w-[340px]">
                      <div className="bg-card border border-border/50 rounded-xl shadow-lg overflow-hidden flex flex-col">
                        {/* Minimalist Header */}
                        <div className="py-5 flex flex-col items-center justify-center border-b border-border/30 bg-muted/20">
                          <span className="text-xl mb-1 opacity-80">{scenario.visual_menu.icon}</span>
                          <h4 className="font-serif text-lg font-medium tracking-[0.15em] text-foreground uppercase">
                            {scenario.visual_menu.title}
                          </h4>
                          <div className="w-8 h-px bg-primary/40 mt-2"></div>
                        </div>

                        <div className="p-5 space-y-6 bg-card/50">
                          {scenario.visual_menu.categories.map((category, idx) => (
                            <div key={idx}>
                              <h5 className="font-serif text-[11px] tracking-[0.1em] text-muted-foreground uppercase mb-3 text-center">
                                {category.name}
                              </h5>
                              <ul className="space-y-2.5">
                                {category.items.map((item, itemIdx) => (
                                  <li key={itemIdx} className="flex justify-between items-baseline group">
                                    <span className="text-[12px] text-foreground font-medium group-hover:text-primary transition-colors">
                                      {item.name}
                                      {item.description && <span className="block text-[9px] text-muted-foreground font-normal mt-0.5">{item.description}</span>}
                                    </span>
                                    <div className="flex-1 mx-3 border-b border-dotted border-muted-foreground/30"></div>
                                    <span className="text-[12px] text-foreground/80 font-mono">{item.price}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Receipt Component */}
                  {msg.receiptData && (
                    <div className="mt-3 w-full max-w-[280px] sm:max-w-[320px]">
                      <div className="bg-[#1a1a1a] rounded-lg border border-[#2a2a2a] p-4 shadow-lg">
                        {/* Header */}
                        <div className="text-center mb-5 pb-3 border-b border-[#2a2a2a]">
                          <h4 className="font-bold text-sm uppercase tracking-wider text-gray-100">
                            RECHNUNG
                          </h4>
                          <p className="text-[10px] text-gray-500 mt-1">
                            Vielen Dank für Ihren Besuch!
                          </p>
                        </div>

                        {/* Items */}
                        <div className="space-y-2 mb-5">
                          {msg.receiptData.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between text-xs text-gray-300">
                              <span className="flex-1">{item.name}</span>
                              <span className="font-mono">{item.price}€</span>
                            </div>
                          ))}
                        </div>

                        {/* Total */}
                        <div className="flex justify-between items-center pt-3 border-t border-[#2a2a2a]">
                          <span className="text-xs font-bold uppercase text-gray-200">Gesamt</span>
                          <span className="text-sm font-bold font-mono text-emerald-500">{msg.receiptData.total}€</span>
                        </div>

                        {/* Footer */}
                        <div className="text-center mt-4 pt-2 text-[9px] text-gray-600">
                          <p>inkl. MwSt.</p>
                          <p className="mt-0.5">
                            {msg.timestamp.toLocaleDateString('de-DE')} • {msg.timestamp.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
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
                      <div className={`h-6 w-6 rounded-full flex items-center justify-center ${score >= 70 ? 'bg-green-500/10 text-green-500' : score >= 45 ? 'bg-yellow-500/10 text-yellow-500' : 'bg-red-500/10 text-red-500'}`}>
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

                {/* Specific Corrections */}
                {feedbackData.specific_corrections && feedbackData.specific_corrections.length > 0 && (
                  <div className="px-5 py-4">
                    <div className="flex items-center justify-end gap-1.5 mb-3">
                      <span className="text-[10px] font-semibold text-red-500">أخطاء وتصحيحها</span>
                      <RefreshCw className="h-3 w-3 text-red-500" />
                    </div>
                    <div className="space-y-2.5">
                      {feedbackData.specific_corrections.map((corr, i) => (
                        <div key={i} className="bg-neutral-500/5 rounded-xl p-3 border border-neutral-500/10 flex flex-col gap-2">
                          <div className="flex flex-col gap-1 text-left" dir="ltr">
                            <div className="text-[10px] text-red-400/80 line-through decoration-red-500/50">{corr.original}</div>
                            <div className="text-[12px] font-semibold text-green-500">{corr.correction}</div>
                          </div>
                          <p className="text-[9.5px] text-muted-foreground leading-relaxed text-right border-t border-red-500/10 pt-2" dir="rtl">
                            {corr.explanation_ar.split(/\*\*(.*?)\*\*/g).map((part, pIdx) => {
                              if (pIdx % 2 === 1) {
                                return (
                                  <span key={pIdx} className="text-blue-400 font-semibold font-mono text-[10.5px] mx-1" dir="ltr">
                                    {part}
                                  </span>
                                );
                              }
                              return <span key={pIdx}>{part}</span>;
                            })}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

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