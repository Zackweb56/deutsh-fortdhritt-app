import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Info, Loader2, Mic, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import sprechenData from '@/data/preparation/goethe/b2/sprechen.json';
import GoetheExamLayout from '@/components/preparation/goethe/GoetheExamLayout';
import { playTTS } from '@/lib/tts';
import { getPreparationSpeakingReply, evaluatePreparationSpeaking, PreparationSpeakingResult } from '@/lib/ai/groq';
import Teil1 from './teile/Teil1';
import Teil2 from './teile/Teil2';

// Voice wave animation
const VoiceWaves = () => (
  <div className="flex items-center gap-px h-3">
    {[1, 2, 3, 4, 5].map((i) => (
      <div
        key={i}
        className="w-0.5 bg-gray-900"
        style={{
          height: '100%',
          animation: 'voiceWave 0.5s ease-in-out infinite',
          animationDelay: `${i * 0.1}s`,
        }}
      />
    ))}
  </div>
);

// @ts-ignore
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

const formatAufgabentyp = (nummer?: number): string => {
  if (nummer === 1) return 'Vortrag';
  if (nummer === 2) return 'Diskussion';
  return 'Sprechen';
};

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
      setTimeLeft(240); // 4 mins
    } else {
      setSelectedThema('thema1'); // Dummy for Teil 2
      setTimeLeft(300); // 5 mins
    }

    setConversation([]);
    setEvaluationResult(null);
    setShowResultsModal(false);
    setIsAiProcessing(false);
    setIsTimerRunning(false);
    setHasStarted(false);
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
    if (!SpeechRecognition) return;

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

    recognition.onerror = () => setIsRecording(false);
    recognition.onend = () => setIsRecording(false);
    recognitionRef.current = recognition;

    return () => {
      try { recognitionRef.current?.abort(); } catch (e) { }
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

  const handleJumpToTeil = (id: string) => {
    navigate(`/preparation/goethe/b2/sprechen/${id}/${topicId}`);
  };

  const userTurnCount = conversation.filter(m => m.role === 'user').length;
  const MAX_TURNS = teil?.nummer === 1 ? 6 : 10;
  const isTimeUp = hasStarted && timeLeft === 0;
  const isMaxTurnsReached = userTurnCount >= MAX_TURNS;
  const isInputDisabled = isAiProcessing || isEvaluating || isTimeUp || isMaxTurnsReached;

  const allTeile = sprechenData.teile.map(t => ({
    id: t.id,
    label: t.label,
    points: t.punkte ?? '—',
    examType: formatAufgabentyp(t.nummer),
    isCompleted: false,
  }));

  if (!teil || !topic) {
    return (
      <div className="min-h-screen bg-[#f1f5f9] flex items-center justify-center text-gray-400 font-bold uppercase tracking-widest text-xs" dir="ltr">
        Laden...
      </div>
    );
  }

  return (
    <>
      <style>{`
        @keyframes voiceWave {
          0%, 100% { transform: scaleY(0.4); }
          50% { transform: scaleY(1); }
        }
      `}</style>

      <GoetheExamLayout
        title={`${sprechenData.institut} — ${sprechenData.level}`}
        module={sprechenData.module}
        teil={teil.label}
        timeLeft={timeLeft}
        totalTimeLabel={teil.nummer === 1 ? '4 Min' : '5 Min'}
        progress={`${teil.nummer}/${sprechenData.teile.length}`}
        onZuruck={() => navigate(-1)}
        onWeiter={() => {
          const nextTeil = sprechenData.teile.find(t => t.nummer === teil.nummer + 1);
          if (nextTeil) navigate(`/preparation/goethe/b2/sprechen/${nextTeil.id}/${topicId}`);
        }}
        onAbgeben={handleEvaluate}
        onJumpToTeil={handleJumpToTeil}
        currentTeilId={teil.id}
        allTeile={allTeile}
      >
        <div className="flex flex-col lg:flex-row bg-white border border-gray-300 min-h-[60vh]">
          {/* Left Side: Task Paper */}
          <div className="flex-1 p-4 md:p-8 lg:p-10 border-b lg:border-b-0 lg:border-r border-gray-200 bg-white overflow-y-auto custom-scrollbar">
            <div className="max-w-2xl mx-auto space-y-4 md:space-y-6">
               <div className="bg-[#fff9c4] border border-gray-300 p-3 text-[10px] text-gray-800 leading-relaxed font-bold uppercase">
                  <div className="flex items-start gap-2">
                     <Info className="h-3.5 w-3.5 shrink-0 text-gray-400 mt-0.5" />
                     <div>
                        <p className="tracking-widest">Hinweise — {teil.label}</p>
                        <p className="italic text-[9px] font-medium lowercase tracking-tight mt-0.5">{teil.description}</p>
                     </div>
                  </div>
               </div>

               <div>
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
          <div className="w-full lg:w-[360px] bg-gray-50 flex flex-col shrink-0 border-l border-gray-100">
             {/* Status Header */}
             <div className="p-3 border-b border-gray-200 bg-white flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                   <div className={cn(
                      "w-2 h-2",
                      isAiProcessing ? "bg-amber-500 animate-pulse" : isRecording ? "bg-red-600 animate-pulse" : "bg-emerald-600"
                   )} />
                   <span className="text-[9px] font-bold text-gray-900 uppercase tracking-widest">
                      {isAiProcessing ? "Prüfer spricht" : isRecording ? "Aufnahme läuft" : "Bereit"}
                   </span>
                </div>
                {hasStarted && (
                   <div className="bg-gray-100 px-2 py-0.5 flex items-center gap-1 border border-gray-200">
                      <MessageSquare className="h-2.5 w-2.5 text-gray-400" />
                      <span className="text-[8px] font-bold text-gray-500 uppercase">{userTurnCount}/{MAX_TURNS}</span>
                   </div>
                )}
             </div>

             {/* Conversation Area */}
             <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[200px] lg:min-h-0" ref={scrollRef}>
                {!hasStarted ? (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-3 py-8">
                     <div className="h-10 w-10 border border-gray-200 bg-white flex items-center justify-center text-gray-300">
                        <Mic className="h-4 w-4" />
                     </div>
                     <div className="space-y-0.5">
                        <h4 className="text-[9px] font-bold text-gray-900 uppercase tracking-widest">Bereit zum Starten</h4>
                        <p className="text-[8px] text-gray-400">Mikrofon prüfen vor dem Start</p>
                     </div>
                     <Button 
                        onClick={handleStartConversation}
                        disabled={teil.nummer === 1 && !selectedThema}
                        className="bg-gray-900 text-white px-5 h-8 font-bold uppercase text-[8px] tracking-widest transition-none rounded-none disabled:opacity-40"
                     >
                        Beginnen
                     </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                     {conversation.map((msg, idx) => (
                        <div key={idx} className={cn("flex flex-col max-w-[95%]", msg.role === 'user' ? "ml-auto items-end" : "mr-auto items-start")}>
                           <span className="text-[7px] font-bold text-gray-400 uppercase tracking-widest mb-1 px-1">
                              {msg.role === 'user' ? "Ich" : "Prüfer"}
                           </span>
                           <div className={cn(
                              "p-2.5 text-[10px] leading-relaxed border",
                              msg.role === 'user' 
                                 ? "bg-gray-800 border-gray-800 text-white" 
                                 : "bg-white border-gray-200 text-gray-700"
                           )}>
                              {msg.text}
                           </div>
                        </div>
                     ))}
                     {transcript && (
                        <div className="ml-auto max-w-[95%]">
                           <div className="p-2.5 text-[10px] border border-dashed border-gray-300 text-gray-400 italic">
                              {transcript}
                           </div>
                        </div>
                     )}
                  </div>
                )}
             </div>

             {/* Controls Area */}
             {hasStarted && (
                <div className="p-3 bg-white border-t border-gray-200 space-y-2">
                   <textarea
                     value={transcript}
                     onChange={(e) => setTranscript(e.target.value)}
                     placeholder="Antworten oder Mikrofon nutzen..."
                     className="w-full bg-gray-50 border border-gray-200 p-2.5 text-[10px] text-gray-700 focus:border-gray-900 focus:ring-0 resize-none h-16 transition-none font-medium placeholder:text-gray-300 rounded-none"
                     disabled={isInputDisabled}
                   />

                   <div className="flex gap-2 h-8">
                      <Button
                        onClick={toggleRecording}
                        disabled={isInputDisabled}
                        className={cn(
                          "flex-1 h-full font-bold uppercase text-[8px] tracking-widest transition-none border rounded-none",
                          isRecording 
                            ? "bg-gray-100 border-gray-300 text-gray-900" 
                            : "bg-white border-gray-300 text-gray-600"
                        )}
                      >
                        {isRecording ? <VoiceWaves /> : <Mic className="h-3 w-3 mr-1" />}
                        <span>{isRecording ? "Hören" : "Sprechen"}</span>
                      </Button>
                      <Button
                        onClick={processUserTurn}
                        disabled={isInputDisabled || !transcript.trim() || isRecording}
                        className="flex-1 h-full bg-gray-900 text-white font-bold uppercase text-[8px] tracking-widest transition-none rounded-none disabled:opacity-40"
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/60 p-4" dir="ltr">
          <div className="bg-white border border-gray-200 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
            {isEvaluating ? (
              <div className="p-16 flex flex-col items-center justify-center gap-6 h-[320px]">
                <Loader2 className="h-8 w-8 text-gray-900 animate-spin" />
                <div className="text-center">
                  <h3 className="text-xs font-bold text-gray-900 uppercase tracking-widest">Analyse läuft</h3>
                  <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-1">Ihre Leistung wird nach Goethe-Standards analysiert</p>
                </div>
              </div>
            ) : evaluationResult ? (
              <>
                {/* Result Header */}
                <div className="p-5 border-b border-gray-100 bg-gray-50 flex items-center justify-between shrink-0">
                  <div>
                    <h2 className="text-sm font-bold text-gray-900 uppercase tracking-tight">Ergebnisbericht</h2>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">Goethe B2</span>
                      <span className="text-[8px] text-gray-300">•</span>
                      <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">{teil.label}</span>
                    </div>
                  </div>
                  <div className={cn(
                    "flex flex-col items-center justify-center h-14 w-14 border-2 bg-white",
                    evaluationResult.score >= 60 ? "border-green-600 text-green-600" : "border-red-600 text-red-600"
                  )}>
                    <span className="text-lg font-bold tabular-nums leading-none">{evaluationResult.score}</span>
                    <span className="text-[7px] font-bold uppercase opacity-60 mt-1">Punkte</span>
                  </div>
                </div>

                <div className="p-5 overflow-y-auto flex-1 space-y-5 text-xs custom-scrollbar">
                  {/* Score Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {[
                      { label: 'Erfüllung', value: evaluationResult.aufgabenerfuellung },
                      { label: 'Interaktion', value: evaluationResult.interaktion },
                      { label: 'Wortschatz', value: evaluationResult.wortschatz },
                      { label: 'Strukturen', value: evaluationResult.strukturen_aussprache }
                    ].map((item) => (
                      <div key={item.label} className="bg-gray-50 border border-gray-200 p-3 text-center">
                        <div className="text-[7px] font-bold text-gray-400 uppercase tracking-widest">{item.label}</div>
                        <div className="text-base font-bold text-gray-900 mt-1">{item.value}/25</div>
                      </div>
                    ))}
                  </div>

                  {/* Corrections */}
                  {evaluationResult.turnCorrections && evaluationResult.turnCorrections.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="text-[8px] font-bold text-gray-900 uppercase tracking-widest border-b border-gray-100 pb-1">Korrekturvorschläge</h3>
                      <div className="space-y-3">
                        {evaluationResult.turnCorrections.map((corr, i) => (
                          <div key={i} className="p-3 border border-gray-100 bg-white space-y-1">
                            <p className="text-[10px] text-gray-400 italic">"{corr.original}"</p>
                            <p className="text-[11px] font-bold text-gray-900">"{corr.improved}"</p>
                            {corr.reason && <p className="text-[9px] text-gray-500 mt-1 opacity-70">— {corr.reason}</p>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Feedback */}
                  <div className="space-y-2">
                     <h3 className="text-[8px] font-bold text-gray-900 uppercase tracking-widest border-b border-gray-100 pb-1">Feedback</h3>
                     <div className="p-4 bg-gray-50 border border-gray-100 leading-relaxed text-gray-700 italic whitespace-pre-wrap text-[10px]">
                        {evaluationResult.feedback}
                     </div>
                  </div>

                  {/* Tips */}
                  <div className="space-y-2">
                     <h3 className="text-[8px] font-bold text-gray-900 uppercase tracking-widest border-b border-gray-100 pb-1">Tipps</h3>
                     <ul className="space-y-1.5">
                       {evaluationResult.tips.map((tip, i) => (
                         <li key={i} className="flex gap-2 text-[10px] text-gray-700">
                            <span className="text-gray-300 font-bold">—</span>
                            <span>{tip}</span>
                         </li>
                       ))}
                     </ul>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 shrink-0">
                  <Button
                    variant="ghost"
                    onClick={() => setShowResultsModal(false)}
                    className="text-[8px] font-bold text-gray-400 hover:text-gray-900 uppercase tracking-widest h-8 px-4"
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
                    className="bg-gray-800 text-white font-bold uppercase text-[8px] tracking-widest px-6 h-8 rounded-none"
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
