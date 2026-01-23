// Actualizar año en footer
document.getElementById('year').textContent = new Date().getFullYear();

// Función para actualizar estados del catálogo
function updateCatalogStatus() {
  const catalogItems = document.querySelectorAll('.catalog-item-clickable');
  catalogItems.forEach(item => {
    const statusSpan = item.querySelector('.available-status');
    const isAvailable = item.dataset.available === 'true';
    
    if (!isAvailable) {
      statusSpan.classList.add('agotado');
      statusSpan.innerHTML = '<i class="bi bi-x-circle-fill"></i>Agotado';
    } else {
      statusSpan.classList.remove('agotado');
      statusSpan.innerHTML = '<i class="bi bi-check-circle-fill"></i>Disponible';
    }
  });
}

// Actualizar estados al cargar
document.addEventListener('DOMContentLoaded', updateCatalogStatus);
// También ejecutar inmediatamente por si el script va al final
updateCatalogStatus();

// Modal de catálogo
const modal = document.getElementById('catalogModal');
const closeBtn = document.getElementById('closeModalBtn');
const catalogItems = document.querySelectorAll('.catalog-item-clickable');

// Abrir modal al hacer click en un cuadro
catalogItems.forEach(item => {
  item.addEventListener('click', () => {
    const productName = item.dataset.productName;
    const productDescription = item.dataset.productDescription;
    const productPrice = item.dataset.productPrice;
    const productImage = item.dataset.productImage;
    const isAvailable = item.dataset.available === 'true';

    // Llenar la modal con los datos del producto
    document.getElementById('modalTitle').textContent = productName;
    document.getElementById('modalDescription').textContent = productDescription;
    document.getElementById('modalPrice').textContent = productPrice;
    document.getElementById('modalImage').src = productImage;
    
    // Mostrar/ocultar estado de disponibilidad
    const statusElement = document.getElementById('modalStatus');
    const whatsappBtn = document.getElementById('whatsappBtn');
    
    if (isAvailable) {
      statusElement.innerHTML = '<i class="bi bi-check-circle-fill"></i><span>Disponible</span>';
      whatsappBtn.style.display = 'inline-flex';
      
      // Generar enlace de WhatsApp con el nombre del producto
      const whatsappMessage = encodeURIComponent(`Hola quiero el press on: ${productName}`);
      whatsappBtn.href = `https://wa.me/56931250501?text=${whatsappMessage}`;
    } else {
      statusElement.innerHTML = '<i class="bi bi-x-circle-fill" style="color: #f44336;"></i><span style="color: #f44336;">Agotado</span>';
      whatsappBtn.style.display = 'none';
    }

    // Abrir modal
    modal.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  });
});

// Cerrar modal
closeBtn.addEventListener('click', () => {
  modal.classList.remove('is-open');
  document.body.style.overflow = 'auto';
});

// Cerrar modal al hacer click fuera
modal.addEventListener('click', (e) => {
  if (e.target === modal) {
    modal.classList.remove('is-open');
    document.body.style.overflow = 'auto';
  }
});
