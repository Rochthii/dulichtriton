# BẢNG ĐIỀU PHỐI REMEDIATION — HAI LUỒNG

> Phiên bản: 1.0 · Ngày lập: 2026-09-23 · Trạng thái: **EXECUTION AUTHORITY**
>
> Đây là tài liệu team dùng mỗi ngày. Chi tiết acceptance/rollback của từng ID nằm trong [12_PRODUCTION_REMEDIATION_PLAN.md](12_PRODUCTION_REMEDIATION_PLAN.md); mẫu một task một việc nằm trong [ATOMIC_TASK_TEMPLATE.md](ATOMIC_TASK_TEMPLATE.md).
>
> Claim/evidence/threat/invariant authority: [technical-spec/README.md](technical-spec/README.md). Task duy nhất đang mở: [ACTIVE_TASK.md](../ACTIVE_TASK.md).
>
> Model/effort cho từng task: [MODEL_ROUTING.md](technical-spec/MODEL_ROUTING.md). Khi task hoàn tất, completion record bắt buộc ghi `Luồng`, `AI route đề xuất`, `AI thực dùng`, `evidence` và `next task`.

## 1. Cách dùng

> ⚡ **CẬP NHẬT ĐIỀU HÀNH: GOM THÀNH 1 LUỒNG TUẦN TỰ DUY NHẤT**  
> Để tối ưu hóa sự tập trung và loại bỏ phân mảnh context, toàn bộ các task của Luồng A và Luồng B đã được hợp nhất thành một lộ trình tuần tự duy nhất trong [`ACTIVE_TASK.md`](../ACTIVE_TASK.md).  
> Tại mọi thời điểm, chỉ có **đúng 1 task duy nhất** active toàn dự án.

Board phân loại theo hai miền nghiệp vụ:
```text
Luồng A — chặn request nguy hiểm và sửa runtime application
Luồng B — khóa dữ liệu, database và chốt sự thật nghiệp vụ
```

Không chuyển task sang `done` vì đã merge. Chỉ chuyển `done` khi proof của task có trong PR/issue. Không mở package kế tiếp nếu exit gate của package trước chưa pass.

### Trạng thái dùng chung

| Trạng thái | Nghĩa |
|---|---|
| `not-ready` | dependency hoặc decision chưa có |
| `ready` | có đủ đầu vào để mở đúng một task nguyên tử |
| `active` | đang có đúng một task nguyên tử thực hiện |
| `verify` | code/migration xong, đang thu proof |
| `done` | acceptance criteria đã pass |
| `blocked` | cần owner hoặc quyết định ngoài engineering |

## 2. Bảng hiện hành

| Wave | Luồng A — App security | Luồng B — DB & data governance | AI route mặc định | Chỉ được bắt đầu khi | Exit gate |
|---|---|---|---|---|---|
| W0 | **A0. Emergency containment** — `P01-000`, `P01-001` done; `P01-002` designed | **B0. Quyền dữ liệu hiện tại** — `P00-001`, `P02-001`, `P02-002` done | A: Sol xhigh · B: Luna xhigh | Không có | Cả hai có inventory/proof và kill-switch hoạt động nếu G0 xác nhận public |
| W1 | **A1. Admin server authorization** — `P01-002` → `P01-019`, thêm `P01-029` sau `P01-008`; `P01-030` trước production cutover | **B1. RLS lockdown** — `P02-013` → `P02-022` done local; W1 Luồng B hoàn thành 100% | Sol xhigh | W0 done | Anonymous không mutation/read bảng nhạy cảm; admin mutation không còn dựa UI auth |
| W2 | **A2. Untrusted input boundary** — `P01-020` → `P01-028` | **B2. Database replay** — `P02-003`, `P02-004`, `P02-005`, `P02-006`, `P02-007`, `P02-008`, `P02-009`, `P02-010`, `P02-011` done local; tiếp theo `P02-012`, `P02-023`, `P02-024` | Sol xhigh | W1 done | SSRF/upload abuse bị chặn; DB trống replay và RLS matrix pass |
| W3 | **A3. AI integrity** — `P04-001` → `P04-023` | **B3. Quyết định địa lý/dữ liệu** — `P00-005` → `P00-009`, `P03-001` → `P03-013` | A: Sol xhigh · B: Astra xhigh | W2 done | AI chỉ tiêu thụ dữ liệu verified; G1/G2/G3 và review queue có owner |
| W4 | **A4. Privacy + reliability** — `P05-001` → `P05-018` | **B4. Canonical dataset + safe sync** — `P03-014` → `P03-028` | Sol xhigh | W3 done | Retention/ownership có test; UI/DB/RAG cùng canonical version |
| W5 | **A5. CI + release evidence** — `P05-019` → `P05-025`, `P07-001` → `P07-012` | **B5. Claim/document convergence** — `P06-001` → `P06-013` | A: Sol xhigh/Astra xhigh G4 · B: Luna medium | W4 done | G4 có đủ evidence để GO/NO-GO |

`→` nghĩa là các ID trong package được lấy **từng cái một**, đúng thứ tự, không mở đồng thời trong cùng luồng.

## 3. Thứ tự deploy bắt buộc

1. A0: nếu public, bật kill-switch trước mọi investigation khác.
2. B0/B1: lập matrix trước, rồi revoke quyền theo từng policy để không vô tình làm hỏng public read contract.
3. A1: chỉ bật lại admin mutation sau khi route đó đã có server-side authorization và test âm.
4. A2/B2: chỉ thực hiện sau W1 để các test không chạy trên bề mặt vẫn mở.
5. B4: chỉ chạy production sync sau G2, snapshot và dry-run pass; không có ngoại lệ.
6. W5: release owner là người duy nhất có quyền đổi trạng thái GO/NO-GO.

## 4. Mẫu vận hành một ngày

```text
Đầu ngày: chọn tối đa A-x.y và B-x.y từ wave đang mở.
Trong ngày: một PR/issue cho mỗi task; không kéo task của wave sau.
Cuối ngày: cập nhật proof hoặc chuyển blocked với câu hỏi/owner cụ thể.
Không có task ready: giải quyết Decision Gate, không tự bịa dữ liệu để đi tiếp.
```

## 5. Điểm cần owner quyết ngay

| Gate | Quyết định | Luồng bị chặn nếu chưa có |
|---|---|---|
| G0 | `done` — public URL, Vercel/Supabase usage và project owner/operator được ghi tại [Decision Record G0](technical-spec/DECISION_RECORD_G0.md); staging chưa rõ | A0 áp dụng task/owner riêng; G0 không tự xác nhận production security |
| G1 | Địa giới lịch sử hay mô hình 2025 | B3, B4 và tất cả claim địa danh |
| G2 | Dataset canonical và data owner | B4, RAG ingest, sync production |
| G3 | Retention/consent | A4 privacy |

## 6. Không được làm song song

- Không chạy Smart Delta Sync production song song với data reconciliation.
- Không sửa claim địa giới/POI trên UI song song với G1/G2 chưa chốt.
- Không mở admin mutation trước khi A1 và B1 cùng done.
- Không thực hiện migration destructive trong khi không có snapshot/rollback proof.

## 7. Dashboard khởi tạo

| Luồng | Active task đầu tiên | Trạng thái | Owner |
|---|---|---|---|
| A | `P01-029` — logout thu hồi đúng session | `ready` cho local implementation; P01-004/005/006/007/008 có test cục bộ; live credential/session cutover vẫn chờ backup, account hash và P01-003 deploy | Chưa gán |
| B | `P02-021` — Thu hồi anon write từ `semantic_chat_cache`; `Sol · xhigh` | `ready` cho local implementation — P02-020 pass trên PostgreSQL tạm; production rollout chờ Luồng A đồng bộ authorized admin management | Chăm Rốch Thi — product/project owner và platform operator theo project declarations |

G0 record: [Decision Record G0](technical-spec/DECISION_RECORD_G0.md). Public deployment đã được xác nhận; containment Luồng A vẫn theo task và owner riêng.

**Emergency P02-000 / blocker P01-003 (2026-09-24):** RLS/grants live `admin_users` đã khóa bằng migration `20260924083656_admin_users_rls_lockdown`; EV-10 verified tại DB boundary. P01-005 đã bỏ anon-key/env-password fallback trong source nhưng chưa deploy; P01-003 vẫn chờ backup, account hash và auth rollout proof. [Audit](technical-spec/CURRENT_STATE_AUDIT.md) lưu giới hạn evidence.
