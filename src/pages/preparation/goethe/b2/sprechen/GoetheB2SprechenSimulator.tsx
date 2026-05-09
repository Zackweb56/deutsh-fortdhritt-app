import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Info, Loader2, Mic, Square, Play, CheckCircle2, MessageSquare, AlertCircle, PenTool } from 'lucide-react';
import { cn } from '@/lib/utils';
import sprechenData from '@/data/preparation/goethe/b2/sprechen.json';
import GoetheExamLayout from '@/components/preparation/goethe/GoetheExamLayout';
import { playTTS } from '@/lib/tts';
import { getPreparationSpeakingReply, evaluatePreparationSpeaking, PreparationSpeakingResult } from '@/lib/ai/groq';
import Teil1 from './teile/Teil1';
import Teil2 from './teile/Teil2';

const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
};

// @ts-ignore
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

const GoetheB2SprechenSimulator = () => {
  const { teilId, topicId } = useParams<{ teilId: string; topicId: string }>();
  const navigate = useNavigate();

  const [teil, setTeil] = useState<any>(null);
  const [topic, setTopic] = useState<any>(null);
  const [selectedThema, setSelectedThema] = useState<'thema1' | 'thema2' | null>(null);

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
  const [isChatOpen, setIsChatOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Evaluation States
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState<PreparationSpeakingResult | null>(null);

  useEffect(() => {
    if (!teilId || !topicId) return;

    const currentTeil = sprechenData.teile.find(t => t.id === teilId);
    if (!currentTeil) return;

    const currentTopic = currentTeil.themen?.find((t: any) => t.id === topicId);
    if (!currentTopic) return;

    setTeil(currentTeil);
    setTopic(currentTopic);

    // Reset selection for Teil 1
    if (currentTeil.nummer === 1) {
      setSelectedThema(null);
    } else {
      setSelectedThema('thema1'); // Dummy for Teil 2
    }

    setTimeLeft(currentTeil.nummer === 1 ? 240 : 300); // 4 or 5 mins
    setConversation([]);
    setEvaluationResult(null);
    setShowResultsModal(false);
    setIsAiProcessing(false);
    setIsTimerRunning(false);
    setHasStarted(false);
    setIsChatOpen(false);
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
    if (!teil || !topic || (teil.nummer === 1 && !selectedThema)) return;
    setHasStarted(true);
    setIsTimerRunning(true);

    if (teil.nummer === 2) {
      setIsAiProcessing(true);
      try {
        const initialReply = await getPreparationSpeakingReply({
          institute: sprechenData.institut,
          level: sprechenData.level,
          teilLabel: teil.label,
          themaTitle: topic.title,
          instructions: `Frage: ${topic.frage}\nArgumente Pro: ${topic.argumente_pro.join(', ')}\nArgumente Contra: ${topic.argumente_contra.join(', ')}`,
          prompts: topic.stichpunkte || [],
          conversation: [],
          userText: "Hallo! Sollen wir mit der Diskussion über das Thema '" + topic.title + "' beginnen?",
          turnLimit: 12,
        });

        setConversation([{ role: 'ai', text: initialReply }]);
        await playTTS(initialReply);
      } catch (error) {
        console.error(error);
      } finally {
        setIsAiProcessing(false);
      }
    } else {
      const welcome = "Guten Tag. Bitte beginnen Sie mit Ihrem Vortrag zum Thema '" + (selectedThema === 'thema1' ? topic.thema1.title : topic.thema2.title) + "'.";
      setConversation([{ role: 'ai', text: welcome }]);
      await playTTS(welcome);
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
        themaTitle: teil.nummer === 1 ? (selectedThema === 'thema1' ? topic.thema1.title : topic.thema2.title) : topic.title,
        instructions: teil.nummer === 1 ? `Der User hält einen Vortrag. Höre zu. Am Ende stelle eine Frage aus: ${topic.fragen_beispiele.join(' | ')}` : topic.instructions,
        prompts: teil.nummer === 1 ? (selectedThema === 'thema1' ? topic.thema1.leitpunkte : topic.thema2.leitpunkte) : topic.stichpunkte,
        conversation: newConversation,
        userText: finalUserText,
        turnLimit: 12
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
        themaTitle: teil.nummer === 1 ? (selectedThema === 'thema1' ? topic.thema1.title : topic.thema2.title) : topic.title,
        instructions: teil.nummer === 1 ? "Präsentation und Fragenbeantwortung" : topic.frage,
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
  const MAX_TURNS = teil?.nummer === 1 ? 6 : 10;
  const isTimeUp = hasStarted && timeLeft === 0;
  const isMaxTurnsReached = userTurnCount >= MAX_TURNS;
  const isInputDisabled = isAiProcessing || isEvaluating || isTimeUp || isMaxTurnsReached;

  if (!teil || !topic) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center text-gray-900 font-sans" dir="ltr">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400 mr-3" />
        <span className="text-sm font-bold uppercase tracking-widest text-gray-400">Laden...</span>
      </div>
    );
  }

  return (
    <>
      <GoetheExamLayout
        title={`${sprechenData.institut} — ${sprechenData.level}`}
        module={sprechenData.module}
        teil={teil.label}
        timeLeft={timeLeft}
        progress={`${teil.nummer}/${sprechenData.teile.length}`}
        onZuruck={() => navigate(-1)}
        onWeiter={() => {
          const nextTeil = sprechenData.teile.find(t => t.nummer === teil.nummer + 1);
          if (nextTeil) {
            navigate(`/preparation/goethe/b2/sprechen/${nextTeil.id}/${topicId}`);
          }
        }}
        onAbgeben={handleEvaluate}
      >
        <div className="flex flex-col lg:flex-row h-full overflow-hidden bg-white">
          {/* Left Side: Task Paper */}
          <div className="flex-1 overflow-y-auto p-12 border-r border-gray-300 bg-white custom-scrollbar">
            <div className="max-w-2xl mx-auto space-y-8">
               <div className="bg-[#fff9c4] border border-[#fbc02d] p-6 text-sm text-[#5d4037] leading-relaxed shadow-sm">
                  <div className="flex items-start gap-3">
                     <Info className="h-4 w-4 mt-0.5 shrink-0" />
                     <div>
                        <p className="font-bold uppercase tracking-tight mb-2">Instruktionen — {teil.label}</p>
                        <p className="font-medium italic">{teil.description}</p>
                     </div>
                  </div>
               </div>

               <div className="prose max-w-none">
                  {teil.nummer === 1 && (
                    <Teil1
                      teil={teil}
                      topic={topic}
                      hasStarted={hasStarted}
                      selectedThema={selectedThema}
                      setSelectedThema={setSelectedThema}
                    />
                  )}
                  {teil.nummer === 2 && <Teil2 teil={teil} topic={topic} />}
               </div>
            </div>
          </div>

          {/* Right Side: Conversation Interface */}
          <div className="w-[450px] bg-gray-50 flex flex-col shrink-0">
             {/* Status Header */}
             <div className="p-6 border-b border-gray-200 bg-white flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                   <div className={cn(
                      "w-2 h-2 rounded-full",
                      isAiProcessing ? "bg-amber-500 animate-pulse" : isRecording ? "bg-red-500 animate-pulse" : "bg-emerald-500"
                   )} />
                   <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                      {isAiProcessing ? "Prüfer spricht..." : isRecording ? "Sie sprechen..." : "Bereit"}
                   </span>
                </div>
                {hasStarted && (
                   <span className="text-[10px] font-mono text-gray-400">Runde {userTurnCount}/{MAX_TURNS}</span>
                )}
             </div>

             {/* Conversation Area */}
             <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar" ref={scrollRef}>
                {!hasStarted ? (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
                     <div className="h-20 w-20 rounded-full bg-gray-200 flex items-center justify-center text-gray-400">
                        <Mic className="h-10 w-10" />
                     </div>
                     <div className="space-y-2">
                        <h4 className="text-sm font-bold text-gray-800 uppercase tracking-widest">Mündliche Prüfung</h4>
                        <p className="text-xs text-gray-500 leading-relaxed max-w-[200px] mx-auto">
                           Klicken Sie auf den Button, um die Simulation zu starten.
                        </p>
                     </div>
                     <Button 
                        onClick={handleStartConversation}
                        className="bg-gray-800 hover:bg-black text-white px-8 h-12 rounded-sm font-bold uppercase text-xs"
                     >
                        Simulation Starten
                     </Button>
                  </div>
                ) : (
                  <div className="space-y-6">
                     {conversation.map((msg, idx) => (
                        <div key={idx} className={cn("flex flex-col max-w-[90%]", msg.role === 'user' ? "ml-auto items-end" : "mr-auto items-start")}>
                           <span className="text-[9px] font-bold text-gray-400 uppercase mb-1 px-1">
                              {msg.role === 'user' ? "Sie" : "Prüfer"}
                           </span>
                           <div className={cn(
                              "p-4 rounded-sm text-sm font-medium leading-relaxed shadow-sm border",
                              msg.role === 'user' 
                                 ? "bg-gray-800 border-gray-800 text-white" 
                                 : "bg-white border-gray-200 text-gray-800"
                           )}>
                              {msg.text}
                           </div>
                        </div>
                     ))}
                     {isAiProcessing && (
                        <div className="mr-auto items-start max-w-[90%]">
                           <div className="bg-white border border-gray-200 p-4 rounded-sm flex items-center gap-2">
                              <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                              <span className="text-xs text-gray-400 font-medium italic italic">Prüfer antwortet...</span>
                           </div>
                        </div>
                     )}
                  </div>
                )}
             </div>

             {/* Controls Area */}
             {hasStarted && (
                <div className="p-6 bg-white border-t border-gray-200 space-y-4">
                   <div className="relative">
                      <textarea
                        value={transcript}
                        onChange={(e) => setTranscript(e.target.value)}
                        placeholder={isRecording ? "Bitte sprechen Sie..." : "Antwort eingeben oder sprechen..."}
                        className="w-full bg-gray-50 border border-gray-200 rounded-sm p-4 text-sm text-gray-800 focus:border-gray-800 focus:ring-0 resize-none h-20 transition-all font-medium custom-scrollbar"
                        disabled={isInputDisabled}
                      />
                   </div>

                   <div className="flex gap-3 h-12">
                      <Button
                        onClick={toggleRecording}
                        disabled={isInputDisabled}
                        className={cn(
                          "flex-1 h-full rounded-sm font-bold uppercase text-xs transition-all border",
                          isRecording 
                            ? "bg-red-600 border-red-600 text-white" 
                            : "bg-white border-gray-300 text-gray-600 hover:border-gray-800 hover:text-gray-800"
                        )}
                      >
                        {isRecording ? <Square className="h-4 w-4 mr-2" /> : <Mic className="h-4 w-4 mr-2" />}
                        {isRecording ? "Stop" : "Sprechen"}
                      </Button>
                      <Button
                        onClick={processUserTurn}
                        disabled={isInputDisabled || !transcript.trim() || isRecording}
                        className="flex-1 h-full bg-gray-800 hover:bg-black text-white rounded-sm font-bold uppercase text-xs"
                      >
                        Senden
                      </Button>
                   </div>
                </div>
             )}
          </div>
        </div>
      </GoetheExamLayout>

      {/* Evaluation Modal */}
      {showResultsModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-6" dir="ltr">
          <div className="bg-white border border-gray-200 rounded-sm w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
            {isEvaluating ? (
              <div className="p-20 flex flex-col items-center justify-center gap-8 h-[400px]">
                <Loader2 className="h-12 w-12 text-gray-900 animate-spin" />
                <div className="text-center space-y-3">
                  <h3 className="text-xl font-bold text-gray-900 uppercase tracking-widest">Bewertung wird erstellt</h3>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-widest animate-pulse">Ihre Leistung wird nach Goethe-Standards analysiert</p>
                </div>
              </div>
            ) : evaluationResult ? (
              <>
                {/* Result Header */}
                <div className="p-10 border-b border-gray-100 bg-gray-50 flex items-center justify-between shrink-0">
                  <div className="space-y-2">
                    <h2 className="text-2xl font-serif font-bold text-gray-900 uppercase tracking-tight">Ergebnisbericht</h2>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">Goethe-Zertifikat B2</span>
                      <div className="h-1 w-1 rounded-full bg-gray-300" />
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">{teil.label}</span>
                    </div>
                  </div>
                  <div className={cn(
                    "flex flex-col items-center justify-center h-24 w-24 rounded-full border-4 shadow-sm bg-white",
                    evaluationResult.score >= 60 ? "border-green-600 text-green-600" : "border-red-600 text-red-600"
                  )}>
                    <span className="text-3xl font-bold tabular-nums leading-none">{evaluationResult.score}</span>
                    <span className="text-[10px] font-bold uppercase opacity-60 tracking-tighter mt-1">Punkte</span>
                  </div>
                </div>

                <div className="p-10 overflow-y-auto custom-scrollbar flex-1 space-y-12 bg-white">
                  {/* Score Grid */}
                  <div className="grid grid-cols-2 gap-8">
                    {[
                      { label: 'Erfüllung', value: evaluationResult.aufgabenerfuellung },
                      { label: 'Interaktion', value: evaluationResult.interaktion },
                      { label: 'Wortschatz', value: evaluationResult.wortschatz },
                      { label: 'Strukturen', value: evaluationResult.strukturen_aussprache }
                    ].map((crit, idx) => (
                      <div key={idx} className="space-y-4">
                        <div className="flex justify-between items-baseline">
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{crit.label}</span>
                          <span className="text-sm font-bold text-gray-900">{crit.value}/25</span>
                        </div>
                        <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={cn(
                              "h-full rounded-full transition-all duration-1000 delay-300",
                              crit.value >= 15 ? "bg-gray-900" : "bg-gray-400"
                            )}
                            style={{ width: `${(crit.value / 25) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Corrections */}
                  {evaluationResult.turnCorrections && evaluationResult.turnCorrections.length > 0 && (
                    <div className="space-y-6">
                      <h3 className="text-xs font-bold text-gray-900 uppercase tracking-[0.3em] border-b border-gray-200 pb-3 flex items-center gap-3">
                        <PenTool className="h-4 w-4" />
                        Korrekturvorschläge
                      </h3>
                      <div className="space-y-6">
                        {evaluationResult.turnCorrections.map((corr, i) => (
                          <div key={i} className="space-y-3 pl-6 border-l-2 border-gray-100 group">
                            <p className="text-sm text-gray-400 italic">"{corr.original}"</p>
                            <p className="text-base font-serif font-bold text-gray-900">"{corr.improved}"</p>
                            {corr.reason && (
                              <p className="text-[11px] text-gray-500 font-serif italic">— {corr.reason}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Feedback */}
                  <div className="space-y-4">
                     <h3 className="text-xs font-bold text-gray-900 uppercase tracking-[0.3em] border-b border-gray-200 pb-3 flex items-center gap-3">
                        <MessageSquare className="h-4 w-4" />
                        Prüfer-Feedback
                     </h3>
                     <div className="bg-gray-50 p-8 rounded-sm border border-gray-100 text-[15px] leading-relaxed text-gray-700 font-serif italic whitespace-pre-wrap">
                        {evaluationResult.feedback}
                     </div>
                  </div>

                  {/* Tips */}
                  <div className="space-y-6">
                     <h3 className="text-xs font-bold text-gray-900 uppercase tracking-[0.3em] border-b border-gray-200 pb-3">Empfehlungen</h3>
                     <ul className="space-y-4">
                       {evaluationResult.tips.map((tip, i) => (
                         <li key={i} className="flex items-start gap-4 p-4 hover:bg-gray-50 transition-colors rounded-sm">
                            <div className="h-6 w-6 rounded-full bg-gray-900 flex items-center justify-center shrink-0 text-white text-[10px] font-bold mt-0.5">
                               {i + 1}
                            </div>
                            <p className="text-sm text-gray-600 font-medium leading-relaxed">{tip}</p>
                         </li>
                       ))}
                     </ul>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="p-8 border-t border-gray-100 bg-gray-50/80 shrink-0 flex justify-end gap-4">
                  <Button
                    variant="ghost"
                    onClick={() => setShowResultsModal(false)}
                    className="text-[10px] font-bold text-gray-400 hover:text-gray-900 uppercase tracking-widest h-12 px-6"
                  >
                    Schließen
                  </Button>
                  <Button
                    onClick={() => {
                      setShowResultsModal(false);
                      setConversation([]);
                      setTranscript('');
                      accumulatedTranscriptRef.current = '';
                      setTimeLeft(teil.nummer === 1 ? 240 : 300);
                      setHasStarted(false);
                    }}
                    className="bg-gray-900 hover:bg-black text-white font-bold uppercase text-[10px] tracking-widest px-10 h-12 rounded-sm shadow-xl"
                  >
                    Neu starten
                  </Button>
                </div>
              </>
            ) : null}
          </div>
        </div>
      )}
    </>
  );
};

export default GoetheB2SprechenSimulator;
