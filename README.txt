# Test Access Code Feature Documentation

## Overview
The 'TEST-ACCESS' code provides users with full paid access to the German learning app for a limited time of 10 minutes. This feature is designed for testing purposes and includes several security measures to prevent unauthorized sharing or misuse.

## How It Works
1. **Code Entry**: Users enter 'TEST-ACCESS' in the access gate input field.
2. **Device Verification**: The system verifies the code with the server, ensuring single-use per device.
3. **Access Grant**: Upon successful verification, the user gets full access for 10 minutes.
4. **Automatic Logout**: After 10 minutes, or upon app reload/close, the access expires automatically.
5. **Security Measures**: During test access, right-click is disabled, dev tools shortcuts are blocked, screenshot attempts are prevented, and a watermark overlay is displayed.

## Technical Implementation
- **API Endpoint**: `/api/verify-code` handles code verification with device-based restrictions.
- **Client-Side**: `AccessGate.tsx` manages the UI, timer, and security measures.
- **Storage**: Uses localStorage for access flags, expiration timestamps, and device IDs.
- **Security**: Event listeners prevent context menu, dev tools, and screenshots; CSS disables text selection.

## Changes Made
1. **api/verify-code.ts**:
   - Added 'TEST-ACCESS' to allowed codes.
   - Implemented device-based single-use restriction using device IDs.

2. **src/components/AccessGate.tsx**:
   - Added handling for 'TEST-ACCESS' input with server verification.
   - Implemented 10-minute expiration timer with periodic checks.
   - Added security measures: right-click prevention, dev tools blocking, screenshot prevention.
   - Added watermark overlay displaying "TEST ACCESS" and remaining time.

3. **src/lib/access.ts**:
   - Added functions for test access code management and expiration handling.

## Testing Instructions
1. Enter 'TEST-ACCESS' in the access gate.
2. Verify full access is granted.
3. Check that the timer displays remaining time.
4. Confirm automatic logout after 10 minutes or on reload.
5. Test security measures: right-click disabled, F12 blocked, PrintScreen prevented.
6. Verify device restriction: code can only be used once per device.

## Security Features
- Device fingerprinting prevents reuse on the same device.
- UI restrictions prevent copying content.
- Watermark overlay discourages screenshots.
- Keyboard shortcuts for dev tools are disabled.
- Automatic expiration ensures temporary access only.
