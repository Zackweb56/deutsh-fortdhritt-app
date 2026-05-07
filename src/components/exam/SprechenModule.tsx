import React, { useState, useEffect, useRef } from 'react';
import { useExamStore } from '@/hooks/useExamStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  ArrowRight, 
  MessageSquare, 
  Presentation, 
  Users, 
  Check,
  ChevronRight,
  ChevronLeft,
  Info,
  PenTool,
  Mic,
  Volume2,
  Loader2,
  StopCircle,
  BrainCircuit,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getPartnerResponse, evaluateSpeakingExam, EvaluationResult, SprechenContext, SprechenPhase } from '@/lib/ai/groq';

// Phase type matches AI phases exactly
type ExamPhase =
  | 'intro'
  | 'thema_waehlen'
  | 'vorbereitung'
  | 'teil1'          // uses teil1_opening → teil1_negotiation → teil1_closing
  | 'teil2_present'  // silent — no AI
  | 'teil2_done'     // uses teil2_reaction
  | 'teil3_feedback' // uses teil3_feedback
  | 'teil3_question' // uses teil3_question
  | 'teil3_pruefer'  // uses teil3_pruefer
  | 'abschluss';

type Teil1Step = 'opening' | 'negotiation' | 'closing';

// TTS — speak AI response
const speakText = (text: string) => {
  if (!window.speechSynthesis) return
  window.speechSynthesis.cancel()
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = 'de-DE'
  utterance.rate = 0.9  // slightly slower for B1 learners
  utterance.pitch = 1.0
  // Try to get a German voice
  const voices = window.speechSynthesis.getVoices()
  const germanVoice = voices.find(v => v.lang === 'de-DE') ?? voices.find(v => v.lang.startsWith('de'))
  if (germanVoice) utterance.voice = germanVoice
  window.speechSynthesis.speak(utterance)
}

// STT — disable mic during AI typing or wrong phases
const isMicAllowed = (phase: ExamPhase): boolean => {
  if (phase === 'teil2_present') return false
  if (['intro', 'thema_waehlen', 'vorbereitung', 'abschluss'].includes(phase)) return false
  return true
}

const MessageBubble = ({ 
  message, 
  role, 
  examPhase 
}: { 
  message: string
  role: 'user' | 'ai'
  examPhase: ExamPhase 
}) => {
  const aiLabel = examPhase === 'teil3_pruefer' ? '🎓 Prüfer' : '👤 Kandidat B'
  const aiColor = examPhase === 'teil3_pruefer' ? 'border-purple-500/30 bg-purple-500/5' : 'border-white/10 bg-white/5'
  
  if (role === 'user') {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] bg-[#ffcc00]/10 border border-[#ffcc00]/30 rounded-2xl rounded-tr-sm px-4 py-3">
          <p className="text-[9px] font-black text-[#ffcc00]/60 uppercase tracking-widest mb-1">Sie</p>
          <p className="text-white text-sm leading-relaxed">{message}</p>
        </div>
      </div>
    )
  }
  
  return (
    <div className="flex justify-start">
      <div className={cn("max-w-[80%] border rounded-2xl rounded-tl-sm px-4 py-3", aiColor)}>
        <p className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-1">{aiLabel}</p>
        <p className="text-white text-sm leading-relaxed">{message}</p>
      </div>
    </div>
  )
}

const TypingIndicator = () => (
  <div className="flex justify-start">
    <div className="bg-white/5 border border-white/10 rounded-2xl rounded-tl-sm px-4 py-3">
      <div className="flex gap-1 items-center">
        <div className="h-1.5 w-1.5 rounded-full bg-white/40 animate-bounce" style={{animationDelay:'0ms'}} />
        <div className="h-1.5 w-1.5 rounded-full bg-white/40 animate-bounce" style={{animationDelay:'150ms'}} />
        <div className="h-1.5 w-1.5 rounded-full bg-white/40 animate-bounce" style={{animationDelay:'300ms'}} />
      </div>
    </div>
  </div>
)

export const SprechenModule: React.FC<{ data: any }> = ({ data }) => {
  const { finishModule } = useExamStore();
  
  const [phase, setPhase] = useState<ExamPhase>('intro')
  const [teil1Step, setTeil1Step] = useState<Teil1Step>('opening')
  const [currentLeitpunkt, setCurrentLeitpunkt] = useState(0)
  const [teil1TurnCount, setTeil1TurnCount] = useState(0)
  const [selectedThema, setSelectedThema] = useState<1 | 2 | null>(null)
  const [selectedDecision, setSelectedDecision] = useState<string | null>(null)
  const [notes, setNotes] = useState('')
  const [currentFolie, setCurrentFolie] = useState(0)
  const [conversation, setConversation] = useState<Array<{role:'user'|'ai', text:string}>>([])
  const [isAiTyping, setIsAiTyping] = useState(false)
  const [timeLeft, setTimeLeft] = useState(0)
  const [timerActive, setTimerActive] = useState(false)
  
  const [showOverview, setShowOverview] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [micError, setMicError] = useState<string | null>(null);
  const [teil3SubStep, setTeil3SubStep] = useState<'feedback_given' | 'user_responded' | 'question_asked' | 'pruefer'>('feedback_given');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState<EvaluationResult | null>(null);

  const recognitionRef = useRef<any>(null);
  // Issue #7: Use a ref to always have the latest phase in timer callback (avoids stale closure)
  const phaseRef = useRef<ExamPhase>(phase);
  useEffect(() => { phaseRef.current = phase; }, [phase]);
  // Issue #6: Guard ref to prevent double AI calls when useEffect + handler both fire
  const aiCalledForPhaseRef = useRef<string | null>(null);

  // Sync phase with global progress bar (currentTeil) and disable ExamHeader timer
  useEffect(() => {
    if (['intro', 'thema_waehlen', 'vorbereitung'].includes(phase)) {
      useExamStore.setState({ currentTeil: 1, isTimerActive: false });
    } else if (phase === 'teil1') {
      useExamStore.setState({ currentTeil: 1, isTimerActive: false });
    } else if (phase.startsWith('teil2')) {
      useExamStore.setState({ currentTeil: 2, isTimerActive: false });
    } else if (phase.startsWith('teil3')) {
      useExamStore.setState({ currentTeil: 3, isTimerActive: false });
    } else if (phase === 'abschluss') {
      useExamStore.setState({ currentTeil: 3, isTimerActive: false });
    }
  }, [phase]);

  // Auto-advance Teil 2 after 3 minutes
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (phase === 'teil2_present') {
      timeout = setTimeout(() => {
        setPhase('teil2_done');
      }, 180000); // 3 minutes
    }
    return () => clearTimeout(timeout);
  }, [phase]);

  // Issue #4 + #7: Timer — removed timeLeft from deps to stop re-creating interval every tick.
  // Uses phaseRef.current inside the callback to read the latest phase (fixes stale closure).
  useEffect(() => {
    if (!timerActive) return
    const interval = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          setTimerActive(false)
          // Issue #7: read phase from ref, not from closure
          const currentPhase = phaseRef.current;
          if (currentPhase === 'vorbereitung') setPhase('teil1')
          else if (currentPhase === 'teil1') setPhase('teil2_present')
          else if (currentPhase === 'teil2_present') setPhase('teil2_done')
          else if (currentPhase === 'teil3_pruefer') setPhase('abschluss')
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [timerActive]) // only depends on timerActive, not timeLeft/phase

  const startPhaseWithTimer = (newPhase: ExamPhase, minutes: number) => {
    setTimeLeft(minutes * 60)
    setTimerActive(true)
    // Issue #4: Do NOT call setPhase here — the caller already set the phase.
    // This prevents the useEffect from re-triggering and causing infinite loops.
  }

  // Voice Recognition Setup
  useEffect(() => {
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.lang = 'de-DE';
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0])
          .map((result: any) => result.transcript)
          .join('');
        setTranscription(transcript);
        setMicError(null);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech Recognition Error:", event.error);
        setMicError(`Mic Error: ${event.error}`);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    } else {
      setMicError("Speech Recognition not supported in this browser.");
    }
  }, []);

  const toggleListening = () => {
    if (!isMicAllowed(phase)) return;
    
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      setMicError(null);
      if (!recognitionRef.current) {
        setMicError("Mikrofon wird von diesem Browser (z.B. Firefox) nicht unterstützt. Bitte tippen Sie Ihre Antwort manuell in das Textfeld ein.");
        return;
      }
      
      if (!transcription) {
        setTranscription('');
      }
      try {
        recognitionRef.current?.start();
        setIsListening(true);
      } catch (err: any) {
        setMicError(`Fehler beim Starten des Mikrofons: ${err.message}. Bitte tippen Sie Ihre Antwort manuell.`);
      }
    }
  };

  const getCurrentAIPhase = (): SprechenPhase => {
    if (phase === 'teil1') {
      if (teil1Step === 'opening') return 'teil1_opening'
      if (teil1Step === 'closing') return 'teil1_closing'
      return 'teil1_negotiation'
    }
    if (phase === 'teil2_done') return 'teil2_reaction'
    if (phase === 'teil3_feedback') return 'teil3_feedback'
    if (phase === 'teil3_question') return 'teil3_question'
    if (phase === 'teil3_pruefer') return 'teil3_pruefer'
    return 'teil1_opening'
  }

  const callAI = async (userText: string, forPhase?: SprechenPhase) => {
    const thema = selectedThema === 1 ? data.teil2.thema1 : selectedThema === 2 ? data.teil2.thema2 : null;
    const aiPhase = forPhase ?? getCurrentAIPhase()
    
    setIsAiTyping(true)
    
    const context: SprechenContext = {
      phase: aiPhase,
      situation: data.teil1.situation,
      leitpunkte: data.teil1.leitpunkte,
      currentLeitpunkt,
      partnerResponses: data.teil1.partnerResponses,
      selectedDecision: selectedDecision ?? undefined,
      themaTitle: thema?.title,
      themaContent: thema?.folienStruktur?.[currentFolie]?.content ?? thema?.folienStruktur?.[currentFolie]?.title,
      prueferFrage: thema?.prueferFragen?.[0],
      suggestedQuestion: thema?.suggestedQuestions?.[0],
      conversationHistory: conversation.map(m => ({ role: m.role === 'ai' ? 'model' : 'user', text: m.text })),
      turnCount: teil1TurnCount,
    }
    
    try {
      const response = await getPartnerResponse(userText, context)
      setConversation(prev => [
        ...prev,
        ...(userText ? [{ role: 'user' as const, text: userText }] : []),
        { role: 'ai' as const, text: response }
      ])
      
      speakText(response)
      
      return response
    } finally {
      setIsAiTyping(false)
    }
  }

  const handleUserSpeakInTeil1 = async (userText: string) => {
    const newTurnCount = teil1TurnCount + 1
    setTeil1TurnCount(newTurnCount)
    
    if (newTurnCount >= 4) {
      setTeil1Step('closing')
      await callAI(userText, 'teil1_closing')
      setTimeout(() => { setPhase('teil2_present'); startPhaseWithTimer('teil2_present', 3); }, 3000)
      return
    }
    
    const nextLeitpunkt = Math.min(currentLeitpunkt + 1, data.teil1.leitpunkte.length - 1)
    setCurrentLeitpunkt(nextLeitpunkt)
    
    await callAI(userText, 'teil1_negotiation')
  }

  // Issue #6: Handler calls callAI directly — the useEffect for phase change must NOT also call AI.
  // We use aiCalledForPhaseRef to guard against double-calls.
  const handleUserSpeakInTeil3 = async (userText: string) => {
    if (teil3SubStep === 'feedback_given') {
      setConversation(prev => [...prev, { role: 'user', text: userText }])
      setTeil3SubStep('question_asked')
      aiCalledForPhaseRef.current = 'teil3_question' // mark as already calling AI
      setPhase('teil3_question')
      await callAI('', 'teil3_question')
    } else if (teil3SubStep === 'question_asked') {
      setConversation(prev => [...prev, { role: 'user', text: userText }])
      setTeil3SubStep('pruefer')
      aiCalledForPhaseRef.current = 'teil3_pruefer' // mark as already calling AI
      setPhase('teil3_pruefer')
      await callAI('', 'teil3_pruefer')
    } else if (teil3SubStep === 'pruefer') {
      setConversation(prev => [...prev, { role: 'user', text: userText }])
      setPhase('abschluss')
    }
  }

  const handleSendToPartner = async () => {
    if (!transcription || isAiTyping) return;
    
    const userText = transcription;
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    }

    setTranscription('');

    if (phase === 'teil1') {
      await handleUserSpeakInTeil1(userText);
    } else if (phase.startsWith('teil3')) {
      await handleUserSpeakInTeil3(userText);
    }
  };

  const handleEvaluateAndFinish = async () => {
    setIsEvaluating(true);
    try {
      const themaTitle = selectedThema ? data.teil2[`thema${selectedThema}`]?.title : '';
      const formattedConversation = conversation.map(m => ({ 
        role: (m.role === 'ai' ? 'model' : 'user') as 'user' | 'model', 
        text: m.text 
      }));
      const result = await evaluateSpeakingExam(formattedConversation, notes, themaTitle);
      setEvaluationResult(result);
    } catch (err) {
      console.error(err);
    } finally {
      setIsEvaluating(false);
    }
  };

  // Issue #4 + #6: Phase-change side effects.
  // startPhaseWithTimer no longer calls setPhase (to avoid infinite loop).
  // We guard AI calls with aiCalledForPhaseRef to prevent double-calls from handler + useEffect.
  useEffect(() => {
    if (phase === 'teil1') {
      setConversation([])
      setTeil1Step('opening')
      setTeil1TurnCount(0)
      setCurrentLeitpunkt(0)
      callAI('', 'teil1_opening')
      startPhaseWithTimer('teil1', 3) // only sets timer, doesn't re-set phase
    }
    
    if (phase === 'teil2_done') {
      setConversation([])
      callAI('', 'teil2_reaction')
    }
    
    if (phase === 'teil3_feedback') {
      // Only call AI if the handler didn't already trigger it
      if (aiCalledForPhaseRef.current !== 'teil3_feedback') {
        setConversation([])
        callAI('', 'teil3_feedback')
      }
      aiCalledForPhaseRef.current = null
      startPhaseWithTimer('teil3_feedback', 2)
    }

    if (phase === 'teil3_question') {
      // Only call AI if the handler didn't already trigger it
      if (aiCalledForPhaseRef.current !== 'teil3_question') {
        callAI('', 'teil3_question')
      }
      aiCalledForPhaseRef.current = null
    }

    if (phase === 'teil3_pruefer') {
      // Only call AI if the handler didn't already trigger it
      if (aiCalledForPhaseRef.current !== 'teil3_pruefer') {
        callAI('', 'teil3_pruefer')
      }
      aiCalledForPhaseRef.current = null
    }
    
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase])

  const renderHeader = (title: string, instructions: string, badgeText: string, _icon: React.ReactNode) => (
    <div className="mb-4 sm:mb-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 sm:gap-4">
        <div className="space-y-1.5 sm:space-y-2 flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="bg-blue-600 text-white text-[9px] sm:text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest shadow-lg shrink-0">{badgeText}</span>
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 shrink-0">
              <BrainCircuit className="h-3 w-3 text-emerald-400" />
              <span className="text-[8px] sm:text-[9px] font-black text-emerald-400 uppercase tracking-widest">Groq AI</span>
            </div>
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-white uppercase tracking-tighter leading-none">{title}</h1>
          <p className="text-white/40 font-bold text-[10px] sm:text-xs leading-relaxed max-w-lg">{instructions}</p>
        </div>
        {timerActive && (
          <div className="bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 sm:px-4 sm:py-2 flex items-center gap-2 shrink-0 self-start sm:self-auto">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-white font-mono text-sm sm:text-base font-black tracking-widest">
              {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
            </span>
          </div>
        )}
      </div>
    </div>
  );

  const renderAIPartnerUI = () => (
    <div className="bg-[#0d0d0d] border border-white/5 rounded-2xl overflow-hidden shadow-xl flex flex-col min-h-[320px] sm:min-h-[400px] max-h-[420px] sm:max-h-[500px]">
      {/* Chat header */}
      <div className="bg-white/[0.03] px-3 sm:px-4 py-2.5 flex items-center justify-between border-b border-white/5 shrink-0">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-lg bg-blue-500/20 flex items-center justify-center">
             <Sparkles className="h-3 w-3 text-blue-400" />
          </div>
          <span className="text-[10px] sm:text-xs font-black text-white/60 uppercase tracking-widest">Dialog</span>
        </div>
        {isAiTyping && <div className="flex items-center gap-1"><div className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse" /><span className="text-[9px] text-blue-400 font-bold uppercase">tippt...</span></div>}
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 scrollbar-hide">
        {conversation.length === 0 && !isAiTyping && (
          <div className="h-full flex items-center justify-center">
            <div className="text-center opacity-25">
              <MessageSquare className="h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-2" />
              <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest">Warten...</p>
            </div>
          </div>
        )}
        {micError && (
          <div className="bg-amber-500/10 border border-amber-500/20 px-3 py-2 rounded-lg">
            <p className="text-[10px] sm:text-xs font-bold text-amber-400 text-center">{micError}</p>
          </div>
        )}
        {conversation.map((msg, idx) => (
          <MessageBubble key={idx} message={msg.text} role={msg.role} examPhase={phase} />
        ))}
        {isAiTyping && <TypingIndicator />}
      </div>

      {/* Input area */}
      <div className="px-3 sm:px-4 py-2.5 sm:py-3 bg-black/40 border-t border-white/5 shrink-0">
        <div className={cn("flex items-end gap-2 p-2 rounded-xl border transition-all", isListening ? "border-blue-500/40 bg-blue-500/5" : "border-white/10 bg-white/[0.03]")}>
          <Textarea 
            value={transcription}
            onChange={(e) => setTranscription(e.target.value)}
            placeholder={!isMicAllowed(phase) ? "Deaktiviert" : isListening ? "Höre zu..." : "Antwort eingeben..."}
            disabled={!isMicAllowed(phase) || isAiTyping}
            className="bg-transparent border-none text-xs sm:text-sm font-medium text-white placeholder:text-white/25 resize-none p-0 focus-visible:ring-0 min-h-[32px] max-h-[60px] flex-1"
          />
          <div className="flex items-center gap-1.5 shrink-0">
            <Button disabled={!isMicAllowed(phase)} onClick={toggleListening} size="sm" className={cn("h-8 w-8 rounded-lg p-0 transition-all", isListening ? "bg-red-600 hover:bg-red-700" : "bg-blue-600 hover:bg-blue-700 disabled:opacity-20")}>
              {isListening ? <StopCircle className="h-3.5 w-3.5 text-white" /> : <Mic className="h-3.5 w-3.5 text-white" />}
            </Button>
            <Button disabled={!transcription || isAiTyping || !isMicAllowed(phase)} onClick={handleSendToPartner} size="sm" className="h-8 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-black text-[9px] uppercase tracking-wider disabled:opacity-20">
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  if (phase === 'intro') {
    return (
      <div className="container mx-auto px-4 py-8 sm:py-12 max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="text-center space-y-3 mb-8">
          <div className="inline-flex items-center justify-center bg-emerald-500/10 px-4 py-1.5 rounded-full border border-emerald-500/20">
             <span className="text-[9px] sm:text-[10px] font-black text-emerald-400 uppercase tracking-[0.3em]">KI-Partner Simulation</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tighter leading-none italic">Sprechen</h1>
          <p className="text-white/30 text-xs font-bold uppercase tracking-widest">Goethe B1 Mündliche Prüfung</p>
        </div>
        <div className="grid gap-2.5 mb-8">
          {[
            { icon: BrainCircuit, title: "Groq AI Partner", detail: "Llama 3.3 70B als Gesprächspartner" },
            { icon: Mic, title: "Sprachsteuerung", detail: "Sprechen oder tippen Sie" },
            { icon: Volume2, title: "Audio-Feedback", detail: "KI-Antworten werden vorgelesen" },
          ].map((item, i) => (
            <div key={i} className="bg-white/[0.03] border border-white/5 rounded-xl p-3.5 sm:p-4 flex items-center gap-3.5 hover:bg-white/[0.05] transition-all">
              <div className="h-9 w-9 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0"><item.icon className="h-4 w-4 text-blue-400" /></div>
              <div className="min-w-0"><h3 className="font-black text-xs sm:text-sm text-white uppercase tracking-tight leading-none mb-0.5">{item.title}</h3><p className="text-white/30 text-[8px] sm:text-[9px] font-bold uppercase tracking-widest truncate">{item.detail}</p></div>
            </div>
          ))}
        </div>
        <Button onClick={() => setPhase('thema_waehlen')} className="w-full h-12 sm:h-14 bg-blue-600 text-white hover:bg-blue-700 rounded-xl font-black text-sm sm:text-base uppercase italic shadow-xl active:scale-[0.98] transition-all">PRÜFUNG STARTEN <ArrowRight className="ml-2 h-4 w-4" /></Button>
      </div>
    );
  }

  if (phase === 'thema_waehlen') {
    return (
      <div className="container mx-auto px-4 py-8 sm:py-12 max-w-4xl animate-in fade-in duration-500">
        <div className="text-center space-y-2 mb-8 sm:mb-12">
          <span className="text-[9px] sm:text-[10px] font-black text-blue-500 uppercase tracking-[0.3em] sm:tracking-[0.4em] italic">Themenwahl</span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white uppercase tracking-tighter italic leading-none">Thema A oder B wählen</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {[1, 2].map((num) => (
            <Card key={num} onClick={() => { setPhase('vorbereitung'); startPhaseWithTimer('vorbereitung', 15); }} onMouseDown={() => setSelectedThema(num as 1 | 2)} className="bg-white/[0.03] border-white/5 hover:border-blue-500 hover:bg-white/[0.05] transition-all cursor-pointer group rounded-[32px] sm:rounded-[40px] overflow-hidden shadow-2xl relative hover:shadow-blue-500/10 hover:-translate-y-1">
              <div className="absolute top-4 right-4 sm:top-8 sm:right-8 h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-black/40 border border-white/10 flex items-center justify-center text-lg sm:text-xl font-black text-white/20 uppercase group-hover:text-blue-500 group-hover:border-blue-500/30 transition-colors shadow-inner">{num === 1 ? 'A' : 'B'}</div>
              <CardHeader className="p-6 sm:p-10 pb-4 sm:pb-6">
                <span className="text-[10px] sm:text-[12px] font-black text-white/30 uppercase tracking-[0.2em] block mb-2">Thema {num === 1 ? 'A' : 'B'}</span>
                <CardTitle className="text-lg sm:text-xl font-black text-white uppercase tracking-tight group-hover:text-blue-400 transition-colors pr-10">{data.teil2[`thema${num}`].title.split(': ')[1] || data.teil2[`thema${num}`].title}</CardTitle>
              </CardHeader>
              <CardContent className="p-6 sm:p-10 pt-0 space-y-4 sm:space-y-6">
                <p className="text-base sm:text-xl font-black text-white/70 italic leading-tight">&quot;{data.teil2[`thema${num}`].headline}&quot;</p>
                <div className="flex items-center gap-2 sm:gap-3 text-blue-500 font-black text-[9px] sm:text-[10px] uppercase tracking-[0.2em] sm:tracking-[0.3em] opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all">
                  Vorbereitung Starten <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8 max-w-5xl animate-in fade-in duration-500">
      {phase === 'vorbereitung' && (
        <div className="space-y-6">
          {renderHeader("Vorbereitungszeit", "Notizen für die Aufgaben machen.", "Schritt 2", <PenTool className="h-3 w-3 text-blue-500" />)}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
            <div className="lg:col-span-4 space-y-6">
              <Card className="bg-white/[0.02] border-white/5 rounded-[24px] sm:rounded-2xl overflow-hidden relative shadow-2xl"><div className="absolute top-0 left-0 w-1 bg-blue-500 h-full" /><CardContent className="p-5 sm:p-6"><h3 className="text-[10px] sm:text-xs font-black text-blue-500 uppercase tracking-widest mb-4">VORGABEN</h3><h4 className="text-base sm:text-lg font-black text-white uppercase leading-tight mb-6">{data.teil2[`thema${selectedThema}`]?.title}</h4><ul className="space-y-3">{data.teil2.folienStruktur.map((f: any, i: number) => (<li key={i} className="flex items-start gap-3 text-white/60 text-xs sm:text-sm font-bold leading-snug"><span className="h-5 w-5 rounded-md bg-white/10 flex items-center justify-center text-blue-400 text-[9px] font-black shrink-0 mt-0.5">{f.folie}</span>{f.title}</li>))}</ul></CardContent></Card>
            </div>
            <div className="lg:col-span-8 space-y-4">
              <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Tragen Sie hier Ihre Stichpunkte ein..." className="min-h-[300px] sm:min-h-[450px] bg-black/40 border-white/5 focus-visible:ring-blue-500 rounded-[24px] sm:rounded-[32px] p-6 sm:p-8 text-base sm:text-lg font-medium resize-none shadow-inner" />
              <Button onClick={() => setPhase('teil1')} className="w-full h-12 sm:h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-xl sm:rounded-2xl font-black text-xs sm:text-sm uppercase italic shadow-xl transition-all">VORBEREITUNG BEENDEN <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" /></Button>
            </div>
          </div>
        </div>
      )}

      {phase === 'teil1' && (
        <div className="space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
          {renderHeader("Aufgabe 1: Gemeinsam planen", "Sprechen Sie mit dem KI-Partner über alle Punkte.", "Teil 1", <Users className="h-3 w-3 text-blue-500" />)}
          <Card className="bg-white/[0.02] border-white/5 rounded-[24px] sm:rounded-[32px] p-5 sm:p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none"><Users className="w-32 h-32" /></div>
            <p className="text-lg sm:text-xl md:text-2xl font-black text-white italic leading-relaxed relative z-10">&quot;{data.teil1.situation}&quot;</p>
          </Card>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 items-start">
            <div className="space-y-4 sm:space-y-6">
               <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide snap-x">
                {data.teil1.leitpunkte.map((l: string, i: number) => (
                  <button key={i} onClick={() => setCurrentLeitpunkt(i)} className={cn("px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest border transition-all shrink-0 snap-start", currentLeitpunkt === i ? "bg-blue-500 border-blue-400 text-white shadow-lg shadow-blue-500/20" : "bg-white/5 border-white/5 text-white/40 hover:text-white/80 hover:bg-white/10")}>{l}</button>
                ))}
              </div>
              {renderAIPartnerUI()}
            </div>
            <div className="space-y-4 sm:space-y-6">
               <div className="p-6 sm:p-8 bg-white/[0.02] rounded-[24px] sm:rounded-[32px] border border-white/5 space-y-6 sm:space-y-8 shadow-2xl backdrop-blur-sm">
                <span className="text-[10px] sm:text-xs font-black text-white/40 uppercase tracking-widest block">Status der Einigung:</span>
                <RadioGroup value={selectedDecision || ''} onValueChange={setSelectedDecision} className="grid gap-2 sm:gap-3">
                  {data.teil1.decisionOptions.map((opt: any) => (
                    <div key={opt.id}><RadioGroupItem value={opt.id} id={opt.id} className="sr-only" /><Label htmlFor={opt.id} className={cn("flex items-center p-4 sm:p-5 rounded-xl sm:rounded-2xl border-2 transition-all text-[10px] sm:text-xs font-black uppercase cursor-pointer hover:-translate-y-0.5", selectedDecision === opt.id ? "bg-blue-500/10 border-blue-500 text-blue-400 shadow-lg shadow-blue-500/10" : "bg-black/20 border-white/5 text-white/40 hover:border-white/20")}>{opt.text}</Label></div>
                  ))}
                </RadioGroup>
                <Button disabled={!selectedDecision} onClick={() => { setPhase('teil2_present'); startPhaseWithTimer('teil2_present', 3); }} className="w-full h-12 sm:h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-xl sm:rounded-2xl font-black text-xs sm:text-sm uppercase italic shadow-xl transition-all disabled:opacity-30">ZUM NÄCHSTEN TEIL <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" /></Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {['teil2_present', 'teil2_done'].includes(phase) && (
        <div className="space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
          {renderHeader("Aufgabe 2: Thema präsentieren", "Präsentieren Sie Ihr Thema frei.", "Teil 2", <Presentation className="h-3 w-3 text-blue-500" />)}
          <div className="flex items-center justify-between px-2 sm:px-4 bg-white/5 py-2 sm:py-3 rounded-full border border-white/5"><span className="text-[9px] sm:text-[10px] font-black text-white/40 uppercase tracking-[0.2em] sm:tracking-[0.3em]">Folie {currentFolie + 1} / 5</span><div className="flex gap-1.5 sm:gap-2">{[0,1,2,3,4].map(i => (<div key={i} className={cn("h-1 w-8 sm:w-12 rounded-full transition-all", i <= currentFolie ? "bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" : "bg-white/10")} />))}</div></div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 items-start">
            <div className="space-y-4 sm:space-y-6">
              <Card className="bg-white/[0.02] border-white/5 rounded-[32px] sm:rounded-[48px] p-6 sm:p-12 min-h-[350px] sm:min-h-[450px] flex flex-col shadow-2xl relative overflow-hidden justify-center items-center backdrop-blur-sm">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent pointer-events-none" />
                <h4 className="text-xl sm:text-2xl md:text-3xl font-black text-white uppercase tracking-tighter leading-none mb-6 sm:mb-8 text-center relative z-10">{data.teil2.folienStruktur[currentFolie].title}</h4>
                {/* Issue #8: Fixed — changed from alarming red/pulse to calm instructional banner */}
                {phase === 'teil2_present' && (
                  <div className="p-5 sm:p-6 bg-blue-500/10 rounded-[24px] sm:rounded-[32px] border border-blue-500/20 text-center w-full max-w-sm relative z-10 shadow-lg">
                    <Presentation className="h-6 w-6 sm:h-8 sm:w-8 text-blue-400 mx-auto mb-2 sm:mb-3" />
                    <p className="text-xs sm:text-sm font-bold text-blue-300 leading-relaxed">Sprechen Sie frei über diese Folie.<br /><span className="text-white/40 text-[10px] font-medium">Wie in der echten Prüfung — keine Notizen sichtbar.</span></p>
                  </div>
                )}
                {phase === 'teil2_done' && (
                  <div className="p-6 sm:p-10 bg-black/40 w-full rounded-[24px] sm:rounded-[40px] border border-white/5 flex-1 mb-4 sm:mb-8 shadow-inner relative z-10">
                    <p className="text-base sm:text-lg md:text-xl font-medium text-white/80 leading-relaxed whitespace-pre-wrap">{notes || "Keine Notizen vorhanden."}</p>
                  </div>
                )}
              </Card>
              <div className="flex gap-3 sm:gap-4">
                <Button variant="outline" disabled={currentFolie === 0} onClick={() => setCurrentFolie(currentFolie - 1)} className="h-14 sm:h-16 flex-1 bg-white/5 border-white/10 text-white rounded-2xl sm:rounded-3xl font-black text-[10px] sm:text-xs uppercase hover:bg-white/10 transition-all"><ChevronLeft className="mr-1 sm:mr-2 h-4 w-4" /> ZURÜCK</Button>
                {currentFolie < 4 ? (<Button onClick={() => setCurrentFolie(currentFolie + 1)} className="h-14 sm:h-16 flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl sm:rounded-3xl font-black text-[10px] sm:text-xs uppercase shadow-xl hover:shadow-blue-600/20 hover:scale-[1.02] transition-all">WEITER <ChevronRight className="ml-1 sm:ml-2 h-4 w-4" /></Button>) : (<Button onClick={() => setPhase('teil2_done')} className="h-14 sm:h-16 flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl sm:rounded-3xl font-black text-[10px] sm:text-xs uppercase shadow-xl hover:shadow-blue-600/20 active:scale-95 transition-all">PRÄSENTATION BEENDEN <Check className="ml-1 sm:ml-2 h-4 w-4" /></Button>)}
              </div>
            </div>
            <div className="space-y-4 sm:space-y-6">
              {phase === 'teil2_done' && (
                <>
                  {renderAIPartnerUI()}
                  <Button onClick={() => setPhase('teil3_feedback')} className="w-full h-12 sm:h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-xl sm:rounded-2xl font-black text-xs sm:text-sm uppercase italic shadow-xl transition-all">TEIL 3 STARTEN <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" /></Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {['teil3_feedback', 'teil3_question', 'teil3_pruefer'].includes(phase) && (
        <div className="space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
          {renderHeader("Aufgabe 3: Feedback & Fragen", "Diskutieren Sie mit dem Partner.", "Teil 3", <MessageSquare className="h-3 w-3 text-blue-500" />)}
          <div className="max-w-3xl mx-auto space-y-6 sm:space-y-8">
            <div className="grid grid-cols-1 gap-6 sm:gap-8">
              <Card className="bg-white/[0.02] border-white/5 rounded-[32px] sm:rounded-[40px] p-6 sm:p-10 space-y-6 sm:space-y-8 shadow-2xl backdrop-blur-sm relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-blue-500/5 to-transparent pointer-events-none" />
                <div className="flex items-center gap-3 mb-2 relative z-10">
                  <span className="h-8 w-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-black text-sm">{phase === 'teil3_feedback' ? '1' : phase === 'teil3_question' ? '2' : '3'}</span>
                  <h3 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tighter">
                    {phase === 'teil3_feedback' ? 'Feedback' : phase === 'teil3_question' ? 'Frage vom Partner' : 'Frage vom Prüfer'}
                  </h3>
                </div>
                {renderAIPartnerUI()}
              </Card>
            </div>
          </div>
        </div>
      )}

      {phase === 'abschluss' && (
        <div className="space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-right-4 duration-500 max-w-2xl mx-auto py-8 sm:py-12">
          {!evaluationResult ? (
            <Card className="bg-white/[0.02] border-white/5 rounded-[32px] sm:rounded-[40px] p-8 sm:p-12 text-center shadow-2xl backdrop-blur-sm relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-blue-500/10 to-transparent pointer-events-none" />
              <div className="relative z-10">
                <BrainCircuit className="h-12 w-12 sm:h-16 sm:w-16 text-blue-500 mx-auto mb-4 sm:mb-6" />
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white uppercase tracking-tighter mb-3 sm:mb-4 italic">Simulation Abgeschlossen</h2>
                <p className="text-xs sm:text-sm text-white/50 mb-6 sm:mb-8 font-bold tracking-widest uppercase">Ihre Leistung wird nun von der KI ausgewertet...</p>
                <Button onClick={handleEvaluateAndFinish} disabled={isEvaluating} className="h-12 sm:h-14 px-6 sm:px-8 bg-blue-600 hover:bg-blue-700 text-white rounded-xl sm:rounded-2xl font-black text-xs sm:text-sm uppercase italic shadow-xl shadow-blue-600/20 w-full transition-all">
                  {isEvaluating ? <><Loader2 className="mr-2 h-4 w-4 sm:h-5 sm:w-5 animate-spin" /> AUSWERTUNG LÄUFT...</> : 'LEISTUNG AUSWERTEN'}
                </Button>
              </div>
            </Card>
          ) : (
            <Card className="bg-white/[0.02] border-white/5 rounded-[32px] sm:rounded-[40px] p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden backdrop-blur-sm">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-[50px] rounded-full pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-500/10 blur-[50px] rounded-full pointer-events-none" />
              
              <div className="text-center relative z-10">
                <span className="text-[9px] sm:text-[10px] font-black text-blue-500 uppercase tracking-widest">Gesamtergebnis</span>
                <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-white mt-1 sm:mt-2 tracking-tighter">{evaluationResult.score} <span className="text-2xl sm:text-3xl text-white/20">/ 100</span></h2>
              </div>
              
              <div className="grid grid-cols-2 gap-3 sm:gap-4 relative z-10">
                {[
                  { label: "Aufgabenerfüllung", val: evaluationResult.task },
                  { label: "Grammatik/Wortschatz", val: evaluationResult.grammar },
                  { label: "Flüssigkeit", val: evaluationResult.fluency },
                  { label: "Aussprache (Pauschal)", val: evaluationResult.pronunciation },
                ].map((item, i) => (
                  <div key={i} className="bg-black/30 rounded-2xl p-3 sm:p-4 border border-white/5 text-center shadow-inner hover:bg-white/[0.02] transition-colors">
                    <span className="text-[8px] sm:text-[9px] font-black text-white/40 uppercase block mb-1 tracking-widest leading-tight">{item.label}</span>
                    <span className="text-lg sm:text-xl font-black text-white">{item.val}<span className="text-xs text-white/30 ml-1">/25</span></span>
                  </div>
                ))}
              </div>
              
              <div className="bg-blue-500/5 border border-blue-500/20 rounded-2xl sm:rounded-3xl p-5 sm:p-6 relative z-10">
                <h4 className="text-xs sm:text-sm font-black text-blue-400 uppercase mb-2 sm:mb-3 tracking-widest flex items-center gap-2">
                  <Sparkles className="h-3 w-3" /> KI-Feedback
                </h4>
                <p className="text-xs sm:text-sm text-white/80 leading-relaxed whitespace-pre-wrap">{evaluationResult.feedback}</p>
              </div>
              
              <Button onClick={() => finishModule('sprechen', evaluationResult.score)} className="w-full h-12 sm:h-14 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl sm:rounded-2xl font-black text-xs sm:text-sm uppercase italic shadow-lg shadow-emerald-600/20 mt-2 sm:mt-4 transition-all active:scale-[0.98] relative z-10">
                PRÜFUNG BEENDEN <Check className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};
