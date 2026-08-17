import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, serviceKey);

// PUT: Cập nhật tri thức & ghi Audit Log
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ success: false, error: 'Thiếu ID tri thức' }, { status: 400 });
    }

    const body = await req.json();
    const { title, category, keywords, content, is_active, priority, author } = body;

    const updates: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (title !== undefined) updates.title = title.trim();
    if (category !== undefined) updates.category = category;
    if (content !== undefined) updates.content = content.trim();
    if (is_active !== undefined) updates.is_active = Boolean(is_active);
    if (priority !== undefined) updates.priority = Number(priority);
    if (author !== undefined) updates.author = author;

    if (keywords !== undefined) {
      updates.keywords = Array.isArray(keywords)
        ? keywords.map(k => String(k).trim()).filter(Boolean)
        : typeof keywords === 'string'
        ? keywords.split(',').map(k => k.trim()).filter(Boolean)
        : [];
    }

    const { data, error } = await supabase
      .from('custom_knowledge_base')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('[Admin Knowledge Base API] Update error:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    // Ghi Audit Log
    try {
      await supabase.from('audit_logs').insert([
        {
          action: 'UPDATE_KNOWLEDGE_BASE',
          target_table: 'custom_knowledge_base',
          target_id: id,
          changes: updates,
          created_at: new Date().toISOString(),
        },
      ]);
    } catch { /* non-blocking */ }

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    console.error('[Admin Knowledge Base API] Update exception:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// DELETE: Xóa tri thức & ghi Audit Log
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ success: false, error: 'Thiếu ID tri thức' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('custom_knowledge_base')
      .delete()
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('[Admin Knowledge Base API] Delete error:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    // Ghi Audit Log
    try {
      await supabase.from('audit_logs').insert([
        {
          action: 'DELETE_KNOWLEDGE_BASE',
          target_table: 'custom_knowledge_base',
          target_id: id,
          changes: { deleted: data },
          created_at: new Date().toISOString(),
        },
      ]);
    } catch { /* non-blocking */ }

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    console.error('[Admin Knowledge Base API] Delete exception:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
