import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

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
  currentTab: 'schedule' | 'vocabulary' | 'resources';
  isLoaded: boolean;
}

interface AppContextType extends AppState {
  setCurrentTab: (tab: 'schedule' | 'vocabulary' | 'resources') => void;
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

const createDefaultResources = (): Resource[] => {
  return [
    {
      id: 'default-1',
      category: 'القواعد والكتابة',
      title: 'Deutsche Welle - Learn German',
      url: 'https://learngerman.dw.com',
      isDefault: true,
    },
    {
      id: 'default-2',
      category: 'القواعد والكتابة',
      title: 'Goethe Institut',
      url: 'https://www.goethe.de',
      isDefault: true,
    },
    {
      id: 'default-3',
      category: 'الاستماع والتحدث',
      title: 'Easy German YouTube',
      url: 'https://www.youtube.com/@EasyGerman',
      isDefault: true,
    },
    {
      id: 'default-4',
      category: 'الاستماع والتحدث',
      title: 'Coffee Break German Podcast',
      url: 'https://coffeebreakgerman.com',
      isDefault: true,
    },
    {
      id: 'default-5',
      category: 'المفردات والقراءة',
      title: 'Memrise German',
      url: 'https://www.memrise.com/courses/english/german/',
      isDefault: true,
    },
    {
      id: 'default-6',
      category: 'المفردات والقراءة',
      title: 'Deutsche Welle Top-Thema',
      url: 'https://www.dw.com/de/deutsch-lernen/top-thema/s-8031',
      isDefault: true,
    },
    {
      id: 'default-7',
      category: 'الثقافة والإعلام',
      title: 'ARD Mediathek',
      url: 'https://www.ardmediathek.de',
      isDefault: true,
    },
    {
      id: 'default-8',
      category: 'الثقافة والإعلام',
      title: 'Tagesschau',
      url: 'https://www.tagesschau.de',
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
        setState({ ...parsed, isLoaded: true });
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

  const setCurrentTab = (tab: 'schedule' | 'vocabulary' | 'resources') => {
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
