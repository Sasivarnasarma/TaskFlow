# TaskFlow UI Frontend ⚛️

The frontend application for TaskFlow, built with **React 19**, **TypeScript**, **Vite 8**, **Tailwind CSS v4**, **Shadcn/UI**, and **Vitest**.

---

## 🛠️ Tech Stack & Architecture

* **Framework:** React 19 & TypeScript
* **Build Tool:** Vite 8
* **Styling:** Tailwind CSS v4, Glassmorphism design system, Lucide Icons
* **UI Components:** Radix UI primitives, Sonner toasts, Dark/Light/System theme provider
* **Testing:** Vitest, `@testing-library/react`, `jsdom`
* **Linter & Formatter:** Oxlint & Prettier

---

## 📁 Project Structure

```
ui/
├── src/
│   ├── components/     # Reusable UI components (TaskCard, CreateModal, DeleteModal, Header, Filters)
│   ├── pages/          # Application views (Dashboard)
│   ├── lib/            # Utilities & API client wrapper (api.ts, utils.ts, theme-provider.tsx)
│   ├── types/          # TypeScript interfaces (Task, TaskStatistics, FilterOptions)
│   └── test/           # Vitest setup & mocks (setup.ts)
├── vite.config.ts      # Vite build & Vitest test configuration
└── package.json        # Dependencies & scripts
```

---

## 🚀 Independent Execution

Run commands directly from the `ui/` directory:

```bash
# Install dependencies
pnpm install

# Start Vite dev server (port 5173)
pnpm dev

# Run Vitest test suite (15 tests)
pnpm test

# Run Oxlint linter
pnpm lint

# Run TypeScript compiler typecheck
pnpm typecheck

# Build Vite production bundle (dist/)
pnpm build
```
