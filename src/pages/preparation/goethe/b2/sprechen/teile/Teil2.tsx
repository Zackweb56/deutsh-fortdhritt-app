import React from 'react';
import { cn } from '@/lib/utils';

interface Teil2Props {
  teil: any;
  topic: any;
}

const Teil2: React.FC<Teil2Props> = ({ teil, topic }) => {
  return (
    <div className="space-y-8 font-serif">
      <div className="flex items-end justify-between border-b-2 border-gray-900 pb-4">
        <h2 className="text-xl font-bold text-gray-900 uppercase tracking-tight">{teil.label}</h2>
        <span className="text-sm text-gray-600 italic">Dauer: ca. 5 Min.</span>
      </div>

      <div className="space-y-8">
        <div className="p-4 bg-gray-50 border border-gray-200 text-sm text-gray-700 leading-relaxed italic">
          {teil.instructions}
        </div>

        <div className="bg-[#fff9c4] border-2 border-gray-900 p-10 space-y-10 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
           <div className="space-y-4 text-center">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.4em]">Diskussionsfrage</span>
              <div className="relative py-4">
                 <div className="absolute -left-4 top-0 text-5xl text-gray-200 font-serif">"</div>
                 <h3 className="text-2xl font-bold text-gray-900 uppercase leading-tight italic">
                   {topic.frage}
                 </h3>
                 <div className="absolute -right-4 bottom-0 text-5xl text-gray-200 font-serif">"</div>
              </div>
              {topic.titleAr && (
                <p className="text-lg font-bold text-gray-500 mt-2" dir="rtl">
                  {topic.titleAr}
                </p>
              )}
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {topic.stichpunkte?.map((point: string, i: number) => (
                <div key={i} className="bg-white border border-gray-300 p-4 flex items-center justify-center text-center min-h-[60px]">
                   <span className="text-sm font-bold text-gray-800 uppercase tracking-tight">{point}</span>
                </div>
              ))}
           </div>

           <div className="bg-white/50 border border-dashed border-gray-300 p-6 space-y-3">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Aufgaben</p>
              <ul className="space-y-2">
                 {topic.aufgaben?.map((aufgabe: string, idx: number) => (
                   <li key={idx} className="text-xs text-gray-600 flex items-start gap-2">
                      <span className="h-1 w-1 rounded-full bg-gray-400 mt-1.5 shrink-0" />
                      <span>{aufgabe}</span>
                   </li>
                 ))}
              </ul>
           </div>
        </div>

        <div className="p-6 border border-gray-100 bg-gray-50 italic text-sm text-gray-500 text-center">
          Tauschen Sie Argumente aus und versuchen Sie, eine Einigung zu finden.
        </div>
      </div>
    </div>
  );
};

export default Teil2;
