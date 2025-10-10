import { useApp } from '@/contexts/AppContext';
import { ResourceCategory } from './ResourceCategory';

export const ResourcesTab = () => {
  const { resources } = useApp();

  const categories = [
    { id: 'القواعد والكتابة', title: 'القواعد والكتابة', icon: '📝' },
    { id: 'الاستماع والتحدث', title: 'الاستماع والتحدث', icon: '🎧' },
    { id: 'المفردات والقراءة', title: 'المفردات والقراءة', icon: '📚' },
    { id: 'الثقافة والإعلام', title: 'الثقافة والإعلام', icon: '🎭' },
  ];

  return (
    <div className="space-y-4">
      {categories.map(category => {
        const categoryResources = resources.filter(r => r.category === category.id);
        
        return (
          <ResourceCategory
            key={category.id}
            category={category}
            resources={categoryResources}
          />
        );
      })}
    </div>
  );
};
