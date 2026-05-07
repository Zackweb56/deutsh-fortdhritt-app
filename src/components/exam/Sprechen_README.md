# Sprechen Modul (B1 Simulation) - Technical Documentation

This document explains the current implementation of the Sprechen module, including the AI integration, voice features, UI/UX structure, and considerations for moving to a production environment.

---

## 1. Current Implementation Details

We have completely modernized the Sprechen module to mimic a **Real Goethe-Zertifikat B1 Speaking Exam** experience using interactive AI.

### Core Features:
- **Phase-Aware Exam Controller**: The module strictly follows the official Goethe B1 Sprechen structure:
  - `Vorbereitung`: 15 minutes of preparation time to read the tasks and make notes.
  - `Teil 1` (Gemeinsam etwas planen): Interactive voice chat with the AI acting as "Kandidat B".
  - `Teil 2` (Ein Thema präsentieren): Solo presentation by the user (microphone disabled for AI interruption).
  - `Teil 3` (Über ein Thema sprechen): Feedback and Q&A where the AI shifts personas to ask a follow-up question and finally act as the "Prüfer" (Examiner).
- **Real AI Agent (Google Gemini)**: The app uses the `gemini-1.0-pro` model. The AI is prompted dynamically based on the current phase. It shifts from a friendly B1 learner (Teil 1 & 3) to a formal examiner (end of Teil 3).
- **Voice-to-Voice Loop**:
  - **Speech-to-Text (STT)**: Utilizes the browser's native `SpeechRecognition` API. The user clicks a microphone button to speak in German.
  - **Text-to-Speech (TTS)**: The AI's response is spoken aloud using the browser's native `SpeechSynthesis` API in a German voice.
- **Conversational UI (WhatsApp-Style)**: The interaction interface has been upgraded to a chat-like format for Teil 1.
- **Fully Localized**: All English terminology has been completely removed. The interface is 100% German.

---

## 2. API Limitations (Google AI Studio Free Tier)

Currently, the app uses a **Free Tier Google Gemini API Key**. While this is excellent for development and low-traffic simulation, it has strict limitations:

1. **Rate Limits (RPM)**: The free tier allows a maximum of **15 Requests Per Minute**. If you have 3 or 4 users taking the exam simultaneously, they will trigger a `429 Too Many Requests` error.
2. **Model Availability**: We are using `gemini-1.0-pro` to ensure compatibility with your current API key. 
3. **Data Privacy**: Data sent via the free API may be used by Google to train their models. 

### Production Solution:
When moving to full production with paying users, you should upgrade to the **Pay-as-you-go Plan** in Google Cloud Console. Upgrading removes the 15 RPM bottleneck, ensuring smooth exams for hundreds of concurrent users.

---

## 3. The 5-Turn Limit Logic (Teil 1)

The **5-Turn Limit** (`MAX_TURNS = 5`) is highly recommended and currently implemented for Teil 1:

### 1. Pedagogical Realism
In the real Goethe B1 exam, **Teil 1 (Planen)** lasts about 3 minutes. Exchanging 5 messages naturally takes about 2 to 3 minutes. It prevents the student from rambling infinitely.

### 2. Edge-Case Prevention
AI agents can sometimes get stuck in conversational loops. A strict turn limit forces the module to conclude the interaction and push the user to the next phase of the exam.

---

## 4. File Structure

- **`/src/components/exam/SprechenModule.tsx`**: The main module orchestrating the exam phases, timers, and UI.
- **`/src/lib/ai/gemini.ts`**: The AI service file that safely connects to Google's API, holds the phase-aware Prompts, and formats the user's speech.
- **`/src/hooks/useExamStore.ts`**: Tracks the global timer and module progression across the app.
