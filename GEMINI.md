# Workspace Rules — Online Education Platform Testing

This is a solo, time-constrained MCA integrated project. `PROJECT_MASTER.md` is the authoritative frozen baseline. Read it before starting work and at the beginning of each new session.

## Non-negotiable constraints
- Build only the frozen MVP in `PROJECT_MASTER.md`; do not suggest or implement extra features.
- Two portals only: Student and Instructor/Teacher. No admin portal.
- JavaScript only; React + Vite + Tailwind CSS + React Router.
- Supabase Auth email/password only + PostgreSQL + Supabase JS client over HTTPS. No Google login, OAuth, or social login.
- One shared login page with four demo-account buttons (two instructors, two students). Buttons fill email/password fields only; they must not auto-submit.
- Vercel Hobby for frontend hosting, subject to free-plan eligibility and limits.
- No custom Express backend, Python service, AWS migration, microservices, Docker, Kubernetes, paid APIs, or paid services unless the owner explicitly approves a baseline change.
- No feature creep, overengineering, speculative refactors, or unnecessary dependencies.
- Security is mandatory: use and test Supabase RLS; never expose service-role/secret keys in the frontend; never bypass security policies to make features work.
- Demo credentials are public by design if used to prefill browser fields. Use only disposable demo accounts with synthetic data and unique project-only passwords. Never use personal credentials. Never allow public users to self-select or promote themselves to instructor.
- Never fabricate test results, screenshots, performance metrics, deployment status, or report claims.

## How to work
1. Identify the current phase from `PROJECT_MASTER.md`. Work on that phase only.
2. Before significant edits, give a concise plan: files to change, approach, risks, and verification commands.
3. Inspect existing files before editing. Preserve working code and avoid unrelated changes.
4. Ask the owner before destructive changes, database/security policy changes, adding dependencies, changing hosting/architecture, or altering scope.
5. Implement the smallest complete solution.
6. Run relevant tests and build after changes. Report only what actually ran and its result.
7. Keep `README.md` and `PROJECT_REPORT_CONTEXT.md` accurate as implementation evolves.
8. Update the status section in `PROJECT_MASTER.md` only when progress is verified.
9. If an idea is outside the frozen scope, mark it out of scope and do not implement it.
10. If blocked by ambiguity, ask one focused question instead of guessing.
11. Do not add OAuth, Google login, social sign-in, magic links, or advanced authentication. Use Supabase email/password only.
12. Implement four login-page demo fill buttons (two student, two instructor). Each fills credentials but requires the user to click Login; it must not auto-submit.
13. If a rule number overlaps after editing, renumber the list cleanly without changing the requirements.

The owner is the architecture and scope decision-maker. The agent is an implementation assistant, not the product owner.
