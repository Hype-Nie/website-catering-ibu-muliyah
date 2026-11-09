function adminMenus() {
  return `<div class="admin-content">${heading("Menu & paket", "Kelola hidangan, harga, dan ketersediaan untuk pelanggan.", '<button class="button" data-action="edit-menu">+ Tambah menu</button>')}<section class="panel table-panel"><div class="panel-heading"><h2>${menus.length} menu di dapur</h2><span class="muted">3 pilihan penyajian</span></div><div class="table-scroll"><table><thead><tr>${["Menu", "Kategori", "Harga / porsi", "Minimum", "Ketersediaan", "Aksi"].map((t) => `<th scope="col">${t}</th>`).join("")}</tr></thead><tbody>${menus.map((m) => `<tr><td><div class="table-menu"><img src="${menuImg(m.image)}" alt=""><b>${esc(m.name)}</b></div></td><td><span class="category-chip" data-category="${esc(m.category)}">${cats[m.category]}</span></td><td class="numeric">${money(m.price)}</td><td>${m.min} porsi</td><td><button class="availability-toggle ${m.available ? "available" : "hidden"}" data-action="availability" data-id="${m.id}" aria-pressed="${m.available}" aria-label="${esc(m.name)}: ${m.available ? "tersedia, tandai habis" : "habis, tandai tersedia"}">${m.available ? "Tersedia" : "Habis"}</button></td><td><div class="table-actions"><button class="text-button" data-action="edit-menu" data-id="${m.id}">Edit</button><button class="text-button danger" data-action="delete-menu" data-id="${m.id}">Hapus</button></div></td></tr>`).join("")}</tbody></table></div></section></div>`;
}
function editMenu(id) {
  const m = menus.find((x) => x.id === id) || { name: "", category: "satuan", price: 18e3, min: 1, desc: "", image: "satuan.jpg", available: true };
  showModal(`<form id="menu-form" data-id="${id || ""}" class="modal-form"><h2 id="modal-title">${id ? "Edit menu" : "Tambah menu"}</h2><label>Nama menu<input name="name" value="${esc(m.name)}" maxlength="100" required></label><div class="form-grid"><label>Kategori<select name="category">${Object.entries(cats).map(([k, n]) => `<option value="${k}" ${m.category === k ? "selected" : ""}>${n}</option>`).join("")}</select></label><label>Minimum porsi<input name="min" type="number" min="1" step="1" value="${m.min}" required></label><label>Harga per porsi<input name="price" type="number" min="1000" step="500" value="${m.price}" required><small id="price-preview" class="price-preview-badge">${money(m.price)} / porsi</small></label><label>Unggah foto (JPG, PNG, WebP maks 2 MB)<input name="foto_menu" type="file" accept="image/jpeg,image/png,image/webp"></label></div><div id="menu-img-preview-wrap" class="menu-preview-box"><img id="menu-img-preview" src="${menuImg(m.image)}" alt="Pratinjau foto" data-action="zoom-menu-img" title="Klik untuk melihat foto lebih besar"><div><strong id="menu-img-preview-label">${m.name ? "Foto hidangan saat ini" : "Pratinjau foto hidangan"}</strong><small class="muted" id="menu-img-preview-hint">${m.name ? "Kosongkan berkas di atas jika tidak ingin mengubah foto" : "Ilustrasi bawaan " + cats[m.category] + " (pilih berkas untuk mengganti)"}</small><button type="button" class="text-button" data-action="zoom-menu-img">${icon("search")} Lihat foto lebih besar</button></div></div><label>Komposisi lauk<textarea name="desc" rows="3" maxlength="500" required>${esc(m.desc)}</textarea></label><label class="menu-check-label"><input name="status_tersedia" type="checkbox" value="1" ${m.available !== false ? "checked" : ""}><span>Tersedia & langsung tampil di katalog</span></label><button class="button full" type="submit">Simpan menu</button></form>`);
}
document.addEventListener("click", async (e) => {
  const el = e.target.closest("[data-action]");
  if (!el) return;
  const a = el.dataset.action, id = Number(el.dataset.id), i = Number(el.dataset.index);
  if (a === "zoom-menu-img") {
    const img = $("#menu-img-preview");
    if (img) openLightbox(img.src, $('#menu-form input[name="name"]')?.value || "Pratinjau Foto Menu");
  }
  if (a === "edit-menu") editMenu(id);
  if (a === "availability") {
    const m = menus.find((m2) => m2.id === id);
    if (!m) return;
    try {
      const r = await fetch("/admin/menu/" + id + "/toggle", { method: "PATCH", headers: { "Accept": "application/json", "X-CSRF-TOKEN": sData.csrfToken } });
      const d = await r.json();
      if (r.ok) {
        m.available = d.menu?.status_tersedia ?? !m.available;
        render();
        toast(d.message || "Ketersediaan menu diperbarui.");
      } else toast(d.message || "Gagal mengubah status.");
    } catch (e2) {
      toast("Gagal menghubungi server.");
    }
  }
  if (a === "delete-menu") showModal(`<div class="modal-form"><h2 id="modal-title">Hapus menu ini?</h2><p>Menu akan dihapus dari katalog. Pesanan yang sudah dibuat tetap tersimpan.</p><button class="button" data-action="confirm-delete" data-id="${id}">Hapus menu</button> <button class="button outline" data-action="close">Batal</button></div>`);
  if (a === "confirm-delete") {
    try {
      const r = await fetch("/admin/menu/" + id, { method: "DELETE", headers: { "Accept": "application/json", "X-CSRF-TOKEN": sData.csrfToken } });
      const d = await r.json();
      if (r.ok) {
        menus = menus.filter((m) => m.id !== id);
        $("#modal").close();
        render();
        toast(d.message || "Menu dihapus.");
      } else toast(d.message || "Gagal menghapus.");
    } catch (e2) {
      toast("Gagal menghubungi server.");
    }
  }
});
document.addEventListener("input", (e) => {
  if (e.target.name === "price" && e.target.closest("#menu-form")) {
    const pv = $("#price-preview");
    if (pv) pv.textContent = money(e.target.value) + " / porsi";
  }
});
document.addEventListener("change", (e) => {
  if (e.target.name === "category" && e.target.closest("#menu-form")) {
    const mi = $('#menu-form input[name="min"]');
    const defs = { satuan: 1, box: 10, prasmanan: 30 };
    if (mi && defs[e.target.value]) mi.value = defs[e.target.value];
    const fi = $('#menu-form input[name="foto_menu"]');
    if (!fi?.files?.length) {
      const pv = $("#menu-img-preview"), h = $("#menu-img-preview-hint");
      if (pv) pv.src = "/images/" + e.target.value + ".jpg";
      if (h) h.textContent = "Ilustrasi bawaan " + cats[e.target.value] + " (pilih berkas untuk mengganti)";
    }
  }
});
document.addEventListener("change", (e) => {
  if (e.target.name === "foto_menu") {
    const f = e.target.files?.[0];
    if (f) {
      const ext = (f.name.split(".").pop() || "").toLowerCase(), valid = ["image/jpeg", "image/png", "image/webp"].includes(f.type) || ["jpg", "jpeg", "png", "webp"].includes(ext);
      if (!valid) {
        toast("Pilih foto JPG, PNG, atau WebP.");
        return;
      }
      if (f.size > 2 * 1024 * 1024) {
        toast("Foto terlalu besar (maksimal 2 MB).");
        return;
      }
      const url = URL.createObjectURL(f), pv = $("#menu-img-preview"), lbl = $("#menu-img-preview-label"), h = $("#menu-img-preview-hint");
      if (pv) pv.src = url;
      if (lbl) lbl.textContent = "Foto baru dipilih";
      if (h) h.textContent = esc(f.name) + " (" + Math.round(f.size / 1024) + " KB) — Siap disimpan";
    }
  }
});
document.addEventListener("submit", async (e) => {
  const f = e.target;
  if (f.id !== "menu-form") return;
  e.preventDefault();
  const d = new FormData(f);
  if (f.id === "menu-form") {
    const id = Number(f.dataset.id), isEdit = !isNaN(id) && id > 0, catsMap = { satuan: 1, box: 2, prasmanan: 3 }, cSlug = d.get("category") || "satuan";
    const fd = new FormData();
    fd.append("nama_menu", d.get("name"));
    fd.append("id_kategori", catsMap[cSlug] || 1);
    fd.append("harga", d.get("price"));
    fd.append("minimal_pesanan", d.get("min"));
    fd.append("jenis_paket", cSlug);
    fd.append("deskripsi", d.get("desc") || d.get("name") || "-");
    fd.append("status_tersedia", d.get("status_tersedia") ? "1" : "0");
    const fi = f.querySelector('input[type="file"]');
    if (fi?.files?.[0]) {
      const file = fi.files[0], ext = (file.name.split(".").pop() || "").toLowerCase();
      if (file.size > 2 * 1024 * 1024 || !["image/jpeg", "image/png", "image/webp"].includes(file.type) && !["jpg", "jpeg", "png", "webp"].includes(ext)) {
        toast("Foto harus JPG, PNG, atau WebP maksimal 2 MB.");
        return;
      }
      fd.append("foto_menu", file);
    }
    if (isEdit) fd.append("_method", "PUT");
    try {
      const r = await fetch(isEdit ? "/admin/menu/" + id : "/admin/menu", { method: "POST", headers: { "Accept": "application/json", "X-CSRF-TOKEN": sData.csrfToken }, body: fd });
      const res = await r.json();
      if (r.ok) {
        $("#modal").close();
        toast(res.message || "Menu disimpan.");
        setTimeout(() => location.reload(), 400);
      } else toast(res.message || "Gagal menyimpan menu.");
    } catch (e2) {
      toast("Gagal menghubungi server.");
    }
  }
});
window.CateringPages["admin-menu"] = { render: adminMenus };

function openLightbox(src, title = "Pratinjau Foto") {
  let lb = $("#img-lightbox");
  if (!lb) {
    lb = document.createElement("div");
    lb.id = "img-lightbox";
    lb.className = "img-lightbox";
    lb.onclick = (e) => {
      if (e.target.tagName !== "IMG") lb.remove();
    };
    $("#modal").appendChild(lb);
  }
  lb.innerHTML = `<div class="lightbox-inner"><div class="lightbox-bar"><span>${esc(title)}</span><button type="button" class="icon-button" onclick="this.closest('#img-lightbox').remove()" aria-label="Tutup">✕</button></div><img src="${src}" alt="${esc(title)}"><small>Klik di luar gambar atau tombol ✕ untuk menutup</small></div>`;
}
