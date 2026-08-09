# 📊 Golden Dataset AI Chat Evaluation Report

- **Execution Time**: 40.81s
- **Total Test Cases**: 50
- **Status**: ⚠️ NEEDS IMPROVEMENT

## 🎯 Benchmark Summary Matrix

| Metric | Target | Actual Score | Status |
|---|---|---|---|
| Retrieval Mean (@top-4) | >= 0.85 | 0.32 | ❌ FAIL |
| Factuality Mean | >= 0.9 | 0.93 | ✅ PASS |
| Forbidden Hits (Hallucinations) | == 0 | 0 | ✅ PASS |
| Rejection Accuracy | == 1.0 | 100.0% | ✅ PASS |
| Edge-in-Scope Pass Rate | == 1.0 | 100.0% | ✅ PASS |

## 🔍 Detailed Case Results

| ID | Intent | Query | Ret Score | Fact Score | Forbidden | Pass |
|---|---|---|---|---|---|---|
| Q01 | place | Hồ Tà Pạ ở đâu, có gì đẹp? | 1.00 | 1.00 | NO | ✅ PASS |
| Q02 | place | Chỗ nào sống ảo đẹp nhất Tri Tôn? | 0.00 | 1.00 | NO | ❌ FAIL |
| Q03 | place | Muốn săn mây thì lên đâu? | 0.50 | 0.50 | NO | ✅ PASS |
| Q04 | place | Ngắm hoàng hôn ở đâu đẹp? | 0.00 | 1.00 | NO | ❌ FAIL |
| Q05 | place | Có cánh đồng lúa nào đẹp không? | 0.50 | 0.67 | NO | ✅ PASS |
| Q06 | place | Cổng Trời Tri Tôn thuộc xã nào? | 0.00 | 1.00 | NO | ❌ FAIL |
| Q07 | safety | Hồ ở Tri Tôn có tắm được không? | 0.00 | 1.00 | NO | ❌ FAIL |
| Q08 | place | Đồi Tức Dụp có gì chơi? | 1.00 | 1.00 | NO | ✅ PASS |
| Q09 | place | Cầu gỗ check-in ở những đâu? | 0.00 | 1.00 | NO | ❌ FAIL |
| Q10 | hidden | Chỗ nào ít người biết để chụp ảnh? | 1.00 | N/A | NO | ✅ PASS |
| Q11 | food | Gà đốt Ô Thum quán nào ngon? | 0.00 | 0.50 | NO | ❌ FAIL |
| Q12 | food | Quán gà đốt nào mở khuya? | 1.00 | 1.00 | NO | ✅ PASS |
| Q13 | food | Đu đủ đâm ăn ở đâu ngon? | 0.00 | 1.00 | NO | ❌ FAIL |
| Q14 | food | Sáng sớm ăn gì ở thị trấn? | 0.00 | 1.00 | NO | ❌ FAIL |
| Q15 | food | Mua bánh bò thốt nốt về làm quà ở đâu? | 0.00 | N/A | NO | ❌ FAIL |
| Q16 | food | Bún cá Khmer quán nào? | 1.00 | N/A | NO | ✅ PASS |
| Q17 | food | Cháo bò trái trúc ăn ở đâu? | 1.00 | 1.00 | NO | ✅ PASS |
| Q18 | food | Tối ăn gì ở Tri Tôn? | 0.00 | 1.00 | NO | ❌ FAIL |
| Q19 | food | Mua đường thốt nốt nguyên chất ở đâu? | 0.00 | 1.00 | NO | ❌ FAIL |
| Q20 | food | Ăn vặt đêm ở đâu? | 1.00 | 1.00 | NO | ✅ PASS |
| Q21 | itinerary | Lên cho mình lịch trình 1 ngày đi | 1.00 | 0.75 | NO | ✅ PASS |
| Q22 | itinerary | Tour 2 ngày 1 đêm thì đi những đâu? | 0.00 | 1.00 | NO | ❌ FAIL |
| Q23 | itinerary | Food tour 1 ngày ăn gì từ sáng tới tối? | 0.00 | 0.00 | NO | ❌ FAIL |
| Q24 | itinerary | Ngủ đêm ở đâu tiện đi lại? | 0.67 | N/A | NO | ✅ PASS |
| Q25 | itinerary | Lịch trình săn mây bình minh? | 0.00 | 1.00 | NO | ❌ FAIL |
| Q26 | itinerary | Đi cùng gia đình có trẻ nhỏ nên đi đâu? | 0.00 | N/A | NO | ❌ FAIL |
| Q27 | itinerary | Nửa ngày khám phá văn hóa Khmer? | 0.50 | 1.00 | NO | ✅ PASS |
| Q28 | itinerary | Bắt đầu từ chợ Tri Tôn thì đi 1 ngày sao? | 0.00 | N/A | NO | ❌ FAIL |
| Q29 | culture | Lễ hội đua bò diễn ra khi nào? | 0.00 | 1.00 | NO | ❌ FAIL |
| Q30 | culture | Chùa nào cổ nhất An Giang? | 1.00 | 1.00 | NO | ✅ PASS |
| Q31 | culture | Kinh lá buông là gì? | 0.00 | 1.00 | NO | ❌ FAIL |
| Q32 | culture | Nhà mồ Ba Chúc gắn với sự kiện gì? | 0.00 | 1.00 | NO | ❌ FAIL |
| Q33 | culture | Vào chùa Khmer cần lưu ý gì? | 0.00 | 1.00 | NO | ❌ FAIL |
| Q34 | culture | Sene Dolta là lễ gì? | 0.00 | 1.00 | NO | ❌ FAIL |
| Q35 | logistics | Vé Đồi Tức Dụp bao nhiêu? | 0.00 | 1.00 | NO | ❌ FAIL |
| Q36 | logistics | Hồ Tà Pạ mở cửa mấy giờ? | 0.00 | 1.00 | NO | ❌ FAIL |
| Q37 | logistics | Từ Sài Gòn đi Tri Tôn mất bao lâu? | N/A | 1.00 | NO | ✅ PASS |
| Q38 | logistics | Vườn nho Ô Thum vé vào cổng? | 1.00 | 1.00 | NO | ✅ PASS |
| Q39 | logistics | Quán đu đủ đâm RiNa mở cửa lúc mấy giờ? | 1.00 | 1.00 | NO | ✅ PASS |
| Q40 | logistics | Gà đốt bao nhiêu tiền một con? | 0.00 | 1.00 | NO | ❌ FAIL |
| Q41 | hidden | Chỗ nào chill mà ít người? | 0.67 | N/A | NO | ✅ PASS |
| Q42 | hidden | Cà phê view hồ gợi ý với? | 0.00 | 1.00 | NO | ❌ FAIL |
| Q43 | expand | Mình vừa xem Hồ Tà Pạ, gần đó còn gì không? | 0.33 | 1.00 | NO | ❌ FAIL |
| Q44 | honesty | Mình ăn chay, Tri Tôn có gì không? | 0.00 | 0.50 | NO | ❌ FAIL |
| Q45 | off | Thời tiết Hà Nội hôm nay thế nào? | N/A | 1.00 | NO | ✅ PASS |
| Q46 | off | Viết cho mình đoạn code Python | N/A | 1.00 | NO | ✅ PASS |
| Q47 | edge | Tri Tôn thuộc tỉnh nào? | N/A | 1.00 | NO | ✅ PASS |
| Q48 | off | Review Đà Lạt cho mình với | N/A | 1.00 | NO | ✅ PASS |
| Q49 | edge | Gà đốt với gà nướng khác gì nhau? | 0.00 | 1.00 | NO | ✅ PASS |
| Q50 | identity | Bạn là ai, giúp được gì? | N/A | 1.00 | NO | ✅ PASS |
