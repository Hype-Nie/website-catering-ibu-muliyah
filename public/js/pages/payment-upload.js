function handleFilePreview(file, inputEl) {
  const preview = $("#proof-preview"), err = $("#payment-error");
  if (!preview) return;
  preview.innerHTML = "";
  if (err) err.textContent = "";
  if (!file) return;
  const valid = ["image/jpeg", "image/png", "application/pdf"], ext = (file.name.split(".").pop() || "").toLowerCase();
  if (!valid.includes(file.type) && !["jpg", "jpeg", "png", "pdf"].includes(ext) || file.size > 2 * 1024 * 1024) {
    if (inputEl) inputEl.value = "";
    if (err) err.textContent = "Pilih JPG, PNG, atau PDF dengan ukuran maksimal 2 MB.";
    return;
  }
  const sizeStr = file.size >= 1048576 ? (file.size / 1048576).toFixed(1) + " MB" : Math.round(file.size / 1024) + " KB";
  const isPdf = file.type === "application/pdf" || ext === "pdf", badgeTxt = isPdf ? "PDF" : ext === "png" ? "PNG" : "JPG";
  const card = document.createElement("div");
  card.className = "proof-preview-card" + (isPdf ? " pdf" : "");
  card.innerHTML = `<div class="proof-preview-media">${isPdf ? `<div class="pdf-icon-box">${icon("bag")}<span>PDF</span></div>` : `<img class="proof-preview-thumb" alt="Pratinjau bukti transfer">`}</div><div class="proof-preview-details"><div class="proof-preview-meta"><span class="badge ${isPdf ? "" : "success"}">${badgeTxt}</span><strong class="proof-preview-name">${esc(file.name)}</strong><span class="proof-preview-size">${sizeStr}</span></div><button type="button" class="button outline small btn-clear-proof" data-action="clear-proof">✕ Hapus / Ganti</button></div>`;
  if (!isPdf) {
    const img = card.querySelector("img");
    img.src = URL.createObjectURL(file);
    img.onload = () => URL.revokeObjectURL(img.src);
  }
  preview.appendChild(card);
}

function initUploadArea() {
  const area = $(".upload-area");
  if (!area || area._boundDrag) return;
  area._boundDrag = true;
  ["dragenter", "dragover"].forEach((n) => area.addEventListener(n, (e) => {
    e.preventDefault();
    e.stopPropagation();
    area.classList.add("dragover");
  }));
  ["dragleave", "drop"].forEach((n) => area.addEventListener(n, (e) => {
    e.preventDefault();
    e.stopPropagation();
    area.classList.remove("dragover");
  }));
  area.addEventListener("drop", (e) => {
    e.preventDefault();
    e.stopPropagation();
    area.classList.remove("dragover");
    const file = e.dataTransfer?.files?.[0];
    if (!file) return;
    const input = area.querySelector('input[type="file"]');
    if (input) {
      try {
        const dt = new DataTransfer();
        dt.items.add(file);
        input.files = dt.files;
      } catch (err) {
        input.files = e.dataTransfer.files;
      }
      handleFilePreview(file, input);
    }
  });
}
