import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  BookOpen, 
  Search, 
  ExternalLink, 
  Check, 
  Clock, 
  ChevronDown,
  ChevronUp,
  GraduationCap,
  RotateCcw
} from 'lucide-react';
import { a1Lessons, a2Lessons, b1Lessons, b2Lessons } from '@/data/lessonsData';
import { useNavigate } from 'react-router-dom';
import { isLimitedAccess } from '@/lib/access';
import LockOverlay from '@/components/ui/lock-overlay';

const COMPLETED_KEY = 'completed-lessons-by-level';
const LEGACY_COMPLETED_KEY = 'completed-lessons';

const LessonsTab = () => {
  const navigate = useNavigate();
  const [selectedLevel, setSelectedLevel] = useState('A1');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedLessons, setExpandedLessons] = useState(new Set());
  const [completedByLevel, setCompletedByLevel] = useState({ A1: new Set(), A2: new Set(), B1: new Set(), B2: new Set() });

  // Load completed lessons per level from localStorage on component mount (with legacy migration)
  useEffect(() => {
    try {
      const saved = localStorage.getItem(COMPLETED_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setCompletedByLevel({
          A1: new Set(parsed.A1 || []),
          A2: new Set(parsed.A2 || []),
          B1: new Set(parsed.B1 || []),
          B2: new Set(parsed.B2 || []),
        });
        return;
      }
      // Migrate legacy flat list (assume A1 to avoid data loss)
      const legacy = localStorage.getItem(LEGACY_COMPLETED_KEY);
      if (legacy) {
        const parsedLegacy = JSON.parse(legacy);
        const migrated = { A1: new Set(parsedLegacy || []), A2: new Set(), B1: new Set(), B2: new Set() };
        setCompletedByLevel(migrated);
        localStorage.setItem(COMPLETED_KEY, JSON.stringify({
          A1: Array.from(migrated.A1),
          A2: [], B1: [], B2: [],
        }));
        localStorage.removeItem(LEGACY_COMPLETED_KEY);
      }
    } catch (error) {
      console.error('Error loading completed lessons by level:', error);
    }
  }, []);

  // Save completed lessons by level to localStorage whenever it changes
  useEffect(() => {
    const payload = {
      A1: Array.from(completedByLevel.A1 || []),
      A2: Array.from(completedByLevel.A2 || []),
      B1: Array.from(completedByLevel.B1 || []),
      B2: Array.from(completedByLevel.B2 || []),
    };
    localStorage.setItem(COMPLETED_KEY, JSON.stringify(payload));
  }, [completedByLevel]);

  const levels = {
    'A1': a1Lessons,
    'A2': a2Lessons,
    'B1': b1Lessons,
    'B2': b2Lessons
  };

  const currentLessons = levels[selectedLevel];
  const currentCompleted = completedByLevel[selectedLevel] || new Set();

  const toggleLessonExpansion = (lessonNumber) => {
    const newExpanded = new Set(expandedLessons);
    if (newExpanded.has(lessonNumber)) {
      newExpanded.delete(lessonNumber);
    } else {
      newExpanded.add(lessonNumber);
    }
    setExpandedLessons(newExpanded);
  };

  const toggleLessonCompletion = (lessonNumber) => {
    setCompletedByLevel(prev => {
      const next = {
        A1: new Set(prev.A1),
        A2: new Set(prev.A2),
        B1: new Set(prev.B1),
        B2: new Set(prev.B2),
      };
      const setForLevel = next[selectedLevel];
      if (setForLevel.has(lessonNumber)) {
        setForLevel.delete(lessonNumber);
      } else {
        setForLevel.add(lessonNumber);
      }
      return next;
    });
  };

  const clearCompletedLessons = () => {
    setCompletedByLevel({ A1: new Set(), A2: new Set(), B1: new Set(), B2: new Set() });
    localStorage.removeItem(COMPLETED_KEY);
    localStorage.removeItem(LEGACY_COMPLETED_KEY);
  };

  const filteredLessons = currentLessons.lessons.filter(lesson =>
    lesson.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lesson.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lesson.title_en.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const completedCount = currentCompleted.size;
  const totalCount = currentLessons.lessons.length;
  const progressPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  const limited = isLimitedAccess();

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6 bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">{currentLessons.course}</h2>
              <p className="text-muted-foreground">
                {totalCount} درس • {completedCount} مكتمل
              </p>
            </div>
          </div>
          
          {/* Reset Completed Lessons Button */}
          {completedCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearCompletedLessons}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
            >
              <RotateCcw className="h-4 w-4" />
              إعادة تعيين التقدم
            </Button>
          )}
          
          {/* Progress Bar */}
          <div className="w-full sm:w-64">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">التقدم</span>
              <span className="text-sm text-muted-foreground">
                {progressPercentage.toFixed(0)}%
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-primary to-secondary h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Level Selection */}
      <Card className="p-4">
        <div className="flex flex-wrap gap-2">
          {Object.keys(levels).map(level => (
            <Button
              key={level}
              variant={selectedLevel === level ? "default" : "outline"}
              onClick={() => setSelectedLevel(level)}
              className="flex items-center gap-2"
            >
              <GraduationCap className="h-4 w-4" />
              {level}
              {level === 'A1' && <Badge variant="secondary" className="ml-1">65 درس</Badge>}
              {level === 'A2' && <Badge variant="secondary" className="ml-1">50 درس</Badge>}
              {level === 'B1' && <Badge variant="secondary" className="ml-1">27 درس</Badge>}
              {level === 'B2' && <Badge variant="secondary" className="ml-1">8 دروس</Badge>}
            </Button>
          ))}
        </div>
      </Card>

      {/* Search */}
      <Card className="p-4">
        <div className="relative">
          {/* <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground mr-2" /> */}
          <Input
            placeholder="ابحث في الدروس..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </Card>

      {/* Lessons Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredLessons.map((lesson) => {
          const isExpanded = expandedLessons.has(lesson.number);
          const isCompleted = currentCompleted.has(lesson.number);
          
          const shouldLock = limited; // lock all lessons for free tier
          return (
            <Card 
              key={lesson.number} 
              className={`p-4 transition-all duration-200 hover:shadow-md ${
                isCompleted 
                  ? 'border-green-500 bg-green-900/30 shadow-lg shadow-green-500/20' 
                  : 'hover:border-primary/50'
              }`}
              style={isCompleted ? {
                backgroundColor: 'rgba(34, 197, 94, 0.1)',
                borderColor: 'rgb(34, 197, 94)',
                boxShadow: '0 10px 15px -3px rgba(34, 197, 94, 0.1), 0 4px 6px -2px rgba(34, 197, 94, 0.05)'
              } : {}}
            >
              <LockOverlay isLocked={shouldLock} message="دروس محجوبة — تواصل عبر واتساب لفتح الوصول الكامل">
              <div className="space-y-3">
                {/* Lesson Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      isCompleted 
                        ? 'bg-green-500 text-white' 
                        : 'bg-primary text-white'
                    }`}>
                      {isCompleted ? <Check className="h-4 w-4" /> : lesson.number}
                    </div>
                    <div className="flex-1">
                      <h3 className={`font-semibold text-sm leading-tight ${
                        isCompleted ? 'text-green-100' : ''
                      }`}>
                        {lesson.title}
                      </h3>
                      <p className={`text-xs ${
                        isCompleted ? 'text-green-200' : 'text-muted-foreground'
                      }`}>
                        {lesson.title_en}
                      </p>
                    </div>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleLessonExpansion(lesson.number)}
                    className="h-6 w-6 p-0"
                  >
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                </div>

                {/* Lesson Description */}
                {isExpanded && (
                  <div className="space-y-3 pt-2 border-t">
                    <p className={`text-sm leading-relaxed ${
                      isCompleted ? 'text-green-200' : 'text-muted-foreground'
                    }`}>
                      {lesson.description}
                    </p>
                    
                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="flex-1"
                        onClick={() => {
                          if (selectedLevel === 'A1') {
                            navigate(`/lessons/a1/${lesson.number}`);
                          } else {
                            window.open(lesson.url, '_blank');
                          }
                        }}
                      >
                        <ExternalLink className="h-4 w-4 mr-1" />
                        ابدأ الدرس
                      </Button>
                      
                      <Button
                        variant={isCompleted ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggleLessonCompletion(lesson.number)}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* Quick Actions (when not expanded) */}
                {!isExpanded && (
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 text-xs"
                      onClick={() => {
                        if (selectedLevel === 'A1') {
                          navigate(`/lessons/a1/${lesson.number}`);
                        } else {
                          window.open(lesson.url, '_blank');
                        }
                      }}
                    >
                      <ExternalLink className="h-3 w-3 mr-1" />
                      ابدأ
                    </Button>
                    
                    <Button
                      variant={isCompleted ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleLessonCompletion(lesson.number)}
                    >
                      <Check className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
              </LockOverlay>
            </Card>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredLessons.length === 0 && (
        <Card className="p-8 text-center">
          <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">لا توجد دروس</h3>
          <p className="text-muted-foreground">
            لم يتم العثور على دروس تطابق البحث "{searchTerm}"
          </p>
        </Card>
      )}

      {/* Stats Footer */}
      <Card className="p-4 bg-muted/50">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>إجمالي الدروس: {totalCount}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">مكتمل:</span>
            <span className="font-semibold text-green-600">{completedCount}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">متبقي:</span>
            <span className="font-semibold">{totalCount - completedCount}</span>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default LessonsTab;
