import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { ExamState, ModuleType } from '@/types/exam';

interface ExtendedExamState extends ExamState {
  completedVariants: string[];
  playCounts: Record<string, number>;
  startExam: (variantId: string) => void;
  resetExam: () => void;
  markVariantCompleted: (id: string) => void;
  resetCompletedVariants: () => void;
  incrementPlayCount: (audioId: string) => void;
  clearAnswers: () => void;
}

export const useExamStore = create<ExtendedExamState>()(
  persist(
    (set, get) => ({
      variantId: null,
      currentModule: 'start',
      targetModule: null,
      currentTeil: 1,
      timeLeft: 0,
      isTimerActive: false,
      answers: {},
      scores: {},
      isFinished: false,
      startTime: null,
      completedVariants: [],
      playCounts: {},

      startExam: (variantId) => set({
        variantId,
        currentModule: 'instructions',
        targetModule: 'lesen',
        currentTeil: 1,
        answers: {},
        scores: {},
        playCounts: {},
        isFinished: false,
        startTime: Date.now(),
      }),

      startModule: (module, timeMinutes) => {
        const minutes = Number(timeMinutes) || 60;
        set({
          currentModule: module,
          timeLeft: minutes * 60,
          isTimerActive: true,
          currentTeil: 1,
        });
      },

      setTargetModule: (module) => set({ targetModule: module, currentModule: 'instructions' }),

      nextTeil: () => set((state) => ({ currentTeil: state.currentTeil + 1 })),

      updateAnswer: (moduleId, teilId, answer) => set((state) => ({
        answers: {
          ...state.answers,
          [`${moduleId}_${teilId}`]: answer
        }
      })),

      incrementPlayCount: (audioId) => set((state) => ({
        playCounts: {
          ...state.playCounts,
          [audioId]: (state.playCounts[audioId] || 0) + 1
        }
      })),

      finishModule: (moduleId, score) => {
        const order: ('lesen' | 'horen' | 'schreiben' | 'sprechen')[] = ['lesen', 'horen', 'schreiben', 'sprechen'];
        const currentIndex = order.indexOf(moduleId as any);
        const nextModule = order[currentIndex + 1] || 'results';

        set((state) => ({
          scores: { ...state.scores, [moduleId]: score },
          isTimerActive: false,
          currentModule: nextModule === 'results' ? 'results' : 'instructions',
          targetModule: nextModule === 'results' ? null : (nextModule as any),
        }));

        if (nextModule === 'results' && get().variantId) {
          get().markVariantCompleted(get().variantId!);
        }
      },

      markVariantCompleted: (id) => {
        set((state) => ({
          completedVariants: state.completedVariants.includes(id) 
            ? state.completedVariants 
            : [...state.completedVariants, id]
        }));
      },

      resetCompletedVariants: () => set({ completedVariants: [] }),

      setTimeLeft: (time) => set({ timeLeft: time }),
      setIsTimerActive: (active) => set({ isTimerActive: active }),

      tick: () => set((state) => {
        if (!state.isTimerActive || state.timeLeft <= 0) return state;
        return { timeLeft: state.timeLeft - 1 };
      }),

      resetExam: () => set({
        variantId: null,
        currentModule: 'start',
        targetModule: null,
        currentTeil: 1,
        timeLeft: 0,
        isTimerActive: false,
        answers: {},
        scores: {},
        playCounts: {},
        isFinished: false,
        startTime: null,
      }),

      clearAnswers: () => set({
        answers: {},
        playCounts: {}
      }),
    }),
    {
      name: 'deutschpath_exam_v3', // New version to clear old history-based state
      storage: createJSONStorage(() => localStorage),
    }
  )
);
