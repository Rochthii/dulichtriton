/**
 * @file chatDataInventory.ts
 * @description Quy chuẩn kiểm kê dữ liệu (Data Inventory / Data Catalog) cho hệ thống Chatbot AI Du Lịch Tri Tôn.
 * Cung cấp metadata định danh, mục đích xử lý, thời hạn lưu trữ, phân quyền vai trò (RLS Matrix)
 * và căn cứ pháp lý tuân thủ Nghị định 13/2023/NĐ-CP về Bảo vệ Dữ liệu Cá nhân.
 * 
 * Mã đặc tả: DATA-INVENTORY-CHAT-001 (P05-001)
 * Ban hành bởi: Chăm Rốch Thi (Lead Technical Architect)
 */

export type DataClassificationLevel = 'PUBLIC' | 'PSEUDONYMOUS' | 'CONFIDENTIAL' | 'RESTRICTED';

export type DatabaseOperation = 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE';

export interface RoleAccessPolicy {
  allowed: boolean;
  permissions: DatabaseOperation[];
  enforcement: string;
  rationale: string;
}

export interface RetentionPolicy {
  duration: string;
  unit: 'hours' | 'days' | 'months' | 'years' | 'indefinite';
  ttlHours: number;
  description: string;
  evictionMechanism: string;
  cleanupTrigger: string;
  indexReference: string;
}

export interface UserSubjectRights {
  canExport: boolean;
  canDelete: boolean;
  deletionPath: string;
  anonymizationApplied: boolean;
}

export interface GovernanceProvenance {
  governanceDocument: string;
  decisionGate: string;
  specificationContract: string;
  verifiedAt: string;
}

export interface ChatFieldInventoryItem {
  id: string;
  table: string;
  field: string;
  columnName: string;
  dataType: string;
  isNullable: boolean;
  isPrimaryKey: boolean;
  dataClassification: DataClassificationLevel;
  purpose: string;
  retention: RetentionPolicy;
  accessRoles: {
    anon: RoleAccessPolicy;
    authenticated: RoleAccessPolicy;
    serviceRole: RoleAccessPolicy;
    admin: RoleAccessPolicy;
  };
  legalBasis: string;
  securityControls: string[];
  userRights: UserSubjectRights;
  provenance: GovernanceProvenance;
}

/**
 * Bản ghi kiểm kê chuẩn tắc (Canonical Data Inventory Record)
 * dành riêng cho trường public.chat_sessions.session_id (P05-001).
 */
export const CANONICAL_CHAT_SESSION_ID_INVENTORY: Readonly<ChatFieldInventoryItem> = Object.freeze({
  id: 'INV-CHAT-SESSIONS-SESSION-ID-001',
  table: 'public.chat_sessions',
  field: 'public.chat_sessions.session_id',
  columnName: 'session_id',
  dataType: 'TEXT',
  isNullable: false,
  isPrimaryKey: true,
  dataClassification: 'PSEUDONYMOUS' as DataClassificationLevel,
  purpose: 'Định danh phiên hội thoại giả danh (pseudonymous session) nhằm duy trì ngữ cảnh trò chuyện đa lượt (multi-turn context continuity) cho du khách, thực hiện cô lập phiên (session isolation) và kiểm soát quyền sở hữu phiên (ownership authentication token) ngăn chặn truy cập trái phép hoặc đánh cắp lịch sử.',
  retention: {
    duration: '24 hours',
    unit: 'hours' as const,
    ttlHours: 24,
    description: 'Phiên trò chuyện được lưu tạm trong 24 giờ kể từ thời điểm hoạt động cuối cùng (updated_at). Sau 24 giờ không có tương tác mới, phiên hết hạn và đủ điều kiện để bị thu hồi/xóa vĩnh viễn.',
    evictionMechanism: 'Time-To-Live (TTL) eviction dựa trên cột updated_at, được tự động hóa qua tiến trình scheduled job hoặc API xóa phiên.',
    cleanupTrigger: 'Job quét tự động định kỳ (P05-003) hoặc yêu cầu hủy phiên chủ động từ người dùng (P05-005).',
    indexReference: 'public.chat_sessions.chat_sessions_updated_at_idx'
  },
  accessRoles: {
    anon: {
      allowed: false,
      permissions: [] as DatabaseOperation[],
      enforcement: 'Thu hồi toàn bộ (Zero Trust): REVOKE SELECT, INSERT, UPDATE, DELETE ON public.chat_sessions FROM anon.',
      rationale: 'Ngăn chặn kẻ tấn công ẩn danh quét duyệt hoặc sửa đổi phiên của du khách khác trực tiếp qua PostgREST client (P02-014, P02-015).'
    },
    authenticated: {
      allowed: false,
      permissions: [] as DatabaseOperation[],
      enforcement: 'Tuân thủ Row Level Security (RLS) mặc định chặn toàn bộ nếu không qua server-side boundary.',
      rationale: 'Mọi truy vấn hội thoại phải đi qua Next.js Server API có xác thực chữ ký token sở hữu (HMAC-SHA256).'
    },
    serviceRole: {
      allowed: true,
      permissions: ['SELECT', 'INSERT', 'UPDATE', 'DELETE'] as DatabaseOperation[],
      enforcement: 'Server-side API Gateway boundary (Next.js App Router API Routes).',
      rationale: 'Dành riêng cho máy chủ nội bộ thực hiện tra cứu lịch sử và lưu vết turns sau khi đã kiểm thực token sở hữu phiên thành công (P04-005).'
    },
    admin: {
      allowed: false,
      permissions: [] as DatabaseOperation[],
      enforcement: 'Admin Dashboard không đọc trực tiếp bảng chat_sessions thô.',
      rationale: 'Bảo vệ quyền riêng tư du khách; quản trị viên chỉ được quan sát các chỉ số vận hành tổng hợp (AI Metrics, Audit Logs) qua service_role có ghi log kiểm toán.'
    }
  },
  legalBasis: 'Điều 17 Nghị định 13/2023/NĐ-CP (Xử lý dữ liệu cá nhân phục vụ cung cấp dịch vụ theo yêu cầu của chủ thể dữ liệu) & Lợi ích hợp pháp trong vận hành hệ thống thông tin phục vụ cộng đồng.',
  securityControls: [
    'UUID v4 RFC 4122 Canonical Format Enforcement (CHAT-SESSION-ID-CONTRACT-V1)',
    'HMAC-SHA256 Session Ownership Token Verification with timingSafeEqual (CHAT-SESSION-OWNERSHIP-CONTRACT-V1)',
    'PostgreSQL Row Level Security (RLS) Lockdown với quyền anon bị tước bỏ 100%',
    'Indexes trên updated_at phục vụ TTL Cleanup có giới hạn tài nguyên'
  ],
  userRights: {
    canExport: true,
    canDelete: true,
    deletionPath: 'POST /api/v1/chat/session/delete (yêu cầu ownership token) hoặc xóa localStorage tại trình duyệt client.',
    anonymizationApplied: true
  },
  provenance: {
    governanceDocument: 'docs/technical-spec/CHAT_DATA_INVENTORY.md',
    decisionGate: 'Decision Gate G3 (Privacy & Observability)',
    specificationContract: 'DATA-INVENTORY-CHAT-001',
    verifiedAt: '2026-10-02T10:45:00+07:00'
  }
});

/**
 * Danh bạ kiểm kê tất cả các trường dữ liệu chat đã đăng ký chính thức.
 */
export const REGISTERED_CHAT_FIELD_INVENTORIES: readonly ChatFieldInventoryItem[] = Object.freeze([
  CANONICAL_CHAT_SESSION_ID_INVENTORY
]);

/**
 * Tra cứu thông tin kiểm kê dữ liệu theo bảng và tên trường.
 */
export function getChatFieldInventory(table: string, field: string): ChatFieldInventoryItem | null {
  const normalizedTable = table.trim().toLowerCase();
  const normalizedField = field.trim().toLowerCase();

  const found = REGISTERED_CHAT_FIELD_INVENTORIES.find((item) => {
    const itemTable = item.table.toLowerCase();
    const itemField = item.field.toLowerCase();
    const itemCol = item.columnName.toLowerCase();

    return (
      itemTable === normalizedTable &&
      (itemField === normalizedField || itemCol === normalizedField)
    );
  });

  return found || null;
}

/**
 * Thẩm định tính đầy đủ và hợp lệ của một bản ghi Data Inventory (Fail-Closed Gate).
 * Bắt buộc phải có đủ 4 yếu tố cốt lõi: field, purpose, retention, accessRoles.
 */
export function validateFieldInventory(item: unknown): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!item || typeof item !== 'object') {
    return { valid: false, errors: ['Inventory item phải là một object không null'] };
  }

  const rec = item as Partial<ChatFieldInventoryItem>;

  // 1. Kiểm tra field
  if (!rec.field || typeof rec.field !== 'string' || rec.field.trim().length === 0) {
    errors.push('Thiếu hoặc không hợp lệ: field');
  }

  // 2. Kiểm tra purpose
  if (!rec.purpose || typeof rec.purpose !== 'string' || rec.purpose.trim().length < 15) {
    errors.push('Thiếu hoặc mục đích xử lý quá ngắn (< 15 ký tự): purpose');
  }

  // 3. Kiểm tra retention
  if (!rec.retention || typeof rec.retention !== 'object') {
    errors.push('Thiếu cấu hình thời hạn lưu trữ: retention');
  } else {
    if (!rec.retention.duration || typeof rec.retention.duration !== 'string') {
      errors.push('retention.duration không hợp lệ');
    }
    if (!rec.retention.description || typeof rec.retention.description !== 'string') {
      errors.push('retention.description không hợp lệ');
    }
    if (typeof rec.retention.ttlHours !== 'number' || rec.retention.ttlHours <= 0) {
      errors.push('retention.ttlHours phải là số dương');
    }
  }

  // 4. Kiểm tra accessRoles
  if (!rec.accessRoles || typeof rec.accessRoles !== 'object') {
    errors.push('Thiếu phân quyền vai trò: accessRoles');
  } else {
    const roles: (keyof ChatFieldInventoryItem['accessRoles'])[] = ['anon', 'authenticated', 'serviceRole', 'admin'];
    for (const r of roles) {
      const rolePolicy = rec.accessRoles[r];
      if (!rolePolicy || typeof rolePolicy !== 'object') {
        errors.push(`Thiếu cấu hình quyền cho role: ${r}`);
      } else {
        if (typeof rolePolicy.allowed !== 'boolean') {
          errors.push(`Thiếu cờ boolean allowed cho role: ${r}`);
        }
        if (!Array.isArray(rolePolicy.permissions)) {
          errors.push(`permissions cho role ${r} phải là mảng`);
        }
        if (!rolePolicy.enforcement || typeof rolePolicy.enforcement !== 'string') {
          errors.push(`Thiếu phương thức thực thi enforcement cho role: ${r}`);
        }
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
