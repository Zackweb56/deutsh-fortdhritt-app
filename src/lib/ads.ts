// Ads control utilities to enable ads only for free access tier
import { isLimitedAccess } from './access';

const AD_SCRIPT_SRC = 'https://fpyf8.com/88/tag.min.js';
const AD_DATA_ZONE = '178460';
const AD_SCRIPT_ID = 'dp-free-ads-script';

const isAdServiceWorker = (registration: ServiceWorkerRegistration): boolean => {
  try {
    const scriptUrl = registration.active?.scriptURL || registration.installing?.scriptURL || registration.waiting?.scriptURL || '';
    return /5gvci\.com|\/sw\.js$/i.test(scriptUrl);
  } catch {
    return false;
  }
};

export const enableAds = async () => {
  // inject script once
  if (!document.getElementById(AD_SCRIPT_ID)) {
    const script = document.createElement('script');
    script.src = AD_SCRIPT_SRC;
    script.async = true;
    (script as any).dataset = { zone: AD_DATA_ZONE, cfasync: 'false' } as DOMStringMap;
    script.setAttribute('data-zone', AD_DATA_ZONE);
    script.setAttribute('data-cfasync', 'false');
    script.id = AD_SCRIPT_ID;
    document.head.appendChild(script);
  }
};

export const disableAds = async () => {
  // remove injected script
  const existing = document.getElementById(AD_SCRIPT_ID);
  if (existing) existing.remove();

  // unregister any ad-related service workers
  if ('serviceWorker' in navigator) {
    try {
      const regs = await navigator.serviceWorker.getRegistrations();
      await Promise.all(
        regs.filter(isAdServiceWorker).map(async (reg) => {
          try {
            await reg.unregister();
          } catch {}
        })
      );
    } catch {}
  }
};

export const syncAdsWithAccessTier = async () => {
  if (isLimitedAccess()) {
    await enableAds();
  } else {
    await disableAds();
  }
};

export const setupAdsAutoSync = () => {
  // initial sync
  void syncAdsWithAccessTier();
  // listen to access tier changes
  window.addEventListener('access-tier-changed', () => {
    void syncAdsWithAccessTier();
  });
};


