import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SectionShell } from "@/components/section/SectionShell";

export default function InterviewSection() {
  return (
    <SectionShell title="تحضير المقابلات — Interview-Training">
      <Card className="mx-auto max-w-3xl text-center">
        <CardHeader>
          <CardTitle className="text-xl sm:text-2xl">قريباً — Bald verfügbar</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
            تدريب مقابلات الطبخ وقيادة الشاحنات والتمريض — Interviewtraining für Küche,
            Lkw-Fahren und Pflege kommt bald.
          </p>
        </CardContent>
      </Card>
    </SectionShell>
  );
}
