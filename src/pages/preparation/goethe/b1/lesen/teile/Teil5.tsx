import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Check, X, Flag } from 'lucide-react';

interface Teil5Props {
  topic: any;
  answers: Record<string, string>;
  showResults: boolean;
  onAnswerChange: (itemId: string, value: string) => void;
}

const Teil5: React.FC<Teil5Props> = ({ topic, answers, showResults, onAnswerChange }) => {
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

  const answeredCount = topic.items?.filter((item: any) => !!answers[item.id]).length ?? 0;
  const totalCount    = topic.items?.length ?? 0;

  // text may be a string or object
  const textContent = typeof topic.text === 'object' ? topic.text?.content ?? '' : topic.text ?? '';

  return (
    <div className="flex flex-col lg:flex-row h-full bg-[#f1f5f9]">

      {/* Left: Document */}
      <div className="flex-1 overflow-y-auto p-6 md:p-10 bg-white border-b lg:border-b-0 lg:border-r border-gray-300">
        <div className="max-w-2xl mx-auto space-y-5">
          <div className="border-b-2 border-gray-900 pb-3">
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Leseverstehen — Teil 5</p>
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-tight mt-0.5">
              {topic.title || 'Hausordnung'}
            </h2>
          </div>
          <div className="bg-gray-50 border border-gray-200 p-6">
            <div className="text-[11px] text-gray-800 leading-relaxed font-serif whitespace-pre-line">
              {textContent}
            </div>
          </div>
        </div>
      </div>

      {/* Right: Questions */}
      <div className="w-full lg:w-[400px] overflow-y-auto bg-gray-50 p-5 md:p-8 shrink-0 border-l border-gray-300">
        <div className="space-y-5">

          {/* Counter */}
          <div className="flex items-center justify-between border-b border-gray-300 pb-3">
            <h3 className="text-[9px] font-bold text-gray-900 uppercase tracking-widest">Fragen</h3>
            <span className={cn(
              'text-[8px] font-bold px-2 py-0.5 border uppercase tracking-wide',
              answeredCount === totalCount && totalCount > 0
                ? 'bg-green-50 border-green-300 text-green-700'
                : 'bg-gray-100 border-gray-300 text-gray-400'
            )}>
              {answeredCount} / {totalCount}
            </span>
          </div>

          <div className="space-y-2.5">
            {topic.items?.map((item: any) => {
              const selected   = answers[item.id];
              const isAnswered = !!selected;
              const isCorrect  = selected === item.correct;
              const isMarked   = markedItems.has(item.id);

              const normalizedOptions: Array<{ label: string; value: string }> =
                Array.isArray(item.options)
                  ? item.options.map((opt: any, i: number) =>
                      typeof opt === 'string'
                        ? { label: opt, value: String.fromCharCode(97 + i) }
                        : { label: opt.label, value: opt.value }
                    )
                  : [];

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
                        ? 'bg-blue-50 border-blue-300'
                        : isMarked
                          ? 'bg-yellow-50 border-yellow-300'
                          : 'bg-white border-gray-300'
                  )}
                >
                  <div className="p-3 space-y-2.5">
                    {/* Question header */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex gap-2 flex-1">
                        <span className={cn(
                          'text-[9px] font-black mt-0.5 shrink-0',
                          isAnswered && !showResults ? 'text-blue-500' : 'text-gray-400'
                        )}>
                          {item.id}.
                        </span>
                        <p className="text-[11px] text-gray-800 font-medium leading-snug">{item.text}</p>
                      </div>
                      <div className="shrink-0">
                        {showResults
                          ? isCorrect
                            ? <Check className="h-3.5 w-3.5 text-green-600" />
                            : <X className="h-3.5 w-3.5 text-red-600" />
                          : (
                            <button
                              onClick={() => toggleMark(item.id)}
                              className="text-gray-300 hover:text-yellow-500 transition-none"
                            >
                              <Flag className={cn('h-3 w-3', isMarked && 'fill-yellow-400 text-yellow-400')} />
                            </button>
                          )
                        }
                      </div>
                    </div>

                    {/* Options */}
                    <div className="flex flex-col gap-1.5 pl-4">
                      {normalizedOptions.map((opt) => {
                        const isSelected = selected === opt.value;
                        const isCorrectOpt = opt.value === item.correct;
                        return (
                          <button
                            key={opt.value}
                            disabled={showResults}
                            onClick={() => onAnswerChange(item.id, opt.value)}
                            className={cn(
                              'flex items-center gap-2 px-3 py-1.5 border text-left transition-none w-full',
                              isSelected
                                ? 'bg-[#1e293b] border-[#1e293b] text-white'
                                : 'bg-white border-gray-200 text-gray-600 hover:border-gray-400',
                              showResults && isSelected && isCorrect  && 'bg-green-600 border-green-600 text-white',
                              showResults && isSelected && !isCorrect && 'bg-red-600 border-red-600 text-white',
                              showResults && !isSelected && isCorrectOpt && 'border-green-400 bg-green-50 text-green-700'
                            )}
                          >
                            <span className={cn(
                              'text-[9px] font-black w-3 shrink-0',
                              isSelected ? 'text-white/70' : 'text-gray-400'
                            )}>
                              {opt.value}.
                            </span>
                            <span className="text-[10px] font-medium leading-tight">{opt.label}</span>
                          </button>
                        );
                      })}
                    </div>

                    {showResults && !isCorrect && (
                      <div className="pl-4 flex justify-between">
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

export default Teil5;
