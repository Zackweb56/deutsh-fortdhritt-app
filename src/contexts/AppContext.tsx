import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';

export interface StudyHour {
  id: string;
  title: string;
  german: string;
  icon: string;
  completed: boolean;
  timerSeconds: number;
  timerRunning: boolean;
}

export interface Day {
  id: string;
  level: string;
  week: number;
  day: number;
  hours: StudyHour[];
}

export interface VocabularyItem {
  id: string;
  german: string;
  pronunciation: string;
  translation: string;
  dateAdded: string;
}

export interface Resource {
  id: string;
  category: string;
  title: string;
  url: string;
  isDefault: boolean;
}

interface AppState {
  days: Day[];
  vocabulary: VocabularyItem[];
  resources: Resource[];
  currentTab: 'schedule' | 'vocabulary' | 'grammar' | 'lessons' | 'listening' | 'resources';
  isLoaded: boolean;
}

interface AppContextType extends AppState {
  setCurrentTab: (tab: 'schedule' | 'vocabulary' | 'grammar' | 'lessons' | 'listening' | 'resources') => void;
  toggleHourComplete: (dayId: string, hourId: string) => void;
  updateTimer: (dayId: string, hourId: string, seconds: number, running: boolean) => void;
  addVocabulary: (item: Omit<VocabularyItem, 'id' | 'dateAdded'>) => void;
  deleteVocabulary: (id: string) => void;
  addResource: (resource: Omit<Resource, 'id'>) => void;
  deleteResource: (id: string) => void;
  // reset everything: progress, vocabulary, resources, and current tab
  resetAll: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY = 'german-learning-tracker';

const createInitialDays = (): Day[] => {
  const levels = [
    { name: 'A1', days: 25 },
    { name: 'A2', days: 30 },
    { name: 'B1', days: 45 },
    { name: 'B2', days: 50 },
  ];

  const studyHours = [
    { title: 'القواعد والكتابة', icon: '📝', german: 'Grammatik & Schreiben' },
    { title: 'الاستماع والتحدث', icon: '🎧', german: 'Hören & Sprechen' },
    { title: 'المفردات والقراءة', icon: '📚', german: 'Wortschatz & Lesen' },
    { title: 'الثقافة والإعلام', icon: '🎭', german: 'Kultur & Medien' },
  ];

  const allDays: Day[] = [];
  let globalDayCounter = 1;

  levels.forEach(level => {
    const weeksInLevel = Math.ceil(level.days / 7);
    
    for (let week = 1; week <= weeksInLevel; week++) {
      const daysInWeek = Math.min(7, level.days - (week - 1) * 7);
      
      for (let day = 1; day <= daysInWeek; day++) {
        allDays.push({
          id: `${level.name}-W${week}-D${day}`,
          level: level.name,
          week,
          day: globalDayCounter,
          hours: studyHours.map((hour, idx) => ({
            id: `${level.name}-W${week}-D${day}-H${idx}`,
            title: hour.title,
            german: hour.german,
            icon: hour.icon,
            completed: false,
            timerSeconds: 3600,
            timerRunning: false,
          })),
        });
        globalDayCounter++;
      }
    }
  });

  return allDays;
};

// Migration function to update old category names to new German ones
const migrateResourceCategories = (resources: Resource[]): Resource[] => {
  const categoryMapping: { [key: string]: string } = {
    '🎧 Listening': 'Hören',
    '📖 Reading': 'Lesen',
    '🗣️ Speaking': 'Sprechen',
    '✍️ Writing': 'Schreiben',
    '💬 Grammar in Arabic': 'Grammatik auf Arabisch',
    '🎓 Courses (structured)': 'Hören', // Map old courses to listening for now
  };

  return resources.map(resource => ({
    ...resource,
    category: categoryMapping[resource.category] || resource.category
  }));
};

const createDefaultResources = (): Resource[] => {
  return [
    // Hören
    {
      id: 'default-1',
      category: 'Hören',
      title: 'Easy German (YouTube) - Street Interviews',
      url: 'https://www.youtube.com/@EasyGerman',
      isDefault: true,
    },
    {
      id: 'default-2',
      category: 'Hören',
      title: 'Slow German Podcast - Clear Pronunciation',
      url: 'https://slowgerman.com',
      isDefault: true,
    },
    {
      id: 'default-3',
      category: 'Hören',
      title: 'Coffee Break German - Structured Podcast',
      url: 'https://coffeebreakgerman.com',
      isDefault: true,
    },
    {
      id: 'default-4',
      category: 'Hören',
      title: 'DW Deutsch – Nachrichten (News)',
      url: 'https://www.dw.com/de/deutsch-lernen/nachrichten/s-8030',
      isDefault: true,
    },
    {
      id: 'default-5',
      category: 'Hören',
      title: 'Deutsche Welle - Top-Thema (Current Events)',
      url: 'https://www.dw.com/de/deutsch-lernen/top-thema/s-8031',
      isDefault: true,
    },
    {
      id: 'default-6',
      category: 'Hören',
      title: 'ARD Mediathek - German TV & Radio',
      url: 'https://www.ardmediathek.de',
      isDefault: true,
    },
    {
      id: 'default-7',
      category: 'Hören',
      title: 'Tagesschau - Daily News (Clear German)',
      url: 'https://www.tagesschau.de',
      isDefault: true,
    },
    
    // Lesen
    {
      id: 'default-8',
      category: 'Lesen',
      title: 'German.net - Reading Practice',
      url: 'https://german.net/reading',
      isDefault: true,
    },
    {
      id: 'default-9',
      category: 'Lesen',
      title: 'Deutsch Perfekt Magazine - Simplified Articles',
      url: 'https://www.deutsch-perfekt.com',
      isDefault: true,
    },
    {
      id: 'default-10',
      category: 'Lesen',
      title: 'Beelinguapp - Dual Language Stories',
      url: 'https://www.beelinguapp.com',
      isDefault: true,
    },
    {
      id: 'default-11',
      category: 'Lesen',
      title: 'Lingua.com - German Reading Texts',
      url: 'https://lingua.com/german/reading/',
      isDefault: true,
    },
    {
      id: 'default-12',
      category: 'Lesen',
      title: 'Readlang - Interactive Reading',
      url: 'https://readlang.com',
      isDefault: true,
    },
    {
      id: 'default-13',
      category: 'Lesen',
      title: 'Spiegel Online - German News (Advanced)',
      url: 'https://www.spiegel.de',
      isDefault: true,
    },
    
    // Sprechen
    {
      id: 'default-14',
      category: 'Sprechen',
      title: 'HelloTalk - Language Exchange',
      url: 'https://www.hellotalk.com',
      isDefault: true,
    },
    {
      id: 'default-15',
      category: 'Sprechen',
      title: 'Tandem - Native Speaker Practice',
      url: 'https://www.tandem.net',
      isDefault: true,
    },
    {
      id: 'default-16',
      category: 'Sprechen',
      title: 'Speechling - AI Speaking Practice',
      url: 'https://speechling.com',
      isDefault: true,
    },
    {
      id: 'default-17',
      category: 'Sprechen',
      title: 'italki - Professional German Teachers',
      url: 'https://www.italki.com/en/teachers/german',
      isDefault: true,
    },
    {
      id: 'default-18',
      category: 'Sprechen',
      title: 'Preply - German Conversation Practice',
      url: 'https://preply.com/en/online/german-tutors',
      isDefault: true,
    },
    {
      id: 'default-19',
      category: 'Sprechen',
      title: 'GermanPod101 - Conversation Scripts',
      url: 'https://www.germanpod101.com/german-conversations',
      isDefault: true,
    },
    
    // Schreiben
    {
      id: 'default-20',
      category: 'Schreiben',
      title: 'GermanListening.com - Dictation Exercises',
      url: 'https://germanlistening.com',
      isDefault: true,
    },
    {
      id: 'default-21',
      category: 'Schreiben',
      title: 'Goethe Institut - Writing Samples A2-B2',
      url: 'https://www.goethe.de/ins/de/de/spr/prf/gzb2/ue9.html',
      isDefault: true,
    },
    {
      id: 'default-22',
      category: 'Schreiben',
      title: 'Lang-8 - Writing Correction Community',
      url: 'https://lang-8.com',
      isDefault: true,
    },
    {
      id: 'default-23',
      category: 'Schreiben',
      title: 'Journaly - German Writing Practice',
      url: 'https://journaly.com',
      isDefault: true,
    },
    {
      id: 'default-24',
      category: 'Schreiben',
      title: 'Deutsch Lernen - Writing Exercises',
      url: 'https://deutsch-lernen.com/schreiben',
      isDefault: true,
    },
    
    // Grammatik auf Arabisch
    {
      id: 'default-25',
      category: 'Grammatik auf Arabisch',
      title: 'Deutsch Mit Marwa (YouTube) - Arabic Explanations',
      url: 'https://www.youtube.com/@DeutschMitMarwa',
      isDefault: true,
    },
    {
      id: 'default-26',
      category: 'Grammatik auf Arabisch',
      title: 'تعلم الألمانية - Arabic German Learning',
      url: 'https://www.youtube.com/results?search_query=تعلم+الالمانية+بالعربية',
      isDefault: true,
    },
    {
      id: 'default-27',
      category: 'Grammatik auf Arabisch',
      title: 'Goethe Institut Arabic - Grammar PDFs',
      url: 'https://www.goethe.de/ins/ae/ar/spr/kur/dtz.html',
      isDefault: true,
    },
    {
      id: 'default-28',
      category: 'Grammatik auf Arabisch',
      title: 'German Grammar in Arabic - YouTube Channel',
      url: 'https://www.youtube.com/results?search_query=قواعد+اللغة+الالمانية+بالعربية',
      isDefault: true,
    },
    {
      id: 'default-29',
      category: 'Grammatik auf Arabisch',
      title: 'Arabic-German Grammar Guide - PDF Resources',
      url: 'https://www.goethe.de/ins/ae/ar/spr/ueb.html',
      isDefault: true,
    },
    {
      id: 'default-30',
      category: 'Grammatik auf Arabisch',
      title: 'تعلم الألمانية من الصفر - Complete Arabic Guide',
      url: 'https://www.youtube.com/results?search_query=تعلم+الالمانية+من+الصفر+بالعربية',
      isDefault: true,
    },
  ];
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>({
    days: [],
    vocabulary: [],
    resources: [],
    currentTab: 'schedule',
    isLoaded: false,
  });

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Always ensure we have default resources - merge with existing if any
        const defaultResources = createDefaultResources();
        const existingResources = parsed.resources || [];
        
        // Migrate old category names to new German ones
        const migratedResources = migrateResourceCategories(existingResources);
        
        // Create a map of existing resources by id to avoid duplicates
        const existingResourceIds = new Set(migratedResources.map((r: Resource) => r.id));
        
        // Add default resources that don't already exist
        const newDefaultResources = defaultResources.filter(r => !existingResourceIds.has(r.id));
        const allResources = [...migratedResources, ...newDefaultResources];
        
        setState({ ...parsed, resources: allResources, isLoaded: true });
      } catch (e) {
        console.error('Failed to parse stored data', e);
        setState({
          days: createInitialDays(),
          vocabulary: [],
          resources: createDefaultResources(),
          currentTab: 'schedule',
          isLoaded: true,
        });
      }
    } else {
      setState({
        days: createInitialDays(),
        vocabulary: [],
        resources: createDefaultResources(),
        currentTab: 'schedule',
        isLoaded: true,
      });
    }
  }, []);

  // Save to localStorage whenever state changes
  useEffect(() => {
    if (state.isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
  }, [state]);

  const setCurrentTab = (tab: 'schedule' | 'vocabulary' | 'grammar' | 'lessons' | 'listening' | 'resources') => {
    setState(prev => ({ ...prev, currentTab: tab }));
  };

  const toggleHourComplete = (dayId: string, hourId: string) => {
    setState(prev => ({
      ...prev,
      days: prev.days.map(day => {
        if (day.id === dayId) {
          const hourIndex = day.hours.findIndex(h => h.id === hourId);
          const hours = day.hours.map((hour, idx) => {
            if (hour.id === hourId) {
              return { ...hour, completed: !hour.completed };
            }
            return hour;
          });
          return { ...day, hours };
        }
        return day;
      }),
    }));
  };

  const updateTimer = (dayId: string, hourId: string, seconds: number, running: boolean) => {
    setState(prev => ({
      ...prev,
      days: prev.days.map(day => {
        if (day.id === dayId) {
          return {
            ...day,
            hours: day.hours.map(hour => {
              if (hour.id === hourId) {
                return { ...hour, timerSeconds: seconds, timerRunning: running };
              }
              return hour;
            }),
          };
        }
        return day;
      }),
    }));
  };

  // Global timer tick: runs regardless of which tab/component is mounted so timers continue
  useEffect(() => {
    let interval: number | undefined;
    const lastRef = { current: Date.now() };

    const playCompletionSound = () => {
      try {
        const AudioCtor = (window as any).AudioContext || (window as any).webkitAudioContext;
        if (AudioCtor) {
          const ctx = new AudioCtor();
          if (ctx.state === 'suspended' && typeof ctx.resume === 'function') ctx.resume().catch(() => {});
          const gain = ctx.createGain();
          const osc = ctx.createOscillator();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(880, ctx.currentTime);
          osc.connect(gain);
          gain.connect(ctx.destination);
          gain.gain.setValueAtTime(0.0001, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + 0.01);
          osc.start(ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.45);
          osc.stop(ctx.currentTime + 0.5);
          setTimeout(() => { try { if (typeof (ctx as any).close === 'function') (ctx as any).close(); } catch (e) {} }, 1000);
        } else {
          const audio = new Audio();
          audio.play().catch(() => {});
        }
      } catch (e) {}
    };

    const playFiveMinuteWarning = () => {
      try {
        const AudioCtor = (window as any).AudioContext || (window as any).webkitAudioContext;
        if (AudioCtor) {
          const ctx = new AudioCtor();
          if (ctx.state === 'suspended' && typeof ctx.resume === 'function') ctx.resume().catch(() => {});
          const gain = ctx.createGain();
          const osc = ctx.createOscillator();
          osc.type = 'triangle';
          const now = ctx.currentTime;
          osc.frequency.setValueAtTime(1200, now);
          osc.connect(gain);
          gain.connect(ctx.destination);
          gain.gain.setValueAtTime(0.0001, now);
          gain.gain.exponentialRampToValueAtTime(0.15, now + 0.01);
          osc.start(now);
          osc.frequency.exponentialRampToValueAtTime(800, now + 0.18);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);
          osc.stop(now + 0.25);

          const osc2 = ctx.createOscillator();
          osc2.type = 'triangle';
          osc2.frequency.setValueAtTime(900, now + 0.28);
          const gain2 = ctx.createGain();
          osc2.connect(gain2);
          gain2.connect(ctx.destination);
          gain2.gain.setValueAtTime(0.0001, now + 0.28);
          gain2.gain.exponentialRampToValueAtTime(0.12, now + 0.29);
          osc2.start(now + 0.28);
          gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.6);
          osc2.stop(now + 0.62);

          setTimeout(() => { try { if (typeof (ctx as any).close === 'function') (ctx as any).close(); } catch (e) {} }, 1200);
        } else {
          const audio = new Audio();
          audio.play().catch(() => {});
        }
      } catch (e) {}
    };

    interval = window.setInterval(() => {
      const now = Date.now();
      const elapsed = Math.floor((now - (lastRef.current || now)) / 1000);
      if (elapsed <= 0) return;
      lastRef.current = now;

      const events: Array<{ type: 'warn' | 'complete' } & { dayId: string; hourId: string }> = [];

      setState(prev => {
        let changed = false;
        const next = {
          ...prev,
          days: prev.days.map(day => ({
            ...day,
            hours: day.hours.map(hour => {
              if (hour.timerRunning && hour.timerSeconds > 0) {
                const oldSeconds = hour.timerSeconds;
                const newSeconds = Math.max(0, oldSeconds - elapsed);
                // warn if we crossed the 5-minute threshold during this elapsed window
                if (oldSeconds > 300 && newSeconds <= 300) {
                  events.push({ type: 'warn', dayId: day.id, hourId: hour.id });
                }
                if (newSeconds <= 0) {
                  events.push({ type: 'complete', dayId: day.id, hourId: hour.id });
                  changed = true;
                  return { ...hour, timerSeconds: 0, timerRunning: false };
                }
                changed = true;
                return { ...hour, timerSeconds: newSeconds };
              }
              return hour;
            }),
          })),
        };
        // if nothing changed, return prev (avoid unnecessary writes)
        return changed ? next : prev;
      });

      // play sounds after state update
      if (events.length > 0) {
        events.forEach(ev => {
          if (ev.type === 'warn') playFiveMinuteWarning();
          if (ev.type === 'complete') playCompletionSound();
        });
      }
    }, 1000);

    return () => {
      if (interval) window.clearInterval(interval);
    };
  }, []);

  const addVocabulary = (item: Omit<VocabularyItem, 'id' | 'dateAdded'>) => {
    const newItem: VocabularyItem = {
      ...item,
      id: `vocab-${Date.now()}`,
      dateAdded: new Date().toISOString(),
    };
    setState(prev => ({
      ...prev,
      vocabulary: [...prev.vocabulary, newItem],
    }));
  };

  const deleteVocabulary = (id: string) => {
    setState(prev => ({
      ...prev,
      vocabulary: prev.vocabulary.filter(v => v.id !== id),
    }));
  };

  const addResource = (resource: Omit<Resource, 'id'>) => {
    const newResource: Resource = {
      ...resource,
      id: `resource-${Date.now()}`,
    };
    setState(prev => ({
      ...prev,
      resources: [...prev.resources, newResource],
    }));
  };

  const deleteResource = (id: string) => {
    setState(prev => ({
      ...prev,
      resources: prev.resources.filter(r => r.id !== id),
    }));
  };

  const resetAll = () => {
    setState(prev => ({
      ...prev,
      days: createInitialDays(),
      vocabulary: [],
      resources: createDefaultResources(),
      currentTab: 'schedule',
    }));
    try {
      // Also clear lessons completion (both new and legacy keys)
      localStorage.removeItem('completed-lessons-by-level');
      localStorage.removeItem('completed-lessons');
    } catch {}
  };

  return (
    <AppContext.Provider
      value={{
        ...state,
        setCurrentTab,
        toggleHourComplete,
        updateTimer,
        addVocabulary,
        deleteVocabulary,
        addResource,
        deleteResource,
        resetAll,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};
