// Access control utilities with light obfuscation.
// IMPORTANT: Frontend-only protection can be bypassed; this is a UX gate.

// Encoded (base64) single-use codes. Keep this file name/path unobvious.
// Decoded once at runtime inside the gate.
export const ACCESS_CODES_B64: string[] = [
  "RFBYLTAwMDEtOTAwMQ==",
  "RFBYLTAwMDItOTAwMg==",
  "RFBYLTAwMDMtOTAwMw==",
  "RFBYLTAwMDQtOTAwNA==",
  "RFBYLTAwMDUtOTAwNQ==",
  "RFBYLTAwMDYtOTAwNg==",
  "RFBYLTAwMDctOTAwNw==",
  "RFBYLTAwMDgtOTAwOA==",
  "RFBYLTAwMDktOTAwOQ==",
  "RFBYLTAwMTAtOTAxMA==",
  "RFBYLTAwMTEtOTAxMQ==",
  "RFBYLTAwMTItOTAxMg==",
  "RFBYLTAwMTMtOTAxMw==",
  "RFBYLTAwMTQtOTAxNA==",
  "RFBYLTAwMTUtOTAxNQ==",
  "RFBYLTAwMTYtOTAxNg==",
  "RFBYLTAwMTctOTAxNw==",
  "RFBYLTAwMTgtOTAxOA==",
  "RFBYLTAwMTktOTAxOQ==",
  "RFBYLTAwMjAtOTAyMA==",
  "RFBYLTAwMjEtOTAyMQ==",
  "RFBYLTAwMjItOTAyMg==",
  "RFBYLTAwMjMtOTAyMw==",
  "RFBYLTAwMjQtOTAyNA==",
  "RFBYLTAwMjUtOTAyNQ==",
  "RFBYLTAwMjYtOTAyNg==",
  "RFBYLTAwMjctOTAyNw==",
  "RFBYLTAwMjgtOTAyOA==",
  "RFBYLTAwMjktOTAyOQ==",
  "RFBYLTAwMzAtOTAzMA==",
  "RFBYLTAwMzEtOTAzMQ==",
  "RFBYLTAwMzItOTAzMg==",
  "RFBYLTAwMzMtOTAzMw==",
  "RFBYLTAwMzQtOTAzNA==",
  "RFBYLTAwMzUtOTAzNQ==",
  "RFBYLTAwMzYtOTAzNg==",
  "RFBYLTAwMzctOTAzNw==",
  "RFBYLTAwMzh0OTAzOA==",
  "RFBYLTAwMzkvOTAzOQ==",
  "RFBYLTAwNDA=",
  "RFBYLTAwNDEtOTA0MQ==",
  "RFBYLTAwNDItOTA0Mg==",
  "RFBYLTAwNDMtOTA0Mw==",
  "RFBYLTAwNDQtOTA0NA==",
  "RFBYLTAwNDUtOTA0NQ==",
  "RFBYLTAwNDYtOTA0Ng==",
  "RFBYLTAwNDctOTA0Nw==",
  "RFBYLTAwNDgtOTA0OA==",
  "RFBYLTAwNDktOTA0OQ==",
  "RFBYLTAwNTAtOTA1MA==",
  "RFBYLTAwNTEtOTA1MQ==",
  "RFBYLTAwNTItOTA1Mg==",
  "RFBYLTAwNTMtOTA1Mw==",
  "RFBYLTAwNTQtOTA1NA==",
  "RFBYLTAwNTUtOTA1NQ==",
  "RFBYLTAwNTYtOTA1Ng==",
  "RFBYLTAwNTctOTA1Nw==",
  "RFBYLTAwNTgtOTA1OA==",
  "RFBYLTAwNTktOTA1OQ==",
  "RFBYLTAwNjAtOTA2MA==",
  "RFBYLTAwNjEtOTA2MQ==",
  "RFBYLTAwNjItOTA2Mg==",
  "RFBYLTAwNjMtOTA2Mw==",
  "RFBYLTAwNjQtOTA2NA==",
  "RFBYLTAwNjUtOTA2NQ==",
  "RFBYLTAwNjYtOTA2Ng==",
  "RFBYLTAwNjctOTA2Nw==",
  "RFBYLTAwNjgtOTA2OA==",
  "RFBYLTAwNjktOTA2OQ==",
  "RFBYLTAwNzAtOTA3MA==",
  "RFBYLTAwNzEtOTA3MQ==",
  "RFBYLTAwNzItOTA3Mg==",
  "RFBYLTAwNzMtOTA3Mw==",
  "RFBYLTAwNzQtOTA3NA==",
  "RFBYLTAwNzUtOTA3NQ==",
  "RFBYLTAwNzYtOTA3Ng==",
  "RFBYLTAwNzctOTA3Nw==",
  "RFBYLTAwNzgtOTA3OA==",
  "RFBYLTAwNzc5LTA3OQ==",
  "RFBYLTAwODAtOTA4MA==",
  "RFBYLTAwODEtOTA4MQ==",
  "RFBYLTAwODItOTA4Mg==",
  "RFBYLTAwODMtOTA4Mw==",
  "RFBYLTAwODQtOTA4NA==",
  "RFBYLTAwODUtOTA4NQ==",
  "RFBYLTAwODYtOTA4Ng==",
  "RFBYLTAwODctOTA4Nw==",
  "RFBYLTAwODgtOTA4OA==",
  "RFBYLTAwODktOTA4OQ==",
  "RFBYLTAwOTAtOTA5MA==",
  "RFBYLTAwOTEtOTA5MQ==",
  "RFBYLTAwOTItOTA5Mg==",
  "RFBYLTAwOTMtOTA5Mw==",
  "RFBYLTAwOTQtOTA5NA==",
  "RFBYLTAwOTUtOTA5NQ==",
  "RFBYLTAwOTYtOTA5Ng==",
  "RFBYLTAwOTctOTA5Nw==",
  "RFBYLTAwOTgtOTA5OA==",
  "RFBYLTAwOTktOTA5OQ==",
  "RFBYLTAxMDAtOTEwMA=="
];

export const ACCESS_FLAG_KEY = 'access_granted';
export const ACCESS_TIER_KEY = 'access_tier'; // 'full' | 'free'

export const decodeBase64 = (v: string) => atob(v);

export const getAllowedCodes = (): string[] => ACCESS_CODES_B64.map(decodeBase64);

// Local single-use removal: now enforced globally by API. Left here for imports compatibility.
export const isCodeConsumed = (_code: string): boolean => false;
export const consumeCode = (_code: string): void => {};


// Free demo access code (not single-use). Users with this code get limited access.
// Change this value to your preferred demo code; keep base64-encoded for parity.
export const FREE_ACCESS_CODE_B64 = 'RlJFRS1BQ0NFU1M='; // "FREE-ACCESS"
export const getFreeAccessCode = (): string => decodeBase64(FREE_ACCESS_CODE_B64);

export type AccessTier = 'full' | 'free';

export const setAccessTier = (tier: AccessTier) => {
  try {
    localStorage.setItem(ACCESS_TIER_KEY, tier);
  } catch {}
};

export const getAccessTier = (): AccessTier => {
  try {
    const v = localStorage.getItem(ACCESS_TIER_KEY) as AccessTier | null;
    return v === 'free' ? 'free' : 'full';
  } catch {
    return 'full';
  }
};

export const isLimitedAccess = (): boolean => getAccessTier() === 'free';

// WhatsApp contact link used in lock overlays. Customize the phone and prefilled text.
export const WHATSAPP_LINK =
  'https://wa.me/212773443694?text=%D8%A3%D8%B1%D9%8A%D8%AF%20%D8%AA%D9%81%D8%B9%D9%8A%D9%84%20%D8%A7%D9%84%D9%88%D8%B5%D9%88%D9%84%20%D8%A7%D9%84%D9%83%D8%A7%D9%85%D9%84%20%D9%84%D8%AA%D8%B7%D8%A8%D9%8A%D9%82%20%D8%AA%D8%B9%D9%84%D9%85%20%D8%A7%D9%84%D8%A3%D9%84%D9%85%D8%A7%D9%86%D9%8A%D8%A9';


