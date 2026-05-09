import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { PenTool } from 'lucide-react';

interface Teil2Props {
  teil: any;
  topic: any;
  selectedTopic: any;
  setSelectedTopic: (topic: any) => void;
  hasStarted: boolean;
  isPreparing: boolean;
  setIsPreparing: (val: boolean) => void;
}

const Teil2: React.FC<Teil2Props> = ({ 
  teil, 
  topic, 
  selectedTopic, 
  setSelectedTopic, 
  hasStarted,
  isPreparing,
  setIsPreparing
}) => {
  const [notes, setNotes] = useState<string[]>(new Array(5).fill(''));

  const handleNoteChange = (idx: number, val: string) => {
    const newNotes = [...notes];
    newNotes[idx] = val;
    setNotes(newNotes);
  };

  if (!selectedTopic) {
    // Topic Selection Screen - Retro Layout
    return (
      <div className="space-y-8 max-w-xl mx-auto py-10">
        <div className="text-center space-y-2 border-b border-gray-200 pb-6">
          <h2 className="text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Sprechen — Teil 2</h2>
          <h3 className="text-lg font-bold text-gray-900 uppercase">Themenwahl</h3>
        </div>

        <div className="grid grid-cols-1 gap-3">
           {[0, 1].map((idx) => {
             const t = teil.themen[idx];
             return (
               <div
                  key={t.id}
                  onClick={() => setSelectedTopic(t)}
                  className="p-4 border border-gray-300 bg-white hover:bg-gray-50 cursor-pointer transition-none flex items-center gap-4"
               >
                  <div className="h-8 w-8 border border-gray-900 flex items-center justify-center font-bold text-gray-900 text-xs">
                    {idx + 1}
                  </div>
                  <div className="space-y-1">
                     <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest leading-none">Thema {idx + 1}</span>
                     <h4 className="text-xs font-bold text-gray-900 uppercase">{t.title}</h4>
                  </div>
               </div>
             );
           })}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 bg-white">
      {/* Exam Paper Header */}
      <div className="bg-white border-b-2 border-gray-900 pb-4 flex justify-between items-end text-gray-900 font-sans">
        <div className="flex flex-col">
          <span className="text-[8px] font-bold uppercase tracking-widest text-gray-400 leading-none mb-1">Zertifikat B1</span>
          <span className="text-lg font-bold uppercase leading-none">Sprechen</span>
        </div>
        <div className="flex flex-col items-end text-[7px] font-bold text-gray-400 uppercase tracking-widest">
          <span>Kandidatenblatt</span>
        </div>
      </div>

      {/* Main Task Card */}
      <div className="bg-white space-y-8">
        <div className="flex justify-between items-baseline border-b border-gray-200 pb-2">
          <h2 className="text-[11px] font-bold text-gray-900 uppercase tracking-tight">
             {teil.label} — {teil.title}
          </h2>
          <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">Dauer: {teil.dauer}</span>
        </div>

        <div className="py-3 text-center border border-gray-200 bg-gray-50">
           <h3 className="text-xs font-bold uppercase text-gray-900 tracking-tight">
             Thema: {selectedTopic.title}
           </h3>
        </div>

        {/* Slides Grid */}
        <div className="space-y-8 pt-4">
           {[
             { instr: "Stellen Sie Ihr Thema vor.", title: selectedTopic.title, folie: 1 },
             { instr: "Berichten Sie von Ihrer Situation.", title: "Persönliche Erfahrungen", folie: 2 },
             { instr: "Die Situation im Heimatland.", title: "Situation im Heimatland", folie: 3 },
             { instr: "Vor- und Nachteile & Meinung.", title: "Vor- und Nachteile", folie: 4 },
             { instr: "Beenden Sie Ihre Präsentation.", title: "Abschluss & Dank", folie: 5 }
           ].map((slide, i) => (
             <div key={i} className="grid grid-cols-12 gap-6 items-start border-b border-gray-100 pb-6 last:border-0">
                {/* Left: Instruction */}
                <div className="col-span-3 text-[8px] font-bold leading-relaxed text-gray-400 uppercase tracking-tight">
                   {slide.instr}
                </div>

                {/* Middle: Folie Card */}
                <div className="col-span-4 aspect-[4/3] border border-gray-300 p-2 flex flex-col items-center justify-center text-center relative bg-white">
                   <div className="absolute top-1 left-1 h-4 w-4 border border-gray-200 flex items-center justify-center text-[7px] font-bold text-gray-300">
                      {slide.folie}
                   </div>
                   <span className="text-[10px] font-bold uppercase text-gray-800">{slide.title}</span>
                </div>

                {/* Right: Note Area */}
                <div className="col-span-5 border border-gray-100 p-2 h-20 bg-gray-50/50">
                   <textarea
                      value={notes[i]}
                      onChange={(e) => handleNoteChange(i, e.target.value)}
                      placeholder="Notizen..."
                      className="w-full h-full bg-transparent border-none focus:ring-0 text-[10px] font-serif italic text-gray-600 resize-none overflow-hidden placeholder:text-gray-200"
                   />
                </div>
             </div>
           ))}
        </div>
      </div>

      {!hasStarted && (
          <div className="border border-gray-200 p-4 flex items-center justify-between gap-4">
             <div className="flex items-center gap-3">
                <PenTool className="h-4 w-4 text-gray-400" />
                <div>
                   <h4 className="text-[9px] font-bold text-gray-900 uppercase tracking-widest leading-none">Vorbereitung</h4>
                   <p className="text-[8px] text-gray-400 font-medium">Ihre Notizen</p>
                </div>
             </div>
             <Button 
                onClick={() => setSelectedTopic(null)}
                className="bg-gray-100 text-[8px] font-bold text-gray-600 uppercase h-7 rounded-none border border-gray-300 px-3 transition-none"
             >
                Thema wechseln
             </Button>
          </div>
      )}
    </div>
  );
};

export default Teil2;
