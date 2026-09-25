# MẪU ISSUE — MỘT TASK, MỘT VIỆC

> Dùng mẫu này cho mọi ID trong `12_PRODUCTION_REMEDIATION_PLAN.md`. Một issue chỉ được có **một** thay đổi hoặc kiểm chứng. Nếu cần từ hai thay đổi, tách thành hai issue có dependency.

## Thông tin

- **ID:** `Pxx-xxx`
- **Phase:**
- **Luồng:** `A — App security` | `B — DB & data governance`
- **Owner:**
- **Risk / priority:**
- **Dependency:**
- **Decision Gate liên quan:**
- **Task class:** `docs` | `inventory` | `route` | `policy` | `migration` | `sync` | `AI integrity` | `decision` | `release`
- **AI route đề xuất:** `<Luna|Sol|Astra> · <effort>`
- **Lý do model:** một câu theo scope/risk; tham chiếu [MODEL_ROUTING.md](technical-spec/MODEL_ROUTING.md).

## Một mục tiêu duy nhất

Viết bằng động từ đơn và một đối tượng: ví dụ “Thu hồi anon INSERT từ `golden_answers`”, không viết “Sửa RLS và dọn dữ liệu”.

## Scope

- **Được sửa:** một route, một policy, một migration, một record, một component hoặc một document.
- **Không sửa:** nêu rõ boundary để ngăn scope creep.

## Evidence trước khi làm

- File/line, migration, route hoặc nguồn chính thức:
- Hành vi hiện tại tái tạo bằng:

## Thay đổi dự kiến

Mô tả đầu ra, không mô tả một refactor mở rộng.

## Acceptance criteria

- Một kết quả quan sát được:
- Một test/command cụ thể:
- Expected pass/fail:

## Rollback

Nêu migration down plan, feature flag hoặc cách trả lại behavior trước đó. Với thay đổi dữ liệu, phải chỉ snapshot/version khôi phục.

## Completion record

- **Luồng:** `A` | `B`
- **AI route đề xuất:**
- **AI thực dùng:** `<model · effort | human-only>`
- **Lý do thực tế:**
- **PR/commit:**
- **Test đã chạy:**
- **Kết quả:**
- **Claim state:** `<trước> → <sau>`
- **Risk mới phát hiện:**
- **Tài liệu cần cập nhật tiếp theo:**
