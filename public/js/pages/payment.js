function payment() {
  const o = selectedOrder();
  if (!o) return `<div class="container page-content">${empty("Belum ada pesanan", "Buat pesanan sebelum mengunggah bukti transfer.", "/menu", "Pilih menu")}</div>`;
  const orderTotal = o.total || total(o.items) + o.fee, proofUrl = o.proofData || (o.proof ? o.proof.startsWith("/") || o.proof.startsWith("http") || o.proof.startsWith("data:") ? o.proof : "/storage/" + o.proof : null), isPaid = o.payment === "Lunas", isRejected = o.payment === "Ditolak";
  return `<div class="container page-content">${heading("Selesaikan pembayaran", "Transfer sesuai tagihan, lalu kirim bukti untuk diperiksa admin.")} ${steps(2)}<div class="notice">${badge(o.payment)} <span>Transfer tepat sebesar <strong>${money(orderTotal)}</strong> ke rekening Dapur Menteng di atas, lalu lampirkan bukti transfer di bawah ini.</span></div><div class="two-column"><div><section class="panel form-panel"><div class="panel-head-row"><h2>Transfer bank</h2><button type="button" class="button outline small copy-btn" data-copy="${orderTotal}">${icon("check")} Salin Nominal (${money(orderTotal)})</button></div><p class="muted small-text">Silakan transfer ke salah satu rekening resmi Catering Ibu Muliyah:</p><div class="bank-grid"><div class="bank"><div class="bank-head"><strong>BCA</strong><button type="button" class="button outline small copy-btn" data-copy="873-021-9988">Salin</button></div><b class="bank-acc">873-021-9988</b><span class="bank-holder">a.n. Catering Ibu Muliyah</span></div><div class="bank"><div class="bank-head"><strong>Mandiri</strong><button type="button" class="button outline small copy-btn" data-copy="122-00-9876543-1">Salin</button></div><b class="bank-acc">122-00-9876543-1</b><span class="bank-holder">a.n. Catering Ibu Muliyah</span></div></div></section>${o.proof ? `<section class="panel form-panel uploaded-proof-card"><div class="panel-head-row"><h2>Bukti Transfer Terunggah</h2>${badge(o.payment)}</div><div class="uploaded-proof-box">${proofUrl?.endsWith(".pdf") ? `<a href="${esc(proofUrl)}" download="bukti-${esc(o.id)}.pdf" class="button outline small">${icon("bag")} Unduh Dokumen PDF Bukti Transfer</a>` : `<div class="proof-display-card"><div class="proof-toolbar"><button type="button" class="button outline small" onclick="const img=this.parentElement.nextElementSibling;img.classList.toggle('zoomed');this.textContent=img.classList.contains('zoomed')?'Perkecil gambar':'Perbesar gambar'">${icon("search")} Perbesar gambar</button><small class="muted">Klik gambar atau tombol untuk perbesar</small></div><img src="${esc(proofUrl)}" alt="Bukti Transfer" class="uploaded-proof-img" onclick="this.classList.toggle('zoomed')" title="Klik untuk perbesar / perkecil"></div>`}</div>${isRejected ? `<div class="notice error"><strong>Bukti Ditolak:</strong> <span>${esc(o.rejection || "Bukti transfer tidak sesuai. Silakan kirimkan ulang bukti yang valid.")}</span></div>` : ""}</section>` : ""}${!isPaid ? `<form id="payment-form" method="POST" action="/pembayaran" enctype="multipart/form-data" class="panel form-panel"><input type="hidden" name="_token" value="${esc(sData.csrfToken || "")}"><input type="hidden" name="id_pesanan" value="${esc(o.id)}"><h2>${o.proof ? "Unggah Ulang Bukti Transfer" : "Konfirmasi transfer"}</h2><div class="form-grid"><label>Bank pengirim<input name="nama_bank" placeholder="Contoh: BCA" required></label><label>Nama pemilik rekening<input name="nama_pemilik_rekening" value="${esc(o.name)}" required></label><label>Nominal transfer<input type="number" name="nominal_transfer" min="${orderTotal}" value="${orderTotal}" required></label><label>Tanggal transfer<input type="date" name="tanggal_transfer" max="${today()}" value="${today()}" required></label></div><label class="upload-area">${icon("bag")}<b>Pilih bukti transfer atau tarik ke sini</b><span>JPG, PNG, atau PDF. Maksimal 2 MB.</span><input name="bukti_transfer" type="file" accept="image/jpeg,image/png,application/pdf" required></label><div id="proof-preview"></div><p id="payment-error" class="form-error" role="alert"></p><button class="button full" type="submit">Kirim bukti pembayaran</button></form>` : ""}</div>${summary(o.items, o.fee, button("/lacak-pesanan?id=" + o.id, "Lacak pesanan", "outline full"))}</div></div>`;
}


document.addEventListener("click", async (e) => {
  const el = e.target.closest("[data-action]");
  if (!el) return;
  const a = el.dataset.action, id = Number(el.dataset.id), i = Number(el.dataset.index);
  if (a === "clear-proof") {
    const input = $('input[name="bukti_transfer"], input[name="proof"]');
    if (input) input.value = "";
    const p = $("#proof-preview");
    if (p) p.innerHTML = "";
    const err = $("#payment-error");
    if (err) err.textContent = "";
    return;
  }
});
document.addEventListener("change", (e) => {
  if (e.target.name === "bukti_transfer" || e.target.name === "proof") handleFilePreview(e.target.files[0], e.target);
});
document.addEventListener("submit", async (e) => {
  const f = e.target;
  if (f.id !== "payment-form") return;
  if (f.id === "payment-form") {
    const file = f.querySelector('input[type="file"]')?.files[0];
    if (!file || file.size > 2 * 1024 * 1024 || !["image/jpeg", "image/png", "application/pdf"].includes(file.type)) {
      e.preventDefault();
      const err = $("#payment-error");
      if (err) err.textContent = "Pilih JPG, PNG, atau PDF maksimal 2 MB.";
      return;
    }
    const btn = f.querySelector('[type="submit"]');
    if (btn) {
      btn.disabled = true;
      btn.textContent = "Mengunggah bukti pembayaran...";
    }
    return;
  }
});
window.CateringPages["payment"] = { render: payment, init: initUploadArea };
