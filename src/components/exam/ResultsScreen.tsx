import React, { useEffect, useState } from 'react';
import { useExamStore } from '@/hooks/useExamStore';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { FileDown, RefreshCw, Trophy, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import confetti from 'canvas-confetti';
import { generateAnalysisReport } from '@/lib/exam/AnalysisGenerator';

interface ResultsScreenProps {
  data?: any;
}

export const ResultsScreen: React.FC<ResultsScreenProps> = ({ data }) => {
  const { scores, resetExam, variantId, answers } = useExamStore();
  const [scaledScores, setScaledScores] = useState<Record<string, number>>({});

  useEffect(() => {
    const newScaled: Record<string, number> = {
      lesen: Math.round(((scores.lesen || 0) / 30) * 100),
      horen: Math.round(((scores.horen || 0) / 30) * 100),
      schreiben: scores.schreiben || 0,
      sprechen: scores.sprechen || 0,
    };
    setScaledScores(newScaled);
  }, [scores]);

  const modules = [
    { id: 'lesen', name: 'Lesen' },
    { id: 'horen', name: 'Hören' },
    { id: 'schreiben', name: 'Schreiben' },
    { id: 'sprechen', name: 'Sprechen' }
  ] as const;

  const passedAll = Object.values(scaledScores).every(s => s >= 60);

  useEffect(() => {
    if (passedAll) {
      confetti({
        particleCount: 60,
        spread: 50,
        origin: { y: 0.6 },
        colors: ['#22c55e', '#ffffff', '#3b82f6']
      });
    }
  }, [passedAll]);

  const handleDownloadAnalysis = () => {
    if (data && variantId) {
      generateAnalysisReport(variantId, scores, answers, data);
    }
  };

  const getPointsDisplay = (moduleId: string) => {
    const earned = scores[moduleId] || 0;
    const max = moduleId === 'lesen' ? 30 : moduleId === 'horen' ? 30 : moduleId === 'schreiben' ? 20 : 25;
    return { earned, max };
  };

  return (
    <div className="h-screen bg-[#0a0a0a] text-white flex items-center justify-center p-4" dir="ltr">
      {/* Background Glows */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-20%] right-[-20%] w-[40%] h-[40%] bg-[#22c55e]/5 blur-[80px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-20%] left-[-20%] w-[35%] h-[35%] bg-blue-500/5 blur-[80px] rounded-full" />
      </div>

      <div className="max-w-md w-full animate-in fade-in zoom-in duration-500">
        
        {/* Main Result Card */}
        <Card className="bg-[#111] border-white/5 rounded-2xl overflow-hidden shadow-xl">
          <div className={cn(
            "h-1 w-full",
            passedAll ? "bg-gradient-to-r from-[#22c55e] to-blue-500" : "bg-red-500"
          )} />
          
          <div className="p-5 space-y-5">
            {/* Header */}
            <div className="text-center space-y-1">
              <div className="flex items-center justify-center gap-1.5 mb-4">
                <Trophy className="h-3.5 w-3.5 text-[#22c55e]" />
                <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-white/40">Goethe B1 Ergebnis</span>
              </div>
              <h1 className="text-2xl font-black italic tracking-tighter uppercase leading-none">
                {passedAll ? 'Bestanden' : 'Nicht bestanden'}
              </h1>
              <p className="text-[9px] font-medium text-white/20 uppercase tracking-wider">
                {new Date().toLocaleDateString('de-DE', { day: '2-digit', month: 'short', year: 'numeric' })}
              </p>
            </div>

            {/* Module Results */}
            <div className="space-y-2">
              {/* Header row */}
              <div className="flex items-center justify-between px-2 pb-1 border-b border-white/10">
                <span className="text-[9px] font-bold uppercase tracking-wider text-white/30">Modul</span>
                <span className="text-[9px] font-bold uppercase tracking-wider text-white/30">Punkte</span>
              </div>
              
              {/* Module rows */}
              <div className="space-y-1">
                {modules.map((m) => {
                  const { earned, max } = getPointsDisplay(m.id);
                  const passed = scaledScores[m.id] >= 60;
                  return (
                    <div key={m.id} className="flex items-center justify-between p-2 bg-white/[0.02] rounded-xl">
                      <p className="text-sm font-bold tracking-tight">{m.name}</p>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span className={cn(
                            "text-base font-bold",
                            passed ? "text-white" : "text-red-400"
                          )}>
                            {earned}
                          </span>
                          <span className="text-[10px] font-medium text-white/30">/{max}</span>
                        </div>
                        <div className={cn(
                          "h-6 w-6 rounded-full flex items-center justify-center",
                          passed ? "bg-[#22c55e]/10" : "bg-red-500/10"
                        )}>
                          {passed ? (
                            <CheckCircle2 className="h-3.5 w-3.5 text-[#22c55e]" />
                          ) : (
                            <div className="h-1.5 w-1.5 rounded-full bg-red-500/30" />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Pass/Fail Summary */}
            <div className={cn(
              "p-2.5 rounded-xl text-center",
              passedAll ? "bg-[#22c55e]/5 border border-[#22c55e]/10" : "bg-red-500/5 border border-red-500/10"
            )}>
              <p className={cn(
                "text-[10px] font-bold uppercase tracking-wider",
                passedAll ? "text-[#22c55e]" : "text-red-400"
              )}>
                {passedAll ? '✓ Prüfung bestanden' : '✗ Prüfung nicht bestanden'}
              </p>
              <p className="text-[8px] text-white/30 mt-0.5">
                Bestehensgrenze: 60% pro Modul
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-white/5 p-3 text-center border-t border-white/5">
            <p className="text-[8px] font-medium text-white/20 uppercase tracking-[0.2em]">Goethe-Zertifikat B1 • Simulation</p>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 mt-4">
          <Button 
            onClick={handleDownloadAnalysis}
            className="h-11 bg-[#22c55e] text-white hover:bg-[#22c55e]/90 rounded-xl font-bold text-[11px] uppercase tracking-wide shadow-lg transition-all active:scale-[0.98]"
          >
            <FileDown className="mr-1.5 h-3.5 w-3.5" /> PDF
          </Button>
          <Button 
            variant="outline"
            onClick={resetExam}
            className="h-11 bg-white/5 text-white/60 hover:text-white border-white/10 rounded-xl font-bold text-[11px] uppercase tracking-wide transition-all active:scale-[0.98]"
          >
            <RefreshCw className="mr-1.5 h-3.5 w-3.5" /> Neu
          </Button>
        </div>
      </div>
    </div>
  );
};