/**
 * Tiếng "ding" ngắn khi thêm sản phẩm vào giỏ — tạo bằng Web Audio API,
 * không cần file âm thanh. Gọi từ trong 1 sự kiện click nên trình duyệt cho phép phát.
 */
let ctx = null;

export function playAddToCart() {
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    if (!ctx) ctx = new AC();
    if (ctx.state === "suspended") ctx.resume();

    const now = ctx.currentTime;
    // 2 nốt đi lên: nghe như "ting-ting" vui tai, nhẹ nhàng.
    [
      { f: 880, t: 0, d: 0.12 },
      { f: 1320, t: 0.1, d: 0.18 },
    ].forEach(({ f, t, d }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = f;
      gain.gain.setValueAtTime(0.0001, now + t);
      gain.gain.exponentialRampToValueAtTime(0.16, now + t + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + t + d);
      osc.connect(gain).connect(ctx.destination);
      osc.start(now + t);
      osc.stop(now + t + d + 0.02);
    });
  } catch {
    /* bỏ qua nếu trình duyệt chặn âm thanh */
  }
}
