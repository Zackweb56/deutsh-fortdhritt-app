import { ArrowLeft, BookOpen, BriefcaseBusiness, ClipboardList } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSection, type AppSection } from "@/contexts/SectionContext";

const sections: {
  id: AppSection;
  arabic: string;
  german: string;
  arabicDescription: string;
  germanDescription: string;
  path: string;
  Icon: typeof BookOpen;
  iconStyle: string;
}[] = [
  {
    id: "learning",
    arabic: "التعلّم",
    german: "Lernen",
    arabicDescription: "تابع دروسك اليومية، ووسّع مفرداتك، وطوّر مهاراتك في القواعد والاستماع والكتابة.",
    germanDescription: "Lerne mit Lektionen, Wortschatz und Grammatik weiter und trainiere Hören, Sprechen und Schreiben.",
    path: "/learning",
    Icon: BookOpen,
    iconStyle: "bg-primary text-primary-foreground shadow-primary/20",
  },
  {
    id: "exam-preparation",
    arabic: "تحضير الامتحان",
    german: "Prüfungsvorbereitung",
    arabicDescription: "تدرّب على أقسام الامتحان، وتعرّف على نماذج الأسئلة، واستعد بثقة لاختبارات اللغة.",
    germanDescription: "Übe die Prüfungsteile, lerne typische Aufgaben kennen und bereite dich gezielt auf Sprachprüfungen vor.",
    path: "/exam-preparation",
    Icon: ClipboardList,
    iconStyle: "bg-accent text-accent-foreground shadow-accent/20",
  },
  {
    id: "interviews",
    arabic: "تحضير المقابلات",
    german: "Interview-Training",
    arabicDescription: "استعد لمقابلات العمل من خلال التدرّب على الأسئلة الشائعة والإجابات المناسبة باللغة الألمانية.",
    germanDescription: "Bereite dich mit häufigen Fragen und passenden Antworten auf dein Vorstellungsgespräch auf Deutsch vor.",
    path: "/interviews",
    Icon: BriefcaseBusiness,
    iconStyle: "bg-secondary text-secondary-foreground shadow-black/20",
  },
];

export default function SectionEntry() {
  const { setSection } = useSection();
  const navigate = useNavigate();

  const selectSection = (section: AppSection, path: string) => {
    setSection(section);
    navigate(path);
  };

  return (
    <main
      className="flex min-h-screen items-center justify-center bg-background px-4 py-12 text-foreground"
      dir="rtl"
    >
      <div className="w-full max-w-6xl space-y-8">
        <header className="space-y-3 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary shadow-lg">
            <BookOpen aria-hidden="true" className="h-7 w-7" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            اختر القسم — Wähle einen Bereich
          </h1>
          <p className="text-muted-foreground">اختر ما تريد أن تتعلّمه اليوم · Wähle deinen nächsten Schritt</p>
        </header>

        <div className="grid gap-5 pt-4 md:grid-cols-3">
          {sections.map(({ id, arabic, german, arabicDescription, germanDescription, path, Icon, iconStyle }, index) => (
            <Card
              key={id}
              className="group relative flex h-full flex-col overflow-hidden border-border/80 bg-card/80 shadow-sm transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl"
            >
              <span
                aria-hidden="true"
                className="pointer-events-none absolute -end-12 -top-14 h-40 w-40 rounded-full bg-primary/5 transition-transform duration-300 group-hover:scale-125"
              />
              <CardHeader className="relative gap-7 pb-4">
                <div className="flex items-start justify-between">
                  <div
                    className={`relative flex h-16 w-16 items-center justify-center rounded-2xl shadow-lg ring-4 ring-background ${iconStyle}`}
                  >
                    <span
                      aria-hidden="true"
                      className="absolute -end-2 -top-2 h-5 w-5 rounded-full border-4 border-card bg-background"
                    />
                    <Icon aria-hidden="true" className="h-8 w-8" strokeWidth={1.8} />
                  </div>
                  <span
                    dir="ltr"
                    className="rounded-full border border-border bg-background/70 px-3 py-1 text-xs font-semibold tracking-widest text-muted-foreground"
                  >
                    0{index + 1} / 03
                  </span>
                </div>
                <div className="space-y-2">
                  <CardTitle className="text-2xl font-bold leading-tight sm:text-3xl">
                    <span className="block" dir="rtl">{arabic}</span>
                    <span className="mt-1 block text-2xl sm:text-3xl" dir="ltr">{german}</span>
                  </CardTitle>
                  <CardDescription className="max-w-sm space-y-1 text-sm leading-relaxed">
                    <span className="block" dir="rtl">{arabicDescription}</span>
                    <span className="block text-left" dir="ltr">{germanDescription}</span>
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="relative mt-auto pt-2">
                <Button
                  type="button"
                  className="h-11 w-full justify-between rounded-xl"
                  onClick={() => selectSection(id, path)}
                >
                  <span>{arabic} — {german}</span>
                  <ArrowLeft aria-hidden="true" className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </main>
  );
}
