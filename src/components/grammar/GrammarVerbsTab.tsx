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

type VerbItem = {
  verb: string;
  meaning: string;
  type: string;
  tenses?: {
    Präsens?: PresentConjugation;
    Perfekt?: PerfektInfo;
  };
  examples?: { de: string; ar: string; pron?: string }[];
};

type GrammarTopic = {
  title: string;
  explanation?: string;
  table?: Record<string, Record<string, string>> | Record<string, string>;
  examples?: { de: string; ar: string; pron?: string }[];
};

function highlightVerbText(v: { verb: string; tenses?: { Präsens?: PresentConjugation; Perfekt?: { participle?: string } } }, text: string) {
  if (!text) return text as unknown as any;
  const forms = new Set<string>();
  forms.add(v.verb);
  const pr = v.tenses?.Präsens;
  if (pr) {
    Object.values(pr).forEach(f => f && forms.add(f));
  }
  const part = v.tenses?.Perfekt?.participle;
  if (part) forms.add(part);

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

export const GrammarVerbsTab = () => {
  type LevelKey = 'A1' | 'A2';
  const dataByLevel = useMemo(() => ({
    A1: (a1Data as any)?.A1 as { grammar?: GrammarTopic[]; verbs?: VerbItem[] },
    A2: (a2Data as any)?.A2 as { grammar?: GrammarTopic[]; verbs?: VerbItem[] },
  }), []);

  const [level, setLevel] = useState<LevelKey>('A1');

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'grammar' | 'verbs'>('grammar');

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
    <div className="space-y-6">
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
        <TabsList className="w-full sm:w-auto">
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

                  {/* Render table data if present */}
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

        <TabsContent value="verbs" className="space-y-4">
          <Card className="p-4">
            <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="ابحث عن فعل أو معنى أو مثال..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
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

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredVerbs.map((v, idx) => (
              <Card key={idx} className="p-4 flex flex-col gap-3">
                <LockOverlay isLocked={isLimitedAccess()} message="الأفعال محجوبة — تواصل عبر واتساب لفتح الوصول الكامل">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-xl font-bold text-accent">{v.verb}</div>
                    <div className="text-sm text-muted-foreground">{v.meaning}</div>
                  </div>
                  {renderTypeBadge(v.type)}
                </div>

                {/* Präsens table */}
                {v.tenses?.Präsens && (
                  <div>
                    <div className="text-sm font-medium mb-2">التصريف في المضارع (Präsens)</div>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-right">الصيغة</TableHead>
                          <TableHead className="text-right">الضمير</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {renderPresentRows(v.tenses.Präsens)}
                      </TableBody>
                    </Table>
                  </div>
                )}

                {/* Perfekt info */}
                {v.tenses?.Perfekt && (
                  <div className="space-y-2">
                    <div className="text-sm font-medium">الماضي التام (Perfekt)</div>
                    <div className="text-sm text-muted-foreground">
                      {v.tenses.Perfekt.auxiliary && (
                        <span className="mr-2">الفعل المساعد: <span className="font-medium">{v.tenses.Perfekt.auxiliary}</span></span>
                      )}
                      {v.tenses.Perfekt.participle && (
                        <span>اسم المفعول: <span className="font-medium">{v.tenses.Perfekt.participle}</span></span>
                      )}
                    </div>
                    {v.tenses.Perfekt.example && (
                      <div className="p-2 rounded border border-border">
                        <div className="font-medium">{highlightVerbText(v, v.tenses.Perfekt.example.de)}</div>
                        <div className="text-sm text-muted-foreground">{v.tenses.Perfekt.example.ar}</div>
                        {v.tenses.Perfekt.example.pron && (
                          <div className="text-xs text-muted-foreground mt-1">{v.tenses.Perfekt.example.pron}</div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Examples */}
                {Array.isArray(v.examples) && v.examples.length > 0 && (
                  <Accordion type="single" collapsible>
                    <AccordionItem value="examples">
                      <AccordionTrigger className="text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <Quote className="h-4 w-4 opacity-80" />
                          <span>أمثلة</span>
                          <span className="text-xs text-muted-foreground">({v.examples.length})</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-2">
                          {v.examples.map((ex, i) => (
                            <div key={i} className="p-2 rounded border border-border">
                              <div className="font-medium">{highlightVerbText(v, ex.de)}</div>
                              <div className="text-sm text-muted-foreground">{ex.ar}</div>
                              {ex.pron && (
                                <div className="text-xs text-muted-foreground mt-1">{ex.pron}</div>
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
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

function renderPresentRows(pr: PresentConjugation) {
  const order: (keyof PresentConjugation)[] = ['ich', 'du', 'er/sie/es', 'wir', 'ihr', 'sie/Sie'];
  return order
    .filter((k) => pr[k])
    .map((k) => (
      <TableRow key={k as string}>
        <TableCell className="text-accent font-semibold">{pr[k]}</TableCell>
        <TableCell className="font-medium">{k}</TableCell>
      </TableRow>
    ));
}

function renderFlexibleTable(table: Record<string, any>) {
  // Support nested and flat structures from the JSON
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

  // Nested: render each sub-table
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
  // Map known types to accent colors and German labels; dark pill with colored dot
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
      'inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs whitespace-nowrap border border-border bg-card/70'
    }>
      <span className={`h-2 w-2 rounded-full ${dot}`} />
      <span className="font-medium">{type}</span>
      {de && <span className="opacity-80">• {de}</span>}
    </span>
  );
}


