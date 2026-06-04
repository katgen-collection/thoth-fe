# Thothai — Frontend

Chat-first web frontend for the Thothai AI job-search assistant. Built with
**Next.js (App Router) + React + TypeScript + Tailwind v4**. The primary surface
is a single AI chat that streams tool activity inline (job search, CV analysis,
cover letters, interview prep); secondary surfaces (CV library, job tracker,
search history, settings) hang off the same shell.

> Design + contract this targets: [`../docs/FRONTEND.md`](../docs/FRONTEND.md),
> [`../backend-go/docs/api-reference.md`](../backend-go/docs/api-reference.md),
> [`../backend-go/docs/chat-and-tools.md`](../backend-go/docs/chat-and-tools.md).
> The UI design references the prototype in
> [`docs/thothai-mockup/`](docs/thothai-mockup) (a reference, not a spec).

## Getting started

```bash
npm install
cp .env.example .env.local   # then point NEXT_PUBLIC_API_BASE_URL at the gateway
npm run dev                  # http://localhost:3000
```

Scripts: `dev`, `build`, `start`, `lint`, `typecheck`.

## How it talks to the backend

- **Through the api-gateway only** (`NEXT_PUBLIC_API_BASE_URL` + `/api/v1`). This
  app has no JWT logic; the gateway validates the token and injects `X-User-*`.
- **Auth is an httpOnly cookie** set by the gateway. Every call sends
  `credentials: 'include'`; there is no `Authorization` header in app code.
  `src/middleware.ts` guards the `(app)` route group by cookie presence.
- **One typed client** in `src/lib/api/` wraps `fetch`, unwraps `{items}` /
  `{error}`, validates responses against the zod schemas in `src/types/api.ts`,
  and maps statuses (401 → login, 413/422/403 → form errors).
- **One streaming surface — chat.** `POST …/messages` returns `text/event-stream`.
  Because the stream is a POST body, `EventSource` can't be used; `src/lib/sse/`
  reads the `ReadableStream` and `src/hooks/use-chat-stream.ts` reduces the
  `text` / `tool_call` / `tool_progress` / `tool_result` / `done` / `error`
  frames into the live message. History/results use the non-streaming endpoints.

## Layout (`src/`)

```
src/
  app/
    (auth)/login/             # thin hand-off to the gateway login
    (app)/                    # authed group (middleware-guarded)
      layout.tsx              #   app shell: sidebar + topbar + content
      chat/ + chat/[id]/      #   the primary screen (new + thread)
      cvs/ + cvs/[cvId]/      #   CV library + detail
      jobs/                   #   saved-job tracker board
      history/                #   standalone search history
      settings/
    layout.tsx providers.tsx globals.css
  components/  chat/ cv/ jobs/ layout/ ui/
  hooks/       use-chat-stream + React Query resource hooks
  lib/         api/ sse/ chat/ utils constants
  stores/      ui-store, chat-store (Zustand)
  types/       api (zod), sse, chat (rendered model)
  middleware.ts
```

The `frontend/` folder is self-contained — **no imports from `backend-go/`**. The
API contract is mirrored as local zod schemas (`src/types/api.ts`), hand-kept in
sync with the backend docs, so the eventual repo split is a clean `git` move.

## Known TODOs / still open

- **CSRF + token refresh** with the gateway (drives `middleware.ts` + `lib/api`).
- **Login UX ownership** — `/login` currently hands off to
  `NEXT_PUBLIC_AUTH_LOGIN_URL`; confirm with user-auth-service.
- **Syntax highlighting** (Shiki) in Markdown is deferred — code blocks render
  with the mono `.md pre` style for now.
- **Model selector** is display-only until the backend exposes model choice.
