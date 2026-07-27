# OPT Homepage

OPT(Optimal Personal Teacher) 공식 홈페이지입니다.

## Development

```bash
npm install
npm run dev
```

## Checks

```bash
npm test
npm run typecheck
npm run build
```

## Dynamic content setup

The site works with bundled content when Supabase is not configured.

1. Sign in with the **OPT official account** and create the Supabase project under that account. Do not leave the project owned only by an individual member.
2. Run `supabase/migrations/20260727000000_initial_content.sql` in the SQL editor.
3. Create the OPT official administrator in **Authentication → Users**.
4. Add that user's UUID to the allow-list:

   ```sql
   insert into public.admin_profiles (user_id) values ('AUTH-USER-UUID');
   ```

5. Copy `.env.example` to `.env.local` and set the public project URL and publishable/anon key. Never use a service-role key.
6. Open the footer's **관리자 로그인**, sign in, and select **편집 시작**.

## GitHub Pages

1. In repository **Settings → Pages**, select **GitHub Actions** as the source.
2. Add repository Actions variables `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`.
3. Push `main`. The workflow tests and deploys the three page entry points.

The workflow currently uses `/OPT-Homepage/` as the repository Pages base. When `opt.it.kr` is connected, set the workflow's `VITE_SITE_BASE_PATH` to `/`, add the custom domain in Pages settings, and configure the DNS records GitHub displays. No application code change is required.
