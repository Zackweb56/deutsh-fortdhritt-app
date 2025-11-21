import React, { useEffect, useMemo, useState } from 'react';
import { Lock, X, MessageCircle, Info } from "lucide-react";
import { ACCESS_FLAG_KEY, ACCESS_TIER_KEY, getAllowedCodes, getFreeAccessCode, setAccessTier, isLimitedAccess, WHATSAPP_LINK } from '@/lib/access';

const DEVICE_ID_KEY = 'device_id';

const getDeviceId = (): string => {
  try {
    let id = localStorage.getItem(DEVICE_ID_KEY);
    if (!id) {
      id = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2) + Date.now().toString(36);
      localStorage.setItem(DEVICE_ID_KEY, id);
    }
    return id;
  } catch {
    return 'fallback-device-id';
  }
};

interface AccessGateProps {
  children: React.ReactNode;
}

const AccessGate: React.FC<AccessGateProps> = ({ children }) => {
  const [granted, setGranted] = useState<boolean>(false);
  const [code, setCode] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [checking, setChecking] = useState<boolean>(true);
  const [showFreeInfo, setShowFreeInfo] = useState<boolean>(false);
  const [showFreeCode, setShowFreeCode] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const allowedCodes = useMemo(() => getAllowedCodes(), []);

  useEffect(() => {
    const stored = localStorage.getItem(ACCESS_FLAG_KEY);
    setGranted(stored === 'true');
    setChecking(false);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const input = code.trim().toUpperCase();
    const freeCode = getFreeAccessCode().toUpperCase();

    // Allow free tier code without server verification and without single-use
    if (input === freeCode) {
      localStorage.setItem(ACCESS_FLAG_KEY, 'true');
      setAccessTier('free');
      window.dispatchEvent(new Event('access-tier-changed'));
      setGranted(true);
      setError('');
      try {
        localStorage.setItem('free_info_shown', 'false');
      } catch {}
      return;
    }

    if (!allowedCodes.includes(input)) {
      setError('رمز الوصول غير صحيح. يرجى التحقق والمحاولة مرة أخرى.');
      return;
    }

    try {
      const deviceId = getDeviceId();
      const resp = await fetch('/api/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: input, deviceId }),
      });
      const data = await resp.json();
      // Fallback: allow locally if server is not configured
      const isLocal = typeof window !== 'undefined' && /^(localhost|127\.0\.0\.1|0\.0\.0\.0)$/i.test(window.location.hostname);
      if (!data?.ok) {
        if (data?.error === 'server_not_configured' || (resp.status === 500 && isLocal)) {
          localStorage.setItem(ACCESS_FLAG_KEY, 'true');
          setAccessTier('full');
          window.dispatchEvent(new Event('access-tier-changed'));
          setGranted(true);
          setError('');
          return;
        }
        if (data?.status === 'used') {
          setError('تم استخدام رمز الوصول بالفعل ولا يمكن استخدامه مرة أخرى.');
        } else {
          setError('رمز الوصول غير صالح.');
        }
        return;
      }
    } catch (e) {
      // Network error: if running locally, allow as full to avoid blocking dev/testing
      const isLocal = typeof window !== 'undefined' && /^(localhost|127\.0\.0\.1|0\.0\.0\.0)$/i.test(window.location.hostname);
      if (isLocal) {
        localStorage.setItem(ACCESS_FLAG_KEY, 'true');
        setAccessTier('full');
        window.dispatchEvent(new Event('access-tier-changed'));
        setGranted(true);
        setError('');
      } else {
        setError('تعذر التحقق من الرمز. حاول لاحقًا.');
      }
      return;
    }

    localStorage.setItem(ACCESS_FLAG_KEY, 'true');
    setAccessTier('full');
    window.dispatchEvent(new Event('access-tier-changed'));
    setGranted(true);
    setError('');
  };

  // Ensure hooks are not conditionally rendered: decide free modal visibility here
  useEffect(() => {
    if (checking) return;
    if (isLimitedAccess()) {
      try {
        const shown = localStorage.getItem('free_info_shown');
        if (shown !== 'true') {
          setShowFreeInfo(true);
        }
      } catch {
        setShowFreeInfo(true);
      }
    } else {
      setShowFreeInfo(false);
    }
  }, [checking, granted]);

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
            <div className="mt-6 w-full max-w-md mx-auto rounded-xl border border-muted/40 bg-card p-4 shadow-sm sm:p-5 transition-all">
              {/* WhatsApp + Info */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <a
                  href={WHATSAPP_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-lg bg-neutral-800 px-3 py-2 text-sm font-medium text-green-700 hover:bg-neutral-900 transition-colors"
                >
                  <MessageCircle className="h-4 w-4 text-green-600" />
                  <span>واتساب</span>
                  <span className="text-xs text-green-600/70">0773443694</span>
                </a>

                <button
                  type="button"
                  onClick={() => {
                    setShowFreeCode((s) => !s);
                    setCopied(false);
                  }}
                  className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-muted/20 transition-colors"
                  aria-label="معلومة حول رمز الوصول المجاني"
                >
                  <Info className="h-4 w-4" />
                  <span className="hidden sm:inline">معلومة</span>
                </button>
              </div>

              {/* Free Code Section */}
              {showFreeCode && (
                <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-lg bg-muted/10 px-3 py-2">
                  <div className="text-sm text-muted-foreground">
                    رمز الوصول المجاني:{" "}
                    <span className="font-semibold text-primary">FREE-ACCESS</span>
                  </div>
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText("FREE-ACCESS");
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                      } catch {
                        // ignore
                      }
                    }}
                    className="text-xs font-medium text-primary hover:underline"
                  >
                    {copied ? "✅ تم النسخ" : "نسخ"}
                  </button>
                </div>
              )}

              {/* Note */}
              <p className="mt-4 text-center text-xs text-muted-foreground leading-relaxed">
                هذا الحاجز لحماية الوصول. إذا لم يكن لديك رمز، تواصل مع المسؤول.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const closeFreeInfo = () => {
    setShowFreeInfo(false);
    try { localStorage.setItem('free_info_shown', 'true'); } catch {}
  };

  const handleUpgradeLogout = () => {
    try {
      localStorage.removeItem(ACCESS_FLAG_KEY);
      localStorage.removeItem(ACCESS_TIER_KEY);
      // Optionally clear free info flag to show again if they re-login as free later
      // localStorage.removeItem('free_info_shown');
    } catch {}
    window.dispatchEvent(new Event('access-tier-changed'));
    window.location.reload();
  };

  return <>
    {children}

    {/* Free mode info modal */}
    {isLimitedAccess() && showFreeInfo && (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/60" onClick={closeFreeInfo} />
        <div className="relative z-10 w-full max-w-lg mx-4">
          <div className="bg-card text-foreground border border-border rounded-2xl shadow-xl overflow-hidden">
            <div className="p-5 flex items-start justify-between gap-3 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                  <Lock className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">وضع الوصول المجاني</h3>
                  <p className="text-xs text-muted-foreground">أنت الآن تستخدم النسخة التجريبية المجانية</p>
                </div>
              </div>
              <button onClick={closeFreeInfo} className="p-1 rounded-md hover:bg-muted/50 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-5 space-y-3 text-sm">
              <div className="rounded-lg p-3 border bg-green-500/10 border-green-500/30">
                <p className="font-medium mb-1 text-green-300">ماذا ستحصل عليه مجانًا؟</p>
                <ul className="list-disc pr-5 space-y-1 text-green-200/90">
                  <li>الوصول لأول درسين في كل مستوى</li>
                  <li>عرض المحتوى التعليمي الأساسي ومعاينة الأقسام</li>
                  <li>تجربة الواجهة والميزات الرئيسية</li>
                </ul>
              </div>
              <div className="rounded-lg p-3 border bg-destructive/10 border-destructive/30">
                <p className="font-medium mb-1 text-destructive">ما الذي يتطلب الترقية؟</p>
                <ul className="list-disc pr-5 space-y-1 text-destructive/90">
                  <li>فتح جميع الدروس والمستويات كاملة</li>
                  <li>فتح جميع القواعد و الأفعال كاملة</li>
                  <li>إمكانية تحميل المفردات مع الترجمة بالعربية في صيغة ملف PDF</li>
                  <li>عدم ظهور الإعلانات المزعجة</li>
                  <li>الوصول غير محدود للحوارات والتمارين المتقدمة</li>
                  <li>تحديثات دورية ومحتوى حصري</li>
                </ul>
              </div>
            </div>

            <div className="p-5 flex flex-col sm:flex-row gap-2 sm:gap-3 border-t border-border">
              <a
                href={WHATSAPP_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-green-600 text-white hover:bg-green-600/90 transition-colors flex-1"
              >
                <MessageCircle className="h-4 w-4" />
                تواصل عبر واتساب: 0773443694
              </a>
              <button
                onClick={closeFreeInfo}
                className="inline-flex items-center justify-center px-4 py-2 rounded-md border border-border hover:bg-muted/50 transition-colors flex-1"
              >
                متابعة لاحقًا
              </button>
            </div>
          </div>
        </div>
      </div>
    )}

    {/* Upgrade (logout) floating button for free tier */}
    {isLimitedAccess() && (
      <button
        onClick={handleUpgradeLogout}
        className="fixed left-4 bottom-4 z-40 px-4 py-2 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-colors animate-pulse"
        title="تسجيل الخروج من الوصول المجاني للترقية"
      >
        الترقية
      </button>
    )}
  </>;
};

export default AccessGate;


