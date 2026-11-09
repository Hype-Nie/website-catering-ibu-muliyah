let reportList = orders;
function reports() {
  return `<div class="admin-content">${heading("Laporan penjualan", "Tinjau transaksi dan omzet sesuai periode yang Anda pilih.")}<form id="report-filter" class="panel filter-bar"><label>Tanggal mulai<input name="start" type="date" value="2026-11-01" required></label><label>Tanggal akhir<input name="end" type="date" value="${today()}" required></label><label>Status<select name="status"><option value="">Semua status</option>${states.map((s, i) => `<option value="${i}">${s}</option>`).join("")}</select></label><button class="button">Terapkan filter</button></form><div id="report-results"></div></div>`;
}
function renderReport() {
  const f = $("#report-filter");
  let sDate = "2026-11-01", eDate = today();
  if (f) {
    const d = new FormData(f);
    sDate = d.get("start") || sDate;
    eDate = d.get("end") || eDate;
    reportList = orders.filter((o) => o.date >= sDate && o.date <= eDate && (d.get("status") === "" || o.status === Number(d.get("status"))));
  }
  $("#report-results").innerHTML = `${metrics(reportList)}<section class="panel table-panel"><div class="panel-heading"><div><h2>Rincian transaksi</h2><p>Periode: ${date(sDate)} s.d. ${date(eDate)} · ${reportList.length} transaksi</p></div><div class="table-actions"><button class="button outline small" data-action="print">Cetak / PDF</button><button class="button small" data-action="export">Unduh CSV</button></div></div>${orderTable(reportList, true)}</section><p class="muted small-text">Omzet dan porsi terjual dihitung dari pembayaran terverifikasi. CSV dapat dibuka di Excel.</p>`;
}
document.addEventListener("click", async (e) => {
  const el = e.target.closest("[data-action]");
  if (!el) return;
  const a = el.dataset.action, id = Number(el.dataset.id), i = Number(el.dataset.index);
  if (a === "export") {
    location.href = "/admin/laporan/export-csv";
    toast("Laporan CSV diunduh.");
  }
});
document.addEventListener("submit", async (e) => {
  const f = e.target;
  if (f.id !== "report-filter") return;
  e.preventDefault();
  const d = new FormData(f);
  if (f.id === "report-filter") {
    if (d.get("start") > d.get("end")) {
      toast("Tanggal akhir harus setelah tanggal mulai.");
      return;
    }
    renderReport();
  }
});
window.CateringPages["reports"] = { render: reports, init: renderReport };
