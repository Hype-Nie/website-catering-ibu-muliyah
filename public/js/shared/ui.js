function toast(text) {
  $("#toast").textContent = text;
  $("#toast").classList.add("show");
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => $("#toast").classList.remove("show"), 3500);
}
function showModal(content) {
  $("#modal-content").innerHTML = content;
  $("#modal").showModal();
}


function heading(title, desc, action = "") {
  return `<div class="page-heading"><div><a class="breadcrumb" href="${admin ? "/admin" : "/"}">${admin ? "Dapur Menteng / Operasional" : "Beranda / Pemesanan"}</a><h1>${title}</h1><p>${desc}</p></div>${action}</div>`;
}
function steps(n) {
  return `<ol class="checkout-steps">${["Keranjang", "Checkout", "Pembayaran", "Lacak pesanan"].map((s, i) => `<li class="${i === n ? "current" : i < n ? "done" : ""}"><span>${i < n ? "✓" : i + 1}</span>${s}</li>`).join("")}</ol>`;
}
function empty(t, d, url, label) {
  return `<div class="empty-state">${icon("bag")}<h2>${t}</h2><p>${d}</p>${url ? button(url, label) : ""}</div>`;
}
function summary(items, fee, action, temporary = false) {
  return `<aside class="panel summary"><h2>Ringkasan pesanan</h2>${items.map((x) => `<div class="summary-row"><span>${esc(x.name)}<small>${x.qty} × ${money(x.price)}</small></span><b>${money(x.qty * x.price)}</b></div>`).join("")}<hr><div class="summary-row"><span>Subtotal menu</span><span>${money(total(items))}</span></div><div class="summary-row"><span>Ongkos kirim</span><span id="shipping-cost">${temporary ? "Saat checkout" : money(fee)}</span></div><div class="summary-total"><span>${temporary ? "Total sementara" : "Total tagihan"}</span><b id="grand-total">${money(total(items) + fee)}</b></div>${action}<p class="summary-note">${icon("clock")} Pesan minimal H-1 agar hidangan bisa kami siapkan segar.</p></aside>`;
}
function headerCount() {
  const count = $(".cart-count");
  if (count) {
    count.textContent = cart.reduce((a, x) => a + x.qty, 0);
    count.classList.remove("bump");
    void count.offsetWidth;
    count.classList.add("bump");
  }
}
function persistCart() {
  save("cart", cart);
  headerCount();
}

const button = (url, label, cls = "") => `<a href="${url}" class="button ${cls}">${label}</a>`;
