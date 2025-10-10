import React, { useEffect, useMemo, useState } from 'react';
import { Lock } from "lucide-react";
import { ACCESS_FLAG_KEY, consumeCode, getAllowedCodes, isCodeConsumed } from '@/lib/access';

interface AccessGateProps {
  children: React.ReactNode;
}

const AccessGate: React.FC<AccessGateProps> = ({ children }) => {
  const [granted, setGranted] = useState<boolean>(false);
  const [code, setCode] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [checking, setChecking] = useState<boolean>(true);
  const allowedCodes = useMemo(() => getAllowedCodes(), []);

  useEffect(() => {
    const stored = localStorage.getItem(ACCESS_FLAG_KEY);
    setGranted(stored === 'true');
    setChecking(false);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const input = code.trim().toUpperCase();
    if (!allowedCodes.includes(input)) {
      setError('رمز الوصول غير صحيح. يرجى التحقق والمحاولة مرة أخرى.');
      return;
    }

    if (isCodeConsumed(input)) {
      setError('تم استخدام رمز الوصول بالفعل ولا يمكن استخدامه مرة أخرى.');
      return;
    }

    localStorage.setItem(ACCESS_FLAG_KEY, 'true');
    consumeCode(input);
    setGranted(true);
    setError('');
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <div className="animate-pulse text-sm text-muted-foreground">جارٍ التحميل...</div>
      </div>
    );
  }

  if (!granted) {
    return (
      <div dir="rtl" className="min-h-screen bg-background text-foreground flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="bg-card border border-border rounded-2xl p-8 shadow-lg shadow-black/20">
            <div className="text-center mb-6">
              <div className="mx-auto h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center glow-primary mb-3">
                <span className="text-primary-foreground font-bold">
                    <Lock className="h-6 w-6 text-white" />
                </span>
              </div>
              <h1 className="text-xl font-bold">الرجاء إدخال رمز الوصول</h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <input
                  type="text"
                //   inputMode="latin"
                  autoComplete="one-time-code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="أدخل رمز الوصول"
                  className="w-full px-4 py-3 rounded-lg bg-background border border-input focus:outline-none focus:ring-2 focus:ring-primary text-foreground placeholder:text-muted-foreground"
                />
              </div>
              {error && (
                <div className="text-sm text-destructive bg-destructive/10 border border-destructive/40 rounded-md px-3 py-2">
                  {error}
                </div>
              )}
              <button
                type="submit"
                className="w-full py-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-semibold"
              >
                دخول
              </button>
            </form>

            <div className="mt-6 text-center text-xs text-muted-foreground">
              <p>هذا الحاجز لحماية الوصول. إذا لم يكن لديك رمز، تواصل مع المسؤول.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default AccessGate;


