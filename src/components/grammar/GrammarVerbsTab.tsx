import { useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Search, BookOpenCheck, ListChecks, Quote } from 'lucide-react';
import { isLimitedAccess } from '@/lib/access';
import LockOverlay from '@/components/ui/lock-overlay';
import a1Data from '@/data/grammar/a1.json';
import a2Data from '@/data/grammar/a2.json';
import b1Data from '@/data/grammar/b1.json';
import b2Data from '@/data/grammar/b2.json';

type PresentConjugation = {
  ich?: string;
  du?: string;
  'er/sie/es'?: string;
  wir?: string;
  ihr?: string;
  'sie/Sie'?: string;
};

type PerfektInfo = {
  auxiliary?: string;
  participle?: string;
  example?: { de: string; ar: string; pron?: string };
};

type Conjugations = Record<string, Record<string, string>>;

type VerbItem = {
  verb: string;
  meaning: string;
  type: string;
  conjugations?: Conjugations;
  tenses?: {
    Präsens?: PresentConjugation;
    Perfekt?: PerfektInfo;
  };
  examples?: { de: string; ar: string; pron?: string }[];
};

type GrammarTopic = {
  title: string;
  explanation?: string;
  table?: Record<string, any>;
  examples?: { de: string; ar: string; pron?: string }[];
};

function highlightVerbText(v: VerbItem, text: string) {
  if (!text) return text as unknown as any;
  const forms = new Set<string>();
  forms.add(v.verb);
  
  if (v.conjugations) {
    Object.values(v.conjugations).forEach(tense => {
      Object.values(tense).forEach(f => f && forms.add(f));
    });
  } else if (v.tenses) {
    const pr = v.tenses?.Präsens;
    if (pr) {
      Object.values(pr).forEach(f => f && forms.add(f));
    }
    const part = v.tenses?.Perfekt?.participle;
    if (part) forms.add(part);
  }

  const escaped = Array.from(forms)
    .filter(Boolean)
    .sort((a, b) => b.length - a.length)
    .map(s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .join('|');
    
  if (!escaped) return text as unknown as any;
  const regex = new RegExp(`(\\b(?:${escaped})\\b)`, 'gi');

  const parts = String(text).split(regex);
  return (
    <>
      {parts.map((p, i) =>
        regex.test(p) ? (
          <span key={i} className="text-accent font-semibold">{p}</span>
        ) : (
          <span key={i}>{p}</span>
        )
      )}
    </>
  );
}

function highlightVerbForm(verb: string, form: string) {
  if (!form) return '';
  
  const seinForms = ['bin', 'bist', 'ist', 'sind', 'seid'];
  const habenForms = ['habe', 'hast', 'hat', 'haben', 'habt'];
  const werdenForms = ['werde', 'wirst', 'wird', 'werden', 'werdet'];
  
  const words = form.split(' ');
  if (words.length > 1) {
    return (
      <span dir="ltr" className="inline-flex gap-1.5 flex-row">
        {words.map((w, i) => {
          const lower = w.toLowerCase();
          if (seinForms.includes(lower)) {
            return <span key={i} className="text-red-500 font-bold">{w}</span>;
          }
          if (habenForms.includes(lower)) {
            return <span key={i} className="text-emerald-500 font-bold">{w}</span>;
          }
          if (werdenForms.includes(lower)) {
            return <span key={i} className="text-blue-500 font-bold">{w}</span>;
          }
          return <span key={i} className="text-accent font-semibold">{w}</span>;
        })}
      </span>
    );
  }

  // Single word: Root + Suffix
  let root = verb.toLowerCase();
  if (root.endsWith('en')) root = root.slice(0, -2);
  else if (root.endsWith('n')) root = root.slice(0, -1);

  if (form.toLowerCase().startsWith(root) && form.length > root.length) {
    const actualRoot = form.slice(0, root.length);
    const ending = form.slice(root.length);
    return (
      <span dir="ltr">
        <span className="opacity-80">{actualRoot}</span>
        <span className="text-accent font-bold underline decoration-accent/30">{ending}</span>
      </span>
    );
  }

  let commonLen = 0;
  for (let i = 0; i < Math.min(root.length, form.length); i++) {
    if (root[i] === form[i].toLowerCase()) commonLen++;
    else break;
  }

  if (commonLen > 2) {
    const actualRoot = form.slice(0, commonLen);
    const rest = form.slice(commonLen);
    return (
      <span dir="ltr">
        <span className="opacity-80">{actualRoot}</span>
        <span className="text-accent font-bold underline decoration-accent/30">{rest}</span>
      </span>
    );
  }

  return <span className="text-accent font-bold italic" dir="ltr">{form}</span>;
}

export const GrammarVerbsTab = () => {
  type LevelKey = 'A1' | 'A2' | 'B1' | 'B2';
  const dataByLevel = useMemo(() => ({
    A1: (a1Data as any)?.A1 as { grammar?: GrammarTopic[]; verbs?: VerbItem[] },
    A2: (a2Data as any)?.A2 as { grammar?: GrammarTopic[]; verbs?: VerbItem[] },
    B1: (b1Data as any)?.B1 as { grammar?: GrammarTopic[]; verbs?: VerbItem[] },
    B2: (b2Data as any)?.B2 as { grammar?: GrammarTopic[]; verbs?: VerbItem[] },
  }), []);

  const [level, setLevel] = useState<LevelKey>('A1');
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'grammar' | 'verbs'>('grammar');
  const [verbTenses, setVerbTenses] = useState<Record<string, string>>({});

  const current = useMemo(() => dataByLevel[level] || { grammar: [], verbs: [] }, [dataByLevel, level]);
  const verbs: VerbItem[] = useMemo(() => current?.verbs ?? [], [current]);
  const grammar: GrammarTopic[] = useMemo(() => current?.grammar ?? [], [current]);

  const availableTypes = useMemo(() => {
    const set = new Set<string>();
    verbs.forEach(v => v.type && set.add(v.type));
    return Array.from(set);
  }, [verbs]);

  const filteredVerbs = useMemo(() => {
    const q = search.trim().toLowerCase();
    return verbs.filter(v => {
      const matchesType = typeFilter === 'all' || v.type === typeFilter;
      if (!q) return matchesType;
      const hay = [v.verb, v.meaning]
        .concat((v.examples || []).flatMap(e => [e.de, e.ar]))
        .join(' ') 
        .toLowerCase();
      return matchesType && hay.includes(q);
    });
  }, [verbs, search, typeFilter]);

  return (
    <div className="space-y-6" dir="rtl">
      <Card className="card-gradient p-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-xl font-bold">القواعد والأفعال — {level}</h2>
            <p className="text-sm text-muted-foreground mt-1">
              عرض مرتب وملخّص لمواضيع القواعد الأساسية وأهم الأفعال مع التصريف والأمثلة.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={level} onValueChange={(v) => setLevel(v as LevelKey)}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="المستوى" />
              </SelectTrigger>
              <SelectContent align="end">
                <SelectItem value="A1">A1</SelectItem>
                <SelectItem value="A2">A2</SelectItem>
                <SelectItem value="B1">B1</SelectItem>
                <SelectItem value="B2">B2</SelectItem>
              </SelectContent>
            </Select>
            <Badge variant="secondary" className="text-xs">
              القواعد: {grammar.length}
            </Badge>
            <Badge variant="secondary" className="text-xs">
              الأفعال: {verbs.length}
            </Badge>
          </div>
        </div>
      </Card>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} dir="rtl">
        <TabsList className="w-full sm:w-auto mb-4">
          <TabsTrigger value="grammar" className="flex items-center gap-2">
            <BookOpenCheck className="h-4 w-4" />
            القواعد
          </TabsTrigger>
          <TabsTrigger value="verbs" className="flex items-center gap-2">
            <ListChecks className="h-4 w-4" />
            الأفعال
          </TabsTrigger>
        </TabsList>

        <TabsContent value="grammar" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {grammar.map((topic, idx) => (
              <Card key={idx} className="p-4">
                <LockOverlay isLocked={isLimitedAccess()} message="القواعد محجوبة — تواصل عبر واتساب لفتح الوصول الكامل">
                  <h3 className="text-lg font-semibold mb-2">{topic.title}</h3>
                  {topic.explanation && (
                    <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
                      {topic.explanation}
                    </p>
                  )}

                  {topic.table && (
                    <div className="mb-3 overflow-x-auto">
                      {renderFlexibleTable(topic.table)}
                    </div>
                  )}

                  {Array.isArray(topic.examples) && topic.examples.length > 0 && (
                    <div className="space-y-2">
                      <div className="text-sm font-medium">أمثلة:</div>
                      <div className="space-y-2">
                        {topic.examples.map((ex, i) => (
                          <div key={i} className="p-2 rounded border border-border">
                            <div className="font-medium">{ex.de}</div>
                            <div className="text-sm text-muted-foreground">{ex.ar}</div>
                            {ex.pron && (
                              <div className="text-xs text-muted-foreground mt-1">{ex.pron}</div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </LockOverlay>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="verbs" className="space-y-6">
          <Card className="p-4">
            <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
              <div className="flex-1 relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="ابحث عن فعل أو معنى أو مثال..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pr-10"
                />
              </div>
              <div>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="w-full sm:w-56 p-2 border border-input rounded-md bg-background text-sm"
                >
                  <option value="all">كل الأنواع</option>
                  {availableTypes.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredVerbs.map((v, idx) => {
              const currentTense = verbTenses[v.verb] || 'Präsens';
              const tenses = v.conjugations ? Object.keys(v.conjugations) : (v.tenses ? ['Präsens', 'Perfekt'] : []);

              return (
                <Card key={idx} className="p-5 flex flex-col gap-5 border border-border shadow-sm hover:shadow-md transition-shadow">
                  <LockOverlay isLocked={isLimitedAccess()} message="الأفعال محجوبة — تواصل عبر واتساب لفتح الوصول الكامل">
                  <div className="flex items-start justify-between gap-2 border-b border-zinc-800/20 pb-4">
                    <div>
                      <div className="text-2xl font-bold text-white tracking-tight">{v.verb}</div>
                      <div className="text-sm text-zinc-500 font-medium mt-0.5">{v.meaning}</div>
                    </div>
                    {renderTypeBadge(v.type)}
                  </div>

                  {/* Tense selector inside each card */}
                  {tenses.length > 0 && (
                    <div className="flex items-center justify-between gap-3 bg-muted/30 p-2 rounded-lg border border-border/50">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">الزمن:</span>
                      <Select value={currentTense} onValueChange={(t) => setVerbTenses(prev => ({ ...prev, [v.verb]: t }))}>
                        <SelectTrigger className="h-8 w-[120px] text-xs">
                          <SelectValue placeholder="الزمن" />
                        </SelectTrigger>
                        <SelectContent>
                          {tenses.map(t => (
                            <SelectItem key={t} value={t}>{t}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Conjugation display */}
                  <div className="flex-1">
                    {renderConjugation(v, currentTense)}
                  </div>

                  {/* Examples */}
                  {Array.isArray(v.examples) && v.examples.length > 0 && (
                    <Accordion type="single" collapsible className="mt-2">
                      <AccordionItem value="examples" className="border-none">
                        <AccordionTrigger className="text-sm font-medium py-2 opacity-70 hover:opacity-100 transition-opacity">
                          <div className="flex items-center gap-2">
                            <Quote className="h-4 w-4" />
                            <span>أمثلة ({v.examples.length})</span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-2.5 pt-2">
                            {v.examples.map((ex, i) => (
                              <div key={i} className="p-3 rounded-lg border border-border bg-muted/10">
                                <div className="font-medium text-sm leading-relaxed">{highlightVerbText(v, ex.de)}</div>
                                <div className="text-xs text-muted-foreground mt-1.5">{ex.ar}</div>
                                {ex.pron && (
                                  <div className="text-[10px] text-muted-foreground/60 mt-1 italic">{ex.pron}</div>
                                )}
                              </div>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  )}
                  </LockOverlay>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

function renderConjugation(v: VerbItem, tense: string) {
  const conj = v.conjugations?.[tense];
  
  if (conj) {
    const isImperativ = tense === 'Imperativ';
    const order = isImperativ ? ['du', 'ihr', 'Sie'] : ['ich', 'du', 'er/sie/es', 'wir', 'ihr', 'sie/Sie'];
    
    return (
      <div className="mt-3 space-y-3">
        <div className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-2">
          <span className="h-1 w-1 rounded-full bg-accent" />
          {tense}
        </div>
        <div className="rounded-xl overflow-hidden border border-border/50 bg-black/5">
          <Table>
            <TableBody>
              {order.map(k => conj[k] ? (
                <TableRow key={k} className="hover:bg-muted/50 transition-colors border-border/20">
                  <TableCell className="text-right py-2 px-4 font-bold">
                    {highlightVerbForm(v.verb, conj[k])}
                  </TableCell>
                  <TableCell className="py-2 px-4 text-[11px] text-muted-foreground font-medium text-left border-r border-border/10">
                    {k}
                  </TableCell>
                </TableRow>
              ) : null)}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  if (tense === 'Präsens' && v.tenses?.Präsens) {
    const pr = v.tenses.Präsens;
    const order = ['ich', 'du', 'er/sie/es', 'wir', 'ihr', 'sie/Sie'];
    return (
      <div className="mt-3 space-y-3">
        <div className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-2">
          <span className="h-1 w-1 rounded-full bg-accent" />
          Präsens
        </div>
        <Table className="border-border/50">
          <TableBody>
            {order.map(k => (pr as any)[k] ? (
              <TableRow key={k} className="hover:bg-muted/50 border-border/20">
                <TableCell className="text-right py-2 px-4 font-bold">
                  {highlightVerbForm(v.verb, (pr as any)[k])}
                </TableCell>
                <TableCell className="py-2 px-4 text-[11px] text-muted-foreground text-left border-r border-border/10">{k}</TableCell>
              </TableRow>
            ) : null)}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (tense === 'Perfekt' && v.tenses?.Perfekt) {
    const perf = v.tenses.Perfekt;
    return (
      <div className="space-y-3">
        <div className="text-sm font-bold border-b border-border/20 pb-2">الماضي التام (Perfekt)</div>
        <div className="space-y-2.5 p-1">
          {perf.auxiliary && (
            <div className="text-xs text-muted-foreground flex justify-between items-center">
              <span>الفعل المساعد:</span>
              <span className={perf.auxiliary === 'sein' ? 'text-red-500 font-black' : 'text-emerald-500 font-black'}>{perf.auxiliary}</span>
            </div>
          )}
          {perf.participle && (
            <div className="text-xs text-muted-foreground flex justify-between items-center">
              <span>اسم المفعول:</span>
              <span className="text-accent font-black tracking-wide">{perf.participle}</span>
            </div>
          )}
          {perf.example && (
            <div className="p-3 rounded-lg border border-border bg-accent/5 mt-3">
              <div className="font-bold text-sm text-foreground">{highlightVerbText(v, perf.example.de)}</div>
              <div className="text-xs text-muted-foreground mt-1">{perf.example.ar}</div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return <div className="py-4 text-center text-xs text-muted-foreground/50 italic border border-dashed border-border rounded-lg">غير متوفر.</div>;
}

function renderFlexibleTable(table: Record<string, any>) {
  const entries = Object.entries(table);
  const isFlat = entries.every(([, v]) => typeof v === 'string');

  if (isFlat) {
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-right">البند</TableHead>
            <TableHead className="text-right">القيمة</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {entries.map(([k, v]) => (
            <TableRow key={k}>
              <TableCell className="font-medium">{k}</TableCell>
              <TableCell>{String(v)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  }

  return (
    <div className="space-y-4">
      {entries.map(([subTitle, value]) => (
        <div key={subTitle} className="space-y-2">
          <div className="text-sm font-medium">{subTitle}</div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">المفتاح</TableHead>
                  <TableHead className="text-right">القيمة</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.entries(value as Record<string, string>).map(([k, v]) => (
                  <TableRow key={k}>
                    <TableCell className="font-medium">{k}</TableCell>
                    <TableCell>{v}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      ))}
    </div>
  );
}

function renderTypeBadge(type: string) {
  const normalized = type.trim();
  const colorMap: Record<string, string> = {
    'منتظم': 'bg-green-500',
    'غير منتظم': 'bg-amber-500',
    'فعل مساعد': 'bg-indigo-500',
  };
  const deLabel: Record<string, string> = {
    'منتظم': 'regelmäßig',
    'غير منتظم': 'unregelmäßig',
    'فعل مساعد': 'Modalverb',
  };
  const dot = colorMap[normalized] || 'bg-muted';
  const de = deLabel[normalized] || '';
  return (
    <span className={
      'inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] whitespace-nowrap border border-border bg-black/40'
    }>
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
      <span className="font-bold text-zinc-300">{type}</span>
      {de && <span className="opacity-40 text-[9px]">• {de}</span>}
    </span>
  );
}
