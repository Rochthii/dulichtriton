'use client';

import React, { useState, useEffect, useMemo } from 'react';
import KnowledgeStatsBar from '@/components/admin/knowledge/KnowledgeStatsBar';
import KnowledgeTable, { KnowledgeItem } from '@/components/admin/knowledge/KnowledgeTable';
import KnowledgeModal from '@/components/admin/knowledge/KnowledgeModal';

export default function AdminKnowledgeBasePage() {
  const [items, setItems] = useState<KnowledgeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [editingItem, setEditingItem] = useState<KnowledgeItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
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

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = (item.title || '').toLowerCase().includes(q);
        const matchContent = (item.content || '').toLowerCase().includes(q);
        const matchKeywords = (item.keywords || []).some((k) => k.toLowerCase().includes(q));
        if (!matchTitle && !matchContent && !matchKeywords) return false;
      }
      return true;
    });
  }, [items, selectedCategory, searchQuery]);

  const activeCount = useMemo(() => {
    return items.filter((i) => i.is_active).length;
  }, [items]);

  const handleSave = async (payload: Partial<KnowledgeItem>) => {
    setSaving(true);
    try {
      const isEdit = Boolean(editingItem);
      const url = isEdit ? `/api/v1/admin/knowledge-base/${editingItem?.id}` : '/api/v1/admin/knowledge-base';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const resData = await res.json();
      if (resData.success) {
        showToast(isEdit ? 'Đã cập nhật tri thức thành công!' : 'Đã tạo tri thức mới thành công!');
        setIsModalOpen(false);
        setEditingItem(null);
        await fetchItems();
      } else {
        showToast(resData.error || 'Không thể lưu tri thức', 'error');
      }
    } catch (err: any) {
      showToast('Lỗi: ' + err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa tri thức này khỏi cơ sở dữ liệu?')) return;
    try {
      const res = await fetch(`/api/v1/admin/knowledge-base/${id}`, {
        method: 'DELETE',
      });
      const resData = await res.json();
      if (resData.success) {
        showToast('Đã xóa tri thức thành công!');
        await fetchItems();
      } else {
        showToast(resData.error || 'Lỗi khi xóa', 'error');
      }
    } catch (err: any) {
      showToast('Lỗi: ' + err.message, 'error');
    }
  };

  const handleToggleActive = async (item: KnowledgeItem) => {
    const nextState = !item.is_active;
    try {
      await fetch(`/api/v1/admin/knowledge-base/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: nextState }),
      });
      setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, is_active: nextState } : i)));
    } catch (err: any) {
      showToast('Lỗi cập nhật trạng thái', 'error');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-body">
      {/* 1. Header, Category Filter & Search Bar */}
      <KnowledgeStatsBar
        totalCount={items.length}
        activeCount={activeCount}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onAddNew={() => {
          setEditingItem(null);
          setIsModalOpen(true);
        }}
        onRefresh={fetchItems}
        loading={loading}
      />

      {/* Toast Alert */}
      {toastMsg && (
        <div
          className={`p-3.5 rounded-2xl text-xs font-bold border transition-all ${
            toastMsg.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          {toastMsg.type === 'success' ? '✓' : '✕'} {toastMsg.text}
        </div>
      )}

      {/* 2. Knowledge Table */}
      <KnowledgeTable
        items={filteredItems}
        onEdit={(item) => {
          setEditingItem(item);
          setIsModalOpen(true);
        }}
        onDelete={handleDelete}
        onToggleActive={handleToggleActive}
      />

      {/* 3. Knowledge Modal */}
      {isModalOpen && (
        <KnowledgeModal
          initialItem={editingItem}
          onClose={() => {
            setIsModalOpen(false);
            setEditingItem(null);
          }}
          onSave={handleSave}
          saving={saving}
        />
      )}
    </div>
  );
}
