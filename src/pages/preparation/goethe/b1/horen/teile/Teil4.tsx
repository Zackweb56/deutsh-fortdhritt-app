import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Check, X, Volume2, Flag } from 'lucide-react';
import AudioPlayer from '../components/AudioPlayer';

interface Teil4Props {
  topic: any;
  teil: any;
  answers: Record<string, string>;
  showResults: boolean;
  onAnswerChange: (itemId: string, value: string) => void;
}

const Teil4: React.FC<Teil4Props> = ({ topic, teil, answers, showResults, onAnswerChange }) => {
  const [markedItems, setMarkedItems] = useState<Set<string>>(new Set());

  if (!topic) return null;

  const audioPath = `/media/audio/goethe/horen/b1/${topic.audio}`;
  const maxPlays = 2; // Teil 4 is heard twice per real exam

  const toggleMark = (id: string) => {
    setMarkedItems(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const items: any[] = topic.items ?? [];
  const answeredCount = items.filter(i => !!answers[i.id]).length;
  const totalCount = items.length;

  // Speaker definitions from topic.personen — e.g. { A: "Dana Schneider", B: "Florian Bader", C: "Moderator" }
  const personen: Record<string, string> = topic.personen ?? { A: 'Person A', B: 'Person B', C: 'Moderator' };
  const personKeys = Object.keys(personen); // ['A', 'B', 'C']

  // Static non-interactive Beispiel (shows format to user)
  const beispiel = { id: '0', text: 'Für kleine Kinder sind die ersten drei Jahre sehr wichtig.', correct: 'A' };

  // Helper: short name (strip parenthetical)
  const shortName = (full: string) => full.replace(/\s*\(.*\)/, '').trim();

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-8">

      {/* Italic context from topic */}
      {topic.title && (
        <div className="border-l-2 border-gray-400 pl-3 py-1 bg-gray-50">
          <p className="text-[11px] text-gray-600 italic font-serif leading-relaxed">
            {`Sie hören eine Diskussion zum Thema: „${topic.title}"`}
          </p>
        </div>
      )}

      {/* Counter */}
      <div className="flex items-center justify-between border-b border-gray-300 pb-2">
        <h3 className="text-[9px] font-bold text-gray-900 uppercase tracking-widest">Hören — Teil 4</h3>
        <span className={cn(
          'text-[8px] font-bold px-2 py-0.5 border uppercase tracking-wide',
          answeredCount === totalCount && totalCount > 0
            ? 'bg-green-50 border-green-300 text-green-700'
            : 'bg-gray-100 border-gray-300 text-gray-400'
        )}>
          {answeredCount} / {totalCount} beantwortet
        </span>
      </div>

      {/* Audio Player (2 plays) */}
      <AudioPlayer src={audioPath} maxPlays={maxPlays} />

      {/* ── Zuordnung Table ── */}
      <div className="border border-gray-300 overflow-x-auto">
        <table className="w-full min-w-[500px] border-collapse">
          <thead>
            <tr>
              {/* Statement column header */}
              <th className="bg-[#1e293b] text-white text-left px-3 py-2 text-[8px] font-bold uppercase tracking-widest border-r border-gray-600 w-full">
                Aussage
              </th>
              {/* Speaker column headers */}
              {personKeys.map(key => (
                <th key={key} className="bg-[#1e293b] text-white px-2 py-2 text-center border-r border-gray-600 last:border-r-0 min-w-[80px]">
                  <div className="flex flex-col items-center gap-0.5">
                    <span className="text-[9px] font-black text-white/50">{key}</span>
                    <span className="text-[8px] font-bold text-white leading-tight text-center whitespace-pre-wrap">
                      {shortName(personen[key])}
                    </span>
                  </div>
                </th>
              ))}
              <th className="bg-[#1e293b] w-6 border-0" />
            </tr>
          </thead>

          <tbody>
            {/* Non-interactive Beispiel row */}
            <tr className="bg-gray-100 border-b border-gray-300">
              <td className="px-3 py-2 border-r border-gray-200">
                <div className="flex items-center gap-2">
                  <span className="text-[8px] font-black text-gray-400 shrink-0">Beispiel 0.</span>
                  <span className="text-[10px] text-gray-500 italic leading-snug">{beispiel.text}</span>
                </div>
              </td>
              {personKeys.map(key => (
                <td key={key} className="text-center px-2 py-2 border-r border-gray-200 last:border-r-0">
                  <div className={cn(
                    'mx-auto h-6 w-6 border flex items-center justify-center text-[9px] font-bold',
                    key === beispiel.correct
                      ? 'bg-gray-400 border-gray-400 text-white'
                      : 'bg-gray-50 border-gray-300 text-gray-300'
                  )}>
                    {key === beispiel.correct ? '✓' : key}
                  </div>
                </td>
              ))}
              <td className="w-6" />
            </tr>

            {/* Actual items */}
            {items.map((item) => {
              const selected   = answers[item.id];
              const isAnswered = !!selected;
              const isCorrect  = selected === item.correct;
              const isMarked   = markedItems.has(item.id);

              return (
                <tr
                  key={item.id}
                  className={cn(
                    'border-b border-gray-200 transition-none',
                    showResults
                      ? isCorrect ? 'bg-green-50' : 'bg-red-50'
                      : isAnswered ? 'bg-blue-50'
                        : isMarked ? 'bg-yellow-50'
                        : 'bg-white hover:bg-gray-50'
                  )}
                >
                  {/* Statement */}
                  <td className="px-3 py-2.5 border-r border-gray-200">
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        'text-[9px] font-black shrink-0',
                        isAnswered && !showResults ? 'text-blue-500' : 'text-gray-400'
                      )}>
                        {item.id}.
                      </span>
                      <span className="text-[11px] text-gray-800 font-medium leading-snug">
                        {item.text}
                      </span>
                    </div>
                  </td>

                  {/* Speaker assignment buttons */}
                  {personKeys.map(key => {
                    const isSel = selected === key;
                    const isCorrectKey = key === item.correct;
                    return (
                      <td key={key} className="text-center px-2 py-2 border-r border-gray-200 last:border-r-0">
                        <button
                          disabled={showResults}
                          onClick={() => onAnswerChange(item.id, key)}
                          className={cn(
                            'mx-auto h-7 w-7 border flex items-center justify-center text-[9px] font-bold transition-none',
                            isSel
                              ? 'bg-[#1e293b] border-[#1e293b] text-white'
                              : 'bg-white border-gray-300 text-gray-400 hover:border-gray-500',
                            showResults && isSel && isCorrect  && 'bg-green-600 border-green-600 text-white',
                            showResults && isSel && !isCorrect && 'bg-red-600 border-red-600 text-white',
                            showResults && !isSel && isCorrectKey && 'bg-green-50 border-green-500 text-green-600'
                          )}
                        >
                          {showResults && isSel && isCorrect  ? <Check className="h-3 w-3" /> :
                           showResults && isSel && !isCorrect ? <X className="h-3 w-3" /> :
                           showResults && !isSel && isCorrectKey ? <Check className="h-3 w-3" /> :
                           key}
                        </button>
                      </td>
                    );
                  })}

                  {/* Flag */}
                  <td className="w-6 text-center">
                    {!showResults && (
                      <button onClick={() => toggleMark(item.id)} className="text-gray-200 hover:text-yellow-400 transition-none">
                        <Flag className={cn('h-3 w-3', isMarked && 'fill-yellow-400 text-yellow-400')} />
                      </button>
                    )}
                    {showResults && (
                      isCorrect
                        ? <Check className="h-3 w-3 text-green-600 mx-auto" />
                        : <X className="h-3 w-3 text-red-600 mx-auto" />
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Speaker legend */}
      <div className="bg-gray-50 border border-gray-200 p-3 grid grid-cols-1 sm:grid-cols-3 gap-2">
        {personKeys.map(key => (
          <div key={key} className="flex items-start gap-2">
            <div className="h-5 w-5 bg-[#1e293b] border border-[#1e293b] text-white flex items-center justify-center text-[8px] font-black shrink-0 mt-0.5">
              {key}
            </div>
            <div>
              <p className="text-[9px] font-bold text-gray-700 leading-tight">{shortName(personen[key])}</p>
              <p className="text-[8px] text-gray-400 leading-tight">{personen[key].match(/\((.*)\)/)?.[1] ?? ''}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Transcript (after results) */}
      {showResults && topic.transkript && (
        <div className="pt-4 border-t border-gray-100">
          <h4 className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2">
            <Volume2 className="h-3 w-3" /> Transkript
          </h4>
          <div className="p-4 bg-gray-50 italic text-[11px] text-gray-600 font-serif leading-relaxed border border-gray-200 whitespace-pre-line">
            {topic.transkript}
          </div>
        </div>
      )}
    </div>
  );
};

export default Teil4;
