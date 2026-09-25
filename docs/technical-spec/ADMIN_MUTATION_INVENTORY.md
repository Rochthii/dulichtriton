# ADMIN MUTATION INVENTORY

> Evidence cho `P01-001` · Quan sát source tree hiện tại, 2026-09-24. “Owner” dưới đây là **chưa gán** cho đến G0; không suy diễn người chịu trách nhiệm từ đường dẫn code.

## Phạm vi và quy tắc phân loại

- **Business mutation:** thay đổi DB, cache, storage hoặc kích hoạt outbound action có tác động vận hành.
- **Auth lifecycle:** login/logout; không phải thay đổi nội dung du lịch, nhưng vẫn có thể ghi audit/session và phải được P01-A bảo vệ.
- `P01-000` hiện chặn mọi business route trong bảng khi `ADMIN_MUTATIONS_ENABLED !== 'true'`. Nó loại trừ `/admin/auth/*` có chủ đích.

## Inventory

| Route | Methods | Resource / effect | Owner | Kill-switch |
|---|---|---|---|---|
| `/api/v1/admin/places` | POST, PATCH, DELETE | `places`; audit; POST còn gọi Gemini embedding | Data owner — unassigned | Blocked |
| `/api/v1/admin/videos` | POST, PATCH, DELETE | `video_discoveries`; audit | Content owner — unassigned | Blocked |
| `/api/v1/admin/videos/ai-scan` | POST | TikTok fetch; upsert `video_discoveries`; audit | Content owner — unassigned | Blocked |
| `/api/v1/admin/upload` | POST | Cloudinary upload/external storage | Platform owner — unassigned | Blocked |
| `/api/v1/admin/itineraries` | POST, PATCH, DELETE | `preset_itineraries`; audit | Data owner — unassigned | Blocked |
| `/api/v1/admin/knowledge-base` | POST | `custom_knowledge_base`; audit | AI/data owner — unassigned | Blocked |
| `/api/v1/admin/knowledge-base/:id` | PUT, DELETE | `custom_knowledge_base`; audit | AI/data owner — unassigned | Blocked |
| `/api/v1/admin/feedbacks` | PATCH | `feedbacks` review status/notes | Content owner — unassigned | Blocked |
| `/api/v1/admin/feedback` | POST, PATCH | POST creates public correction report in `audit_logs`; PATCH resolves audit entry | **Public intake + content owner — unassigned** | Blocked |
| `/api/v1/admin/revalidate` | POST | Server/place cache invalidation | Platform owner — unassigned | Blocked |
| `/api/v1/admin/gmaps-scraper` | POST | External fetch; optional `places` image/photo update when `autoSync=true` | Data owner — unassigned | Blocked |
| `/api/v1/admin/scrape-images` | POST | External URL fetch and image extraction; no direct persistent DB write observed | Content owner — unassigned | Blocked |
| `/api/v1/admin/auth/login` | POST | Auth cookie; writes `audit_logs` for login success/failure | Platform owner — unassigned | **Excluded** |
| `/api/v1/admin/auth/logout` | POST | Deletes admin auth cookie | Platform owner — unassigned | **Excluded** |

## Coverage result

- **20** business mutation method-route pairs across **12** non-auth routes.
- **2** auth lifecycle method-route pairs, excluded from the temporary kill-switch.
- No mutation method observed in `stats`, `ai-metrics`, `audit-logs` or `auth/me`.

## Required follow-up boundaries

1. `P01-009` creates server-side authorization common guard; P01-010 through P01-018 apply it per business route.
2. `P01-005` through `P01-008` secure login/session and remove forged-cookie behavior; auth routes must not remain trusted merely because P01-000 excludes them.
3. Product owner must decide whether public correction intake stays under `/api/v1/admin/feedback`; until then it is correctly contained by the kill-switch.
4. G0 assigns actual owners before mutation is re-enabled in any environment.

## Source evidence

- [places route](../../frontend/src/app/api/v1/admin/places/route.ts)
- [videos route](../../frontend/src/app/api/v1/admin/videos/route.ts)
- [itineraries route](../../frontend/src/app/api/v1/admin/itineraries/route.ts)
- [knowledge-base routes](../../frontend/src/app/api/v1/admin/knowledge-base/route.ts)
- [feedback route](../../frontend/src/app/api/v1/admin/feedback/route.ts)
- [middleware kill-switch](../../frontend/src/middleware.ts)
