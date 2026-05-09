import React from 'react';
import { Mail, LayoutGrid, Info } from 'lucide-react';

interface Teil2Props {
  teil: any;
  topic: any;
  userText: string;
  onTextChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  wordCount: number;
}

const Teil2: React.FC<Teil2Props> = ({ teil, topic, userText, onTextChange, wordCount }) => {
  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Instruction Box */}
      <div className="bg-[#fff9c4] border border-[#fbc02d] p-5 rounded-sm text-sm text-[#5d4037] leading-relaxed shadow-sm">
        Schreiben Sie eine formelle Nachricht zum Thema {topic.title}.
      </div>

      {/* Main Task Card */}
      <div className="bg-white border border-gray-300 p-8 md:p-12 shadow-sm space-y-10">
        <div className="space-y-6">
          <p className="text-xl font-serif leading-relaxed text-gray-800">
            {topic.situation}
          </p>
          
          <div className="space-y-4">
             <p className="text-sm font-bold text-gray-600 uppercase tracking-tight">Bearbeiten Sie alle vier Punkte:</p>
             <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {topic.aufgabenpunkte.map((punkt: string, idx: number) => (
                 <li key={idx} className="bg-gray-50 border border-gray-200 p-4 rounded-sm text-base font-medium text-gray-800 leading-snug flex gap-3">
                   <span className="text-gray-400 font-bold">{idx + 1}.</span>
                   {punkt}
                 </li>
               ))}
             </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-gray-100 text-[13px] text-gray-500 space-y-1 italic">
          <p>• Schreiben Sie circa 100 Wörter.</p>
          <p>• Achten Sie auf den Textaufbau (Anrede, Einleitung, Reihenfolge der Inhaltspunkte, Schluss).</p>
        </div>
      </div>

      {/* Writing Area */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
           <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
              Ihre Nachricht
           </label>
           <div className="text-[10px] font-mono text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
              Wörter: <span className="font-bold text-gray-700">{wordCount}</span> / {teil.minWords}
           </div>
        </div>
        <textarea
          value={userText}
          onChange={onTextChange}
          placeholder="Sehr geehrte/r Frau/Herr ..., ich schreibe Ihnen, weil ..."
          className="w-full h-[400px] bg-white border border-gray-300 p-8 text-lg leading-relaxed focus:outline-none focus:border-blue-500 shadow-inner resize-none font-sans transition-colors"
          dir="ltr"
          spellCheck={false}
        />
      </div>
    </div>
  );
};

export default Teil2;
