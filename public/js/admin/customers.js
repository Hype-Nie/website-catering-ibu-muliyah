function customerPage() {
  const list = sData.customers && sData.customers.length ? sData.customers : customers;
  return `<div class="admin-content">${heading("Pelanggan", "Kenali pelanggan dan lihat riwayat pesanannya.")}<section class="panel table-panel"><div class="panel-heading"><h2>${list.length} pelanggan terdaftar</h2></div><div class="table-scroll"><table><thead><tr>${["Pelanggan", "WhatsApp", "Pesanan", "Total belanja", "Aksi"].map((t) => `<th scope="col">${t}</th>`).join("")}</tr></thead><tbody>${list.map((c, i) => {
    const os = c.orders && c.orders.length ? c.orders.map(mapOrder) : orders.filter((o) => o.email === c.email);
    return `<tr><td><b>${esc(c.name)}</b><small>${esc(c.email)}</small></td><td>${esc(c.phone)}</td><td>${c.order_count || os.length} transaksi</td><td class="numeric">${money(c.total_spend || os.filter((o) => o.payment === "Lunas").reduce((a, o) => a + total(o.items) + o.fee, 0))}</td><td><button class="text-button" data-action="customer" data-index="${i}">Lihat riwayat</button></td></tr>`;
  }).join("") || '<tr><td colspan="5" class="table-empty">Belum ada pelanggan terdaftar.</td></tr>'}</tbody></table></div></section></div>`;
}
window.CateringPages["customers"] = { render: customerPage };

document.addEventListener('click', e=>{
 const el=e.target.closest('[data-action]');if(!el)return;
 const a=el.dataset.action,i=Number(el.dataset.index);
  if (a === "customer") {
    const list = sData.customers && sData.customers.length ? sData.customers : customers;
    const c = list[i];
    if (!c) return;
    const cOrders = c.orders && c.orders.length ? c.orders.map(mapOrder) : orders.filter((o) => o.email === c.email);
    showModal(`<div class="modal-form"><h2 id="modal-title">Riwayat: ${esc(c.name)}</h2><p class="muted small-text">${esc(c.email)}${c.phone ? " · " + esc(c.phone) : ""}</p>${historyCards(cOrders, true, i)}</div>`);
  }
});
