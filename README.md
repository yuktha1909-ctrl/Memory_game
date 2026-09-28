# 🎴 MEMORY MATCH

> **"Train your brain. Beat your best."**  
> A premium, fully functional memory card game web application engineered with **React**, **Vite**, **Node.js**, **Express**, and **native SQLite**.

---

## ✨ Features & Highlights

- **10 Progressive Challenge Levels**:
  - **Level 1**: 2 × 2 Grid (2 pairs / 4 cards) — *Genesis*
  - **Level 2**: 2 × 3 Grid (3 pairs / 6 cards) — *Novice*
  - **Level 3**: 4 × 2 Grid (4 pairs / 8 cards) — *Apprentice*
  - **Level 4**: 4 × 3 Grid (6 pairs / 12 cards) — *Adept*
  - **Level 5**: 4 × 4 Grid (8 pairs / 16 cards) — *Expert*
  - **Level 6**: 4 × 5 Grid (10 pairs / 20 cards) — *Master*
  - **Level 7**: 4 × 6 Grid (12 pairs / 24 cards) — *Grandmaster*
  - **Level 8**: 5 × 6 Grid (15 pairs / 30 cards) — *Champion*
  - **Level 9**: 6 × 6 Grid (18 pairs / 36 cards) — *Legend*
  - **Level 10**: 6 × 7 Grid (21 pairs / 42 cards) — *Mythic Deity*

- **Campaign & Free Play Modes**:
  - **Campaign Mode**: Unlock levels sequentially as you beat each tier. Unlocked levels and star ratings persist across server restarts.
  - **Free Play Mode**: Jump directly into Easy, Medium, or Hard modes without progression gates.

- **Deterministic Scoring & 3-Star Rating**:
  - Score is computed with base match points, time efficiency bonuses, and accuracy penalties.
  - Validated securely on the Express backend before persistence.
  - Never produces negative scores. Minimum score guaranteed on completion.
  - Up to 3 stars awarded per level based on move count and target benchmark time.

- **100% Offline Procedural Sound**:
  - Synthesized in real-time via the browser's **Web Audio API**.
  - Crisp card flip sweeps, resonant match chimes, gentle mismatch warnings, star pings, and victory fanfare chords. Zero downloaded audio files.

- **Persistent Offline SQLite Database**:
  - Auto-initializes on startup using Node's native synchronous SQLite (`node:sqlite`).
  - Stores player settings, campaign progression, star counts, high scores, and complete match history.
  - Safe data reset flow with double-confirmation dialog.

- **Accessibility & Usability**:
  - Full keyboard navigation: `Tab` to navigate cards, `Enter` / `Space` to flip.
  - Explicit ARIA attributes and labels for screen readers.
  - Tab visibility auto-pause (`document.visibilitychange` stops timer when tab is hidden).
  - Reduced-motion toggle and responsive design for mobile, tablets, and desktop.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite 6, Custom Vanilla CSS (Design Tokens, Glassmorphism, 3D Transforms)
- **Backend**: Node.js 24+, Express 4
- **Database**: SQLite (`server/memory_match.db`) with parameterized queries and WAL mode
- **Audio Engine**: HTML5 Web Audio API
- **Testing**: Built-in `node:test` and `node:assert` runner

---

## 🚀 Getting Started

### 1. Installation

From the project root directory, install all dependencies for both the frontend and backend:

```bash
# Install root, server, and client dependencies
npm install
npm --prefix server install
npm --prefix client install
```

*(Or simply run `npm run setup` if root dependencies are installed)*

### 2. Running in Development Mode

To start both the Express backend and the Vite frontend simultaneously with hot-reloading:

```bash
npm run dev
```

- **Frontend UI**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:5000/api](http://localhost:5000/api)
- Requests from the frontend to `/api/*` are automatically proxied to the Express backend.

### 3. Running Automated Tests

Run backend integration and scoring tests:

```bash
npm test
```

### 4. Production Build & Preview

```bash
npm run build
npm start
```

---

## 📡 REST API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Service health status and database engine info |
| `GET` | `/api/levels` | Retrieve level layouts, grid dimensions, and benchmark times |
| `GET` | `/api/profile` | Retrieve player profile, sound, animations, and theme settings |
| `PATCH` | `/api/settings` | Update sound toggle, animation toggle, and theme preference |
| `GET` | `/api/progress` | Retrieve progression status and star ratings across all 10 levels |
| `POST` | `/api/games/start` | Register a new game session with a unique session ID |
| `POST` | `/api/games/complete` | Validate results, compute deterministic score, and persist in SQLite |
| `GET` | `/api/stats` | Aggregated dashboard stats (games, wins, best score, best time, stars) |
| `GET` | `/api/history` | Chronological match history |
| `GET` | `/api/leaderboard` | Local high score hall of fame |
| `POST` | `/api/reset` | Reset all database progress back to Level 1 (requires `{ confirm: true }`) |

---

## 📁 Project Structure

```
memory_game/
├── package.json               # Root scripts (dev, start, test, build)
├── .gitignore                 # Excludes node_modules, build artifacts, db files
├── README.md                  # Comprehensive project documentation
├── server/
│   ├── package.json           # Server dependencies (express, cors)
│   ├── index.js               # Express application entry point
│   ├── db.js                  # Native SQLite connection, schema & queries
│   ├── routes.js              # REST API endpoints and validation
│   ├── scoring.js             # Deterministic scoring algorithm & level configurations
│   ├── memory_match.db        # Local SQLite database file (created automatically)
│   └── __tests__/             # Automated unit and API test suite
│       ├── scoring.test.js
│       └── api.test.js
└── client/
    ├── package.json           # Frontend dependencies (react, vite)
    ├── vite.config.js         # Vite configuration with /api proxy to port 5000
    ├── index.html             # HTML entry point with Google Fonts and SVG favicon
    └── src/
        ├── main.jsx           # React DOM mounting
        ├── App.jsx            # Top-level state, views, and modal orchestration
        ├── index.css          # Design system, glassmorphism, 3D flips, themes
        ├── components/        # Reusable UI components
        │   ├── Card.jsx
        │   ├── GameBoard.jsx
        │   ├── Navbar.jsx
        │   ├── StatsDashboard.jsx
        │   ├── DifficultySelector.jsx
        │   ├── HowToPlayModal.jsx
        │   ├── LevelSelectModal.jsx
        │   ├── VictoryModal.jsx
        │   ├── LeaderboardModal.jsx
        │   ├── SettingsModal.jsx
        │   └── ConfirmModal.jsx
        ├── hooks/             # Custom React hooks
        │   ├── useGameEngine.js
        │   ├── useSound.js
        │   └── useTimer.js
        └── utils/             # Helper utilities
            ├── api.js
            ├── cardIcons.js
            ├── confetti.js
            └── levels.js
```

---

## 🧩 Scoring Formula Details

1. **Base Match Points**:  
   $$\text{Base Score} = \text{Pairs} \times 150 \times \text{Multiplier}$$
   - *Easy (Lv 1–3)*: $1.0\times$
   - *Medium (Lv 4–7)*: $1.25\times$
   - *Hard (Lv 8–10)*: $1.5\times$

2. **Move Efficiency Bonus**:  
   $$\text{Extra Moves} = \max(0, \text{Moves} - \text{Pairs})$$  
   $$\text{Move Bonus} = \max(0, (\text{Pairs} \times 100 \times \text{Multiplier}) - (\text{Extra Moves} \times 20 \times \text{Multiplier}))$$

3. **Time Bonus**:  
   If $\text{Duration} < \text{Target Time}$:  
   $$\text{Time Bonus} = (\text{Target Time} - \text{Duration}) \times 15 \times \text{Multiplier}$$

4. **Star Thresholds**:  
   - **3 Stars**: Moves $\le \text{Pairs} \times 1.5$ and Time $\le \text{Target Time} \times 1.1$
   - **2 Stars**: Moves $\le \text{Pairs} \times 2.2$ and Time $\le \text{Target Time} \times 1.5$
   - **1 Star**: All completed games earn at least 1 star.
