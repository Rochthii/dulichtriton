import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, serviceKey);

export interface KnowledgeItem {
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

// GET: Lấy danh sách tri thức có phân trang & tìm kiếm
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('q')?.trim() || '';
    const category = searchParams.get('category')?.trim() || '';
    const activeOnly = searchParams.get('active_only') === 'true';

    let query = supabase
      .from('custom_knowledge_base')
      .select('*')
      .order('priority', { ascending: false })
      .order('created_at', { ascending: false });

    if (category && category !== 'all') {
      query = query.eq('category', category);
    }

    if (activeOnly) {
      query = query.eq('is_active', true);
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.error('[Admin Knowledge Base API] Fetch error:', error);
      return NextResponse.json({ success: false, error: error.message, data: [] }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: data || [],
      total: data?.length || 0,
    });
  } catch (err: any) {
    console.error('[Admin Knowledge Base API] Exception:', err);
    return NextResponse.json({ success: false, error: err.message, data: [] }, { status: 500 });
  }
}

// POST: Tạo mới tri thức & ghi Audit Log
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, category, keywords, content, is_active, priority, author } = body;

    if (!title?.trim() || !content?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Tiêu đề và nội dung tri thức không được để trống' },
        { status: 400 }
      );
    }

    const parsedKeywords = Array.isArray(keywords)
      ? keywords.map(k => String(k).trim()).filter(Boolean)
      : typeof keywords === 'string'
      ? keywords.split(',').map(k => k.trim()).filter(Boolean)
      : [];

    const newRecord = {
      title: title.trim(),
      category: category || 'general',
      keywords: parsedKeywords,
      content: content.trim(),
      is_active: is_active ?? true,
      priority: Number(priority) || 5,
      author: author?.trim() || 'Admin',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('custom_knowledge_base')
      .insert([newRecord])
      .select()
      .single();

    if (error) {
      console.error('[Admin Knowledge Base API] Insert error:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    // Ghi Audit Log bất biến
    try {
      await supabase.from('audit_logs').insert([
        {
          action: 'CREATE_KNOWLEDGE_BASE',
          target_table: 'custom_knowledge_base',
          target_id: data.id,
          changes: { new: data },
          created_at: new Date().toISOString(),
        },
      ]);
    } catch { /* non-blocking audit */ }

    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (err: any) {
    console.error('[Admin Knowledge Base API] Insert exception:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
