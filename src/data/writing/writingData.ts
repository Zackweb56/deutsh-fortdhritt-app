import writingRaw from './writingData.json?raw';

export type WritingLevel = 'A1' | 'A2' | 'B1' | 'B2';

export interface WritingVocab {
  word: string;
  ar: string;
  explanation: string;
}

export interface WritingLine {
  id: string;
  de: string;
  ar: string;
  vocab: WritingVocab[];
  voiceSrc?: string;
}

export interface WritingItem {
  id: string;
  titleDe: string;
  titleAr: string;
  level: WritingLevel;
  isFree: boolean;
  lines: WritingLine[];
}

type RawWritingLevel = WritingLevel;

interface RawWritingItem {
  id: string;
  titleDe: string;
  titleAr: string;
  level: RawWritingLevel;
  isFree: boolean;
  lines: WritingLine[];
}

const toWritingItem = (raw: RawWritingItem): WritingItem => ({
  id: raw.id,
  titleDe: raw.titleDe,
  titleAr: raw.titleAr,
  level: raw.level,
  isFree: Boolean(raw.isFree),
  lines: Array.isArray(raw.lines) ? raw.lines : [],
});

const parseWritingFromRaw = (rawText: string): RawWritingItem[] => {
  // 1) Try strict JSON first (works when file is valid JSON array).
  try {
    const parsed = JSON.parse(rawText);
    if (Array.isArray(parsed)) return parsed as RawWritingItem[];
  } catch {
    // continue to JS-style parsing fallback
  }

  // 2) Fallback for JS-style content:
  //    import ...;
  //    export const writingData: WritingItem[] = [ ... ];
  const start = rawText.indexOf('[');
  const end = rawText.lastIndexOf(']');
  if (start === -1 || end === -1 || end <= start) return [];

  const arrayLiteral = rawText.slice(start, end + 1);
  try {
     
    const evaluator = new Function(`return (${arrayLiteral});`);
    const result = evaluator();
    return Array.isArray(result) ? (result as RawWritingItem[]) : [];
  } catch {
    return [];
  }
};

export const writingData: WritingItem[] = parseWritingFromRaw(writingRaw).map(toWritingItem);

const twoDigits = (n: number) => String(n).padStart(2, '0');

// Voice naming convention:
// voices/<LEVEL>/<LEVEL>_s<writingIndex>_p<phraseIndex>.mp3
// Example: voices/A1/A1_s1_p05.mp3
const attachVoicePaths = (items: WritingItem[]): WritingItem[] => {
  const writingCounterByLevel: Record<WritingLevel, number> = {
    A1: 0,
    A2: 0,
    B1: 0,
    B2: 0,
  };

  return items.map((writing) => {
    writingCounterByLevel[writing.level] += 1;
    const writingIndex = writingCounterByLevel[writing.level];
    const level = writing.level;

    return {
      ...writing,
      lines: writing.lines.map((line, lineIdx) => ({
        ...line,
        voiceSrc: `voices/${level}/${level}_s${writingIndex}_p${twoDigits(lineIdx + 1)}.mp3`,
      })),
    };
  });
};

export const writingDataWithVoices: WritingItem[] = attachVoicePaths(writingData);
