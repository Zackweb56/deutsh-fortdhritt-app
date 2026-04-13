import storiesRaw from './storiesData.json?raw';

export type StoryLevel = 'A1' | 'A2' | 'B1' | 'B2';

export interface StoryVocab {
  word: string;
  ar: string;
  explanation: string;
}

export interface StoryLine {
  id: string;
  de: string;
  ar: string;
  vocab: StoryVocab[];
  voiceSrc?: string;
}

export interface StoryItem {
  id: string;
  titleDe: string;
  titleAr: string;
  level: StoryLevel;
  isFree: boolean;
  lines: StoryLine[];
}

type RawStoryLevel = StoryLevel;

interface RawStoryItem {
  id: string;
  titleDe: string;
  titleAr: string;
  level: RawStoryLevel;
  isFree: boolean;
  lines: StoryLine[];
}

const toStoryItem = (raw: RawStoryItem): StoryItem => ({
  id: raw.id,
  titleDe: raw.titleDe,
  titleAr: raw.titleAr,
  level: raw.level,
  isFree: Boolean(raw.isFree),
  lines: Array.isArray(raw.lines) ? raw.lines : [],
});

const parseStoriesFromRaw = (rawText: string): RawStoryItem[] => {
  // 1) Try strict JSON first (works when file is valid JSON array).
  try {
    const parsed = JSON.parse(rawText);
    if (Array.isArray(parsed)) return parsed as RawStoryItem[];
  } catch {
    // continue to JS-style parsing fallback
  }

  // 2) Fallback for JS-style content:
  //    import ...;
  //    export const storiesData: StoryItem[] = [ ... ];
  const start = rawText.indexOf('[');
  const end = rawText.lastIndexOf(']');
  if (start === -1 || end === -1 || end <= start) return [];

  const arrayLiteral = rawText.slice(start, end + 1);
  try {
    // eslint-disable-next-line no-new-func
    const evaluator = new Function(`return (${arrayLiteral});`);
    const result = evaluator();
    return Array.isArray(result) ? (result as RawStoryItem[]) : [];
  } catch {
    return [];
  }
};

export const storiesData: StoryItem[] = parseStoriesFromRaw(storiesRaw).map(toStoryItem);

const twoDigits = (n: number) => String(n).padStart(2, '0');

// Voice naming convention:
// voices/<LEVEL>/<LEVEL>_s<storyIndex>_p<phraseIndex>.mp3
// Example: voices/A1/A1_s1_p05.mp3
const attachVoicePaths = (items: StoryItem[]): StoryItem[] => {
  const storyCounterByLevel: Record<StoryLevel, number> = {
    A1: 0,
    A2: 0,
    B1: 0,
    B2: 0,
  };

  return items.map((story) => {
    storyCounterByLevel[story.level] += 1;
    const storyIndex = storyCounterByLevel[story.level];
    const level = story.level;

    return {
      ...story,
      lines: story.lines.map((line, lineIdx) => ({
        ...line,
        voiceSrc: `voices/${level}/${level}_s${storyIndex}_p${twoDigits(lineIdx + 1)}.mp3`,
      })),
    };
  });
};

export const storiesDataWithVoices: StoryItem[] = attachVoicePaths(storiesData);
