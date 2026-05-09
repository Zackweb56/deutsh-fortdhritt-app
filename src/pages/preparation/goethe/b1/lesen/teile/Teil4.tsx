import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Check, X, Flag } from 'lucide-react';

interface Teil4Props {
  topic: any;
  answers: Record<string, string>;
  showResults: boolean;
  onAnswerChange: (itemId: string, value: string) => void;
}

const Teil4: React.FC<Teil4Props> = ({ topic, answers, showResults, onAnswerChange }) => {
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

  // Use contextText (real field name) or fall back to context for compatibility
  const contextText = topic.contextText || topic.context || '';
  const fragestellung = topic.fragestellung || 'Ist die Person für ein Verbot?';
  const comments: any[] = topic.comments || [];
  const beispiel = topic.beispiel;

  const answeredCount = comments.filter(c => !!answers[c.id]).length;
  const totalCount = comments.length;

  return (
    <div className="flex-1 overflow-y-auto bg-white">
      <div className="max-w-4xl mx-auto p-5 md:p-8 space-y-6">

        {/* ── Context Description (italic intro like real exam) ── */}
        {contextText && (
          <div className="bg-gray-50 border-l-2 border-gray-400 pl-4 py-2">
            <p className="text-[11px] text-gray-700 italic font-serif leading-relaxed">
              {contextText}
            </p>
          </div>
        )}

        {/* ── Compact Answer Table (top, like real exam) ── */}
        <div className="border border-gray-300 bg-white">
          <div className="bg-[#1e293b] text-white px-4 py-2 flex items-center justify-between">
            <div>
              <span className="text-[9px] font-bold uppercase tracking-widest text-white/70">Antworten — </span>
              <span className="text-[9px] font-bold uppercase tracking-widest text-white">{fragestellung}</span>
            </div>
            <span className={cn(
              'text-[8px] font-bold px-2 py-0.5 border tracking-wide',
              answeredCount === totalCount && totalCount > 0
                ? 'bg-green-700 border-green-500 text-white'
                : 'bg-[#334155] border-slate-500 text-gray-300'
            )}>
              {answeredCount} / {totalCount}
            </span>
          </div>

          <div className="p-4">
            {/* Beispiel row */}
            {beispiel && (
              <div className="flex items-center gap-3 py-2 border-b border-dashed border-gray-200 mb-1 opacity-60">
                <span className="text-[8px] font-bold text-gray-400 uppercase w-16 shrink-0">Beispiel</span>
                <span className="text-[9px] text-gray-500 flex-1 truncate">
                  <span className="font-bold text-gray-600">0.</span> {beispiel.author?.split(',')[0]}
                </span>
                <div className="flex gap-1.5 shrink-0">
                  {['Ja', 'Nein'].map(opt => (
                    <div key={opt} className={cn(
                      'px-3 py-0.5 border text-[8px] font-bold',
                      opt === beispiel.correct
                        ? 'bg-gray-400 border-gray-400 text-white line-through'
                        : 'bg-gray-100 border-gray-200 text-gray-400'
                    )}>
                      {opt}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Questions grid - 2 columns on md+ */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1 mt-2">
              {comments.map((comment) => {
                const selected   = answers[comment.id];
                const isAnswered = !!selected;
                const isCorrect  = selected === comment.correct;
                const isMarked   = markedItems.has(comment.id);

                // Extract just the first name from author (e.g. "Stefan, 19, Graz" → "Stefan")
                const firstName = comment.author?.split(',')[0]?.trim() || comment.author;

                return (
                  <div
                    key={comment.id}
                    className={cn(
                      'flex items-center gap-2 py-1.5 px-2 border transition-none',
                      showResults
                        ? isCorrect
                          ? 'bg-green-50 border-green-200'
                          : 'bg-red-50 border-red-200'
                        : isAnswered
                          ? 'bg-blue-50 border-blue-200'
                          : isMarked
                            ? 'bg-yellow-50 border-yellow-200'
                            : 'bg-white border-gray-200'
                    )}
                  >
                    {/* Number + name */}
                    <span className={cn(
                      'text-[9px] font-black w-5 shrink-0 text-right',
                      isAnswered && !showResults ? 'text-blue-500' : 'text-gray-400'
                    )}>
                      {comment.id}
                    </span>
                    <span className="text-[10px] text-gray-700 font-medium flex-1 min-w-0 truncate">
                      {firstName}
                    </span>

                    {/* Flag button */}
                    {!showResults && (
                      <button
                        onClick={() => toggleMark(comment.id)}
                        className="shrink-0 text-gray-200 hover:text-yellow-400 transition-none"
                      >
                        <Flag className={cn('h-2.5 w-2.5', isMarked && 'fill-yellow-400 text-yellow-400')} />
                      </button>
                    )}

                    {/* Ja / Nein pill buttons */}
                    <div className="flex gap-1 shrink-0">
                      {['Ja', 'Nein'].map((option) => {
                        const isSelected = selected === option;
                        return (
                          <button
                            key={option}
                            disabled={showResults}
                            onClick={() => onAnswerChange(comment.id, option)}
                            className={cn(
                              'px-2.5 py-0.5 border font-bold text-[8px] uppercase tracking-wide transition-none',
                              isSelected
                                ? 'bg-[#1e293b] border-[#1e293b] text-white'
                                : 'bg-white border-gray-300 text-gray-500 hover:border-gray-500',
                              showResults && isSelected && isCorrect  && 'bg-green-600 border-green-600 text-white',
                              showResults && isSelected && !isCorrect && 'bg-red-600 border-red-600 text-white',
                              showResults && !isSelected && option === comment.correct && 'border-green-500 text-green-600 bg-green-50'
                            )}
                          >
                            {option}
                          </button>
                        );
                      })}
                    </div>

                    {/* Result icon */}
                    {showResults && (
                      <div className="shrink-0 w-4">
                        {isCorrect
                          ? <Check className="h-3 w-3 text-green-600" />
                          : <X className="h-3 w-3 text-red-600" />
                        }
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── LESERBRIEFE — Full Comment Texts ── */}
        <div className="space-y-4">
          <div className="border-b-2 border-gray-900 pb-2">
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-widest text-center">
              Leserbriefe / Kommentare
            </h3>
          </div>

          {/* Beispiel text */}
          {beispiel && (
            <div className="opacity-60 border-l-2 border-gray-300 pl-4 py-2 bg-gray-50">
              <div className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                Beispiel — 0. {beispiel.author}
              </div>
              <p className="text-[11px] text-gray-600 leading-relaxed font-serif italic">
                „{beispiel.text}"
              </p>
              <div className="mt-1">
                <span className="text-[8px] font-bold text-gray-400 uppercase">
                  Antwort: {beispiel.correct}
                </span>
              </div>
            </div>
          )}

          {/* 2-column grid for comments on larger screens */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {comments.map((comment) => {
              const selected  = answers[comment.id];
              const isCorrect = selected === comment.correct;
              const isMarked  = markedItems.has(comment.id);

              return (
                <div
                  key={comment.id}
                  className={cn(
                    'border p-4 space-y-2 transition-none',
                    showResults
                      ? isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                      : !!selected ? 'border-blue-200 bg-blue-50'
                        : isMarked ? 'border-yellow-200 bg-yellow-50'
                        : 'border-gray-200 bg-white'
                  )}
                >
                  {/* Author header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        'h-5 w-5 flex items-center justify-center font-black text-[9px] border shrink-0',
                        !!selected && !showResults
                          ? 'bg-blue-500 border-blue-500 text-white'
                          : 'bg-gray-100 border-gray-300 text-gray-500'
                      )}>
                        {comment.id}
                      </div>
                      <span className="text-[9px] font-bold text-gray-700 uppercase tracking-wide">
                        {comment.author}
                      </span>
                    </div>
                    {showResults && (
                      isCorrect
                        ? <Check className="h-3.5 w-3.5 text-green-600 shrink-0" />
                        : (
                          <div className="flex items-center gap-1">
                            <X className="h-3.5 w-3.5 text-red-600" />
                            <span className="text-[7px] font-bold text-green-600 uppercase">({comment.correct})</span>
                          </div>
                        )
                    )}
                  </div>

                  {/* Comment text */}
                  <p className="text-[11px] text-gray-700 leading-relaxed font-serif">
                    „{comment.text}"
                  </p>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Teil4;
