// Access control utilities with light obfuscation.
// IMPORTANT: Frontend-only protection can be bypassed; this is a UX gate.

// Encoded (base64) single-use codes. Keep this file name/path unobvious.
// Decoded once at runtime inside the gate.
export const ACCESS_CODES_B64: string[] = [
  "Rk1TLTk1MjEtMTIxMA==",
  "T1VOLTAzMDktODgzMA==",
  "UlFDLTc4NjEtOTczNA==",
  "T0haLTE3NjctMjU0NA==",
  "WlBPLTcwNTUtODE5MA==",
  "Q1lDLTg0NzQtNDIyNA==",
  "S0dDLTExNjAtMzg0Nw==",
  "QkZBLTg5NzYtNDI0Ng==",
  "TkdNLTMyOTAtNzU3Mw==",
  "U0pULTA2NTAtNDU2Nw==",
  "SjJDLTg0OTItOTIzMA==",
  "T1pDLTMxNjgtNjM5NQ==",
  "Q0tCLTk2NjItMzM4OA==",
  "R0ZQLTQ3OTktOTQ3MQ==",
  "Q1ZDLTcwMzItNTYwMQ==",
  "TUZFLTQyNzAtNzEwOA==",
  "U0hBLTkwOTUtMTAzOQ==",
  "Q1RBLTkyNzUtNzgzMA==",
  "VUxFLTA0NTAtNDM2Mw==",
  "UkpPLTY1ODItNDE4OA==",
  "RU9BLTQ5MjItMTU2OQ==",
  "VE1WLTAwNDEtOTk1NQ==",
  "QlpPLTUzNzctMTg1MQ==",
  "R0tDLTk1MTYtMTk5OA==",
  "RU5GLTQzMDgtNDY2MQ==",
  "Q1dSLTQ5NjMtMzg1MA==",
  "T0tPLTg3MjItMzg0MA==",
  "R1JNLTQxNjctNDE1Ng==",
  "Qk5BLTExMTYtOTM2OQ==",
  "Q2NGLTA4MjAtMTAyMQ==",
  "Uk5SLTQ1NjktNjU3NQ==",
  "T1ZDLTQ1MDktNTAwMQ==",
  "UEhNLTQxNjktMzk0NQ==",
  "S0JQLTcyMjItNTIwMg==",
  "Q1hNLTQzMDktNzYwMQ==",
  "TURNLTQ4MDItNDYyOA==",
  "VFhBLTQ2NjQtNDk2MQ==",
  "Q1JNLTg5NzItNzQ0MQ==",
  "TlJDLTQ2OTYtNDc1Nw==",
  "V1JNLTExOTAtNjQzMA==",
  "Qk5DLTk0NTctMTEyOA==",
  "TU9GLTQ4ODktODQ0Ng==",
  "T0RNLTExMjAtNjMwNg==",
  "T0RSLTQ5NjMtNTA2NQ==",
  "V0hFLTQxMzItNjA1MA==",
  "UUxELTkzODYtMjYxOA==",
  "VUtGLTExMTUtNTAwNw==",
  "Q09NLTgzMjAtOTYzNQ==",
  "V1JDLTA1MjEtNTg0OA==",
  "Q0tGLTg1NjItNjg0Mw==",
  "R0tGLTQ0OTQtNTAyNQ==",
  "V0pNLTgxMzEtNTY2Nw==",
  "T1RGLTQ3MDUtNDUzNQ==",
  "V1ZQLTQ0NjktNjA4OA==",
  "Q0JGLTExMjItNzQ1MA==",
  "Q0pGLTcyMDAtNjY1Ng==",
  "Qk5GLTc4MDktNTI0MQ==",
  "Q1RGLTg0MTQtNDYwMQ==",
  "R0ZBLTY1MjAtNDQ1MQ==",
  "T1VCLTExMjAtOTU1Nw==",
  "TkxSLTY1ODktMTIwOA==",
  "TkhaLTU2MTgtNDg0Nw==",
  "TUdGLTQzOTAtNTIwNQ==",
  "R09NLTAzMjctNjY5Nw==",
  "Q0lDLTg2MDgtNDI0OQ==",
  "V0pGLTk0NDQtNjQ2MQ==",
  "Q1RDLTQ0NDAtNzA1Mg==",
  "Q1FNLTExMDEtNzI1NQ==",
  "U0pDLTk2NzAtNDg1NA==",
  "Tk1DLTgyMDItNTEyNw==",
  "UEpNLTg0OTUtMzQyNg==",
  "Q0NGLTg3MDQtNzc0Nw==",
  "T1dBLTQyNzktNTk2Mw==",
  "Uk1NLTcyMjktNTU0MQ==",
  "Q0VTLTQ0MTgtNjc0Nw==",
  "V0NGLTQzOTYtNDM1OQ==",
  "R0hGLTg2MjItNTAwNg==",
  "U0FNLTEyMDAtNDYyMQ==",
  "Q1VGLTQ3MzktNjg1NQ==",
  "RlJGLTQ2MDUtNTk2Nw==",
  "U0FGLTg1ODgtNTA1Mg==",
  "R0JDLTQ0OTktNDM0Nw==",
  "V0RGLTQzNzktNjEwNQ==",
  "Q1ZGLTExMTEtNzI0MA==",
  "Q0JELTQwMDgtNDEyNw==",
  "Q1VNLTgwMDctNjM0Nw==",
  "V0VNLTg0MDgtNDUyNQ==",
  "Q1RJLTAzMDEtNDEyMQ==",
  "V0ZGLTg1MTktNjUwMQ==",
  "U0tGLTcwMDEtNDc1Nw==",
  "Q1ZDLTQ1MzktNDc0NQ==",
  "Q0RGLTQ2OTAtNDM0OA==",
  "R01DLTQyNTktNDQxMQ==",
  "Q1pDLTQ1MDQtNDQyMg==",
  "Q1dDLTg5MjAtNjUyMQ==",
  "UlJDLTQ0MDctNjI0MQ==",
  "VVJGLTQyMTAtNDc1Nw==",
  "R1NGLTQ1NTktNDU2MA==",
  "Q0RNLTQyODAtNDE2Nw=="
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


