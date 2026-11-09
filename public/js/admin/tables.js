function decorateAdminTables() {
  document.querySelectorAll(".admin .table-scroll").forEach((wrap) => {
    if (wrap.dataset.enhanced) return;
    wrap.dataset.enhanced = "true";
    wrap.tabIndex = 0;
    wrap.setAttribute("role", "region");
    wrap.setAttribute("aria-label", wrap.closest("section")?.querySelector("h2")?.textContent || "Daftar data administrasi");
    const hint = document.createElement("p");
    hint.className = "table-scroll-hint";
    hint.textContent = "Geser tabel ke samping untuk melihat semua kolom.";
    hint.hidden = true;
    wrap.before(hint);
    const observer = new ResizeObserver(() => {
      hint.hidden = wrap.scrollWidth <= wrap.clientWidth + 1;
    });
    observer.observe(wrap);
    const table = wrap.querySelector("table");
    if (table) {
      table.querySelectorAll("th").forEach((th) => {
        if (["Harga / porsi", "Total tagihan", "Total belanja"].includes(th.textContent)) th.classList.add("numeric");
      });
      observer.observe(table);
    }
  });
}
