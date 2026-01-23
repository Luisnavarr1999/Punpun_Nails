# 🔐 GUÍA DE ADMIN - PANEL DE GESTIÓN DE PRODUCTOS

## Acceso al Admin Panel

### Cómo ingresar:
1. Abre tu sitio web
2. Baja al footer (pie de página)
3. Haz clic en **"Panel Admin"** (el enlace pequeño y discreto)
4. Serás redirigido a: `admin.html`

### Contraseña por defecto:
```
admin123
```

⚠️ **IMPORTANTE**: Cambia la contraseña en las Settings después de tu primer acceso.

---

## Dashboard Principal

El panel tiene tres secciones:

### 📦 1. MIS PRODUCTOS
- Visualiza todos tus productos de Press On
- Ver nombre, precio y estado (Disponible/Agotado)
- Botones para:
  - **Editar**: Modifica los detalles del producto
  - **Eliminar**: Quita el producto del catálogo

### ➕ 2. AGREGAR PRODUCTO
Formulario completo para agregar nuevos Press On con:

**Campos obligatorios (*):**
- **Nombre**: Ej. "Press On Clásico"
- **Descripción**: Ej. "Set elegante con diseño clásico..."
- **Precio**: Ej. "$25.000"
- **Imagen**: URL de la imagen (Ej. `assets/img/press_on/press_on1.png`)

**Campo opcional:**
- **Estado**: Disponible o Agotado

**Vista Previa en tiempo real**: Verás cómo se ve el producto mientras escribes

### ⚙️ 3. CONFIGURACIÓN
- **Cambiar Contraseña**: Actualiza tu contraseña de acceso
- **Zona de Peligro**: Opción para eliminar todos los productos (¡usa con cuidado!)

---

## Cómo Agregar una Imagen

### Opción 1: Usar URL externa
Si tienes las imágenes en un servicio online (Imgur, CloudinaryMag, etc), copia la URL directa:
```
https://ejemplo.com/imagen.png
```

### Opción 2: Subir a tu servidor (Recomendado)
1. Crea una carpeta en: `assets/img/press_on/`
2. Sube tus imágenes PNG o JPG ahí
3. En el formulario, coloca: `assets/img/press_on/nombre-imagen.png`

**Ejemplo:**
```
assets/img/press_on/press_on_clasico.png
assets/img/press_on/press_on_floral.jpg
```

---

## Flujo de Trabajo Típico

### Agregar un nuevo Press On:
1. Haz clic en **"Agregar Producto"**
2. Completa los campos:
   - Nombre: "Press On Verano"
   - Descripción: "Set con colores frescos..."
   - Precio: "$28.000"
   - Imagen: `assets/img/press_on/verano.png`
   - Estado: Disponible
3. Verifica la vista previa
4. Haz clic en **"Agregar Producto"**
5. ¡Listo! El producto aparecerá en el catálogo

### Editar un producto existente:
1. En la sección **"Mis Productos"**, localiza el producto
2. Haz clic en **"Editar"**
3. Modifica los campos que necesites
4. Haz clic en **"Guardar Cambios"**

### Marcar como Agotado:
1. Edita el producto
2. Cambia el **"Estado"** a "Agotado"
3. Guarda los cambios
4. El producto mostrará un ícono rojo 🔴 y dirá "Agotado"

### Eliminar un producto:
1. En la sección **"Mis Productos"**, localiza el producto
2. Haz clic en **"Eliminar"**
3. Confirma la acción

---

## Datos Guardados

✅ **Todo se guarda automáticamente** en el navegador (localStorage)

- Los productos están almacenados localmente
- Los cambios se reflejan **inmediatamente** en el catálogo público
- No necesitas presionar un botón "Guardar" adicional

⚠️ **Importante:**
- Si borras el caché/cookies del navegador, perderás los datos
- Por eso es bueno hacer backups de tus productos
- Puedes exportar/importar productos manualmente si es necesario

---

## Seguridad

### Cambiar contraseña:
1. Ve a **"Configuración"**
2. Escribe tu nueva contraseña (mín. 4 caracteres)
3. Haz clic en **"Actualizar"**
4. La próxima vez que ingrese, deberá usar la nueva contraseña

### Cerrar Sesión:
- Haz clic en **"Cerrar Sesión"** en la esquina superior derecha
- Se cerrará tu sesión de admin
- Tendrás que volver a ingresar la contraseña para acceder

---

## Solución de Problemas

### 🔴 "Contraseña incorrecta"
- Verifica que escribas exactamente la contraseña
- Las contraseñas son sensibles a mayúsculas/minúsculas
- Si olvidaste la contraseña, contacta al desarrollador

### 📸 Imagen no aparece en el producto
- Verifica que la URL sea correcta
- Asegúrate que el archivo exista en esa ruta
- Intenta con una URL externa para probar

### 📦 Los productos no se guardan
- Verifica que localStorage esté habilitado en tu navegador
- Intenta en modo normal (no en modo incógnito)
- Limpia el caché y reinicia el navegador

### ⚡ Los productos no aparecen en el catálogo
- Espera unos segundos (puede necesitar refrescar)
- Presiona F5 o Ctrl+R para refrescar la página
- Abre el navegador en modo privado para probar

---

## Vista del Cliente vs Admin

### Página pública (`press-on.html`):
- Los clientes ven los productos que agregaste
- Pueden hacer clic para ver detalles
- Pueden contactarte por WhatsApp

### Panel Admin (`admin-dashboard.html`):
- Solo tú puedes acceder con contraseña
- Gestionar todos los productos
- Cambiar disponibilidad, precios, imágenes

---

## Próximas Mejoras Sugeridas

- Exportar/Importar productos en JSON
- Sincronizar datos en la nube (Supabase, Firebase)
- Sistema de stock más avanzado
- Historial de cambios
- Reportes de visitantes

---

## ¿Necesitas ayuda?

Si tienes dudas o problemas, contacta al desarrollador:
- 🔧 LU8: https://luisnavarr1999.github.io/Luisnavarr1999/

¡Feliz manejo de tu tienda! 🎉
