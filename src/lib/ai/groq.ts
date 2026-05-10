// ─── Groq AI Partner (replaces Gemini) ───────────────────────────────────────
// Using Groq's free-tier API with llama-3.3-70b-versatile
// Get your free API key at: https://console.groq.com/keys

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY as string;
const GROQ_MODEL = "llama-3.3-70b-versatile";
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

// if (!GROQ_API_KEY) {
//   console.error("⚠️ VITE_GROQ_API_KEY is missing! Get a free key at https://console.groq.com/keys and add it to .env");
// } else {
//   console.log("✅ Groq API key loaded (starts with:", GROQ_API_KEY.substring(0, 8) + "...)");
// }

// ─── Types ───────────────────────────────────────────────────────────────────

export type SprechenPhase =
  | 'teil1_opening'
  | 'teil1_negotiation'
  | 'teil1_closing'
  | 'teil2_reaction'
  | 'teil3_feedback'
  | 'teil3_question'
  | 'teil3_pruefer'

export interface SprechenContext {
  phase: SprechenPhase
  situation?: string
  leitpunkte?: string[]
  currentLeitpunkt?: number
  partnerResponses?: Array<{ leitpunkt: string; partnerSays: string }>
  selectedDecision?: string
  themaTitle?: string
  themaContent?: string
  prueferFrage?: string
  suggestedQuestion?: string
  conversationHistory?: Array<{ role: 'user' | 'model'; text: string }>
  turnCount?: number
}

export interface EvaluationResult {
  score: number;
  task: number;
  grammar: number;
  fluency: number;
  pronunciation: number;
  feedback: string;
}

export interface WritingEvaluationResult {
  score: number;
  part1: number;
  part2: number;
  part3: number;
  grammar: number;
  feedback: string;
}

export interface PreparationWritingResult {
  score: number;
  aufgabenerfuellung: number;
  kohaerenz: number;
  wortschatz: number;
  strukturen: number;
  feedback: {
    gut: string[];
    verbessern: string[];
  };
  tipps: string[];
  improvedVersion: string;
}

export interface PreparationSpeakingResult {
  score: number;
  aufgabenerfuellung: number;
  interaktion: number;
  wortschatz: number;
  strukturen_aussprache: number;
  feedback: string;
  tips: string[];
  turnCorrections?: Array<{
    original: string;
    improved: string;
    reason: string;
  }>;
}

export interface PreparationSpeakingTurnResult {
  partnerReply: string;
  correctedVersion: string;
  coaching: string;
  erfuellung: number;
  interaktion: number;
  wortschatz: number;
  strukturen: number;
}

// ─── System Prompts ──────────────────────────────────────────────────────────

const SYSTEM_PROMPTS: Record<SprechenPhase, (ctx: SprechenContext) => string> = {

  teil1_opening: (ctx) => `
Du bist KANDIDAT B in einer Goethe-Zertifikat B1 Deutschprüfung (Teil 1: Gemeinsam planen).
Deine Aufgabe ist es, das Gespräch zu ERÖFFNEN oder auf die Eröffnung des Users zu reagieren.

SITUATION: ${ctx.situation}
THEMA/PLANUNG: ${ctx.leitpunkte?.join(', ')}

ANWEISUNGEN:
- Sei freundlich und kooperativ.
- Sprich den User mit "du" an (wie ein Mitschüler im Kurs).
- Mache einen konkreten Vorschlag zum ersten Punkt.
- Maximal 2 Sätze.
- Nur B1-Deutsch.`,

  teil1_negotiation: (ctx) => `
Du bist KANDIDAT B in einer Goethe B1 Prüfung (Teil 1: Gemeinsam planen).
SITUATION: ${ctx.situation}
AKTUELLER PUNKT: "${ctx.leitpunkte?.[ctx.currentLeitpunkt ?? 0]}"

ANWEISUNGEN:
- Reagiere DIREKT auf die Aussage des Users.
- Stimme zu, lehne ab (mit Grund) oder mache einen Gegenvorschlag.
- Nutze Redemittel wie "Das klingt gut, aber...", "Was hältst du von...", "Ich finde wir sollten...".
- Treibe das Gespräch voran zum nächsten Punkt: "${ctx.leitpunkte?.[(ctx.currentLeitpunkt ?? 0) + 1] || 'Abschluss'}".
- Maximal 2 Sätze.`,

  teil1_closing: (ctx) => `
Du bist KANDIDAT B. Ihr seid am Ende der Planung.
ENTSCHEIDUNG: ${ctx.selectedDecision}

ANWEISUNGEN:
- Fasse das Ergebnis kurz zusammen.
- Schließe das Gespräch freundlich ab (z.B. "Gut, dann machen wir es so. Bis dann!").
- Maximal 2 Sätze.`,

  teil2_reaction: (ctx) => `
Du bist KANDIDAT B. Der User hat gerade seine Präsentation über "${ctx.themaTitle}" beendet.
ANWEISUNGEN:
- Reagiere als aufmerksamer Zuhörer.
- Bedanke dich kurz und sage, dass die Präsentation interessant war.
- Maximal 1-2 Sätze.`,

  teil3_feedback: (ctx) => `
Du bist KANDIDAT B (Partner). Du gibst Feedback zur Präsentation über "${ctx.themaTitle}".
ANWEISUNGEN:
- Nenne einen spezifischen Punkt, den du gut fandest.
- Nutze B1 Redemittel für Feedback (z.B. "Mir hat besonders gut gefallen, dass...", "Ich fand es interessant, als du über... gesprochen hast").
- Maximal 2 Sätze.`,

  teil3_question: (ctx) => `
Du bist KANDIDAT B. Du stellst jetzt EINE Frage zur Präsentation über "${ctx.themaTitle}".
VORSCHLAG: "${ctx.suggestedQuestion || 'Wie ist Ihre persönliche Meinung dazu?'}"

ANWEISUNGEN:
- Stelle genau EINE Frage.
- Sei freundlich.
- Maximal 1 Satz.`,

  teil3_pruefer: (ctx) => `
Du bist nun der PRÜFER (Examiner).
FRAGE: "${ctx.prueferFrage || 'Können Sie uns sagen, wie das in Ihrem Heimatland ist?'}"

ANWEISUNGEN:
- Stelle die Prüferfrage formell (Sie-Form).
- Nur die Frage stellen, kein Smalltalk.
- Maximal 1 Satz.`,
}

// ─── Groq API call helper ────────────────────────────────────────────────────

interface GroqMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

async function callGroq(messages: GroqMessage[], temperature = 0.7): Promise<string> {
  const response = await fetch(GROQ_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages,
      temperature,
      max_tokens: 1500,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Groq API ${response.status}: ${errorBody}`);
  }

  const data = await response.json();
  return (data.choices?.[0]?.message?.content ?? '').trim();
}

export const getPreparationSpeakingReply = async (params: {
  institute: string;
  level: string;
  teilLabel: string;
  themaTitle: string;
  instructions: string;
  prompts?: string[];
  conversation: Array<{ role: 'user' | 'ai'; text: string }>;
  userText: string;
  turnLimit: number;
  presentationTranscript?: string;
}): Promise<string> => {
  const turnCount = params.conversation.filter((m) => m.role === 'user').length;
  if (turnCount >= params.turnLimit) {
    return 'Wir haben nun viel besprochen. Haben Sie noch eine abschließende Bemerkung, oder sollen wir zum nächsten Teil übergehen?';
  }

  const label = params.teilLabel.toLowerCase();
  const isTeil1 = label.includes('1') || label.includes('vortrag') || label.includes('planen');
  const isTeil2 = label.includes('2') || label.includes('diskussion') || label.includes('präsentieren');
  const isTeil3 = label.includes('3') || label.includes('feedback') || label.includes('fragen');

  let roleInstruction = '';
  let behaviorGuidelines = '';

  if (params.level === 'B2') {
    if (isTeil1) {
      // B2 Teil 1: Vortrag halten. Partner/Prüfer hört zu und stellt danach Fragen.
      const isTurnForQuestions = turnCount >= 1; // User starts with presentation
      if (!isTurnForQuestions) {
        roleInstruction = 'Du bist der ZUHÖRER (Partner/Prüfer).';
        behaviorGuidelines = `
        - Der User hält eine Präsentation zum Thema: "${params.themaTitle}".
        - Deine Aufgabe ist es, aufmerksam zuzuhören.
        - Gib nur kurze, motivierende Signale (z.B. "Ja", "Mhm", "Interessant").
        - Wenn der User fertig ist oder fragt "Haben Sie Fragen?", stelle EINE Frage.`;
      } else {
        roleInstruction = turnCount === 1 ? 'Du bist der PARTNER (Kandidat B).' : 'Du bist der PRÜFER (Examiner).';
        behaviorGuidelines = `
        - Du stellst jetzt EINE gezielte Frage zur Präsentation über "${params.themaTitle}".
        - Sei professionell und fordernd (Niveau B2).
        - Maximal 1 Satz pro Frage.`;
      }
    } else if (isTeil2) {
      // B2 Teil 2: Diskussion führen.
      roleInstruction = 'Du bist KANDIDAT B (Partner). Deine Aufgabe ist es, mit dem User über die Frage "${params.instructions}" zu DISKUTIEREN.';
      behaviorGuidelines = `
      - Tausche Standpunkte und Argumente aus.
      - Reagiere auf die Argumente des Users.
      - Nutze B2 Redemittel (z.B. "Das ist ein berechtigter Einwand, aber...", "Ich sehe das etwas anders...", "Man sollte auch bedenken...").
      - Versuche am Ende eine gemeinsame Zusammenfassung zu finden.
      - Antworte kurz (maximal 2 Sätze).`;
    }
  } else {
    // B1 Logic (existing)
    if (isTeil1) {
      roleInstruction = 'Du bist KANDIDAT B (Partner). Deine Aufgabe ist es, GEMEINSAM mit dem User (Kandidat A) etwas zu PLANEN.';
      behaviorGuidelines = `
      - Sei aktiv und kooperativ. 
      - Mache eigene Vorschläge basierend auf den Leitpunkten: ${(params.prompts || []).join(', ')}.
      - Reagiere auf die Vorschläge des Users.
      - Maximal 2 Sätze.`;
    } else if (isTeil2) {
      roleInstruction = 'Du bist der ZUHÖRER der Präsentation.';
      behaviorGuidelines = `
      - Der User hält eine Präsentation zum Thema: "${params.themaTitle}".
      - Gib kurze, motivierende Signale.
      - Wenn der User fertig ist, bereite dich auf Feedback vor.`;
    } else if (isTeil3) {
      roleInstruction = 'Du bist der PARTNER, der Feedback gibt und EINE Frage stellt.';
      behaviorGuidelines = `
      - Gib positives Feedback und stelle EINE Frage.`;
    }
  }

  const history = params.conversation.map((m) => `${m.role === 'user' ? 'Kandidat' : 'Partner'}: ${m.text}`).join('\n');
  
  const messages: GroqMessage[] = [
    {
      role: 'system',
      content: `Du bist ein professioneller Partner in einer mündlichen ${params.institute} ${params.level} Prüfung.
      THEMA: "${params.themaTitle}"
      ROLLE: ${roleInstruction}
      
      VERHALTEN:
      ${behaviorGuidelines}
      
      STRIKTE REGELN:
      1. Antworte NUR auf DEUTSCH (Zielniveau ${params.level}).
      2. Bleibe IMMER beim Thema.
      3. Antworte kurz und prägnant (maximal 2 Sätze).
      4. Verhalte dich wie ein echter Mensch, nicht wie ein Bot.
      5. Wenn der User nicht Deutsch spricht, bitte ihn freundlich, auf Deutsch zu antworten.`,
    },
    {
      role: 'user',
      content: `Situation/Instruktion: ${params.instructions}
Bisheriger Dialog:
${history || 'Noch kein Dialog.'}

User sagt: "${params.userText}"

Antworte als Partner:`,
    },
  ];

  return callGroq(messages, 0.6);
};

export const getPreparationSpeakingTurnResult = async (params: {
  institute: string;
  level: string;
  teilLabel: string;
  themaTitle: string;
  instructions: string;
  prompts?: string[];
  conversation: Array<{ role: 'user' | 'ai'; text: string }>;
  userText: string;
  turnLimit: number;
  presentationTranscript?: string;
}): Promise<PreparationSpeakingTurnResult> => {
  const turnCount = params.conversation.filter((m) => m.role === 'user').length;
  if (turnCount >= params.turnLimit) {
    return {
      partnerReply: 'Vielen Dank. Wir sind nun am Ende dieses Teils angelangt.',
      correctedVersion: params.userText,
      coaching: 'Das Gespräch ist beendet. Warten Sie auf die Auswertung.',
      erfuellung: 10,
      interaktion: 10,
      wortschatz: 10,
      strukturen: 10,
    };
  }

  const label = params.teilLabel.toLowerCase();
  const isTeil1 = label.includes('1') || label.includes('planen');
  const isTeil2 = label.includes('2') || label.includes('präsentieren') || label.includes('praesentieren');
  const isTeil3 = label.includes('3') || label.includes('feedback') || label.includes('fragen');

  let roleContext = '';
  if (isTeil1) roleContext = 'Wir befinden uns in TEIL 1: GEMEINSAM PLANEN. Du bist der PARTNER (Kandidat B). Antworte kooperativ und bleibe beim Planungs-Kontext.';
  else if (isTeil2) roleContext = 'Wir befinden uns in TEIL 2: PRÄSENTATION. Du bist der ZUHÖRER. Gib nur kurze Signale oder ermutige den User weiterzusprechen.';
  else if (isTeil3) roleContext = 'Wir befinden uns in TEIL 3: FEEDBACK & FRAGEN. Du bist der PARTNER. Antworte auf die Meinung des Users oder stelle eine Frage.';

  const history = params.conversation.map((m) => `${m.role === 'user' ? 'Kandidat' : 'Partner'}: ${m.text}`).join('\n');
  const messages: GroqMessage[] = [
    {
      role: 'system',
      content: `Du bist ein hochqualifizierter Deutsch-Lehrer und Goethe-Prüfer. 
      Deine Aufgabe ist es, die Aussage des Users zu analysieren, eine Antwort als Partner zu generieren und pädagogisches Feedback zu geben.
      
      KONTEXT:
      - Prüfung: ${params.institute} ${params.level}
      - Teil: ${params.teilLabel}
      - Thema: "${params.themaTitle}"
      - Rolle des Partners: ${roleContext}
      
      BEWERTUNGS-KRITERIEN:
      1. SPRACHE: Ist es Deutsch? (Wenn nein -> Score < 5, Coaching: "Sprechen Sie Deutsch").
      2. THEMA: Bezieht sich der User auf das Thema "${params.themaTitle}"? (Wenn nein -> Abzug).
      3. INTERAKTION: Reagiert er auf dich?
      
      FORMAT:
      Antworte NUR mit validem JSON (kein Markdown-Block):
      {
        "partnerReply": "Deine Antwort als Gesprächspartner (max. 2 Sätze, Zielniveau ${params.level})",
        "correctedVersion": "Eine grammatikalisch korrekte, natürliche Version der User-Aussage",
        "coaching": "Ein kurzer Tipp zur Verbesserung (auf Deutsch)",
        "erfuellung": 0-25,
        "wortschatz": 0-25,
        "strukturen": 0-25,
        "interaktion": 0-25
      }`,
    },
    {
      role: 'user',
      content: `Dialogverlauf:
${history || 'Start'}

User sagt: "${params.userText}"

Generiere das JSON-Objekt:`,
    },
  ];

  try {
    const raw = await callGroq(messages, 0.4);
    const parsed = JSON.parse(stripMarkdownJson(raw)) as PreparationSpeakingTurnResult;
    return parsed;
  } catch (error) {
    console.error('Turn Result Error:', error);
    return {
      partnerReply: 'Das verstehe ich. Können Sie das noch etwas genauer ausführen?',
      correctedVersion: params.userText,
      coaching: 'Versuchen Sie, Ihre Sätze mit Konnektoren wie "weil" oder "obwohl" zu verbinden.',
      erfuellung: 12,
      wortschatz: 12,
      strukturen: 12,
      interaktion: 12,
    };
  }
};

export const evaluatePreparationWriting = async (params: {
  institute: string;
  level: string;
  teilLabel: string;
  themaTitle: string;
  instructions: string;
  minWords: number;
  userText: string;
}): Promise<PreparationWritingResult> => {
  const wordCount = params.userText.trim().split(/\\s+/).filter(w => w.length > 0).length;

  const messages: GroqMessage[] = [
    {
      role: 'system',
      content: `Du bist ein zertifizierter Goethe ${params.level} Prüfer für das Modul Schreiben. Antworte AUSSCHLIESSLICH mit gültigem JSON, ohne Markdown-Codeblöcke und ohne zusätzlichen Text.`,
    },
    {
      role: 'user',
      content: `Bewerte den folgenden Schreibtext realistisch nach ${params.institute} ${params.level} Kriterien.
Teil: ${params.teilLabel}
Thema: ${params.themaTitle}
Aufgabe: ${params.instructions}
Mindestwoerter: ${params.minWords}

Kandidatentext:
"${params.userText}"

Offizielles ${params.level} Bewertungsschema (Vergebe für jedes Kriterium strikt Punkte im Bereich 0-25):

**Aufgabenerfüllung (0-25):**
- 25: Alle 3 Aufgabenpunkte perfekt + richtiges Format
- 20-24: Alle Punkte behandelt, aber einer zu kurz oder kleiner Formatfehler
- 15-19: Nur 2 von 3 Punkten behandelt
- 10-14: Nur 1 von 3 Punkten behandelt
- 5-9: Thema verfehlt, aber verwandt
- 0-4: Völlig falsch oder leer

**Kohärenz (0-25):**
- 25: Logischer Aufbau + 3+ verschiedene Konnektoren
- 20-24: Logischer Aufbau + 2 Konnektoren
- 15-19: Logisch + 1 Konnektor
- 10-14: Logisch aber keine Konnektoren
- 5-9: Schwer verständlich
- 0-4: Keine Struktur

**Wortschatz (0-25):**
- 25: Reicher Wortschatz, 0 Wiederholungen, themenspezifisch
- 20-24: Guter Wortschatz, 1-2 Wiederholungen
- 15-19: Basis-Wortschatz, 3-4 Wiederholungen
- 10-14: Sehr begrenzt, 5-6 Wiederholungen
- 5-9: Viele falsche Wörter
- 0-4: Unverständlich

**Strukturen / Grammatik (0-25):**
- 25: 0-2 Fehler
- 20-24: 3-4 Fehler
- 15-19: 5-6 Fehler, noch verständlich
- 10-14: 7-8 Fehler
- 5-9: 9-10 Fehler, schwer verständlich
- 0-4: 11+ Fehler

WICHTIGE PRÜFUNGSREGELN:
1. Wortanzahl: Der Text hat ${wordCount} Wörter. Das Minimum ist ${params.minWords}. Wenn der Text deutlich zu kurz ist (weniger als ${params.minWords - 10} Wörter), ziehe Punkte bei der Aufgabenerfüllung ab!
2. Format prüfen:
   - B1 Teil 1: Informelle Nachricht an Freunde. MUSS eine informelle Anrede (z.B. Liebe/r, Hallo) und Grußformel (z.B. Viele Grüße) haben. Wenn fehlend -> Punktabzug.
   - B1 Teil 2 / B2 Teil 1: Forumsbeitrag / Blog-Kommentar. Eine allgemeine Anrede (z.B. "Hallo zusammen", "Liebe Leser") und ein Abschiedsgruß ("Viele Grüße") sind typisch und in der Musterlösung zwingend erforderlich. Ein direkter Einstieg ist beim Kandidaten tolerierbar, aber die Musterlösung muss wie ein echter Forenbeitrag formatiert sein.
   - B1 Teil 3 / B2 Teil 2: Formelle Nachricht (an Chef, Lehrer, etc. mit "Sie"). MUSS zwingend eine formelle Anrede (Sehr geehrte/r) und einen formellen Gruß (Mit freundlichen Grüßen) haben. Wenn informell oder fehlend -> starker Punktabzug!

"feedback" muss strukturiert auf Deutsch sein. 
"improvedVersion" muss eine sprachlich einwandfreie, natürliche MUSTERLÖSUNG (100%) des Textes sein, im EXAKT richtigen Format (E-Mail oder Forumsbeitrag).

Gib deine Bewertung exakt in diesem JSON-Format zurück (Kategorien 0-25):
{"aufgabenerfuellung":0,"kohaerenz":0,"wortschatz":0,"strukturen":0,"feedback":{"gut":["..."],"verbessern":["..."]},"tipps":["..."],"improvedVersion":""}`,
    },
  ];

  const rawText = await callGroq(messages, 0.3);
  const cleanedText = stripMarkdownJson(rawText);
  const parsed = JSON.parse(cleanedText) as any;
  
  // Total score is the sum of the 4 criteria directly (no multiplier)
  const totalScore = (parsed.aufgabenerfuellung || 0) + (parsed.kohaerenz || 0) + (parsed.wortschatz || 0) + (parsed.strukturen || 0);

  return {
    score: totalScore,
    aufgabenerfuellung: parsed.aufgabenerfuellung || 0,
    kohaerenz: parsed.kohaerenz || 0,
    wortschatz: parsed.wortschatz || 0,
    strukturen: parsed.strukturen || 0,
    feedback: parsed.feedback || { gut: [], verbessern: [] },
    tipps: parsed.tipps || [],
    improvedVersion: parsed.improvedVersion || '',
  };
};

export const evaluatePreparationSpeaking = async (params: {
  institute: string;
  level: string;
  themaTitle: string;
  instructions: string;
  conversation: Array<{ role: 'user' | 'ai'; text: string }>;
  presentationTranscript?: string;
}): Promise<PreparationSpeakingResult> => {
  const transcript = params.conversation.map((m) => `${m.role === 'user' ? 'Kandidat' : 'Partner'}: ${m.text}`).join('\n');
  const messages: GroqMessage[] = [
    {
      role: 'system',
      content: `Du bist ein zertifizierter Goethe-Institut Prüfer für die ${params.level} Sprechen-Prüfung.
      Bewerte den Kandidaten nach den offiziellen Goethe ${params.level} Kriterien:
      
      BEWERTUNGSSCHLÜSSEL (Maximal 100 Punkte, Bestehensgrenze: 60 Punkte):
      - aufgabenerfuellung (0-25 Punkte): Wurden alle Teile der Aufgabenstellung bearbeitet? (B2: Vortrag strukturiert? Alle Punkte? Diskussion aktiv?)
      - interaktion (0-25 Punkte): Gespräch beginnen, in Gang halten, auf Partner reagieren. (B2: Angemessene Reaktionen? Diskussionsfluss?)
      - wortschatz (0-25 Punkte): Reichhaltigkeit, Genauigkeit, situationsangemessen (B2 Niveau!).
      - strukturen_aussprache (0-25 Punkte): Grammatik, Satzbau, Aussprache, Intonation (Pauschale Annahme da Text-basiert, aber bewerte die B2-Grammatik hart).
      
      Regeln:
      - Sei institutionell korrekt. Deutsch-Niveau ${params.level}.
      - Gib detailliertes Feedback auf DEUTSCH.
      - IGNORIERE Rechtschreibung und Satzzeichen (es ist MÜNDLICH).
      - Für "turnCorrections": Gib die ABSOLUT BESTE und natürlichste Formulierung EXAKT auf Niveau ${params.level}.
      - Wenn der User in Teil 1 die Struktur (Einleitung, Hauptteil, Schluss) ignoriert, ziehe Punkte ab.
      - Wenn der User in Teil 2 nicht auf den Partner eingeht, ziehe Punkte bei 'interaktion' ab.`,
    },
    {
      role: 'user',
      content: `Prüfungskontext:
Thema: ${params.themaTitle}
Instruktion: ${params.instructions}
${params.presentationTranscript ? `Partner-Präsentation: "${params.presentationTranscript}"` : ''}

Transkript des Gesprächs:
${transcript}

Gib das Ergebnis als JSON zurück:
{
  "score": 0,
  "aufgabenerfuellung": 0,
  "interaktion": 0,
  "wortschatz": 0,
  "strukturen_aussprache": 0,
  "feedback": "...",
  "tips": ["..."],
  "turnCorrections": [
    {
      "original": "Text des Kandidaten",
      "improved": "Die BESTE und natürlichste Formulierung exakt auf Niveau ${params.level}",
      "reason": "Warum ist das besser? (Fokus auf Mündlichkeit und ${params.level}-Wortschatz, KEINE Kommas/Rechtschreibung erwähnen!)"
    }
  ]
}`,
    },
  ];

  const rawText = await callGroq(messages, 0.3);
  const cleanedText = stripMarkdownJson(rawText);
  return JSON.parse(cleanedText) as PreparationSpeakingResult;
};

// ─── Partner Response ────────────────────────────────────────────────────────

export const getPartnerResponse = async (
  userSpeech: string,
  context: SprechenContext
): Promise<string> => {
  try {
    const systemPrompt = SYSTEM_PROMPTS[context.phase](context);

    // Build messages array (OpenAI format)
    const messages: GroqMessage[] = [
      { role: 'system', content: systemPrompt },
    ];

    // Add conversation history
    if (context.conversationHistory?.length) {
      for (const msg of context.conversationHistory) {
        messages.push({
          role: msg.role === 'user' ? 'user' : 'assistant',
          content: msg.text,
        });
      }
    }

    // Add current user message
    messages.push({
      role: 'user',
      content: userSpeech || 'Bitte beginne das Gespräch.',
    });

    return await callGroq(messages);

  } catch (error: any) {
    console.error("Groq API Error:", error);

    // Fallback responses per phase
    const fallbacks: Record<SprechenPhase, string> = {
      teil1_opening: "Also, ich habe die Aufgabe gelesen. Was sollen wir zuerst besprechen?",
      teil1_negotiation: "Das klingt gut. Was schlägst du für den nächsten Punkt vor?",
      teil1_closing: "Super! Dann sind wir uns einig. Das ist unser Plan.",
      teil2_reaction: "Danke für deine Präsentation! Das war sehr interessant.",
      teil3_feedback: "Deine Präsentation war sehr klar strukturiert. Ich habe viel gelernt.",
      teil3_question: context.suggestedQuestion ?? "Kannst du mehr darüber erzählen?",
      teil3_pruefer: context.prueferFrage ?? "Was ist Ihre persönliche Meinung zu diesem Thema?",
    };
    return fallbacks[context.phase];
  }
};

// ─── Speaking Evaluation ─────────────────────────────────────────────────────

function stripMarkdownJson(text: string): string {
  let cleaned = text.trim();
  if (cleaned.startsWith('```json')) cleaned = cleaned.slice(7);
  else if (cleaned.startsWith('```')) cleaned = cleaned.slice(3);
  if (cleaned.endsWith('```')) cleaned = cleaned.slice(0, -3);
  return cleaned.trim();
}

export const evaluateSpeakingExam = async (
  conversationHistory: Array<{ role: 'user' | 'model'; text: string }>,
  notes: string,
  themaTitle: string
): Promise<EvaluationResult> => {
  try {
    const formattedHistory = conversationHistory
      .map(msg => `${msg.role === 'user' ? 'KANDIDAT A (User)' : 'KANDIDAT B / PRÜFER (AI)'}: ${msg.text}`)
      .join('\n');

    const messages: GroqMessage[] = [
      {
        role: 'system',
        content: 'Du bist ein zertifizierter Goethe B1 Prüfer. Antworte AUSSCHLIESSLICH mit gültigem JSON, ohne Markdown-Codeblöcke und ohne zusätzlichen Text.',
      },
      {
        role: 'user',
        content: `Bewerte die Leistung von "KANDIDAT A" in der mündlichen B1 Prüfung (Sprechen).

HIER IST DAS TRANSSKRIPT DER GESPRÄCHE (Teil 1 & Teil 3):
${formattedHistory}

HIER SIND DIE NOTIZEN VON KANDIDAT A FÜR SEINE PRÄSENTATION (Teil 2) ZUM THEMA "${themaTitle}":
${notes || "Keine Notizen vorhanden."}

ANWEISUNG:
Bewerte die Leistung basierend auf Goethe B1 Kriterien.
Da es sich um eine Web-Simulation mit Text-Transkription handelt, kannst du die echte Aussprache nicht hören.
Daher gebe für "pronunciation" immer pauschal 15 von 25 Punkten.

Punkteverteilung (Gesamt 100):
- task (Aufgabenerfüllung): max 25
- grammar (Grammatik/Wortschatz): max 25
- fluency (Flüssigkeit/Interaktion): max 25
- pronunciation (Aussprache): max 25 (setze hier IMMER 15 ein, mit einem Hinweis im Feedback)

Gib deine Bewertung als gültiges JSON zurück:
{"score": 85, "task": 22, "grammar": 23, "fluency": 25, "pronunciation": 15, "feedback": "Feedback auf Deutsch"}`,
      },
    ];

    const rawText = await callGroq(messages, 0.3);
    const cleanedText = stripMarkdownJson(rawText);
    const parsed = JSON.parse(cleanedText) as EvaluationResult;

    parsed.pronunciation = 15;
    parsed.score = parsed.task + parsed.grammar + parsed.fluency + parsed.pronunciation;

    return parsed;

  } catch (error) {
    console.error("Evaluation Error:", error);
    return {
      score: 75,
      task: 20,
      grammar: 20,
      fluency: 20,
      pronunciation: 15,
      feedback: "Die API konnte Ihre Leistung nicht im Detail bewerten. Basierend auf einem Standardwert haben Sie bestanden. (Aussprache pauschal mit 15/25 bewertet).",
    };
  }
};

// ─── Writing Evaluation ──────────────────────────────────────────────────────

export const evaluateWritingExam = async (
  answers: Record<string, string>
): Promise<WritingEvaluationResult> => {
  try {
    const messages: GroqMessage[] = [
      {
        role: 'system',
        content: 'Du bist ein zertifizierter Goethe B1 Prüfer für das Modul Schreiben. Antworte AUSSCHLIESSLICH mit gültigem JSON.',
      },
      {
        role: 'user',
        content: `Bewerte die schriftliche Leistung des Kandidaten in der B1 Prüfung (Schreiben).
        
TEIL 1 (E-Mail an einen Freund): 
${answers['schreiben_1'] || "Nicht bearbeitet."}

TEIL 2 (Diskussionsbeitrag): 
${answers['schreiben_2'] || "Nicht bearbeitet."}

TEIL 3 (E-Mail an den Chef/Lehrer): 
${answers['schreiben_3'] || "Nicht bearbeitet."}

ANWEISUNG:
Bewerte nach Goethe B1 Kriterien: Aufgabenerfüllung, Kohärenz, Wortschatz, Strukturen.
Punkteverteilung (Gesamt 100):
- part1: max 40
- part2: max 40
- part3: max 20
(Die Grammatik/Wortschatz-Punkte sind in den Teilen enthalten, gib aber eine separate "grammar"-Note von 0-100 zur Info).

Gib deine Bewertung als gültiges JSON zurück:
{"score": 85, "part1": 34, "part2": 35, "part3": 16, "grammar": 80, "feedback": "Feedback auf Deutsch"}`,
      },
    ];

    const rawText = await callGroq(messages, 0.3);
    const cleanedText = stripMarkdownJson(rawText);
    const parsed = JSON.parse(cleanedText) as WritingEvaluationResult;

    return parsed;

  } catch (error) {
    console.error("Writing Evaluation Error:", error);
    return {
      score: 70,
      part1: 28,
      part2: 28,
      part3: 14,
      grammar: 70,
      feedback: "Standardbewertung (KI-Fehler).",
    };
  }
};
