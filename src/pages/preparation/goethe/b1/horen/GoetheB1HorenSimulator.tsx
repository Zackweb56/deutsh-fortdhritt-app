import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import horenData from '@/data/preparation/goethe/b1/horen.json';
import GoetheExamLayout from '@/components/preparation/goethe/GoetheExamLayout';
import Teil1 from './teile/Teil1';
import Teil2 from './teile/Teil2';
import Teil3 from './teile/Teil3';
import Teil4 from './teile/Teil4';

const parseDurationToSeconds = (duration?: string): number => {
  if (!duration) return 0;
  const match = duration.match(/(\d+)/);
  return match ? parseInt(match[1], 10) * 60 : 0;
};

const formatAufgabentyp = (typ?: string): string => {
  if (!typ) return '';
  const map: Record<string, string> = {
    'richtig-falsch': 'R/F',
    'mehrfachauswahl-3-gliedrig': 'a/b/c',
    'zuordnung': 'Zuordnung',
    'mehrfachauswahl': 'a/b/c',
  };
  return map[typ] || typ;
};

const GoetheB1HorenSimulator: React.FC = () => {
  const { teilId, topicId } = useParams<{ teilId: string; topicId: string }>();
  const navigate = useNavigate();

  const [teil, setTeil] = useState<any>(null);
  const [topic, setTopic] = useState<any>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  useEffect(() => {
    if (!teilId || !topicId) return;

    const currentTeil = (horenData as any).teile.find((t: any) => t.id === teilId);
    if (!currentTeil) return;

    const currentTopic = currentTeil.themen?.find((t: any) => t.id === topicId);
    if (!currentTopic) return;

    setTeil(currentTeil);
    setTopic(currentTopic);
    setAnswers({});
    setShowResults(false);
    setTimeLeft(parseDurationToSeconds(currentTeil.arbeitszeit || '15 Minuten'));
    setIsTimerRunning(true);
  }, [teilId, topicId]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0 && isTimerRunning) {
      setIsTimerRunning(false);
      setShowResults(true);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timeLeft]);

  const handleAnswerChange = (itemId: string, value: string) => {
    if (showResults) return;
    setAnswers(prev => ({ ...prev, [itemId]: value }));
  };

  const handleSubmit = () => {
    setShowResults(true);
    setIsTimerRunning(false);
  };

  // Navigate to topics selection page for that Teil
  const handleJumpToTeil = (id: string) => {
    navigate(`/preparation/goethe/b1/horen/${id}`);
  };

  if (!teil || !topic) {
    return (
      <div className="min-h-screen bg-[#f1f5f9] flex items-center justify-center text-gray-400 font-bold uppercase tracking-widest text-xs" dir="ltr">
        Laden...
      </div>
    );
  }

  // Count answered questions for footer progress
  const answeredCount = Object.keys(answers).length;
  const totalCount = (() => {
    if (!topic) return 0;
    if (topic.audioTexts) return topic.audioTexts.reduce((acc: number, t: any) => acc + (t.items?.length ?? 0), 0);
    if (topic.items) return topic.items.length;
    return 0;
  })();

  const renderTeil = () => {
    const props = { topic, teil, answers, showResults, onAnswerChange: handleAnswerChange };
    switch (teil.nummer) {
      case 1: return <Teil1 {...props} />;
      case 2: return <Teil2 {...props} />;
      case 3: return <Teil3 {...props} />;
      case 4: return <Teil4 {...props} />;
      default: return <div className="text-gray-900 p-4 text-xs">Teil nicht gefunden</div>;
    }
  };

  const allTeile = (horenData as any).teile.map((t: any) => ({
    id: t.id,
    label: t.label,
    points: t.itemCount ?? t.punkte ?? '—',
    examType: (t.aufgabentyp as string)?.split(' ')[0] || t.answerType || '',
    isCompleted: false,
  }));

  return (
    <GoetheExamLayout
      title={`${(horenData as any).institut} — ${(horenData as any).level}`}
      module={(horenData as any).module}
      teil={teil.label}
      timeLeft={timeLeft}
      totalTimeLabel={teil.arbeitszeit}
      progress={`${teil.nummer}/${(horenData as any).teile.length}`}
      answeredCount={answeredCount}
      totalCount={totalCount}
      onZuruck={() => navigate(-1)}
      onWeiter={() => {
        const nextTeil = (horenData as any).teile.find((t: any) => t.nummer === teil.nummer + 1);
        if (nextTeil) {
          navigate(`/preparation/goethe/b1/horen/${nextTeil.id}/${topicId}`);
        }
      }}
      onAbgeben={handleSubmit}
      onJumpToTeil={handleJumpToTeil}
      currentTeilId={teil.id}
      allTeile={allTeile}
    >
      <div className="w-full space-y-6 pb-16 md:pb-20">
        <div className="bg-white border border-gray-300 p-4 md:p-8 space-y-6 md:space-y-8">
          <div className="border-b border-gray-200 pb-3">
            <h2 className="text-sm md:text-base font-bold text-gray-900 uppercase tracking-tight">{teil.label} — {teil.title}</h2>
          </div>

          <div className="bg-[#fff9c4] border border-gray-200 p-3 md:p-4 flex items-start gap-3">
            <Info className="h-4 w-4 mt-0.5 shrink-0 text-gray-400" />
            <div className="space-y-1">
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-none">Anweisung</p>
              <p className="text-[10px] md:text-xs text-gray-800 leading-relaxed font-bold">{teil.description || teil.pruefungsziel}</p>
            </div>
          </div>

          <div className="space-y-8 md:space-y-12">
            {renderTeil()}
          </div>
        </div>
      </div>
    </GoetheExamLayout>
  );
};

export default GoetheB1HorenSimulator;
