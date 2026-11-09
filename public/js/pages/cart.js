function cartPage() {
  return `<div class="container page-content">${heading("Keranjang Anda", "Periksa porsi dan catatan sebelum kami siapkan hidangannya.")} ${steps(0)}${!cart.length ? empty("Keranjang masih kosong", "Pilih nasi uduk dan lauk favorit untuk memulai pesanan.", "/menu", "Pilih menu") : `<div class="two-column"><section class="panel cart-panel"><div class="panel-heading"><h2>Menu pilihan (${cart.length})</h2><a href="/menu" class="plain-link">Tambah menu</a></div>${cart.map((x, i) => `<article class="cart-item"><img src="${menuImg(x.image)}" alt="Ilustrasi ${esc(x.name)}"><div class="cart-item-body"><h3>${esc(x.name)}</h3><p>${money(x.price)} / porsi <span>· Min. ${x.min} porsi</span></p><div class="quantity"><button data-action="qty" data-index="${i}" data-delta="-1" aria-label="Kurangi porsi ${esc(x.name)}" ${x.qty <= x.min ? "disabled" : ""}>−</button><input type="number" value="${x.qty}" min="${x.min}" data-cart-qty="${i}" aria-label="Jumlah porsi ${esc(x.name)}"><button data-action="qty" data-index="${i}" data-delta="1" aria-label="Tambah porsi ${esc(x.name)}">+</button></div><label>Catatan dapur<textarea data-cart-note="${i}" rows="2" maxlength="500" placeholder="Sambal dipisah, misalnya">${esc(x.note)}</textarea></label><button class="text-button remove" data-action="remove" data-index="${i}">Hapus menu</button></div><b>${money(x.qty * x.price)}</b></article>`).join("")}</section>${summary(cart, 0, button("/checkout", "Lanjut ke checkout " + icon("arrow"), "full"), true)}</div>`}</div>`;
}
document.addEventListener("click", async (e) => {
  const el = e.target.closest("[data-action]");
  if (!el) return;
  const a = el.dataset.action, id = Number(el.dataset.id), i = Number(el.dataset.index);
  if (a === "qty") {
    const item = cart[i];
    item.qty = Math.max(item.min, item.qty + Number(el.dataset.delta));
    persistCart();
    render();
  }
  if (a === "remove") {
    const item = cart[i];
    if (item.cart_id) {
      try {
        await fetch("/keranjang/" + item.cart_id, { method: "DELETE", headers: { "Content-Type": "application/json", "Accept": "application/json", "X-CSRF-TOKEN": sData.csrfToken } });
      } catch (e2) {
      }
    }
    cart.splice(i, 1);
    persistCart();
    render();
    toast("Menu dihapus dari keranjang.");
  }
});
document.addEventListener("change", (e) => {
  if (e.target.matches("[data-cart-note]")) {
    cart[Number(e.target.dataset.cartNote)].note = e.target.value;
    persistCart();
  }
});
document.addEventListener("change", (e) => {
  if (e.target.matches("[data-cart-qty]")) {
    const x = cart[Number(e.target.dataset.cartQty)];
    const n = Number(e.target.value);
    x.qty = Number.isInteger(n) ? Math.max(x.min, n) : x.min;
    persistCart();
    render();
  }
});
window.CateringPages["cart"] = { render: cartPage };
