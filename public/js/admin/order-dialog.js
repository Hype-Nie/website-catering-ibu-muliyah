function orderDetail(id, fromCust) {
  const o = orders.find((x) => x.id === id);
  if (!o) return;
  const pSrc = o.proofData || (o.proof ? o.proof.startsWith("http") || o.proof.startsWith("/") ? o.proof : "/storage/" + o.proof : null), isPdf = Boolean(pSrc && (pSrc.toLowerCase().endsWith(".pdf") || pSrc.startsWith("data:application/pdf"))), isProc = Boolean(o.status >= 1 || o.payment === "Lunas");
  showModal(`<div class="modal-form">${fromCust !== void 0 && fromCust !== "" ? `<button type="button" class="modal-back-btn" data-action="customer" data-index="${fromCust}">← Kembali ke riwayat pelanggan</button>` : ""}<h2 id="modal-title">${esc(o.id)}</h2><p>${esc(o.name)} · ${date(o.deliveryDate)}, ${esc(o.time)}</p>${summary(o.items, o.fee, "")}<p><b>Pengiriman:</b> ${esc(o.method === "pickup" ? "Ambil di dapur" : o.address)}</p><p><b>Pembayaran:</b> ${badge(o.payment)}</p><div style="margin:8px 0;"><button type="button" class="button outline small" data-action="show-invoice" data-id="${esc(o.id)}">${icon("check")} Cetak Struk / Invoice Mesin</button></div>${pSrc ? `<div class="admin-proof-box"><div class="admin-proof-head"><b>Bukti Transfer:</b> ${esc(o.bank || "Transfer Bank")}${o.sender ? " a.n " + esc(o.sender) : ""}${o.transferAmount ? " (" + money(o.transferAmount) + ")" : ""}</div>${isPdf ? `<a href="${esc(pSrc)}" download="bukti-${esc(o.id)}.pdf" class="button outline small">Unduh berkas PDF</a>` : isProc ? `<button type="button" class="button outline small" onclick="const b=this.nextElementSibling;const o=b.style.display!=='none';b.style.display=o?'none':'block';this.textContent=o?'Lihat bukti pembayaran':'Sembunyikan bukti'">${icon("search")} Lihat bukti pembayaran</button><div style="display:none;margin-top:10px;"><img class="payment-proof" src="${esc(pSrc)}" alt="Bukti transfer ${esc(o.id)}" onclick="this.classList.toggle('zoomed')" title="Klik untuk perbesar / perkecil"><small class="muted" style="display:block;text-align:center;margin-top:4px;">Klik gambar untuk perbesar / perkecil</small></div>` : `<div><img class="payment-proof" src="${esc(pSrc)}" alt="Bukti transfer ${esc(o.id)}" onclick="this.classList.toggle('zoomed')" title="Klik untuk perbesar / perkecil"><small class="muted" style="display:block;text-align:center;margin-top:4px;">Klik gambar untuk perbesar / perkecil</small></div>`}</div>` : '<p class="muted small-text"><b>Bukti transfer:</b> Belum ada berkas diunggah.</p>'}${o.payment === "Menunggu verifikasi" ? `<div class="form-grid"><button class="button" data-action="verify" data-id="${o.id}">Terima pembayaran</button><button class="button outline" data-action="reject" data-id="${o.id}">Tolak bukti</button></div>` : ""}<form id="status-form" data-id="${o.id}"><label>Progres pesanan<select name="status" ${o.payment !== "Lunas" ? "disabled" : ""}>${states.map((s, i) => `<option value="${i}" ${o.status === i ? "selected" : ""}>${s}</option>`).join("")}</select></label><button class="button full" type="submit" ${o.payment !== "Lunas" ? "disabled" : ""}>Simpan progres</button></form></div>`);
}

document.addEventListener("click", async (e) => {
  const el = e.target.closest("[data-action]");
  if (!el) return;
  const a = el.dataset.action, id = Number(el.dataset.id), i = Number(el.dataset.index);
  if (a === "order-detail") orderDetail(el.dataset.id, el.dataset.fromCustomer);
  if (a === "verify") {
    const o = orders.find((o2) => o2.id === el.dataset.id || String(o2.rawId) === el.dataset.id);
    if (!o) return;
    const tid = o.rawId || o.id;
    try {
      const r = await fetch("/admin/pesanan/" + tid + "/verify", { method: "POST", headers: { "Accept": "application/json", "X-CSRF-TOKEN": sData.csrfToken } });
      const d = await r.json();
      if (r.ok) {
        o.payment = "Lunas";
        o.status = 1;
        $("#modal").close();
        render();
        toast(d.message || "Pembayaran diverifikasi.");
      } else toast(d.message || "Gagal memverifikasi.");
    } catch (e2) {
      toast("Gagal menghubungi server.");
    }
  }
  if (a === "reject") {
    showModal(`<form id="reject-form" data-id="${esc(el.dataset.id)}" class="modal-form"><h2 id="modal-title">Tolak bukti pembayaran</h2><label>Alasan penolakan<textarea name="reason" rows="3" maxlength="500" placeholder="Jelaskan apa yang perlu diperbaiki pelanggan" required></textarea></label><button class="button full">Kirim alasan penolakan</button></form>`);
  }

});
document.addEventListener("submit", async (e) => {
  const f = e.target;
  if (f.id !== "status-form") return;
  e.preventDefault();
  const d = new FormData(f);
  if (f.id === "status-form") {
    const o = orders.find((x) => x.id === f.dataset.id || String(x.rawId) === f.dataset.id);
    if (!o) return;
    const tid = o.rawId || o.id, nextStatus = Number(d.get("status"));
    try {
      const r = await fetch("/admin/pesanan/" + tid + "/status", { method: "PATCH", headers: { "Content-Type": "application/json", "Accept": "application/json", "X-CSRF-TOKEN": sData.csrfToken }, body: JSON.stringify({ status_pesanan: nextStatus }) });
      const res = await r.json();
      if (r.ok) {
        o.status = nextStatus;
        $("#modal").close();
        render();
        toast(res.message || "Progres pesanan diperbarui.");
      } else toast(res.message || "Gagal mengubah status.");
    } catch (e2) {
      toast("Gagal menghubungi server.");
    }
  }
});
document.addEventListener("submit", async (e) => {
  const f = e.target;
  if (f.id !== "reject-form") return;
  e.preventDefault();
  const d = new FormData(f);
  if (f.id === "reject-form") {
    const o = orders.find((x) => x.id === f.dataset.id || String(x.rawId) === f.dataset.id);
    if (!o) return;
    const tid = o.rawId || o.id, reason = d.get("reason") || "";
    try {
      const r = await fetch("/admin/pesanan/" + tid + "/reject", { method: "POST", headers: { "Content-Type": "application/json", "Accept": "application/json", "X-CSRF-TOKEN": sData.csrfToken }, body: JSON.stringify({ catatan_penolakan: reason, reason }) });
      const res = await r.json();
      if (r.ok) {
        o.payment = "Ditolak";
        o.rejection = reason;
        $("#modal").close();
        render();
        toast(res.message || "Bukti ditolak.");
      } else toast(res.message || "Gagal menolak bukti.");
    } catch (e2) {
      toast("Gagal menghubungi server.");
    }
  }
});
