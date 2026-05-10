import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Check, X, Volume2, Flag } from 'lucide-react';
import AudioPlayer from '../components/AudioPlayer';

interface Teil1Props {
  topic: any;
  teil: any;
  answers: Record<string, string>;
  showResults: boolean;
  onAnswerChange: (itemId: string, value: string) => void;
}

const Teil1: React.FC<Teil1Props> = ({ topic, teil, answers, showResults, onAnswerChange }) => {
  const [markedItems, setMarkedItems] = useState<Set<string>>(new Set());

  if (!topic) return null;

  const audioTexts = topic.audioTexts || [];
  const maxPlays = 2;

  const toggleMark = (id: string) => {
    setMarkedItems(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const allItems = audioTexts.flatMap((t: any) => t.items ?? []);
  const answeredCount = allItems.filter((item: any) => !!answers[item.id]).length;
  const totalCount = allItems.length;

  const renderItem = (item: any) => {
    const selected  = answers[item.id];
    const isAnswered = !!selected;
    const isCorrect  = selected === item.correct;
    const isMarked   = markedItems.has(item.id);
    const isRF       = item.type === 'richtig-falsch' || (!item.options);

    return (
      <div
        key={item.id}
        className={cn(
          'border transition-none',
          showResults
            ? isCorrect ? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-300'
            : isAnswered ? 'bg-blue-50 border-blue-300'
              : isMarked  ? 'bg-yellow-50 border-yellow-300'
              : 'bg-white border-gray-300'
        )}
      >
        <div className="p-3 space-y-2.5">
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
                  : (
                    <div className="flex flex-col items-end gap-0.5">
                      <X className="h-3.5 w-3.5 text-red-600" />
                      <span className="text-[7px] font-bold text-green-600 uppercase">{item.correct}</span>
                    </div>
                  )
                : (
                  <button onClick={() => toggleMark(item.id)} className="text-gray-200 hover:text-yellow-400 transition-none">
                    <Flag className={cn('h-3 w-3', isMarked && 'fill-yellow-400 text-yellow-400')} />
                  </button>
                )
              }
            </div>
          </div>

          {/* R/F or MCQ pill buttons */}
          <div className="flex gap-2 pl-5">
            {isRF ? (
              ['Richtig', 'Falsch'].map((option) => {
                const isSel = selected === option;
                return (
                  <button
                    key={option}
                    disabled={showResults}
                    onClick={() => onAnswerChange(item.id, option)}
                    className={cn(
                      'flex-1 text-center py-1.5 border font-bold text-[9px] uppercase tracking-wide transition-none',
                      isSel ? 'bg-[#1e293b] border-[#1e293b] text-white' : 'bg-white border-gray-300 text-gray-500 hover:border-gray-500',
                      showResults && isSel && isCorrect  && 'bg-green-600 border-green-600 text-white',
                      showResults && isSel && !isCorrect && 'bg-red-600 border-red-600 text-white',
                      showResults && !isSel && option === item.correct && 'border-green-500 text-green-600 bg-green-50'
                    )}
                  >
                    {option}
                  </button>
                );
              })
            ) : (
              <div className="flex flex-col gap-1.5 w-full">
                {item.options.map((option: any, idx: number) => {
                  const val = typeof option === 'string' ? option : option.value;
                  const label = typeof option === 'string' ? String.fromCharCode(97 + idx) : option.value;
                  const text  = typeof option === 'string' ? option : option.label;
                  const isSel = selected === val;
                  const isCorrectOpt = item.correct === val;
                  return (
                    <button
                      key={val}
                      disabled={showResults}
                      onClick={() => onAnswerChange(item.id, val)}
                      className={cn(
                        'flex items-center gap-2 px-3 py-1.5 border text-left w-full transition-none',
                        isSel ? 'bg-[#1e293b] border-[#1e293b] text-white' : 'bg-white border-gray-200 text-gray-600 hover:border-gray-400',
                        showResults && isSel && isCorrect  && 'bg-green-600 border-green-600 text-white',
                        showResults && isSel && !isCorrect && 'bg-red-600 border-red-600 text-white',
                        showResults && !isSel && isCorrectOpt && 'border-green-400 bg-green-50 text-green-700'
                      )}
                    >
                      <span className={cn('text-[9px] font-black w-3 shrink-0', isSel ? 'text-white/70' : 'text-gray-400')}>{label}.</span>
                      <span className="text-[10px] font-medium leading-tight">{text}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-10 max-w-4xl mx-auto pb-8">
      {/* Italic context from topic */}
      {(topic.description || topic.title) && (
        <div className="border-l-2 border-gray-400 pl-3 py-1 bg-gray-50">
          <p className="text-[11px] text-gray-600 italic font-serif leading-relaxed">
            {topic.description || topic.title}
          </p>
        </div>
      )}

      {/* Global counter */}
      <div className="flex items-center justify-between border-b border-gray-300 pb-2">
        <h3 className="text-[9px] font-bold text-gray-900 uppercase tracking-widest">Hören — Teil 1</h3>
        <span className={cn(
          'text-[8px] font-bold px-2 py-0.5 border uppercase tracking-wide',
          answeredCount === totalCount && totalCount > 0
            ? 'bg-green-50 border-green-300 text-green-700'
            : 'bg-gray-100 border-gray-300 text-gray-400'
        )}>
          {answeredCount} / {totalCount} beantwortet
        </span>
      </div>

      {audioTexts.map((text: any, index: number) => {
        const audioPath = `/media/audio/goethe/horen/b2/${text.audio}`;
        const textAnswered = (text.items ?? []).filter((i: any) => !!answers[i.id]).length;
        const textTotal = (text.items ?? []).length;

        return (
          <div key={text.id} className="space-y-4">
            {/* Audio block header */}
            <div className="flex items-center gap-3 border-l-2 border-gray-900 pl-3 py-1">
              <div className="flex-1">
                <h3 className="text-[10px] font-bold text-gray-900 uppercase tracking-tight">
                  {text.title || `Text ${index + 1}`}
                </h3>
                {index === 0 && (
                  <span className="text-[8px] font-bold text-blue-600 uppercase tracking-widest">Beispiel</span>
                )}
              </div>
              <span className={cn(
                'text-[7px] font-bold px-1.5 py-0.5 border tracking-wide uppercase',
                textAnswered === textTotal && textTotal > 0
                  ? 'bg-green-50 border-green-300 text-green-700'
                  : 'bg-gray-50 border-gray-200 text-gray-400'
              )}>
                {textAnswered}/{textTotal}
              </span>
            </div>

            {/* Audio player */}
            <AudioPlayer src={audioPath} maxPlays={maxPlays} />

            {/* Questions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {(text.items ?? []).map((item: any) => renderItem(item))}
            </div>

            {showResults && text.transkript && (
              <div className="pt-4 border-t border-gray-100">
                <h4 className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                  <Volume2 className="h-3 w-3" />
                  Transkript
                </h4>
                <div className="p-4 bg-gray-50 italic text-[11px] text-gray-600 font-serif leading-relaxed border border-gray-200">
                  "{text.transkript}"
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default Teil1;
