function selectedOrder() {
  const id = new URLSearchParams(location.search).get("id");
  if (page === "tracking" && !id) return null;
  const so = sData.order ? mapOrder(sData.order) : null;
  if (so && (!id || so.id === id)) return so;
  return (id ? orders.find((o) => o.id === id) : user ? orders.find((o) => o.email === user.email) : null) || null;
}

function customerOrders() {
  return user ? orders.filter((o) => o.email === user.email) : orders;
}

function historyCards(list, isAdmin = false, custIdx = "") {
  return list.length ? list.map((o) => `<article class="panel order-card"><div class="order-card-header"><span><b>${esc(o.id)}</b><small>${date(o.date)}</small></span>${badge(states[o.status])}</div><div class="order-card-body"><img src="${menuImg(o.items?.[0]?.image)}" alt="Ilustrasi menu"><div><h2>${esc(o.items?.[0]?.name || "Pesanan")}</h2><p>${(o.items || []).reduce((n, x) => n + x.qty, 0)} porsi${(o.items || []).length > 1 ? " · " + o.items.length + " menu" : ""}</p><small>${icon("clock")} ${date(o.deliveryDate)}, ${esc(o.time)}</small></div><strong>${money(total(o.items || []) + o.fee)}</strong></div><div class="order-card-footer">${badge(o.payment)}${isAdmin ? `<button type="button" class="button outline small" data-action="order-detail" data-id="${esc(o.id)}" data-from-customer="${custIdx}">Detail pesanan</button>` : button("/lacak-pesanan?id=" + o.id, "Detail & lacak", "outline small")}</div></article>`).join("") : empty("Belum ada riwayat pesanan", user ? "Anda belum memiliki pesanan aktif." : "Masuk ke akun untuk melihat pesanan Anda atau gunakan pelacakan via nomor nota.", user ? "/menu" : "/login", user ? "Pilih menu" : "Masuk ke akun");
}
