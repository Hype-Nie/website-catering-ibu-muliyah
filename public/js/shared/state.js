"use strict";
const $ = (s, root = document) => root.querySelector(s);
const page = document.body.dataset.page;
const admin = ["dashboard", "admin-menu", "admin-orders", "customers", "reports"].includes(page);
const money = (n) => "Rp" + (Math.round(Number(n)) || 0).toLocaleString("id-ID");
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const read = (k, fallback) => {
  try {
    return JSON.parse(localStorage.getItem("menteng-" + k)) ?? fallback;
  } catch {
    return fallback;
  }
};
const save = (k, v) => localStorage.setItem("menteng-" + k, JSON.stringify(v));
const icons = { alert: '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>', bag: '<path d="M6 7h12l2 14H4L6 7Z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>', arrow: '<path d="m9 5 7 7-7 7"/>', pin: '<path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/>', clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>', truck: '<path d="M2 5h12v12H2zM14 9h4l4 5v3h-8"/><circle cx="6" cy="18" r="2"/><circle cx="18" cy="18" r="2"/>', check: '<path d="m5 12 4 4L19 6"/>', search: '<circle cx="10" cy="10" r="6"/><path d="m15 15 5 5"/>', leaf: '<path d="M20 3C7 1 1 10 6 17s17 2 14-14ZM5 20 16 9"/>', grid: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>', users: '<circle cx="9" cy="8" r="3"/><path d="M3 21v-3a6 6 0 0 1 12 0v3M16 5a3 3 0 0 1 0 6m2 3a5 5 0 0 1 3 4v3"/>', chart: '<path d="M4 3v18h18M8 16v-4m5 4V7m5 9V4"/>', maximize: '<path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>', minimize: '<path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/>' };
const icon = (name) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name] || icons.leaf}</svg>`;
const baseMenus = [
  { id: 1, name: "Nasi Uduk Ayam Goreng", category: "satuan", price: 25e3, min: 1, image: "hero.jpg", desc: "Nasi uduk gurih, ayam goreng, bihun, tempe orek, sambal, dan kerupuk." },
  { id: 2, name: "Nasi Uduk Telur Balado", category: "satuan", price: 18e3, min: 1, image: "box.jpg", desc: "Nasi uduk, telur balado, bihun, tempe orek, dan kerupuk." },
  { id: 3, name: "Nasi Uduk Ayam Bakar", category: "satuan", price: 28e3, min: 1, image: "satuan.jpg", desc: "Nasi uduk, ayam bakar, tahu, lalapan segar, dan sambal." },
  { id: 4, name: "Nasi Box Ayam Goreng", category: "box", price: 3e4, min: 10, image: "satuan.jpg", desc: "Nasi uduk, ayam goreng, bihun, tempe orek, sambal, dan kerupuk dalam kemasan box." },
  { id: 5, name: "Nasi Box Komplet", category: "box", price: 38e3, min: 10, image: "hero.jpg", desc: "Nasi uduk, ayam, telur balado, bihun, tempe orek, sambal, dan kerupuk." },
  { id: 6, name: "Nasi Box Telur Balado", category: "box", price: 23e3, min: 10, image: "box.jpg", desc: "Nasi uduk dan telur balado dengan bihun, orek tempe, sambal, dan kerupuk." },
  { id: 7, name: "Prasmanan Paket A", category: "prasmanan", price: 4e4, min: 30, image: "prasmanan.jpg", desc: "Nasi uduk, ayam goreng, telur balado, tumis sayur, bihun, sambal, dan kerupuk." },
  { id: 8, name: "Prasmanan Paket B", category: "prasmanan", price: 5e4, min: 30, image: "hero.jpg", desc: "Nasi uduk, ayam bakar, rendang, sayur, bihun, sambal, dan kerupuk." },
  { id: 9, name: "Prasmanan Paket Keluarga", category: "prasmanan", price: 35e3, min: 30, image: "box.jpg", desc: "Nasi uduk dan lauk rumahan untuk acara keluarga.", available: false }
].map((m) => ({ available: true, ...m }));
const sData = window.__SERVER_DATA__ || {};
const serverMenus = sData.menus && sData.menus.length ? sData.menus.map((m) => ({ id: m.id, name: m.nama_menu || m.name, category: m.kategori?.slug || m.category?.slug || m.jenis_paket || m.package_type, price: Number(m.harga || m.price), min: m.minimal_pesanan || m.min_order, image: m.foto_menu || m.image_path, desc: m.deskripsi || m.description, available: Boolean(m.status_tersedia !== void 0 ? m.status_tersedia : m.is_available) })) : null;
const serverCart = sData.items && sData.items.length ? sData.items.map((it) => ({ id: it.id_menu || it.menu_id || it.menu?.id, cart_id: it.id, name: it.menu?.nama_menu || it.menu?.name || it.nama_menu, price: Number(it.menu?.harga || it.menu?.price || it.harga), min: it.menu?.minimal_pesanan || it.menu?.min_order || 1, image: it.menu?.foto_menu || it.menu?.image_path || "box.jpg", qty: Number(it.kuantitas || it.quantity), note: it.catatan || it.notes || "" })) : [];
let menus = serverMenus || read("menus", baseMenus), cart = serverCart, user = sData.user ? { id: sData.user.id, name: sData.user.nama || sData.user.name || "", nama: sData.user.nama || sData.user.name || "", email: sData.user.email, phone: sData.user.nomor_telepon || sData.user.phone || "", nomor_telepon: sData.user.nomor_telepon || sData.user.phone || "", address: sData.user.alamat || sData.user.address || "", alamat: sData.user.alamat || sData.user.address || "", role: sData.user.peran || sData.user.role || "customer", peran: sData.user.peran || sData.user.role || "customer" } : null;
const menuImg = (s) => !s ? "/images/hero.jpg" : s.startsWith("http") || s.startsWith("/") || s.startsWith("data:") ? s : s.startsWith("menus/") || s.includes("/") ? "/storage/" + s : "/images/" + s;
const today = () => (/* @__PURE__ */ new Date()).toLocaleDateString("en-CA");
const tomorrow = () => {
  const d = /* @__PURE__ */ new Date();
  d.setDate(d.getDate() + 1);
  return d.toLocaleDateString("en-CA");
};
const date = (s) => (/* @__PURE__ */ new Date(s + "T12:00:00")).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
const cats = { satuan: "Porsi satuan", box: "Nasi box", prasmanan: "Prasmanan" };
const states = ["Menunggu pembayaran", "Diproses dapur", "Dikirim / siap diambil", "Selesai", "Ditolak"];
const customers = [{ name: "Siti Rahma", email: "siti@contoh.test", phone: "081234567890" }, { name: "Budi Santoso", email: "budi@contoh.test", phone: "081298765432" }, { name: "Dewi Lestari", email: "dewi@contoh.test", phone: "081355667788" }, { name: "Andi Pratama", email: "andi@contoh.test", phone: "081388990011" }];
const seedOrders = [["0001", 0, 4, 10, "Menunggu verifikasi", 0], ["0002", 1, 7, 30, "Lunas", 1], ["0003", 2, 8, 30, "Lunas", 2], ["0004", 0, 1, 4, "Ditolak", 4], ["0005", 0, 4, 20, "Lunas", 3], ["0006", 1, 8, 40, "Lunas", 3]].map(([id, c, m, q, p, s], i) => {
  const menu = baseMenus.find((x) => x.id === m);
  return { id: "DM-261105-" + id, name: customers[c].name, email: customers[c].email, phone: customers[c].phone, date: "2026-11-" + String(5 - i % 5).padStart(2, "0"), deliveryDate: tomorrow(), time: "10:00", method: "delivery", address: "Jl. Cikini Raya No. 12, Menteng, Jakarta Pusat", items: [{ ...menu, qty: q, note: "Sambal dipisah" }], fee: 15e3, payment: p, status: s, proof: p === "Menunggu verifikasi" ? "bukti-transfer-contoh.png" : null };
});
const mapOrder = (o) => !o ? null : {
  id: o.nomor_pesanan || o.order_number || "DM-" + o.id,
  rawId: o.id,
  name: o.nama_penerima || o.recipient_name,
  email: o.email_penerima || o.recipient_email || (o.user?.email || o.pengguna?.email || ""),
  phone: o.nomor_telepon_penerima || o.recipient_phone,
  date: String(o.tanggal_pesanan || o.order_date || o.created_at || "").slice(0, 10),
  deliveryDate: String(o.tanggal_pengiriman || o.delivery_date || "").slice(0, 10),
  time: o.waktu_pengiriman || o.delivery_time || "10:00",
  method: o.jenis_pengiriman || o.delivery_type || "delivery",
  address: o.alamat_pengiriman || o.delivery_address || "Ambil di dapur",
  items: (o.items || []).map((it) => ({ id: it.id_menu || it.menu_id, name: it.nama_menu || it.menu_name, price: Number(it.harga || it.price), qty: it.kuantitas || it.quantity, note: it.catatan || it.notes || "", image: it.menu?.foto_menu || it.menu?.image_path || "hero.jpg" })),
  fee: Number(o.biaya_pengiriman ?? o.delivery_fee ?? 0),
  total: Number(o.total_pembayaran ?? 0),
  payment: (o.status_pembayaran === "Menunggu Verifikasi" ? "Menunggu verifikasi" : o.status_pembayaran === "Menunggu Pembayaran" ? "Menunggu pembayaran" : o.status_pembayaran) || o.payment_status || "Menunggu pembayaran",
  status: Number(o.status_pesanan ?? o.order_status ?? 0),
  proof: o.payment?.bukti_transfer || o.payment?.proof_image || null,
  rejection: o.payment?.catatan_penolakan || o.payment?.rejection_note || null,
  proofData: o.proofData || null,
  notes: o.catatan || o.notes || "",
  bank: o.payment?.nama_bank || o.payment?.bank_name || "",
  sender: o.payment?.nama_pemilik_rekening || o.payment?.account_holder || "",
  transferAmount: Number(o.payment?.nominal_transfer || o.payment?.transfer_amount || 0)
};
const serverOrders = Array.isArray(sData.orders) ? sData.orders.map(mapOrder) : null;
let orders = serverOrders !== null ? serverOrders : admin ? [] : read("orders", seedOrders);
if (sData.order) {
  const mo = mapOrder(sData.order);
  if (mo && !orders.some((x) => x.id === mo.id)) orders = [mo, ...orders];
}
let activeCategory = new URLSearchParams(location.search).get("kategori") || "satuan";
if (!cats[activeCategory]) activeCategory = "satuan";
const total = (items) => items.reduce((a, x) => a + x.price * x.qty, 0);
const badge = (text) => `<span data-status="${esc(text)}" class="badge ${text === "Lunas" || text === "Selesai" ? "success" : text === "Ditolak" ? "danger" : ""}">${esc(text)}</span>`;
window.CateringPages = {};
