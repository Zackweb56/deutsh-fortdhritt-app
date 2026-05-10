import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import schreibenData from '@/data/preparation/goethe/b1/schreiben.json';
import { evaluatePreparationWriting, PreparationWritingResult } from '@/lib/ai/groq';
import GoetheExamLayout from '@/components/preparation/goethe/GoetheExamLayout';
import Teil1 from './teile/Teil1';
import Teil2 from './teile/Teil2';
import Teil3 from './teile/Teil3';

const parseDurationToSeconds = (duration?: string): number => {
  if (!duration) return 0;
  const match = duration.match(/(\d+)/);
  if (!match) return 0;
  return parseInt(match[1], 10) * 60;
};

const formatAufgabentyp = (typ?: string, nummer?: number): string => {
  if (nummer === 1) return 'E-Mail';
  if (nummer === 2) return 'Meinung';
  if (nummer === 3) return 'E-Mail (kurz)';
  return 'Schreiben';
};

const GoetheB1SchreibenSimulator = () => {
  const { teilId, topicId } = useParams<{ teilId: string; topicId: string }>();
  const navigate = useNavigate();

  const [teil, setTeil] = useState<any>(null);
  const [topic, setTopic] = useState<any>(null);
  const [userText, setUserText] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  const [isEvaluating, setIsEvaluating] = useState(false);
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState<PreparationWritingResult | null>(null);
  const [showBeispiel, setShowBeispiel] = useState(false);

  useEffect(() => {
    if (!teilId || !topicId) return;

    const currentTeil = (schreibenData as any).teile.find((t: any) => t.id === teilId);
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
    setShowBeispiel(false);
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
    if (userText.trim().length === 0) return;

    setIsTimerRunning(false);
    setIsEvaluating(true);
    setShowResultsModal(true);

    try {
      const result = await evaluatePreparationWriting({
        institute: (schreibenData as any).institut,
        level: (schreibenData as any).level,
        teilLabel: teil.label,
        themaTitle: topic.title,
        instructions: `Context: ${topic.situation || topic.ausgangsmeinung || ''}
Aufgabe: ${teil.pruefungsziel}
Punkte: ${topic.aufgabenpunkte?.join(', ') || ''}`,
        minWords: teil.minWords,
        userText,
      });
      setEvaluationResult(result);
    } catch (error) {
      console.error('Evaluation Error:', error);
      setEvaluationResult({
        score: 0,
        aufgabenerfuellung: 0,
        kohaerenz: 0,
        wortschatz: 0,
        strukturen: 0,
        feedback: { gut: [], verbessern: ['Es gab einen Fehler bei der Auswertung. Bitte versuchen Sie es später noch einmal.'] },
        tipps: [],
        improvedVersion: '',
      });
    } finally {
      setIsEvaluating(false);
    }
  };

  // Navigate to topics selection page for that Teil
  const handleJumpToTeil = (id: string) => {
    navigate(`/preparation/goethe/b1/schreiben/${id}`);
  };

  if (!teil || !topic) {
    return (
      <div className="min-h-screen bg-[#f1f5f9] flex items-center justify-center text-gray-400 font-bold uppercase tracking-widest text-xs" dir="ltr">
        Laden...
      </div>
    );
  }

  const allTeile = (schreibenData as any).teile.map((t: any) => ({
    id: t.id,
    label: t.label,
    points: t.punkte ?? '—',
    examType: formatAufgabentyp(t.aufgabentyp, t.nummer) || t.pruefungsziel?.substring(0, 15),
    isCompleted: false,
  }));

  const renderTeil = () => {
    const props = { teil, topic, userText, onTextChange: handleTextChange, wordCount };
    switch (teil.nummer) {
      case 1: return <Teil1 {...props} />;
      case 2: return <Teil2 {...props} />;
      case 3: return <Teil3 {...props} />;
      default: return <div className="text-xs text-gray-400 p-4">Teil nicht gefunden</div>;
    }
  };

  return (
    <>
      <GoetheExamLayout
        title={`${(schreibenData as any).institut} — ${(schreibenData as any).level}`}
        module={(schreibenData as any).module}
        teil={teil.label}
        timeLeft={timeLeft}
        totalTimeLabel={teil.arbeitszeit}
        progress={`${teil.nummer}/${(schreibenData as any).teile.length}`}
        onZuruck={() => navigate(-1)}
        onWeiter={() => {
          const nextTeil = (schreibenData as any).teile.find((t: any) => t.nummer === teil.nummer + 1);
          if (nextTeil) navigate(`/preparation/goethe/b1/schreiben/${nextTeil.id}/${topicId}`);
        }}
        onAbgeben={handleSubmit}
        onJumpToTeil={handleJumpToTeil}
        currentTeilId={teil.id}
        allTeile={allTeile}
      >
        <div className="w-full space-y-6 pb-16 md:pb-20">
          <div className="bg-white border border-gray-300 p-4 md:p-8 space-y-6">
            <div className="border-b border-gray-100 pb-3 flex justify-between items-center">
              <h2 className="text-sm md:text-base font-bold text-gray-900 uppercase tracking-tight">
                {teil.label} — {teil.title}
              </h2>
              {topic.beispielantwort && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowBeispiel(!showBeispiel)}
                  className="text-[10px] uppercase font-bold tracking-widest h-8"
                >
                  {showBeispiel ? 'Beispiel ausblenden' : 'Beispiel anzeigen'}
                </Button>
              )}
            </div>

            {showBeispiel && topic.beispielantwort && (
              <div className="bg-yellow-50 border border-yellow-200 p-4 font-serif text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
                <div className="text-[9px] font-bold text-yellow-600 uppercase tracking-widest mb-2 font-sans">Beispielantwort</div>
                {topic.beispielantwort}
              </div>
            )}

            {renderTeil()}
          </div>
        </div>
      </GoetheExamLayout>

      {/* Evaluation Modal */}
      {showResultsModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/60 p-4" dir="ltr">
          <div className="bg-white border border-gray-200 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
            {isEvaluating ? (
              <div className="p-16 flex flex-col items-center justify-center gap-6 h-[360px]">
                <Loader2 className="h-8 w-8 text-gray-900 animate-spin" />
                <div className="text-center space-y-1">
                  <h3 className="text-xs font-bold text-gray-900 uppercase tracking-widest">Analyse läuft</h3>
                  <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Ihr Text wird bewertet...</p>
                </div>
              </div>
            ) : evaluationResult ? (
              <>
                <div className="p-6 border-b border-gray-100 bg-gray-50 flex items-center justify-between shrink-0">
                  <div className="space-y-0.5">
                    <h2 className="text-base font-bold text-gray-900 uppercase tracking-tight">Ergebnisbericht</h2>
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{teil.label}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      'px-3 py-1 text-[10px] font-bold uppercase tracking-widest border',
                      evaluationResult.score >= 60 ? 'bg-green-100 text-green-800 border-green-200' : 'bg-red-100 text-red-800 border-red-200'
                    )}>
                      {evaluationResult.score >= 60 ? 'Bestanden' : 'Nicht Bestanden'}
                    </div>
                    <div className={cn(
                      'flex flex-col items-center justify-center h-14 w-14 border-2 bg-white',
                      evaluationResult.score >= 60 ? 'border-green-600 text-green-600' : 'border-red-600 text-red-600'
                    )}>
                      <span className="text-lg font-bold tabular-nums leading-none">{evaluationResult.score}</span>
                      <span className="text-[7px] font-bold uppercase opacity-60 tracking-tighter">/ 100</span>
                    </div>
                  </div>
                </div>

                <div className="p-6 overflow-y-auto flex-1 space-y-6 text-xs">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      { label: 'Aufgabe', value: evaluationResult.aufgabenerfuellung },
                      { label: 'Kohärenz', value: evaluationResult.kohaerenz },
                      { label: 'Wortschatz', value: evaluationResult.wortschatz },
                      { label: 'Strukturen', value: evaluationResult.strukturen },
                    ].map(item => (
                      <div key={item.label} className="bg-gray-50 border border-gray-200 p-3 text-center">
                        <div className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">{item.label}</div>
                        <div className="text-base font-bold text-gray-900 mt-1">{item.value ?? '—'} <span className="text-xs text-gray-400">/ 25</span></div>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-6 pt-2">
                    <div className="space-y-3">
                      <h3 className="text-[10px] font-bold text-gray-900 uppercase tracking-widest border-b border-gray-200 pb-1">Feedback</h3>

                      {evaluationResult.feedback?.gut?.length > 0 && (
                        <div className="space-y-1">
                          <h4 className="text-sm font-bold text-green-700">Was war gut?</h4>
                          <ul className="list-disc pl-5 text-gray-700 text-sm space-y-0.5">
                            {evaluationResult.feedback.gut.map((item: string, i: number) => <li key={i}>{item}</li>)}
                          </ul>
                        </div>
                      )}

                      {evaluationResult.feedback?.verbessern?.length > 0 && (
                        <div className="space-y-1 mt-4">
                          <h4 className="text-sm font-bold text-red-700">Was muss verbessert werden?</h4>
                          <ul className="list-disc pl-5 text-gray-700 text-sm space-y-0.5">
                            {evaluationResult.feedback.verbessern.map((item: string, i: number) => <li key={i}>{item}</li>)}
                          </ul>
                        </div>
                      )}
                    </div>

                    {evaluationResult.tipps?.length > 0 && (
                      <div className="space-y-2 bg-blue-50 p-4 border border-blue-100">
                        <h4 className="text-[10px] font-bold text-blue-900 uppercase tracking-widest">Tipps für nächstes Mal</h4>
                        <ol className="list-decimal pl-4 text-blue-800 text-sm space-y-1">
                          {evaluationResult.tipps.map((item: string, i: number) => <li key={i}>{item}</li>)}
                        </ol>
                      </div>
                    )}

                    {evaluationResult.improvedVersion && (
                      <div className="space-y-2">
                        <h3 className="text-[9px] font-bold text-gray-900 uppercase tracking-widest border-b border-gray-100 pb-1 text-green-700">Musterlösung</h3>
                        <div className="p-4 bg-green-50 border border-green-100 leading-relaxed text-green-900 font-serif whitespace-pre-wrap">
                          {evaluationResult.improvedVersion}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
                  <Button
                    onClick={() => setShowResultsModal(false)}
                    className="bg-gray-800 text-white font-bold uppercase text-[9px] tracking-widest px-6 h-9 rounded-none"
                  >
                    Schließen
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

export default GoetheB1SchreibenSimulator;
