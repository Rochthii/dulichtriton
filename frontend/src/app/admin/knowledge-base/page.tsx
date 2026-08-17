'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Brain,
  Plus,
  Search,
  RefreshCw,
  Edit3,
  Trash2,
  CheckCircle2,
  XCircle,
  Sparkles,
  Tag,
  Sliders,
  Utensils,
  MapPin,
  Calendar,
  Compass,
  AlertTriangle,
  FileText,
  X,
  Eye,
  Check,
  ChevronRight,
} from 'lucide-react';

interface KnowledgeItem {
  id: string;
  title: string;
  category: 'food' | 'place' | 'festival' | 'transport' | 'emergency' | 'general';
  keywords: string[];
  content: string;
  is_active: boolean;
  priority: number;
  author: string;
  created_at: string;
  updated_at: string;
}

const CATEGORIES = [
  { key: 'all', label: 'Tất Cả', icon: Brain, color: 'bg-slate-100 text-slate-700 border-slate-200' },
  { key: 'food', label: 'Ẩm Thực', icon: Utensils, color: 'bg-amber-100 text-amber-800 border-amber-200' },
  { key: 'place', label: 'Địa Điểm & Chùa', icon: MapPin, color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  { key: 'festival', label: 'Lễ Hội', icon: Calendar, color: 'bg-rose-100 text-rose-800 border-rose-200' },
  { key: 'transport', label: 'Giao Thông', icon: Compass, color: 'bg-blue-100 text-blue-800 border-blue-200' },
  { key: 'emergency', label: 'Cứu Hộ / Khẩn Cấp', icon: AlertTriangle, color: 'bg-red-100 text-red-800 border-red-200' },
  { key: 'general', label: 'Lưu Ý Chung', icon: FileText, color: 'bg-purple-100 text-purple-800 border-purple-200' },
];

export default function AdminKnowledgeBasePage() {
  const [items, setItems] = useState<KnowledgeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activeOnly, setActiveOnly] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<KnowledgeItem | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState<'food' | 'place' | 'festival' | 'transport' | 'emergency' | 'general'>('food');
  const [formKeywords, setFormKeywords] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formPriority, setFormPriority] = useState(8);
  const [formIsActive, setFormIsActive] = useState(true);
  const [formAuthor, setFormAuthor] = useState('Admin');
  const [isSaving, setIsSaving] = useState(false);
  const [previewTab, setPreviewTab] = useState<'edit' | 'preview'>('edit');

  // Delete State
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Notification
  const [toastMsg, setToastMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMsg({ text, type });
    setTimeout(() => setToastMsg(null), 3500);
  };

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/admin/knowledge-base');
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setItems(data.data);
      } else {
        setItems([]);
      }
    } catch (err: any) {
      showToast('Lỗi kết nối khi tải tri thức: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const openCreateModal = () => {
    setEditingItem(null);
    setFormTitle('');
    setFormCategory('food');
    setFormKeywords('');
    setFormContent('');
    setFormPriority(8);
    setFormIsActive(true);
    setFormAuthor('Admin');
    setPreviewTab('edit');
    setIsModalOpen(true);
  };

  const openEditModal = (item: KnowledgeItem) => {
    setEditingItem(item);
    setFormTitle(item.title);
    setFormCategory(item.category);
    setFormKeywords(Array.isArray(item.keywords) ? item.keywords.join(', ') : '');
    setFormContent(item.content);
    setFormPriority(item.priority || 5);
    setFormIsActive(item.is_active);
    setFormAuthor(item.author || 'Admin');
    setPreviewTab('edit');
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formContent.trim()) {
      showToast('Vui lòng nhập tiêu đề và nội dung tri thức', 'error');
      return;
    }

    setIsSaving(true);
    const parsedKeywords = formKeywords
      .split(',')
      .map(k => k.trim())
      .filter(Boolean);

    const payload = {
      title: formTitle.trim(),
      category: formCategory,
      keywords: parsedKeywords,
      content: formContent.trim(),
      priority: Number(formPriority),
      is_active: formIsActive,
      author: formAuthor.trim() || 'Admin',
    };

    try {
      const url = editingItem
        ? `/api/v1/admin/knowledge-base/${editingItem.id}`
        : '/api/v1/admin/knowledge-base';
      const method = editingItem ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (!res.ok || !result.success) {
        throw new Error(result.error || 'Lưu thất bại');
      }

      showToast(
        editingItem
          ? 'Đã cập nhật tri thức thành công!'
          : 'Đã thêm tri thức mới vào bộ não AI!'
      );
      setIsModalOpen(false);
      fetchItems();
    } catch (err: any) {
      showToast('Lỗi lưu: ' + err.message, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleActive = async (item: KnowledgeItem) => {
    const nextState = !item.is_active;
    try {
      const res = await fetch(`/api/v1/admin/knowledge-base/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: nextState }),
      });
      const result = await res.json();
      if (result.success) {
        setItems(prev =>
          prev.map(i => (i.id === item.id ? { ...i, is_active: nextState } : i))
        );
        showToast(
          nextState
            ? `Đã KÍCH HOẠT tri thức "${item.title}"`
            : `Đã TẠM NGƯNG tri thức "${item.title}"`
        );
      }
    } catch {
      showToast('Không thể thay đổi trạng thái', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/v1/admin/knowledge-base/${id}`, {
        method: 'DELETE',
      });
      const result = await res.json();
      if (result.success) {
        setItems(prev => prev.filter(i => i.id !== id));
        showToast('Đã xóa tri thức khỏi CSDL');
        setDeleteConfirmId(null);
      } else {
        throw new Error(result.error);
      }
    } catch (err: any) {
      showToast('Lỗi xóa: ' + err.message, 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  // Filtered list
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      if (activeOnly && !item.is_active) return false;
      if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;
      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase();
      const matchTitle = item.title?.toLowerCase().includes(q);
      const matchContent = item.content?.toLowerCase().includes(q);
      const matchKeywords = Array.isArray(item.keywords)
        ? item.keywords.some(k => String(k).toLowerCase().includes(q))
        : false;

      return matchTitle || matchContent || matchKeywords;
    });
  }, [items, selectedCategory, activeOnly, searchQuery]);

  const activeCount = items.filter(i => i.is_active).length;

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMsg && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-xl border text-xs font-bold flex items-center gap-2.5 animate-bounce ${
            toastMsg.type === 'success'
              ? 'bg-emerald-950 text-emerald-200 border-emerald-800'
              : 'bg-rose-950 text-rose-200 border-rose-800'
          }`}
        >
          {toastMsg.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          ) : (
            <XCircle className="w-4 h-4 text-rose-400" />
          )}
          <span>{toastMsg.text}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#1B4D3E] via-[#0E8C7F] to-[#12382D] p-6 md:p-8 rounded-3xl text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-amber-300 text-xs font-bold">
              <Brain className="w-4 h-4" />
              <span>Q&A Semantic Truth Control</span>
            </div>
            <h1 className="font-heading text-2xl md:text-3xl font-extrabold tracking-tight">
              Quản Lý Tri Thức & Hỏi Đáp AI Bản Địa
            </h1>
            <p className="text-xs md:text-sm text-emerald-100 max-w-2xl font-body">
              Thêm, sửa và đính chính các câu trả lời chuẩn xác. Tri thức được nạp tự động vào bộ não RAG Engine với độ ưu tiên số 1, giúp AI giải đáp chính xác 100% cho du khách.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={fetchItems}
              disabled={loading}
              className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-all cursor-pointer"
              title="Làm mới dữ liệu"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={openCreateModal}
              className="px-5 py-3 rounded-2xl bg-[#F0A32F] hover:bg-[#D99B26] text-slate-950 text-xs font-extrabold flex items-center gap-2 shadow-md transition-all cursor-pointer font-display active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm Tri Thức Mới</span>
            </button>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-white/10">
          <div className="bg-white/5 backdrop-blur-xs rounded-2xl p-3 border border-white/10">
            <div className="text-[11px] text-emerald-200">Tổng Số Tri Thức</div>
            <div className="text-xl font-extrabold font-mono text-white mt-0.5">{items.length}</div>
          </div>
          <div className="bg-white/5 backdrop-blur-xs rounded-2xl p-3 border border-white/10">
            <div className="text-[11px] text-emerald-200">Đang Kích Hoạt</div>
            <div className="text-xl font-extrabold font-mono text-amber-300 mt-0.5">{activeCount}</div>
          </div>
          <div className="bg-white/5 backdrop-blur-xs rounded-2xl p-3 border border-white/10">
            <div className="text-[11px] text-emerald-200">Độ Ưu Tiên Cao (≥8)</div>
            <div className="text-xl font-extrabold font-mono text-emerald-300 mt-0.5">
              {items.filter(i => i.priority >= 8).length}
            </div>
          </div>
          <div className="bg-white/5 backdrop-blur-xs rounded-2xl p-3 border border-white/10">
            <div className="text-[11px] text-emerald-200">Tốc Độ Phản Hồi RAG</div>
            <div className="text-xl font-extrabold font-mono text-cyan-300 mt-0.5">~0ms (RAM)</div>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 md:p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        {/* Search & Toggle */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm theo tiêu đề, từ khóa, nội dung tri thức..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 text-xs focus:outline-none focus:border-[#0E8C7F] focus:ring-2 focus:ring-[#0E8C7F]/20 bg-slate-50 font-body"
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-semibold text-slate-700 shrink-0 px-3 py-2 rounded-2xl bg-slate-50 border border-slate-200">
            <input
              type="checkbox"
              checked={activeOnly}
              onChange={e => setActiveOnly(e.target.checked)}
              className="w-4 h-4 rounded-md accent-[#0E8C7F]"
            />
            <span>Chỉ hiện mục Đang Bật</span>
          </label>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          {CATEGORIES.map(c => {
            const Icon = c.icon;
            const isSelected = selectedCategory === c.key;
            return (
              <button
                key={c.key}
                onClick={() => setSelectedCategory(c.key)}
                className={`px-3.5 py-2 rounded-xl font-semibold flex items-center gap-1.5 shrink-0 transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#1B4D3E] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{c.label}</span>
                {c.key !== 'all' && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {items.filter(i => i.category === c.key).length}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Knowledge Items Grid / List */}
      {loading ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200">
          <RefreshCw className="w-6 h-6 animate-spin text-[#0E8C7F] mx-auto mb-2" />
          <p className="text-xs text-slate-500 font-semibold">Đang tải danh sách tri thức AI...</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
          <Brain className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="font-heading font-bold text-slate-800 text-sm">Chưa có tri thức nào</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto font-body">
            Không tìm thấy bản ghi nào khớp với điều kiện tìm kiếm. Hãy nhấn nút &quot;Thêm Tri Thức Mới&quot; để bổ sung tri thức cho Chatbot.
          </p>
          <button
            onClick={openCreateModal}
            className="px-4 py-2 rounded-xl bg-[#1B4D3E] text-white text-xs font-bold inline-flex items-center gap-2 cursor-pointer shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Thêm tri thức ngay</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredItems.map(item => {
            const catObj = CATEGORIES.find(c => c.key === item.category) || CATEGORIES[CATEGORIES.length - 1];
            const CatIcon = catObj.icon;

            return (
              <div
                key={item.id}
                className={`bg-white p-5 rounded-3xl border transition-all hover:shadow-md flex flex-col justify-between ${
                  item.is_active
                    ? 'border-slate-200'
                    : 'border-slate-200/60 opacity-60 bg-slate-50/50'
                }`}
              >
                <div className="space-y-3">
                  {/* Top Bar */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-bold border ${catObj.color}`}>
                          <CatIcon className="w-3 h-3" />
                          <span>{catObj.label}</span>
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-mono font-bold">
                          Ưu tiên: {item.priority}/10
                        </span>
                      </div>
                      <h3 className="font-heading font-extrabold text-sm text-slate-900 leading-snug">
                        {item.title}
                      </h3>
                    </div>

                    {/* Active Toggle Switch */}
                    <button
                      onClick={() => handleToggleActive(item)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        item.is_active ? 'bg-emerald-600' : 'bg-slate-300'
                      }`}
                      title={item.is_active ? 'Nhấn để Tạm Ngưng' : 'Nhấn để Bật'}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                          item.is_active ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Keywords Pills */}
                  {Array.isArray(item.keywords) && item.keywords.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <Tag className="w-3 h-3 text-slate-400 shrink-0" />
                      {item.keywords.map((kw, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium"
                        >
                          #{kw}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Content Preview */}
                  <p className="text-xs text-slate-600 font-body leading-relaxed line-clamp-4 bg-slate-50 p-3 rounded-2xl border border-slate-100 whitespace-pre-line">
                    {item.content}
                  </p>
                </div>

                {/* Footer Controls */}
                <div className="flex items-center justify-between gap-2 mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400">
                  <div className="flex items-center gap-1 font-mono">
                    <span>Tác giả: {item.author || 'Admin'}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => openEditModal(item)}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center gap-1 transition-all cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Sửa</span>
                    </button>

                    <button
                      onClick={() => setDeleteConfirmId(item.id)}
                      className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold flex items-center gap-1 transition-all cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Xóa</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Add / Edit Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="p-6 bg-gradient-to-r from-[#1B4D3E] to-[#0E8C7F] text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Brain className="w-5 h-5 text-amber-300" />
                <h2 className="font-heading font-extrabold text-base md:text-lg">
                  {editingItem ? 'Chỉnh Sửa Tri Thức AI' : 'Thêm Tri Thức & Quy Tắc Mới'}
                </h2>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSave} className="p-6 space-y-4">
              {/* Title */}
              <div>
                <label className="block text-xs font-extrabold text-slate-800 mb-1">
                  Tiêu đề Tri thức / Câu hỏi chuẩn <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={e => setFormTitle(e.target.value)}
                  placeholder="Ví dụ: Giờ mở cửa & hotline Quán Gà Đốt Thành Đạt..."
                  className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-xs focus:outline-none focus:border-[#0E8C7F] focus:ring-2 focus:ring-[#0E8C7F]/20 font-body"
                />
              </div>

              {/* Category & Priority Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-extrabold text-slate-800 mb-1">
                    Phân loại Danh mục
                  </label>
                  <select
                    value={formCategory}
                    onChange={e => setFormCategory(e.target.value as any)}
                    className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-xs focus:outline-none focus:border-[#0E8C7F] bg-white font-body"
                  >
                    <option value="food">🍗 Ẩm Thực & Đặc Sản</option>
                    <option value="place">🏛️ Địa Điểm & Chùa Tháp</option>
                    <option value="festival">🎈 Lễ Hội & Sự Kiện</option>
                    <option value="transport">🛵 Giao Thông & Đường Đi</option>
                    <option value="emergency">🚨 Cứu Hộ / SOS Khẩn Cấp</option>
                    <option value="general">📋 Lưu Ý & Văn Hóa Chung</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-800 mb-1">
                    Độ ưu tiên nạp RAG (1 - 10): <span className="text-emerald-700 font-mono font-bold">{formPriority}/10</span>
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={formPriority}
                    onChange={e => setFormPriority(Number(e.target.value))}
                    className="w-full accent-[#0E8C7F] mt-2"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                    <span>1: Tham khảo</span>
                    <span>5: Tiêu chuẩn</span>
                    <span>10: Tuyệt đối ưu tiên</span>
                  </div>
                </div>
              </div>

              {/* Keywords */}
              <div>
                <label className="block text-xs font-extrabold text-slate-800 mb-1">
                  Từ khóa nhận diện bắt câu hỏi (cách nhau bằng dấu phẩy)
                </label>
                <input
                  type="text"
                  value={formKeywords}
                  onChange={e => setFormKeywords(e.target.value)}
                  placeholder="Ví dụ: thành đạt, gà đốt thành đạt, quán thành đạt, ô thum thành đạt..."
                  className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-xs focus:outline-none focus:border-[#0E8C7F] font-mono"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Khi du khách hỏi câu chứa bất kỳ từ khóa nào ở đây, AI sẽ tự động kích hoạt tri thức này.
                </p>
              </div>

              {/* Content with Edit/Preview Tabs */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-extrabold text-slate-800">
                    Nội dung Tri thức Chuẩn xác Bản địa <span className="text-rose-500">*</span>
                  </label>
                  <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-xl text-[10px] font-bold">
                    <button
                      type="button"
                      onClick={() => setPreviewTab('edit')}
                      className={`px-2.5 py-1 rounded-lg transition-all ${
                        previewTab === 'edit' ? 'bg-white shadow-xs text-slate-800' : 'text-slate-500'
                      }`}
                    >
                      Soạn Thảo
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewTab('preview')}
                      className={`px-2.5 py-1 rounded-lg transition-all ${
                        previewTab === 'preview' ? 'bg-white shadow-xs text-slate-800' : 'text-slate-500'
                      }`}
                    >
                      Xem Trước
                    </button>
                  </div>
                </div>

                {previewTab === 'edit' ? (
                  <textarea
                    rows={6}
                    required
                    value={formContent}
                    onChange={e => setFormContent(e.target.value)}
                    placeholder="Nhập thông tin xác minh thực địa: Địa chỉ cụ thể, mức giá, giờ mở cửa, mẹo đi lại, khuyến cáo an toàn..."
                    className="w-full p-4 rounded-2xl border border-slate-200 text-xs focus:outline-none focus:border-[#0E8C7F] focus:ring-2 focus:ring-[#0E8C7F]/20 font-body leading-relaxed"
                  />
                ) : (
                  <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 min-h-[140px] text-xs font-body leading-relaxed text-slate-700 whitespace-pre-line">
                    {formContent.trim() ? (
                      formContent
                    ) : (
                      <span className="text-slate-400 italic">Chưa có nội dung xem trước...</span>
                    )}
                  </div>
                )}
              </div>

              {/* Status & Author */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-extrabold text-slate-800">
                  <input
                    type="checkbox"
                    checked={formIsActive}
                    onChange={e => setFormIsActive(e.target.checked)}
                    className="w-4 h-4 rounded-md accent-[#0E8C7F]"
                  />
                  <span>Kích hoạt ngay vào bộ não AI</span>
                </label>

                <div className="text-[11px] text-slate-400 font-mono">
                  Biên soạn bởi: <span className="font-bold text-slate-600">{formAuthor}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-100 transition-all cursor-pointer"
                >
                  Hủy Bỏ
                </button>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-xl bg-[#1B4D3E] hover:bg-[#12382D] text-white text-xs font-extrabold flex items-center gap-2 shadow-md transition-all cursor-pointer active:scale-95 disabled:opacity-50"
                >
                  {isSaving ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4 text-amber-300" />
                  )}
                  <span>{editingItem ? 'Lưu Thay Đổi' : 'Thêm Vào CSDL'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md p-6 rounded-3xl shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="font-heading font-extrabold text-base text-slate-900">
                Xác nhận xóa tri thức này?
              </h3>
              <p className="text-xs text-slate-500 font-body">
                Hành động này sẽ xóa vĩnh viễn bản ghi khỏi CSDL và ghi nhận vào Audit Log. Chatbot AI sẽ không còn sử dụng tri thức này nữa.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                disabled={isDeleting}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-100 transition-all cursor-pointer"
              >
                Hủy
              </button>

              <button
                onClick={() => handleDelete(deleteConfirmId)}
                disabled={isDeleting}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
              >
                {isDeleting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>Xác nhận Xóa</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
