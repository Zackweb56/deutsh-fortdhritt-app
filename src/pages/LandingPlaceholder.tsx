import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function LandingPlaceholder() {
  const navigate = useNavigate();

  return (
    <main
      className="flex min-h-screen items-center justify-center bg-background px-4 py-12 text-foreground"
      dir="rtl"
    >
      <div className="w-full max-w-xl space-y-6 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">DeutschPath</h1>
        <p className="text-lg text-muted-foreground">
          طريقك لتعلّم الألمانية — Dein Weg zur deutschen Sprache.
        </p>
        <Button type="button" size="lg" onClick={() => navigate("/sections")}>
          دخول — Anmelden
        </Button>
      </div>
    </main>
  );
}
