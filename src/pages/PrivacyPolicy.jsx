import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Shield, Database, Cookie, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PrivacyPolicy = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-4 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            العودة
          </Button>
          
          <div className="flex items-center gap-3 mb-4">
            <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">سياسة الخصوصية</h1>
              <p className="text-muted-foreground">Privacy Policy</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {/* Introduction */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Eye className="h-5 w-5" />
              مقدمة
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              نحن في DeutschPath نلتزم بحماية خصوصيتك. هذه السياسة توضح كيفية جمع واستخدام المعلومات في تطبيقنا.
            </p>
          </Card>

          {/* Data Collection */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Database className="h-5 w-5" />
              جمع البيانات
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">البيانات المحلية (LocalStorage)</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  التطبيق يحفظ البيانات التالية محلياً على جهازك فقط:
                </p>
                <ul className="list-disc list-inside text-sm text-muted-foreground mt-2 space-y-1">
                  <li>تقدمك في التعلم (الأيام المكتملة)</li>
                  <li>المفردات التي أضفتها</li>
                  <li>الموارد المفضلة</li>
                  <li>إعدادات التطبيق</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">عدم جمع البيانات الشخصية</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  نحن <strong>لا نجمع</strong> أي بيانات شخصية مثل الاسم، البريد الإلكتروني، أو معلومات الاتصال.
                </p>
              </div>
            </div>
          </Card>

          {/* AdSense */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Cookie className="h-5 w-5" />
              إعلانات Google AdSense
            </h2>
            <div className="space-y-4">
              <p className="text-muted-foreground text-sm leading-relaxed">
                يستخدم التطبيق Google AdSense لعرض الإعلانات. قد تستخدم Google ملفات تعريف الارتباط (cookies) لتخصيص الإعلانات.
              </p>
              
              <div className="bg-muted/50 p-4 rounded-lg">
                <h3 className="font-medium mb-2">معلومات AdSense:</h3>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  <li>معرف الناشر: ca-pub-4918528902504889</li>
                  <li>قد يتم جمع معلومات حول زياراتك للموقع</li>
                  <li>يتم استخدام هذه المعلومات لتخصيص الإعلانات</li>
                  <li>يمكنك إدارة تفضيلات الإعلانات من خلال إعدادات Google</li>
                </ul>
              </div>
            </div>
          </Card>

          {/* Data Security */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">أمان البيانات</h2>
            <div className="space-y-3">
              <p className="text-muted-foreground text-sm leading-relaxed">
                جميع البيانات محفوظة محلياً على جهازك ولا يتم إرسالها إلى خوادم خارجية.
              </p>
              <p className="text-muted-foreground text-sm leading-relaxed">
                يمكنك حذف جميع البيانات في أي وقت من خلال زر "إعادة التعيين" في التطبيق.
              </p>
            </div>
          </Card>

          {/* Third Party */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">الخدمات الخارجية</h2>
            <div className="space-y-3">
              <p className="text-muted-foreground text-sm leading-relaxed">
                التطبيق يحتوي على روابط لمواقع خارجية مثل Goethe Institut و Deutsche Welle. 
                هذه المواقع لها سياسات خصوصية منفصلة.
              </p>
            </div>
          </Card>

          {/* Contact */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">الاتصال بنا</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              إذا كان لديك أي أسئلة حول سياسة الخصوصية، يرجى التواصل معنا.
            </p>
          </Card>

          {/* Last Updated */}
          <div className="text-center text-sm text-muted-foreground pt-4 border-t">
            آخر تحديث: {new Date().toLocaleDateString('ar-SA')}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
