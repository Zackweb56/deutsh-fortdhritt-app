import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { BookOpen, CircleCheckBig, GraduationCap, Keyboard, Lock, Timer, Volume2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import LockOverlay from '@/components/ui/lock-overlay';
import { isLimitedAccess } from '@/lib/access';
import {
  storiesDataWithVoices as storiesData,
  type StoryItem,
  type StoryLevel,
  type StoryLine,
  type StoryVocab,
} from '@/data/stories/storiesData';

type StoryView = 'library' | 'reader' | 'results';

interface StoryResults {
  linesCompleted: number;
  wordsCompleted: number;
  wpm: number;
  accuracy: number;
}

const levelOrder: StoryLevel[] = ['A1', 'A2', 'B1', 'B2'];

const getLevelBadgeVariant = (level: StoryLevel): 'default' | 'secondary' | 'destructive' | 'outline' => {
  if (level === 'A1' || level === 'A2') return 'secondary';
  if (level === 'B1') return 'outline';
  return 'default';
};

const normalizeToken = (token: string) => token.replace(/[.,!?;:()"']/g, '').toLowerCase();
const LRM = '\u200E';

const tokenizeLine = (de: string) => de.trim().split(/\s+/).filter(Boolean);

const vocabWordParts = (word: string) => word.trim().split(/\s+/).map(normalizeToken).filter(Boolean);

/** Inclusive end index, or null if no match starting at `start`. */
const matchContiguousAt = (tokens: string[], start: number, parts: string[]): number | null => {
  if (parts.length === 0 || start + parts.length > tokens.length) return null;
  for (let k = 0; k < parts.length; k++) {
    if (normalizeToken(tokens[start + k]) !== parts[k]) return null;
  }
  return start + parts.length - 1;
};

/** Ordered match (separable verbs, Perfekt brackets); token indices, one per vocab part. */
const matchScatterAt = (tokens: string[], start: number, parts: string[]): number[] | null => {
  if (parts.length === 0) return null;
  const indices: number[] = [];
  let searchFrom = start;
  for (const part of parts) {
    let found = -1;
    for (let t = searchFrom; t < tokens.length; t++) {
      if (normalizeToken(tokens[t]) === part) {
        found = t;
        break;
      }
    }
    if (found === -1) return null;
    indices.push(found);
    searchFrom = found + 1;
  }
  return indices;
};

type ResolvedVocabMatch =
  | { kind: 'range'; from: number; to: number; vocab: StoryVocab }
  | { kind: 'scatter'; indices: number[]; vocab: StoryVocab };

const findLeftmostVocabMatch = (tokens: string[], vocab: StoryVocab): ResolvedVocabMatch | null => {
  const parts = vocabWordParts(vocab.word);
  if (parts.length === 0) return null;

  for (let start = 0; start < tokens.length; start++) {
    const end = matchContiguousAt(tokens, start, parts);
    if (end !== null) return { kind: 'range', from: start, to: end, vocab };
  }

  if (parts.length >= 2) {
    for (let start = 0; start < tokens.length; start++) {
      const idxs = matchScatterAt(tokens, start, parts);
      if (!idxs) continue;
      const isContiguousRun = idxs[idxs.length - 1] - idxs[0] === idxs.length - 1;
      if (isContiguousRun) continue;
      return { kind: 'scatter', indices: idxs, vocab };
    }
  }

  return null;
};

const matchTokenCount = (m: ResolvedVocabMatch): number =>
  m.kind === 'range' ? m.to - m.from + 1 : m.indices.length;

const matchCoversIndex = (m: ResolvedVocabMatch, i: number): boolean =>
  m.kind === 'range' ? i >= m.from && i <= m.to : m.indices.includes(i);

const popoverInner = (vocabItem: StoryVocab) => (
  <div className="space-y-1">
    <p className="font-semibold text-sm sm:text-base" dir="ltr">
      {vocabItem.word}
    </p>
    <p className="text-xs sm:text-sm" dir="rtl">
      {vocabItem.ar}
    </p>
    {vocabItem.explanation?.trim() ? (
      <p className="text-xs text-muted-foreground" dir="rtl">
        {vocabItem.explanation}
      </p>
    ) : null}
  </div>
);

const vocabTriggerButton = (vocabItem: StoryVocab, label: string, key: string) => (
  <Popover key={key}>
    <PopoverTrigger asChild>
      <button
        type="button"
        className="underline decoration-primary/80 decoration-2 underline-offset-4 hover:text-primary transition-colors"
        title={`${vocabItem.word}: ${vocabItem.ar}`}
      >
        {label}
      </button>
    </PopoverTrigger>
    <PopoverContent className="w-64 sm:w-72" align="start">
      {popoverInner(vocabItem)}
    </PopoverContent>
  </Popover>
);

const countWords = (text: string) => text.trim().split(/\s+/).filter(Boolean).length;

// Helper to get audio URL with fallback
const getAudioUrl = (src: string, useFallback = false) => {
  if (useFallback) {
    return `/src/data/stories/${src}`;
  }
  return `/${src}`;
};

// Preload audio with priority
const preloadAudioFast = (url: string): Promise<HTMLAudioElement> => {
  return new Promise((resolve, reject) => {
    const audio = new Audio();
    audio.preload = 'auto';
    
    const timeout = setTimeout(() => {
      reject(new Error(`Timeout loading audio: ${url}`));
    }, 3000);
    
    audio.addEventListener('canplaythrough', () => {
      clearTimeout(timeout);
      resolve(audio);
    }, { once: true });
    
    audio.addEventListener('error', () => {
      clearTimeout(timeout);
      reject(new Error(`Failed to load audio: ${url}`));
    }, { once: true });
    
    audio.src = url;
    audio.load();
  });
};

const StoryLibraryTab = () => {
  const [view, setView] = useState<StoryView>('library');
  const [selectedLevel, setSelectedLevel] = useState<'all' | StoryLevel>('A1');
  const [selectedStoryId, setSelectedStoryId] = useState<string | null>(null);
  const [lineIndex, setLineIndex] = useState(0);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [result, setResult] = useState<StoryResults | null>(null);
  const [typedValue, setTypedValue] = useState('');
  const [lastWrongKey, setLastWrongKey] = useState<string | null>(null);
  const [errorCount, setErrorCount] = useState(0);
  const [lineCompleted, setLineCompleted] = useState(false);
  const typingInputRef = useRef<HTMLInputElement>(null);
  const activeAudioRef = useRef<HTMLAudioElement | null>(null);
  const audioCacheRef = useRef<Map<string, HTMLAudioElement>>(new Map());
  const preloadQueueRef = useRef<Set<string>>(new Set());
  const containerRef = useRef<HTMLDivElement>(null);
  const [cursorStyle, setCursorStyle] = useState({ left: 0, top: 0, width: 0, height: 0 });

  const limited = isLimitedAccess();

  const filteredStories = useMemo(() => {
    if (selectedLevel === 'all') {
      return [...storiesData].sort((a, b) => levelOrder.indexOf(a.level) - levelOrder.indexOf(b.level));
    }
    return storiesData.filter((s) => s.level === selectedLevel);
  }, [selectedLevel]);
  
  const levelCounts = useMemo(
    () =>
      levelOrder.reduce<Record<StoryLevel, number>>((acc, level) => {
        acc[level] = storiesData.filter((story) => story.level === level).length;
        return acc;
      }, { A1: 0, A2: 0, B1: 0, B2: 0 }),
    []
  );

  const selectedStory = useMemo(
    () => storiesData.find((story) => story.id === selectedStoryId) || null,
    [selectedStoryId]
  );

  const currentLine = selectedStory?.lines[lineIndex] || null;

  const isStoryLocked = (story: StoryItem) => limited && !story.isFree;

  // Preload audio with caching and fallback
  const preloadAudioWithFallback = useCallback(async (src: string): Promise<HTMLAudioElement> => {
    const primaryUrl = getAudioUrl(src, false);
    const fallbackUrl = getAudioUrl(src, true);
    
    // Check cache first
    if (audioCacheRef.current.has(primaryUrl)) {
      return audioCacheRef.current.get(primaryUrl)!;
    }
    
    // Check if already in preload queue
    if (preloadQueueRef.current.has(primaryUrl)) {
      return new Promise((resolve) => {
        const checkInterval = setInterval(() => {
          const cached = audioCacheRef.current.get(primaryUrl);
          if (cached) {
            clearInterval(checkInterval);
            resolve(cached);
          }
        }, 50);
      });
    }
    
    preloadQueueRef.current.add(primaryUrl);
    
    try {
      // Try primary URL first
      const audio = await preloadAudioFast(primaryUrl);
      audioCacheRef.current.set(primaryUrl, audio);
      preloadQueueRef.current.delete(primaryUrl);
      return audio;
    } catch (error) {
      console.warn(`Primary audio failed for ${src}, trying fallback`);
      try {
        // Try fallback URL
        const fallbackAudio = await preloadAudioFast(fallbackUrl);
        audioCacheRef.current.set(primaryUrl, fallbackAudio);
        preloadQueueRef.current.delete(primaryUrl);
        return fallbackAudio;
      } catch (fallbackError) {
        console.error(`Both audio sources failed for ${src}`);
        preloadQueueRef.current.delete(primaryUrl);
        throw fallbackError;
      }
    }
  }, []);

  // Play line voice instantly from cache
  const playLineVoice = useCallback(async (line: StoryLine | null) => {
    if (!line?.voiceSrc) return;

    // Stop current audio
    if (activeAudioRef.current) {
      activeAudioRef.current.pause();
      activeAudioRef.current.currentTime = 0;
      activeAudioRef.current = null;
    }

    try {
      const audio = await preloadAudioWithFallback(line.voiceSrc);
      activeAudioRef.current = audio;
      audio.currentTime = 0;
      await audio.play();
    } catch (error) {
      console.error('Failed to play line voice:', error);
    }
  }, [preloadAudioWithFallback]);

  // Play completion sound instantly
  const playPhraseCompleteSfx = useCallback(async () => {
    const sfxSrc = 'voices/story_phrase_complete.mp3';
    try {
      const sfx = await preloadAudioWithFallback(sfxSrc);
      sfx.currentTime = 0;
      await sfx.play();
    } catch (error) {
      console.error('Failed to play completion sound:', error);
    }
  }, [preloadAudioWithFallback]);

  // Preload all story audio in parallel
  const preloadStoryAudio = useCallback(async (story: StoryItem) => {
    const preloadPromises: Promise<any>[] = [];
    
    // Preload all line voices
    for (const line of story.lines) {
      if (line.voiceSrc) {
        preloadPromises.push(
          preloadAudioWithFallback(line.voiceSrc).catch(error => 
            console.warn(`Failed to preload ${line.voiceSrc}:`, error)
          )
        );
      }
    }
    
    // Preload completion sound
    preloadPromises.push(
      preloadAudioWithFallback('voices/story_phrase_complete.mp3').catch(error =>
        console.warn('Failed to preload completion sound:', error)
      )
    );
    
    await Promise.allSettled(preloadPromises);
  }, [preloadAudioWithFallback]);

  const startStory = useCallback((story: StoryItem) => {
    if (isStoryLocked(story)) return;
    
    setSelectedStoryId(story.id);
    setView('reader');
    setLineIndex(0);
    setStartedAt(Date.now());
    setResult(null);
    setTypedValue('');
    setLastWrongKey(null);
    setErrorCount(0);
    setLineCompleted(false);
    
    // Start preloading immediately
    preloadStoryAudio(story);
  }, [isStoryLocked, preloadStoryAudio]);

  useEffect(() => {
    if (view === 'reader') {
      const timer = window.setTimeout(() => typingInputRef.current?.focus(), 50);
      return () => window.clearTimeout(timer);
    }
  }, [view, lineIndex]);

  // Play voice for current line
  useEffect(() => {
    if (view !== 'reader' || !currentLine) return;
    
    const timer = setTimeout(() => {
      playLineVoice(currentLine);
    }, 50);
    
    return () => {
      clearTimeout(timer);
      if (activeAudioRef.current) {
        activeAudioRef.current.pause();
        activeAudioRef.current = null;
      }
    };
  }, [view, lineIndex, currentLine, playLineVoice]);

  // Preload next line proactively
  useEffect(() => {
    if (!selectedStory || view !== 'reader') return;
    
    const nextLineIndex = lineIndex + 1;
    if (nextLineIndex < selectedStory.lines.length) {
      const nextLine = selectedStory.lines[nextLineIndex];
      if (nextLine?.voiceSrc) {
        preloadAudioWithFallback(nextLine.voiceSrc).catch(console.warn);
      }
    }
  }, [lineIndex, selectedStory, view, preloadAudioWithFallback]);

  // Update cursor position based on typed characters - handles line wrapping
  useEffect(() => {
    if (!containerRef.current || lineCompleted) return;

    const updateCursorPosition = () => {
      const container = containerRef.current;
      if (!container) return;

      const typedChars = typedValue.length;
      const targetText = currentLine?.de || '';
      
      // Find the span element containing the current character
      const charSpans = container.querySelectorAll('[data-char-index]');
      const currentCharSpan = Array.from(charSpans).find(
        (span) => span.getAttribute('data-char-index') === String(typedChars)
      );

      if (currentCharSpan) {
        const rect = currentCharSpan.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        
        // Calculate position relative to container
        let left = rect.left - containerRect.left;
        let top = rect.bottom - containerRect.top;
        
        // Get the computed styles to find actual font metrics
        const computedStyle = window.getComputedStyle(currentCharSpan);
        const fontSize = parseFloat(computedStyle.fontSize);
        const lineHeight = parseFloat(computedStyle.lineHeight);
        const textDecorationThickness = 2; // pixels for underline
        
        // Position the underline just below the character with minimal gap
        // Use bottom of character + small offset
        setCursorStyle({
          left: left,
          top: top + 2, // Small gap under the character
          width: Math.max(rect.width, 2),
          height: textDecorationThickness,
        });
      } else if (typedChars === targetText.length && !lineCompleted) {
        // End of line - position after last character
        const lastCharSpan = Array.from(charSpans).pop();
        if (lastCharSpan) {
          const rect = lastCharSpan.getBoundingClientRect();
          const containerRect = container.getBoundingClientRect();
          setCursorStyle({
            left: rect.right - containerRect.left,
            top: rect.bottom - containerRect.top + 2,
            width: 3,
            height: 2,
          });
        }
      }
    };

    // Use requestAnimationFrame for smoother updates
    const rafId = requestAnimationFrame(updateCursorPosition);
    updateCursorPosition();
    
    window.addEventListener('resize', updateCursorPosition);
    // Also update on scroll
    window.addEventListener('scroll', updateCursorPosition);
    
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', updateCursorPosition);
      window.removeEventListener('scroll', updateCursorPosition);
    };
  }, [typedValue, currentLine, lineCompleted]);

  const finishStory = () => {
    if (!selectedStory || !startedAt) return;
    const linesCompleted = selectedStory.lines.length;
    const wordsCompleted = selectedStory.lines.reduce((acc, line) => acc + countWords(line.de), 0);
    const minutes = Math.max((Date.now() - startedAt) / 60000, 1 / 60);
    const wpm = Math.round(wordsCompleted / minutes);

    const totalTypedChars = selectedStory.lines.reduce((acc, line) => acc + line.de.length, 0);
    const accuracy =
      totalTypedChars > 0 ? Math.max(0, Math.round(((totalTypedChars - errorCount) / totalTypedChars) * 100)) : 100;

    setResult({
      linesCompleted,
      wordsCompleted,
      wpm,
      accuracy,
    });
    setView('results');
  };

  const moveToNextLine = () => {
    if (!selectedStory) return;
    if (lineIndex >= selectedStory.lines.length - 1) {
      finishStory();
      return;
    }
    setLineIndex((prev) => prev + 1);
    setTypedValue('');
    setLastWrongKey(null);
    setLineCompleted(false);
  };

  const handleLineCompleted = useCallback(() => {
    if (!selectedStory || lineCompleted) return;

    const isLastLine = lineIndex >= selectedStory.lines.length - 1;
    setLineCompleted(true);

    // Play completion SFX only between phrases, not when story fully finishes.
    if (!isLastLine) {
      playPhraseCompleteSfx();
    }

    window.setTimeout(() => moveToNextLine(), 80);
  }, [selectedStory, lineIndex, lineCompleted, playPhraseCompleteSfx]);

  const handleTypeKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (!currentLine || lineCompleted) return;

    const expected = currentLine.de;

    if (event.key === 'Tab') return;

    if (event.key === 'Backspace') {
      event.preventDefault();
      setTypedValue((prev) => prev.slice(0, -1));
      setLastWrongKey(null);
      return;
    }

    if (event.key === ' ') {
      event.preventDefault();
      const expectedChar = expected[typedValue.length];
      if (expectedChar === ' ') {
        const nextValue = typedValue + ' ';
        setTypedValue(nextValue);
        setLastWrongKey(null);
        if (nextValue === expected) {
          handleLineCompleted();
        }
      } else {
        setErrorCount((prev) => prev + 1);
        setLastWrongKey('space');
        setTimeout(() => setLastWrongKey(null), 400);
      }
      return;
    }

    if (event.key.length !== 1) {
      event.preventDefault();
      return;
    }

    event.preventDefault();
    const expectedChar = expected[typedValue.length];

    if (event.key === expectedChar) {
      const nextValue = typedValue + event.key;
      setTypedValue(nextValue);
      setLastWrongKey(null);

      if (nextValue === expected) {
        handleLineCompleted();
      }
      return;
    }

    setErrorCount((prev) => prev + 1);
    setLastWrongKey(event.key);
    setTimeout(() => setLastWrongKey(null), 400);
  };

  const continueToNextStory = () => {
    if (!selectedStory) {
      setView('library');
      return;
    }

    const currentIndex = storiesData.findIndex((story) => story.id === selectedStory.id);
    const nextStory = storiesData[currentIndex + 1];

    if (!nextStory || isStoryLocked(nextStory)) {
      setView('library');
      return;
    }

    startStory(nextStory);
  };

  const renderLineWithVocab = (line: StoryLine) => {
    const tokens = tokenizeLine(line.de);
    const candidates: ResolvedVocabMatch[] = [];

    for (const v of line.vocab) {
      const found = findLeftmostVocabMatch(tokens, v);
      if (found) candidates.push(found);
    }

    candidates.sort((a, b) => matchTokenCount(b) - matchTokenCount(a));

    const chosen: ResolvedVocabMatch[] = [];
    for (const c of candidates) {
      const used = chosen.some((prev) => {
        if (c.kind === 'range') {
          for (let i = c.from; i <= c.to; i++) if (matchCoversIndex(prev, i)) return true;
        } else {
          for (const i of c.indices) if (matchCoversIndex(prev, i)) return true;
        }
        return false;
      });
      if (!used) chosen.push(c);
    }

    const ownerAt = (idx: number): ResolvedVocabMatch | null => {
      for (const m of chosen) {
        if (matchCoversIndex(m, idx)) return m;
      }
      return null;
    };

    const elements: React.ReactNode[] = [];
    let i = 0;

    while (i < tokens.length) {
      const owner = ownerAt(i);

      if (!owner) {
        elements.push(
          <span key={`plain-${i}`}>
            {tokens[i]}{' '}
          </span>
        );
        i += 1;
        continue;
      }

      if (owner.kind === 'range') {
        if (owner.from === i) {
          const phrase = tokens.slice(owner.from, owner.to + 1).join(' ');
          elements.push(
            <span key={`range-${owner.from}-${owner.to}`}>
              {vocabTriggerButton(owner.vocab, phrase, `range-${owner.from}`)}{' '}
            </span>
          );
          i = owner.to + 1;
        } else {
          elements.push(
            <span key={`plain-inrange-${i}`}>
              {tokens[i]}{' '}
            </span>
          );
          i += 1;
        }
        continue;
      }

      if (owner.indices.includes(i)) {
        elements.push(
          <span key={`sc-${owner.vocab.word}-${i}`}>
            {vocabTriggerButton(owner.vocab, tokens[i], `sc-${i}`)}{' '}
          </span>
        );
        i += 1;
        continue;
      }

      elements.push(
        <span key={`plain-fallback-${i}`}>
          {tokens[i]}{' '}
        </span>
      );
      i += 1;
    }

    return (
      <p
        className="text-base sm:text-xl md:text-2xl lg:text-3xl font-semibold leading-relaxed tracking-tight text-foreground"
        dir="ltr"
        style={{ direction: 'ltr', unicodeBidi: 'isolate' }}
      >
        {elements}
      </p>
    );
  };

  const renderTypingProgress = (target: string) => {
    const typedChars = typedValue.length;
    const isSpaceError = lastWrongKey === 'space';
    
    return (
      <div 
        ref={containerRef}
        className="relative w-full overflow-x-auto"
        style={{ direction: 'ltr', unicodeBidi: 'isolate' }}
      >
        <div className="relative inline-block min-w-full">
          <p className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-[1.4] sm:leading-[1.3] tracking-tight font-mono whitespace-pre-wrap break-words">
            <span aria-hidden>{LRM}</span>
            {target.split('').map((char, idx) => {
              const isTyped = idx < typedChars;
              const isCurrent = idx === typedChars && !lineCompleted;
              const isWrong = lastWrongKey && isCurrent && !isSpaceError;
              const isSpace = char === ' ';
              
              let charDisplay = char;
              let charClass = 'transition-all duration-150 inline-block';
              
              if (isTyped) {
                if (isSpace) {
                  charDisplay = '·';
                  charClass += ' text-emerald-400/70';
                } else {
                  charClass += ' text-emerald-400';
                }
              } else if (isCurrent) {
                if (isSpace) {
                  charDisplay = '_';
                  charClass += isSpaceError ? ' text-amber-500' : ' text-amber-400';
                  charClass += ' font-bold transform scale-110';
                } else {
                  charClass += isWrong ? ' text-rose-500' : ' text-sky-400';
                  charClass += ' font-bold transform scale-110';
                }
              } else {
                if (isSpace) {
                  charDisplay = ' ';
                  charClass += ' text-foreground/20';
                } else {
                  charClass += ' text-foreground/25';
                }
              }
              
              return (
                <span
                  key={idx}
                  data-char-index={idx}
                  className={charClass}
                  style={{
                    display: 'inline-block',
                    transform: isCurrent ? 'scale(1.05)' : 'scale(1)',
                  }}
                >
                  {charDisplay}
                </span>
              );
            })}
            <span aria-hidden>{LRM}</span>
          </p>
          
          {/* Premium moving underline cursor - now positioned exactly under the character */}
          {!lineCompleted && cursorStyle.width > 0 && (
            <div
              className="absolute rounded-full transition-all duration-150 ease-out"
              style={{
                position: 'absolute',
                left: `${cursorStyle.left}px`,
                top: `${cursorStyle.top}px`,
                width: `${cursorStyle.width}px`,
                height: `${cursorStyle.height}px`,
                background: 'linear-gradient(90deg, #38bdf8, #7dd3fc)',
                borderRadius: '2px',
              }}
            >
            </div>
          )}
        </div>
      </div>
    );
  };

  if (view === 'reader' && selectedStory && currentLine) {
    const completedLines = Math.min(selectedStory.lines.length, lineIndex + (lineCompleted ? 1 : 0));
    const progressPercent =
      selectedStory.lines.length > 0 ? (completedLines / selectedStory.lines.length) * 100 : 0;

    return (
      <div className="min-h-[80vh] sm:min-h-[72vh] flex flex-col">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs sm:text-sm text-muted-foreground px-2 sm:px-4 py-2 sm:py-3">
          <div className="inline-flex items-center gap-2">
            <BookOpen className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="truncate max-w-[200px] sm:max-w-none">{selectedStory.titleDe}</span>
          </div>
          <div className="inline-flex items-center gap-2">
            <span className="text-xs sm:text-sm">{lineIndex + 1}/{selectedStory.lines.length}</span>
            <Badge variant={getLevelBadgeVariant(selectedStory.level)} className="text-xs">{selectedStory.level}</Badge>
          </div>
        </div>
        <div className="px-2 sm:px-4 pb-2">
          <div className="flex items-center justify-between text-[10px] sm:text-xs text-muted-foreground mb-1.5">
            <span>تقدم القصة</span>
            <span>{completedLines}/{selectedStory.lines.length}</span>
          </div>
          <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-yellow-500 transition-all duration-500 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        <Card className="flex-1 bg-background border-border/60">
          <div className="h-full flex flex-col items-center justify-center text-center px-3 sm:px-6 md:px-12 lg:px-20 py-4 sm:py-8">
            <div className="w-full max-w-5xl space-y-4 sm:space-y-6 md:space-y-8 lg:space-y-10">
              <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-0.5 sm:gap-1">
                  <Keyboard className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">تمرين الكتابة: اكتب الجملة حرفا بحرف</span>
                  <span className="sm:hidden">تمرين كتابة حرفا بحرف</span>
                </span>
                <span>•</span>
                <span>المسافة <span className="text-amber-400">_</span></span>
                <span>•</span>
                <span>الخطأ <span className="text-rose-500">أحمر</span></span>
                <span>•</span>
                <button
                  type="button"
                  onClick={() => playLineVoice(currentLine)}
                  className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
                >
                  <Volume2 className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span>تشغيل الصوت</span>
                </button>
              </div>

              <div className="text-left overflow-x-auto pb-2">
                {renderLineWithVocab(currentLine)}
              </div>
              
              <div dir="ltr" className="text-left w-full">
                {renderTypingProgress(currentLine.de)}
              </div>

              <p className="text-base sm:text-xl md:text-2xl lg:text-3xl text-muted-foreground leading-relaxed" dir="rtl">
                {currentLine.ar}
              </p>

              <div className="h-6 sm:h-8 text-[10px] sm:text-xs text-left" dir="ltr">
                {lastWrongKey === 'space' ? (
                  <span className="text-amber-500">
                    ⚠️ نسيت المسافة!
                  </span>
                ) : lastWrongKey ? (
                  <span className="text-rose-500">
                    ❌ خطأ: "{lastWrongKey}" → "{currentLine.de[typedValue.length] || ''}"
                  </span>
                ) : (
                  <span className="text-muted-foreground">
                    ✓ {typedValue.length}/{currentLine.de.length}
                  </span>
                )}
              </div>

              <input
                ref={typingInputRef}
                className="sr-only"
                value={typedValue}
                onChange={() => undefined}
                onKeyDown={handleTypeKeyDown}
                autoFocus
                aria-label="حقل الكتابة"
                dir="ltr"
                inputMode="text"
                autoComplete="off"
              />
              
              {/* Mobile touch keyboard hint */}
              <div className="block sm:hidden text-[10px] text-muted-foreground">
                اضغط هنا للكتابة
              </div>
            </div>
          </div>
          <div className="px-3 sm:px-6 pb-4 sm:pb-6 flex flex-col sm:flex-row gap-2 sm:gap-3 sm:justify-between w-full">
            <Button variant="outline" size="sm" className="sm:size-default" onClick={() => setView('library')}>
              العودة
            </Button>
            <Button size="sm" className="sm:size-default" onClick={() => typingInputRef.current?.focus()}>
              تركيز
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (view === 'results' && selectedStory && result) {
    return (
      <div className="max-w-3xl mx-auto px-3 sm:px-4 space-y-4 sm:space-y-6">
        <Card className="p-4 sm:p-6 md:p-8 text-center space-y-6 sm:space-y-8">
          <Badge className="mx-auto w-fit text-xs sm:text-sm">اكتملت القصة</Badge>

          <div className="grid grid-cols-2 gap-4 sm:gap-6">
            <div>
              <p className="text-3xl sm:text-4xl font-bold">{result.wpm}</p>
              <p className="text-[10px] sm:text-xs text-muted-foreground tracking-wide">كلمة/دقيقة</p>
            </div>
            <div>
              <p className="text-3xl sm:text-4xl font-bold">{result.accuracy}%</p>
              <p className="text-[10px] sm:text-xs text-muted-foreground tracking-wide">الدقة</p>
            </div>
          </div>

          <div className="border-t border-border pt-4 sm:pt-6 grid grid-cols-2 gap-4 sm:gap-6">
            <div>
              <p className="text-2xl sm:text-3xl font-bold">{result.linesCompleted}</p>
              <p className="text-xs sm:text-sm text-muted-foreground">الأسطر</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-bold">{result.wordsCompleted}</p>
              <p className="text-xs sm:text-sm text-muted-foreground">الكلمات</p>
            </div>
          </div>

          <Button className="w-full sm:w-auto sm:px-10" onClick={continueToNextStory}>
            التالي
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-0">
      <Card className="p-4 sm:p-6 bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 sm:h-11 sm:w-11 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg sm:text-2xl font-bold">مكتبة القصص</h2>
              <p className="text-xs sm:text-sm text-muted-foreground">
                تمارين قصص ألمانية: كتابة الجملة حرفا بحرف ضمن رحلة التعلم
              </p>
            </div>
          </div>
          <div className="text-[10px] sm:text-xs text-muted-foreground flex items-center gap-2">
            <Lock className="h-3 w-3 sm:h-4 sm:w-4" />
            {limited ? 'مجاني: قصص تجريبية' : 'مدفوع: جميع القصص'}
          </div>
        </div>
      </Card>

      <Card className="p-3 sm:p-4 overflow-x-auto">
        <div className="flex flex-nowrap sm:flex-wrap gap-1.5 sm:gap-2 min-w-max sm:min-w-0">
          <Button
            variant={selectedLevel === 'all' ? 'default' : 'outline'}
            size="sm"
            className="text-xs sm:text-sm flex items-center gap-2"
            onClick={() => setSelectedLevel('all')}
          >
            <BookOpen className="h-4 w-4" />
            الكل
            <Badge variant="secondary" className="ml-1">
              {storiesData.length}
            </Badge>
          </Button>
          {levelOrder.map((level) => (
            <Button
              key={level}
              variant={selectedLevel === level ? 'default' : 'outline'}
              size="sm"
              className="text-xs sm:text-sm flex items-center gap-2"
              onClick={() => setSelectedLevel(level)}
            >
              <GraduationCap className="h-4 w-4" />
              {level}
              <Badge variant="secondary" className="ml-1">
                {levelCounts[level]}
              </Badge>
            </Button>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {filteredStories.map((story) => {
          const locked = isStoryLocked(story);
          const wordCount = story.lines.reduce((acc, line) => acc + countWords(line.de), 0);
          const content = (
            <Card
              className="p-3 sm:p-5 h-full cursor-pointer border-border/70 hover:border-primary/40 transition-colors"
              onClick={() => startStory(story)}
            >
              <div className="flex items-start justify-between gap-2 mb-2 sm:mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm sm:text-base md:text-lg font-semibold truncate">{story.titleDe}</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground truncate">{story.titleAr}</p>
                </div>
                <div className="flex flex-col items-end gap-1 sm:gap-2 flex-shrink-0">
                  {story.isFree ? <Badge variant="secondary" className="text-[10px] sm:text-xs">مجاني</Badge> : <Badge variant="outline" className="text-[10px] sm:text-xs">مدفوع</Badge>}
                  <Badge variant={getLevelBadgeVariant(story.level)} className="text-[10px] sm:text-xs">{story.level}</Badge>
                </div>
              </div>

              <div className="flex items-center gap-3 sm:gap-4 text-[10px] sm:text-xs text-muted-foreground mt-3 sm:mt-6">
                <span className="inline-flex items-center gap-1">
                  <CircleCheckBig className="h-3 w-3 sm:h-3.5 sm:w-3.5" /> {story.lines.length} سطر
                </span>
                <span className="inline-flex items-center gap-1">
                  <Timer className="h-3 w-3 sm:h-3.5 sm:w-3.5" /> {wordCount} كلمة
                </span>
              </div>
            </Card>
          );

          if (!locked) return <div key={story.id}>{content}</div>;

          return (
            <div key={story.id}>
              <LockOverlay isLocked message="هذه القصة متاحة في النسخة المدفوعة فقط.">
                {content}
              </LockOverlay>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StoryLibraryTab;