// Actualizar año en footer
document.getElementById('year').textContent = new Date().getFullYear();

const ANNOUNCEMENT_STORAGE_KEY = 'announcementSettings';
const SUPABASE_URL = window.SUPABASE_URL || '';
const SUPABASE_ANON_KEY = window.SUPABASE_ANON_KEY || '';
const API_BASE = '/.netlify/functions';

function loadAnnouncementBar() {
  const bar = document.getElementById('announcementBar');
  const track = document.getElementById('announcementTrack');
  if (!bar || !track) return;

  let settings;
  try {
    settings = JSON.parse(localStorage.getItem(ANNOUNCEMENT_STORAGE_KEY) || '{}');
  } catch (error) {
    settings = {};
  }

  const text = typeof settings.text === 'string' ? settings.text.trim() : '';
  const isActive = settings.active === true;

  if (!isActive || !text) {
    bar.hidden = true;
    return;
  }

  const speedValue = Number(settings.speed);
  const duration = Number.isFinite(speedValue) && speedValue > 0 ? speedValue : 18;
  bar.style.setProperty('--ticker-duration', `${duration}s`);
  bar.hidden = false;

  const link = typeof settings.link === 'string' ? settings.link.trim() : '';
  track.innerHTML = '';

  const buildItem = (isClone = false) => {
    const element = link ? document.createElement('a') : document.createElement('span');
    element.className = link ? 'announcement-bar__link' : 'announcement-bar__text';
    element.textContent = text;
    if (link) {
      element.href = link;
    }
    if (isClone) {
      element.setAttribute('aria-hidden', 'true');
    }
    return element;
  };

  track.appendChild(buildItem(false));
  track.appendChild(buildItem(true));
}

loadAnnouncementBar();

function getSupabaseHeaders() {
  return {
    apikey: SUPABASE_ANON_KEY,
    Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    'Content-Type': 'application/json'
  };
}

async function fetchFromNetlify() {
  const response = await fetch(`${API_BASE}/products-list`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(errorBody || 'Error al cargar productos desde Netlify');
  }

  return response.json();
}

async function fetchFromSupabase() {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/products?select=*`, {
    method: 'GET',
    headers: getSupabaseHeaders()
  });

  if (!response.ok) {
    throw new Error('Error al cargar productos desde Supabase');
  }

  return response.json();
}

async function fetchCatalogProducts() {
  try {
    return await fetchFromNetlify();
  } catch (error) {
    console.warn('No se pudo cargar desde Netlify Functions, intentando Supabase...', error);
  }

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.warn('Supabase no está configurado. Define SUPABASE_URL y SUPABASE_ANON_KEY en el frontend.');
    return [];
  }

  try {
    return await fetchFromSupabase();
  } catch (error) {
    console.error(error);
    return [];
  }
}

// Cargar productos del catálogo
async function loadCatalogProducts() {
  const products = await fetchCatalogProducts();
  const grid = document.querySelector('.catalog-grid');

  if (!grid) return; // Si no está en press-on.html, salir

  grid.innerHTML = ''; // Limpiar grid

  if (products.length === 0) {
    grid.innerHTML = '<div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: #999;">No hay productos disponibles</div>';
    return;
  }

  renderProducts(products);
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
document.addEventListener('DOMContentLoaded', async () => {
  await loadCatalogProducts();
  updateCatalogStatus();
});

// También cargar inmediatamente por si el script va al final
loadCatalogProducts().then(updateCatalogStatus);

