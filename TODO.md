# TODO: Implement Test Access Code Feature

## Overview
Add a 'TEST-ACCESS' code that provides full paid access for 10 minutes, with automatic logout even if the app is closed. Includes device-based single-use restriction and security measures.

## Steps
- [x] Update api/verify-code.ts: Add TEST_ACCESS_CODE to allowed codes, implement device-based single-use restriction.
- [x] Update src/components/AccessGate.tsx: Handle 'TEST-ACCESS' input with server verification, set expiration timestamp, add periodic check for expiration, add security measures (right-click prevention, dev tools blocking, screenshot prevention, watermark overlay).
- [ ] Test the feature: Enter TEST-ACCESS, verify full access, check auto-logout after 10 minutes or on reload, verify device restriction, test security measures.
- [x] Create README.txt: Document the new feature, how it works, and changes made.
