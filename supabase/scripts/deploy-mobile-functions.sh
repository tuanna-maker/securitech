#!/usr/bin/env bash
# Deploy STOS mobile edge functions (đọc token từ supabase/.env.local)
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
ENV_FILE="$ROOT/supabase/.env.local"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "Thiếu $ENV_FILE — chạy: cp supabase/.env.example supabase/.env.local và điền SUPABASE_ACCESS_TOKEN"
  exit 1
fi

set -a
# shellcheck disable=SC1090
source "$ENV_FILE"
set +a

if [[ -z "${SUPABASE_ACCESS_TOKEN:-}" ]]; then
  echo "SUPABASE_ACCESS_TOKEN trống trong $ENV_FILE"
  exit 1
fi

REF="${SUPABASE_PROJECT_REF:-dwkmaaslsdqxebigoayj}"
cd "$ROOT"

echo "Link project $REF ..."
npx supabase link --project-ref "$REF"

FUNCS=(push-dispatcher guard-handler service-handler sos-handler)
for fn in "${FUNCS[@]}"; do
  echo "Deploy $fn ..."
  if [[ "$fn" == "push-dispatcher" ]]; then
    npx supabase functions deploy "$fn" --no-verify-jwt
  else
    npx supabase functions deploy "$fn"
  fi
done

echo "Done."
