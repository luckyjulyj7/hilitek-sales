import { handlerPOST, ghnFetch, configState, send } from "./_ghn.js";

// Kiểm tra kết nối GHN: gọi thử danh sách tỉnh/thành. Dùng cho nút "Kiểm tra kết nối GHN".
export default handlerPOST(async (req, res) => {
  const cfg = configState();
  if (!cfg.hasToken) {
    return send(res, 200, { ok: false, ...cfg, message: "Chưa đặt GHN_TOKEN." });
  }
  const { status, json } = await ghnFetch("/shiip/public-api/master-data/province", { method: "GET" });
  const ok = status === 200 && json && json.code === 200;
  send(res, 200, {
    ok,
    ...cfg,
    ghnStatus: status,
    ghnCode: json && json.code,
    ghnMessage: json && json.message,
    provinceCount: Array.isArray(json && json.data) ? json.data.length : 0,
  });
});
