import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Info, Loader2, Mic, Square, Play, CheckCircle2, MessageSquare, AlertCircle, PenTool } from 'lucide-react';
import { cn } from '@/lib/utils';
import sprechenData from '@/data/preparation/goethe/b1/sprechen.json';
import { playTTS } from '@/lib/tts';
import { getPreparationSpeakingReply, evaluatePreparationSpeaking, PreparationSpeakingResult } from '@/lib/ai/groq';
import Teil1 from './teile/Teil1';
import Teil2 from './teile/Teil2';
import Teil3 from './teile/Teil3';

const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
};

// @ts-ignore
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

const GoetheB1SprechenSimulator = () => {
  const { teilId, topicId } = useParams<{ teilId: string; topicId: string }>();
  const navigate = useNavigate();

  const [teil, setTeil] = useState<any>(null);
  const [topic, setTopic] = useState<any>(null);
  const [selectedTopic, setSelectedTopic] = useState<any>(null); // For Teil 2 selection

  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // STT State
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<any>(null);
  const accumulatedTranscriptRef = useRef('');

  // Conversation State
  const [conversation, setConversation] = useState<Array<{ role: 'user' | 'ai'; text: string }>>([]);
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [isPreparing, setIsPreparing] = useState(false); // For Teil 2 preparation phase
  const scrollRef = useRef<HTMLDivElement>(null);

  // Evaluation States
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState<PreparationSpeakingResult | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);

  useEffect(() => {
    if (!teilId || !topicId) return;

    const currentTeil = sprechenData.teile.find(t => t.id === teilId);
    if (!currentTeil) return;

    const currentTopic = currentTeil.themen?.find((t: any) => t.id === topicId);
    if (!currentTopic) return;

    setTeil(currentTeil);
    setTopic(currentTopic);
    setSelectedTopic(null);

    // Initial time based on part
    if (currentTeil.nummer === 1) {
        setTimeLeft(180); // 3 mins
    } else if (currentTeil.nummer === 2) {
        setTimeLeft(240); // 4 mins
    } else {
        setTimeLeft(120); // 2 mins
    }

    setConversation([]);
    setEvaluationResult(null);
    setShowResultsModal(false);
    setIsAiProcessing(false);
    setIsTimerRunning(false);
    setHasStarted(false);
    setIsPreparing(false);
    setTranscript('');
    accumulatedTranscriptRef.current = '';
  }, [teilId, topicId]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isTimerRunning) {
      setIsTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timeLeft]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [conversation, transcript]);

  // Initialize SpeechRecognition
  useEffect(() => {
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'de-DE';

      recognition.onresult = (event: any) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        if (finalTranscript) {
          accumulatedTranscriptRef.current += (accumulatedTranscriptRef.current ? ' ' : '') + finalTranscript.trim();
        }

        setTranscript(accumulatedTranscriptRef.current + (interimTranscript ? ' ' + interimTranscript : ''));
      };

      recognition.onerror = (event: any) => {
        console.error("Speech Recognition Error:", event.error);
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch (e) { }
      }
    };
  }, []);

  const handleStartConversation = async () => {
    if (!teil || !topic) return;
    
    // For Teil 2, we need to pick a topic first
    if (teil.nummer === 2 && !selectedTopic) {
        // This is handled in the UI by the choice buttons
        return;
    }

    setHasStarted(true);
    setIsTimerRunning(true);

    if (teil.nummer === 1) {
        setIsAiProcessing(true);
        try {
            const initialReply = "Hallo! Unser Mitschüler aus dem Deutschkurs liegt ja im Krankenhaus. Sollen wir planen, wie und wann wir ihn besuchen?";
            setConversation([{ role: 'ai', text: initialReply }]);
            await playTTS(initialReply);
        } catch (error) {
            console.error(error);
        } finally {
            setIsAiProcessing(false);
        }
    } else if (teil.nummer === 2) {
        // For Teil 2, AI is just listening
        const intro = "Guten Tag. Bitte beginnen Sie mit Ihrer Präsentation zum Thema '" + selectedTopic.title + "'.";
        setConversation([{ role: 'ai', text: intro }]);
        await playTTS(intro);
    } else if (teil.nummer === 3) {
        setIsAiProcessing(true);
        try {
            const initialReply = "Vielen Dank für Ihre Präsentation zum Thema '" + topic.title + "'. Ich fand Ihren Vortrag sehr interessant. Besonders gut hat mir gefallen, wie Sie über Ihre persönlichen Erfahrungen gesprochen haben. Eine Frage habe ich aber noch: " + topic.suggestedQuestion;
            setConversation([{ role: 'ai', text: initialReply }]);
            await playTTS(initialReply);
        } catch (error) {
            console.error(error);
        } finally {
            setIsAiProcessing(false);
        }
    }
  };

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      alert("Spracherkennung wird nicht unterstützt.");
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      accumulatedTranscriptRef.current = transcript.trim();
      setIsRecording(true);
      recognitionRef.current.start();
    }
  };

  const processUserTurn = async () => {
    if (!transcript.trim()) return;

    const finalUserText = transcript.trim();
    const newConversation: Array<{ role: 'user' | 'ai'; text: string }> = [...conversation, { role: 'user', text: finalUserText }];
    setConversation(newConversation);
    setTranscript('');
    accumulatedTranscriptRef.current = '';

    setIsAiProcessing(true);
    try {
      const reply = await getPreparationSpeakingReply({
        institute: sprechenData.institut,
        level: sprechenData.level,
        teilLabel: teil.label,
        themaTitle: teil.nummer === 2 ? selectedTopic.title : topic.title,
        instructions: teil.nummer === 1 ? topic.situation : teil.nummer === 3 ? "Antworte auf die Reaktion des Users." : "Höre nur zu.",
        prompts: teil.nummer === 1 ? topic.punkte : [],
        conversation: newConversation,
        userText: finalUserText,
        turnLimit: 10
      });

      setConversation([...newConversation, { role: 'ai', text: reply }]);
      await playTTS(reply);
    } catch (error) {
      console.error(error);
    } finally {
      setIsAiProcessing(false);
    }
  };

  const handleEvaluate = async () => {
    if (conversation.length === 0) return;
    setIsTimerRunning(false);
    setIsEvaluating(true);
    setShowResultsModal(true);

    if (isRecording && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }

    try {
      const result = await evaluatePreparationSpeaking({
        institute: sprechenData.institut,
        level: sprechenData.level,
        themaTitle: teil.nummer === 2 ? selectedTopic.title : topic.title,
        instructions: teil.nummer === 1 ? topic.situation : topic.title,
        conversation: conversation
      });
      setEvaluationResult(result);
    } catch (error) {
      console.error(error);
      setEvaluationResult({
        score: 0,
        aufgabenerfuellung: 0,
        interaktion: 0,
        wortschatz: 0,
        strukturen_aussprache: 0,
        feedback: "Ein Fehler ist bei der Auswertung aufgetreten.",
        tips: []
      });
    } finally {
      setIsEvaluating(false);
    }
  };

  const userTurnCount = conversation.filter(m => m.role === 'user').length;
  const MAX_TURNS = teil?.nummer === 1 ? 8 : 6;
  const isTimeUp = hasStarted && timeLeft === 0;
  const isMaxTurnsReached = userTurnCount >= MAX_TURNS;
  const isInputDisabled = isAiProcessing || isEvaluating || isTimeUp || isMaxTurnsReached;

  if (!teil || !topic) {
    return <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-white font-sans" dir="ltr">Laden...</div>;
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col font-sans overflow-hidden" dir="ltr">
      {/* Header */}
      <header className="h-16 border-b border-white/10 bg-[#111] flex items-center justify-between px-4 sticky top-0 z-50 shrink-0">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" className="h-8 px-2 text-white/50 hover:text-white" onClick={() => navigate(-1)}>
            <ChevronLeft className="h-4 w-4 mr-1" />
            <span className="text-xs font-bold uppercase">Zurück</span>
          </Button>
          <div className="flex flex-col hidden sm:flex">
            <span className="text-[10px] font-black text-[#ffcc00] uppercase">{sprechenData.institut} • {sprechenData.level}</span>
            <span className="text-xs font-bold text-white/90">{sprechenData.module} • {teil.label}</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className={cn(
            'flex flex-col items-center px-4 py-1.5 rounded-xl border transition-all',
            timeLeft > 60 ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' :
              timeLeft > 0 ? 'bg-[#ffcc00]/10 border-[#ffcc00]/30 text-[#ffcc00]' :
                'bg-red-500/10 border-red-500/30 text-red-500'
          )}>
            <span className="text-[8px] font-black uppercase opacity-80">Zeit</span>
            <span className="text-lg font-black tabular-nums leading-none">
              {formatTime(timeLeft)}
            </span>
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        {/* Left Side: Exam Paper */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6 lg:p-8 bg-[#0c0c0c]">
          <div className="max-w-4xl mx-auto space-y-8 pb-32">

            {/* Dynamic Aufgabe Render */}
            {/* ... */}
            {teil.nummer === 1 && <Teil1 teil={teil} topic={topic} hasStarted={hasStarted} />}
            {teil.nummer === 2 && (
              <Teil2
                teil={teil}
                topic={topic}
                selectedTopic={selectedTopic}
                setSelectedTopic={setSelectedTopic}
                hasStarted={hasStarted}
                isPreparing={isPreparing}
                setIsPreparing={setIsPreparing}
              />
            )}
            {teil.nummer === 3 && <Teil3 teil={teil} topic={topic} hasStarted={hasStarted} />}

          </div>
        </div>

        {/* Mobile Overlay */}
        {isChatOpen && (
          <div 
            className="fixed inset-0 bg-black/60 z-[55] lg:hidden animate-in fade-in duration-300" 
            onClick={() => setIsChatOpen(false)}
          />
        )}

        {/* Right Side: Conversation Interface (Side Menu on Mobile) */}
        <div className={cn(
            "fixed lg:static inset-y-0 right-0 z-[60] w-[85%] sm:w-[400px] lg:w-[450px] bg-[#111] flex flex-col transition-transform duration-500 ease-in-out border-l border-white/10",
            "lg:translate-x-0", // Always visible on desktop
            isChatOpen ? "translate-x-0" : "translate-x-full" // Toggle on mobile
        )}>

          <div className="p-6 border-b border-white/5 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className={cn("w-3 h-3 rounded-full", isAiProcessing ? "bg-[#ffcc00]" : isRecording ? "bg-red-500" : "bg-emerald-500")} />
              </div>
              <span className="text-xs font-black text-white uppercase flex items-center gap-2">
                {isAiProcessing ? "KI-Partner denkt..." : isRecording ? "Sie sprechen..." : "Bereit für Input"}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
                {hasStarted && (
                  <div className="bg-white/5 px-4 py-1 rounded-full border border-white/5 text-[10px] font-black text-white/30 uppercase">
                    Turn {userTurnCount}/{MAX_TURNS}
                  </div>
                )}
                {/* Close button for mobile drawer */}
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="lg:hidden text-white/50"
                  onClick={() => setIsChatOpen(false)}
                >
                  <ChevronLeft className="h-5 w-5 rotate-180" />
                </Button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar" ref={scrollRef}>
            {!hasStarted ? (
              <div className="h-full flex flex-col items-center justify-center text-center px-6 space-y-6">
                <div className="relative group">
                  <div className="relative w-24 h-24 rounded-full bg-[#1a1a1a] border-2 border-[#ffcc00]/30 flex items-center justify-center">
                    <Mic className="w-10 h-10 text-[#ffcc00]" />
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="text-xl font-black text-white uppercase italic">Mündliche Prüfung</h4>
                  <p className="text-sm text-white/40 font-medium">Stellen Sie sicher, dass Ihr Mikrofon aktiviert ist und Sie in einer ruhigen Umgebung sind.</p>
                </div>
                <Button
                  onClick={handleStartConversation}
                  disabled={teil.nummer === 2 && !selectedTopic}
                  className={cn(
                    "h-16 w-full rounded-2xl font-black uppercase text-sm transition-all",
                    (teil.nummer === 2 && !selectedTopic)
                      ? "bg-white/5 text-white/20"
                      : "bg-[#ffcc00] hover:bg-[#ffcc00]/90 text-black"
                  )}
                >
                  <Play className="w-5 h-5 mr-3 fill-current" /> Simulation Starten
                </Button>
              </div>
            ) : (
              <>
                {conversation.map((msg, idx) => (
                  <div key={idx} className={cn("flex flex-col max-w-[92%]", msg.role === 'user' ? "ml-auto items-end" : "mr-auto items-start")}>
                    <span className={cn(
                      "text-[9px] font-black mb-1 uppercase px-2",
                      msg.role === 'user' ? "text-amber-500/50" : "text-white/30"
                    )}>
                      {msg.role === 'user' ? "Ihre Antwort" : "KI-Prüfungspartner"}
                    </span>
                    <div className={cn(
                      "p-4 rounded-[24px] text-sm font-medium leading-relaxed",
                      msg.role === 'user'
                        ? "bg-[#ffcc00] text-black rounded-tr-sm"
                        : "bg-white/5 border border-white/5 text-white rounded-tl-sm"
                    )}>
                      {msg.text}
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>

          {/* Controls */}
          {hasStarted && (
            <div className="p-4 border-t border-white/5 bg-[#1a1a1a] flex flex-col gap-4 shrink-0 lg:rounded-none">

              {/* Global Status Warnings */}
              {isTimeUp && (
                <div className="flex items-center justify-center gap-3 bg-red-500/10 border border-red-500/20 p-2 rounded-xl">
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  <span className="text-[10px] font-black text-red-500 uppercase">Zeit abgelaufen!</span>
                </div>
              )}

              <div className="flex flex-col gap-3">
                <div className="relative group">
                  <textarea
                    value={transcript}
                    onChange={(e) => setTranscript(e.target.value)}
                    placeholder={isRecording ? "Sprechen Sie jetzt..." : isInputDisabled ? "Gespräch beendet." : "Tippen oder sprechen..."}
                    className={cn(
                      "w-full bg-[#0c0c0c] border border-white/10 rounded-xl p-4 text-sm text-white focus:ring-2 focus:ring-[#ffcc00]/30 resize-none h-16 custom-scrollbar transition-all",
                      isInputDisabled && "opacity-40 cursor-not-allowed"
                    )}
                    disabled={isInputDisabled}
                  />
                </div>

                <div className="flex gap-3 h-14">
                  <Button
                    onClick={toggleRecording}
                    disabled={isInputDisabled}
                    className={cn(
                      "flex-1 rounded-2xl font-black uppercase transition-all",
                      isRecording
                        ? "bg-red-500 hover:bg-red-600 text-white"
                        : "bg-white/5 hover:bg-white/10 text-white",
                    )}
                  >
                    {isRecording ? (
                      <><Square className="w-5 h-5 mr-3 fill-current" /> Stop</>
                    ) : (
                      <><Mic className="w-5 h-5 mr-3" /> Sprechen</>
                    )}
                  </Button>
                  <Button
                    onClick={processUserTurn}
                    disabled={isInputDisabled || !transcript.trim() || isRecording}
                    className="flex-1 rounded-2xl bg-[#ffcc00] hover:bg-[#ffcc00]/90 text-black font-black uppercase transition-all disabled:opacity-40"
                  >
                    Senden
                  </Button>
                  <Button
                    onClick={handleEvaluate}
                    disabled={isAiProcessing || isRecording || userTurnCount === 0}
                    className="w-14 rounded-2xl bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white border border-emerald-500/20 p-0 flex items-center justify-center transition-all"
                    title="Auswerten"
                  >
                    {isEvaluating ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-6 h-6" />}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Floating Toggle Button for Mobile */}
        <div className={cn(
          "fixed bottom-24 right-6 flex flex-col items-end gap-3 lg:hidden z-50 transition-all duration-500",
          isChatOpen ? "translate-x-24 opacity-0" : "translate-x-0 opacity-100"
        )}>
           {/* Hint for mobile */}
           <div className="bg-[#ffcc00] text-black text-[10px] font-black px-4 py-2 rounded-full shadow-2xl animate-bounce border-2 border-black/10">
              HIER KLICKEN ZUM SPRECHEN
           </div>
           <Button
              onClick={() => setIsChatOpen(true)}
              className="h-16 w-16 rounded-full bg-[#ffcc00] text-black shadow-2xl flex items-center justify-center relative overflow-hidden group border-4 border-[#111]"
           >
              <div className="absolute inset-0 bg-white/20 scale-0 group-hover:scale-100 transition-transform duration-500 rounded-full" />
              <MessageSquare className="h-7 w-7 relative z-10" />
              {conversation.length > 0 && (
                <span className="absolute top-0 right-0 h-6 w-6 bg-red-600 rounded-full text-[10px] font-black text-white flex items-center justify-center border-2 border-[#111]">
                  {conversation.length}
                </span>
              )}
           </Button>
        </div>
      </main>

      {/* Evaluation Modal */}
      {showResultsModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4 sm:p-6" dir="ltr">
          <div className="bg-[#111] border border-white/10 rounded-[48px] w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
            {isEvaluating ? (
              <div className="p-20 flex flex-col items-center justify-center gap-8 h-[500px]">
                <div className="relative">
                  <Loader2 className="h-20 w-20 text-[#ffcc00] animate-spin" />
                </div>
                <div className="text-center space-y-3">
                  <h3 className="text-3xl font-black text-white uppercase italic">KI-Bewertung</h3>
                  <p className="text-xs text-white/40 font-black uppercase animate-pulse">Ihre mündliche Leistung wird nach Goethe B1 Standards analysiert</p>
                </div>
              </div>
            ) : evaluationResult ? (
              <>
                {/* Result Header */}
                <div className="p-10 border-b border-white/5 bg-[#181818] flex items-center justify-between shrink-0">
                  <div className="space-y-2">
                    <h2 className="text-3xl font-black text-white uppercase italic">Prüfungsergebnis</h2>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-black text-[#ffcc00] uppercase bg-[#ffcc00]/10 px-3 py-1 rounded-full">B1 Sprechen</span>
                      <span className="h-1.5 w-1.5 rounded-full bg-white/20" />
                      <p className="text-xs font-bold text-white/40 truncate max-w-[200px]">
                        {teil.nummer === 2 ? selectedTopic.title : topic.title}
                      </p>
                    </div>
                  </div>
                  <div className={cn(
                    "relative flex flex-col items-center justify-center h-24 w-24 rounded-[32px] border-2",
                    evaluationResult.score >= 60 ? "border-emerald-500/50 bg-emerald-500/5 text-emerald-400" : "border-red-500/50 bg-red-500/5 text-red-400"
                  )}>
                    <span className="text-4xl font-black tabular-nums">{evaluationResult.score}</span>
                    <span className="text-[8px] font-black uppercase opacity-60">Punkte</span>
                  </div>
                </div>

                <div className="p-10 overflow-y-auto custom-scrollbar flex-1 space-y-12">
                  {/* Score Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {[
                      { label: 'Aufgabenerfüllung', value: evaluationResult.aufgabenerfuellung },
                      { label: 'Interaktion', value: evaluationResult.interaktion },
                      { label: 'Wortschatz', value: evaluationResult.wortschatz },
                      { label: 'Strukturen & Aussprache', value: evaluationResult.strukturen_aussprache }
                    ].map((crit, idx) => (
                      <div key={idx} className="bg-white/[0.02] border border-white/5 p-6 rounded-3xl group hover:bg-white/[0.05] transition-colors">
                        <div className="flex justify-between items-center mb-4">
                          <span className="text-[10px] font-black text-white/40 uppercase">{crit.label}</span>
                          <span className="text-base font-black text-[#ffcc00]">{crit.value}/25</span>
                        </div>
                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#ffcc00] rounded-full transition-all duration-1000 delay-300"
                            style={{ width: `${(crit.value / 25) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Turn Corrections */}
                  {evaluationResult.turnCorrections && evaluationResult.turnCorrections.length > 0 && (
                    <div className="space-y-6">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                          <CheckCircle2 className="h-5 w-5" />
                        </div>
                        <h3 className="text-base font-black text-white uppercase">Optimierte Formulierungen</h3>
                      </div>
                      <div className="space-y-4">
                        {evaluationResult.turnCorrections.map((corr, i) => (
                          <div key={i} className="bg-white/[0.02] border border-white/5 p-6 rounded-3xl space-y-3">
                            <div className="flex items-start gap-3">
                              <span className="text-[10px] font-black text-red-400/50 uppercase mt-1 shrink-0">Original:</span>
                              <p className="text-sm text-white/60 italic">"{corr.original}"</p>
                            </div>
                            <div className="flex items-start gap-3">
                              <span className="text-[10px] font-black text-emerald-400 uppercase mt-1 shrink-0">Besser:</span>
                              <p className="text-sm text-emerald-400 font-bold">"{corr.improved}"</p>
                            </div>
                            {corr.reason && (
                              <p className="text-[11px] text-white/30 pl-16 italic">— {corr.reason}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Feedback Section */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400">
                        <MessageSquare className="h-5 w-5" />
                      </div>
                      <h3 className="text-base font-black text-white uppercase">Feedback des Prüfers</h3>
                    </div>
                    <div className="bg-blue-500/5 border border-blue-500/10 p-8 rounded-3xl text-base leading-relaxed text-blue-100/80 font-medium italic whitespace-pre-wrap">
                      {evaluationResult.feedback}
                    </div>
                  </div>

                  {/* Tips */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-2xl bg-[#ffcc00]/10 flex items-center justify-center text-[#ffcc00]">
                        <PenTool className="h-5 w-5" />
                      </div>
                      <h3 className="text-base font-black text-white uppercase">Tipps zur Verbesserung</h3>
                    </div>
                    <ul className="space-y-4">
                      {evaluationResult.tips.map((tip, i) => (
                        <li key={i} className="bg-[#1a1a1a] p-5 rounded-2xl border border-white/5 flex items-start gap-4">
                           <div className="h-6 w-6 rounded-full bg-[#ffcc00] flex items-center justify-center shrink-0 mt-0.5">
                              <span className="text-[10px] font-black text-black">{i + 1}</span>
                           </div>
                           <p className="text-sm text-white/70 font-medium">{tip}</p>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="p-10 border-t border-white/5 bg-[#181818] shrink-0 flex justify-end gap-6">
                  <Button
                    variant="outline"
                    onClick={() => setShowResultsModal(false)}
                    className="border-white/10 text-white/50 hover:bg-white/5 hover:text-white font-black uppercase text-[10px] px-8 h-14 rounded-2xl"
                  >
                    Schließen
                  </Button>
                  <Button
                    onClick={() => {
                      setShowResultsModal(false);
                      setConversation([]);
                      setTranscript('');
                      accumulatedTranscriptRef.current = '';
                      setTimeLeft(180);
                      setHasStarted(false);
                    }}
                    className="bg-[#ffcc00] hover:bg-[#ffcc00]/90 text-black font-black uppercase text-xs px-12 h-14 rounded-2xl"
                  >
                    Neu starten
                  </Button>
                </div>
              </>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};

export default GoetheB1SprechenSimulator;
