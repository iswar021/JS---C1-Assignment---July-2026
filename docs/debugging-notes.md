# Debugging Notes (docs)

Canonical assessment file: [`../debugging-notes.md`](../debugging-notes.md).

Summary of the highest-signal issues:

1. PrismaClient + Jest needed `jest.setup.ts` placeholder `DATABASE_URL`.
2. Zod `.refine()` required `ZodTypeAny` in validate middleware.
3. Form-level Zod errors forwarded under `_errors`.
4. Validated query/params stored on `res.locals`.
5. CORS restricted via `CORS_ORIGIN`.
6. No Docker in sandbox → offline schema/migration verification.
7. Pasted PAT refused; human pushed with local credentials.
