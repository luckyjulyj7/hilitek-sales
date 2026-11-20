import React, { useMemo, useState } from "react";
import { ImageOff, Plus, Search, Trash2 } from "lucide-react";
import { allWebCategories } from "./storefront/config.js";

const INK = "#1E2A8A";
const TEXT = "#111827";
const MUTE = "#6B7280";
const LINE = "#E5E7EB";
const PAPER = "#F6F7FB";
const RUST = "#C62828";
const GOLD = "#F7C600";
const field = "w-full rounded-md border bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-200";
const fold = (t) => String(t || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "d");
const catsOf = (p) => (p.web && Array.isArray(p.web.categories) ? p.web.categories : []);

/**
 * Danh mục riêng (bộ sưu tập): tên tự đặt, gán sản phẩm của nhiều nhóm vào chung.
 * Lưu: webConfig.COLLECTIONS = [{ name, showInMenu }]; sản phẩm gắn bằng chính tên đó trong web.categories
 * (cùng ô "Danh mục trên web"). Không ở menu chính trừ khi bật showInMenu.
 */
export default function CollectionsEditor({ webConfig, setWebConfig, products, setProducts, menu, displayImage, askConfirm, notify }) {
  const list = Array.isArray(webConfig.COLLECTIONS) ? webConfig.COLLECTIONS : [];
  const [sel, setSel] = useState(0);
  const [newName, setNewName] = useState("");
  const [q, setQ] = useState("");
  const [onlyIn, setOnlyIn] = useState(false);
  const i = Math.min(sel, Math.max(0, list.length - 1));
  const cur = list[i];
  const [nameDraft, setNameDraft] = useState("");
  const [nameFor, setNameFor] = useState("");
  if (cur && nameFor !== cur.name) { setNameFor(cur.name); setNameDraft(cur.name); }

  const taken = useMemo(() => new Set([...allWebCategories(menu), ...(menu || []).map((g) => g.group)].map((x) => String(x).trim().toLowerCase())), [menu]);
  const validName = (name, except) => {
    const n = String(name || "").trim();
    if (!n) return "Chưa nhập tên.";
    if (n.length > 60) return "Tên quá dài (tối đa 60 ký tự).";
    if (taken.has(n.toLowerCase())) return `"${n}" đã là danh mục trong menu chính. Chọn tên khác.`;
    if (list.some((c) => c.name.toLowerCase() === n.toLowerCase() && c.name !== except)) return `Đã có danh mục riêng "${n}".`;
    return "";
  };

  // Mỗi sản phẩm (cả nhóm phiên bản) là một dòng.
  const units = useMemo(() => {
    const map = new Map();
    (products || []).filter((p) => p.web?.published).forEach((p) => {
      const k = p.variantGroupId || p.id;
      const u = map.get(k);
      if (!u) map.set(k, { key: k, p, all: [p] });
      else { u.all.push(p); if (p.web?.isDefaultVariant) u.p = p; }
    });
    return [...map.values()];
  }, [products]);
  const inCol = (u, name) => u.all.some((p) => catsOf(p).includes(name));
  const counts = useMemo(() => Object.fromEntries(list.map((c) => [c.name, units.filter((u) => inCol(u, c.name)).length])), [list, units]);

  const mutList = (fn) => setWebConfig((x) => ({ ...x, COLLECTIONS: fn((Array.isArray(x.COLLECTIONS) ? x.COLLECTIONS : []).map((c) => ({ ...c }))) }));
  const mapCats = (fn) => setProducts((prev) => prev.map((p) => {
    const cats = catsOf(p);
    const next = fn(cats);
    return next === cats ? p : { ...p, web: { ...p.web, categories: next } };
  }));

  const add = () => {
    const err = validName(newName);
    if (err) { notify?.(err); return; }
    mutList((a) => [...a, { name: newName.trim(), showInMenu: false }]);
    setNewName(""); setSel(list.length);
  };
  const rename = () => {
    const n = nameDraft.trim();
    if (n === cur.name) return;
    const err = validName(n, cur.name);
    if (err) { notify?.(err); setNameDraft(cur.name); return; }
    const old = cur.name;
    mapCats((cats) => (cats.includes(old) ? [...new Set(cats.map((c) => (c === old ? n : c)))] : cats));
    // Khối sản phẩm trang chủ đang trỏ tới tên cũ thì đổi theo.
    setWebConfig((x) => ({
      ...x,
      COLLECTIONS: (Array.isArray(x.COLLECTIONS) ? x.COLLECTIONS : []).map((c) => (c.name === old ? { ...c, name: n } : c)),
      ...(Array.isArray(x.HOME_SECTIONS) ? { HOME_SECTIONS: x.HOME_SECTIONS.map((s) => (s.cat === old ? { ...s, cat: n } : s)) } : {}),
    }));
  };
  const del = async () => {
    const used = (Array.isArray(webConfig.HOME_SECTIONS) ? webConfig.HOME_SECTIONS : []).filter((s) => s.cat === cur.name).length;
    if (!await askConfirm(`Xoá danh mục riêng "${cur.name}"? Sản phẩm không bị xoá, chỉ bị gỡ khỏi danh mục này.${used ? ` ${used} tab trang chủ đang dùng danh mục này sẽ hết hàng và tự ẩn.` : ""}`)) return;
    const old = cur.name;
    mapCats((cats) => (cats.includes(old) ? cats.filter((c) => c !== old) : cats));
    mutList((a) => a.filter((c) => c.name !== old));
    setSel(Math.max(0, i - 1));
  };
  const toggleUnit = (u, on) => {
    const name = cur.name;
    const ids = new Set(u.all.map((p) => p.id));
    setProducts((prev) => prev.map((p) => {
      if (!ids.has(p.id)) return p;
      const cats = catsOf(p);
      if (on && !cats.includes(name)) return { ...p, web: { ...p.web, categories: [...cats, name] } };
      if (!on && cats.includes(name)) return { ...p, web: { ...p.web, categories: cats.filter((c) => c !== name) } };
      return p;
    }));
  };

  const kw = fold(q.trim());
  const rows = cur ? units.filter((u) => (!onlyIn || inCol(u, cur.name)) && (!kw || fold(u.p.name).includes(kw) || fold(u.p.sku).includes(kw) || fold(u.p.brand).includes(kw))) : [];
  const shown = rows.slice(0, 60);

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-semibold" style={{ color: TEXT }}>Danh mục riêng</h3>
        <p className="text-xs" style={{ color: MUTE }}>Tạo danh mục tự đặt (ví dụ “Gaming Gear”) rồi gán sản phẩm của nhiều nhóm vào chung. Mặc định không hiện ở menu chính; bật lên nếu muốn. Chọn được ở Khối danh mục, Khối sản phẩm và ô “Danh mục trên web” của sản phẩm.</p>
      </div>

      <div className="flex flex-wrap items-center gap-2 rounded-xl p-3" style={{ background: PAPER, border: `1px solid ${LINE}` }}>
        {list.map((c, k) => (
          <button key={c.name} type="button" onClick={() => setSel(k)} className="rounded-lg px-3.5 py-2 text-sm font-semibold"
            style={{ background: k === i ? "#060A2A" : "#fff", color: k === i ? GOLD : TEXT, border: `1px solid ${k === i ? "#060A2A" : LINE}` }}>
            {c.name} <span className="text-xs font-normal opacity-70">{counts[c.name] || 0}</span>
          </button>
        ))}
        <input value={newName} onChange={(e) => setNewName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && add()} placeholder="Tên danh mục riêng mới" className="min-w-[180px] rounded-md border bg-white px-3 py-2 text-sm outline-none" style={{ borderColor: LINE }} />
        <button type="button" onClick={add} className="inline-flex items-center gap-1 rounded-lg border border-dashed px-3 py-2 text-sm font-medium" style={{ borderColor: "#9CA3AF", color: INK }}><Plus size={15} /> Thêm</button>
      </div>

      {cur ? (
        <div className="rounded-xl p-4" style={{ border: `1px solid ${LINE}`, background: "#fff" }}>
          <div className="flex flex-wrap items-center gap-2">
            <input value={nameDraft} onChange={(e) => setNameDraft(e.target.value)} onBlur={rename} onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()} className="min-w-[180px] flex-1 rounded-md border bg-white px-3 py-2 text-base font-semibold outline-none focus:ring-2 focus:ring-blue-200" style={{ borderColor: LINE }} />
            <label className="flex items-center gap-2 text-sm" style={{ color: TEXT }}>
              <input type="checkbox" checked={!!cur.showInMenu} onChange={(e) => mutList((a) => { a[i].showInMenu = e.target.checked; return a; })} />
              Hiện ở menu chính của web
            </label>
            <button type="button" onClick={del} className="grid h-9 w-9 place-items-center rounded-md border bg-white" style={{ borderColor: LINE, color: RUST }} title="Xoá danh mục riêng"><Trash2 size={16} /></button>
          </div>
          <p className="mt-1 text-xs" style={{ color: MUTE }}>Link xem trên web: <code>/danh-muc?cat={encodeURIComponent(cur.name)}</code></p>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <div className="relative min-w-[220px] flex-1">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: MUTE }} />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Tìm sản phẩm theo tên, mã, hãng để thêm" className={field + " pl-9"} style={{ borderColor: LINE }} />
            </div>
            <label className="flex items-center gap-2 text-sm" style={{ color: TEXT }}><input type="checkbox" checked={onlyIn} onChange={(e) => setOnlyIn(e.target.checked)} /> Chỉ hiện sản phẩm đã có trong danh mục ({counts[cur.name] || 0})</label>
          </div>

          <div className="mt-3 max-h-[460px] divide-y overflow-y-auto rounded-lg" style={{ border: `1px solid ${LINE}`, borderColor: LINE }}>
            {shown.length === 0 && <p className="p-6 text-center text-sm" style={{ color: MUTE }}>Không có sản phẩm nào khớp.</p>}
            {shown.map((u) => {
              const on = inCol(u, cur.name);
              return (
                <label key={u.key} className="flex cursor-pointer items-center gap-3 px-3 py-2 hover:bg-[#F6F7FB]" style={{ borderColor: LINE }}>
                  <input type="checkbox" checked={on} onChange={(e) => toggleUnit(u, e.target.checked)} />
                  <span className="grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-md bg-white">
                    {displayImage(u.p) ? <img src={displayImage(u.p)} alt="" loading="lazy" className="h-full w-full object-contain" /> : <ImageOff size={14} style={{ color: "#9CA3AF" }} />}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm" style={{ color: TEXT }}>{u.p.name}</span>
                  <span className="shrink-0 text-xs" style={{ color: MUTE }}>{u.p.brand || ""}</span>
                </label>
              );
            })}
          </div>
          {rows.length > shown.length && <p className="mt-1 text-xs" style={{ color: MUTE }}>Đang hiện {shown.length}/{rows.length}. Gõ tên để thu hẹp.</p>}
          <p className="mt-2 text-xs" style={{ color: MUTE }}>Chỉ liệt kê sản phẩm đã đăng web. Tick/bỏ tick áp dụng cho cả nhóm phiên bản (màu, dung lượng). Nhớ bấm Lưu ở thanh phía trên trang.</p>
        </div>
      ) : (
        <p className="rounded-lg p-6 text-center text-sm" style={{ background: PAPER, color: MUTE }}>Chưa có danh mục riêng nào. Gõ tên rồi bấm “Thêm”.</p>
      )}
    </div>
  );
}
