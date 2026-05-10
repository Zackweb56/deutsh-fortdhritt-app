import React from 'react';
import { cn } from '@/lib/utils';
import { Check, X } from 'lucide-react';

interface Teil5Props {
  topic: any;
  answers: Record<string, string>;
  showResults: boolean;
  onAnswerChange: (id: string, value: string) => void;
}

const Teil5: React.FC<Teil5Props> = ({ topic, answers, showResults, onAnswerChange }) => {
  if (!topic) return null;

  const answeredCount = topic.items?.filter((item: any) => !!answers[item.id]).length ?? 0;
  const totalCount    = topic.items?.length ?? 0;

  const { title, text, beispiel, items } = topic;
  const { ueberschriften, paragraphen } = text;

  return (
    <div className="flex flex-col lg:flex-row h-full bg-[#f1f5f9]">
      {/* ── Left: Official Rules/Info ── */}
      <div className="flex-1 overflow-y-auto p-6 md:p-10 bg-white border-b lg:border-b-0 lg:border-r border-gray-300">
        <div className="max-w-2xl mx-auto space-y-8">
           <div className="border-b-2 border-gray-900 pb-3">
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Leseverstehen — Teil 5</p>
              <h2 className="text-base font-bold text-gray-900 uppercase tracking-tight mt-0.5">{title}</h2>
           </div>
           
           <div className="bg-white border border-gray-400 p-6 md:p-8 space-y-8 relative shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 text-center font-serif">{text.title}</h3>
              
              <div className="flex flex-col md:flex-row gap-8">
                {/* Left Column: Inhaltsverzeichnis and Beispiel */}
                <div className="flex-1 space-y-6">
                  <h4 className="text-xs font-bold text-gray-800">Inhaltsverzeichnis</h4>
                  <div className="space-y-2.5">
                    {ueberschriften.map((u: any) => (
                      <div key={u.id} className="flex gap-3 items-start">
                        <span className="text-[11px] font-bold text-gray-600">{u.id}</span>
                        <span className={cn("text-[11px] text-gray-800", beispiel.correct === u.id && "line-through text-gray-400")}>
                          {u.text}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-8">
                     <h5 className="text-[11px] font-bold text-gray-900 text-center">§ 0</h5>
                     <p className="text-[11px] text-gray-800 leading-relaxed font-serif text-justify mt-2">
                       {beispiel.text || "Das Studium kann nur zum Wintersemester aufgenommen werden. (Beispieltext)"}
                     </p>
                  </div>
                </div>

                {/* Vertical Divider */}
                <div className="hidden md:block w-px bg-gray-300"></div>

                {/* Right Column: Paragraphen */}
                <div className="flex-1 space-y-8">
                  <div className="text-[11px] text-gray-800 leading-relaxed font-serif text-justify">
                    Fachspezifisch:
                    <ul className="list-disc pl-4 mt-2 space-y-1">
                      <li>Besondere Regelungen für diesen Bereich</li>
                      <li>Zusätzliche Anforderungen</li>
                    </ul>
                  </div>

                  {paragraphen.map((p: any) => (
                    <div key={p.id} className="space-y-2">
                      <h5 className="text-[11px] font-bold text-gray-900 text-center">{p.title}</h5>
                      <p className="text-[11px] text-gray-800 leading-relaxed font-serif text-justify">
                        {p.content || p.text}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
           </div>
        </div>
      </div>

      {/* ── Right: Questions Area ── */}
      <div className="w-full lg:w-[420px] overflow-y-auto bg-gray-50 p-5 md:p-8 shrink-0 border-l border-gray-300">
        <div className="space-y-5">
           <div className="flex items-center justify-between border-b border-gray-300 pb-3">
              <div className="space-y-0.5">
                <h3 className="text-[9px] font-bold text-gray-900 uppercase tracking-widest">Zuordnung</h3>
                <p className="text-[8px] text-gray-400 font-bold uppercase">Ordnen Sie die Buchstaben zu</p>
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

           <div className="bg-gray-100 border border-gray-300 p-2 flex items-center justify-center gap-2">
              <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Beispiel: 0</span>
              <span className="text-[10px] font-bold text-gray-800 uppercase">Lösung: {beispiel.correct}</span>
           </div>
           
           <div className="space-y-2.5">
              {items?.map((item: any) => {
                const selected   = answers[item.id];
                const isAnswered = !!selected;
                const isCorrect  = selected === item.correct;

                return (
                  <div
                    key={item.id}
                    className={cn(
                      'border transition-none p-3 flex items-center gap-4',
                      showResults
                        ? isCorrect
                          ? 'bg-green-50 border-green-300'
                          : 'bg-red-50 border-red-300'
                        : isAnswered
                          ? 'bg-blue-50 border-blue-300'
                          : 'bg-white border-gray-300'
                    )}
                  >
                    <span className={cn(
                      'text-[10px] font-black w-8 text-right shrink-0',
                      isAnswered && !showResults ? 'text-blue-500' : 'text-gray-400'
                    )}>
                      {item.id}.
                    </span>
                    
                    <div className="flex-1">
                      <select
                        disabled={showResults}
                        value={selected || ""}
                        onChange={(e) => onAnswerChange(item.id, e.target.value)}
                        className={cn(
                          "w-full appearance-none bg-white border px-3 py-2 text-xs font-bold text-center cursor-pointer transition-none",
                          !selected ? "border-gray-300 text-gray-500" : "border-gray-800 text-gray-800",
                          showResults && (isCorrect ? "border-green-600 bg-green-50" : "border-red-600 bg-red-50")
                        )}
                      >
                        <option value="" disabled>Überschrift wählen</option>
                        {ueberschriften.map((u: any) => (
                          <option key={u.id} value={u.id} disabled={u.id === beispiel.correct}>
                            {u.id.toUpperCase()} - {u.text.length > 25 ? u.text.substring(0, 25) + '...' : u.text}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="shrink-0 flex items-center gap-1 w-12 justify-end">
                      {showResults && (
                        isCorrect
                          ? <Check className="h-4 w-4 text-green-600" />
                          : <div className="flex flex-col items-end">
                              <X className="h-4 w-4 text-red-600 mb-0.5" />
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
