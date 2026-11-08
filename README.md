# DeutschPath

**تعلم الألمانية بنفسك — Learn German on Your Own**

DeutschPath is a browser-based German-learning app aimed primarily at Arabic-speaking learners. It organizes independent study across CEFR levels A1–B2, with learning content, personal study tools, speaking practice, and Goethe exam preparation.

- **Live app:** [deutschpath.vercel.app](https://deutschpath.vercel.app)
- **Audience:** Arabic-speaking learners, especially learners in Morocco
- **Current product shape:** React single-page application with local browser persistence, static learning content, and a small set of Vercel serverless API routes

> This README describes the implementation currently in the repository. Some integrations have separate legacy or unused code paths; those are called out explicitly below so a future product update can distinguish what is active from what is only present in the codebase.

## Contents

- [Product areas](#product-areas)
- [Technology](#technology)
- [Application architecture](#application-architecture)
- [Repository map](#repository-map)
- [Routes and navigation](#routes-and-navigation)
- [State and persistence](#state-and-persistence)
- [AI integrations](#ai-integrations)
- [Speech and audio](#speech-and-audio)
- [Serverless APIs and access](#serverless-apis-and-access)
- [Content and assets](#content-and-assets)
- [Local development](#local-development)
- [Environment configuration](#environment-configuration)
- [Build, lint, and deployment](#build-lint-and-deployment)
- [Known limitations and maintenance notes](#known-limitations-and-maintenance-notes)
- [Making a feature change](#making-a-feature-change)

## Product areas

The home page is a tab-based learning dashboard. Its main tabs are:

| Area | Purpose | Main implementation |
|---|---|---|
| Study schedule | Daily study plan, study-hour timers, and completion tracking for A1–B2 | `src/components/schedule/`, `src/contexts/AppContext.tsx` |
| Vocabulary | Browse, practice, and manage German vocabulary and articles | `src/components/vocabulary/`, `src/data/vocabulars/` |
| Grammar | Level-based grammar references, exercises, and verb content | `src/components/grammar/`, `src/data/grammar/` |
| Lessons | Structured A1–B2 lesson content | `src/components/lessons/`, `src/data/lessons/` |
| Listening and reading | Listening activities, reading practice, and associated audio | `src/components/listening/`, `src/components/readings/`, `src/data/listening/` |
| Speaking | Select a scenario and practice a role-play conversation with AI | `src/components/speaking/`, `src/data/speaking/` |
| Writing | Writing practice and supporting learning materials | `src/components/writing/`, `src/data/writing/` |
| Resources | Curated links grouped by learning category | `src/components/resources/`, `src/contexts/AppContext.tsx` |
| Exam preparation | Choose an institute, level, module, task, and topic; currently specialized Goethe B1/B2 simulations | `src/components/preparation/`, `src/pages/preparation/` |
| Full exam simulation | Timed exam flow for listening, reading, writing, speaking, and results | `src/pages/exam/`, `src/components/exam/`, `src/data/exam/` |

The interface combines Arabic and German content and includes right-to-left layouts in Arabic-facing views. The app also includes informational pages, access-code gating, and an admin-style statistics page.

## Technology

| Layer | Implementation |
|---|---|
| UI | React 18, TypeScript, and some existing JavaScript/JSX |
| Build and development server | Vite with the SWC React plugin |
| Styling | Tailwind CSS, CSS variables, and Radix UI-based components |
| UI utilities | Components in `src/components/ui/`, Lucide icons, `clsx`, `tailwind-merge`, and class-variance-authority |
| Routing | React Router 6 |
| Shared app state | React Context in `src/contexts/AppContext.tsx` |
| Exam state | Zustand with localStorage persistence in `src/hooks/useExamStore.ts` |
| Async/cache provider | TanStack React Query is installed and its provider wraps the app |
| AI | Groq Chat Completions calls from browser code; a separate Anthropic Vercel function also exists |
| Serverless runtime | Vercel functions in `api/` |
| Shared backend data | Upstash Redis for access-code usage and analytics |
| Content | JSON, TypeScript, and JavaScript data files bundled or served by the frontend |
| Deployment configuration | Vercel rewrites in `vercel.json` |

## Application architecture

At a high level, the application is structured as:

```text
Browser
  └── src/main.tsx
       └── src/App.tsx (providers, access gate, routes, global UI)
            ├── Home route
            │    └── Index.tsx (tab shell)
            │         ├── feature components
            │         ├── AppContext + localStorage
            │         └── static learning data
            ├── Exam/preparation routes
            │    ├── exam Zustand store + localStorage
            │    ├── static exam/preparation content
            │    └── Groq AI helper or browser speech APIs
            └── Vercel /api/* functions
                 └── Upstash Redis or Anthropic (depending on endpoint)
```

### Startup and app shell

1. `src/main.tsx` imports global CSS and mounts the React app into `#root`.
2. `src/App.tsx` configures React Query, tooltips, toast notifications, the access gate, and `AppProvider`.
3. The app shell declares React Router routes and records a production visit through `/api/analytics`.
4. The `/` page renders `src/pages/Index.tsx`, which reads the active tab from `AppContext` and renders the selected feature component.
5. Exam and preparation routes use dedicated page-level simulators rather than the home-page tab shell.

The Vite `@` alias points to `src/`. Global styling starts in `src/index.css`; `src/App.css` contains additional app styles. Tailwind theme tokens and animations are configured in `tailwind.config.ts`.

### Main feature patterns

- **Feature components** live under `src/components/<feature>/`. They own their UI and usually import content or helpers from `src/data/` and `src/lib/`.
- **Route-level flows** live under `src/pages/`. They assemble larger experiences such as exam simulation and route-specific preparation simulators.
- **Shared browser state** is provided by `AppContext`; exam attempt state is separately managed by a persisted Zustand store.
- **Reusable primitives** live under `src/components/ui/`. Prefer using these components and the existing design tokens when changing UI.
- **Static content** is currently maintained in repository data files rather than fetched from a content-management backend.

## Repository map

```text
.
├── api/                         # Vercel serverless functions
├── public/                      # Public static files, audio, images, vocabulary art
├── screenshots/                 # Product screenshots referenced in documentation
├── src/
│   ├── App.tsx                  # Providers, access gate, global shell, routes
│   ├── main.tsx                 # React entry point
│   ├── components/
│   │   ├── ui/                  # Shared UI primitives
│   │   ├── schedule/            # Study planner
│   │   ├── vocabulary/          # Vocabulary library and practice
│   │   ├── grammar/             # Grammar, exercises, verbs
│   │   ├── lessons/             # Lesson UI
│   │   ├── listening/           # Listening UI
│   │   ├── readings/            # Reading UI
│   │   ├── speaking/            # Scenario picker and AI conversation
│   │   ├── writing/             # Writing library/practice
│   │   ├── resources/           # Curated resources
│   │   ├── preparation/         # Exam-preparation selection flow
│   │   └── exam/                # Full mock-exam modules and result screens
│   ├── contexts/
│   │   └── AppContext.tsx       # Shared app data and home-tab state
│   ├── data/                    # Lessons, exercises, scenarios, and exam JSON
│   ├── hooks/                   # UI hooks and persisted exam store
│   ├── lib/
│   │   ├── ai/groq.ts           # Shared Groq AI helpers for exam/preparation
│   │   ├── exam/                # Exam analysis/certificate helpers
│   │   ├── access.ts            # Client-side access tiers and helpers
│   │   ├── ads.ts               # Ad synchronization
│   │   └── tts.ts               # Browser text-to-speech helper
│   ├── pages/                   # Router-level pages and simulators
│   ├── types/                   # Shared TypeScript types
│   └── utils/                   # Scoring and utility helpers
├── index.html                   # HTML metadata, RTL document root, AdSense loader
├── vite.config.ts               # Vite server, React plugin, and @ alias
├── tailwind.config.ts           # Tailwind theme and component scanning
├── vercel.json                  # SPA rewrite; /api functions are handled by Vercel
├── package.json                 # Dependencies and npm scripts
└── README.md
```

### Important data areas

| Path | Contents |
|---|---|
| `src/data/lessons/` and `src/data/lessonsData.js` | Lesson bodies and lesson metadata |
| `src/data/grammar/` | A1–B2 grammar content and grammar exercises |
| `src/data/vocabulars/` | Vocabulary, articles, and job-related word lists |
| `src/data/speaking/senarios.json` | Role-play scenarios used by the regular speaking tab (filename spelling is part of the current codebase) |
| `src/data/listening/` and `src/data/listening_reading/` | Listening/reading content |
| `src/data/writing/` | Writing prompts/data and voice-related content |
| `src/data/preparation/goethe/b1/` and `src/data/preparation/goethe/b2/` | Goethe preparation task content for Lesen, Hören, Schreiben, and Sprechen |
| `src/data/preparation/telc/` | Reserved/currently limited Telc preparation data |
| `src/data/exam/B1/Goethe/` | Full exam variants, index, module JSON, and metadata |
| `src/data/exam/B2/Goethe/` | Full exam variant data |
| `public/media/` | Static audio and image assets |
| `public/vocabs_imgs/` | Vocabulary illustrations |

Exam variants are organized by level, institute, and variant. A variant generally has JSON for `lesen`, `horen`, `schreiben`, `sprechen`, and `metadata`; the exam page loads the index first and then loads the selected variant modules.

## Routes and navigation

The route table is defined in `src/App.tsx`.

| Route | Page/flow |
|---|---|
| `/` | Main tab-based learning dashboard |
| `/lessons/a1/:lessonNumber` | A1 lesson |
| `/lessons/a2/:lessonNumber` | A2 lesson |
| `/lessons/b1/:lessonNumber` | B1 lesson |
| `/lessons/b2/:lessonNumber` | B2 lesson |
| `/exams` | Exam selection |
| `/exam/:instituteLevel` | Full exam simulator |
| `/preparation/:institute/:level/:module/:teilId/:topicId` | Selected preparation simulation |
| `/reset-access` | Clear local access state |
| `/privacy-policy` | Privacy information |
| `/about` | About page |
| `/stats` | Simple analytics view |
| `*` | Not-found page |

The home dashboard does not use a separate URL for each tab: `TabNavigation` updates `currentTab` in `AppContext`, and `Index.tsx` conditionally renders the relevant component.

The preparation picker currently offers Goethe B1/B2 modules. `src/pages/preparation/PreparationSimulator.tsx` dispatches the route to a level/module-specific simulator. The full exam simulator is a separate flow that advances through instructions, timed modules, and results.

## State and persistence

There is **no general learner account or server-side profile database** in the current implementation.

### App-level state

`src/contexts/AppContext.tsx` stores the home-tab selection, study schedule, vocabulary entries, user resources, and preparation-picker selection. It loads and saves this state under the `german-learning-tracker` localStorage key. The reset action clears/reinitializes learning data.

### Exam state

`src/hooks/useExamStore.ts` uses Zustand's `persist` middleware and localStorage key `deutschpath_exam_v3`. It tracks the selected variant, active module/part, timer, answers, scores, audio play counts, and completed variants.

### Access state

Access flags and tier information are stored in browser localStorage by the access helpers and `AccessGate`. Some code verification/usage checks also call `/api/verify-code`, which uses Redis. Client-side flags are convenient for the UX but are not an authentication system or strong content-security boundary.

### Conversation state

Speaking conversation messages and active scenario state are managed in the speaking UI component. Do not assume chat history is synced between devices or saved to a user account.

Because learner data is browser-local, clearing site storage or changing browsers/devices can lose or separate progress. There is currently no cross-device sync.

## AI integrations

AI is used for interactive role-play and feedback, not as the source of the app's static lessons or exam questions.

### Regular Speaking tab

`src/components/speaking/SpeakingTab.tsx` reads scenarios from `src/data/speaking/senarios.json` and opens `src/components/speaking/SpeakingConversation.tsx`. That component builds a system prompt from the selected scenario and CEFR level, sends conversation history to Groq's OpenAI-compatible Chat Completions endpoint, and displays/speaks the response. It also makes an AI request to produce a conversation evaluation.

The regular speaking component currently sets the model to `openai/gpt-oss-120b`. The AI request is sent directly from the browser using `VITE_GROQ_API_KEY`.

### Full exam speaking and writing

`src/lib/ai/groq.ts` is the shared Groq client/helper module used by:

- `src/components/exam/SprechenModule.tsx` for phase-aware speaking-partner replies and speaking evaluation.
- `src/components/exam/SchreibenModule.tsx` for writing evaluation.
- Goethe B1/B2 preparation speaking simulators for interactive replies and speaking evaluation.
- Goethe B1/B2 preparation writing simulators for writing evaluation.

The shared helper has its **own model constant**, independent from the regular speaking component. It currently still names `llama-3.3-70b-versatile`, which Groq has deprecated/retired. Update this constant to a currently available model before expecting the full-exam or Goethe-preparation AI paths to work reliably. Changing the regular speaking model does not update this helper.

Both Groq code paths currently read `VITE_GROQ_API_KEY` in frontend code. A Vite `VITE_` variable is embedded in the client bundle and can be inspected by app users. For a public production app, proxy AI requests through a serverless endpoint, keep provider credentials in server-only environment variables, validate requests, and apply per-user/provider rate limits. Free provider tiers have usage limits and do not provide guaranteed uptime.

### Other AI-related code

`api/sprechen-chat.ts` is a Vercel function that calls Anthropic using `ANTHROPIC_API_KEY`. No current frontend caller was found for this endpoint in the repository search. Treat it as a separate/legacy endpoint until its intended use is confirmed; it is not the endpoint used by the regular speaking component or `src/lib/ai/groq.ts`.

`test_gemini.cjs` and `models.json` are root-level development/reference artifacts; they are not the active AI integration used by the current speaking and exam flows.

### AI troubleshooting

1. Inspect the browser Network request and response body. Distinguish invalid/deprecated model errors from authentication failures, rate limits, and provider outages.
2. Verify the model identifier against the provider's current model catalog.
3. Check provider account usage/rate limits. Respect retry-after guidance for 429 responses instead of retrying in a tight loop.
4. Confirm the Vite key is configured in the environment used to build the deployed frontend. A frontend environment change generally requires a new deployment.
5. Keep model configuration centralized where possible; the regular speaking UI and shared exam/preparation helper currently have separate model constants.

Provider reference: [Groq models](https://console.groq.com/docs/models), [deprecations](https://console.groq.com/docs/deprecations), and [rate limits](https://console.groq.com/docs/rate-limits).

## Speech and audio

- Speaking flows use the browser's Web Speech APIs when available: `SpeechRecognition`/`webkitSpeechRecognition` for speech-to-text and `speechSynthesis` for text-to-speech.
- Browser support, microphone permissions, language packs, and voice quality vary by browser and device. Text input remains important as a fallback.
- General narration helpers are in `src/lib/tts.ts` and `src/utils/tts.ts`; additional feature-specific speech logic exists in speaking and exam components.
- Audio files are static assets under `public/media/audio/` and may also be referenced by content data.
- ElevenLabs variable names may exist in local environment configuration, but no current source reference to them was found during this README update. They are not documented as a required active integration.

## Serverless APIs and access

Vercel maps files in `api/` to `/api/*` endpoints. These functions are separate from the Vite-only local development server; use Vercel's local tooling or a deployed environment to exercise them.

| Endpoint | Behavior | Dependencies |
|---|---|---|
| `POST /api/verify-code` | Validates access codes and tracks single-use/device access | Upstash Redis REST credentials |
| `POST /api/analytics` | Records a visit, unique device, and a five-minute active marker | Upstash Redis REST credentials |
| `GET /api/analytics` | Returns aggregate visit/device/active counts for the stats view | Upstash Redis REST credentials and a query secret |
| `POST /api/sprechen-chat` | Sends messages to Anthropic and returns a reply; no active frontend caller was found | `ANTHROPIC_API_KEY` |

The Vercel config rewrites non-API paths to `index.html` so React Router can handle page navigation. API requests are not intended to fall through to the SPA rewrite.

Access codes are partly represented in frontend code and browser state, while verification/usage tracking can use the server endpoint. This is a lightweight access gate for the current product, not a secure subscription/authentication backend. Do not rely on client-side gating to protect sensitive content or paid services.

## Content and assets

Most learning and exam content is authored in the repository. When adding an exercise:

1. Find the relevant level/module data file under `src/data/`.
2. Follow the existing JSON/TypeScript data shape consumed by its component.
3. Update the matching feature or simulator only when the current UI does not already render that shape.
4. Add referenced audio/image files under `public/` and use root-relative public URLs where appropriate.
5. Check every level/part using the content to ensure optional fields and translations are handled.

The content directories include a mix of naming conventions and some legacy files. Preserve the existing schema of the specific feature being edited rather than assuming all content modules share a single schema.

## Local development

Requirements: a supported Node.js runtime and npm. The repository also contains `bun.lockb`; use the package manager/lockfile your workflow is already using and avoid mixing lockfile updates casually.

```bash
npm install
npm run dev
```

Vite starts on port `8080` as configured in `vite.config.ts`. The frontend can be developed without provider credentials, but AI calls need a valid provider key. The Vercel API routes require their server environment configuration and are not implemented by Vite's normal dev server.

Other useful commands:

```bash
npm run build       # Production frontend build
npm run build:dev   # Development-mode frontend build
npm run preview     # Serve the production build locally
npm run lint        # ESLint across the repository
```

There is no dedicated test script in `package.json` at this time. `test_gemini.cjs` is a standalone artifact, not wired into the npm test lifecycle.

## Environment configuration

Keep local secrets in an ignored local environment file and configure deployment secrets in Vercel's environment settings. Never commit actual API keys, Redis tokens, or analytics credentials.

| Variable | Used by | Notes |
|---|---|---|
| `VITE_GROQ_API_KEY` | `src/components/speaking/SpeakingConversation.tsx`, `src/lib/ai/groq.ts` | Required for current Groq calls. `VITE_` means this key is exposed in the built client; migrate to server-side proxying for production safety. |
| `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` | `api/verify-code.ts`, `api/analytics.ts` | Preferred Upstash REST configuration. |
| `KV_REST_API_URL` / `KV_REST_API_TOKEN` | Same APIs | Compatibility aliases accepted by the functions. Analytics additionally checks `DG_KV_REST_API_URL` / `DG_KV_REST_API_TOKEN`. |
| `ANTHROPIC_API_KEY` | `api/sprechen-chat.ts` | Required only if the currently unreferenced Anthropic function is intentionally used. |

Do not copy values from a developer's local `.env` into documentation, issue trackers, or commits. If a browser-exposed provider key has been used in a public deployment, treat it as public and rotate it before moving the integration server-side.

## Build, lint, and deployment

The frontend is built by Vite. `vercel.json` configures the SPA rewrite, and `api/` contains Vercel serverless functions. A typical deployment therefore needs:

1. A successful frontend production build.
2. Vercel project configuration for the repository.
3. Server-side Upstash variables for access verification/analytics.
4. A Groq key for the current frontend AI behavior (or, preferably, a server-side AI proxy and server-only key).
5. A redeploy after changing frontend environment variables or model IDs.

Run `npm run build` before deploying and use `npm run lint` to check code style. The repository currently has existing lint findings, so compare reported issues with the baseline and the files changed rather than assuming every warning is introduced by a feature.

## Known limitations and maintenance notes

- **AI models differ by flow.** The regular scenario-speaking component uses `openai/gpt-oss-120b`, while `src/lib/ai/groq.ts` still names the retired `llama-3.3-70b-versatile`. Keep model IDs current in both places or consolidate configuration.
- **Browser key exposure.** The Groq key is currently used in client code under a `VITE_` variable. This is not a secret in a public build; a server-side proxy is the recommended architecture.
- **No user accounts or sync.** Learner progress is stored per browser/device in localStorage. There is no remote profile, recovery, or cross-device synchronization.
- **Provider quotas and availability.** Free AI tiers can impose rate/token/day limits, model access changes, and outages. The app cannot guarantee uninterrupted free AI.
- **API routes need Vercel-compatible runtime.** The standard Vite server only serves the SPA and does not automatically execute `api/` functions.
- **Access protection is lightweight.** Client-side access flags/codes can be inspected or modified; they are not equivalent to server-enforced authentication or entitlement checks.
- **Analytics secret placement needs review.** The stats page currently sends its query secret from browser code. A value embedded in frontend code cannot protect an endpoint; move authorization to a server-side mechanism before relying on this as private admin access.
- **Anthropic route is unreferenced.** `api/sprechen-chat.ts` should be connected intentionally, updated, or removed after confirming it is not needed.
- **Telc preparation is incomplete.** The current preparation picker exposes Goethe B1/B2 modules; other institute/level combinations may show an unavailable state.
- **Testing coverage is limited.** No standard test command is configured in `package.json`.

## Making a feature change

For a new learning feature or a large product/use-case update:

1. **Clarify the user journey.** Determine whether the change belongs in the home tab shell, the standalone exam simulator, or the Goethe preparation flow. These are separate entry points and should not be conflated.
2. **Choose the owning layer.** Put reusable UI in `src/components/`, route orchestration in `src/pages/`, reusable state in a context/store, and provider/data operations in `src/lib/` or `api/` as appropriate.
3. **Define the content contract.** Update a typed data model where practical; maintain compatibility with the JSON content already consumed by the feature.
4. **Decide persistence intentionally.** Choose local-only state versus server persistence. LocalStorage is per browser and should not be represented as account-backed sync.
5. **Treat AI as an external dependency.** Keep prompts and provider logic separated from presentational components where practical, centralize model configuration, validate inputs/outputs, handle provider errors, and never ship server credentials in frontend variables.
6. **Keep the learning level and localization consistent.** The product targets Arabic-speaking learners and contains German exam content; verify RTL layout, Arabic explanations, and CEFR-appropriate language.
7. **Validate the actual flow.** Run the production build and lint, then manually test the affected route, access tier, responsive layout, and any provider/API integration.

## Project background

DeutschPath was created to make structured German learning more accessible to Arabic-speaking learners, particularly in Morocco. Its product direction combines self-study planning, practice resources, conversational exercises, and exam preparation in one interface. The current lightweight architecture prioritizes low operating cost, while leaving clear future opportunities for server-side accounts, progress synchronization, content management, and safer AI access.

## Screenshots

Screenshots are stored in `screenshots/` and can be updated as the interface evolves.

### Dashboard
![DeutschPath dashboard](screenshots/dashboard.png)

### Exam preparation and practice
![Exam simulation](screenshots/exam.png)

### Speaking conversation
![Speaking conversation](screenshots/conversation_01.png)

### Vocabulary
![Vocabulary library](screenshots/vocabs_02.png)

### Lessons and grammar
![Lessons](screenshots/lessons_01.png)
![Grammar](screenshots/grammar_01.png)
