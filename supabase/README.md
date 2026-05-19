# Supabase (STOS)

## Secrets cho CLI (deploy functions, link project)

| File | Mục đích |
|------|----------|
| **`supabase/.env.local`** | Token thật (`sbp_...`) — **chỉ file này**, không commit |
| `supabase/.env.example` | Mẫu placeholder — **không** dán token vào đây |

```bash
cp supabase/.env.example supabase/.env.local
# Chỉ sửa .env.local: dán SUPABASE_ACCESS_TOKEN
```

**Lưu ý:** Nếu trước đó bạn dán token vào `.env.example`, đó là nhầm file — token phải nằm trong `.env.local`.

### Deploy (Lovable / Supabase CLI)

Token trong **`supabase/.env.local`** (phải **Save file** — dòng `SUPABASE_ACCESS_TOKEN=sbp_...` không được trống).

```bash
cd "/Users/uranus/Documents/vibe coding/securitech"
set -a && source supabase/.env.local && set +a

npx supabase link --project-ref dwkmaaslsdqxebigoayj

# Function mới (mobile push)
npx supabase functions deploy push-dispatcher --no-verify-jwt

# Handler mobile (cập nhật push)
npx supabase functions deploy guard-handler
npx supabase functions deploy service-handler
npx supabase functions deploy sos-handler
```

Hoặc script:

```bash
./supabase/scripts/deploy-mobile-functions.sh
```

Deploy **tất cả** functions trong repo (từng tên):

```bash
set -a && source supabase/.env.local && set +a
npx supabase link --project-ref "$SUPABASE_PROJECT_REF"
for d in supabase/functions/*/; do
  fn=$(basename "$d")
  [[ "$fn" == "_shared" ]] && continue
  extra=""
  [[ "$fn" == "push-dispatcher" ]] && extra="--no-verify-jwt"
  npx supabase functions deploy "$fn" $extra
done
```

## SQL (Lovable / Dashboard — không cần access token)

Chạy theo thứ tự trong SQL Editor:

1. Migration `migrations/20260519120000_life_family.sql` (hoặc `db push`)
2. `scripts/STOS_MOBILE_FULL_SETUP.sql`
3. `scripts/SEED_MOBILE_DEMO.sql`
4. `scripts/SETUP_LIFE_TEST_ACCOUNT.sql`
5. `scripts/SEED_LIFE_FAMILY_DEMO.sql` — dữ liệu tab **Gia đình tôi**
6. `scripts/MOBILE_REALTIME_PUBLICATION.sql`
7. `scripts/MOBILE_PUSH_TRIGGERS.sql`

Deploy `life-handler` sau khi thêm action `family-dashboard` / `family-spending`.

## Tài liệu

- **Lovable tạo + deploy EF (khuyến nghị):** `../docs/LOVABLE_EDGE_FUNCTIONS_PROMPT.md` + `functions/FILES_FOR_LOVABLE.txt`
- SQL + webhook: `../docs/LOVABLE_MOBILE_BACKEND_PROMPT.md`
- Push + EAS: `../docs/MOBILE_PUSH_SETUP.md`
