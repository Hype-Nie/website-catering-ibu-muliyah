function adminOrders() {
  return `<div class="admin-content">${heading("Pesanan masuk", "Periksa pembayaran dan kelola persiapan setiap pesanan.")}<form id="order-filter" class="panel filter-bar"><label>Cari pesanan<input name="search" type="search" placeholder="Nomor pesanan atau nama"></label><label>Status pesanan<select name="status"><option value="">Semua status</option>${states.map((s, i) => `<option value="${i}">${s}</option>`).join("")}</select></label><label>Pembayaran<select name="payment"><option value="">Semua pembayaran</option>${["Menunggu pembayaran", "Menunggu verifikasi", "Lunas", "Ditolak"].map((s) => `<option>${s}</option>`).join("")}</select></label><button class="button" type="submit">Terapkan</button><button type="reset" class="text-button">Reset</button></form><section class="panel table-panel" id="orders-table">${orderTable(orders)}</section></div>`;
}
document.addEventListener("submit", async (e) => {
  const f = e.target;
  if (f.id !== "order-filter") return;
  e.preventDefault();
  const d = new FormData(f);
  if (f.id === "order-filter") {
    const q = String(d.get("search")).toLowerCase();
    $("#orders-table").innerHTML = orderTable(orders.filter((o) => (o.id + " " + o.name).toLowerCase().includes(q) && (d.get("status") === "" || o.status === Number(d.get("status"))) && (!d.get("payment") || o.payment === d.get("payment"))));
  }
});
document.addEventListener("reset", (e) => {
  if (e.target.id === "order-filter") setTimeout(() => $("#orders-table").innerHTML = orderTable(orders), 0);
});
window.CateringPages["admin-orders"] = { render: adminOrders };
