import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type AppSection = "learning" | "exam-preparation" | "interviews";

interface SectionContextValue {
  section: AppSection | null;
  setSection: (section: AppSection) => void;
  clearSection: () => void;
}

const STORAGE_KEY = "deutschpath_active_section";
const validSections: AppSection[] = ["learning", "exam-preparation", "interviews"];

const SectionContext = createContext<SectionContextValue | undefined>(undefined);

const isAppSection = (value: string | null): value is AppSection =>
  validSections.some((section) => section === value);

export function SectionProvider({ children }: { children: ReactNode }) {
  const [section, setSectionState] = useState<AppSection | null>(null);

  useEffect(() => {
    try {
      const storedSection = localStorage.getItem(STORAGE_KEY);
      setSectionState(isAppSection(storedSection) ? storedSection : null);
    } catch (error) {
      console.warn("Unable to read the active section from localStorage.", error);
    }
  }, []);

  const setSection = useCallback((nextSection: AppSection) => {
    setSectionState(nextSection);
    try {
      localStorage.setItem(STORAGE_KEY, nextSection);
    } catch (error) {
      console.warn("Unable to save the active section to localStorage.", error);
    }
  }, []);

  const clearSection = useCallback(() => {
    setSectionState(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.warn("Unable to clear the active section from localStorage.", error);
    }
  }, []);

  const value = useMemo(
    () => ({ section, setSection, clearSection }),
    [section, setSection, clearSection],
  );

  return (
    <SectionContext.Provider value={value}>
      {children}
    </SectionContext.Provider>
  );
}

// A context module must export both its provider and its hook.
// eslint-disable-next-line react-refresh/only-export-components
export function useSection() {
  const context = useContext(SectionContext);
  if (!context) {
    throw new Error("useSection must be used within a SectionProvider.");
  }
  return context;
}
