'use strict';
/* Chạy toàn bộ quy trình cập nhật: quét gol.gg -> huấn luyện lại mô hình -> dựng lại trang.
   Dùng: node run-update.js [số_tuần]     (mặc định 8 tuần gần nhất)
   Chạy bởi GitHub Actions mỗi sáng — xem .github/workflows/daily-scan.yml */

const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const weeks = Number(process.argv[2]) || 8;
const cutoff = new Date(Date.now() - weeks * 7 * 86400000).toISOString().slice(0, 10);
const OUT = path.join(__dirname, 'index.html');

const step = (n, msg) => console.log(`\n[${n}/3] ${msg}`);
const run = (script, env) => execFileSync(process.execPath, [path.join(__dirname, script)],
  { stdio: 'inherit', env: { ...process.env, ...env }, cwd: __dirname });

console.log('='.repeat(64));
console.log(`  CẬP NHẬT DỮ LIỆU — lấy các trận từ ${cutoff} đến nay (${weeks} tuần)`);
console.log('='.repeat(64));

try {
  step(1, 'Quét gol.gg (chỉ tải trận chưa có trong data/games.json)...');
  run('scrape.js', { CUTOFF: cutoff });

  step(2, 'Tổng hợp số liệu và huấn luyện lại mô hình...');
  run('finalize.js');

  step(3, 'Dựng lại trang...');
  const tpl = fs.readFileSync(path.join(__dirname, 'template.html'), 'utf8');
  const data = fs.readFileSync(path.join(__dirname, 'data', 'dataset.json'), 'utf8');
  if (!tpl.includes('/*__DATA__*/')) throw new Error('template.html thiếu chỗ chèn dữ liệu');
  fs.writeFileSync(OUT, tpl.replace('/*__DATA__*/', data));

  const meta = JSON.parse(data).meta;
  console.log('\n' + '='.repeat(64));
  console.log('  XONG');
  console.log('='.repeat(64));
  console.log(`  ${meta.games} trận dùng để huấn luyện  ·  ${meta.dateFrom} → ${meta.dateTo}`);
  console.log(`  ${meta.leagues.join(' · ')}  ·  patch ${meta.patches.join(', ')}`);
  console.log(`  ${meta.champions} tướng  ·  ${meta.matchupWithData}/${meta.matchupPairs} cặp đối đầu có ≥3 game`);
  console.log(`  Kiểm tra toàn vẹn: pick khớp bảng điểm ${meta.integrity.picksMatchScoreboard}/${meta.integrity.picksMatchScoreboardOf}, ` +
              `tổng kill khớp ${meta.integrity.killTotalsMatch}/${meta.integrity.killTotalsMatchOf}` +
              (meta.integrity.droppedFromTraining ? `  (${meta.integrity.droppedFromTraining} trận lệch bị loại khỏi huấn luyện)` : ''));
  console.log(`\n  File đã ghi: ${OUT}`);
} catch (e) {
  console.error('\n*** LỖI: ' + (e.message || e));
  process.exitCode = 1;
}
