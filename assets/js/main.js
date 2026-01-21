const WHATSAPP_NUMBER = "56912345678";

function buildWhatsAppLink() {
  const msg = encodeURIComponent("Hola! Quiero reservar una hora para uñas 💅");
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`;
}

document.addEventListener("DOMContentLoaded", () => {
  // Año footer
  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  // WhatsApp links
  const wa = buildWhatsAppLink();
  ["btnWhatsappTop", "btnWhatsappBottom", "btnWhatsappFloat"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.href = wa;
  });

  const navbar = document.querySelector(".navbar");
  const toggleNavbar = () => {
    if (!navbar) return;
    navbar.classList.toggle("scrolled", window.scrollY > 10);
  };
  toggleNavbar();
  window.addEventListener("scroll", toggleNavbar, { passive: true });

  // Galería modal
  const galleryImages = document.querySelectorAll(".gallery-img");
  const galleryModal = document.getElementById("galleryModal");
  const galleryModalImage = document.querySelector(".gallery-modal-image");
  const galleryModalDescription = document.querySelector(".gallery-modal-description");
  const galleryModalClose = document.querySelector(".gallery-modal-close");

  const openGalleryModal = (img) => {
    if (!galleryModal || !galleryModalImage || !galleryModalDescription) return;
    galleryModalImage.src = img.src;
    galleryModalImage.alt = img.alt;
    galleryModalDescription.textContent = img.dataset.description || "";
    galleryModal.classList.add("is-open");
    galleryModal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
  };

  const closeGalleryModal = () => {
    if (!galleryModal) return;
    galleryModal.classList.remove("is-open");
    galleryModal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
  };

  galleryImages.forEach((img) => {
    img.addEventListener("click", () => openGalleryModal(img));
  });

  if (galleryModal) {
    galleryModal.addEventListener("click", (event) => {
      if (event.target === galleryModal) closeGalleryModal();
    });
  }

  if (galleryModalClose) {
    galleryModalClose.addEventListener("click", closeGalleryModal);
  }

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && galleryModal?.classList.contains("is-open")) {
      closeGalleryModal();
    }
  });

  // ================= GSAP =================
  if (!(window.gsap && window.ScrollTrigger)) return;

  gsap.registerPlugin(ScrollTrigger);

  // HERO
  gsap.from(".hero-content h1", {
    opacity: 0,
    y: 30,
    duration: 0.8,
    ease: "power2.out",
  });

  gsap.from(".hero-content p", {
    opacity: 0,
    y: 20,
    duration: 0.8,
    delay: 0.15,
    ease: "power2.out",
  });

  gsap.from(".hero-content .btn", {
    opacity: 0,
    y: 20,
    duration: 0.7,
    delay: 0.3,
    stagger: 0.12,
    ease: "power2.out",
  });

  // ✅ Títulos (todas las secciones, PERO excluye Contacto)
  gsap.utils.toArray(".section-title").forEach((title) => {
    if (title.closest("#contacto")) return; // <-- clave para que no choque

    gsap.from(title, {
      scrollTrigger: {
        trigger: title,
        start: "top 85%",
        once: true,
      },
      opacity: 0,
      y: 20,
      duration: 0.6,
      ease: "power2.out",
    });
  });

  // Ofrecemos
  gsap.from("#ofrecemos .feature", {
    scrollTrigger: {
      trigger: "#ofrecemos",
      start: "top 70%",
      once: true,
    },
    opacity: 0,
    y: 25,
    stagger: 0.15,
    duration: 0.6,
    ease: "power2.out",
  });

  // Servicios
  gsap.utils.toArray(".service-row").forEach((row) => {
    gsap.from(row.children, {
      scrollTrigger: {
        trigger: row,
        start: "top 75%",
        once: true,
      },
      opacity: 0,
      x: (i) => (i % 2 === 0 ? -30 : 30),
      duration: 0.7,
      ease: "power2.out",
    });
  });

  // Galería
  gsap.from(".gallery-img", {
    scrollTrigger: {
      trigger: "#galeria",
      start: "top 75%",
      once: true,
    },
    opacity: 0,
    y: 20,
    stagger: 0.08,
    duration: 0.5,
    ease: "power2.out",
  });

  // ================= CONTACTO (timeline único) =================
  const contactTl = gsap.timeline({ paused: true });

  contactTl
    .from("#contacto .section-title", {
      opacity: 0,
      y: 24,
      duration: 0.6,
      ease: "power2.out",
    })
    .from(
      "#contacto .section-line",
      {
        opacity: 0,
        scaleX: 0,
        transformOrigin: "center",
        duration: 0.45,
        ease: "power2.out",
      },
      "-=0.25"
    )
    .from(
      "#contacto p",
      {
        opacity: 0,
        y: 16,
        duration: 0.5,
        ease: "power2.out",
      },
      "-=0.2"
    )
    .from(
      "#contacto .contact-cta",
      {
        opacity: 0,
        y: 14,
        scale: 0.92,
        duration: 0.55,
        ease: "back.out(1.6)",
      },
      "-=0.15"
    );

  ScrollTrigger.create({
    trigger: "#contacto",
    start: "top 80%", // si quieres que se note más, cambia a "top 95%"
    once: true,
    onEnter: () => contactTl.play(0),
  });

  // Para que ScrollTrigger calcule bien cuando cargan imágenes
  window.addEventListener("load", () => ScrollTrigger.refresh());
});
