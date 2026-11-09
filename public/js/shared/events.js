document.addEventListener("click", async (e) => {
  const copyBtn = e.target.closest(".copy-btn");
  if (copyBtn) {
    const text = copyBtn.dataset.copy;
    if (text) {
      navigator.clipboard?.writeText(text).then(() => {
        const orig = copyBtn.innerHTML;
        copyBtn.textContent = "Tersalin! ✓";
        copyBtn.classList.add("copied");
        setTimeout(() => {
          copyBtn.innerHTML = orig;
          copyBtn.classList.remove("copied");
        }, 2e3);
        toast(`Tersalin ke clipboard: ${text}`);
      }).catch(() => toast("Gagal menyalin."));
    }
    return;
  }
  const checkoutLink = e.target.closest('a[href="/checkout"]');
  if (checkoutLink && !user) {
    e.preventDefault();
    showModal(`<div class="modal-form"><h2 id="modal-title">Masuk untuk Checkout</h2><p>Untuk melanjutkan ke proses pemesanan dan pembayaran, silakan masuk ke akun Anda atau daftar jika belum memiliki akun.</p><div style="display:flex;flex-direction:column;gap:10px;margin-top:18px;"><a href="/login?return=/checkout" class="button full">Masuk ke Akun</a><a href="/register?return=/checkout" class="button outline full">Daftar Akun Baru</a><button type="button" class="button outline" data-action="close">Kembali ke Keranjang</button></div></div>`);
    return;
  }
  const el = e.target.closest("[data-action]");
  if (!el) return;
  const a = el.dataset.action, id = Number(el.dataset.id), i = Number(el.dataset.index);
  if (a === "nav") {
    $("#navigation").classList.toggle("open");
    el.setAttribute("aria-expanded", $("#navigation").classList.contains("open"));
  }
  if (a === "close") $("#modal").close();
  if (a === "logout") showModal(`<div class="modal-form"><h2 id="modal-title">Keluar dari akun?</h2><p>Sesi Anda akan diakhiri. Anda dapat masuk kembali kapan saja.</p><div style="display:flex;gap:10px;margin-top:18px;"><button type="button" class="button" data-action="confirm-logout">Ya, keluar akun</button><button type="button" class="button outline" data-action="close">Batal</button></div></div>`);
  if (a === "confirm-logout") {
    try {
      const res = await fetch("/logout", { method: "POST", headers: { "Content-Type": "application/json", "Accept": "application/json", "X-CSRF-TOKEN": sData.csrfToken } });
      if (res.ok) {
        user = null;
        cart = [];
        persistCart();
        location.href = "/login";
      }
    } catch (e2) {
      location.href = "/logout";
    }
  }
});
$("#modal").addEventListener("click", (e) => {
  if (e.target === $("#modal")) {
    const r = e.target.getBoundingClientRect();
    if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) e.target.close();
  }
});
$("#modal").addEventListener("close", () => document.body.classList.remove("print-receipt"));

document.addEventListener('click',e=>{
 if(e.target.closest('[data-action="print"], [data-action="print-thermal"]'))window.print();
});
