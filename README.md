# FlowTrack

FlowTrack is a freelance finance workspace for tracking clients, invoices, payments, and cash flow. The dashboard summarizes invoice activity and revenue; client and invoice screens support the day-to-day workflow, including invoice previews.

This is a portfolio project, not a hosted financial service. Configure your own backend before using it with real data.

## Run locally

Use a recent Node.js release and run:

```bash
npm install
npm run dev
```

Open http://localhost:3000. The application expects one configured backend:

- **Supabase:** set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`, then apply `supabase/schema.sql` to your own project.
- **Firebase:** set `NEXT_PUBLIC_FIREBASE_API_KEY`, `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`, `NEXT_PUBLIC_FIREBASE_PROJECT_ID`, `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`, `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`, and `NEXT_PUBLIC_FIREBASE_APP_ID`. Deploy `firestore.rules` in that project.

Firebase is selected when its required client configuration is present; otherwise the app uses the Supabase path. The fallback Firebase configuration in source is illustrative and does not connect to a usable backend. Do not put a Supabase service-role key or other server secret in a `NEXT_PUBLIC_` variable.

## Implementation

Next.js 16, React 19, TypeScript, Tailwind CSS, Recharts, Supabase, and Firebase. The Supabase schema includes ownership-based row-level security for profiles, clients, invoices, and invoice items. Firebase rules scope user documents to the signed-in user. Review and deploy the relevant rules before connecting production data.

Run `npm run lint` and `npm run build` for local verification. No production deployment is included in this repository.
