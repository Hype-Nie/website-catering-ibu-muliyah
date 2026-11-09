function renderHistory() {
  const list = customerOrders();
  return `<div class="container page-content">${heading("Pesanan Anda", "Dari dapur hingga meja makan, pantau semuanya di sini.", `<div style="display:flex;gap:8px;"><a href="/lacak-pesanan" class="button outline small">Lacak via nomor nota</a>${button("/menu", "Pesan lagi", "small")}</div>`)}<div class="tabs history-tabs"><button data-action="history-filter" data-filter="all" aria-pressed="true">Semua pesanan</button><button data-action="history-filter" data-filter="active" aria-pressed="false">Sedang berjalan</button><button data-action="history-filter" data-filter="done" aria-pressed="false">Selesai</button></div><div id="history-list">${historyCards(list)}</div></div>`;
}
document.addEventListener("click", async (e) => {
  const el = e.target.closest("[data-action]");
  if (!el) return;
  const a = el.dataset.action, id = Number(el.dataset.id), i = Number(el.dataset.index);
  if (a === "history-filter") {
    const f = el.dataset.filter;
    document.querySelectorAll(".history-tabs button").forEach((b) => b.setAttribute("aria-pressed", b === el));
    const all = customerOrders();
    const list = f === "active" ? all.filter((o) => o.status < 3) : f === "done" ? all.filter((o) => o.status === 3) : all;
    $("#history-list").innerHTML = historyCards(list);
  }
});
window.CateringPages["history"] = { render: renderHistory };
