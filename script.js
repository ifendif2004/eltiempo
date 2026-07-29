// --- DATOS Y ATAJOS PREDEFINIDOS ---
const QUICK_CITIES = [
  { name: "Cárchel", admin: "Jaén, Andalucía", lat: 37.6524, lon: -3.6364 },
  { name: "Breña Alta", admin: "La Palma, Canarias", lat: 28.6480, lon: -17.7954 },
  { name: "Montserrat Park", admin: "Barcelona, Cataluña", lat: 41.6082, lon: 1.7414 },
  { name: "Barcelona", admin: "Cataluña", lat: 41.3888, lon: 2.1590 },
  { name: "Madrid", admin: "Comunidad de Madrid", lat: 40.4168, lon: -3.7038 },
  { name: "Sevilla", admin: "Andalucía", lat: 37.3828, lon: -5.9732 },
  { name: "Valencia", admin: "Comunidad Valenciana", lat: 39.4698, lon: -0.3774 },
  { name: "Bilbao", admin: "País Vasco", lat: 43.2627, lon: -2.9253 },
  { name: "Zaragoza", admin: "Aragón", lat: 41.6561, lon: -0.8773 }
];

// Códigos de Clima de la WMO (World Meteorological Organization)
const WMO_CODES = {
  0: { text: "Soleado", class: "clear-day", classNight: "clear-night", icon: "sunny", iconNight: "moony" },
  1: { text: "Mayormente despejado", class: "clear-day", classNight: "clear-night", icon: "sunny", iconNight: "moony" },
  2: { text: "Parcialmente nublado", class: "cloudy", icon: "cloudy-day", iconNight: "cloudy-night" },
  3: { text: "Cubierto", class: "cloudy", icon: "overcast" },
  45: { text: "Niebla", class: "cloudy", icon: "fog" },
  48: { text: "Niebla con escarcha", class: "cloudy", icon: "fog" },
  51: { text: "Llovizna ligera", class: "rainy", icon: "rain-light" },
  53: { text: "Llovizna moderada", class: "rainy", icon: "rain-light" },
  55: { text: "Llovizna densa", class: "rainy", icon: "rain-light" },
  56: { text: "Llovizna helada ligera", class: "rainy", icon: "rain-light" },
  57: { text: "Llovizna helada densa", class: "rainy", icon: "rain-light" },
  61: { text: "Lluvia débil", class: "rainy", icon: "rain-moderate" },
  63: { text: "Lluvia moderada", class: "rainy", icon: "rain-moderate" },
  65: { text: "Lluvia fuerte", class: "rainy", icon: "rain-heavy" },
  66: { text: "Lluvia helada débil", class: "rainy", icon: "rain-moderate" },
  67: { text: "Lluvia helada fuerte", class: "rainy", icon: "rain-heavy" },
  71: { text: "Nevada débil", class: "snowy", icon: "snow-light" },
  73: { text: "Nevada moderada", class: "snowy", icon: "snow-moderate" },
  75: { text: "Nevada fuerte", class: "snowy", icon: "snow-heavy" },
  77: { text: "Granizo", class: "snowy", icon: "snow-heavy" },
  80: { text: "Chubascos de lluvia leves", class: "rainy", icon: "rain-moderate" },
  81: { text: "Chubascos de lluvia moderados", class: "rainy", icon: "rain-heavy" },
  82: { text: "Chubascos de lluvia fuertes", class: "rainy", icon: "rain-heavy" },
  85: { text: "Chubascos de nieve débiles", class: "snowy", icon: "snow-light" },
  86: { text: "Chubascos de nieve fuertes", class: "snowy", icon: "snow-heavy" },
  95: { text: "Tormenta", class: "stormy", icon: "storm" },
  96: { text: "Tormenta con granizo débil", class: "stormy", icon: "storm" },
  99: { text: "Tormenta con granizo fuerte", class: "stormy", icon: "storm" }
};

// --- ELEMENTOS DOM ---
const searchInput = document.getElementById('search-input');
const suggestionsDropdown = document.getElementById('suggestions');
const gpsBtn = document.getElementById('gps-btn');
const quickCitiesContainer = document.getElementById('quick-cities');
const errorMsg = document.getElementById('error-message');
const loadingOverlay = document.getElementById('loading-overlay');
const currentDateEl = document.getElementById('current-date');

// Elementos de Clima Actual
const wLocation = document.getElementById('w-location');
const wAdmin = document.getElementById('w-admin');
const wDesc = document.getElementById('w-desc');
const wTemp = document.getElementById('w-temp');
const wTempMax = document.getElementById('w-temp-max');
const wTempMin = document.getElementById('w-temp-min');
const wVisual = document.getElementById('w-visual');

// Elementos de Métricas
const mApparent = document.getElementById('m-apparent');
const mHumidity = document.getElementById('m-humidity');
const mPrecipitation = document.getElementById('m-precipitation');
const mWind = document.getElementById('m-wind');
const mWindDir = document.getElementById('m-wind-dir');
const mUv = document.getElementById('m-uv');
const mPressure = document.getElementById('m-pressure');
const mSunrise = document.getElementById('m-sunrise');
const mSunset = document.getElementById('m-sunset');
const mAqi = document.getElementById('m-aqi');
const mVisibility = document.getElementById('m-visibility');

// Elementos de Pronósticos
const hourlyForecastEl = document.getElementById('hourly-forecast');
const dailyForecastEl = document.getElementById('daily-forecast');

// Elementos del Mapa
const mapSection = document.getElementById('map-section');
const mapWrapper = document.getElementById('map-wrapper');
const mapHint = document.getElementById('map-hint');
const mapCityPopup = document.getElementById('map-city-popup');
const mapPopupName = document.getElementById('map-popup-name');

// --- ESTADO DE LA APLICACIÓN ---
let currentActiveCity = QUICK_CITIES[0]; // Por defecto: Cárchel
let debounceTimer;

// --- ESTADO DEL MAPA ---
let map;
let currentMapLayer = 'osm';
let mapMarker;
let mapHintDismissed = false;

// --- UTILIDADES ---
function escapeHtml(str) {
  const div = document.createElement('div');
  div.appendChild(document.createTextNode(str));
  return div.innerHTML;
}

// --- MAPA DE ICONOS SVG PREMIUM CON ANIMACIONES ---
function getSvgIcon(iconName) {
  const svgs = {
    sunny: `
      <svg viewBox="0 0 24 24" fill="none" stroke="#FFC107" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="5" fill="rgba(255, 193, 7, 0.2)" class="anim-float"></circle>
        <g class="anim-spin">
          <line x1="12" y1="1" x2="12" y2="3"></line>
          <line x1="12" y1="21" x2="12" y2="23"></line>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
          <line x1="1" y1="12" x2="3" y2="12"></line>
          <line x1="21" y1="12" x2="23" y2="12"></line>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
        </g>
      </svg>
    `,
    moony: `
      <svg viewBox="0 0 24 24" fill="none" stroke="#ECEFF1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" fill="rgba(236, 239, 241, 0.15)" class="anim-float"></path>
      </svg>
    `,
    "cloudy-day": `
      <svg viewBox="0 0 24 24" fill="none" stroke="#ECEFF1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <g class="anim-spin" style="transform: translate(-3px, -3px); transform-origin: 10px 10px;">
          <circle cx="10" cy="10" r="3" fill="#FFC107" stroke="#FFC107"></circle>
          <line x1="10" y1="4" x2="10" y2="5" stroke="#FFC107"></line>
          <line x1="10" y1="15" x2="10" y2="16" stroke="#FFC107"></line>
          <line x1="4" y1="10" x2="5" y2="10" stroke="#FFC107"></line>
          <line x1="15" y1="10" x2="16" y2="10" stroke="#FFC107"></line>
        </g>
        <path d="M18 10a5 5 0 0 0-9.5-2.5A5.5 5.5 0 0 0 2 13a5 5 0 0 0 5 5h11a4 4 0 0 0 0-8z" fill="rgba(236, 239, 241, 0.2)" class="anim-float"></path>
      </svg>
    `,
    "cloudy-night": `
      <svg viewBox="0 0 24 24" fill="none" stroke="#ECEFF1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M20 12.79A9 9 0 0 1 11.21 3" fill="none" stroke="#ECEFF1" style="transform: translate(-2px, -2px);"></path>
        <path d="M18 10a5 5 0 0 0-9.5-2.5A5.5 5.5 0 0 0 2 13a5 5 0 0 0 5 5h11a4 4 0 0 0 0-8z" fill="rgba(236, 239, 241, 0.2)" class="anim-float"></path>
      </svg>
    `,
    overcast: `
      <svg viewBox="0 0 24 24" fill="none" stroke="#B0BEC5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M16 16v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3" stroke-dasharray="2 2" class="anim-wind"></path>
        <path d="M22 10a5 5 0 0 0-9.5-2.5A5.5 5.5 0 0 0 6 13a5 5 0 0 0 5 5h11a4 4 0 0 0 0-8z" fill="rgba(176, 190, 197, 0.3)" class="anim-float"></path>
      </svg>
    `,
    fog: `
      <svg viewBox="0 0 24 24" fill="none" stroke="#ECEFF1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M18 10a5 5 0 0 0-9.5-2.5A5.5 5.5 0 0 0 2 13a5 5 0 0 0 5 5h11a4 4 0 0 0 0-8z" fill="rgba(236, 239, 241, 0.1)" class="anim-float"></path>
        <line x1="4" y1="21" x2="20" y2="21" class="anim-wind" stroke-width="1.5"></line>
        <line x1="6" y1="23" x2="18" y2="23" class="anim-wind" style="animation-delay: 1s" stroke-width="1.5"></line>
      </svg>
    `,
    "rain-light": `
      <svg viewBox="0 0 24 24" fill="none" stroke="#4fc3f7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M18 10a5 5 0 0 0-9.5-2.5A5.5 5.5 0 0 0 2 13a5 5 0 0 0 5 5h11a4 4 0 0 0 0-8z" fill="rgba(236, 239, 241, 0.2)" stroke="#ECEFF1" class="anim-float"></path>
        <line x1="8" y1="20" x2="8" y2="22" class="anim-rain-1"></line>
        <line x1="12" y1="20" x2="12" y2="22" class="anim-rain-2"></line>
        <line x1="16" y1="20" x2="16" y2="22" class="anim-rain-3"></line>
      </svg>
    `,
    "rain-moderate": `
      <svg viewBox="0 0 24 24" fill="none" stroke="#29b6f6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M18 10a5 5 0 0 0-9.5-2.5A5.5 5.5 0 0 0 2 13a5 5 0 0 0 5 5h11a4 4 0 0 0 0-8z" fill="rgba(236, 239, 241, 0.15)" stroke="#ECEFF1" class="anim-float"></path>
        <line x1="6" y1="20" x2="6" y2="22" class="anim-rain-1"></line>
        <line x1="10" y1="20" x2="10" y2="22" class="anim-rain-2"></line>
        <line x1="14" y1="20" x2="14" y2="22" class="anim-rain-3"></line>
        <line x1="18" y1="20" x2="18" y2="22" class="anim-rain-2" style="animation-delay: 0.2s"></line>
      </svg>
    `,
    "rain-heavy": `
      <svg viewBox="0 0 24 24" fill="none" stroke="#03a9f4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M18 10a5 5 0 0 0-9.5-2.5A5.5 5.5 0 0 0 2 13a5 5 0 0 0 5 5h11a4 4 0 0 0 0-8z" fill="rgba(120, 144, 156, 0.3)" stroke="#B0BEC5" class="anim-float"></path>
        <path d="M6 20l-1 3" class="anim-rain-1" stroke-width="2.5"></path>
        <path d="M10 20l-1 3" class="anim-rain-2" stroke-width="2.5"></path>
        <path d="M14 20l-1 3" class="anim-rain-3" stroke-width="2.5"></path>
        <path d="M18 20l-1 3" class="anim-rain-2" style="animation-delay: 0.2s" stroke-width="2.5"></path>
      </svg>
    `,
    "snow-light": `
      <svg viewBox="0 0 24 24" fill="none" stroke="#b3e5fc" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M18 10a5 5 0 0 0-9.5-2.5A5.5 5.5 0 0 0 2 13a5 5 0 0 0 5 5h11a4 4 0 0 0 0-8z" fill="rgba(255,255,255,0.2)" stroke="#ECEFF1" class="anim-float"></path>
        <circle cx="8" cy="20" r="1" fill="#fff" class="anim-snow-1"></circle>
        <circle cx="12" cy="21" r="1.2" fill="#fff" class="anim-snow-2"></circle>
        <circle cx="16" cy="20" r="1" fill="#fff" class="anim-snow-3"></circle>
      </svg>
    `,
    "snow-moderate": `
      <svg viewBox="0 0 24 24" fill="none" stroke="#e1f5fe" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M18 10a5 5 0 0 0-9.5-2.5A5.5 5.5 0 0 0 2 13a5 5 0 0 0 5 5h11a4 4 0 0 0 0-8z" fill="rgba(255,255,255,0.2)" stroke="#ECEFF1" class="anim-float"></path>
        <path d="M8 20h0.01" stroke-width="3" stroke="#fff" class="anim-snow-1"></path>
        <path d="M12 21h0.01" stroke-width="3" stroke="#fff" class="anim-snow-2"></path>
        <path d="M16 20h0.01" stroke-width="3" stroke="#fff" class="anim-snow-3"></path>
      </svg>
    `,
    "snow-heavy": `
      <svg viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M18 10a5 5 0 0 0-9.5-2.5A5.5 5.5 0 0 0 2 13a5 5 0 0 0 5 5h11a4 4 0 0 0 0-8z" fill="rgba(255,255,255,0.3)" stroke="#ffffff" class="anim-float"></path>
        <path d="M6 21l2-2M8 21l-2-2" class="anim-snow-1" stroke-width="1.5"></path>
        <path d="M12 22v-3M10.5 20.5h3" class="anim-snow-2" stroke-width="1.5"></path>
        <path d="M17 21l-2-2M15 21l2-2" class="anim-snow-3" stroke-width="1.5"></path>
      </svg>
    `,
    storm: `
      <svg viewBox="0 0 24 24" fill="none" stroke="#ECEFF1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M19 10a5 5 0 0 0-9.5-2.5A5.5 5.5 0 0 0 3 13a5 5 0 0 0 5 5h11a4 4 0 0 0 0-8z" fill="rgba(55, 71, 79, 0.4)" class="anim-float"></path>
        <!-- Rayo -->
        <path d="M13 18l-3 4v-4H8l5-6v4h2z" fill="#FFEB3B" stroke="#FDD835" stroke-width="1" class="anim-flash"></path>
        <!-- Lluvia -->
        <line x1="6" y1="20" x2="5" y2="22" class="anim-rain-1" stroke="#4fc3f7" stroke-width="1.5"></line>
        <line x1="16" y1="20" x2="15" y2="22" class="anim-rain-3" stroke="#4fc3f7" stroke-width="1.5"></line>
      </svg>
    `
  };
  return svgs[iconName] || svgs.sunny;
}

// --- INICIALIZACIÓN ---
document.addEventListener("DOMContentLoaded", () => {
  // Mostrar fecha de hoy
  mostrarFechaHoy();
  // Renderizar botones rápidos de ciudades
  renderQuickCities();
  // Cargar clima de la ciudad inicial (Cárchel)
  fetchWeather(currentActiveCity);
  // Inicializar el tema (claro/oscuro)
  inicializarTema();
  // Inicializar mapa interactivo
  inicializarMapa();

  // Event Listeners
  searchInput.addEventListener('input', manejarBusqueda);
  gpsBtn.addEventListener('click', usarGeolocalizacion);
  document.getElementById('theme-toggle').addEventListener('click', toggleTema);

  // Cerrar dropdown al hacer click fuera
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.search-box-container')) {
      suggestionsDropdown.classList.remove('active');
    }
  });

  // Manejar shortcut GPS del manifest (?action=gps)
  if (window.location.search.includes('action=gps')) {
    setTimeout(() => usarGeolocalizacion(), 500);
  }
});

// --- REGISTRO DEL SERVICE WORKER (PWA) ---
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then((registration) => {
        // Detectar cuando hay un nuevo SW instalándose
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (!newWorker) return;

          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              mostrarBannerActualizacion();
            }
          });
        });
      })
      .catch(() => {
        // Error al registrar SW - silenciar en producción
      });

    // Cuando el nuevo SW toma control, recargar la página
    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!refreshing) {
        refreshing = true;
        window.location.reload();
      }
    });
  });
}

// --- BANNER DE ACTUALIZACIÓN ---
function mostrarBannerActualizacion() {
  if (document.getElementById('update-banner')) return;

  const banner = document.createElement('div');
  banner.id = 'update-banner';
  banner.className = 'update-banner';
  banner.innerHTML = `
    <span class="update-banner-text">Nueva versión disponible</span>
    <button id="update-btn" class="update-btn">Actualizar</button>
  `;

  document.body.appendChild(banner);

  document.getElementById('update-btn').addEventListener('click', () => {
    window.location.reload();
  });
}


// --- MOSTRAR FECHA ---
function mostrarFechaHoy() {
  const opciones = { weekday: 'long', day: 'numeric', month: 'long' };
  const hoy = new Date();
  // Primera letra en mayúscula
  let fechaTexto = hoy.toLocaleDateString('es-ES', opciones);
  fechaTexto = fechaTexto.charAt(0).toUpperCase() + fechaTexto.slice(1);
  currentDateEl.textContent = fechaTexto;
}

// --- RENDERIZAR ATAJOS DE CIUDADES ---
function renderQuickCities() {
  quickCitiesContainer.innerHTML = "";
  QUICK_CITIES.forEach((city, index) => {
    const btn = document.createElement('button');
    btn.className = `city-btn ${index === 0 ? 'active' : ''}`;
    btn.textContent = city.name;
    btn.addEventListener('click', () => {
      // Remover clases active anteriores
      document.querySelectorAll('.city-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      currentActiveCity = city;
      fetchWeather(city);
    });
    quickCitiesContainer.appendChild(btn);
  });
}

// --- BUSCADOR CON AUTOCOMPLETADO (OPEN-METEO GEOCODING) ---
function manejarBusqueda(e) {
  const query = e.target.value.trim();
  clearTimeout(debounceTimer);

  if (query.length < 3) {
    suggestionsDropdown.classList.remove('active');
    return;
  }

  debounceTimer = setTimeout(async () => {
    try {
      // Filtrado directo a España (&country=ES)
      const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=10&language=es&countryId=ES`);
      const data = await res.json();

      if (data.results && data.results.length > 0) {
        // Filtrado secundario por seguridad (código ES)
        const spanishResults = data.results.filter(item => item.country_code === 'ES');

        if (spanishResults.length > 0) {
          mostrarSugerencias(spanishResults);
        } else {
          mostrarNoResultados();
        }
      } else {
        mostrarNoResultados();
      }
    } catch {
      // Error al buscar municipios - silenciar en producción
    }
  }, 350);
}

function mostrarSugerencias(results) {
  suggestionsDropdown.innerHTML = "";
  suggestionsDropdown.classList.add('active');

  results.forEach(place => {
    const item = document.createElement('div');
    item.className = "suggestion-item";

    // Formatear administración/provincia
    const adminField = place.admin1 ? `${place.admin1}` : 'España';

    item.innerHTML = `
      <div>
        <div class="suggestion-name">${escapeHtml(place.name)}</div>
        <div class="suggestion-admin">${escapeHtml(adminField)}</div>
      </div>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
    `;

    item.addEventListener('click', () => {
      suggestionsDropdown.classList.remove('active');
      searchInput.value = "";

      // Desactivar atajos rápidos ya que se busca manualmente
      document.querySelectorAll('.city-btn').forEach(b => b.classList.remove('active'));

      const selectedCity = {
        name: place.name,
        admin: adminField,
        lat: place.latitude,
        lon: place.longitude
      };

      currentActiveCity = selectedCity;
      fetchWeather(selectedCity);
    });

    suggestionsDropdown.appendChild(item);
  });
}

function mostrarNoResultados() {
  suggestionsDropdown.innerHTML = `
    <div style="padding: 15px 20px; color: var(--text-muted); font-size: 0.95rem; text-align: center;">
      No se encontraron municipios en España
    </div>
  `;
  suggestionsDropdown.classList.add('active');
}

// --- GEOLOCALIZACIÓN DEL NAVEGADOR ---
function usarGeolocalizacion() {
  if (!navigator.geolocation) {
    mostrarError("La geolocalización no es compatible con este navegador.");
    return;
  }

  setLoading(true);
  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;

      try {
        // Intentar reverso con OSM Nominatim
        // NOTA: Se añade User-Agent para cumplir la política de Nominatim
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10`, {
          headers: {
            'Accept-Language': 'es',
            'User-Agent': 'eltiempo-pwa/1.0'
          }
        });
        const data = await res.json();

        let name = "Ubicación GPS";
        let admin = "España";

        if (data.address) {
          name = data.address.city || data.address.town || data.address.village || data.address.hamlet || "Mi Ubicación";
          admin = data.address.province || data.address.state || "España";
        }

        // Desactivar atajos rápidos
        document.querySelectorAll('.city-btn').forEach(b => b.classList.remove('active'));

        const gpsCity = { name, admin, lat, lon };
        currentActiveCity = gpsCity;
        fetchWeather(gpsCity);

      } catch {
        // Error en geolocalización inversa - usar fallback
        // Fallback: cargar coordenadas sin nombre reverso
        const gpsCityFallback = { name: "Ubicación GPS", admin: `${lat.toFixed(3)}, ${lon.toFixed(3)}`, lat, lon };
        currentActiveCity = gpsCityFallback;
        fetchWeather(gpsCityFallback);
      }
    },
    (error) => {
      setLoading(false);
      switch (error.code) {
        case error.PERMISSION_DENIED:
          mostrarError("Has denegado el permiso de geolocalización.");
          break;
        case error.POSITION_UNAVAILABLE:
          mostrarError("La información de ubicación no está disponible.");
          break;
        case error.TIMEOUT:
          mostrarError("Se agotó el tiempo de espera para obtener la ubicación.");
          break;
        default:
          mostrarError("Ocurrió un error al obtener la ubicación.");
          break;
      }
    },
    { timeout: 10000 }
  );
}

// --- CARGAR CLIMA DESDE LA API ---
async function fetchWeather(city) {
  setLoading(true);
  ocultarError();

  const url = `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,showers,snowfall,weather_code,cloud_cover,pressure_msl,wind_speed_10m,wind_direction_10m,uv_index,visibility&hourly=temperature_2m,weather_code,precipitation_probability&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,precipitation_probability_max&timezone=auto&forecast_days=14`;
  const urlAqi = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${city.lat}&longitude=${city.lon}&current=european_aqi&timezone=auto`;

  try {
    const [weatherRes, aqiRes] = await Promise.all([
      fetch(url),
      fetch(urlAqi).catch(() => {
        // Error al consultar calidad del aire - continuar sin ella
        return null;
      })
    ]);

    if (!weatherRes.ok) throw new Error("Error en la conexión con la API meteorológica.");
    const weatherData = await weatherRes.json();

    let aqiData = null;
    if (aqiRes && aqiRes.ok) {
      aqiData = await aqiRes.json();
    }

    // Actualizar interfaz
    actualizarClimaActual(city, weatherData.current, weatherData.daily);
    actualizarMetricas(weatherData.current, weatherData.daily, aqiData ? aqiData.current : null);
    actualizarPronosticoHoras(weatherData.hourly, weatherData.daily);
    actualizarPronosticoDiario(weatherData.daily);

  } catch {
    // Error al obtener datos climáticos
    mostrarError("Error al cargar la información meteorológica. Inténtalo de nuevo.");
  } finally {
    setLoading(false);
  }
}

// --- ACTUALIZAR INTERFAZ: CLIMA ACTUAL ---
function actualizarClimaActual(city, current, daily) {
  wLocation.textContent = city.name;
  wAdmin.textContent = city.admin;

  const temp = Math.round(current.temperature_2m);
  wTemp.textContent = temp;

  const maxTemp = Math.round(daily.temperature_2m_max[0]);
  const minTemp = Math.round(daily.temperature_2m_min[0]);
  wTempMax.textContent = `${maxTemp}°`;
  wTempMin.textContent = `${minTemp}°`;

  const codeData = WMO_CODES[current.weather_code] || { text: "Variable", class: "cloudy", icon: "cloudy-day" };
  wDesc.textContent = codeData.text;

  // Determinar si es de día o de noche para el icono
  const isDay = current.is_day === 1;
  let finalIcon = codeData.icon;

  if (!isDay) {
    if (codeData.iconNight) finalIcon = codeData.iconNight;
  }

  // Inyectar el SVG animado correspondiente
  wVisual.innerHTML = getSvgIcon(finalIcon);
}

// --- ACTUALIZAR INTERFAZ: MÉTRICAS AVANZADAS ---
function actualizarMetricas(current, daily, currentAqi) {
  mApparent.textContent = `${Math.round(current.apparent_temperature)}°C`;
  mHumidity.textContent = `${current.relative_humidity_2m}%`;

  // Total de precipitación actual (lluvia, chubascos, nieve)
  const prec = current.precipitation;
  mPrecipitation.textContent = prec > 0 ? `${prec.toFixed(1)} mm` : `0.0 mm`;

  mWind.textContent = `${Math.round(current.wind_speed_10m)} km/h`;

  // Dirección del viento (flecha rotatoria)
  mWindDir.style.transform = `rotate(${current.wind_direction_10m}deg)`;
  mWindDir.title = `Viento de dirección ${current.wind_direction_10m}°`;

  mUv.textContent = current.uv_index ? current.uv_index.toFixed(1) : "0.0";
  mPressure.textContent = `${Math.round(current.pressure_msl)} hPa`;

  // Amanecer y Atardecer
  if (daily && daily.sunrise && daily.sunrise[0]) {
    const sunriseTime = new Date(daily.sunrise[0]).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    mSunrise.textContent = sunriseTime;
  } else {
    mSunrise.textContent = '--:--';
  }

  if (daily && daily.sunset && daily.sunset[0]) {
    const sunsetTime = new Date(daily.sunset[0]).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    mSunset.textContent = sunsetTime;
  } else {
    mSunset.textContent = '--:--';
  }

  // Calidad del Aire (European AQI)
  if (currentAqi && currentAqi.european_aqi !== undefined && currentAqi.european_aqi !== null) {
    const aqi = currentAqi.european_aqi;
    let desc = "Bueno";
    if (aqi <= 40) desc = "Aceptable";
    else if (aqi <= 60) desc = "Moderado";
    else if (aqi <= 80) desc = "Malo";
    else if (aqi <= 100) desc = "Muy malo";
    else desc = "Extr. malo";
    mAqi.textContent = `${desc} (${aqi})`;
  } else {
    mAqi.textContent = '--';
  }

  // Visibilidad
  if (current.visibility !== undefined && current.visibility !== null) {
    const visKm = (current.visibility / 1000).toFixed(1);
    mVisibility.textContent = `${visKm} km`;
  } else {
    mVisibility.textContent = '-- km';
  }
}

// --- ACTUALIZAR INTERFAZ: PRONÓSTICO 24 HORAS ---
function actualizarPronosticoHoras(hourly, daily) {
  hourlyForecastEl.innerHTML = "";

  // Obtener hora actual del cliente para mostrar a partir de ella
  const ahora = new Date();
  const horaActualStr = ahora.toISOString().substring(0, 13); // "YYYY-MM-DDTHH"

  // Encontrar el índice de inicio en el dataset de la API
  let inicioIdx = 0;
  for (let i = 0; i < hourly.time.length; i++) {
    if (hourly.time[i].startsWith(horaActualStr)) {
      inicioIdx = i;
      break;
    }
  }

  // Renderizar las siguientes 24 horas
  const limite = Math.min(inicioIdx + 24, hourly.time.length);
  for (let i = inicioIdx; i < limite; i++) {
    const timeVal = new Date(hourly.time[i]);
    const horaStr = timeVal.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    const temp = Math.round(hourly.temperature_2m[i]);
    const code = hourly.weather_code[i];
    const pop = hourly.precipitation_probability[i]; // Prob. Precipitación

    const codeData = WMO_CODES[code] || { icon: "cloudy-day" };

    // Determinar si es de noche usando sunrise/sunset reales del día correspondiente
    let esNoche = false;
    if (daily && daily.sunrise && daily.sunset) {
      const dayDate = hourly.time[i].substring(0, 10);
      const dayIdx = daily.time.indexOf(dayDate);
      if (dayIdx !== -1) {
        const sunrise = new Date(daily.sunrise[dayIdx]);
        const sunset = new Date(daily.sunset[dayIdx]);
        esNoche = timeVal < sunrise || timeVal > sunset;
      }
    }
    let finalIcon = codeData.icon;
    if (esNoche && codeData.iconNight) {
      finalIcon = codeData.iconNight;
    }

    const item = document.createElement('div');
    item.className = "hourly-item animate-fade-in";
    item.style.animationDelay = `${(i - inicioIdx) * 0.03}s`;

    item.innerHTML = `
      <span class="hourly-time">${horaStr}</span>
      <div class="hourly-icon">${getSvgIcon(finalIcon)}</div>
      <span class="hourly-temp">${temp}°</span>
      <span class="hourly-pop">${pop > 0 ? pop + '%' : '&nbsp;'}</span>
    `;

    hourlyForecastEl.appendChild(item);
  }
}

// --- ACTUALIZAR INTERFAZ: PRONÓSTICO SEMANAL (7 DÍAS) ---
function actualizarPronosticoDiario(daily) {
  dailyForecastEl.innerHTML = "";

  // Encontrar la temperatura máxima y mínima global de la semana para la escala de las barras
  const maxGlobal = Math.max(...daily.temperature_2m_max);
  const minGlobal = Math.min(...daily.temperature_2m_min);
  const rangoGlobal = maxGlobal - minGlobal;

  for (let i = 0; i < daily.time.length; i++) {
    const dateVal = new Date(daily.time[i] + 'T00:00:00'); // Añadir T00:00 para evitar desajustes de zona horaria
    let diaNombre = dateVal.toLocaleDateString('es-ES', { weekday: 'long' });
    diaNombre = diaNombre.charAt(0).toUpperCase() + diaNombre.slice(1);

    // Si es hoy, poner "Hoy"
    if (i === 0) diaNombre = "Hoy";

    const tempMax = Math.round(daily.temperature_2m_max[i]);
    const tempMin = Math.round(daily.temperature_2m_min[i]);
    const code = daily.weather_code[i];
    const pop = daily.precipitation_probability_max[i]; // Probabilidad máxima de precipitación

    const codeData = WMO_CODES[code] || { icon: "cloudy-day" };

    // Calcular porcentajes de barra visuales para la temperatura
    const leftPercent = ((tempMin - minGlobal) / rangoGlobal) * 100;
    const widthPercent = ((tempMax - tempMin) / rangoGlobal) * 100;

    const item = document.createElement('div');
    item.className = "daily-item animate-fade-in";
    item.style.animationDelay = `${i * 0.05}s`;

    item.innerHTML = `
      <span class="daily-name">${diaNombre}</span>
      <div class="daily-icon">${getSvgIcon(codeData.icon)}</div>
      <span class="daily-pop">${pop > 0 ? pop + '%' : '&nbsp;'}</span>
      <div class="daily-bar-container">
        <div class="daily-bar">
          <div class="daily-bar-fill" style="left: ${leftPercent}%; width: ${widthPercent}%;"></div>
        </div>
      </div>
      <div class="daily-temp-range">
        <span class="daily-temp-max">${tempMax}°</span>
        <span class="daily-temp-min">${tempMin}°</span>
      </div>
    `;

    dailyForecastEl.appendChild(item);
  }
}

// --- MANEJO DE LOADER ---
function setLoading(isLoading) {
  if (isLoading) {
    loadingOverlay.classList.add('active');
  } else {
    loadingOverlay.classList.remove('active');
  }
}

// --- ERRORES ---
function mostrarError(text) {
  errorMsg.textContent = text;
  errorMsg.classList.add('active');
  // Auto-ocultar a los 5 segundos
  setTimeout(ocultarError, 5000);
}

// Ocultar error
function ocultarError() {
  errorMsg.classList.remove('active');
}

// --- MAPA INTERACTIVO (LEAFLET) ---

function inicializarMapa() {
  try {
    const mapContainer = document.getElementById('leaflet-map');
    if (!mapContainer || typeof L === 'undefined') return;

    // Capas de tiles
    const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19
    });

    const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
      maxZoom: 19
    });

    // Inicializar mapa centrado en España
    map = L.map('leaflet-map', {
      center: [40.4168, -3.7038], // Madrid
      zoom: 6,
      zoomControl: false,
      attributionControl: false
    });

    // Añadir capa por defecto (OSM)
    osmLayer.addTo(map);

    // Añadir controles de zoom personalizados (esquina inferior derecha)
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Añadir atribución personalizada (esquina inferior izquierda)
    L.control.attribution({ position: 'bottomleft', prefix: false }).addTo(map);

    // Marcador personalizado con animación
    const pulseIcon = L.divIcon({
      className: 'map-marker-pulse',
      iconSize: [20, 20],
      iconAnchor: [10, 10],
      html: '<div class="map-marker-pulse"></div>'
    });

    // Evento click en el mapa
    map.on('click', async (e) => {
      const { lat, lng } = e.latlng;

      // Ocultar hint después del primer click
      if (!mapHintDismissed) {
        document.getElementById('map-hint').classList.add('hidden');
        mapHintDismissed = true;
      }

      // Actualizar marcador
      if (mapMarker) {
        mapMarker.setLatLng([lat, lng]);
      } else {
        mapMarker = L.marker([lat, lng], { icon: pulseIcon }).addTo(map);
      }

      // Reverse geocoding con Nominatim
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10&addressdetails=1`, {
          headers: {
            'Accept-Language': 'es',
            'User-Agent': 'eltiempo.app/1.0 (https://github.com/usuario/eltiempo)'
          }
        });
        const data = await res.json();

        let name = "Ubicación seleccionada";
        let admin = "España";

        if (data.address) {
          name = data.address.city || data.address.town || data.address.village || data.address.hamlet || data.address.suburb || "Punto seleccionado";
          admin = data.address.province || data.address.state || data.address.county || "España";
        }

        // Mostrar popup con nombre y botón
        const popup = document.getElementById('map-city-popup');
        const nameEl = document.getElementById('map-popup-name');
        const loadBtn = document.getElementById('map-popup-load-btn');

        nameEl.textContent = `${name}, ${admin}`;

        // Guardar coordenadas en el botón para usarlas al hacer click
        loadBtn.dataset.lat = lat;
        loadBtn.dataset.lon = lng;
        loadBtn.dataset.name = name;
        loadBtn.dataset.admin = admin;

        popup.classList.add('visible');
      } catch {
        // Error reverse geocoding - mostrar coordenadas
        // Fallback: mostrar coordenadas
        const popup = document.getElementById('map-city-popup');
        const nameEl = document.getElementById('map-popup-name');
        const loadBtn = document.getElementById('map-popup-load-btn');

        nameEl.textContent = `Lat: ${lat.toFixed(4)}, Lon: ${lng.toFixed(4)}`;
        loadBtn.dataset.lat = lat;
        loadBtn.dataset.lon = lng;
        loadBtn.dataset.name = `Ubicación (${lat.toFixed(3)}, ${lng.toFixed(3)})`;
        loadBtn.dataset.admin = "Coordenadas GPS";

        popup.classList.add('visible');
      }
    });

    // Click en botón "Ver el tiempo aquí"
    document.getElementById('map-popup-load-btn').addEventListener('click', (e) => {
      const btn = e.currentTarget;
      const lat = parseFloat(btn.dataset.lat);
      const lon = parseFloat(btn.dataset.lon);
      const name = btn.dataset.name;
      const admin = btn.dataset.admin;

      // Desactivar botones de ciudades rápidas
      document.querySelectorAll('.city-btn').forEach(b => b.classList.remove('active'));

      const selectedCity = { name, admin, lat, lon };
      currentActiveCity = selectedCity;
      fetchWeather(selectedCity);

      // Ocultar popup
      document.getElementById('map-city-popup').classList.remove('visible');
    });

    // Toggle capa del mapa
    document.getElementById('map-layer-btn').addEventListener('click', () => {
      const label = document.getElementById('map-layer-label');

      if (currentMapLayer === 'osm') {
        map.removeLayer(osmLayer);
        satelliteLayer.addTo(map);
        currentMapLayer = 'satellite';
        label.textContent = 'Mapa';
      } else {
        map.removeLayer(satelliteLayer);
        osmLayer.addTo(map);
        currentMapLayer = 'osm';
        label.textContent = 'Satélite';
      }
    });

    // Colapsar/Expandir mapa
    document.getElementById('map-collapse-btn').addEventListener('click', () => {
      const wrapper = document.getElementById('map-wrapper');
      const icon = document.getElementById('map-collapse-icon');

      wrapper.classList.toggle('collapsed');
      icon.classList.toggle('rotated');

      // Forzar resize del mapa al expandir
      setTimeout(() => map.invalidateSize(), 450);
    });

    // Cerrar popup al hacer click fuera
    document.addEventListener('click', (e) => {
      const popup = document.getElementById('map-city-popup');
      const wrapper = document.getElementById('map-wrapper');
      if (popup.classList.contains('visible') && !wrapper.contains(e.target)) {
        popup.classList.remove('visible');
      }
    });
  } catch {
    // Error inicializando mapa - silenciar
  }
}

// --- TEMA CLARO / OSCURO ---
const SVG_MOON = `
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
  </svg>`;

const SVG_SUN = `
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="12" cy="12" r="5"></circle>
    <line x1="12" y1="1" x2="12" y2="3"></line>
    <line x1="12" y1="21" x2="12" y2="23"></line>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
    <line x1="1" y1="12" x2="3" y2="12"></line>
    <line x1="21" y1="12" x2="23" y2="12"></line>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
  </svg>`;

function inicializarTema() {
  const themeBtn = document.getElementById('theme-toggle');
  const savedTheme = localStorage.getItem('eltiempo-theme');
  const isLight = savedTheme === 'light';

  if (isLight) {
    document.body.classList.add('light-mode');
  }
  // El icono muestra la acción que hará (opuesto al tema actual)
  themeBtn.innerHTML = isLight ? SVG_MOON : SVG_SUN;
  themeBtn.title = isLight ? 'Cambiar a modo oscuro' : 'Cambiar a modo claro';
}

function toggleTema() {
  const themeBtn = document.getElementById('theme-toggle');
  const isLight = document.body.classList.toggle('light-mode');

  localStorage.setItem('eltiempo-theme', isLight ? 'light' : 'dark');
  themeBtn.innerHTML = isLight ? SVG_MOON : SVG_SUN;
  themeBtn.title = isLight ? 'Cambiar a modo oscuro' : 'Cambiar a modo claro';
}
