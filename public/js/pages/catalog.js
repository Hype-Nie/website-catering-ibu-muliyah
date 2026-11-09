function menuCard(m) {
  return `<article class="menu-card" data-category="${esc(m.category)}"><button class="menu-image" data-action="detail" data-id="${m.id}" aria-label="Lihat detail ${esc(m.name)}"><img src="${menuImg(m.image)}" alt="Ilustrasi ${esc(m.name)}" loading="lazy"><span>Min. ${m.min} porsi</span></button><div class="menu-content"><small>${cats[m.category]}</small><h2>${esc(m.name)}</h2><p>${esc(m.desc)}</p><div class="menu-price"><div><strong>${money(m.price)}</strong><small> / porsi</small></div><button class="add-button" data-action="detail" data-id="${m.id}" aria-label="Tambah ${esc(m.name)}">+</button></div></div></article>`;
}
function catalog() {
  const list = menus.filter((m) => m.available && m.category === activeCategory);
  return `<div class="container page-content">${heading("Mau makan apa hari ini?", "Pilih hidangan favorit. Kami siapkan dengan lauk yang lengkap.")}<div class="notice">${icon("clock")}<span>Pesan minimal H-1 <span class="notice-separator">|</span> Delivery hingga 20 km dari Menteng <span class="notice-separator">|</span> Tersedia pick-up</span></div><div class="catalog-toolbar"><div class="tabs" role="group" aria-label="Kategori menu">${Object.entries(cats).map(([c, n]) => `<button data-action="category" data-category="${c}" aria-pressed="${activeCategory === c}">${n}</button>`).join("")}</div><label class="search-box">${icon("search")}<input id="menu-search" type="search" placeholder="Cari menu atau lauk…" aria-label="Cari menu atau lauk"></label></div><div class="menu-grid" id="menu-grid">${list.map(menuCard).join("")}</div><p class="photo-note">Foto merupakan ilustrasi penyajian. Harga per porsi; minimum pesanan berlaku untuk setiap menu.</p></div>`;
}
function detail(id) {
  const m = menus.find((x) => x.id === id);
  if (!m || !m.available) return;
  showModal(`<div class="detail-image"><img src="${menuImg(m.image)}" alt="Ilustrasi ${esc(m.name)}"></div><form id="add-form" data-id="${id}" class="detail-content"><small>${cats[m.category]}</small><h2 id="modal-title">${esc(m.name)}</h2><p>${esc(m.desc)}</p><strong class="detail-price">${money(m.price)} <small>/ porsi</small></strong><label>Jumlah porsi<input name="qty" type="number" min="${m.min}" value="${m.min}" step="1" required></label><small>Minimal pemesanan ${m.min} porsi.</small><label>Catatan untuk dapur <span>(opsional)</span><textarea name="note" placeholder="Misalnya, sambal dipisah" maxlength="500" rows="2"></textarea></label><button class="button full" type="submit">${icon("bag")} Tambah ke keranjang</button></form>`);
}
document.addEventListener("click", async (e) => {
  const el = e.target.closest("[data-action]");
  if (!el) return;
  const a = el.dataset.action, id = Number(el.dataset.id), i = Number(el.dataset.index);
  if (a === "category") {
    activeCategory = el.dataset.category;
    window.history.pushState(null, "", "/menu?kategori=" + activeCategory);
    render();
  }
  if (a === "detail") detail(id);
});
document.addEventListener("input", (e) => {
  if (e.target.id === "menu-search") {
    const q = e.target.value.toLowerCase();
    const list = menus.filter((m) => m.available && m.category === activeCategory && (m.name + " " + m.desc).toLowerCase().includes(q));
    $("#menu-grid").innerHTML = list.map(menuCard).join("") || empty("Menu belum ditemukan", "Coba nama lauk lain atau ganti kategori.");
  }
});
document.addEventListener("submit", async (e) => {
  const f = e.target;
  if (f.id !== "add-form") return;
  e.preventDefault();
  const d = new FormData(f);
  if (f.id === "add-form") {
    const m = menus.find((x) => x.id === Number(f.dataset.id)), qty = Number(d.get("qty"));
    if (!Number.isInteger(qty) || qty < m.min) {
      toast(`Minimal pemesanan untuk ${m.name} adalah ${m.min} porsi.`);
      return;
    }
    const note = d.get("note") || "";
    try {
      const res = await fetch("/keranjang", { method: "POST", headers: { "Content-Type": "application/json", "Accept": "application/json", "X-CSRF-TOKEN": sData.csrfToken }, body: JSON.stringify({ id_menu: m.id, kuantitas: qty, catatan: note }) });
      const json = await res.json();
      if (!res.ok) {
        toast(json.message || Object.values(json.errors || {})[0]?.[0] || "Gagal menambahkan menu.");
        return;
      }
      if (json.items && json.items.length) {
        cart = json.items.map((it) => ({ id: it.id_menu || it.menu_id || it.menu?.id, cart_id: it.id, name: it.menu?.nama_menu || it.menu?.name || it.nama_menu || m.name, price: Number(it.menu?.harga || it.menu?.price || it.harga || m.price), min: it.menu?.minimal_pesanan || it.menu?.min_order || m.min || 1, image: it.menu?.foto_menu || it.menu?.image_path || m.image || "box.jpg", qty: Number(it.kuantitas || it.quantity), note: it.catatan || it.notes || "" }));
      } else {
        const found = cart.find((x) => x.id === m.id && x.note === note);
        if (found) found.qty += qty;
        else cart.push({ ...m, qty, note });
      }
      headerCount();
      $("#modal").close();
      toast(`${qty} porsi ditambahkan ke keranjang.`);
    } catch (err) {
      toast("Gagal menghubungi server.");
    }
    return;
  }
});
window.addEventListener("popstate", () => {
  if (page === "catalog") {
    activeCategory = new URLSearchParams(location.search).get("kategori") || "satuan";
    if (!cats[activeCategory]) activeCategory = "satuan";
    render();
  }
});
window.CateringPages["catalog"] = { render: catalog };
