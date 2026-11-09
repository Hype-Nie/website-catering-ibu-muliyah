function render() {
  const view = window.CateringPages[page];
  if (!view) return;
  const target = $("[data-page-content]");
  if (!target) return;
  const fragment = document.createElement("template");
  fragment.innerHTML = view.render();
  const heading = fragment.content.querySelector(".page-heading");
  if (heading) {
    $(".page-heading")?.replaceWith(heading);
  }
  const wrapper = fragment.content.firstElementChild;
  target.replaceChildren(...wrapper.childNodes);
  if (view.init) {
    if (page === "checkout" || page === "payment") setTimeout(view.init, 60);
    else view.init();
  }
}
render();
if (admin) {
  const sidebar = $(".sidebar"), current = sidebar.querySelector("[aria-current=page]");
  if (matchMedia("(max-width:700px)").matches && current) sidebar.scrollLeft += current.getBoundingClientRect().left - sidebar.getBoundingClientRect().left - 16;
  decorateAdminTables();
  const tableObserver = new MutationObserver(decorateAdminTables);
  tableObserver.observe($("#main"), { childList: true, subtree: true });
}
if (sData.flash?.success) {
  setTimeout(() => toast(sData.flash.success), 150);
}
if (sData.flash?.error && !["login", "register"].includes(page)) {
  setTimeout(() => toast(sData.flash.error), 150);
}
