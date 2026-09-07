# Rift Draft Predictor

Dự đoán kết quả trận LMHT từ đội hình pick, dựa trên dữ liệu thật của LCK/LPL/LEC
(quét từ gol.gg, tự động cập nhật mỗi sáng qua GitHub Actions).

**Xem trang tại:** sẽ có link sau khi bật GitHub Pages.

## Cấu trúc

- `index.html` — trang chính (tự build, không sửa tay)
- `template.html` — khung giao diện, nơi build script chèn dữ liệu vào
- `scrape.js`, `parse.js` — quét & bóc tách dữ liệu từ gol.gg
- `finalize.js` — tổng hợp số liệu + huấn luyện lại mô hình
- `champ_attrs.js` — phân loại kit tướng (đánh giá chuyên môn, tách khỏi số liệu đo được)
- `run-update.js` — chạy cả 3 bước trên
- `data/` — `games.json` (dữ liệu trận đấu đã quét), `series.json`, `dataset.json` (kết quả huấn luyện)
- `.github/workflows/daily-scan.yml` — lịch quét tự động mỗi sáng (8:00 giờ VN)

## Chạy cập nhật thủ công

```
node run-update.js 8
```
