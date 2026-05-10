import React from 'react';
import { cn } from '@/lib/utils';
import { Check, X } from 'lucide-react';

interface Teil3Props {
  topic: any;
  answers: Record<string, string>;
  showResults: boolean;
  onAnswerChange: (id: string, value: string) => void;
}

const Teil3: React.FC<Teil3Props> = ({ topic, answers, showResults, onAnswerChange }) => {
  if (!topic) return null;



  const answeredCount = topic.items?.filter((item: any) => !!answers[item.id]).length ?? 0;
  const totalCount    = topic.items?.length ?? 0;

  return (
    <div className="flex flex-col lg:flex-row h-full bg-[#f1f5f9]">
      {/* ── Left: Reading Text ── */}
      <div className="flex-1 overflow-y-auto p-6 md:p-10 bg-white border-b lg:border-b-0 lg:border-r border-gray-300">
        <div className="max-w-2xl mx-auto space-y-5">
           <div className="border-b-2 border-gray-900 pb-3">
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Leseverstehen — Teil 3</p>
              <h2 className="text-base font-bold text-gray-900 uppercase tracking-tight mt-0.5">{topic.title}</h2>
           </div>
           
           <div className="bg-gray-50 border border-gray-200 p-6 space-y-3">
              <div className="text-xs text-gray-800 leading-relaxed font-serif whitespace-pre-line">
                {topic.text}
              </div>
           </div>
        </div>
      </div>

      {/* ── Right: Questions Area ── */}
      <div className="w-full lg:w-[420px] overflow-y-auto bg-gray-50 p-5 md:p-8 shrink-0 border-l border-gray-300">
        <div className="space-y-5">
           <div className="flex items-center justify-between border-b border-gray-300 pb-3">
              <div className="space-y-0.5">
                <h3 className="text-[9px] font-bold text-gray-900 uppercase tracking-widest">Aufgaben</h3>
                <p className="text-[8px] text-gray-400 font-bold uppercase">Wählen Sie a, b oder c</p>
              </div>
              <span className={cn(
                'text-[8px] font-bold px-2 py-0.5 border uppercase tracking-wide',
                answeredCount === totalCount
                  ? 'bg-green-50 border-green-300 text-green-700'
                  : 'bg-gray-100 border-gray-300 text-gray-400'
              )}>
                {answeredCount} / {totalCount} beantwortet
              </span>
           </div>
           
           <div className="space-y-2.5">
              {topic.items?.map((item: any) => {
                const selected   = answers[item.id];
                const isAnswered = !!selected;
                const isCorrect  = selected === item.correct;

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
                          : 'bg-white border-gray-300'
                    )}
                  >
                    <div className="p-3 space-y-2.5">
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
                        <div className="shrink-0 flex items-center gap-1">
                          {showResults && (
                            isCorrect
                              ? <Check className="h-3.5 w-3.5 text-green-600" />
                              : <X className="h-3.5 w-3.5 text-red-600" />
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col gap-1.5 pl-5">
                        {item.options.map((opt: any) => {
                          const isSelected = selected === opt.value;
                          const isActuallyCorrect = opt.value === item.correct;

                          return (
                            <button
                              key={opt.value}
                              disabled={showResults}
                              onClick={() => onAnswerChange(item.id, opt.value)}
                              className={cn(
                                'flex items-start gap-3 w-full p-1.5 transition-none text-left',
                                showResults && isSelected && isActuallyCorrect && 'text-green-700',
                                showResults && isSelected && !isActuallyCorrect && 'text-red-700',
                                showResults && !isSelected && isActuallyCorrect && 'text-green-700',
                                !showResults && isSelected && 'text-blue-700'
                              )}
                            >
                              <div className={cn(
                                "w-5 h-5 flex items-center justify-center border font-bold text-[10px] shrink-0 uppercase",
                                isSelected && !showResults ? "border-gray-900 bg-gray-900 text-white" : "border-gray-800 bg-white text-gray-800",
                                showResults && isSelected && isActuallyCorrect && "border-green-600 bg-green-600 text-white",
                                showResults && isSelected && !isActuallyCorrect && "border-red-600 bg-red-600 text-white"
                              )}>
                                {isSelected ? 'X' : opt.value}
                              </div>
                              <span className="text-[11px] font-medium leading-tight pt-0.5">{opt.label}</span>
                            </button>
                          );
                        })}
                      </div>

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

export default Teil3;
