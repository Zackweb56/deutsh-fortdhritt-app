import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { FileText, CircleCheckBig, GraduationCap, Keyboard, Lock, Timer, Volume2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import LockOverlay from '@/components/ui/lock-overlay';
import { isLimitedAccess } from '@/lib/access';
import {
  writingDataWithVoices as writingData,
  type WritingItem,
  type WritingLevel,
  type WritingLine,
  type WritingVocab,
} from '@/data/writing/writingData';

type WritingView = 'library' | 'reader' | 'results';

interface WritingResults {
  linesCompleted: number;
  wordsCompleted: number;
  wpm: number;
  accuracy: number;
}

const levelOrder: WritingLevel[] = ['A1', 'A2', 'B1', 'B2'];

const getLevelBadgeVariant = (level: WritingLevel): 'default' | 'secondary' | 'destructive' | 'outline' => {
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
  | { kind: 'range'; from: number; to: number; vocab: WritingVocab }
  | { kind: 'scatter'; indices: number[]; vocab: WritingVocab };

const findLeftmostVocabMatch = (tokens: string[], vocab: WritingVocab): ResolvedVocabMatch | null => {
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

const popoverInner = (vocabItem: WritingVocab) => (
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

const vocabTriggerButton = (vocabItem: WritingVocab, label: string, key: string) => (
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

const bundledWritingAudio = import.meta.glob('/src/data/writing/voices/**/*.mp3', {
  eager: true,
  import: 'default',
}) as Record<string, string>;

const bundledAudioByVoiceSrc = Object.entries(bundledWritingAudio).reduce<Record<string, string>>((acc, [path, url]) => {
  const marker = '/voices/';
  const markerIndex = path.indexOf(marker);
  if (markerIndex !== -1) {
    acc[path.slice(markerIndex + 1)] = url;
  }
  return acc;
}, {});

const getAudioUrls = (src: string): string[] => {
  const bundled = bundledAudioByVoiceSrc[src];
  if (bundled) return [bundled];
  // Keep runtime fallbacks for existing environments.
  return [`/${src}`, `/src/data/writing/${src}`];
};

// Preload audio with priority
const preloadAudioFast = (url: string): Promise<HTMLAudioElement> => {
  return new Promise((resolve, reject) => {
    const audio = new Audio();
    audio.preload = 'auto';
    audio.setAttribute('playsinline', 'true');
    
    const timeout = setTimeout(() => {
      reject(new Error(`Timeout loading audio: ${url}`));
    }, 8000);
    
    const onReady = () => {
      clearTimeout(timeout);
      resolve(audio);
    };

    audio.addEventListener('loadeddata', onReady, { once: true });
    audio.addEventListener('canplay', onReady, { once: true });
    
    audio.addEventListener('error', () => {
      clearTimeout(timeout);
      reject(new Error(`Failed to load audio: ${url}`));
    }, { once: true });
    
    audio.src = url;
    audio.load();
  });
};

const WritingLibraryTab = () => {
  const [view, setView] = useState<WritingView>('library');
  const [selectedLevel, setSelectedLevel] = useState<'all' | WritingLevel>('A1');
  const [selectedWritingId, setSelectedWritingId] = useState<string | null>(null);
  const [lineIndex, setLineIndex] = useState(0);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [result, setResult] = useState<WritingResults | null>(null);
  const [typedValue, setTypedValue] = useState('');
  const [lastWrongKey, setLastWrongKey] = useState<string | null>(null);
  const [errorCount, setErrorCount] = useState(0);
  const [lineCompleted, setLineCompleted] = useState(false);
  const [audioUnlocked, setAudioUnlocked] = useState(false);
  const typingInputRef = useRef<HTMLInputElement>(null);
  const activeAudioRef = useRef<HTMLAudioElement | null>(null);
  const audioCacheRef = useRef<Map<string, HTMLAudioElement>>(new Map());
  const preloadPromisesRef = useRef<Map<string, Promise<HTMLAudioElement>>>(new Map());
  const containerRef = useRef<HTMLDivElement>(null);
  const [cursorStyle, setCursorStyle] = useState({ left: 0, top: 0, width: 0, height: 0 });

  const limited = isLimitedAccess();

  const filteredWriting = useMemo(() => {
    if (selectedLevel === 'all') {
      return [...writingData].sort((a, b) => levelOrder.indexOf(a.level) - levelOrder.indexOf(b.level));
    }
    return writingData.filter((s) => s.level === selectedLevel);
  }, [selectedLevel]);
  
  const levelCounts = useMemo(
    () =>
      levelOrder.reduce<Record<WritingLevel, number>>((acc, level) => {
        acc[level] = writingData.filter((writing) => writing.level === level).length;
        return acc;
      }, { A1: 0, A2: 0, B1: 0, B2: 0 }),
    []
  );

  const selectedWriting = useMemo(
    () => writingData.find((writing) => writing.id === selectedWritingId) || null,
    [selectedWritingId]
  );

  const currentLine = selectedWriting?.lines[lineIndex] || null;

  const isWritingLocked = (writing: WritingItem) => limited && !writing.isFree;

  // Preload audio with caching and fallback
  const preloadAudioWithFallback = useCallback(async (src: string): Promise<HTMLAudioElement> => {
    const cached = audioCacheRef.current.get(src);
    if (cached) return cached;

    const inFlight = preloadPromisesRef.current.get(src);
    if (inFlight) return inFlight;

    const loadPromise = (async () => {
      const candidateUrls = getAudioUrls(src);
      let lastError: unknown = null;

      for (const url of candidateUrls) {
        try {
          const audio = await preloadAudioFast(url);
          audioCacheRef.current.set(src, audio);
          return audio;
        } catch (error) {
          lastError = error;
          console.warn(`Audio load failed for ${url}`, error);
        }
      }

      throw lastError ?? new Error(`No playable source found for ${src}`);
    })();

    preloadPromisesRef.current.set(src, loadPromise);
    try {
      return await loadPromise;
    } finally {
      preloadPromisesRef.current.delete(src);
    }
  }, []);

  // Play line voice instantly from cache
  const playLineVoice = useCallback(async (line: WritingLine | null) => {
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
      audio.volume = 1;
      // Add playsinline for mobile
      audio.setAttribute('playsinline', 'true');
      await audio.play();
    } catch (error) {
      console.error('Failed to play line voice:', error);
      // Retry with user interaction
      const retryPlay = () => {
        if (activeAudioRef.current) {
          activeAudioRef.current.play().catch(() => {});
        }
        window.removeEventListener('click', retryPlay);
        window.removeEventListener('touchstart', retryPlay);
      };
      window.addEventListener('click', retryPlay, { once: true });
      window.addEventListener('touchstart', retryPlay, { once: true });
    }
  }, [preloadAudioWithFallback]);

  // Play completion sound instantly
  const playPhraseCompleteSfx = useCallback(async () => {
    const sfxSrc = 'voices/writing_phrase_complete.mp3';
    try {
      const sfx = await preloadAudioWithFallback(sfxSrc);
      sfx.currentTime = 0;
      sfx.volume = 1;
      sfx.setAttribute('playsinline', 'true');
      await sfx.play();
    } catch (error) {
      console.error('Failed to play completion sound:', error);
      // Retry with user interaction
      const retryPlay = () => {
        playPhraseCompleteSfx();
        window.removeEventListener('click', retryPlay);
        window.removeEventListener('touchstart', retryPlay);
      };
      window.addEventListener('click', retryPlay, { once: true });
      window.addEventListener('touchstart', retryPlay, { once: true });
    }
  }, [preloadAudioWithFallback]);

  // Preload all writing audio in parallel
  const preloadWritingAudio = useCallback(async (writing: WritingItem) => {
    const preloadPromises: Promise<any>[] = [];
    
    // Preload all line voices
    for (const line of writing.lines) {
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
      preloadAudioWithFallback('voices/writing_phrase_complete.mp3').catch(error =>
        console.warn('Failed to preload completion sound:', error)
      )
    );
    
    await Promise.allSettled(preloadPromises);
  }, [preloadAudioWithFallback]);

  const startWriting = useCallback((writing: WritingItem) => {
    if (isWritingLocked(writing)) return;
    
    setSelectedWritingId(writing.id);
    setView('reader');
    setLineIndex(0);
    setStartedAt(Date.now());
    setResult(null);
    setTypedValue('');
    setLastWrongKey(null);
    setErrorCount(0);
    setLineCompleted(false);
    
    // Start preloading immediately
    preloadWritingAudio(writing);
  }, [isWritingLocked, preloadWritingAudio]);

  useEffect(() => {
    if (view === 'reader') {
      const timer = window.setTimeout(() => typingInputRef.current?.focus(), 50);
      return () => window.clearTimeout(timer);
    }
  }, [view, lineIndex]);

  // Mobile browsers block autoplay until first user interaction
  useEffect(() => {
    const unlock = () => {
      setAudioUnlocked(true);
      // Create and play silent audio to unlock audio context
      const silentAudio = new Audio();
      silentAudio.volume = 0;
      silentAudio.play().catch(() => {});
    };
    
    window.addEventListener('click', unlock, { once: true });
    window.addEventListener('pointerdown', unlock, { once: true });
    window.addEventListener('keydown', unlock, { once: true });
    window.addEventListener('touchstart', unlock, { once: true });
    
    return () => {
      window.removeEventListener('click', unlock);
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
      window.removeEventListener('touchstart', unlock);
    };
  }, []);

  // Play voice for current line
  useEffect(() => {
    if (view !== 'reader' || !currentLine || !audioUnlocked) return;
    
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
  }, [view, lineIndex, currentLine, playLineVoice, audioUnlocked]);

  // Preload next line proactively
  useEffect(() => {
    if (!selectedWriting || view !== 'reader') return;
    
    const nextLineIndex = lineIndex + 1;
    if (nextLineIndex < selectedWriting.lines.length) {
      const nextLine = selectedWriting.lines[nextLineIndex];
      if (nextLine?.voiceSrc) {
        preloadAudioWithFallback(nextLine.voiceSrc).catch(console.warn);
      }
    }
  }, [lineIndex, selectedWriting, view, preloadAudioWithFallback]);

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
        const left = rect.left - containerRect.left;
        const top = rect.bottom - containerRect.top;
        
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

  const finishWriting = () => {
    if (!selectedWriting || !startedAt) return;
    const linesCompleted = selectedWriting.lines.length;
    const wordsCompleted = selectedWriting.lines.reduce((acc, line) => acc + countWords(line.de), 0);
    const minutes = Math.max((Date.now() - startedAt) / 60000, 1 / 60);
    const wpm = Math.round(wordsCompleted / minutes);

    const totalTypedChars = selectedWriting.lines.reduce((acc, line) => acc + line.de.length, 0);
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
    if (!selectedWriting) return;
    if (lineIndex >= selectedWriting.lines.length - 1) {
      finishWriting();
      return;
    }
    setLineIndex((prev) => prev + 1);
    setTypedValue('');
    setLastWrongKey(null);
    setLineCompleted(false);
  };

  const handleLineCompleted = useCallback(() => {
    if (!selectedWriting || lineCompleted) return;

    const isLastLine = lineIndex >= selectedWriting.lines.length - 1;
    setLineCompleted(true);

    // Play completion SFX only between phrases, not when writing fully finishes.
    if (!isLastLine) {
      playPhraseCompleteSfx();
    }

    window.setTimeout(() => moveToNextLine(), 80);
  }, [selectedWriting, lineIndex, lineCompleted, playPhraseCompleteSfx]);

  const handleTypingInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!currentLine || lineCompleted) return;

    const rawValue = event.target.value.replace(/\r?\n/g, '');
    const expected = currentLine.de;
    const normalizedValue = rawValue.slice(0, expected.length);

    if (normalizedValue === typedValue) return;

    if (normalizedValue.length < typedValue.length) {
      setTypedValue(normalizedValue);
      setLastWrongKey(null);
      return;
    }

    for (let i = typedValue.length; i < normalizedValue.length; i++) {
      if (normalizedValue[i] !== expected[i]) {
        setErrorCount((prev) => prev + 1);
        setLastWrongKey(normalizedValue[i] === ' ' ? 'space' : normalizedValue[i]);
        setTimeout(() => setLastWrongKey(null), 400);
        return;
      }
    }

    setTypedValue(normalizedValue);
    setLastWrongKey(null);

    if (normalizedValue === expected) {
      handleLineCompleted();
    }
  };

  const continueToNextWriting = () => {
    if (!selectedWriting) {
      setView('library');
      return;
    }

    const currentIndex = writingData.findIndex((writing) => writing.id === selectedWriting.id);
    const nextWriting = writingData[currentIndex + 1];

    if (!nextWriting || isWritingLocked(nextWriting)) {
      setView('library');
      return;
    }

    startWriting(nextWriting);
  };

  const renderLineWithVocab = (line: WritingLine) => {
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
    
    // Build word-based display
    const words = target.split(/(\s+)/);
    let globalCharIndex = 0;
    
    return (
      <div 
        ref={containerRef}
        className="relative w-full overflow-x-auto"
        style={{ direction: 'ltr', unicodeBidi: 'bidi-override' }}
      >
        <div className="relative inline-block min-w-full" style={{ direction: 'ltr' }}>
          <div 
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-[1.4] sm:leading-[1.3] tracking-tight font-mono"
            style={{ 
              direction: 'ltr',
              unicodeBidi: 'bidi-override',
              whiteSpace: 'normal',
              wordBreak: 'normal',
              overflowWrap: 'break-word',
              display: 'flex',
              flexWrap: 'wrap',
              textAlign: 'left'
            }}
          >
            {words.map((segment, segIdx) => {
              if (segment.match(/^\s+$/)) {
                // Handle spaces
                const spaceLen = segment.length;
                const result = [];
                for (let i = 0; i < spaceLen; i++) {
                  const idx = globalCharIndex;
                  const isTyped = idx < typedChars;
                  const isCurrent = idx === typedChars && !lineCompleted;
                  
                  let charClass = 'inline-block transition-all duration-150';
                  let charDisplay = ' ';
                  
                  if (isTyped) {
                    charDisplay = '·';
                    charClass += ' text-emerald-400/70';
                  } else if (isCurrent) {
                    charDisplay = '_';
                    charClass += isSpaceError ? ' text-amber-500' : ' text-amber-400';
                    charClass += ' font-bold transform scale-110';
                  } else {
                    charDisplay = ' ';
                    charClass += ' text-foreground/20';
                  }
                  
                  result.push(
                    <span
                      key={`space-${idx}`}
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
                  globalCharIndex++;
                }
                return <span key={`seg-${segIdx}`} className="whitespace-pre" style={{ direction: 'ltr' }}>{result}</span>;
              } else {
                // Handle word
                const wordChars = [];
                
                for (let i = 0; i < segment.length; i++) {
                  const idx = globalCharIndex;
                  const isTyped = idx < typedChars;
                  const isCurrent = idx === typedChars && !lineCompleted;
                  const isWrong = lastWrongKey && isCurrent && !isSpaceError;
                  const char = segment[i];
                  
                  let charClass = 'inline-block transition-all duration-150';
                  
                  if (isTyped) {
                    charClass += ' text-emerald-400';
                  } else if (isCurrent) {
                    charClass += isWrong ? ' text-rose-500' : ' text-sky-400';
                    charClass += ' font-bold transform scale-110';
                  } else {
                    charClass += ' text-foreground/25';
                  }
                  
                  wordChars.push(
                    <span
                      key={`char-${idx}`}
                      data-char-index={idx}
                      className={charClass}
                      style={{
                        display: 'inline-block',
                        transform: isCurrent ? 'scale(1.05)' : 'scale(1)',
                      }}
                    >
                      {char}
                    </span>
                  );
                  globalCharIndex++;
                }
                
                return (
                  <span 
                    key={`word-${segIdx}`} 
                    className="inline-block whitespace-nowrap" 
                    style={{ direction: 'ltr', unicodeBidi: 'bidi-override' }}
                  >
                    {wordChars}
                  </span>
                );
              }
            })}
          </div>
          
          {/* Premium moving underline cursor */}
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
            />
          )}
        </div>
      </div>
    );
  };

  if (view === 'reader' && selectedWriting && currentLine) {
    const completedLines = Math.min(selectedWriting.lines.length, lineIndex + (lineCompleted ? 1 : 0));
    const progressPercent =
      selectedWriting.lines.length > 0 ? (completedLines / selectedWriting.lines.length) * 100 : 0;

    return (
      <div className="min-h-[80vh] sm:min-h-[72vh] flex flex-col">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs sm:text-sm text-muted-foreground px-2 sm:px-4 py-2 sm:py-3">
          <div className="inline-flex items-center gap-2">
            <FileText className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="truncate max-w-[200px] sm:max-w-none">{selectedWriting.titleDe}</span>
          </div>
          <div className="inline-flex items-center gap-2">
            <span className="text-xs sm:text-sm">{lineIndex + 1}/{selectedWriting.lines.length}</span>
            <Badge variant={getLevelBadgeVariant(selectedWriting.level)} className="text-xs">{selectedWriting.level}</Badge>
          </div>
        </div>
        <div className="px-2 sm:px-4 pb-2">
          <div className="flex items-center justify-between text-[10px] sm:text-xs text-muted-foreground mb-1.5">
            <span>تقدم الكتابة</span>
            <span>{completedLines}/{selectedWriting.lines.length}</span>
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
                  onClick={() => {
                    setAudioUnlocked(true);
                    playLineVoice(currentLine);
                  }}
                  className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
                >
                  <Volume2 className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span>تشغيل الصوت</span>
                </button>
              </div>

              <div className="text-left overflow-x-auto pb-2">
                {renderLineWithVocab(currentLine)}
              </div>
              
              <div
                dir="ltr"
                className="text-left w-full"
                onPointerDown={() => {
                  setAudioUnlocked(true);
                  typingInputRef.current?.focus();
                }}
              >
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
                onChange={handleTypingInputChange}
                autoFocus
                aria-label="حقل الكتابة"
                dir="ltr"
                inputMode="text"
                autoComplete="off"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
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
              ⌨️ اضغط للكتابة
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (view === 'results' && selectedWriting && result) {
    return (
      <div className="max-w-3xl mx-auto px-3 sm:px-4 space-y-4 sm:space-y-6">
        <Card className="p-4 sm:p-6 md:p-8 text-center space-y-6 sm:space-y-8">
          <Badge className="mx-auto w-fit text-xs sm:text-sm">اكتمل التمرين</Badge>

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

          <Button className="w-full sm:w-auto sm:px-10" onClick={continueToNextWriting}>
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
              <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg sm:text-2xl font-bold">مكتبة الكتابة</h2>
              <p className="text-xs sm:text-sm text-muted-foreground">
                تمارين كتابة ألمانية: كتابة الجملة حرفا بحرف ضمن رحلة التعلم
              </p>
            </div>
          </div>
          <div className="text-[10px] sm:text-xs text-muted-foreground flex items-center gap-2">
            <Lock className="h-3 w-3 sm:h-4 sm:w-4" />
            {limited ? 'مجاني: تمارين تجريبية' : 'مدفوع: جميع التمارين'}
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
            <FileText className="h-4 w-4" />
            الكل
            <Badge variant="secondary" className="ml-1">
              {writingData.length}
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
        {filteredWriting.map((writing) => {
          const locked = isWritingLocked(writing);
          const wordCount = writing.lines.reduce((acc, line) => acc + countWords(line.de), 0);
          const content = (
            <Card
              className="p-3 sm:p-5 h-full cursor-pointer border-border/70 hover:border-primary/40 transition-colors"
              onClick={() => startWriting(writing)}
            >
              <div className="flex items-start justify-between gap-2 mb-2 sm:mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm sm:text-base md:text-lg font-semibold truncate">{writing.titleDe}</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground truncate">{writing.titleAr}</p>
                </div>
                <div className="flex flex-col items-end gap-1 sm:gap-2 flex-shrink-0">
                  {writing.isFree ? <Badge variant="secondary" className="text-[10px] sm:text-xs">مجاني</Badge> : <Badge variant="outline" className="text-[10px] sm:text-xs">مدفوع</Badge>}
                  <Badge variant={getLevelBadgeVariant(writing.level)} className="text-[10px] sm:text-xs">{writing.level}</Badge>
                </div>
              </div>

              <div className="flex items-center gap-3 sm:gap-4 text-[10px] sm:text-xs text-muted-foreground mt-3 sm:mt-6">
                <span className="inline-flex items-center gap-1">
                  <CircleCheckBig className="h-3 w-3 sm:h-3.5 sm:w-3.5" /> {writing.lines.length} سطر
                </span>
                <span className="inline-flex items-center gap-1">
                  <Timer className="h-3 w-3 sm:h-3.5 sm:w-3.5" /> {wordCount} كلمة
                </span>
              </div>
            </Card>
          );

          if (!locked) return <div key={writing.id}>{content}</div>;

          return (
            <div key={writing.id}>
              <LockOverlay isLocked message="هذا التمرين متاح في النسخة المدفوعة فقط.">
                {content}
              </LockOverlay>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WritingLibraryTab;