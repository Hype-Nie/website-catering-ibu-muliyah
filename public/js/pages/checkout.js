function checkout() {
  if (!cart.length) return `<div class="container page-content">${heading("Checkout", "Lengkapi detail pesanan Anda.")}${empty("Belum ada menu dipilih", "Tambahkan menu ke keranjang sebelum checkout.", "/menu", "Pilih menu")}</div>`;
  const defLoc = sData.defaultLocation, initAddr = defLoc?.address || user?.alamat || user?.address || "", initLat = defLoc?.latitude ?? -6.21, initLon = defLoc?.longitude ?? 106.845, initDist = defLoc?.distance_km ?? 3;
  return `<div class="container page-content">${heading("Sedikit lagi, siap dipesan.", "Lengkapi penerima, jadwal, dan cara menerima hidangan.")} ${steps(1)}<form id="checkout-form" method="POST" action="/checkout" class="two-column"><input type="hidden" name="_token" value="${esc(sData.csrfToken || "")}"><div><section class="panel form-panel"><h2>Informasi penerima</h2>${user ? `<div class="user-autofill-banner">${icon("users")}<span>Masuk sebagai <b>${esc(user.nama)}</b> (${esc(user.email)}) — ${defLoc?.source === "latest_order" ? "Alamat & titik lokasi pesanan terakhir otomatis diterapkan." : "Data penerima dan alamat pengantaran terisi otomatis."}</span></div>` : '<p class="muted small-text">Sudah punya akun? <a href="/login" class="plain-link">Masuk ke akun Anda</a> agar data dan alamat otomatis terisi.</p>'}<div class="form-grid"><label>Nama penerima<input name="name" autocomplete="name" value="${esc(user?.nama || user?.name || "")}" required></label><label>Nomor WhatsApp<input name="phone" type="tel" autocomplete="tel" pattern="[0-9+ ()-]{9,18}" placeholder="08xxxxxxxxxx" value="${esc(user?.nomor_telepon || user?.phone || "")}" required></label></div></section><section class="panel form-panel"><h2>Kapan hidangan dibutuhkan?</h2><p class="muted">Pesan minimal sehari sebelum acara.</p><div class="form-grid"><label>Tanggal acara<input type="date" name="deliveryDate" min="${tomorrow()}" value="${tomorrow()}" required></label><label>Jam pengantaran / pengambilan<input type="time" name="time" value="10:00" min="06:00" max="20:00" required></label></div></section><section class="panel form-panel"><h2>Cara menerima pesanan</h2><div class="delivery-choices"><label><input type="radio" name="method" value="delivery" checked>${icon("truck")}<span>Diantar ke lokasi<small>Radius maksimal 20 km</small></span></label><label><input type="radio" name="method" value="pickup">${icon("bag")}<span>Ambil di dapur<small>Tanpa ongkos kirim</small></span></label></div><div id="delivery-fields"><label>Alamat lengkap & patokan<textarea id="checkout-address" name="address" rows="3" required placeholder="Jalan, nomor rumah, RT/RW, kelurahan, kecamatan, atau patokan lokasi">${esc(initAddr)}</textarea></label><div class="address-sync-bar"><button type="button" id="btn-sync-address" class="button outline small">${icon("search")} Cari Lokasi dari Alamat di Atas</button><small class="muted">Ketik/tempel alamat di atas lalu klik tombol ini untuk otomatis menandai titik pada peta.</small></div><div class="map-picker-section"><div class="map-header-row"><div><span class="field-title">${icon("pin")} Titik Pin Alamat Pengantaran</span><span class="field-desc">Jarak dan ongkos kirim dihitung otomatis dari koordinat pin peta</span></div><div class="map-header-actions"><button type="button" id="btn-my-location" class="button outline small btn-gps" title="Gunakan GPS Perangkat">${icon("pin")} Lokasi Saya</button><button type="button" id="btn-toggle-fullscreen" class="button outline small btn-fullscreen" title="Buka peta ke layar penuh">${icon("maximize")} <span id="fullscreen-label">Layar Penuh</span></button></div></div><div id="map-picker" class="map-container"></div><div class="map-guide-bar"><span><b>Petunjuk:</b> Geser pin merah, klik peta, atau gunakan tombol Layar Penuh untuk tampilan leluasa.</span></div><div id="distance-summary-card" class="distance-summary-card"><div class="distance-info-left"><div class="distance-badge-row"><span id="radius-badge" class="badge success">Dalam Jangkauan</span><strong id="distance-readout">${initDist.toFixed(1)} km</strong></div><p id="distance-status-desc" class="muted small-text">Titik Asal: Dapur Menteng (-6.1944, 106.8372)</p></div><div class="distance-fee-right"><span>Ongkos Kirim</span><b id="calculated-fee" class="fee-text">${money(initDist <= 1 ? 5e3 : 5e3 + Math.ceil(initDist - 1) * 2e3)}</b></div><button type="button" id="btn-apply-fullscreen" class="button small btn-apply-fullscreen" style="display:none;">✓ Terapkan Titik Ini & Tutup</button></div><input type="hidden" name="delivery_latitude" id="input-delivery-lat" value="${initLat}"><input type="hidden" name="delivery_longitude" id="input-delivery-lon" value="${initLon}"><input type="hidden" name="distance" id="input-delivery-dist" value="${initDist}"></div></div><p id="pickup-message" class="notice" hidden>Pesanan akan disiapkan untuk diambil di Dapur Menteng (Jl. Menteng No. 10, Jakarta Pusat) sesuai jadwal yang Anda tentukan.</p></section><section class="panel form-panel"><h2>Catatan tambahan</h2><label>Informasi untuk dapur atau kurir (opsional)<textarea name="notes" rows="3" maxlength="500" placeholder="Patokan alamat atau kebutuhan acara"></textarea></label></section></div>${summary(cart, initDist <= 1 ? 5e3 : 5e3 + Math.ceil(initDist - 1) * 2e3, '<button class="button full" type="submit">Buat pesanan ' + icon("arrow") + "</button>")}</form></div>`;
}
function shipping() {
  const f = $("#checkout-form");
  if (!f) return 0;
  const pickup = f.elements.method.value === "pickup";
  $("#delivery-fields").hidden = pickup;
  $("#pickup-message").hidden = !pickup;
  f.elements.address.required = !pickup;
  if (pickup) {
    $("#shipping-cost").textContent = money(0);
    $("#grand-total").textContent = money(total(cart));
    const badge2 = $("#radius-badge");
    if (badge2) {
      badge2.className = "badge";
      badge2.textContent = "Ambil Sendiri";
    }
    const desc2 = $("#distance-status-desc");
    if (desc2) desc2.textContent = "Pesanan diambil langsung di Dapur Menteng tanpa ongkos kirim.";
    const feeBox2 = $("#calculated-fee");
    if (feeBox2) feeBox2.textContent = money(0);
    f.querySelector('[type="submit"]').disabled = false;
    return 0;
  }
  if (window._checkoutMap) {
    setTimeout(() => window._checkoutMap?.invalidateSize(), 150);
  }
  const dist = Number($("#input-delivery-dist")?.value || 3);
  const invalid = dist > 20;
  const badge = $("#radius-badge");
  const readout = $("#distance-readout");
  const desc = $("#distance-status-desc");
  const feeBox = $("#calculated-fee");
  if (readout) readout.textContent = `${dist.toFixed(1)} km`;
  if (invalid) {
    if (badge) {
      badge.className = "badge danger";
      badge.textContent = "Di Luar Radius 20 km";
    }
    if (desc) desc.textContent = `Jarak ${dist.toFixed(1)} km melebihi batas jangkauan kurir (maksimal 20 km). Silakan pilih opsi 'Ambil di dapur (Pick-up)' untuk melanjutkan.`;
    f.querySelector('[type="submit"]').disabled = true;
  } else {
    if (badge) {
      badge.className = "badge success";
      badge.textContent = "Dalam Jangkauan";
    }
    const extraKm = Math.ceil(Math.max(0, dist - 1));
    const extraFee = extraKm * 2e3;
    if (desc) {
      desc.textContent = dist <= 1 ? `Tarif dasar 1 km pertama: ${money(5e3)} (Jarak: ${dist.toFixed(1)} km dari Dapur Menteng).` : `Rincian: ${money(5e3)} (1 km pertama) + ${money(extraFee)} (${extraKm} km × ${money(2e3)}).`;
    }
    f.querySelector('[type="submit"]').disabled = false;
  }
  const fee = dist <= 1 ? 5e3 : 5e3 + Math.ceil(dist - 1) * 2e3;
  if (feeBox) feeBox.textContent = money(fee);
  $("#shipping-cost").textContent = money(fee);
  $("#grand-total").textContent = money(total(cart) + fee);
  return fee;
}
document.addEventListener("change", (e) => {
  if (e.target.closest("#checkout-form")) shipping();
});
document.addEventListener("submit", async (e) => {
  const f = e.target;
  if (f.id !== "checkout-form") return;
  if (f.id === "checkout-form") {
    if (f.querySelector('[type="submit"]').disabled) {
      e.preventDefault();
      return;
    }
    const d = new FormData(f), delDate = d.get("delivery_date") || d.get("deliveryDate");
    if (delDate < tomorrow()) {
      e.preventDefault();
      toast("Pilih tanggal acara paling awal besok.");
      return;
    }
    return;
  }
});
window.CateringPages["checkout"] = { render: checkout, init: initCheckoutMap };
