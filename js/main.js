// Cambia el número a uno real (formato: 569XXXXXXXX)
const WHATSAPP_NUMBER = "56912345678";

function buildWhatsAppLink() {
  const msg = encodeURIComponent("Hola! Quiero reservar una hora para uñas 💅");
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`;
}

document.addEventListener("DOMContentLoaded", () => {
  // año footer
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // links WhatsApp
  const wa = buildWhatsAppLink();
  ["btnWhatsappTop", "btnWhatsappBottom", "waFloat"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.href = wa;
  });

  // Modal galería (Bootstrap)
  const modalEl = document.getElementById("imgModal");
  const modalImg = document.getElementById("modalImg");
  const modal = modalEl ? new bootstrap.Modal(modalEl) : null;

  document.querySelectorAll(".gallery-img").forEach((img) => {
    img.addEventListener("click", () => {
      if (!modal || !modalImg) return;
      modalImg.src = img.src;
      modalImg.alt = img.alt || "Imagen";
      modal.show();
    });
  });
});
