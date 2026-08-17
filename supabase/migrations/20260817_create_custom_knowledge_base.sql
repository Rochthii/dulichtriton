-- Migration: Create custom_knowledge_base table
-- Purpose: Cho phép Admin quản lý các câu trả lời, tri thức ưu tiên và đính chính cho Chatbot AI

CREATE TABLE IF NOT EXISTS public.custom_knowledge_base (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL DEFAULT 'general', -- 'food', 'place', 'festival', 'transport', 'emergency', 'general'
    keywords TEXT[] NOT NULL DEFAULT '{}',
    content TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    priority INT NOT NULL DEFAULT 5, -- 1 (thấp) đến 10 (cao nhất)
    author VARCHAR(100) DEFAULT 'Admin',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index cho tìm kiếm nhanh
CREATE INDEX IF NOT EXISTS idx_custom_knowledge_category ON public.custom_knowledge_base(category);
CREATE INDEX IF NOT EXISTS idx_custom_knowledge_active ON public.custom_knowledge_base(is_active);

-- Enable RLS
ALTER TABLE public.custom_knowledge_base ENABLE ROW LEVEL SECURITY;

-- Allow public read of active items
CREATE POLICY "Allow public read active knowledge" ON public.custom_knowledge_base
    FOR SELECT USING (is_active = true);

-- Allow service role full access
CREATE POLICY "Allow service role all on custom_knowledge_base" ON public.custom_knowledge_base
    FOR ALL USING (true) WITH CHECK (true);

-- Insert initial sample verified entries
INSERT INTO public.custom_knowledge_base (title, category, keywords, content, is_active, priority, author)
VALUES 
(
    'Quán Gà Đốt Thành Đạt Ô Thum',
    'food',
    ARRAY['thành đạt', 'gà đốt thành đạt', 'quán thành đạt', 'quán gà đốt thành đạt'],
    'Quán Gà Đốt Thành Đạt nằm ven KDL Hồ Ô Thum, Xã Ô Lâm, Tri Tôn. Không gian chòi lá sân vườn thoáng mát, phục vụ gà đốt lá chúc nguyên con da giòn thịt ngọt, xôi phồng và nước thốt nốt tươi. Mức giá: 280.000đ - 350.000đ/con. Khuyên du khách nên gọi đặt bàn trước 30-45 phút.',
    true,
    9,
    'Admin'
),
(
    'Quán Siêu Gà Đốt Ô Thum (Chau Siêu)',
    'food',
    ARRAY['chau siêu', 'quán siêu', 'siêu gà đốt', 'chau sieu'],
    'Quán Chau Siêu là quán gà đốt tiên phong lâu đời nhất ven hồ Ô Thum, Xã Ô Lâm, Tri Tôn. Món gà đốt ướp sả ớt lá chúc truyền thống, ăn kèm muối ớt lá chúc và đu đủ đâm. Giờ mở cửa: 08:30 - 18:30 hàng ngày.',
    true,
    9,
    'Admin'
),
(
    'Lưu ý đường lên Núi Cô Tô mùa mưa',
    'emergency',
    ARRAY['núi cô tô', 'đường lên cô tô', 'vồ hội', 'sạt lở cô tô', 'mưa cô tô'],
    'Đường lên Núi Cô Tô (khu vực Vồ Hội Mẹ, Sân Tiên) dốc cao và quanh co. Vào mùa mưa hoặc sau cơn mưa lớn, đường bê tông có thể trơn trượt do rêu phong. Khuyên du khách thuê xe ôm bản địa chở lên (giá niêm yết ~50.000đ - 70.000đ/lượt) và mang giày thể thao có độ bám dốc tốt.',
    true,
    8,
    'Admin'
)
ON CONFLICT DO NOTHING;
