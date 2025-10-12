import React from 'react';
import { Card } from '@/components/ui/card';
import AdSenseBanner from './AdSenseBanner';

const AdSenseExample = () => {
  return (
    <div className="space-y-6">
      {/* Example 1: Responsive Banner */}
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">إعلان متجاوب</h3>
        <AdSenseBanner 
          adSlot="1234567890" // Replace with your actual ad slot ID
          adFormat="auto"
          fullWidthResponsive={true}
          className="text-center"
        />
      </Card>

      {/* Example 2: Fixed Size Banner */}
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">إعلان بحجم ثابت</h3>
        <AdSenseBanner 
          adSlot="0987654321" // Replace with your actual ad slot ID
          adFormat="rectangle"
          fullWidthResponsive={false}
          style={{ 
            display: 'block',
            width: '300px',
            height: '250px',
            margin: '0 auto'
          }}
        />
      </Card>

      {/* Example 3: Leaderboard Banner */}
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">إعلان رئيسي</h3>
        <AdSenseBanner 
          adSlot="1122334455" // Replace with your actual ad slot ID
          adFormat="horizontal"
          fullWidthResponsive={true}
          style={{ 
            display: 'block',
            width: '100%',
            height: '90px'
          }}
        />
      </Card>
    </div>
  );
};

export default AdSenseExample;
