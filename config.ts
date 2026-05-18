/**
 * Configuración Global - Wine Sommelier Chatbot
 * Personaliza estos valores para adaptar el sommelier a tu empresa de vinos
 */

export const config = {
  // === INFORMACIÓN DE LA EMPRESA ===
  business: {
    name: "Tu Bodega de Vinos", // Nombre de tu empresa
    location: "Nicaragua", // Ubicación
    website: "https://ejemplo.com", // Sitio web
    instagram: "https://instagram.com/ejemplo", // Instagram u otra red social
  },

  // === CONFIGURACIÓN DEL SOMMELIER ===
  sommelier: {
    name: "GustaVino", // Nombre del sommelier (puede ser diferente)
    personality: "cordial, amable y servicial", // Personalidad del sommelier
    language: "es", // Idioma (es, en, fr, etc.)
  },

  // === COLORES Y BRANDING ===
  ui: {
    primary: "#1A2743", // Color principal (mensajes del usuario)
    secondary: "#EC761D", // Color secundario (respuestas IA)
    background: "#ffffff", // Fondo de la aplicación
    accent: "#ffeb3b", // Color de énfasis
  },

  // === IMÁGENES Y LOGOS ===
  images: {
    companyLogo: "/sommelier-logo.svg", // Logo de la empresa
    sommelierAvatar: "/gustavinoavatar.PNG", // Avatar del sommelier
    favicon: "/favicon.ico", // Favicon
  },

  // === METADATOS ===
  metadata: {
    title: "Wine Sommelier", // Título del sitio
    description: "Tu sommelier virtual personal", // Descripción
  },

  // === INTEGRACIÓN CON API ===
  api: {
    provider: "gemini", // "gemini" o "openai"
    model: "gemini-2.5-flash", // Modelo a usar
    apiKey: process.env.GEMINI_API_KEY, // API key desde .env
  },

  // === BASE DE DATOS DE VINOS ===
  wines: {
    csvUrl:
      "https://drive.google.com/uc?export=download&id=1Irr1Wtflo_UwkrixOR34WeR0VO0AJKK4", // URL de Google Drive con catálogo de vinos
    delimiter: ";", // Delimitador del CSV
    columns: {
      name: "Nombre producto",
      type: "Tipo de vino",
      country: "País",
      grapeType: "Tipo de Uva",
      price: "Precio",
      taste: "Gusto",
      pairing: "Maridaje",
      combinations: "Combinaciones con otros productos de tienda",
      stores: "Tiendas",
      image: "Imagen",
    },
  },

  // === SISTEMA DE CUPONES ===
  coupons: {
    enabled: true, // Habilitar/deshabilitar cupones
    filePath: "app/data/coupons.csv", // Ruta del archivo de cupones
    trigger: "{{SOLICITAR_CUPON}}", // Trigger para solicitar cupón
    lockTimeout: 5000, // Timeout para lock file (ms)
  },

  // === RESTRICCIONES ===
  restrictions: {
    minAge: 18, // Edad mínima para recomendar bebidas alcohólicas
    preventPregnant: true, // Rechazar embarazadas
  },

  // === PROMPTS Y TEXTOS ===
  prompts: {
    greeting: "Habla con nuestro sommelier", // Saludo en la UI
    placeholder: "Pídele una recomendación a nuestro sommelier", // Placeholder del input
    thinking: "está pensando...🧠🤔", // Mensaje mientras piensa
    error:
      "¡Ups! Nuestro sommelier ha tenido un problema, intenta en un momento.", // Mensaje de error
  },

  // === CONFIGURACIÓN DE DESARROLLO ===
  dev: {
    debug: false, // Habilitar logs de debug
    analyticsEnabled: true, // Habilitar Vercel Analytics
    speedInsightsEnabled: true, // Habilitar Vercel Speed Insights
  },
};

/**
 * NOTA: Para personalizar el projeto:
 * 1. Actualiza los valores en este archivo
 * 2. Proporciona tus propias imágenes (logo, avatar)
 * 3. Carga tu CSV de vinos en Google Drive
 * 4. Configura las variables de entorno en .env.local
 */
