import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useExamStore } from '@/hooks/useExamStore';
import { isLimitedAccess, isTestAccess, WHATSAPP_LINK } from '@/lib/access';
import { ExamHeader } from '@/components/exam/ExamHeader';
import { InstructionScreen } from '@/components/exam/InstructionScreen';
import { LesenModule } from '@/components/exam/LesenModule';
import { HorenModule } from '@/components/exam/HorenModule';
import { SchreibenModule } from '@/components/exam/SchreibenModule';
import { SprechenModule } from '@/components/exam/SprechenModule';
import { ResultsScreen } from '@/components/exam/ResultsScreen';
import { Button } from '@/components/ui/button';
import { ArrowRight, BookOpen, Clock, Trophy, ChevronLeft, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const ExamSimulator = () => {
  const { instituteLevel } = useParams<{ instituteLevel: string }>();
  const navigate = useNavigate();
  const { currentModule, targetModule, variantId, startExam, completedVariants, resetExam } = useExamStore();
  
  const [examData, setExamData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [variants, setVariants] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showVariantSelection, setShowVariantSelection] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [pendingPath, setPendingPath] = useState<string | null>(null);

  // Prevent back navigation/refresh
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (variantId && currentModule !== 'start' && currentModule !== 'results') {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    const handlePopState = (e: PopStateEvent) => {
      if (variantId && currentModule !== 'start' && currentModule !== 'results') {
        window.history.pushState(null, '', window.location.href);
        setShowExitConfirm(true);
        setPendingPath('/exams');
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handlePopState);

    // Initial push to handle back button
    if (variantId && currentModule !== 'start' && currentModule !== 'results') {
      window.history.pushState(null, '', window.location.href);
    }

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [variantId, currentModule]);

  const confirmExit = () => {
    resetExam();
    setShowExitConfirm(false);
    navigate(pendingPath || '/exams');
  };

  // Parse institute and level
  const [institute, level] = instituteLevel?.split('-') || ['goethe', 'b1'];
  const formattedInstitute = institute.charAt(0).toUpperCase() + institute.slice(1);
  const formattedLevel = level.toUpperCase();

  useEffect(() => {
    const fetchIndex = async () => {
      try {
        const response = await fetch(`/src/data/exam/${formattedLevel}/${formattedInstitute}/index.json`);
        if (!response.ok) throw new Error("Not found");
        const data = await response.json();
        setVariants(data.variants);
      } catch (err) {
        console.error("Failed to fetch exam index:", err);
        setError("Diese Prüfungssimulation ist momentan noch nicht verfügbar. Bitte wählen Sie Goethe B1.");
      }
    };
    fetchIndex();
  }, [formattedInstitute, formattedLevel]);

  useEffect(() => {
    if (currentModule !== 'start' && currentModule !== null && !variantId) {
      navigate('/exams', { replace: true });
      return;
    }

    if (variantId && currentModule !== 'start' && currentModule !== 'results' && currentModule !== null) {
      const fetchVariantData = async () => {
        setLoading(true);
        try {
          const modules = ['lesen', 'horen', 'schreiben', 'sprechen', 'metadata'];
          const data: any = {};
          for (const mod of modules) {
            const res = await fetch(`/src/data/exam/${formattedLevel}/${formattedInstitute}/variants/variant_${variantId}/${mod}.json`);
            if (!res.ok) throw new Error(`Module ${mod} not found`);
            data[mod] = await res.json();
          }
          setExamData(data);
        } catch (err) {
          console.error("Failed to fetch variant data:", err);
          setError("Fehler beim Laden der Prüfungsdaten.");
        } finally {
          setLoading(false);
        }
      };
      fetchVariantData();
    }
  }, [variantId, currentModule, formattedInstitute, formattedLevel, navigate]);

  const handleStartRandom = () => {
    const availableVariants = variants.filter(v => !completedVariants.includes(v.id));
    if (availableVariants.length > 0) {
      const randomIdx = Math.floor(Math.random() * availableVariants.length);
      const selected = availableVariants[randomIdx];
      startExam(selected.id);
    } else {
      setShowVariantSelection(true);
    }
  };

  const handleStartSpecific = (id: string) => {
    startExam(id);
    setShowVariantSelection(false);
  };

  if (isLimitedAccess() || isTestAccess()) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4 exam-container" dir="ltr">
        <AlertDialog open={true}>
          <AlertDialogContent className="bg-[#111] border border-white/5 rounded-[32px] max-w-sm mx-auto text-center">
            <AlertDialogHeader>
              <div className="h-20 w-20 bg-[#25D366]/10 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-[#25D366]/20 shadow-[0_0_30px_rgba(37,211,102,0.2)]">
                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/WhatsApp.svg/512px-WhatsApp.svg.png" alt="WhatsApp" className="h-12 w-12 drop-shadow-md" />
              </div>
              <AlertDialogTitle className="text-2xl font-black text-white uppercase tracking-tighter italic text-center">Premium Zugang</AlertDialogTitle>
              <AlertDialogDescription className="text-white/60 font-bold text-xs uppercase tracking-widest leading-relaxed pt-2 text-center">
                Diese Prüfungssimulation ist nur in der Vollversion verfügbar.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="mt-8 flex flex-col gap-3">
              <a 
                href={WHATSAPP_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-3 h-14 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-xl font-black text-sm uppercase tracking-widest transition-all shadow-lg active:scale-95"
              >
                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/WhatsApp.svg/512px-WhatsApp.svg.png" alt="WhatsApp" className="h-5 w-5 brightness-0 invert" />
                Vollversion freischalten
              </a>
              <Button onClick={() => navigate('/exams')} variant="ghost" className="h-12 text-white/40 hover:text-white uppercase font-black text-[10px] tracking-widest w-full">
                <ChevronLeft className="mr-2 h-4 w-4" /> ZURÜCK ZUR AUSWAHL
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4 exam-container" dir="ltr">
        <Card className="max-w-md w-full border-2 border-red-500/20 bg-[#111] shadow-2xl rounded-[32px]">
          <CardHeader className="text-center">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <CardTitle className="text-2xl font-black text-white tracking-tighter uppercase italic">In Vorbereitung</CardTitle>
            <CardDescription className="text-sm font-bold text-white/40 mt-4 leading-relaxed italic">{error}</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center pb-12">
            <Button size="lg" className="rounded-2xl font-black bg-[#ffcc00] text-black hover:bg-[#ffcc00]/90 px-8 h-14 uppercase italic" onClick={() => navigate('/exams')}>
              <ChevronLeft className="mr-2 h-5 w-5" /> Zurück
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (currentModule === 'start' || !variantId) {
    const availableCount = variants.filter(v => !completedVariants.includes(v.id)).length;

    return (
      <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center p-4 sm:p-6 exam-container relative overflow-hidden" dir="ltr">
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
          <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-[#ffcc00]/5 blur-[120px] rounded-full" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/5 blur-[100px] rounded-full" />
        </div>
        <div className="max-w-2xl w-full space-y-8 animate-in fade-in zoom-in duration-700 relative z-10">
          {!showVariantSelection ? (
            <>
              <div className="text-center space-y-3 sm:space-y-4">
                <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 transition-transform duration-700 hover:scale-110">
                  <img src="/deutschpath_logo.svg" alt="Logo" className="w-full h-full" />
                </div>
                <h1 className="text-2xl sm:text-4xl font-black tracking-tighter text-white leading-none uppercase italic">
                  {formattedInstitute}-Zertifikat <span className="text-[#ffcc00]">{formattedLevel}</span>
                </h1>
                <p className="text-xs sm:text-sm text-white/20 font-black uppercase tracking-[0.4em] italic">Prüfungssimulation</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 text-center space-y-2">
                  <BookOpen className="h-5 w-5 mx-auto text-[#ffcc00]" />
                  <h3 className="font-black text-white text-[10px] uppercase tracking-tight italic">Originaltreu</h3>
                  <p className="text-[7px] text-white/30 uppercase font-black leading-tight">Offizielle Richtlinien.</p>
                </div>
                <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 text-center space-y-2">
                  <Clock className="h-5 w-5 mx-auto text-red-500" />
                  <h3 className="font-black text-white text-[10px] uppercase tracking-tight italic">Timer</h3>
                  <p className="text-[7px] text-white/30 uppercase font-black leading-tight">Separate Zeitmessung.</p>
                </div>
                <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 text-center space-y-2">
                  <Trophy className="h-5 w-5 mx-auto text-white" />
                  <h3 className="font-black text-white text-[10px] uppercase tracking-tight italic">Analyse</h3>
                  <p className="text-[7px] text-white/30 uppercase font-black leading-tight">PDF-Report am Ende.</p>
                </div>
              </div>

              <div className="flex flex-col items-center gap-4 pt-4">
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                  <Button 
                    size="lg" 
                    className="h-12 px-10 text-sm font-black rounded-xl bg-[#ffcc00] text-black hover:bg-[#ffcc00]/90 transition-all shadow-xl hover:scale-105 active:scale-95 uppercase italic"
                    onClick={handleStartRandom}
                  >
                    Zufällige Variante <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline"
                    size="lg" 
                    className="h-12 px-10 text-sm font-black rounded-xl border-white/10 bg-white/5 text-white hover:bg-white/10 transition-all uppercase italic"
                    onClick={() => setShowVariantSelection(true)}
                  >
                    Variante Wählen
                  </Button>
                </div>
                
                <Link to="/exams" className="flex items-center gap-2 text-white/20 hover:text-white transition-colors font-black uppercase tracking-widest text-[9px] italic">
                  <ChevronLeft className="h-3 w-3" /> Zurück zur Auswahl
                </Link>

                {completedVariants.length > 0 && (
                  <div className="pt-2 flex items-center gap-2">
                    <span className="text-[8px] font-black text-white/10 uppercase tracking-widest italic">Abgeschlossen:</span>
                    <div className="flex gap-1">
                      {completedVariants.map(id => (
                        <div key={id} className="w-1.5 h-1.5 rounded-full bg-[#ffcc00]/40" />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
               <div className="flex items-center justify-between">
                 <h2 className="text-2xl font-black text-white uppercase tracking-tighter italic">Variante wählen</h2>
                 <Button variant="ghost" onClick={() => setShowVariantSelection(false)} className="text-white/20 hover:text-white font-black uppercase tracking-widest text-[10px]">
                   <ChevronLeft className="mr-2 h-4 w-4" /> Zurück
                 </Button>
               </div>
               <p className="text-xs text-white/40 font-bold italic uppercase tracking-wider">Wählen Sie eine Simulation zum (Wieder-)Starten:</p>
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                 {variants.map((v) => (
                   <Card 
                     key={v.id} 
                     className="bg-white/[0.02] border-white/5 hover:bg-white/[0.05] transition-all cursor-pointer group rounded-2xl overflow-hidden shadow-xl" 
                     onClick={() => handleStartSpecific(v.id)}
                   >
                     <CardContent className="p-4 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                           <div className="h-10 w-10 rounded-xl bg-[#ffcc00]/10 flex items-center justify-center text-[#ffcc00] font-black italic text-sm shadow-lg transform group-hover:rotate-12 transition-transform">
                             {v.id.split('_')[1] || v.id.slice(-1)}
                           </div>
                           <h4 className="text-sm font-black text-white uppercase tracking-tight italic">Variante {v.id}</h4>
                        </div>
                        <ArrowRight className="h-4 w-4 text-white/20 group-hover:text-[#ffcc00] transition-colors" />
                     </CardContent>
                   </Card>
                 ))}
               </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (loading || !examData) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4 exam-container" dir="ltr">
        <div className="space-y-6 w-full max-w-2xl">
          <Skeleton className="h-20 w-full bg-white/5 rounded-2xl" />
          <Skeleton className="h-96 w-full bg-white/5 rounded-2xl" />
          <div className="flex gap-4">
            <Skeleton className="h-16 flex-1 bg-white/5 rounded-2xl" />
            <Skeleton className="h-16 flex-1 bg-white/5 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    if (currentModule === 'instructions') {
      return <InstructionScreen module={targetModule!} metadata={examData.metadata} />;
    }
    const mod = currentModule as any;
    switch (mod) {
      case 'lesen': return <LesenModule data={examData.lesen} />;
      case 'horen': return <HorenModule data={examData.horen} />;
      case 'schreiben': return <SchreibenModule data={examData.schreiben} />;
      case 'sprechen': return <SprechenModule data={examData.sprechen} />;
      case 'results': return <ResultsScreen data={examData} />;
      default: return null;
    }
  };

  const getTotalTeile = () => {
    if (currentModule === 'lesen') return 5;
    if (currentModule === 'horen') return 4;
    if (currentModule === 'schreiben') return 3;
    if (currentModule === 'sprechen') return 3;
    return 1;
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] exam-container relative" dir="ltr">
      <div className="relative z-10">
        {(currentModule as any) !== 'instructions' && (currentModule as any) !== 'results' && (currentModule as any) !== 'start' && (
          <ExamHeader totalTeile={getTotalTeile()} />
        )}
        <main className="pb-24">
          {renderContent()}
        </main>
      </div>
      <div className={cn(
        "fixed inset-0 pointer-events-none transition-all duration-1000 opacity-20 z-0 blur-[150px]",
        currentModule === 'lesen' && "bg-blue-600",
        currentModule === 'horen' && "bg-purple-600",
        currentModule === 'schreiben' && "bg-orange-600",
        currentModule === 'sprechen' && "bg-green-600",
      )} />

      {/* Exit Confirmation Modal */}
      <AlertDialog open={showExitConfirm} onOpenChange={setShowExitConfirm}>
        <AlertDialogContent className="bg-[#111] border border-white/5 rounded-[32px] max-w-sm mx-auto">
          <AlertDialogHeader>
            <div className="h-12 w-12 bg-red-500/10 rounded-2xl flex items-center justify-center mb-4">
              <AlertCircle className="h-6 w-6 text-red-500" />
            </div>
            <AlertDialogTitle className="text-xl font-black text-white uppercase tracking-tighter italic">Simulation Verlassen?</AlertDialogTitle>
            <AlertDialogDescription className="text-white/40 font-bold text-xs uppercase tracking-widest leading-relaxed pt-2">
              Wenn Sie jetzt gehen, wird Ihr aktueller Fortschritt nicht gespeichert. Sind Sie sicher?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6 flex flex-col gap-2">
            <AlertDialogCancel className="h-12 bg-white/5 border-white/5 text-white/60 hover:bg-white/10 hover:text-white rounded-xl font-black text-[10px] uppercase tracking-widest transition-all">
              ABBRECHEN
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmExit}
              className="h-12 bg-red-600 text-white hover:bg-red-700 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg"
            >
              SIMULATION BEENDEN
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ExamSimulator;
