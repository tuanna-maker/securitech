# Tài liệu Kiến trúc Repo & Lộ trình Monorepo ("Vibe Coding")

Tài liệu này mô tả **kiến trúc repo hiện tại** của E-Office Bateco và **lộ trình** để mở rộng sang mô hình Monorepo (như sơ đồ) nhằm bổ sung Mobile bằng **React Native (Expo)** và tăng khả năng chia sẻ code.

## 1. Trạng thái hiện tại (Repo hiện đang chạy)

```text
/ (Root)
├── backend/              # NestJS Backend (Prisma, PostgreSQL, Redis)
├── frontend/             # Vite + React Frontend
└── docs/                 # Tài liệu dự án
```

## 2. Mục tiêu kiến trúc (Target) theo “Vibe Coding”

Mục tiêu là tiến tới cấu trúc tương tự sơ đồ: Web + Mobile dùng chung types/validation, Backend là nguồn dữ liệu, Mobile là **React Native (Expo)**.

```text
/ (Root)
├── apps/
│   ├── api/              # (tùy chọn) nếu muốn đưa backend vào monorepo
│   ├── web/              # (tùy chọn) nếu muốn đưa frontend vào monorepo
│   └── mobile/           # React Native (Expo)
└── packages/
    ├── shared/           # Zod schemas + utils chung
    └── api-client/       # REST client + types (OpenAPI generated)
```

> [!NOTE]
> Hiện tại hệ thống Web đang gọi API qua **REST (Axios)** (không phải tRPC). Vì vậy hướng “type-safe” phù hợp nhất là **OpenAPI/Swagger → generate client & types**, thay vì tRPC.

## 3. Khuyến nghị: Type-safe API cho Web + Mobile (REST + OpenAPI)

Backend đã có Swagger tại `http://localhost:4000/api-docs`. Từ đây có thể:
- Export OpenAPI spec (JSON).
- Generate TypeScript types + client cho cả Web (`frontend/`) và Mobile (`mobile/`).

Kết quả:
- **Không viết lại type** giữa Web/Mobile.
- Hạn chế lỗi “lệch DTO” khi backend thay đổi.
- Mobile dùng chung cơ chế gọi API (Axios/fetch) + auth header.

## 4. Authentication thống nhất (Web + Mobile)

Hiện tại Web đang lưu auth state ở `localStorage` và gắn `Authorization: Bearer <token>` + `X-Branch-Id` bằng interceptor (`frontend/src/services/apiClient.ts`).
Khi có Mobile:
- **Token**: lưu bằng `Expo SecureStore`.
- **BranchId**: lưu cùng auth state và gắn vào header `X-Branch-Id` như Web.

## 5. Chiến lược chia sẻ code (khuyến nghị thực tế)

- **shared validation**: dùng `zod` để validate request/response/inputs ở Web + Mobile (không phụ thuộc UI).
- **api-client**: đặt lớp gọi REST + types (generated từ OpenAPI) để Web/Mobile dùng chung.
- **UI**: không cố “share UI 100%” ngay. React web (Tailwind) và RN UI khác hệ sinh thái; chỉ share design tokens/typography nếu cần.

## 6. Lộ trình triển khai Mobile React Native (Expo) trong repo hiện tại

Trong trạng thái hiện tại (chưa monorepo), đề xuất nhanh & ít rủi ro:
- Tạo thêm thư mục `mobile/` ở root (cùng cấp `backend/`, `frontend/`).
- Mobile gọi trực tiếp REST API của `backend/` qua base URL cấu hình theo môi trường.
- Khi dự án ổn định, mới cân nhắc chuyển sang monorepo (pnpm workspaces + Turborepo) để chia sẻ `packages/shared` và `packages/api-client`.

---
> [!TIP]
> Nếu muốn chuyển sang monorepo, ưu tiên **pnpm workspaces** + **Turborepo** để tăng tốc cài đặt/build và cache CI.
