# eltiempo. 🌤️

**El tiempo en España** — Aplicación web progresiva (PWA) con pronóstico meteorológico en tiempo real para cualquier municipio español.

[![PWA Ready](https://img.shields.io/badge/PWA-Ready-blue?logo=googlechrome)](https://web.dev/progressive-web-apps/)
[![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/HTML5)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)

---

## ✨ Características

- 🌡️ **Temperatura actual** con sensación térmica, máxima y mínima
- 📊 **Métricas avanzadas**: humedad, viento, precipitación, índice UV, presión
- 🕐 **Pronóstico por horas** — próximas 24 horas
- 📅 **Pronóstico semanal** — 7 días con barra visual de temperatura
- 🔍 **Buscador con autocompletado** para cualquier municipio de España
- 📍 **Geolocalización GPS** — tiempo en tu ubicación actual
- 🌗 **Modo claro/oscuro** con persistencia en `localStorage`
- 🎨 **Fondos dinámicos** según el estado del tiempo (sol, lluvia, nieve, tormenta...)
- 📱 **PWA instalable** — funciona offline y se puede añadir a la pantalla de inicio
- ⚡ **Sin dependencias** — Vanilla HTML, CSS y JavaScript puro

---

## 🗂️ Estructura del Proyecto

```
eltiempo/
├── index.html          # Página principal
├── style.css           # Estilos (glassmorphism, animaciones, temas)
├── script.js           # Lógica de la aplicación
├── manifest.json       # Web App Manifest (PWA)
├── sw.js               # Service Worker (caché offline)
├── icons/              # Iconos de la PWA en todos los tamaños
│   ├── icon.svg
│   ├── icon-72x72.png
│   ├── icon-96x96.png
│   ├── icon-128x128.png
│   ├── icon-144x144.png
│   ├── icon-152x152.png
│   ├── icon-192x192.png
│   ├── icon-384x384.png
│   └── icon-512x512.png
├── .gitignore
└── README.md
```

---

## 🚀 Cómo usarlo

### Opción 1: Directamente en el navegador
Abre `index.html` en tu navegador. **Nota:** El Service Worker requiere HTTPS o `localhost` para funcionar correctamente.

### Opción 2: Servidor local
```bash
# Con Python 3
python -m http.server 8000

# Con Node.js (npx)
npx serve .

# Con VS Code
# Instala la extensión "Live Server" y haz click en "Go Live"
```

Luego abre `http://localhost:8000` en tu navegador.

### Opción 3: GitHub Pages
1. Sube el repositorio a GitHub
2. Ve a **Settings → Pages**
3. En *Source*, selecciona la rama `main` y la carpeta raíz `/`
4. ¡La app estará disponible en `https://tu-usuario.github.io/eltiempo/`!

---

## 📦 Instalar como PWA

Una vez abierta la app desde HTTPS (por ejemplo, en GitHub Pages):

- **Android/Chrome**: Aparecerá el banner "Añadir a pantalla de inicio"
- **iOS/Safari**: Pulsa el botón compartir → "Añadir a pantalla de inicio"
- **Escritorio/Chrome**: Icono de instalación en la barra de direcciones

---

## 🛠️ APIs utilizadas

| Servicio | Uso | Licencia |
|---|---|---|
| [Open-Meteo](https://open-meteo.com/) | Datos meteorológicos en tiempo real | Gratuita, sin API key |
| [Open-Meteo Geocoding](https://open-meteo.com/en/docs/geocoding-api) | Búsqueda de municipios | Gratuita, sin API key |
| [Nominatim (OSM)](https://nominatim.org/) | Geocodificación inversa (GPS) | Gratuita, ODbL |
| [Google Fonts](https://fonts.google.com/) | Tipografía Outfit | Gratuita |

> **No se necesita ninguna API key** para usar esta aplicación.

---

## 🎨 Diseño

- **Glassmorphism**: Tarjetas con efecto de cristal y `backdrop-filter: blur()`
- **Gradientes dinámicos**: El fondo cambia según el estado del tiempo
- **Micro-animaciones**: Iconos SVG animados (lluvia, nieve, sol, tormenta)
- **Paleta de colores**: Tonos azul-cian para modo oscuro, azules suaves para modo claro
- **Tipografía**: [Outfit](https://fonts.google.com/specimen/Outfit) de Google Fonts
- **Responsive**: Diseño adaptado para móvil, tablet y escritorio

---

## 📄 Licencia

MIT License — Libre para usar, modificar y distribuir.

---

*Hecho con ❤️ — datos meteorológicos proporcionados por [Open-Meteo](https://open-meteo.com/)*
