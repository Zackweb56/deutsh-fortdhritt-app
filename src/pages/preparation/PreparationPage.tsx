import React, { Suspense } from 'react';
import { PreparationTab } from '@/components/preparation/PreparationTab';

const PreparationPage = () => {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-6" dir="ltr">
      <Suspense fallback={<div className="text-center text-white">Loading...</div>}>
        <PreparationTab />
      </Suspense>
    </div>
  );
};

export default PreparationPage;
