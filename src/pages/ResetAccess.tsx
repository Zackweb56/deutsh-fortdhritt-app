import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ShieldX, Home } from 'lucide-react';
import { ACCESS_FLAG_KEY } from '@/lib/access';

const ResetAccess = () => {
  const navigate = useNavigate();
  const [done, setDone] = useState(false);

  const handleReset = () => {
    localStorage.removeItem(ACCESS_FLAG_KEY);
    setDone(true);
  };

  useEffect(() => {
    // Ensure RTL direction for safety (global CSS already enforces it)
    document.documentElement.dir = 'rtl';
  }, []);

  return (
    <div dir="rtl" className="min-h-screen bg-background text-foreground flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="bg-card border border-border rounded-2xl p-8 shadow-lg shadow-black/20">
          <div className="text-center mb-6">
            <div className="mx-auto h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center glow-primary mb-3">
              <ShieldX className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-xl font-bold">إعادة ضبط الوصول</h1>
            <p className="text-sm text-muted-foreground mt-1">سيتم مسح حالة السماح بالدخول لهذا الجهاز فقط.</p>
          </div>

          {!done ? (
            <div className="space-y-4">
              <Button onClick={handleReset} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                إعادة ضبط الوصول
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                ملاحظة: لن يتم إعادة تفعيل الأكواد المستخدمة. تحتاج إلى رمز جديد للدخول.
              </p>
            </div>
          ) : (
            <div className="space-y-4 text-center">
              <div className="text-sm text-green-500">تمت إعادة ضبط الوصول بنجاح.</div>
              <Button onClick={() => navigate('/')} className="inline-flex items-center gap-2 bg-secondary text-secondary-foreground hover:bg-secondary/90">
                <Home className="h-4 w-4" />
                العودة إلى الصفحة الرئيسية
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetAccess;


