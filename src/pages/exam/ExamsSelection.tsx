import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowRight, ChevronLeft, Shield, RotateCcw, Play } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useExamStore } from '@/hooks/useExamStore';
import { isLimitedAccess, isTestAccess } from '@/lib/access';

const ExamsSelection = () => {
  const navigate = useNavigate();
  const { resetExam } = useExamStore();
  const [step, setStep] = useState(1);
  const [level, setLevel] = useState<'B1' | 'B2' | null>(null);
  const [institute, setInstitute] = useState<'Goethe' | 'Telc' | null>(null);

  useEffect(() => {
    resetExam();
  }, [resetExam]);

  const handleStart = () => {
    if (level && institute) {
      navigate(`/exam/${institute.toLowerCase()}-${level.toLowerCase()}`);
    }
  };

  const nextStep = () => setStep(prev => prev + 1);
  const prevStep = () => setStep(prev => prev - 1);

  return (
    <div className="min-h-screen bg-[#0a0a0a] exam-container flex flex-col p-4 sm:p-6 relative overflow-hidden" dir="ltr">
      {/* Premium Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#ff0000]/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#ffcc00]/5 blur-[120px] rounded-full" />
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between mb-6 sm:mb-8">
        <Button variant="ghost" size="sm" className="text-white/60 hover:text-white h-7 px-2 text-[10px]" onClick={() => navigate('/')}>
          <ChevronLeft className="mr-1 h-3 w-3" /> ZURÜCK
        </Button>
        <div className="flex items-center gap-1.5">
          <img src="/deutschpath_logo.svg" alt="Logo" className="h-6 w-auto" />
          <span className="font-black text-sm tracking-tighter text-white uppercase">Deutsch<span className="text-[#ffcc00]">Path</span></span>
        </div>
        <div className="w-12" />
      </header>

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center max-w-2xl mx-auto w-full">
        {/* Progress Stepper (Compact) */}
        <div className="flex items-center gap-2 mb-6 sm:mb-8 w-full max-w-[120px] mx-auto">
          {[1, 2, 3].map((s) => (
            <React.Fragment key={s}>
              <div className={cn(
                "h-1 w-1 rounded-full transition-all duration-500",
                step >= s ? "bg-[#ffcc00] shadow-[0_0_8px_rgba(255,204,0,0.5)]" : "bg-white/10"
              )} />
              {s < 3 && <div className={cn("flex-1 h-[0.5px]", step > s ? "bg-[#ffcc00]" : "bg-white/10")} />}
            </React.Fragment>
          ))}
        </div>

        {/* Step 1: Level */}
        {step === 1 && (
          <div className="w-full space-y-4 sm:space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center">
              <h1 className="text-xl sm:text-2xl font-black text-white mb-1 tracking-tighter uppercase italic">
                Wähle dein <span className="text-[#ffcc00]">Niveau</span>
              </h1>
              <p className="text-white/20 font-black uppercase tracking-[0.2em] text-[7px] sm:text-[8px]">Welche Stufe strebst du an?</p>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:gap-3 max-w-xs mx-auto w-full">
              {['B1', 'B2'].map((l) => (
                <Card 
                  key={l}
                  className={cn(
                    "group relative overflow-hidden cursor-pointer transition-all duration-300 border h-16 sm:h-20 flex flex-col items-center justify-center bg-white/[0.02] hover:bg-white/[0.05]",
                    level === l ? "border-[#ffcc00] bg-[#ffcc00]/5" : "border-white/5"
                  )}
                  onClick={() => {
                    setLevel(l as any);
                    nextStep();
                  }}
                >
                  <span className={cn(
                    "text-lg sm:text-xl font-black italic transition-all",
                    level === l ? "text-[#ffcc00]" : "text-white/20"
                  )}>{l}</span>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Institute */}
        {step === 2 && (
          <div className="w-full space-y-4 sm:space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="text-center">
              <h1 className="text-xl sm:text-2xl font-black text-white mb-1 tracking-tighter uppercase italic">
                Wähle das <span className="text-[#ff0000]">Institut</span>
              </h1>
              <p className="text-white/20 font-black uppercase tracking-[0.2em] text-[7px] sm:text-[8px]">Prüfungsformat festlegen</p>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:gap-3 max-w-xs mx-auto w-full">
              {['Goethe', 'Telc'].map((i) => {
                const isSoon = i === 'Telc';
                return (
                  <Card 
                    key={i}
                    className={cn(
                      "group relative overflow-hidden transition-all duration-300 border h-16 sm:h-20 flex flex-col items-center justify-center bg-white/[0.02]",
                      institute === i ? "border-[#ff0000] bg-[#ff0000]/5" : "border-white/5",
                      isSoon ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:bg-white/[0.05]"
                    )}
                    onClick={() => {
                      if (!isSoon) {
                        setInstitute(i as any);
                        nextStep();
                      }
                    }}
                  >
                    <span className={cn(
                      "text-sm sm:text-base font-black uppercase italic transition-all",
                      institute === i ? "text-[#ff0000]" : "text-white/20"
                    )}>
                      {i} {isSoon && <span className="text-[10px] ml-1 lowercase not-italic opacity-60">(soon)</span>}
                    </span>
                  </Card>
                );
              })}
            </div>
            <Button variant="ghost" size="sm" className="mx-auto flex text-white/20 hover:text-white h-6 text-[8px] uppercase font-black" onClick={prevStep}>
              <ChevronLeft className="mr-1 h-3 w-3" /> Zurück
            </Button>
          </div>
        )}

        {/* Step 3: Summary & Start */}
        {step === 3 && (
          <div className="w-full space-y-4 sm:space-y-6 animate-in fade-in zoom-in duration-500">
            <div className="text-center">
              <h1 className="text-xl sm:text-2xl font-black text-white mb-1 tracking-tighter uppercase italic">
                Alles <span className="text-white">Bereit?</span>
              </h1>
              <p className="text-white/20 font-black uppercase tracking-[0.2em] text-[7px] sm:text-[8px]">Überprüfung deiner Auswahl</p>
            </div>
            
            <Card className="bg-[#111]/80 backdrop-blur-xl border border-white/5 p-4 sm:p-6 shadow-2xl relative overflow-hidden max-w-[280px] mx-auto w-full rounded-2xl">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-black via-red-600 to-[#ffcc00]" />
              <div className="flex flex-col items-center gap-4">
                <div className="flex items-center justify-center gap-6">
                  <div className="text-center">
                    <p className="text-[6px] font-black text-white/20 uppercase mb-0.5 tracking-widest italic">Niveau</p>
                    <span className="text-2xl sm:text-3xl font-black text-[#ffcc00] italic">{level}</span>
                  </div>
                  <div className="h-8 w-[1px] bg-white/5" />
                  <div className="text-center">
                    <p className="text-[6px] font-black text-white/20 uppercase mb-0.5 tracking-widest italic">Format</p>
                    <span className="text-2xl sm:text-3xl font-black text-white italic">{institute}</span>
                  </div>
                </div>

                <div className="w-full space-y-1.5">
                  <Button 
                    className={cn("w-full h-10 text-xs font-black rounded-lg shadow-lg transition-all", (isLimitedAccess() || isTestAccess()) ? "bg-white/10 text-white/40 cursor-not-allowed" : "bg-[#ffcc00] text-black hover:bg-[#ffcc00]/90")}
                    onClick={handleStart}
                    disabled={isLimitedAccess() || isTestAccess()}
                  >
                    {(isLimitedAccess() || isTestAccess()) ? 'GESPERRT (PREMIUM)' : 'STARTEN'} <ArrowRight className="ml-1.5 h-3 w-3" />
                  </Button>
                  {(isLimitedAccess() || isTestAccess()) && (
                    <p className="text-[#ff0000] font-black text-[8px] uppercase mt-1 text-center tracking-widest leading-tight">Zugriff verweigert: Nur für Premium-Nutzer</p>
                  )}
                  <Button variant="ghost" size="sm" className="w-full text-white/20 hover:text-white h-7 text-[8px] uppercase font-black mt-2" onClick={prevStep}>
                    <RotateCcw className="mr-1 h-3 w-3" /> Auswahl ändern
                  </Button>
                </div>
              </div>
            </Card>

            <div className="bg-white/[0.02] border border-white/5 p-3 rounded-xl flex items-center gap-2 max-w-[280px] mx-auto">
              <Shield className="h-3 w-3 text-[#ffcc00] shrink-0" />
              <p className="text-[8px] text-white/40 font-bold leading-tight italic uppercase tracking-wider">
                Simulation: 3 Varianten verfügbar.
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-4 text-center mt-auto">
        <p className="text-[7px] font-black text-white/5 uppercase tracking-[0.5em]">
          DeutschPath • Premium Simulation
        </p>
      </footer>
    </div>
  );
};

export default ExamsSelection;
