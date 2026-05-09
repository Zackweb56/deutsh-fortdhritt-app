import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Info, CheckCircle2, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import horenData from '@/data/preparation/goethe/b2/horen.json';
import GoetheExamLayout from '@/components/preparation/goethe/GoetheExamLayout';
import { Volume2, Play } from 'lucide-react';
import Teil1 from './teile/Teil1';
import Teil2 from './teile/Teil2';
import Teil3 from './teile/Teil3';
import Teil4 from './teile/Teil4';

const parseDurationToSeconds = (duration?: string): number => {
  if (!duration) return 0;
  const match = duration.match(/(\d+)/);
  return match ? parseInt(match[1], 10) * 60 : 0;
};

const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
};

const GoetheB2HorenSimulator: React.FC = () => {
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

    const currentTeil = horenData.teile.find((t: any) => t.id === teilId);
    if (!currentTeil) return;

    let currentTopic: any = null;
    if (currentTeil.themen) {
      currentTopic = currentTeil.themen.find((t: any) => t.id === topicId);
    }

    if (!currentTopic) return;

    setTeil(currentTeil);
    setTopic(currentTopic);
    setAnswers({});
    setShowResults(false);
    setTimeLeft(parseDurationToSeconds(currentTeil.arbeitszeit));
    setIsTimerRunning(true);
  }, [teilId, topicId]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    } else if (timeLeft === 0 && isTimerRunning) {
      setIsTimerRunning(false);
      setShowResults(true);
    }

    return () => clearInterval(interval);
  }, [isTimerRunning, timeLeft]);

  const handleAnswerChange = (itemId: string, value: string) => {
    if (showResults) return;
    setAnswers((prev) => ({ ...prev, [itemId]: value }));
  };

  const handleSubmit = () => {
    setShowResults(true);
    setIsTimerRunning(false);
  };

  if (!teil || !topic) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center text-gray-900 font-sans" dir="ltr">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400 mr-3" />
        <span className="text-sm font-bold uppercase tracking-widest text-gray-400">Laden...</span>
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
      default: return <div className="p-4">Teil nicht gefunden</div>;
    }
  };

  return (
    <>
      <GoetheExamLayout
        title={`${horenData.institut} — ${horenData.level}`}
        module={horenData.module}
        teil={teil.label}
        timeLeft={timeLeft}
        progress={`${teil.nummer}/${horenData.teile.length}`}
        onZuruck={() => navigate(-1)}
        onWeiter={() => {
          const nextTeil = horenData.teile.find((t: any) => t.nummer === teil.nummer + 1);
          if (nextTeil) {
            navigate(`/preparation/goethe/b2/horen/${nextTeil.id}/${topicId}`);
          }
        }}
        onAbgeben={handleSubmit}
      >
        <div className="max-w-4xl mx-auto w-full space-y-8 pb-20">
          {/* Audio Player & Instructions */}
          <div className="bg-white border border-gray-300 shadow-sm rounded-sm overflow-hidden">
             <div className="bg-gray-50 border-b border-gray-200 p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                   <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-600">
                      <Volume2 className="h-6 w-6" />
                   </div>
                   <div>
                      <h3 className="text-sm font-bold text-gray-800 uppercase tracking-tight">{teil.title}</h3>
                      <p className="text-[10px] font-bold text-gray-400 uppercase">Hörverstehen — {teil.label}</p>
                   </div>
                </div>

                <div className="flex items-center gap-6">
                   <div className="flex flex-col items-end">
                      <span className="text-[10px] font-bold text-gray-400 uppercase">Wiederholungen</span>
                      <span className="text-sm font-bold text-gray-800">1 von 2</span>
                   </div>
                   <Button className="bg-gray-800 hover:bg-black text-white px-8 h-10 rounded-sm font-bold uppercase text-xs flex items-center gap-2">
                      <Play className="h-4 w-4 fill-current" />
                      Abspielen
                   </Button>
                </div>
             </div>
             
             <div className="p-6 bg-[#fff9c4] text-sm text-[#5d4037] leading-relaxed">
                <div className="flex items-start gap-3">
                   <Info className="h-4 w-4 mt-0.5 shrink-0" />
                   <p className="font-bold uppercase tracking-tight">{teil.description} {teil.pruefungsziel}</p>
                </div>
             </div>
          </div>

          {/* Questions Area */}
          <div className="space-y-6">
            {renderTeil()}
          </div>
        </div>
      </GoetheExamLayout>
    </>
  );
};

export default GoetheB2HorenSimulator;
