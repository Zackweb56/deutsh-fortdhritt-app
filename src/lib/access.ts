// Access control utilities with light obfuscation.
// IMPORTANT: Frontend-only protection can be bypassed; this is a UX gate.

// Encoded (base64) single-use codes. Keep this file name/path unobvious.
// Decoded once at runtime inside the gate.
export const ACCESS_CODES_B64: string[] = [
  // 50 codes in pattern AAA-####-#### with mixed prefixes
  'R0VSLTA5R08tRjZKUA==', 'REVVLTMzQ0QtQjlEUw==', 'WkFLLTE3UkEtTDFWUg==', 'R0VSLTc1QkYtRDhSTw==', 'REVVLTA0S0YtTzBKTQ==',
  'WkFLLTI3U0gtRzZGSA==', 'R0VSLTEzTVItRjZJUA==', 'REVVLTI4U0EtSDRESw==', 'WkFLLTA4WkYtTzJBTQ==', 'R0VSLTMxREItUjJOTw==',
  'REVVLTA3TEktRjFTUA==', 'WkFLLTEyRUctQzhZUg==', 'R0VSLTI0S0EtTzBRTQ==', 'REVVLTIzVkctRjRPUw==', 'WkFLLTI5QkItSDhGRA==',
  'R0VSLTIxSEYtTzRSTQ==', 'REVVLTI2U0YtRjBKUA==', 'WkFLLTE0TFAtQzNSTg==', 'R0VSLTM0Q0YtUjBFTw==', 'REVVLTA5V0EtRjhLUA==',
  'WkFLLTIxU0MtSDJYRA==', 'R0VSLTI4TUEtTzJRTQ==', 'REVVLTA1QkUtRjJPUw==', 'WkFLLTE4REctQzBWWg==', 'R0VSLTAyV0YtUjJSTw==',
  'REVVLTMxTEQtQjNWWg==', 'WkFLLTAxS1AtRzJOSw==', 'R0VSLTE2UEItRDZQTw==', 'REVVLTI5RkMtSDRSSw==', 'WkFLLTMwVEItTDFaUg==',
  'R0VSLTA1SkQtRjJCUw==', 'REVVLTA4TUctQzJQWg==', 'WkFLLTI0V0MtRzRSTg==', 'R0VSLTIzS1AtTzJZUg==', 'REVVLTI3VEQtRjBKUw==',
  'WkFLLTE5QkMtQzRWWg==', 'R0VSLTA3R0ItUjBQTw==', 'REVVLTAxR0YtQzBWWg==', 'WkFLLTA1TUUteFRZNA==', 'R0VSLTI2WkItSDJVTw==',
  'REVVLTI1U0QtRjBKUw==', 'WkFLLTA3TUQtTzZUUg==', 'R0VSLTA4Q0YtUjBVTw==', 'REVVLTAyUVAtQzJYWg==', 'WkFLLTI4RUEtRzBPSw==',
  'R0VSLTE4RkYtRDJRTw==', 'REVVLTIyS0MtSDJSTw==', 'WkFLLTA5UFItTzZWWg==', 'R0VSLTI5TUMtUjJWTw==', 'REVVLTI0QkYtRjBPUw=='
];

export const ACCESS_FLAG_KEY = 'access_granted';

export const decodeBase64 = (v: string) => atob(v);

export const getAllowedCodes = (): string[] => ACCESS_CODES_B64.map(decodeBase64);

// Local single-use removal: now enforced globally by API. Left here for imports compatibility.
export const isCodeConsumed = (_code: string): boolean => false;
export const consumeCode = (_code: string): void => {};


