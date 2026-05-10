import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Info, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import lesenData from '@/data/preparation/goethe/b2/lesen.json';
import GoetheExamLayout from '@/components/preparation/goethe/GoetheExamLayout';

import Teil1 from './teile/Teil1';
import Teil2 from './teile/Teil2';
import Teil3 from './teile/Teil3';
import Teil4 from './teile/Teil4';
import Teil5 from './teile/Teil5';

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

const formatAufgabentyp = (typ?: string): string => {
  if (!typ) return '';
  const map: Record<string, string> = {
    'richtig-falsch': 'R/F',
    'mehrfachauswahl-3-gliedrig': 'a/b/c',
    'zuordnung': 'Zuordnung',
    'lueckentext': 'Lückentext',
    'mehrfachauswahl': 'a/b/c',
    'zuordnung-personen': 'Zuordnung',
    'satzergaenzung': 'Lückentext',
    'multiple-choice-abc': 'a/b/c',
    'zuordnung-ueberschriften': 'Zuordnung',
    'zuordnung-paragrafen': 'Zuordnung',
  };
  return map[typ] || typ;
};

const GoetheB2LesenSimulator = () => {
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

    const currentTeil = lesenData.teile.find(t => t.id === teilId);
    if (!currentTeil) return;

    const currentTopic = currentTeil.themen?.find(t => t.id === topicId);
    if (!currentTopic) return;

    setTeil(currentTeil);
    setTopic(currentTopic);
    
    const seconds = parseDurationToSeconds(currentTeil.arbeitszeit);
    setTimeLeft(seconds);
    setIsTimerRunning(true);
    
    setAnswers({});
    setShowResults(false);
  }, [teilId, topicId]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
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

  const handleJumpToTeil = (id: string) => {
    navigate(`/preparation/goethe/b2/lesen/${id}`);
  };

  if (!teil || !topic) {
    return (
      <div className="min-h-screen bg-[#f1f5f9] flex items-center justify-center text-gray-500 font-bold uppercase tracking-widest text-xs" dir="ltr">
        Laden...
      </div>
    );
  }

  const renderTeil = () => {
    const props = { topic, answers, showResults, onAnswerChange: handleAnswerChange };
    switch (teil.nummer) {
      case 1: return <Teil1 {...props} />;
      case 2: return <Teil2 {...props} />;
      case 3: return <Teil3 {...props} />;
      case 4: return <Teil4 {...props} />;
      case 5: return <Teil5 {...props} />;
      default: return <div className="text-gray-900 p-4 text-xs">Teil nicht gefunden</div>;
    }
  };

  const answeredCount = Object.keys(answers).length;
  const totalCount = (() => {
    if (!topic) return 0;
    if (teil.nummer === 2) return topic.text?.match(/\[\.\.\.\d+\.\.\.\]/g)?.length ?? 0;
    if (topic.items) return topic.items.length;
    if (topic.situations) return topic.situations.length;
    return 0;
  })();

  const allTeile = lesenData.teile.map(t => ({
    id: t.id,
    label: t.label,
    points: (t as any).punkte,
    examType: formatAufgabentyp((t as any).aufgabentyp),
    isCompleted: false,
  }));

  return (
    <>
      <GoetheExamLayout
        title={`${lesenData.institut} — ${lesenData.level}`}
        module={lesenData.module}
        teil={teil.label}
        timeLeft={timeLeft}
        totalTimeLabel={teil.arbeitszeit}
        progress={`${teil.nummer}/${lesenData.teile.length}`}
        answeredCount={answeredCount}
        totalCount={totalCount}
        onZuruck={() => navigate(-1)}
        onWeiter={() => {
          const nextTeil = lesenData.teile.find(t => t.nummer === teil.nummer + 1);
          if (nextTeil) {
            navigate(`/preparation/goethe/b2/lesen/${nextTeil.id}/${topicId}`);
          }
        }}
        onAbgeben={handleSubmit}
        onJumpToTeil={handleJumpToTeil}
        currentTeilId={teil.id}
        allTeile={allTeile}
        disableMainScroll={true}
      >
        <div className="flex flex-col h-full bg-white border border-gray-300">
          {/* Part Instructions */}
          <div className="bg-[#fff9c4] border-b border-gray-300 p-3 md:p-4 text-[10px] md:text-xs text-gray-800 leading-relaxed font-bold">
             <div className="max-w-7xl mx-auto flex items-start gap-3">
                <Info className="h-4 w-4 mt-0.5 shrink-0 text-gray-400" />
                <p className="uppercase tracking-tight">{teil.instructions} {teil.pruefungsziel}</p>
             </div>
          </div>

          {/* Split Content Area */}
          <div className="flex-1 overflow-hidden">
            {renderTeil()}
          </div>
        </div>
      </GoetheExamLayout>
    </>
  );
};

export default GoetheB2LesenSimulator;
