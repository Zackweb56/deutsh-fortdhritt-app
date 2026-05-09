import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Flag, Check, Send } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ExamTeil {
  id: string;
  label: string;
  points?: number | string;
  examType?: string;
  isCompleted?: boolean;
}

interface GoetheExamLayoutProps {
  title: string;
  module: string;
  teil: string;
  timeLeft: number;
  totalTimeLabel?: string;
  progress: string;
  answeredCount?: number;
  totalCount?: number;
  onZuruck?: () => void;
  onWeiter?: () => void;
  onAbgeben?: () => void;
  onMarkieren?: () => void;
  onJumpToTeil?: (teilId: string) => void;
  isMarked?: boolean;
  children: React.ReactNode;
  disableMainScroll?: boolean;
  allTeile?: ExamTeil[];
  currentTeilId?: string;
}

const formatHMS = (seconds: number): string => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

interface TooltipProps {
  de: string;
  ar: string;
  children: React.ReactNode;
  className?: string;
}

const Tooltip: React.FC<TooltipProps> = ({ de, ar, children, className }) => {
  const [show, setShow] = useState(false);
  return (
    <div
      className={cn('relative inline-block', className)}
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      {show && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-[300] pointer-events-none">
          <div className="bg-[#0f172a] border border-gray-600 text-white px-3 py-2 text-center whitespace-nowrap">
            <div className="text-[9px] font-bold uppercase tracking-wide">{de}</div>
            <div className="text-[9px] text-gray-300 mt-0.5" dir="rtl">{ar}</div>
          </div>
          <div className="flex justify-center">
            <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-[#0f172a]" />
          </div>
        </div>
      )}
    </div>
  );
};

const GoetheExamLayout: React.FC<GoetheExamLayoutProps> = ({
  title,
  module,
  teil,
  timeLeft,
  totalTimeLabel,
  progress,
  answeredCount,
  totalCount,
  onZuruck,
  onWeiter,
  onAbgeben,
  onMarkieren,
  onJumpToTeil,
  isMarked,
  children,
  disableMainScroll = false,
  allTeile = [],
  currentTeilId,
}) => {
  return (
    <div className="min-h-screen bg-[#f1f5f9] text-[#333] flex flex-col font-sans exam-container" dir="ltr">
      {/* Top Bar */}
      <header className="bg-[#1e293b] text-white border-b border-gray-900 shrink-0">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between px-3 md:px-4 py-2 gap-2">

          {/* Left: Logo + Tabs */}
          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto no-scrollbar">
            <div className="bg-red-600 px-2 py-1 font-black text-[10px] uppercase tracking-tighter border border-white/20 shrink-0">
              GOETHE
            </div>
            <div className="flex items-center gap-px overflow-x-auto no-scrollbar">
              {allTeile.map((t) => (
                <div
                  key={t.id}
                  className={cn(
                    'px-2 py-1.5 text-left min-w-[80px] md:min-w-[110px] border-b-2 transition-none shrink-0 relative flex flex-col items-start justify-center cursor-default',
                    currentTeilId === t.id
                      ? 'bg-white text-gray-900 border-b-blue-500'
                      : 'bg-[#334155] text-white/50 border-b-transparent'
                  )}
                >
                  <div className="text-[9px] font-bold uppercase leading-none">{t.label}</div>
                  {t.examType && (
                    <div className={cn(
                      'text-[7px] leading-none mt-0.5 truncate max-w-[100px]',
                      currentTeilId === t.id ? 'text-blue-500' : 'text-white/50'
                    )}>
                      {t.examType}
                    </div>
                  )}
                  <div className={cn(
                    'text-[7px] font-bold mt-0.5',
                    currentTeilId === t.id ? 'text-gray-400' : 'text-white/40'
                  )}>
                    {t.points != null ? `${t.points} Pkt` : '—'}
                  </div>
                  {t.isCompleted && (
                    <Check className="h-2.5 w-2.5 text-green-400 absolute bottom-1 right-1" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Right: Timer + Action Buttons */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end shrink-0">
            <div className="flex flex-col items-end">
              {totalTimeLabel && (
                <span className="text-[8px] text-gray-400 uppercase tracking-wide leading-none">
                  {totalTimeLabel}
                </span>
              )}
              <span className="text-[8px] font-bold text-gray-400 uppercase tracking-wide leading-none mt-0.5">
                Restzeit
              </span>
              <span className={cn(
                'text-sm font-black tabular-nums leading-tight tracking-wider',
                timeLeft <= 60 ? 'text-red-400' : 'text-white'
              )}>
                {formatHMS(timeLeft)}
              </span>
            </div>
          </div>
        </div>

        {/* Sub Header */}
        <div className="bg-[#0f172a] border-y border-gray-900 px-3 md:px-6 py-1.5">
          <h1 className="text-[10px] md:text-xs font-bold text-white uppercase tracking-tight">
            {module} — {teil}
          </h1>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 flex justify-center">
        <div className={cn('w-full flex flex-col items-center', !disableMainScroll && 'max-w-7xl')}>
          <div className={cn('w-full', !disableMainScroll && 'p-3 md:p-8 space-y-8')}>
            {children}
          </div>
        </div>
      </main>

      {/* Footer Nav */}
      <footer className="bg-[#1e293b] flex items-center justify-center px-3 md:px-6 border-t border-gray-900 py-2 md:py-3">
        <div className="w-full max-w-7xl flex justify-between items-center gap-2">

          {/* Left: Zurück / Weiter */}
          <div className="flex gap-1">
            <Tooltip de="Zur vorherigen Seite" ar="الصفحة السابقة">
              <Button
                onClick={onZuruck}
                className="bg-[#334155] border border-slate-500 text-white hover:bg-slate-600 rounded-none px-3 md:px-5 h-8 md:h-9 font-bold uppercase text-[9px] tracking-wide transition-none"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                <span className="hidden md:inline ml-1">Zurück</span>
              </Button>
            </Tooltip>
            <Tooltip de="Zur nächsten Seite" ar="الصفحة التالية">
              <Button
                onClick={onWeiter}
                className="bg-[#334155] border border-slate-500 text-white hover:bg-slate-600 rounded-none px-3 md:px-5 h-8 md:h-9 font-bold uppercase text-[9px] tracking-wide transition-none"
              >
                <span className="hidden md:inline mr-1">Weiter</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </Tooltip>
          </div>

          {/* Center: Answered Counter */}
          {totalCount != null && totalCount > 0 && (
            <div className="flex items-center gap-1.5 bg-[#0f172a] border border-gray-700 px-3 py-1">
              <div className="flex gap-px">
                {Array.from({ length: totalCount }).map((_, i) => (
                  <div
                    key={i}
                    className={cn(
                      'h-1.5 w-1.5',
                      i < (answeredCount ?? 0) ? 'bg-blue-400' : 'bg-gray-600'
                    )}
                  />
                ))}
              </div>
              <span className="text-[8px] font-bold text-gray-300 uppercase tracking-wide whitespace-nowrap">
                {answeredCount ?? 0}/{totalCount}
              </span>
            </div>
          )}

          {/* Right: Markieren + Aufgabe abgeben */}
          <div className="flex gap-1">
            <Tooltip de="Diese Frage zur Überprüfung markieren" ar="وضع علامة لمراجعة لاحقاً">
              <Button
                onClick={onMarkieren}
                className={cn(
                  'border rounded-none px-3 md:px-5 h-8 md:h-9 font-bold uppercase text-[9px] tracking-wide transition-none',
                  isMarked
                    ? 'bg-yellow-600 border-yellow-400 text-white hover:bg-yellow-700'
                    : 'bg-[#334155] border-slate-500 text-white hover:bg-slate-600'
                )}
              >
                <Flag className={cn('h-3.5 w-3.5', isMarked && 'fill-current')} />
                <span className="hidden md:inline ml-1">Markieren</span>
              </Button>
            </Tooltip>
            <Tooltip de="Aufgabe abgeben und auswerten" ar="تسليم المهمة وعرض النتيجة">
              <Button
                onClick={onAbgeben}
                className="bg-blue-700 border border-blue-500 hover:bg-blue-800 text-white rounded-none px-4 md:px-6 h-8 md:h-9 font-bold uppercase text-[9px] tracking-wide transition-none"
              >
                <Send className="h-3.5 w-3.5 md:mr-1" />
                <span className="hidden md:inline">Aufgabe abgeben</span>
              </Button>
            </Tooltip>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default GoetheExamLayout;
