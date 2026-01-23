const API_BASE = '/.netlify/functions';
const ANNOUNCEMENT_STORAGE_KEY = 'announcementSettings';
const ANNOUNCEMENT_API_GET = `${API_BASE}/announcement-get`;
const ANNOUNCEMENT_API_UPDATE = `${API_BASE}/announcement-update`;
let editingProductId = null;

// ==================== INICIALIZACIÓN ====================
document.addEventListener('DOMContentLoaded', () => {
  // Verificar si está logueado
  if (localStorage.getItem('adminSession') !== 'true') {
    window.location.href = 'admin.html';
    return;
  }

  // Cargar productos
  loadProducts();

  loadAnnouncementSettings();

  // Event listeners - con delay para asegurar que el DOM esté listo
  setTimeout(() => {
    setupEventListeners();
  }, 100);

  // Handler para upload de imágenes
  const imageInput = document.getElementById('productImage');
  if (imageInput) {
    imageInput.addEventListener('change', handleImageUpload);
  }

  // Handler para formatear precio (agregar $)
  const priceInput = document.getElementById('productPrice');
  if (priceInput) {
    priceInput.addEventListener('input', formatPrice);
    priceInput.addEventListener('blur', ensurePriceFormat);
  }

  // Handler para formatear precio en modal de edición
  const editPriceInput = document.getElementById('editProductPrice');
  if (editPriceInput) {
    editPriceInput.addEventListener('input', formatPrice);
    editPriceInput.addEventListener('blur', ensurePriceFormat);
  }
});

// ==================== EVENT LISTENERS ====================
function setupEventListeners() {
  // Tabs
  document.querySelectorAll('.menu-item').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const tab = btn.dataset.tab;
      switchTab(tab);
    });
  });

  // Logout
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', logout);
  }

  // Agregar producto
  const addForm = document.getElementById('addProductForm');
  if (addForm) {
    addForm.addEventListener('submit', addProduct);
  }

  // Cambiar contraseña
  const passwordForm = document.getElementById('passwordForm');
  if (passwordForm) {
    passwordForm.addEventListener('submit', changePassword);
  }

  const announcementForm = document.getElementById('announcementForm');
  if (announcementForm) {
    announcementForm.addEventListener('submit', saveAnnouncementSettings);
  }

  const announcementInputs = [
    document.getElementById('announcementActive'),
    document.getElementById('announcementText'),
    document.getElementById('announcementSpeed'),
    document.getElementById('announcementLink')
  ];
  announcementInputs.forEach(input => {
    if (input) {
      input.addEventListener('input', updateAnnouncementPreviewFromForm);
      input.addEventListener('change', updateAnnouncementPreviewFromForm);
    }
  });

  // Editar producto
  const editForm = document.getElementById('editProductForm');
  if (editForm) {
    editForm.addEventListener('submit', saveProductChanges);
  }

  // Handler para imagen en modal de edición
  const editImageInput = document.getElementById('editProductImage');
  if (editImageInput) {
    editImageInput.removeEventListener('change', handleEditImageUpload);
    editImageInput.addEventListener('change', handleEditImageUpload);
  }

  // Búsqueda de productos
  const searchInput = document.getElementById('searchProducts');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      filterProducts(e.target.value);
    });
  }

  // Preview en tiempo real - DESACTIVADO TEMPORALMENTE
  // const inputs = ['productName', 'productDescription', 'productPrice', 'productImage', 'productAvailable'];
  // inputs.forEach(id => {
  //   const el = document.getElementById(id);
  //   if (el) {
  //     el.removeEventListener('input', updatePreview);
  //     el.removeEventListener('change', updatePreview);
  //     el.addEventListener('input', updatePreview);
  //     el.addEventListener('change', updatePreview);
  //   }
  // });

  // Preview de imagen - DESACTIVADO TEMPORALMENTE
  // const imageInput = document.getElementById('productImage');
  // if (imageInput) {
  //   imageInput.removeEventListener('change', updatePreview);
  //   imageInput.addEventListener('change', updatePreview);
  // }
}

// ==================== NAVEGACIÓN ====================
function switchTab(tabName) {
  // Ocultar todos los tabs
  document.querySelectorAll('.tab-content').forEach(tab => {
    tab.classList.remove('active');
  });

  // Ocultar todos los menu items
  document.querySelectorAll('.menu-item').forEach(btn => {
    btn.classList.remove('active');
  });

  // Mostrar el tab seleccionado
  const tabElement = document.getElementById(tabName + '-tab');
  if (tabElement) {
    tabElement.classList.add('active');
  }

  const menuBtn = document.querySelector(`[data-tab="${tabName}"]`);
  if (menuBtn) {
    menuBtn.classList.add('active');
  }

  // Limpiar formulario si volvemos a agregar
  if (tabName === 'add') {
    const form = document.getElementById('addProductForm');
    if (form) {
      form.reset();
    }
    // const preview = document.getElementById('preview');
    // if (preview) {
    //   preview.innerHTML = '<div class="preview-placeholder">Sin imagen</div>';
    // }
    
    // Re-configurar event listeners para el formulario
    setTimeout(() => {
      setupEventListeners();
    }, 100);
  }
}

// ==================== ANNOUNCEMENT BAR ====================
function loadAnnouncementSettings() {
  const activeInput = document.getElementById('announcementActive');
  const textInput = document.getElementById('announcementText');
  const speedInput = document.getElementById('announcementSpeed');
  const linkInput = document.getElementById('announcementLink');

  if (!activeInput || !textInput || !speedInput || !linkInput) return;

  fetchAnnouncementSettings()
    .then(settings => {
      if (!settings) return;
      activeInput.value = settings.active === false ? 'false' : 'true';
      textInput.value = typeof settings.text === 'string' ? settings.text : '';
      speedInput.value = settings.speed ? settings.speed : '';
      linkInput.value = typeof settings.link === 'string' ? settings.link : '';
      updateAnnouncementPreviewFromForm();
    })
    .catch(() => {
      updateAnnouncementPreviewFromForm();
    });
}

async function fetchAnnouncementSettings() {
  try {
    const response = await fetch(ANNOUNCEMENT_API_GET, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    if (response.ok) {
      const data = await response.json();
      if (data && typeof data === 'object' && Object.keys(data).length) {
        localStorage.setItem(ANNOUNCEMENT_STORAGE_KEY, JSON.stringify(data));
        return data;
      }
    }
  } catch (error) {
    console.warn('No se pudo cargar el News Ticker desde la API.', error);
  }

  let settings;
  try {
    settings = JSON.parse(localStorage.getItem(ANNOUNCEMENT_STORAGE_KEY) || '{}');
  } catch (error) {
    settings = {};
  }

  return settings;
}

function getAnnouncementFormSettings() {

  const activeInput = document.getElementById('announcementActive');
  const textInput = document.getElementById('announcementText');
  const speedInput = document.getElementById('announcementSpeed');
  const linkInput = document.getElementById('announcementLink');

  if (!activeInput || !textInput || !speedInput || !linkInput) return;

  const speedValue = speedInput.value ? Number(speedInput.value) : '';

  return {
    active: activeInput.value === 'true',
    text: textInput.value.trim(),
    speed: Number.isFinite(speedValue) && speedValue > 0 ? speedValue : '',
    link: linkInput.value.trim()
  };
}

function updateAnnouncementPreviewFromForm() {
  const settings = getAnnouncementFormSettings();
  if (!settings) return;
  renderAnnouncementPreview(settings);
}

function renderAnnouncementPreview(settings) {
  const previewBar = document.getElementById('announcementPreview');
  const previewTrack = document.getElementById('announcementPreviewTrack');
  const previewStatus = document.getElementById('announcementPreviewStatus');
  const previewHint = document.getElementById('announcementPreviewHint');

  if (!previewBar || !previewTrack || !previewStatus || !previewHint) return;

  const text = typeof settings.text === 'string' ? settings.text.trim() : '';
  const isActive = settings.active === true;
  const link = typeof settings.link === 'string' ? settings.link.trim() : '';
  const speedValue = Number(settings.speed);
  const duration = Number.isFinite(speedValue) && speedValue > 0 ? speedValue : 18;

  previewStatus.textContent = isActive ? 'Activa' : 'Inactiva';
  previewStatus.classList.toggle('is-inactive', !isActive);

  previewTrack.innerHTML = '';

  if (!isActive || !text) {
    previewBar.hidden = true;
    previewHint.textContent = 'El ticker está inactivo o sin texto.';
    return;
  }

  previewBar.hidden = false;
  previewBar.style.setProperty('--ticker-duration', `${duration}s`);

  const buildItem = (isClone = false) => {
    const element = link ? document.createElement('a') : document.createElement('span');
    element.className = link ? 'announcement-bar__link' : 'announcement-bar__text';
    element.textContent = text;
    if (link) {
      element.href = link;
      element.target = '_blank';
      element.rel = 'noopener noreferrer';
    }
    if (isClone) {
      element.setAttribute('aria-hidden', 'true');
    }
    return element;
  };

  previewTrack.appendChild(buildItem(false));
  previewTrack.appendChild(buildItem(true));
  previewHint.textContent = link ? 'El enlace se abrirá en una pestaña nueva.' : 'Sin link configurado.';
}

async function saveAnnouncementSettings(event) {
  event.preventDefault();

  const settings = getAnnouncementFormSettings();
  if (!settings) return;

  try {
    const response = await fetch(ANNOUNCEMENT_API_UPDATE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings)
    });

    if (!response.ok) {
      throw new Error(await response.text());
    }

    localStorage.setItem(ANNOUNCEMENT_STORAGE_KEY, JSON.stringify(settings));
    showNotification('✅ News Ticker actualizado correctamente');
  } catch (error) {
    console.error('No se pudo guardar el News Ticker', error);
    localStorage.setItem(ANNOUNCEMENT_STORAGE_KEY, JSON.stringify(settings));
    showNotification('⚠️ Guardado local, pero no se pudo sincronizar con el servidor', 'error');
  }
}



// ==================== PRODUCTOS ====================
async function loadProducts() {
  const products = await getProducts();
  const grid = document.getElementById('productsGrid');
  const emptyState = document.getElementById('emptyState');
  const count = document.getElementById('productCount');

  count.textContent = products.length;

  if (products.length === 0) {
    grid.style.display = 'none';
    emptyState.style.display = 'block';
    return;
  }

  grid.style.display = 'grid';
  emptyState.style.display = 'none';
  grid.innerHTML = '';

  products.forEach(product => {
    const card = createProductCard(product);
    grid.appendChild(card);
  });
}

// Filtrar productos por búsqueda
async function filterProducts(searchTerm) {
  const products = await getProducts();
  const grid = document.getElementById('productsGrid');
  const searchLower = searchTerm.toLowerCase().trim();

  // Si el búsqueda está vacía, mostrar todos
  if (!searchLower) {
    loadProducts();
    return;
  }

  // Filtrar por nombre o ID
  const filtered = products.filter(product => 
    product.name.toLowerCase().includes(searchLower) || 
    product.id.toString().includes(searchLower)
  );

  // Renderizar productos filtrados
  grid.innerHTML = '';
  if (filtered.length === 0) {
    grid.innerHTML = '<div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: #999;">No se encontraron productos</div>';
  } else {
    filtered.forEach(product => {
      const card = createProductCard(product);
      grid.appendChild(card);
    });
  }
}

function createProductCard(product) {
  const card = document.createElement('div');
  card.className = 'product-card';
  
  const available = product.available === true || product.available === 'true';
  const statusClass = available ? 'available' : 'unavailable';
  const statusText = available ? 'Disponible' : 'Agotado';

  card.innerHTML = `
    <div class="product-image">
      ${product.image ? `<img src="${product.image}" alt="${product.name}" onerror="this.style.display='none'">` : ''}
      <div class="product-image-placeholder" style="display: ${product.image ? 'none' : 'flex'}">📷</div>
    </div>
    <div class="product-info">
      <h5 class="product-name">${product.name}</h5>
      <div class="product-id" style="font-size: 0.85rem; color: #999; margin: 5px 0;">🔢 Ref: ${product.id}</div>
      <div class="product-price">${product.price}</div>
      <div class="product-status ${statusClass}">${statusText}</div>
      <div class="product-actions">
        <button class="btn-edit" onclick="editProduct('${product.id}')">
          <i class="bi bi-pencil"></i> Editar
        </button>
        <button class="btn-delete" onclick="deleteProduct('${product.id}')">
          <i class="bi bi-trash"></i> Eliminar
        </button>
      </div>
    </div>
  `;

  return card;
}

async function addProduct(e) {
  e.preventDefault();

  const name = document.getElementById('productName').value.trim();
  const description = document.getElementById('productDescription').value.trim();
  const price = document.getElementById('productPrice').value.trim();
  const image = window.uploadedImageData || '';

  // Validar campos requeridos
  if (!name || !description || !price || !image) {
    showNotification('❌ Completa todos los campos requeridos (incluida la imagen)', 'error');
    return;
  }

  const newProduct = {
    name: name,
    description: description,
    price: price,
    image: image, // Guardará el base64 completo
    available: document.getElementById('productAvailable').value === 'true'
  };

  const created = await createProduct(newProduct);
  if (!created) {
    showNotification('❌ No se pudo crear el producto', 'error');
    return;
  }

  await loadProducts();

  // Mostrar confirmación
  showNotification('✅ Producto agregado correctamente');

  // Limpiar
  document.getElementById('addProductForm').reset();
  window.uploadedImageData = null;
  document.getElementById('imagePreview').style.display = 'none';
  
  // Volver a productos
  switchTab('products');
}

async function editProduct(id) {
  editingProductId = id;
  const products = await getProducts();
  const product = products.find(p => p.id === id);

  if (!product) return;

  document.getElementById('editProductName').value = product.name;
  document.getElementById('editProductDescription').value = product.description;
  document.getElementById('editProductPrice').value = product.price;
  document.getElementById('editProductAvailable').value = product.available ? 'true' : 'false';

  // Mostrar imagen actual
  if (product.image) {
    const editPreview = document.getElementById('editImagePreview');
    const editPreviewImg = document.getElementById('editPreviewImage');
    
    if (editPreview && editPreviewImg) {
      editPreviewImg.src = product.image;
      editPreview.style.display = 'block';
    }
  }

  // Guardar imagen actual como fallback
  window.editImageData = product.image;

  document.getElementById('editModal').classList.add('show');
}

function closeEditModal() {
  document.getElementById('editModal').classList.remove('show');
  editingProductId = null;
}

async function saveProductChanges(e) {
  e.preventDefault();

  if (!editingProductId) return;

  const payload = {
    name: document.getElementById('editProductName').value,
    description: document.getElementById('editProductDescription').value,
    price: document.getElementById('editProductPrice').value,
    available: document.getElementById('editProductAvailable').value === 'true'
  };
  
  // Usar la imagen cargada o mantener la actual
  if (window.editImageData) {
    payload.image = window.editImageData;
  }

  const updated = await updateProduct(editingProductId, payload);
  if (!updated) {
    showNotification('❌ No se pudo actualizar el producto', 'error');
    return;
  }

  await loadProducts();

  showNotification('✅ Producto actualizado correctamente');
  closeEditModal();
}

async function deleteProduct(id) {
  if (!confirm('¿Estás seguro que quieres eliminar este producto?')) {
    return;
  }

  const deleted = await deleteProductById(id);
  if (!deleted) {
    showNotification('❌ No se pudo eliminar el producto', 'error');
    return;
  }
  await loadProducts();

  showNotification('✅ Producto eliminado');
}

async function clearAllProducts() {
  if (!confirm('⚠️ ¿Eliminar TODOS los productos? Esta acción NO se puede deshacer.')) {
    return;
  }

  if (!confirm('¿Estás completamente seguro?')) {
    return;
  }

  const products = await getProducts();
  await Promise.all(products.map(product => deleteProductById(product.id)));
  await loadProducts();
  showNotification('✅ Todos los productos fueron eliminados');
}

// ==================== FORMATEO DE PRECIOS ====================
function formatPrice(e) {
  let value = e.target.value;
  
  // Remover "$" si ya existe
  value = value.replace(/\$/g, '');
  
  // Solo mantener números y puntos
  value = value.replace(/[^\d.]/g, '');
  
  // Actualizar valor sin $
  e.target.value = value;
}

function ensurePriceFormat(e) {
  let value = e.target.value.trim();
  
  if (value && !value.startsWith('$')) {
    e.target.value = '$' + value;
  } else if (!value) {
    e.target.value = '';
  }
}

// ==================== MANEJO DE IMÁGENES ====================
function handleImageUpload(e) {
  const file = e.target.files[0];
  
  if (!file) return;

  // Validar que sea imagen
  if (!file.type.startsWith('image/')) {
    showNotification('❌ Solo se permiten archivos de imagen', 'error');
    return;
  }

  // Validar tamaño (máx 5MB)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    showNotification('❌ La imagen no debe superar 5MB', 'error');
    return;
  }

  // Convertir a base64
  const reader = new FileReader();
  reader.onload = (event) => {
    const base64Image = event.target.result;
    
    // Mostrar preview
    const preview = document.getElementById('imagePreview');
    const previewImg = document.getElementById('previewImageUpload');
    
    if (preview && previewImg) {
      previewImg.src = base64Image;
      preview.style.display = 'block';
    }

    // Guardar base64 en un atributo de datos temporales
    window.uploadedImageData = base64Image;
    
    showNotification('✅ Imagen cargada correctamente');
  };

  reader.onerror = () => {
    showNotification('❌ Error al cargar la imagen', 'error');
  };

  reader.readAsDataURL(file);
}

// ==================== MANEJO DE IMÁGENES EDIT ====================
document.addEventListener('DOMContentLoaded', () => {
  // Agregar handler para imagen en modal de edición
  setTimeout(() => {
    const editImageInput = document.getElementById('editProductImage');
    if (editImageInput && editImageInput.type === 'file') {
      editImageInput.addEventListener('change', handleEditImageUpload);
    }
  }, 100);
});

function handleEditImageUpload(e) {
  const file = e.target.files[0];
  
  if (!file) return;

  // Validar que sea imagen
  if (!file.type.startsWith('image/')) {
    showNotification('❌ Solo se permiten archivos de imagen', 'error');
    return;
  }

  // Validar tamaño (máx 5MB)
  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    showNotification('❌ La imagen no debe superar 5MB', 'error');
    return;
  }

  // Convertir a base64
  const reader = new FileReader();
  reader.onload = (event) => {
    const base64Image = event.target.result;
    window.editImageData = base64Image;
    showNotification('✅ Imagen cargada correctamente');
  };

  reader.onerror = () => {
    showNotification('❌ Error al cargar la imagen', 'error');
  };

  reader.readAsDataURL(file);
}
function getApiHeaders() {
  return {
    'Content-Type': 'application/json'
  };
}

async function getProducts() {
  try {
    const response = await fetch(`${API_BASE}/products-list`, {
      method: 'GET',
      headers: getApiHeaders()
    });

    if (!response.ok) {
      throw new Error('Error al cargar productos');
    }

    return await response.json();
  } catch (error) {
    console.error(error);
    showNotification('❌ No se pudieron cargar los productos', 'error');
    return [];
  }
}

async function createProduct(product) {
  try {
    const response = await fetch(`${API_BASE}/products-create`, {
      method: 'POST',
      headers: getApiHeaders(),
      body: JSON.stringify(product)
    });

    if (!response.ok) {
      throw new Error('Error al crear producto');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error);
    return null;
  }
}

async function updateProduct(id, updates) {
  try {
    const response = await fetch(`${API_BASE}/products-update?id=${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: getApiHeaders(),
      body: JSON.stringify(updates)
    });

    if (!response.ok) {
      throw new Error('Error al actualizar producto');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error);
    return null;
  }
}

async function deleteProductById(id) {
  try {
    const response = await fetch(`${API_BASE}/products-delete?id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: getApiHeaders()
    });

    if (!response.ok) {
      throw new Error('Error al eliminar producto');
    }

    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
}

function updatePreview() {
  try {
    const preview = document.getElementById('preview');
    if (!preview) return;

    const name = document.getElementById('productName')?.value || 'Nombre';
    const desc = document.getElementById('productDescription')?.value || 'Descripción';
    const price = document.getElementById('productPrice')?.value || '$0';
    const image = document.getElementById('productImage')?.value;
    const available = document.getElementById('productAvailable')?.value === 'true';

    const previewHTML = `
      <div class="preview-image">
        ${image ? `<img src="${image}" alt="Preview" onerror="this.style.display='none'">` : ''}
        <div class="preview-placeholder" style="display: ${image ? 'none' : 'flex'}">📷</div>
      </div>
      <div class="preview-info">
        <h5>${name}</h5>
        <p>${desc.substring(0, 80)}${desc.length > 80 ? '...' : ''}</p>
        <div class="preview-bottom">
          <span>${price}</span>
          <span class="badge">${available ? 'Disponible' : 'Agotado'}</span>
        </div>
      </div>
    `;

    preview.innerHTML = previewHTML;
  } catch (error) {
    console.error('Error en updatePreview:', error);
  }
}

function logout() {
  localStorage.removeItem('adminSession');
  localStorage.removeItem('loginTime');
  window.location.href = 'admin.html';
}

function changePassword(e) {
  e.preventDefault();

  const newPassword = document.getElementById('newPassword').value;

  if (!newPassword || newPassword.length < 4) {
    showNotification('❌ La contraseña debe tener al menos 4 caracteres', 'error');
    return;
  }

  // Guardar la nueva contraseña en localStorage (se valida en admin.html)
  localStorage.setItem('adminPassword', newPassword);
  showNotification('✅ Contraseña actualizada correctamente');

  document.getElementById('passwordForm').reset();
}

function showNotification(message, type = 'success') {
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${type === 'error' ? '#f44336' : '#4caf50'};
    color: white;
    padding: 16px 24px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    z-index: 10000;
    font-weight: 600;
    animation: slideIn 0.3s ease;
  `;
  notification.textContent = message;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// ==================== CERRAR MODAL ====================
window.addEventListener('click', (e) => {
  const modal = document.getElementById('editModal');
  if (e.target === modal) {
    closeEditModal();
  }
});
