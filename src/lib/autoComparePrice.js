/**
 * Giá gạch tự động khi ô "Giá so sánh" để trống.
 * Tỉ lệ cộng thêm chọn ngẫu nhiên trong khoảng theo mức giá, nhưng cố định theo sản phẩm và giá bán:
 * khách tải lại trang vẫn thấy một con số, chỉ đổi khi giá bán đổi.
 */
const TIERS = [
  [1000000, 0.15, 0.25], // từ 1.000.000đ trở xuống
  [4000000, 0.07, 0.14],
  [10000000, 0.05, 0.08],
  [Infinity, 0.03, 0.07],
];

function hash01(text) {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 4294967296;
}

/** seed: mã nhóm phiên bản hoặc id sản phẩm, để các phiên bản đồng giá có cùng giá gạch. */
export function autoComparePrice(price, seed) {
  const p = Number(price) || 0;
  if (p <= 0) return 0;
  const [, min, max] = TIERS.find(([top]) => p <= top);
  // Tròn 100.000đ (dưới 1 triệu tròn 1.000đ). Khoảng hẹp không có mốc tròn nào thì hạ xuống 10.000đ cho đúng tỉ lệ.
  let step = p < 1000000 ? 1000 : 100000;
  let lo = Math.ceil((p * (1 + min)) / step) * step;
  let hi = Math.floor((p * (1 + max)) / step) * step;
  if (hi < lo) {
    step /= 10;
    lo = Math.ceil((p * (1 + min)) / step) * step;
    hi = Math.floor((p * (1 + max)) / step) * step;
  }
  return lo + Math.floor(hash01(`${seed}:${p}`) * ((hi - lo) / step + 1)) * step;
}
