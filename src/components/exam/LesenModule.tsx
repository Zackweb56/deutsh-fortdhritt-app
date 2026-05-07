import React from 'react';
import { useExamStore } from '@/hooks/useExamStore';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ModuleData, Teil, Item } from '@/types/exam';
import { calculateRawPoints } from '@/utils/scoring';

export const LesenModule: React.FC<{ data: ModuleData }> = ({ data }) => {
  const { currentTeil, nextTeil, updateAnswer, answers, finishModule } = useExamStore();

  const teilKey = `teil${currentTeil}`;
  const teilData = data[teilKey] as Teil;
  const currentAnswers = answers[`lesen_${currentTeil}`] || {};

  const handleAnswerChange = (id: string | number, value: string) => {
    updateAnswer('lesen', currentTeil.toString(), {
      ...currentAnswers,
      [id]: value
    });
  };

  const isLastTeil = currentTeil === 5;

  const isTeilFinished = () => {
    if (!teilData) return false;

    if (teilData.type === 'richtig_falsch' || teilData.type === 'ja_nein' || teilData.type === 'mehrfachauswahl') {
      if (teilData.items) {
        return teilData.items.every(item => item.isExample || currentAnswers[item.id]);
      }
      if (teilData.texts) {
        return teilData.texts.every(text =>
          text.items.every(item => item.isExample || currentAnswers[item.id])
        );
      }
    }

    if (teilData.type === 'zuordnung') {
      return teilData.situations?.every(sit => sit.isExample || currentAnswers[sit.id]);
    }

    return false;
  };

  const handleNext = () => {
    if (!isTeilFinished()) return;

    if (isLastTeil) {
      const rawPoints = calculateRawPoints('lesen', data, answers);
      finishModule('lesen', rawPoints);
    } else {
      nextTeil();
    }
    window.scrollTo(0, 0);
  };

  const renderRichtigFalsch = (items: Item[]) => (
    <div className="space-y-4">
      {items.map((item) => (
        <Card key={item.id} className={cn("bg-[#111] border-white/5 rounded-2xl overflow-hidden shadow-xl", item.isExample && "opacity-60 grayscale-[0.5]")}>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-start gap-4">
              <div className={cn(
                "h-8 w-8 rounded-xl flex items-center justify-center shrink-0 font-black shadow-lg",
                item.isExample ? "bg-white/10 text-white/40" : "bg-red-600 text-white"
              )}>
                {item.id}
              </div>
              <p className="text-white font-bold leading-snug">{item.text}</p>
            </div>
            <RadioGroup
              value={currentAnswers[item.id] || (item.isExample ? item.correct : '')}
              onValueChange={(val) => !item.isExample && handleAnswerChange(item.id, val)}
              className="flex gap-4"
              disabled={item.isExample}
            >
              {['Richtig', 'Falsch'].map((val) => (
                <div key={val} className="flex-1">
                  <RadioGroupItem value={val} id={`item${item.id}-${val}`} className="sr-only" />
                  <Label
                    htmlFor={`item${item.id}-${val}`}
                    className={cn(
                      "h-12 w-full flex items-center justify-center rounded-xl border-2 cursor-pointer transition-all font-black text-xs uppercase",
                      (currentAnswers[item.id] === val || (item.isExample && item.correct === val))
                        ? "bg-[#ffcc00] border-[#ffcc00] text-black shadow-[0_0_15px_rgba(255,204,0,0.3)]"
                        : "border-white/5 bg-white/5 text-white/40 hover:border-white/20"
                    )}
                  >
                    {val}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderMehrfachauswahl = (items: Item[]) => (
    <div className="space-y-6">
      {items.map((item) => (
        <Card key={item.id} className="bg-[#111] border border-white/5 rounded-2xl overflow-hidden shadow-xl">
          <CardHeader className="pb-4 bg-white/5">
            <CardTitle className="text-lg sm:text-xl flex gap-4 font-black leading-tight">
              <span className="text-[#ffcc00] font-black">{item.id}.</span>
              <span className="text-white">{item.text}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <RadioGroup
              value={currentAnswers[item.id] || ''}
              onValueChange={(val) => handleAnswerChange(item.id, val)}
              className="grid grid-cols-1 gap-3"
            >
              {item.options?.map((opt) => (
                <Label
                  key={opt.value}
                  className={cn(
                    "flex items-center p-5 rounded-2xl border-2 cursor-pointer transition-all hover:bg-white/5",
                    currentAnswers[item.id] === opt.value
                      ? "bg-[#ffcc00]/10 border-[#ffcc00] shadow-[0_0_20px_rgba(255,204,0,0.1)]"
                      : "border-white/5 bg-black/20 text-white/60"
                  )}
                >
                  <RadioGroupItem value={opt.value} className="mr-4 border-[#ffcc00] text-[#ffcc00]" />
                  <span className="font-black uppercase tracking-tight text-sm">{opt.label}</span>
                </Label>
              ))}
            </RadioGroup>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderZuordnung = () => (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <h3 className="font-black text-xl text-white uppercase tracking-tighter flex items-center gap-3">
            <span className="h-2 w-2 rounded-full bg-red-600" />
            Anzeigen:
          </h3>
          <div className="grid gap-4">
            {teilData.ads?.map((ad) => (
              <Card key={ad.id} className="bg-white/5 border-white/10 rounded-2xl overflow-hidden group hover:border-[#ffcc00]/50 transition-all shadow-xl">
                <CardContent className="p-6">
                  <span className="inline-block bg-[#ffcc00] text-black text-[10px] font-black px-3 py-1 rounded-full mb-4 uppercase tracking-widest shadow-lg">Anzeige {ad.id.toUpperCase()}</span>
                  <h4 className="text-white font-black mb-2 uppercase tracking-tighter">{ad.title}</h4>
                  <p className="text-white/60 leading-relaxed font-medium text-sm">{ad.content}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
        <div className="space-y-6">
          <h3 className="font-black text-xl text-white uppercase tracking-tighter flex items-center gap-3">
            <span className="h-2 w-2 rounded-full bg-[#ffcc00]" />
            Situationen:
          </h3>
          <div className="grid gap-4">
            {/* Example Situation */}
            {teilData.example && (
              <Card className="bg-[#111] border-white/5 rounded-2xl overflow-hidden shadow-2xl opacity-60">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="h-8 w-8 rounded-xl bg-white/10 text-white/40 flex items-center justify-center shrink-0 font-black shadow-lg">0</div>
                    <p className="text-white/60 font-bold leading-snug">{teilData.example.text}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase text-white/40">Lösung:</span>
                    <span className="h-10 w-12 flex items-center justify-center rounded-xl border-2 border-[#ffcc00] bg-[#ffcc00] text-black font-black">{teilData.example.correct?.toUpperCase()}</span>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Real Situations */}
            {teilData.situations?.map((sit) => (
              <Card key={sit.id} className="bg-[#111] border-white/5 rounded-2xl overflow-hidden shadow-2xl">
                <CardContent className="p-6 space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="h-8 w-8 rounded-xl bg-red-600 text-white flex items-center justify-center shrink-0 font-black shadow-lg">{sit.id}</div>
                    <p className="text-white font-bold leading-snug">{sit.text}</p>
                  </div>
                  <div className="space-y-3">
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Passende Anzeige wählen:</span>
                    <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-4 xl:grid-cols-6 gap-2">
                      {['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', '0'].map((val) => (
                        <div key={val}>
                          <input
                            type="radio"
                            id={`sit${sit.id}-${val}`}
                            name={`sit${sit.id}`}
                            value={val}
                            checked={currentAnswers[sit.id] === val}
                            onChange={() => handleAnswerChange(sit.id, val)}
                            className="sr-only"
                          />
                          <Label
                            htmlFor={`sit${sit.id}-${val}`}
                            className={cn(
                              "h-10 w-full flex items-center justify-center rounded-xl border-2 cursor-pointer transition-all font-black text-xs uppercase",
                              currentAnswers[sit.id] === val
                                ? "bg-[#ffcc00] border-[#ffcc00] text-black shadow-[0_0_15px_rgba(255,204,0,0.3)]"
                                : "border-white/5 bg-white/5 text-white/40 hover:border-white/20"
                            )}
                          >
                            {val === '0' ? '–' : val.toUpperCase()}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderJaNein = (items: Item[]) => (
    <div className="space-y-6">
      <div className="bg-primary/5 p-6 rounded-2xl border border-primary/20 italic text-center text-sm mb-8">
        <span className="block text-[10px] font-black uppercase tracking-[0.2em] text-[#ffcc00] mb-2">Diskussionsthema</span>
        <h4 className="text-xl font-black text-white uppercase tracking-tighter not-italic">{teilData.topic}</h4>
      </div>

      {/* Example */}
      {teilData.example && (
        <Card className="bg-[#111] border-white/5 rounded-2xl overflow-hidden shadow-2xl opacity-60 grayscale-[0.5]">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-[#ffcc00] font-black uppercase text-[10px] tracking-widest">Beispiel</span>
              <span className="h-[1px] flex-1 bg-white/5" />
            </div>
            <div className="flex items-start gap-4">
              <div className="space-y-1">
                <p className="text-white font-black uppercase tracking-tight">{teilData.example.author}</p>
                <p className="text-white/40 text-[10px] font-bold">Autor</p>
              </div>
              <div className="flex-1">
                <p className="text-white/60 font-medium leading-relaxed italic">&quot;{teilData.example.text}&quot;</p>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              {['Ja', 'Nein'].map((val) => (
                <div key={val} className={cn(
                  "px-6 py-2 rounded-xl border-2 font-black text-xs uppercase",
                  teilData.example?.correct === val ? "bg-[#ffcc00] border-[#ffcc00] text-black" : "border-white/5 text-white/20"
                )}>
                  {val}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Items */}
      {items.map((item) => (
        <Card key={item.id} className="bg-[#111] border border-white/5 rounded-2xl overflow-hidden shadow-xl">
          <CardContent className="p-6 space-y-6">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="md:w-48 shrink-0 space-y-1">
                <p className="text-white font-black text-lg uppercase tracking-tighter">{item.author}</p>
                <div className="flex items-center gap-2 text-white/40 text-[10px] font-bold uppercase tracking-widest">
                  <span>{item.age} Jahre</span>
                  <span>•</span>
                  <span>{item.city}</span>
                </div>
                <div className="h-1 w-12 bg-red-600 mt-2" />
              </div>
              <div className="flex-1">
                <p className="text-white/80 font-medium leading-relaxed text-lg">&quot;{item.text}&quot;</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-white/5">
              <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Ist diese Person für ein Verbot?</p>
              <RadioGroup
                value={currentAnswers[item.id] || ''}
                onValueChange={(val) => handleAnswerChange(item.id, val)}
                className="flex gap-3 w-full sm:w-auto"
              >
                {['Ja', 'Nein'].map((val) => (
                  <div key={val} className="flex-1 sm:flex-initial">
                    <RadioGroupItem value={val} id={`item${item.id}-${val}`} className="sr-only" />
                    <Label
                      htmlFor={`item${item.id}-${val}`}
                      className={cn(
                        "h-12 sm:h-10 px-8 flex items-center justify-center rounded-xl border-2 cursor-pointer transition-all font-black text-xs uppercase",
                        currentAnswers[item.id] === val
                          ? "bg-[#ffcc00] border-[#ffcc00] text-black shadow-[0_0_15px_rgba(255,204,0,0.3)]"
                          : "border-white/5 bg-white/5 text-white/40 hover:border-white/20"
                      )}
                    >
                      {val}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderTeilContent = () => {
    switch (teilData.type) {
      case 'richtig_falsch':
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {teilData.text && typeof teilData.text !== 'string' && (
              <Card className="bg-[#111] border-2 border-white/5 shadow-2xl rounded-3xl overflow-hidden relative">
                <div className="absolute top-0 left-0 w-1 bg-red-600 h-full" />
                <CardContent className="p-8 sm:p-12">
                  <div className="mb-8">
                    <span className="text-[10px] font-black text-red-600 uppercase tracking-[0.3em] mb-2 block">{teilData.text.source}</span>
                    <h2 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tighter leading-none">{teilData.text.title}</h2>
                  </div>
                  <div className="prose prose-invert max-w-none">
                    {teilData.text.content.split('\n').map((para, idx) => (
                      <p key={idx} className="text-lg sm:text-xl leading-relaxed mb-6 font-medium text-white/90">{para}</p>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
            {teilData.items && renderRichtigFalsch(teilData.items)}
          </div>
        );
      case 'mehrfachauswahl':
        return (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {teilData.texts ? (
              // Teil 2 style
              teilData.texts.map((text) => (
                <div key={text.id} className="space-y-8">
                  <Card className="bg-[#111] border-2 border-white/5 shadow-2xl rounded-3xl overflow-hidden relative">
                    <div className="absolute top-0 left-0 w-1 bg-red-600 h-full" />
                    <CardContent className="p-8 sm:p-12">
                      <div className="mb-8">
                        <span className="text-[10px] font-black text-red-600 uppercase tracking-[0.3em] mb-2 block">{text.source}</span>
                        <h2 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tighter leading-tight">{text.title}</h2>
                      </div>
                      <div className="prose prose-invert max-w-none">
                        {text.content.split('\n').map((para, idx) => (
                          <p key={idx} className="text-lg leading-relaxed mb-6 font-medium text-white/90">{para}</p>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                  {renderMehrfachauswahl(text.items)}
                </div>
              ))
            ) : (
              // Teil 5 style
              <>
                {teilData.text && typeof teilData.text !== 'string' && (
                  <Card className="bg-[#111] border-2 border-white/5 shadow-2xl rounded-3xl overflow-hidden relative">
                    <div className="absolute top-0 left-0 w-1 bg-red-600 h-full" />
                    <CardContent className="p-8 sm:p-12">
                      <div className="mb-8">
                        <span className="text-[10px] font-black text-red-600 uppercase tracking-[0.3em] mb-2 block">Regelwerk</span>
                        <h2 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tighter leading-none">{teilData.text.title}</h2>
                      </div>
                      <div className="prose prose-invert max-w-none">
                        {teilData.text.content.split('\n').map((para, idx) => (
                          <p key={idx} className="text-lg leading-relaxed mb-6 font-medium text-white/90">{para}</p>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
                {teilData.items && renderMehrfachauswahl(teilData.items)}
              </>
            )}
          </div>
        );
      case 'zuordnung':
        return renderZuordnung();
      case 'ja_nein':
        return teilData.items && renderJaNein(teilData.items);
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 sm:py-12 max-w-5xl">
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3 mb-2">
            <span className="bg-[#ffcc00] text-black text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg">Teil {currentTeil}</span>
            <span className="h-[1px] w-12 bg-white/10" />
            <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">{teilData.textType || 'Leseverständnis'}</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tighter leading-none">Modul Lesen</h1>
          <p className="text-white/40 font-bold text-sm sm:text-base leading-relaxed max-w-2xl mt-4">{teilData.instructions}</p>
        </div>
        {(teilData.thema || teilData.context) && (
          <div className="flex items-center gap-3 bg-white/5 px-6 py-3 rounded-2xl border border-white/10 shadow-inner w-fit shrink-0">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#ffcc00]">Thema/Kontext:</span>
            <span className="text-sm font-black text-white">{teilData.thema || teilData.context}</span>
          </div>
        )}
      </div>

      {renderTeilContent()}

      <div className="mt-12 flex flex-col items-center sm:items-end gap-4 pb-24">
        {!isTeilFinished() && (
          <p className="text-[10px] font-black text-[#ffcc00] uppercase tracking-widest animate-pulse">
            Bitte beantworten Sie alle Fragen, um fortzufahren
          </p>
        )}
        <Button
          size="lg"
          onClick={handleNext}
          disabled={!isTeilFinished()}
          className={cn(
            "h-14 sm:h-12 w-full sm:w-auto px-10 text-lg sm:text-base font-black rounded-xl shadow-xl transition-all",
            isTeilFinished()
              ? "bg-[#ffcc00] text-black hover:bg-[#ffcc00]/90 hover:scale-[1.02] active:scale-[0.98]"
              : "bg-white/5 text-white/20 cursor-not-allowed border border-white/5"
          )}
        >
          {isLastTeil ? (
            <>MODUL ABSCHLIESSEN <CheckCircle2 className="ml-2 h-5 w-5" /></>
          ) : (
            <>NÄCHSTER TEIL <ArrowRight className="ml-2 h-5 w-5" /></>
          )}
        </Button>
      </div>
    </div>
  );
};
