# DeutschPath 🇩🇪
### تعلم الألمانية بنفسك — Learn German on Your Own

A structured German learning web app built specifically 
for Arabic speakers, covering A1 to B2 with daily lessons, 
vocabulary, listening, reading, and exam simulation.

🔗 **Live Demo:** [deutschpath.vercel.app](https://deutschpath.vercel.app)

---

## About

DeutschPath was born from a real problem — Arabic-speaking 
learners in Morocco have almost no affordable tools to learn 
German on their own. Most platforms are expensive, English-first, 
or not designed for Arabic speakers at all.

I built this app solo to solve that problem with zero budget 
for infrastructure. The entire app runs without a backend or 
database by design — not due to lack of skill, but as a 
deliberate choice to keep it completely free to host and 
accessible to anyone with a browser.

Progress, vocabulary, and access control are all handled 
client-side using localStorage and a serverless access 
verification endpoint — making the app 100% free to run 
on Vercel with no monthly costs.

The result is a real product with real paying users that 
costs nothing to maintain and nothing to access for learners 
on a tight budget.

If rebuilt with a proper backend, this architecture could 
easily scale to a full SaaS platform with user accounts, 
payment integration, progress sync across devices, and 
an admin dashboard — the foundation is already there.

---

## Screenshots

### Daily Study Schedule — الجدول الزمني
![Schedule](screenshots/schedule.png)
Structured daily lessons per week with progress tracking, 
timers, and locked/unlocked content per level.

### Vocabulary Manager — المفردات
![Vocabulary](screenshots/vocabulary.png)
Learn and manage vocabulary across A1, A2, B1, B2 levels 
with definition tools and custom word lists.

### Reading Practice — القراءة
![Reading](screenshots/reading.png)
Level-based German reading texts with comprehension 
questions and AI-generated voice narration with 
real-time word highlighting.

### Listening Practice — الاستماع
![Listening](screenshots/listening.png)
Audio exercises with speed control (0.5x → 1.5x), 
Arabic translation toggle, and synchronized 
text highlighting while audio plays.

---

## Features

**Learning Modules**
- 📅 Daily Study Schedule — Structured weekly plans with 4 study hours per day, timers, and progress tracking across A1-B2 levels
- 📚 Vocabulary Manager — Add, view, and delete custom vocabulary with German words, pronunciation, and Arabic translations
- 📝 Grammar & Verbs — Reference section for German grammar rules and verb conjugations
- 🎓 Lessons — Structured course content organized by proficiency level (A1, A2, B1, B2) with lesson completion tracking and search functionality
- 🎧 Listening Practice — Audio exercises with playback controls and text synchronization
- 📖 Reading Practice — Level-based German texts with comprehension content and text-to-speech narration
- 🔗 Resources — Curated external learning resources organized by category (listening, reading, speaking, etc.) with ability to add custom links

**App Features**
- 🔐 Access Control — Three-tier system: Free (limited access), Test (10-minute trial), Paid (full access) with unique code verification
- 💾 Data Persistence — All progress, vocabulary, and resources saved locally using browser localStorage
- 📱 Responsive Design — Mobile-first layout with full support for desktop and tablet devices
- 🔤 RTL Interface — Right-to-left Arabic interface with bilingual German/Arabic content throughout
- 🔊 Text-to-Speech — AI-generated voice narration for reading texts with real-time word highlighting
- ⏱️ Study Timers — Built-in timers for each study session with start/pause functionality
- 🌙 Dark Mode — Optional dark theme for comfortable reading in low light
- 📢 Ad Integration — AdSense banners for monetization
- 🔄 Reset Functionality — Option to reset all progress, vocabulary, and resources
- 📜 Scroll to Top — Convenient button for easy navigation in long pages
- 📄 Additional Pages — About page, Privacy Policy, and Reset Access page
- 🛡️ Security Measures — Anti-screenshot and anti-dev-tools protections for test access

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18 + TypeScript |
| Styling | Tailwind CSS + ShadCN UI |
| Components | Radix UI |
| Routing | React Router |
| State | React Context + React Query |
| Persistence | localStorage |
| Build tool | Vite |
| Deployment | Vercel |

---

## Access Tiers

| Tier | Features |
|------|----------|
| Free | Limited lessons and vocabulary |
| Test | Full access for evaluation |
| Paid | Complete A1→B2 content unlocked |

Access is managed via unique codes provided manually 
per user — no online payment system required.

---

## Who Is This For

- Arabic speakers preparing for Goethe, TestDaF, or 
  Ausbildung in Germany
- Moroccan students targeting B1/B2 certification
- Self-learners who prefer Arabic-first explanations

---

## Run Locally

```bash
npm install
npm run dev
```

---

## Notes

- Built solo — idea, design, development, and deployment
- Zero infrastructure cost — runs entirely on Vercel free tier
- No backend by design — localStorage handles all persistence
- Real paying users — access codes sold and distributed manually
- Version 1.2.1 currently live
- Built specifically for the Moroccan/Arabic-speaking market
- Could scale to full SaaS with backend integration