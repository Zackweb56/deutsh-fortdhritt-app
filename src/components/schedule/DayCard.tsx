import { Day } from '@/contexts/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StudyHourItem } from './StudyHourItem';

interface DayCardProps {
  day: Day;
  isLocked?: boolean;
  // lockType: why the day is locked. 'completed' = day already completed, 'blocked' = future day blocked until previous complete
  lockType?: 'completed' | 'blocked';
}

export const DayCard = ({ day, isLocked = false, lockType }: DayCardProps) => {
  const completedHours = day.hours.filter(h => h.completed).length;
  const totalHours = day.hours.length;
  const progress = (completedHours / totalHours) * 100;
  
  const isCurrentDay = completedHours > 0 && completedHours < totalHours;

  // visual classes: completed locked days should show a success style; blocked future days remain muted
  let extraClass = '';
  if (lockType === 'completed') {
    extraClass = 'glow-success border-success';
  } else if (isCurrentDay) {
    extraClass = 'glow-primary border-primary';
  }

  const opacityClass = isLocked && lockType === 'blocked' ? 'opacity-60' : '';

  return (
    <Card className={`card-gradient ${extraClass} ${opacityClass}`}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-sm text-muted-foreground">
              الأسبوع {day.week}
            </span>
            <span className="text-lg">
              اليوم {day.day}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {lockType === 'completed' ? (
              <span className="text-xs">✅</span>
            ) : isLocked ? (
              <span className="text-xs">🔒</span>
            ) : null}
            <div className="px-3 py-1 rounded-md bg-secondary text-secondary-foreground text-sm font-bold">
              {day.level}
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {isLocked ? (
          <div className="text-center py-4 text-sm text-muted-foreground">
            {lockType === 'blocked' ? 'يجب إكمال اليوم السابق أولاً' : '🔒 اليوم مكتمل'}
          </div>
        ) : (
          <>
            <div className="space-y-2">
              {day.hours.map((hour, index) => {
                // An hour is locked if its previous hour isn't completed (keeps forward order),
                // OR if any later hour is already completed (prevents unchecking earlier hours while a later one is checked).
                const prevNotCompleted = index !== 0 && !day.hours[index - 1].completed;
                const laterHasCompleted = day.hours.slice(index + 1).some(h => h.completed);
                const isHourLocked = prevNotCompleted || laterHasCompleted;

                return (
                  <StudyHourItem
                    key={hour.id}
                    hour={hour}
                    dayId={day.id}
                    isLocked={isHourLocked}
                  />
                );
              })}
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">التقدم</span>
                <span className="font-bold">{completedHours}/{totalHours}</span>
              </div>
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
