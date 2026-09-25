# MODEL ROUTING — TASK NGUYÊN TỬ

> Chọn model theo rủi ro, mức mơ hồ và evidence cần tạo; không chọn theo thói quen hoặc dùng Astra cho mọi việc. Availability/reasoning setting phụ thuộc workspace hiện hành.

## 1. Quy tắc chọn model

| Loại task | Model / effort mặc định | Khi nào dùng | Không dùng khi |
|---|---|---|---|
| Sửa một dòng docs, format, trích xuất hẹp, tạo issue từ brief rõ | `Luna · low` | Scope một file/một record, acceptance hiển nhiên | Security/DB/business effect |
| Cập nhật docs phối hợp, inventory có scope rõ, reconcile context nhiều ứng dụng | `Luna · medium` hoặc `Luna · xhigh` | Cần tổng hợp nhưng không tự quyết policy | Có migration, auth hoặc ambiguity kiến trúc cao |
| Một route/component/script có test và judgment thông thường | `Sol · medium` | Coding hằng ngày, review scope vừa | Authorization/RLS/migration/sync/AI integrity |
| Auth, RLS, service role, SSRF, migration, Smart Delta Sync, AI retrieval/validator, privacy behavior hoặc regression security | `Sol · xhigh` | Cần đọc code/test kỹ và chứng minh business effect | Quyết định nguồn sự thật hoặc trade-off kiến trúc chưa rõ |
| Decision Gate mâu thuẫn nguồn, threat model mới, thay đổi kiến trúc lớn, release GO/NO-GO | `Astra · xhigh` | Cần phản biện đa chiều, nhiều boundary, recommendation có evidence | Tác vụ rõ và nhỏ có thể xử lý bằng Luna/Sol |

`Astra · medium` phù hợp khi công việc rộng nhưng brief/evidence đã rõ; không dùng nó thay cho owner hoặc nguồn chính thức.

## 2. Ánh xạ board hai luồng

| Wave | Luồng A — primary route | Luồng B — primary route | Escalate khi |
|---|---|---|---|
| W0 | `Sol · xhigh` cho kill-switch/admin containment | `Luna · xhigh` cho inventory G0/schema; `Astra · xhigh` nếu G0 mâu thuẫn | Không xác định được runtime/owner |
| W1 | `Sol · xhigh` | `Sol · xhigh` | Policy/RLS làm thay đổi public contract chưa rõ |
| W2 | `Sol · xhigh` | `Sol · xhigh` | Cần chọn geometry/geography hoặc migration strategy chưa có evidence |
| W3 | `Sol · xhigh` | `Astra · xhigh` cho G1/G2/G3 và data conflict | Nguồn chính thức hoặc kiến trúc AI mâu thuẫn |
| W4 | `Sol · xhigh` | `Sol · xhigh` | Sync/retention có business rule chưa owner phê duyệt |
| W5 | `Sol · xhigh`; `Astra · xhigh` riêng G4 | `Luna · medium` cho claim/doc occurrence | Release verdict hoặc risk acceptance |

Đây là default của work package. **Task card mới là authority cuối cùng**: task có thể chọn model nhẹ hơn nếu scope thực tế hẹp, hoặc escalate nếu evidence làm tăng rủi ro.

## 3. Completion record bắt buộc

Khi hoàn tất hoặc block một task, ghi tại `ACTIVE_TASK.md`/issue:

```text
Task: Pxx-xxx
Luồng: A | B
AI route đề xuất: <model · effort>
AI thực dùng: <model · effort | human-only>
Lý do: <scope/risk ngắn>
Evidence: <test/command/decision record>
Claim state: <trước> → <sau>
Next task: <ID | blocked reason>
```

AI chỉ đề xuất và thực thi trong quyền được cấp. Owner con người vẫn chịu trách nhiệm cho G0–G4, external facts, production writes và GO/NO-GO.
