import { useApp, Day } from '@/contexts/AppContext';
import { DayCard } from './DayCard';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export const ScheduleTab = () => {
  const { days } = useApp();

  const levels = ['A1', 'A2', 'B1', 'B2'];

  const isLevelUnlocked = (level: string) => {
    if (level === 'A1') return true;

    const levelIndex = levels.indexOf(level);
    if (levelIndex === -1) return false;

    for (let i = 0; i < levelIndex; i++) {
      const prevLevel = levels[i];
      const prevLevelDays = days.filter((d) => d.level === prevLevel);
      const allPrevHoursComplete = prevLevelDays.every((day) =>
        day.hours.every((h) => h.completed)
      );
      if (!allPrevHoursComplete) return false;
    }
    return true;
  };

  const isDayLocked = (day: Day) => {
    const laterHasProgress = days.some(
      (d) => d.day > day.day && d.hours.some((h) => h.completed)
    );
    if (laterHasProgress) return true;

    if (day.day === 1) return false;

    const prevDay = days.find((d) => d.day === day.day - 1);
    if (!prevDay) return false;

    return !prevDay.hours.every((h) => h.completed);
  };

  return (
    <Accordion
      type="multiple"
      defaultValue={['A1']}
      className="space-y-4 w-full"
    >
      {levels.map((level) => {
        const levelDays = days.filter((d) => d.level === level);
        if (levelDays.length === 0) return null;

        const levelUnlocked = isLevelUnlocked(level);

        const totalHours = levelDays.reduce(
          (sum, day) => sum + day.hours.length,
          0
        );
        const completedHours = levelDays.reduce(
          (sum, day) => sum + day.hours.filter((h) => h.completed).length,
          0
        );
        const progress =
          totalHours > 0 ? (completedHours / totalHours) * 100 : 0;

        return (
          <AccordionItem
            key={level}
            value={level}
            className={`border border-border rounded-lg bg-card ${
              !levelUnlocked ? 'opacity-60' : ''
            }`}
            disabled={!levelUnlocked}
          >
            <AccordionTrigger
              className="
                px-4 sm:px-6 hover:no-underline
                items-start sm:items-start
                [&>svg]:mt-2
              "
              disabled={!levelUnlocked}
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full gap-3">
                {/* Left side: Level info */}
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  <div
                    className={`px-4 py-2 rounded-lg font-bold text-base sm:text-lg ${
                      levelUnlocked
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {level}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {levelDays.length} يوم
                  </div>
                  {!levelUnlocked && (
                    <span className="text-xs text-muted-foreground">
                      🔒 مقفل
                    </span>
                  )}
                </div>

                {/* Right side: Progress bar */}
                <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
                  <div className="text-xs sm:text-sm font-medium whitespace-nowrap">
                    {completedHours}/{totalHours} ساعة
                  </div>
                  <div className="w-full sm:w-32 h-2 bg-neutral-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <span className="text-xs sm:text-sm font-bold min-w-[2.5rem] text-right">
                    {progress.toFixed(0)}%
                  </span>
                </div>
              </div>
            </AccordionTrigger>

            <AccordionContent className="px-4 sm:px-6 pb-6">
              {!levelUnlocked ? (
                <div className="text-center py-8 text-muted-foreground text-sm sm:text-base">
                  يجب إكمال المستوى السابق أولاً
                </div>
              ) : (
                <div
                  className="
                    grid
                    grid-cols-1
                    sm:grid-cols-2
                    lg:grid-cols-3
                    gap-3 sm:gap-4
                  "
                >
                  {levelDays.map((day) => {
                    const laterHasProgress = days.some(
                      (d) => d.day > day.day && d.hours.some((h) => h.completed)
                    );
                    const allDaysComplete = days.every((d) =>
                      d.hours.every((h) => h.completed)
                    );

                    let lockType: 'completed' | 'blocked' | undefined;
                    let locked = false;

                    if (allDaysComplete) {
                      lockType = 'completed';
                      locked = true;
                    } else if (laterHasProgress) {
                      lockType = 'completed';
                      locked = true;
                    } else {
                      if (day.day === 1) {
                        locked = false;
                      } else {
                        const prevDay = days.find(
                          (d) => d.day === day.day - 1
                        );
                        if (!prevDay) {
                          locked = false;
                        } else {
                          const prevComplete = prevDay.hours.every(
                            (h) => h.completed
                          );
                          if (!prevComplete) {
                            lockType = 'blocked';
                            locked = true;
                          } else {
                            locked = false;
                          }
                        }
                      }
                    }

                    return (
                      <DayCard
                        key={day.id}
                        day={day}
                        isLocked={locked}
                        lockType={lockType}
                      />
                    );
                  })}
                </div>
              )}
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
};
