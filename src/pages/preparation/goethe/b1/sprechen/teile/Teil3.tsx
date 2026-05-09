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
      <div className="bg-white space-y-10">
        <div className="flex justify-between items-baseline border-b border-gray-200 pb-2">
          <h2 className="text-[11px] font-bold text-gray-900 uppercase tracking-tight">{teil.label} {teil.title}</h2>
        </div>

        <div className="space-y-10">
          <div className="space-y-3">
              <h3 className="text-[9px] font-bold uppercase text-gray-400 tracking-widest">Nach Ihrer Präsentation:</h3>
              <div className="p-4 border-l-2 border-gray-900 bg-gray-50">
                <p className="text-xs font-serif italic leading-relaxed text-gray-700">
                   Reagieren Sie auf die Rückmeldung und auf Fragen der Prüfer/-innen und des Gesprächspartners/der Gesprächspartnerin.
                </p>
              </div>
          </div>

          <div className="space-y-4 pt-4">
              <h3 className="text-[9px] font-bold uppercase text-gray-400 tracking-widest">Nach der Präsentation Ihres Partners:</h3>
              <div className="space-y-6 pl-4">
                  <div className="flex items-start gap-3">
                      <span className="text-xs font-bold text-gray-900">a)</span>
                      <div className="space-y-1">
                         <p className="text-xs font-bold text-gray-800 uppercase tracking-tight">Geben Sie eine Rückmeldung zur Präsentation Ihres Partners</p>
                         <p className="text-[9px] font-medium text-gray-400 italic">(z. B. wie Ihnen die Präsentation gefallen hat, was für Sie neu war usw.).</p>
                      </div>
                  </div>
                  <div className="flex items-start gap-3">
                      <span className="text-xs font-bold text-gray-900">b)</span>
                      <p className="text-xs font-bold text-gray-800 uppercase tracking-tight">Stellen Sie auch eine Frage zur Präsentation Ihres Partners.</p>
                  </div>
              </div>
          </div>
        </div>
      </div>

      {!hasStarted && (
        <div className="border border-gray-200 p-4 flex items-start gap-3 bg-gray-50">
          <Info className="h-4 w-4 text-gray-400 shrink-0" />
          <div className="space-y-1">
            <h4 className="text-[9px] font-bold text-gray-900 uppercase tracking-widest">Hinweis</h4>
            <p className="text-[9px] text-gray-500 leading-relaxed font-medium italic">
               Der KI-Partner wird auf Ihre Präsentation reagieren und eine Frage stellen.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Teil3;
