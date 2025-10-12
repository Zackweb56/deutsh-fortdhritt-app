import React, { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Plus, Search, Globe, BookOpen, Headphones, Mic, PenTool, MessageSquare, GraduationCap, ChevronDown, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export const ResourcesTab = () => {
  const { resources, addResource, deleteResource } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [openAccordions, setOpenAccordions] = useState<Set<string>>(new Set());


  const categories = [
    { id: 'Hören', title: 'Hören', icon: Headphones, color: 'bg-green-500' },
    { id: 'Lesen', title: 'Lesen', icon: BookOpen, color: 'bg-purple-500' },
    { id: 'Sprechen', title: 'Sprechen', icon: Mic, color: 'bg-orange-500' },
    { id: 'Schreiben', title: 'Schreiben', icon: PenTool, color: 'bg-red-500' },
    { id: 'Grammatik auf Arabisch', title: 'Grammatik auf Arabisch', icon: MessageSquare, color: 'bg-indigo-500' },
  ];

  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.url.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || resource.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });


  const handleAddResource = () => {
    if (!newTitle.trim() || !newUrl.trim() || !newCategory.trim()) {
      toast.error('يرجى ملء جميع الحقول');
      return;
    }

    addResource({
      category: newCategory,
      title: newTitle.trim(),
      url: newUrl.trim(),
      isDefault: false,
    });

    setNewTitle('');
    setNewUrl('');
    setNewCategory('');
    setIsAdding(false);
    toast.success('تمت إضافة المصدر بنجاح');
  };

  const toggleAccordion = (categoryId: string) => {
    setOpenAccordions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  const getCategoryIcon = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.icon : Globe;
  };

  const getCategoryColor = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.color : 'bg-gray-500';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          مصادر تعلم الألمانية
        </h1>
        <p className="text-muted-foreground">
          مجموعة شاملة من المصادر لتعلم الألمانية للمتحدثين بالعربية
        </p>
      </div>

      {/* Search and Filter */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="البحث في المصادر..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={selectedCategory === null ? "default" : "outline"}
              onClick={() => setSelectedCategory(null)}
              size="sm"
              className="gap-2"
            >
              جميع الفئات
              <Badge variant="secondary">
                {resources.length}
              </Badge>
            </Button>
            {categories.map(category => {
              const categoryResourceCount = resources.filter(r => r.category === category.id).length;
              return (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  onClick={() => setSelectedCategory(category.id)}
                  size="sm"
                  className="gap-2"
                >
                  <category.icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{category.title.split(' ')[0]}</span>
                  <Badge variant="secondary" className="ml-1">
                    {categoryResourceCount}
                  </Badge>
                </Button>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Add New Resource */}
      {isAdding && (
        <Card className="p-4 border-primary">
          <h3 className="font-semibold mb-4">إضافة مصدر جديد</h3>
    <div className="space-y-4">
            <Input
              placeholder="عنوان المصدر"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
            />
            <Input
              placeholder="رابط المصدر (https://...)"
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              dir="ltr"
              className="text-left"
            />
            <select
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              className="w-full p-2 border border-input rounded-md bg-background"
            >
              <option value="">اختر الفئة</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.title}
                </option>
              ))}
            </select>
            <div className="flex gap-2">
              <Button onClick={handleAddResource} className="flex-1">
                إضافة المصدر
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsAdding(false);
                  setNewTitle('');
                  setNewUrl('');
                  setNewCategory('');
                }}
                className="flex-1"
              >
                إلغاء
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Resources by Category - Accordion Style */}
      <div className="space-y-4">
        {categories.map(category => {
          const categoryResources = filteredResources.filter(r => r.category === category.id);
          const isOpen = openAccordions.has(category.id);
          
          // Show category if it has resources OR if it's specifically selected OR if showing all categories
          if (categoryResources.length === 0 && selectedCategory !== category.id && selectedCategory !== null) {
            return null;
          }
        
          return (
            <Card key={category.id} className="overflow-hidden">
              {/* Accordion Header */}
              <button
                onClick={() => toggleAccordion(category.id)}
                className={`w-full p-4 ${category.color} text-white hover:opacity-90 transition-opacity`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <category.icon className="h-6 w-6" />
                    <div className="text-right">
                      <h2 className="text-xl font-bold">{category.title}</h2>
                      <p className="text-sm opacity-90">
                        {categoryResources.length} مصدر متاح
                      </p>
                    </div>
                  </div>
                  <ChevronDown 
                    className={`h-5 w-5 transition-transform duration-200 ${
                      isOpen ? 'rotate-180' : ''
                    }`} 
                  />
                </div>
              </button>
              
              {/* Accordion Content */}
              {isOpen && (
                <div className="p-4 border-t border-border">
                  {categoryResources.length > 0 ? (
                    <div className="grid gap-3">
                      {categoryResources.map(resource => (
                        <div
                          key={resource.id}
                          className="flex items-center justify-between p-4 rounded-lg border border-border hover:border-primary transition-all duration-200 hover:shadow-md"
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className={`p-2 rounded-lg ${getCategoryColor(resource.category)} text-white`}>
                              {React.createElement(getCategoryIcon(resource.category), { className: "h-4 w-4" })}
                            </div>
                            <div className="flex-1 min-w-0">
                              <a
                                href={resource.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block font-medium hover:text-primary transition-colors truncate"
                              >
                                {resource.title}
                              </a>
                              <p className="text-sm text-muted-foreground truncate">
                                {resource.url}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            {resource.isDefault && (
                              <Badge variant="secondary">افتراضي</Badge>
                            )}
                            <a
                              href={resource.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 hover:bg-accent rounded-lg transition-colors"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </a>
                            {!resource.isDefault && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  deleteResource(resource.id);
                                  toast.success('تم حذف المصدر');
                                }}
                                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <category.icon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>لا توجد مصادر في هذه الفئة</p>
                    </div>
                  )}
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Add Resource Button */}
      {!isAdding && (
        <div className="text-center space-y-4">
          <Button
            onClick={() => setIsAdding(true)}
            className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            <Plus className="h-4 w-4" />
            إضافة مصدر جديد
          </Button>
          
          {/* Debug info */}
          <div className="text-sm text-muted-foreground">
            إجمالي المصادر: {resources.length} | المصادر المفلترة: {filteredResources.length}
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredResources.length === 0 && (
        <Card className="p-8 text-center">
          <Globe className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">لا توجد مصادر مطابقة</h3>
          <p className="text-muted-foreground mb-4">
            جرب تغيير كلمات البحث أو الفئة المحددة
          </p>
          <Button
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory(null);
            }}
            variant="outline"
          >
            مسح الفلاتر
          </Button>
        </Card>
      )}
    </div>
  );
};