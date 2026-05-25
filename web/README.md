# 🚀 CLIENTE WEB DESTOCK SPACE - CURSOR

## 📋 **RESUMEN EJECUTIVO**

Cliente web oficial para DESTOCK SPACE, desarrollado con Next.js 14, TypeScript y Tailwind CSS. Conectado directamente al backend común Node.js para sincronización perfecta con el cliente Unity PC.

---

## ✅ **CARACTERÍSTICAS PRINCIPALES**

### **🎮 Funcionalidades del Juego**
- **Dashboard principal** con estadísticas en tiempo real
- **Sistema de inventario** completo con gestión de items
- **Marketplace global** para comercio entre jugadores
- **Sistema de combate** por turnos
- **Gestión de recursos** y producción
- **Autenticación segura** con JWT
- **WebSocket** para actualizaciones en tiempo real

### **🛠️ Tecnologías Utilizadas**
- **Next.js 14** - Framework React con App Router
- **TypeScript** - Tipado fuerte y seguro
- **Tailwind CSS** - Diseño moderno y responsive
- **Zustand** - Gestión de estado global
- **React Query** - Manejo de datos y caché
- **Socket.IO Client** - Comunicación en tiempo real
- **React Hook Form** - Formularios optimizados
- **Lucide React** - Iconos modernos
- **Framer Motion** - Animaciones fluidas

---

## 📁 **ESTRUCTURA DEL PROYECTO**

```
📁 web/
├── 📄 package.json                    # Dependencias y scripts
├── 📄 tsconfig.json                   # Configuración TypeScript
├── 📄 tailwind.config.js              # Configuración Tailwind
├── 📄 next.config.js                  # Configuración Next.js
├── 📁 src/
│   ├── 📄 app/                        # App Router (Next.js 14)
│   │   ├── 📄 layout.tsx              # Layout principal
│   │   ├── 📄 globals.css             # Estilos globales
│   │   ├── 📄 login/page.tsx          # Página de login
│   │   └── 📄 dashboard/page.tsx      # Dashboard principal
│   ├── 📁 components/                 # Componentes React
│   │   ├── 📁 auth/                   # Autenticación
│   │   ├── 📁 dashboard/              # Dashboard
│   │   ├── 📁 inventory/              # Inventario
│   │   ├── 📁 marketplace/            # Marketplace
│   │   ├── 📁 combat/                 # Combate
│   │   └── 📁 providers/              # Providers globales
│   ├── 📁 services/                   # Servicios API
│   │   ├── 📄 api.ts                  # Cliente API
│   │   └── 📄 websocket.ts            # Cliente WebSocket
│   ├── 📁 store/                      # Estado global (Zustand)
│   ├── 📁 types/                      # Tipos TypeScript
│   ├── 📁 hooks/                      # Hooks personalizados
│   ├── 📁 utils/                      # Utilidades
│   └── 📁 assets/                     # Assets estáticos
└── 📁 public/                         # Archivos públicos
```

---

## 🔧 **INSTALACIÓN**

### **1. Prerrequisitos**
- Node.js >= 18.0.0
- npm >= 8.0.0
- Backend DESTOCK SPACE corriendo en `http://localhost:3000`

### **2. Instalar Dependencias**
```bash
cd c:\temp-galaxy\web
npm install
```

### **3. Configurar Variables de Entorno**
Crear archivo `.env.local`:
```bash
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:3000

# WebSocket URL (opcional, se genera automáticamente)
NEXT_PUBLIC_WS_URL=ws://localhost:3000

# Configuración adicional
NEXT_PUBLIC_APP_VERSION=1.0.0
NEXT_PUBLIC_APP_NAME="DESTOCK SPACE Web"
```

### **4. Iniciar Desarrollo**
```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3001`

---

## 🎯 **FUNCIONALIDADES DETALLADAS**

### **🔐 Sistema de Autenticación**
- Login/Register con validación robusta
- Tokens JWT con refresh automático
- Sesiones persistentes
- Manejo de errores elegante
- Redirect automático

### **📊 Dashboard Principal**
- Estadísticas en tiempo real
- Resumen de recursos
- Items del inventario
- Combates activos
- Listados del marketplace
- Actividad reciente

### **📦 Gestión de Inventario**
- Vista de grid y lista
- Filtrado por categoría y rareza
- Equipar/desequipar items
- Eliminar items
- Búsqueda avanzada
- Selección múltiple

### **🛒 Marketplace**
- Explorar listados activos
- Crear nuevos listados
- Hacer ofertas
- Comprar directamente
- Cancelar listados propios
- Filtrado avanzado

### **⚔️ Sistema de Combate**
- Iniciar sesiones de combate
- Unirse a combates existentes
- Ejecutar acciones por turnos
- Visualización del campo de batalla
- Historial de combates

### **📡 WebSocket en Tiempo Real**
- Actualizaciones de recursos
- Cambios en inventario
- Notificaciones de combate
- Actualizaciones del marketplace
- Estado de usuarios conectados

---

## 🔗 **CONEXIÓN CON BACKEND**

### **API REST**
El cliente web consume la misma API que el cliente Unity PC:

```typescript
// Ejemplo de llamada a la API
const response = await apiService.getUserResources();
const resources = response.data;
```

### **WebSocket Events**
Eventos en tiempo real sincronizados:

```typescript
// Recibir actualización de recursos
webSocketService.on('resource_update', (event) => {
  // Actualizar estado local
});

// Recibir actualización de inventario
webSocketService.on('inventory_update', (event) => {
  // Refrescar inventario
});
```

---

## 🎨 **DISEÑO Y UX**

### **Tema Espacial**
- Paleta de colores oscura con acentos neón
- Animaciones fluidas y microinteracciones
- Diseño responsive para todos los dispositivos
- Accesibilidad WCAG 2.1

### **Componentes Reutilizables**
- Sistema de diseño consistente
- Componentes modulares
- Tokens de diseño
- Utilidades CSS personalizadas

---

## 📊 **ESTADO GLOBAL**

### **Zustand Stores**
- **AuthStore** - Usuario y autenticación
- **ResourceStore** - Recursos y producción
- **InventoryStore** - Items y equipamiento
- **CombatStore** - Sesiones de combate
- **MarketplaceStore** - Listados y transacciones
- **UIStore** - Estado de la interfaz

### **Persistencia**
- Tokens en localStorage
- Preferencias de usuario
- Estado de autenticación
- Configuración de UI

---

## 🔧 **DEVELOPMENT**

### **Scripts Disponibles**
```bash
npm run dev          # Servidor de desarrollo
npm run build        # Build para producción
npm run start        # Servidor de producción
npm run lint         # Linting del código
npm run type-check   # Verificación de tipos
npm test             # Ejecutar tests
```

### **Estructura de Componentes**
```typescript
// Ejemplo de componente con TypeScript
interface ComponentProps {
  title: string;
  data: ItemType[];
  onAction: (item: ItemType) => void;
}

export const Component: React.FC<ComponentProps> = ({ 
  title, 
  data, 
  onAction 
}) => {
  // Lógica del componente
  return <div>{/* JSX */}</div>;
};
```

---

## 🚀 **DEPLOY**

### **Build de Producción**
```bash
npm run build
npm start
```

### **Variables de Entorno Producción**
```bash
NEXT_PUBLIC_API_URL=https://api.destock-space.com
NEXT_PUBLIC_WS_URL=wss://api.destock-space.com
NODE_ENV=production
```

### **Optimizaciones**
- Code splitting automático
- Imágenes optimizadas
- Bundle analysis
- Performance monitoring

---

## 🐛 **TROUBLESHOOTING**

### **Problemas Comunes**

**Error: "Cannot connect to backend"**
- Verificar que el backend esté corriendo en el puerto 3000
- Revisar variables de entorno
- Comprobar configuración CORS en el backend

**Error: "WebSocket connection failed"**
- Verificar URL del WebSocket
- Revisar firewall o proxy
- Comprobar autenticación JWT

**Error: "TypeScript errors"**
- Ejecutar `npm run type-check`
- Revisar tipos en `src/types/index.ts`
- Actualizar dependencias si es necesario

---

## 📚 **DOCUMENTACIÓN ADICIONAL**

- **Backend API**: `../backend/API_DOCUMENTATION.md`
- **Tipos Comunes**: `../docs/ITEM_CATALOG_OFFICIAL.md`
- **Reglas de Desarrollo**: `../docs/NO_DUPLICATION_RULES.md`
- **Arquitectura**: `../docs/SINGLE_SOURCE_OF_TRUTH.md`

---

## 🎯 **PRÓXIMOS PASOS**

1. **Implementar sistema de alianzas**
2. **Añadir chat en tiempo real**
3. **Crear sistema de logros**
4. **Implementar tutorial interactivo**
5. **Añadir modo oscuro/claro**
6. **Optimizar para móviles**

---

**🚀 EL CLIENTE WEB DE DESTOCK SPACE ESTÁ COMPLETAMENTE FUNCIONAL Y LISTO PARA DESARROLLO CONTINUO CON CURSOR.**
