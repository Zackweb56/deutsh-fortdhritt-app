import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, GraduationCap, Code, Target, BookOpen, Clock, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const About = () => {
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
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">حول DeutschPath</h1>
              <p className="text-muted-foreground">About DeutschPath</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {/* App Description */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              ما هو DeutschPath؟
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              DeutschPath هو تطبيق ويب مصمم لمساعدة متعلمي اللغة الألمانية على تنظيم رحلتهم التعليمية بطريقة فعالة ومنظمة. 
              يوفر التطبيق خطة تعليمية منظمة لمدة 150 يوماً تغطي المستويات من A1 إلى B2.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              تم تطوير التطبيق باستخدام أحدث التقنيات لضمان تجربة مستخدم سلسة وسريعة.
            </p>
          </Card>

          {/* Features */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Target className="h-5 w-5" />
              المميزات الرئيسية
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Clock className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">خطة تعليمية منظمة</h3>
                    <p className="text-sm text-muted-foreground">150 يوماً منظمة عبر المستويات A1-B2</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <BookOpen className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">بناء المفردات</h3>
                    <p className="text-sm text-muted-foreground">أضف واحفظ المفردات مع النطق</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Users className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">موارد تعليمية</h3>
                    <p className="text-sm text-muted-foreground">مجموعة مختارة من أفضل المصادر</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Target className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">تتبع التقدم</h3>
                    <p className="text-sm text-muted-foreground">مراقبة تقدمك بصرياً</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Technology Stack */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Code className="h-5 w-5" />
              التقنيات المستخدمة
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <div className="font-medium text-sm">React</div>
                <div className="text-xs text-muted-foreground">Frontend</div>
              </div>
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <div className="font-medium text-sm">Vite</div>
                <div className="text-xs text-muted-foreground">Build Tool</div>
              </div>
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <div className="font-medium text-sm">TailwindCSS</div>
                <div className="text-xs text-muted-foreground">Styling</div>
              </div>
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <div className="font-medium text-sm">TypeScript</div>
                <div className="text-xs text-muted-foreground">Language</div>
              </div>
            </div>
          </Card>

          {/* Developer Info */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Code className="h-5 w-5" />
              المطور
            </h2>
            <div className="flex items-start gap-4">
              <div className="flex-1">
                <h3 className="font-semibold text-lg">zackweb</h3>
                <p className="text-muted-foreground mb-3">
                  مطور تطبيقات ويب متخصص في React و JavaScript. 
                  قام بتطوير DeutschPath لمساعدة متعلمي اللغة الألمانية على تنظيم رحلتهم التعليمية.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">React</span>
                  <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">JavaScript</span>
                  <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">TypeScript</span>
                  <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">Vite</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Mission */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">الرسالة</h2>
            <p className="text-muted-foreground leading-relaxed">
              نؤمن أن تعلم اللغة الألمانية يجب أن يكون منظماً وممتعاً. 
              DeutschPath يوفر الأدوات والهيكل اللازمين لتحقيق أهدافك في تعلم اللغة الألمانية بكفاءة وفعالية.
            </p>
          </Card>

          {/* Version Info */}
          <div className="text-center text-sm text-muted-foreground pt-4 border-t">
            <p>DeutschPath v1.0.0</p>
            <p>تم التطوير بـ ❤️ لمساعدة متعلمي اللغة الألمانية</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
