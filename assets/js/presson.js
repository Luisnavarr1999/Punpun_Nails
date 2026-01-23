// Actualizar año en footer
document.getElementById('year').textContent = new Date().getFullYear();

// Key para almacenar datos en localStorage
const STORAGE_KEY = 'pressOnProducts';

// Obtener productos del localStorage
function getProductsFromStorage() {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

// Cargar productos del catálogo
function loadCatalogProducts() {
  const products = getProductsFromStorage();
  const grid = document.querySelector('.catalog-grid');

  if (!grid) return; // Si no está en press-on.html, salir

  grid.innerHTML = ''; // Limpiar grid

  // Si no hay productos en localStorage, usar productos por defecto
  if (products.length === 0) {
    const defaultProducts = [
      {
        id: '1',
        name: 'Press On Clásico',
        description: 'Set elegante con diseño clásico y acabado brillante. Duración: 2-3 semanas.',
        price: '$25.000',
        image: 'assets/img/press_on/press_on1.png',
        available: true
      },
      {
        id: '2',
        name: 'Press On Floral',
        description: 'Set con diseño floral delicado. Perfecto para ocasiones especiales. Duración: 2-3 semanas.',
        price: '$25.000',
        image: 'assets/img/press_on/press_on2.png',
        available: true
      },
      {
        id: '3',
        name: 'Press On Nude',
        description: 'Set neutro versátil para cualquier ocasión. Acabado mate y brillante. Duración: 2-3 semanas.',
        price: '$25.000',
        image: 'assets/img/press_on/press_on3.png',
        available: true
      },
      {
        id: '4',
        name: 'Press On Glam',
        description: 'Set premium con brillos y diseño elegante. Para las que quieren llamar la atención. Duración: 2-3 semanas.',
        price: '$25.000',
        image: 'assets/img/press_on/press_on4.png',
        available: true
      }
    ];

    renderProducts(defaultProducts);
  } else {
    renderProducts(products);
  }
}

// Renderizar productos en el grid
function renderProducts(products) {
  const grid = document.querySelector('.catalog-grid');

  products.forEach(product => {
    const isAvailable = product.available === true || product.available === 'true';
    const item = document.createElement('div');
    item.className = 'catalog-item catalog-item-clickable';
    item.dataset.productId = product.id;
    item.dataset.productName = product.name;
    item.dataset.productDescription = product.description;
    item.dataset.productPrice = product.price;
    item.dataset.productImage = product.image;
    item.dataset.available = isAvailable;

    const statusText = isAvailable ? 'Disponible' : 'Agotado';
    const statusIcon = isAvailable ? 'check-circle-fill' : 'x-circle-fill';

    item.innerHTML = `
      <img src="${product.image}" alt="${product.name}" loading="lazy" decoding="async">
      <div class="catalog-item-info">
        <span class="catalog-status available-status ${!isAvailable ? 'agotado' : ''}">
          <i class="bi bi-${statusIcon}"></i>${statusText}
        </span>
        <span class="catalog-price">${product.price}</span>
      </div>
    `;

    grid.appendChild(item);
  });

  // Después de renderizar, agregar event listeners a los items
  setupCatalogEventListeners();
}

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

// Configurar event listeners para el modal
function setupCatalogEventListeners() {
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
      const productId = item.dataset.productId;
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
        
        // Mensaje simple con ID único para identificar el producto
        const whatsappMessage = encodeURIComponent(
          `Hola quiero el press on: ${productName} (Ref: 🔢 ${productId})`
        );
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
}

// Cargar productos cuando el DOM está listo
document.addEventListener('DOMContentLoaded', () => {
  loadCatalogProducts();
  updateCatalogStatus();
});

// También cargar inmediatamente por si el script va al final
loadCatalogProducts();
updateCatalogStatus();

