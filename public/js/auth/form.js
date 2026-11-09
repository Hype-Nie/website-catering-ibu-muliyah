function initAuthForm() {
  const form = document.querySelector("#auth-form");
  if (!form) return;
  form.addEventListener("input", (e) => e.target.removeAttribute("aria-invalid"));
  form.querySelector('[aria-invalid="true"]')?.focus();
}
