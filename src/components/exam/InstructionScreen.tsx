import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useExamStore } from '@/hooks/useExamStore';
import { BookOpen, Headphones, PenTool, MessageSquare, Play, Clock, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InstructionScreenProps {
  module: 'lesen' | 'horen' | 'schreiben' | 'sprechen';
  metadata: any;
}

export const InstructionScreen: React.FC<InstructionScreenProps> = ({ module, metadata }) => {
  const { startModule } = useExamStore();

  const config = {
    lesen: {
      icon: <BookOpen className="h-10 w-10 text-[#ffcc00]" />,
      title: 'Modul LESEN',
      time: '65 Minuten',
      parts: '5 Teile',
      points: '100 Punkte (30 Aufgaben)',
      desc: 'In diesem Modul lesen Sie verschiedene Texte und lösen Aufgaben dazu.',
      rules: [
        'Sie haben 65 Minuten Zeit für alle 5 Teile.',
        'Teil 1-5 umfassen verschiedene Textsorten (Blogs, Anzeigen, Artikel).',
        'Das Ergebnis wird auf eine 100-Punkte-Skala umgerechnet.'
      ]
    },
    horen: {
      icon: <Headphones className="h-10 w-10 text-red-500" />,
      title: 'Modul HÖREN',
      time: '40 Minuten',
      parts: '4 Teile',
      points: '100 Punkte (30 Aufgaben)',
      desc: 'In diesem Modul hören Sie verschiedene Texte und lösen Aufgaben dazu.',
      rules: [
        'Teil 1 & 4: Sie hören die Texte ZWEIMAL.',
        'Teil 2 & 3: Sie hören die Texte EINMAL.',
        'Die Audioplayer starten automatisch oder manuell je nach Teil.',
        'Sie haben insgesamt ca. 40 Minuten Zeit.'
      ]
    },
    schreiben: {
      icon: <PenTool className="h-10 w-10 text-[#ffcc00]" />,
      title: 'Modul SCHREIBEN',
      time: '60 Minuten',
      parts: '3 Aufgaben',
      points: '100 Punkte insgesamt',
      desc: 'In diesem Modul schreiben Sie Texte zu vorgegebenen Themen.',
      rules: [
        'Aufgabe 1: E-Mail (persönlich, ca. 80 Wörter).',
        'Aufgabe 2: Diskussionsbeitrag (ca. 80 Wörter).',
        'Aufgabe 3: E-Mail (formell, ca. 40 Wörter).',
        'Achten Sie auf Wortanzahl und alle Inhaltspunkte.'
      ]
    },
    sprechen: {
      icon: <MessageSquare className="h-10 w-10 text-red-500" />,
      title: 'Modul SPRECHEN',
      time: '15 min Vorbereitung + 15 min Prüfung',
      parts: '3 Teile',
      points: '100 Punkte insgesamt',
      desc: 'Dieses Modul besteht aus einer Vorbereitungszeit und der eigentlichen Prüfung.',
      rules: [
        'Teil 1: Gemeinsam etwas planen (Interaktion).',
        'Teil 2: Ein Thema präsentieren (Monolog).',
        'Teil 3: Über das Thema sprechen (Fragen/Feedback).',
        'Die Prüfung erfolgt in dieser Simulation geführt.'
      ]
    }
  };

  const current = config[module];

  return (
    <div className="flex items-center justify-center min-h-[70vh] p-4 sm:p-6 animate-in fade-in zoom-in duration-500">
      <Card className="w-full max-w-lg border border-white/5 bg-[#111]/80 backdrop-blur-xl shadow-2xl overflow-hidden rounded-[32px]">
        <div className="h-1 bg-gradient-to-r from-black via-red-600 to-[#ffcc00]" />
        <CardHeader className="text-center pb-0 pt-6">
          <div className="mx-auto mb-4 p-3 bg-white/5 rounded-2xl w-fit shadow-inner">
            {React.cloneElement(current.icon as React.ReactElement, { className: 'h-8 w-8 text-[#ffcc00]' })}
          </div>
          <CardTitle className="text-2xl sm:text-3xl font-black tracking-tighter text-white uppercase italic">{current.title}</CardTitle>
          <CardDescription className="text-xs sm:text-sm mt-1 font-black text-[#ffcc00] uppercase tracking-[0.2em] italic">
            {current.time} • {current.parts} • {current.points}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6 px-6 sm:px-8 pt-4">
          <div className="bg-white/5 p-4 rounded-2xl border border-white/5 shadow-inner">
            <p className="text-white/40 leading-relaxed font-bold italic text-center text-[10px] uppercase tracking-wider">
              &quot;{current.desc}&quot;
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="font-black flex items-center gap-2 text-white/20 uppercase tracking-[0.3em] text-[8px]">
              <Info className="h-3 w-3 text-red-500" />
              Wichtige Regeln:
            </h4>
            <div className="grid grid-cols-1 gap-2">
              {current.rules.map((rule, index) => (
                <div key={index} className="flex items-start gap-3 text-[11px] text-white/60 bg-white/[0.02] p-3 rounded-xl border border-white/5 transition-all hover:bg-white/[0.05]">
                  <div className="h-5 w-5 rounded-lg bg-red-500 text-black flex items-center justify-center shrink-0 font-black text-[10px]">
                    {index + 1}
                  </div>
                  <span className="font-bold leading-snug">{rule}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>

        <CardFooter className="px-6 sm:px-8 pb-8 pt-2 flex flex-col gap-3">
          <Button 
            size="lg" 
            className="w-full h-12 text-sm font-black rounded-xl shadow-lg bg-[#ffcc00] text-black hover:bg-[#ffcc00]/90 transition-all uppercase italic" 
            onClick={() => startModule(module, metadata?.[module]?.meta?.timeMinutes || 60)}
          >
            <Play className="mr-2 h-3 w-3 fill-current" />
            STARTEN
          </Button>
          <div className="flex items-center justify-center gap-2 px-3 py-1 rounded-full bg-white/[0.02] border border-white/5 w-fit mx-auto">
            <Clock className="h-2 w-2 text-[#ffcc00]" />
            <p className="text-[7px] text-white/20 font-black uppercase tracking-[0.2em]">
              Timer startet sofort
            </p>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};
