function thermalReceipt(o) {
  return `<div class="thermal-receipt"><div class="receipt-header"><h3>DAPUR MENTENG</h3><p>Catering Nasi Uduk Ibu Muliyah<br>Jl. Menteng No. 10, Jakarta Pusat<br>Telp/WA: 0812-3456-7890</p></div><hr class="receipt-divider"><h4>NOTA / INVOICE PEMESANAN</h4><hr class="receipt-divider"><div class="receipt-rows"><div class="receipt-row"><span>No. Nota:</span><b>${esc(o.id)}</b></div><div class="receipt-row"><span>Tanggal:</span><span>${date(o.date)}</span></div><div class="receipt-row"><span>Pelanggan:</span><span>${esc(o.name)}</span></div><div class="receipt-row"><span>No. HP:</span><span>${esc(o.phone)}</span></div><div class="receipt-row"><span>Pengiriman:</span><span>${o.method === "pickup" ? "Ambil di Dapur" : "Diantar Kurir"}</span></div><div class="receipt-row"><span>Jadwal:</span><span>${date(o.deliveryDate)}, ${esc(o.time)} WIB</span></div>${o.method === "delivery" ? `<div class="receipt-addr"><span>Alamat:</span><small>${esc(o.address)}</small></div>` : ""}</div><hr class="receipt-divider"><div class="receipt-items">${o.items.map((it) => `<div class="receipt-item"><div class="receipt-item-title">${esc(it.name)}</div><div class="receipt-row"><span>${it.qty} × ${money(it.price)}</span><b>${money(it.qty * it.price)}</b></div>${it.note ? `<div class="receipt-item-note">* Catatan: ${esc(it.note)}</div>` : ""}</div>`).join("")}</div><hr class="receipt-divider"><div class="receipt-rows"><div class="receipt-row"><span>Subtotal:</span><span>${money(total(o.items))}</span></div><div class="receipt-row"><span>Ongkir (${o.method === "pickup" ? "Ambil" : "Kurir"}):</span><span>${money(o.fee || 0)}</span></div><hr class="receipt-divider"><div class="receipt-row receipt-total"><span>TOTAL:</span><b>${money(total(o.items) + o.fee)}</b></div><hr class="receipt-divider"><div class="receipt-row"><span>Status Bayar:</span><b>${esc(o.payment.toUpperCase())}</b></div>${o.bank ? `<div class="receipt-row"><span>Metode:</span><span>Transfer ${esc(o.bank)}</span></div>` : ""}</div>${o.notes ? `<hr class="receipt-divider"><div class="receipt-addr"><span>Catatan:</span><small>${esc(o.notes)}</small></div>` : ""}<hr class="receipt-divider"><div class="receipt-footer"><p>TERIMA KASIH ATAS PESANAN ANDA<br><small>Hidangan Higienis & Segar Dapur Menteng<br>Simpan struk ini sebagai bukti pembayaran sah.</small></p></div></div>`;
}

function showInvoice(id, autoPrint = false) {
  const o = (id ? orders.find((x) => x.id === id || String(x.rawId) === String(id)) : null) || selectedOrder();
  if (!o) return;
  document.body.classList.add("print-receipt");
  showModal(`<div class="modal-form receipt-modal-wrap"><div class="receipt-modal-actions no-print"><button type="button" class="button" data-action="print-thermal">${icon("check")} Cetak ke Mesin Struk / Printer</button></div>${thermalReceipt(o)}</div>`);
  if (autoPrint) setTimeout(() => window.print(), 200);
}

document.addEventListener('click', e => {
 const el=e.target.closest('[data-action="show-invoice"]');
 if(el)showInvoice(el.dataset.id||selectedOrder()?.id,true);
});
