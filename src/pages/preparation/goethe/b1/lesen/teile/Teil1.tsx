import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Check, X, Flag } from 'lucide-react';

interface Teil1Props {
  topic: any;
  answers: Record<string, string>;
  showResults: boolean;
  onAnswerChange: (itemId: string, value: string) => void;
}

const Teil1: React.FC<Teil1Props> = ({ topic, answers, showResults, onAnswerChange }) => {
  const [markedItems, setMarkedItems] = useState<Set<string>>(new Set());

  if (!topic) return null;

  const toggleMark = (id: string) => {
    setMarkedItems(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const textTitle = typeof topic.text === 'object' ? topic.text.title : null;
  const textDatum  = typeof topic.text === 'object' ? topic.text.datum  : null;
  const textContent = typeof topic.text === 'object' ? topic.text.content : topic.text;

  const answeredCount = topic.items?.filter((item: any) => !!answers[item.id]).length ?? 0;
  const totalCount    = topic.items?.length ?? 0;

  return (
    <div className="flex flex-col lg:flex-row h-full bg-[#f1f5f9]">

      {/* ── Left: Reading Text ── */}
      <div className="flex-1 overflow-y-auto p-6 md:p-10 bg-white border-b lg:border-b-0 lg:border-r border-gray-300">
        <div className="max-w-2xl mx-auto space-y-5">
          <div className="border-b-2 border-gray-900 pb-3">
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Leseverstehen — Teil 1</p>
            <h2 className="text-base font-bold text-gray-900 uppercase tracking-tight mt-0.5">{topic.title}</h2>
          </div>

          <div className="bg-gray-50 border border-gray-200 p-6 space-y-3">
            {textTitle && (
              <h4 className="text-xs font-bold text-gray-900 border-b border-gray-200 pb-2">{textTitle}</h4>
            )}
            {textDatum && (
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{textDatum}</p>
            )}
            <div className="text-xs text-gray-800 leading-relaxed font-serif whitespace-pre-line">
              {textContent}
            </div>
          </div>
        </div>
      </div>

      {/* ── Right: Questions ── */}
      <div className="w-full lg:w-[420px] overflow-y-auto bg-gray-50 p-5 md:p-8 shrink-0 border-l border-gray-300">
        <div className="space-y-5">

          {/* Header with counter */}
          <div className="flex items-center justify-between border-b border-gray-300 pb-3">
            <h3 className="text-[9px] font-bold text-gray-900 uppercase tracking-widest">Aufgaben</h3>
            <span className={cn(
              'text-[8px] font-bold px-2 py-0.5 border uppercase tracking-wide',
              answeredCount === totalCount
                ? 'bg-green-50 border-green-300 text-green-700'
                : 'bg-gray-100 border-gray-300 text-gray-400'
            )}>
              {answeredCount} / {totalCount} beantwortet
            </span>
          </div>

          {/* Beispiel */}
          {topic.beispiel && (
            <div className="space-y-1 opacity-60">
              <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">Beispiel</span>
              <div className="p-3 bg-gray-100 border border-gray-200">
                <div className="flex gap-2 mb-2">
                  <span className="text-[9px] font-bold text-gray-400">0.</span>
                  <p className="text-[11px] text-gray-700 font-medium leading-snug">{topic.beispiel.text}</p>
                </div>
                <div className="flex gap-2 pl-4">
                  <div className="goethe-option active py-0.5 px-3 pointer-events-none">
                    <div className="goethe-radio active" />
                    <span className="text-[9px] font-bold uppercase">{topic.beispiel.correct}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Questions */}
          <div className="space-y-2.5">
            {topic.items?.map((item: any) => {
              const selected   = answers[item.id];
              const isAnswered = !!selected;
              const isCorrect  = selected === item.correct;
              const isMarked   = markedItems.has(item.id);

              return (
                <div
                  key={item.id}
                  className={cn(
                    'border transition-none',
                    showResults
                      ? isCorrect
                        ? 'bg-green-50 border-green-300'
                        : 'bg-red-50 border-red-300'
                      : isAnswered
                        ? 'bg-blue-50 border-blue-300'   // ← blue highlight when answered
                        : isMarked
                          ? 'bg-yellow-50 border-yellow-300'
                          : 'bg-white border-gray-300'
                  )}
                >
                  <div className="p-3 space-y-2.5">
                    {/* Question row */}
                    <div className="flex items-start gap-2 justify-between">
                      <div className="flex gap-2 flex-1">
                        <span className={cn(
                          'text-[9px] font-black mt-0.5 w-4 shrink-0',
                          isAnswered && !showResults ? 'text-blue-500' : 'text-gray-400'
                        )}>
                          {item.id}.
                        </span>
                        <p className="text-[11px] text-gray-800 font-medium leading-snug">{item.text}</p>
                      </div>

                      {/* Flag / result icon */}
                      <div className="shrink-0 flex items-center gap-1">
                        {showResults ? (
                          isCorrect
                            ? <Check className="h-3.5 w-3.5 text-green-600" />
                            : <X className="h-3.5 w-3.5 text-red-600" />
                        ) : (
                          <button
                            onClick={() => toggleMark(item.id)}
                            className="p-0.5 text-gray-300 hover:text-yellow-500 transition-none"
                            title="Markieren"
                          >
                            <Flag className={cn('h-3 w-3', isMarked && 'fill-yellow-400 text-yellow-400')} />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Pill buttons: Richtig / Falsch */}
                    <div className="flex gap-2 pl-5">
                      {['Richtig', 'Falsch'].map((option) => {
                        const isSelected = selected === option;
                        return (
                          <button
                            key={option}
                            disabled={showResults}
                            onClick={() => onAnswerChange(item.id, option)}
                            className={cn(
                              'flex-1 py-1.5 text-center border font-bold text-[9px] uppercase tracking-wide transition-none',
                              isSelected
                                ? 'bg-[#1e293b] border-[#1e293b] text-white'
                                : 'bg-white border-gray-300 text-gray-500 hover:border-gray-500 hover:text-gray-700',
                              showResults && isSelected && isCorrect  && 'bg-green-600 border-green-600 text-white',
                              showResults && isSelected && !isCorrect && 'bg-red-600 border-red-600 text-white',
                              showResults && !isSelected && option === item.correct && 'border-green-500 text-green-600 bg-green-50'
                            )}
                          >
                            {option}
                          </button>
                        );
                      })}
                    </div>

                    {/* Show correct answer when wrong */}
                    {showResults && !isCorrect && (
                      <div className="pl-5 flex items-center justify-between">
                        <span className="text-[8px] font-bold text-red-600 uppercase">Falsch</span>
                        <span className="text-[8px] font-bold text-green-600 uppercase">Soll: {item.correct}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Teil1;
