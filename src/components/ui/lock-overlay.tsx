import React, { useState, useEffect } from 'react';
import { Lock, MessageCircle, HelpCircle } from 'lucide-react';
import { WHATSAPP_LINK } from '@/lib/access';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface LockOverlayProps {
  children: React.ReactNode;
  isLocked: boolean;
  blurIntensity?: string; // e.g. 'blur-sm' | 'blur' | 'blur-md'
  message?: string;
}

const encodeCheck = (str: string) => btoa(str).replace(/=/g, '');
const decodeCheck = (str: string) => atob(str + '='.repeat((4 - str.length % 4) % 4));

export const LockOverlay: React.FC<LockOverlayProps> = ({
  children,
  isLocked,
  blurIntensity = 'blur',
  message = 'المحتوى محجوب — تواصل عبر واتساب لفتح الوصول الكامل',
}) => {
  const [open, setOpen] = useState(false);
  const [dummyElements, setDummyElements] = useState<string[]>([]);

  useEffect(() => {
    if (isLocked) {
      // Add dummy elements to confuse devtools
      const dummies = Array.from({ length: 5 }, () => Math.random().toString(36));
      setDummyElements(dummies);
    }
  }, [isLocked]);

  const checkLock = () => {
    const encoded = encodeCheck('locked');
    const decoded = decodeCheck(encoded);
    return decoded === 'locked' && isLocked;
  };

  const isReallyLocked = checkLock();

  return (
    <div className="relative">
      <div className={isReallyLocked ? `pointer-events-none select-none ${blurIntensity} opacity-70 filter contrast-50 brightness-75` : ''}>
        {children}
      </div>
      {isReallyLocked && (
        <>
          {/* Dummy elements to confuse inspection */}
          {dummyElements.map((id, i) => (
            <div key={id} className="absolute opacity-0 pointer-events-none" style={{ top: `${i * 10}px`, left: `${i * 10}px` }}>
              {id}
            </div>
          ))}

          {/* Overlay with multiple layers */}
          <div className="absolute inset-0 bg-black/20 pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-br from-black/10 to-transparent pointer-events-none" />

          {/* Small floating controls that remain clickable */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-2 left-2 flex gap-2">
              <div className="pointer-events-auto h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow animate-pulse">
                <Lock className="h-4 w-4" />
              </div>
              <button
                type="button"
                onClick={() => setOpen(true)}
                className="pointer-events-auto h-8 w-8 rounded-full bg-accent text-accent-foreground flex items-center justify-center shadow hover:opacity-90 transition-all"
                aria-label="Show unlock info"
              >
                <HelpCircle className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Modal with CTA */}
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-md text-center">
              <DialogHeader>
                <DialogTitle className="flex items-center justify-center gap-2">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground animate-bounce">
                    <Lock className="h-4 w-4" />
                  </span>
                  المحتوى محجوب
                </DialogTitle>
              </DialogHeader>
              <div className="text-sm text-muted-foreground leading-relaxed">
                {message}
              </div>
              <a
                href={WHATSAPP_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-full justify-center items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-all shadow-lg"
              >
                <MessageCircle className="h-4 w-4" />
                تواصل عبر واتساب
              </a>
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
};

export default LockOverlay;


