import React from 'react';
import { cn } from '@/lib/utils';
import { Info } from 'lucide-react';

interface Teil3Props {
  teil: any;
  topic: any;
  hasStarted: boolean;
}

const Teil3: React.FC<Teil3Props> = ({ teil, topic, hasStarted }) => {
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
        <div className="relative z-10 space-y-12">
          {/* Title */}
          <div className="flex justify-between items-baseline border-b border-white/10 pb-4">
            <h2 className="text-2xl font-black">{teil.label} {teil.title}</h2>
          </div>

          <div className="space-y-12">
            {/* Section 1 */}
            <div className="space-y-4">
                <h3 className="text-xl font-black uppercase italic text-[#ffcc00]">Nach Ihrer Präsentation:</h3>
                <p className="text-lg font-medium leading-relaxed text-white/70 pr-0 sm:pr-12">
                   Reagieren Sie auf die Rückmeldung und auf Fragen der Prüfer/-innen und des Gesprächspartners/der Gesprächspartnerin.
                </p>
            </div>

            {/* Section 2 */}
            <div className="space-y-6">
                <h3 className="text-xl font-black uppercase italic text-[#ffcc00]">Nach der Präsentation Ihres Partners/Ihrer Partnerin:</h3>
                <div className="space-y-6 pl-0 sm:pl-4">
                    <div className="flex items-start gap-4">
                        <span className="text-lg font-bold">a)</span>
                        <div className="space-y-2">
                           <p className="text-lg font-bold">Geben Sie eine Rückmeldung zur Präsentation Ihres Partners/Ihrer Partnerin</p>
                           <p className="text-base font-medium text-white/40 italic">(z. B. wie Ihnen die Präsentation gefallen hat, was für Sie neu oder besonders interessant war usw.).</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-4">
                        <span className="text-lg font-bold">b)</span>
                        <p className="text-lg font-bold">Stellen Sie auch eine Frage zur Präsentation Ihres Partners/Ihrer Partnerin.</p>
                    </div>
                </div>
            </div>
          </div>
        </div>
      </div>

      {/* Context Alert */}
      {!hasStarted && (
        <div className="bg-[#ffcc00]/5 border border-[#ffcc00]/10 p-6 rounded-[32px] flex items-start gap-4">
          <div className="h-10 w-10 rounded-2xl bg-[#ffcc00]/10 flex items-center justify-center shrink-0">
            <Info className="h-5 w-5 text-[#ffcc00]" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-black text-white uppercase">Interaktions-Phase</h4>
            <p className="text-sm text-white/50 leading-relaxed font-medium">
               Der KI-Prüfungspartner wird nun auf Ihre Präsentation aus Teil 2 reagieren und eine Frage stellen. Bitte antworten Sie mündlich.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Teil3;
