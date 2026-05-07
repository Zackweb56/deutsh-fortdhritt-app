export type ModuleType = 'lesen' | 'horen' | 'schreiben' | 'sprechen';

export interface ExamMeta {
  module: string;
  timeMinutes: number;
  totalRawPoints?: number;
  passingRaw?: number;
  scoringFormula: string;
  prepTimeMinutes?: number;
  examTimeMinutes?: number;
  baseAudioPath?: string;
}

export interface Option {
  value: string;
  label: string;
}

export interface Item {
  id: number | string;
  text?: string;
  author?: string;
  age?: number;
  city?: string;
  correct?: string;
  isExample?: boolean;
  options?: Option[];
}

export interface Teil {
  type: 'richtig_falsch' | 'mehrfachauswahl' | 'zuordnung' | 'ja_nein' | 'freitext' | 'zuordnung_person' | 'zuordnung_ueberschrift' | 'zuordnung_satz_luecke' | 'richtig_falsch_mehrfachauswahl' | 'essay' | 'formelle_nachricht' | 'vortrag' | 'diskussion';
  points: number;
  arbeitszeitMinutes: number;
  instructions: string;
  title?: string;
  thema?: string;
  textType?: string;
  context?: string;
  topic?: string;
  items?: Item[];
  text?: string | { 
    title: string; 
    source?: string; 
    content?: string;
    personen?: Array<{ id: string; name: string; text: string }>;
    contentWithBlanks?: string;
    options?: Array<{ id: string; text: string }>;
    paragraphen?: Array<{ id: string; title: string; content: string }>;
    ueberschriften?: Array<{ id: string; text: string }>;
    transkript?: string;
  };
  texts?: Array<{
    id: string;
    title: string;
    source?: string;
    content?: string;
    items?: Item[];
    audioFile?: string;
    q1?: Item;
    q2?: Item;
  }>;
  audioTexts?: Array<{
    id: string;
    title: string;
    audioFile?: string;
    transkript?: string;
    items: Item[];
  }>;
  ads?: Array<{ id: string; title: string; content: string; isExample?: boolean }>;
  situations?: Item[];
  example?: any;
  audioFile?: string;
  rubric?: string;
  prompt?: string;
  folienStruktur?: Array<{
    titel: string;
    punkte: string[];
  }>;
  ueberschriften?: Array<{ id: string; text: string }>;
  comments?: Array<{ id: string; author: string; text: string }>;
  plays?: number;
  minWords?: number;
  aufgabenpunkte?: string[];
  pointsToCover?: string[];
}

export interface ModuleData {
  meta: ExamMeta;
  [key: string]: any; // teil1, teil2, etc.
}

export interface VariantMetadata {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  themes: string[];
  estimatedTime: number;
  modules: Record<ModuleType, { timeMinutes: number; points: number }>;
}

export interface ExamState {
  variantId: string | null;
  currentModule: ModuleType | 'results' | 'instructions' | 'start' | null;
  targetModule: ModuleType | null;
  currentTeil: number;
  timeLeft: number;
  isTimerActive: boolean;
  answers: Record<string, any>;
  scores: Record<string, number>;
  isFinished: boolean;
  startTime: number | null;
  
  // Actions
  startExam: (variantId: string) => void;
  startModule: (module: ModuleType, timeMinutes: number) => void;
  nextTeil: () => void;
  updateAnswer: (moduleId: string, teilId: string, answer: any) => void;
  finishModule: (moduleId: string, score: number) => void;
  setTargetModule: (module: ModuleType | null) => void;
  resetExam: () => void;
  setTimeLeft: (time: number) => void;
  setIsTimerActive: (active: boolean) => void;
  tick: () => void;
}
