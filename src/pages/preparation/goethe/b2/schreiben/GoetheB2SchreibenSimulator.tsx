import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Info, CheckCircle2, Loader2, PenTool, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import schreibenData from '@/data/preparation/goethe/b2/schreiben.json';
import { evaluatePreparationWriting, PreparationWritingResult } from '@/lib/ai/groq';
import GoetheExamLayout from '@/components/preparation/goethe/GoetheExamLayout';
import Teil1 from './teile/Teil1';
import Teil2 from './teile/Teil2';

const parseDurationToSeconds = (duration?: string): number => {
  if (!duration) return 0;
  const match = duration.match(/(\d+)/);
  if (!match) return 0;
  return parseInt(match[1], 10) * 60;
};

const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
};

const GoetheB2SchreibenSimulator = () => {
  const { teilId, topicId } = useParams<{ teilId: string; topicId: string }>();
  const navigate = useNavigate();

  const [teil, setTeil] = useState<any>(null);
  const [topic, setTopic] = useState<any>(null);
  const [userText, setUserText] = useState('');
  const [wordCount, setWordCount] = useState(0);

  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // Evaluation States
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState<PreparationWritingResult | null>(null);

  useEffect(() => {
    if (!teilId || !topicId) return;

    const currentTeil = schreibenData.teile.find(t => t.id === teilId);
    if (!currentTeil) return;

    const currentTopic = currentTeil.themen?.find((t: any) => t.id === topicId);
    if (!currentTopic) return;

    setTeil(currentTeil);
    setTopic(currentTopic);
    
    const seconds = parseDurationToSeconds(currentTeil.arbeitszeit);
    setTimeLeft(seconds);
    setIsTimerRunning(true);
    
    setUserText('');
    setWordCount(0);
    setEvaluationResult(null);
    setShowResultsModal(false);
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

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setUserText(text);
    const words = text.trim().split(/\s+/).filter(w => w.length > 0);
    setWordCount(words.length);
  };

  const handleSubmit = async () => {
    if (wordCount < teil.minWords) return;
    
    setIsTimerRunning(false);
    setIsEvaluating(true);
    setShowResultsModal(true);

    try {
      const result = await evaluatePreparationWriting({
        institute: schreibenData.institut,
        level: schreibenData.level,
        teilLabel: teil.label,
        themaTitle: topic.title,
        instructions: `Context: ${topic.context || topic.situation}\nAufgabe: ${teil.instructions}\nPunkte: ${topic.aufgabenpunkte.join(', ')}`,
        minWords: teil.minWords,
        userText: userText
      });
      setEvaluationResult(result);
    } catch (error) {
      console.error("Evaluation Error:", error);
      setEvaluationResult({
        score: 0,
        aufgabenerfuellung: 0,
        kohaerenz: 0,
        wortschatz: 0,
        strukturen: 0,
        feedback: "Es gab einen Fehler bei der Auswertung. Bitte versuchen Sie es später noch einmal.",
        improvedVersion: ""
      });
    } finally {
      setIsEvaluating(false);
    }
  };

  if (!teil || !topic) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center text-gray-900 font-sans" dir="ltr">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400 mr-3" />
        <span className="text-sm font-bold uppercase tracking-widest text-gray-400">Laden...</span>
      </div>
    );
  }

  const isSubmitDisabled = wordCount < teil.minWords || isEvaluating;

  return (
    <>
      <GoetheExamLayout
        title={`${schreibenData.institut} — ${schreibenData.level}`}
        module={schreibenData.module}
        teil={teil.label}
        timeLeft={timeLeft}
        progress={`${teil.nummer}/${schreibenData.teile.length}`}
        onZuruck={() => navigate(-1)}
        onWeiter={() => {
          if (teil.nummer === 1) {
            const nextTeil = schreibenData.teile.find(t => t.nummer === 2);
            if (nextTeil) {
              navigate(`/preparation/goethe/b2/schreiben/${nextTeil.id}/${topicId}`);
            }
          }
        }}
        onAbgeben={handleSubmit}
      >
        <div className="max-w-4xl mx-auto w-full pb-20 pt-8 px-6">
          {teil.nummer === 1 ? (
            <Teil1 
              teil={teil} 
              topic={topic} 
              userText={userText}
              onTextChange={handleTextChange}
              wordCount={wordCount}
            />
          ) : (
            <Teil2 
              teil={teil} 
              topic={topic} 
              userText={userText}
              onTextChange={handleTextChange}
              wordCount={wordCount}
            />
          )}
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
                  <h3 className="text-xl font-bold text-gray-900 uppercase tracking-widest">Analyse läuft</h3>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-widest animate-pulse">Ihr Text wird nach Goethe-Standards bewertet</p>
                </div>
              </div>
            ) : evaluationResult ? (
              <>
                {/* Result Header */}
                <div className="p-10 border-b border-gray-100 bg-gray-50 flex items-center justify-between shrink-0">
                  <div className="space-y-2">
                    <h2 className="text-2xl font-serif font-bold text-gray-900 uppercase tracking-tight">Bewertungsbericht</h2>
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
                      { label: 'Kohärenz', value: evaluationResult.kohaerenz },
                      { label: 'Wortschatz', value: evaluationResult.wortschatz },
                      { label: 'Strukturen', value: evaluationResult.strukturen }
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

                  {/* Improved Version */}
                  {evaluationResult.improvedVersion && (
                    <div className="space-y-6">
                      <h3 className="text-xs font-bold text-gray-900 uppercase tracking-[0.3em] border-b border-gray-200 pb-3 flex items-center gap-3">
                        <PenTool className="h-4 w-4" />
                        Optimierter Textvorschlag
                      </h3>
                      <div className="bg-gray-50 p-8 rounded-sm border border-gray-100 text-[15px] leading-[1.8] text-gray-800 font-serif italic whitespace-pre-wrap">
                        {evaluationResult.improvedVersion}
                      </div>
                    </div>
                  )}

                  {/* Feedback */}
                  <div className="space-y-4">
                     <h3 className="text-xs font-bold text-gray-900 uppercase tracking-[0.3em] border-b border-gray-200 pb-3 flex items-center gap-3">
                        <MessageSquare className="h-4 w-4" />
                        Korrekturanmerkungen
                     </h3>
                     <div className="prose prose-gray max-w-none text-[15px] leading-relaxed text-gray-700 font-serif italic whitespace-pre-wrap">
                        {evaluationResult.feedback}
                     </div>
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
                      setUserText('');
                      setWordCount(0);
                      setTimeLeft(parseDurationToSeconds(teil.arbeitszeit));
                      setIsTimerRunning(true);
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

export default GoetheB2SchreibenSimulator;
