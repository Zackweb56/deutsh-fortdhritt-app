import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Check, X } from 'lucide-react';

interface Teil4Props {
  topic: any;
  answers: Record<string, string>;
  showResults: boolean;
  onAnswerChange: (id: string, value: string) => void;
}

const Teil4: React.FC<Teil4Props> = ({ topic, answers, showResults, onAnswerChange }) => {
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  if (!topic) return null;

  const { title, contextText, ueberschriften, comments, beispiel } = topic;
  const answeredCount = ueberschriften?.filter((u: any) => !!answers[u.id]).length ?? 0;
  const totalCount = ueberschriften?.length ?? 0;

  const handleDragStart = (e: React.DragEvent, commentId: string) => {
    if (showResults) return;
    e.dataTransfer.setData('text/plain', commentId);
    e.dataTransfer.effectAllowed = 'copyMove';
  };

  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverId !== id) {
      setDragOverId(id);
    }
  };

  const handleDragLeave = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    if (dragOverId === id) {
      setDragOverId(null);
    }
  };

  const handleDrop = (e: React.DragEvent, ueberschriftId: string) => {
    e.preventDefault();
    setDragOverId(null);
    if (showResults) return;
    const commentId = e.dataTransfer.getData('text/plain');
    if (commentId && commentId !== beispiel.correct) {
      onAnswerChange(ueberschriftId, commentId);
    }
  };

  // Find if a comment is used in the answers or is the beispiel
  const isCommentUsed = (commentId: string) => {
    if (commentId === beispiel.correct) return true;
    return Object.values(answers).includes(commentId);
  };

  return (
    <div className="flex flex-col lg:flex-row h-full bg-[#f1f5f9]">
      {/* ── Left: Comments Area (Draggable) ── */}
      <div className="flex-1 overflow-y-auto p-6 md:p-10 bg-white border-b lg:border-b-0 lg:border-r border-gray-300">
        <div className="max-w-3xl mx-auto space-y-6">
           <div className="border-b-2 border-gray-900 pb-3">
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Leseverstehen — Teil 4</p>
              <h2 className="text-base font-bold text-gray-900 uppercase tracking-tight mt-0.5">{title}</h2>
           </div>
           
           <p className="text-sm text-gray-600 font-medium">{contextText}</p>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {comments?.map((comment: any) => {
                const used = isCommentUsed(comment.id);
                
                return (
                  <div
                    key={comment.id}
                    draggable={!used && !showResults}
                    onDragStart={(e) => handleDragStart(e, comment.id)}
                    className={cn(
                      "p-4 border bg-gray-50 flex flex-col gap-2 relative",
                      !used && !showResults ? "cursor-grab active:cursor-grabbing hover:border-gray-400" : "opacity-50 grayscale cursor-not-allowed border-gray-200"
                    )}
                  >
                    <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                       <div className="h-6 w-6 bg-gray-200 flex items-center justify-center font-bold text-xs uppercase text-gray-700">
                         {comment.id}
                       </div>
                       <span className="text-[10px] font-bold text-gray-500 uppercase">{comment.author}</span>
                    </div>
                    <p className="text-xs text-gray-800 leading-relaxed font-serif">
                       {comment.text}
                    </p>
                    {comment.isBeispiel && (
                      <div className="absolute -top-2 -right-2 bg-gray-800 text-white text-[9px] font-bold px-2 py-0.5 uppercase">
                        Beispiel
                      </div>
                    )}
                  </div>
                );
              })}
           </div>
        </div>
      </div>

      {/* ── Right: Überschriften Area (Drop Targets) ── */}
      <div className="w-full lg:w-[480px] overflow-y-auto bg-gray-50 p-5 md:p-8 shrink-0 border-l border-gray-300">
        <div className="space-y-6">
           <div className="flex items-center justify-between border-b border-gray-300 pb-3">
              <div className="space-y-0.5">
                <h3 className="text-[9px] font-bold text-gray-900 uppercase tracking-widest">Überschriften</h3>
                <p className="text-[8px] text-gray-400 font-bold uppercase">Ziehen Sie die Texte hierher</p>
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

           {/* Beispiel Überschrift (Fake, just to show how it looks) */}
           <div className="border border-gray-300 bg-gray-100 p-3 flex gap-4 items-center opacity-70">
              <div className="w-6 shrink-0 text-right">
                <span className="text-[10px] font-black text-gray-400">0.</span>
              </div>
              <p className="text-[11px] text-gray-600 font-medium leading-snug flex-1">Beispiel Überschrift</p>
              <div className="h-8 w-8 bg-gray-200 flex items-center justify-center font-bold text-sm text-gray-500 uppercase">
                {beispiel.correct}
              </div>
           </div>
           
           <div className="space-y-3">
              {ueberschriften?.map((item: any) => {
                const selected = answers[item.id];
                const isAnswered = !!selected;
                // Since this is B2 Lesen Teil 4, usually we check if it matches the correct mapping
                // But the JSON in Teil 4 doesn't have "correct" directly in items, wait...
                // Actually, let's check the JSON for correct values. Wait, where are the correct values for Teil 4?
                // I need to make sure I access the correct answer. Let's look at how the JSON stores correct answers for Teil 4.
                // If it's not in ueberschriften, it might be in an items array!
                const correctItem = topic.items?.find((i: any) => i.id === item.id);
                const isCorrect = correctItem ? selected === correctItem.correct : false;

                return (
                  <div
                    key={item.id}
                    onDragOver={(e) => handleDragOver(e, item.id)}
                    onDragLeave={(e) => handleDragLeave(e, item.id)}
                    onDrop={(e) => handleDrop(e, item.id)}
                    className={cn(
                      'border transition-none p-3 flex gap-3 items-center',
                      dragOverId === item.id ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-300 ring-opacity-50 transition-all duration-200 z-10' :
                      showResults
                        ? isCorrect
                          ? 'bg-green-50 border-green-300'
                          : 'bg-red-50 border-red-300'
                        : isAnswered
                          ? 'bg-blue-50 border-blue-300'
                          : 'bg-white border-dashed border-gray-400'
                    )}
                  >
                    <div className="w-5 shrink-0 text-right">
                      <span className={cn(
                        'text-[10px] font-black',
                        isAnswered && !showResults ? 'text-blue-500' : 'text-gray-400'
                      )}>
                        {item.id}.
                      </span>
                    </div>
                    
                    <p className="text-[11px] text-gray-800 font-medium leading-snug flex-1">{item.text}</p>
                    
                    <div className="shrink-0 flex items-center gap-2">
                      {isAnswered ? (
                        <div className={cn(
                          "h-8 w-8 flex items-center justify-center font-bold text-sm uppercase shadow-sm cursor-pointer",
                          showResults 
                            ? isCorrect ? "bg-green-600 text-white" : "bg-red-600 text-white"
                            : "bg-blue-600 text-white"
                        )}
                        onClick={() => !showResults && onAnswerChange(item.id, "")}
                        title="Klicken, um Auswahl zu entfernen"
                        >
                          {selected}
                        </div>
                      ) : (
                        <div className="h-8 w-8 bg-gray-100 border border-gray-200 flex items-center justify-center text-[10px] text-gray-400 font-bold uppercase">
                           ?
                        </div>
                      )}

                      {showResults && (
                        isCorrect
                          ? <Check className="h-4 w-4 text-green-600" />
                          : <div className="flex flex-col items-center ml-1">
                              <X className="h-4 w-4 text-red-600 mb-0.5" />
                              <span className="text-[8px] font-bold text-green-600 uppercase">Soll: {correctItem?.correct}</span>
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

export default Teil4;
