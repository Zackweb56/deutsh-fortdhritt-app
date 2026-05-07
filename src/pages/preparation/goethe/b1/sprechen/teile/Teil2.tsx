import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { LayoutGrid, PenTool, Play, CheckCircle2 } from 'lucide-react';

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
    // Topic Selection Screen
    return (
      <div className="space-y-8 animate-in fade-in zoom-in-95 duration-700">
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <h2 className="text-4xl font-black text-white uppercase italic tracking-widest">Themenwahl</h2>
          <p className="text-lg text-white/50 font-medium">Wählen Sie ein Thema (Thema 1 oder Thema 2) aus.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           {[0, 1].map((idx) => {
             const t = teil.themen[idx]; // We'll just pick two from the pool for this session
             return (
               <Button
                  key={t.id}
                  variant="outline"
                  onClick={() => setSelectedTopic(t)}
                  className="h-auto p-8 rounded-[40px] border-2 border-white/10 bg-white/[0.02] hover:bg-white/[0.05] hover:border-[#ffcc00]/50 transition-all group flex flex-col items-center gap-6"
               >
                  <div className="h-16 w-16 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-[#ffcc00]/20 transition-colors">
                     <span className="text-2xl font-black text-white/40 group-hover:text-[#ffcc00]">
                        {idx + 1}
                     </span>
                  </div>
                  <div className="text-center space-y-2">
                     <span className="text-[10px] font-black text-[#ffcc00] uppercase tracking-[0.3em]">Thema {idx + 1}</span>
                     <h3 className="text-2xl font-black text-white uppercase tracking-tight">{t.title}</h3>
                  </div>
               </Button>
             );
           })}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Exam Paper Header */}
      <div className="bg-[#1a1a1a] border border-white/10 p-4 flex justify-between items-center text-white font-sans">
        <div className="flex flex-col">
          <span className="text-sm font-black uppercase leading-none">Zertifikat B1</span>
          <span className="text-xl font-black uppercase leading-none">Sprechen</span>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[10px] font-bold uppercase">Modellsatz</span>
          <span className="text-[10px] font-bold uppercase">Kandidatenblätter</span>
        </div>
      </div>

      {/* Main Task Card */}
      <div className="bg-[#111] text-white p-8 sm:p-12 rounded-sm border border-white/10 relative overflow-hidden">
        <div className="relative z-10 space-y-8">
          {/* Title & Duration */}
          <div className="flex justify-between items-baseline border-b border-white/10 pb-4">
            <h2 className="text-xl font-black flex items-center gap-4">
               {teil.label} <span className="text-2xl font-black text-[#ffcc00]">|</span> {teil.title}
            </h2>
            <span className="text-sm font-medium italic text-white/40">Dauer: {teil.dauer}</span>
          </div>

          <div className="space-y-4">
            <p className="text-base font-bold leading-relaxed text-white/90">
              Sie sollen Ihren Zuhörern ein aktuelles Thema präsentieren. Dazu finden Sie hier fünf Folien.
              Folgen Sie den Anweisungen links und schreiben Sie Ihre Notizen und Ideen rechts daneben.
            </p>
          </div>

          {/* Theme Header */}
          <div className="py-4 text-center border-y border-white/10">
             <h3 className="text-3xl font-black italic text-[#ffcc00]">Thema {teil.themen.indexOf(selectedTopic) + 1}: {selectedTopic.title}</h3>
          </div>

          {/* Slides Grid */}
          <div className="space-y-12 pt-8">
             {[
               { instr: "Stellen Sie Ihr Thema vor. Erklären Sie den Inhalt und die Struktur Ihrer Präsentation.", title: selectedTopic.title, folie: 1 },
               { instr: "Berichten Sie von Ihrer Situation oder einem Erlebnis im Zusammenhang mit dem Thema.", title: "Meine persönlichen Erfahrungen", folie: 2 },
               { instr: "Berichten Sie von der Situation in Ihrem Heimatland und geben Sie Beispiele.", title: "Die Situation in meinem Heimatland", folie: 3 },
               { instr: "Nennen Sie die Vor- und Nachteile und sagen Sie dazu Ihre Meinung. Geben Sie auch Beispiele.", title: "Vor- und Nachteile & Meine Meinung", folie: 4 },
               { instr: "Beenden Sie Ihre Präsentation und bedanken Sie sich bei den Zuhörern.", title: "Abschluss & Dank", folie: 5 }
             ].map((slide, i) => (
               <div key={i} className="grid grid-cols-12 gap-4 sm:gap-8 items-start">
                  {/* Left: Instruction */}
                  <div className="col-span-12 sm:col-span-3 text-[10px] font-bold leading-relaxed text-white/40">
                     {slide.instr}
                  </div>

                  {/* Middle: Folie Card */}
                  <div className="col-span-12 sm:col-span-4 aspect-[4/3] border-[1.5px] border-white/20 p-4 flex flex-col items-center justify-center text-center relative bg-white/5 rounded-xl">
                     <div className="absolute top-2 left-2 h-6 w-6 rounded-full border border-white/20 flex items-center justify-center text-[8px] font-black">
                        Folie {slide.folie}
                     </div>
                     <span className="text-[10px] font-bold text-white/30 mb-1">{selectedTopic.title}</span>
                     <span className="text-sm font-black leading-tight">{slide.title}</span>
                  </div>

                  {/* Right: Note Lines */}
                  <div className="col-span-12 sm:col-span-5 relative pt-2">
                     <textarea
                        value={notes[i]}
                        onChange={(e) => handleNoteChange(i, e.target.value)}
                        placeholder="Ihre Notizen..."
                        className="w-full h-32 bg-transparent border-none focus:ring-0 text-sm leading-[24px] font-medium resize-none overflow-hidden placeholder:text-white/10"
                        style={{
                           backgroundImage: 'linear-gradient(transparent, transparent 23px, rgba(255,255,255,0.1) 23px)',
                           backgroundSize: '100% 24px'
                        }}
                     />
                  </div>
               </div>
             ))}
          </div>
        </div>
      </div>

      {/* Control Strip */}
      {!hasStarted && (
          <div className="bg-[#111] p-6 rounded-[32px] border border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
             <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-[#ffcc00]/10 flex items-center justify-center">
                   <PenTool className="h-6 w-6 text-[#ffcc00]" />
                </div>
                <div>
                   <h4 className="text-sm font-black text-white uppercase leading-none mb-1">Vorbereitungsphase</h4>
                   <p className="text-xs text-white/40 font-medium">Nutzen Sie die Zeit für Ihre Notizen auf den Folien.</p>
                </div>
             </div>
             <Button 
                onClick={() => setSelectedTopic(null)}
                variant="ghost" 
                className="text-white/30 hover:text-white"
             >
                Thema ändern
             </Button>
          </div>
      )}
    </div>
  );
};

export default Teil2;
