import React, { useEffect } from 'react';

const AdSenseBanner = ({ 
  adSlot = "1234567890", // Replace with your actual ad slot ID
  adFormat = "auto",
  fullWidthResponsive = true,
  style = { display: 'block' },
  className = ""
}) => {
  useEffect(() => {
    try {
      // Ensure adsbygoogle is loaded
      if (typeof window !== 'undefined' && window.adsbygoogle) {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (error) {
      console.error('AdSense error:', error);
    }
  }, []);

  return (
    <div className={`adsense-container ${className}`}>
      <ins 
        className="adsbygoogle"
        style={style}
        data-ad-client="ca-pub-4918528902504889"
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive={fullWidthResponsive.toString()}
      />
    </div>
  );
};

export default AdSenseBanner;
