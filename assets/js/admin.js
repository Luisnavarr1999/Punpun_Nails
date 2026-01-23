// Key para almacenar datos en localStorage
const STORAGE_KEY = 'pressOnProducts';
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


// ==================== PRODUCTOS ====================
function loadProducts() {
  const products = getProducts();
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
function filterProducts(searchTerm) {
  const products = getProducts();
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

function addProduct(e) {
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

  const products = getProducts();
  const newProduct = {
    id: Date.now().toString(),
    name: name,
    description: description,
    price: price,
    image: image, // Guardará el base64 completo
    available: document.getElementById('productAvailable').value === 'true'
  };

  products.push(newProduct);
  saveProducts(products);
  loadProducts();

  // Mostrar confirmación
  showNotification('✅ Producto agregado correctamente');

  // Limpiar
  document.getElementById('addProductForm').reset();
  window.uploadedImageData = null;
  document.getElementById('imagePreview').style.display = 'none';
  
  // Volver a productos
  switchTab('products');
}

function editProduct(id) {
  editingProductId = id;
  const products = getProducts();
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

function saveProductChanges(e) {
  e.preventDefault();

  if (!editingProductId) return;

  const products = getProducts();
  const product = products.find(p => p.id === editingProductId);

  if (!product) return;

  product.name = document.getElementById('editProductName').value;
  product.description = document.getElementById('editProductDescription').value;
  product.price = document.getElementById('editProductPrice').value;
  product.available = document.getElementById('editProductAvailable').value === 'true';
  
  // Usar la imagen cargada o mantener la actual
  if (window.editImageData) {
    product.image = window.editImageData;
  }

  saveProducts(products);
  loadProducts();

  showNotification('✅ Producto actualizado correctamente');
  closeEditModal();
}

function deleteProduct(id) {
  if (!confirm('¿Estás seguro que quieres eliminar este producto?')) {
    return;
  }

  let products = getProducts();
  products = products.filter(p => p.id !== id);
  saveProducts(products);
  loadProducts();

  showNotification('✅ Producto eliminado');
}

function clearAllProducts() {
  if (!confirm('⚠️ ¿Eliminar TODOS los productos? Esta acción NO se puede deshacer.')) {
    return;
  }

  if (!confirm('¿Estás completamente seguro?')) {
    return;
  }

  saveProducts([]);
  loadProducts();
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
function getProducts() {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

function saveProducts(products) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
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

// ==================== DATOS DE EJEMPLO ====================
// Cargar datos de ejemplo si no hay productos
window.addEventListener('load', () => {
  const products = getProducts();
  
  if (products.length === 0 && localStorage.getItem('firstLoad') !== 'done') {
    const exampleProducts = [
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

    saveProducts(exampleProducts);
    localStorage.setItem('firstLoad', 'done');
    loadProducts();
  }
});

// ==================== CERRAR MODAL ====================
window.addEventListener('click', (e) => {
  const modal = document.getElementById('editModal');
  if (e.target === modal) {
    closeEditModal();
  }
});
