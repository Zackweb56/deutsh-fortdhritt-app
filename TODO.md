# TODO: Implement Test Access Code Feature

## Overview
Add a 'TEST-ACCESS' code that provides full paid access for 10 minutes, with automatic logout even if the app is closed.

## Steps
- [ ] Update src/lib/access.ts: Add TEST_ACCESS_CODE constant, modify verifyAccessCode and isAccessGranted to handle test access with expiration.
- [ ] Update src/components/AccessGate.tsx: Handle 'TEST-ACCESS' input, set expiration timestamp in localStorage, add periodic check for expiration.
- [ ] Test the feature: Enter TEST-ACCESS, verify full access, check auto-logout after 10 minutes or on reload.
- [ ] Create README.txt: Document the new feature, how it works, and changes made.
