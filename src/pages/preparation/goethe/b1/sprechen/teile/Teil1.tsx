import React from 'react';
import { cn } from '@/lib/utils';

interface Teil1Props {
  teil: any;
  topic: any;
  hasStarted: boolean;
}

const Teil1: React.FC<Teil1Props> = ({ teil, topic, hasStarted }) => {
  return (
    <div className="space-y-8">
      {/* Exam Paper Header */}
      <div className="border-b-2 border-gray-900 pb-4 flex justify-between items-end bg-white">
        <div className="flex flex-col">
          <span className="text-[8px] font-bold uppercase tracking-widest text-gray-400">Zertifikat B1</span>
          <span className="text-lg font-bold uppercase text-gray-900 leading-none">Sprechen</span>
        </div>
        <div className="flex flex-col items-end text-[7px] font-bold text-gray-400 uppercase tracking-widest">
          <span>Kandidatenblatt</span>
        </div>
      </div>

      {/* Main Task Card */}
      <div className="bg-white space-y-6">
        <div className="flex justify-between items-baseline border-b border-gray-200 pb-2">
          <h2 className="text-[11px] font-bold text-gray-900 uppercase tracking-tight">
             {teil.label} — {teil.title}
          </h2>
          <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">Dauer: {teil.dauer}</span>
        </div>

        <div className="space-y-3 text-[11px] leading-relaxed text-gray-800 font-serif italic">
          <p>{topic.situation}</p>
          <div className="space-y-1 not-italic font-bold text-[9px] text-gray-900 uppercase tracking-tight">
             <p>Planen und entscheiden Sie gemeinsam, was Sie tun möchten.</p>
          </div>
        </div>

        <div className="pt-4 space-y-6">
          <h3 className="text-lg font-bold text-gray-900 border-b border-gray-900 inline-block pb-1">
            {topic.title}
          </h3>

          <ul className="space-y-4">
            {topic.punkte.map((punkt: string, idx: number) => (
              <li key={idx} className="flex items-start gap-3 border-b border-gray-50 pb-2">
                <span className="text-gray-300 font-bold mt-[-2px]">—</span>
                <span className="text-xs font-serif italic text-gray-700">{punkt}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Teil1;
