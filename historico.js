// ============================================
// HISTÓRICO DE TEMPERATURAS — eltiempo.
// Script para la página de datos históricos
// ============================================

// --- ELEMENTOS DOM ---
const dateStartInput = document.getElementById('date-start');
const dateEndInput = document.getElementById('date-end');
const fetchBtn = document.getElementById('fetch-btn');
const chartLoading = document.getElementById('chart-loading');
const chartError = document.getElementById('chart-error');
const chartEmpty = document.getElementById('chart-empty');
const statsSection = document.getElementById('stats-section');
const locationLabel = document.getElementById('location-label');

// --- ESTADO ---
let tempChart = null;
let currentLocation = { name: '', lat: 0, lon: 0 };
let lastDailyData = null;
let fpStart = null;
let fpEnd = null;

// --- FORMATEAR FECHA YYYY-MM-DD ---
function formatDate(d) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// --- NORMALIZAR FECHA A MEDIANOCHE (evita problemas de comparación horaria) ---
function dateOnly(d) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

// --- OBTENER FECHA EN FORMATO API (YYYY-MM-DD) ---
function getApiDate(fpInstance) {
  if (!fpInstance || !fpInstance.selectedDates || !fpInstance.selectedDates.length) {
    return '';
  }
  return fpInstance.formatDate(fpInstance.selectedDates[0], 'Y-m-d');
}

// --- INICIALIZACIÓN ---
document.addEventListener('DOMContentLoaded', () => {
  // Leer parámetros de la URL
  const params = new URLSearchParams(window.location.search);
  currentLocation.lat = parseFloat(params.get('lat')) || 40.4168;
  currentLocation.lon = parseFloat(params.get('lon')) || -3.7038;
  currentLocation.name = params.get('name') || 'Madrid';
  const admin = params.get('admin') || '';

  // Mostrar ubicación
  locationLabel.textContent = admin ? `${currentLocation.name}, ${admin}` : currentLocation.name;

  // Configurar fechas por defecto (último año)
  const hoy = new Date();
  const ayer = new Date(hoy);
  ayer.setDate(ayer.getDate() - 1);
  const haceUnAnio = new Date(ayer);
  haceUnAnio.setFullYear(haceUnAnio.getFullYear() - 1);

  const startStr = `${String(haceUnAnio.getDate()).padStart(2,'0')}/${String(haceUnAnio.getMonth()+1).padStart(2,'0')}/${haceUnAnio.getFullYear()}`;
  const endStr = `${String(ayer.getDate()).padStart(2,'0')}/${String(ayer.getMonth()+1).padStart(2,'0')}/${ayer.getFullYear()}`;

  fpStart = flatpickr(dateStartInput, {
    dateFormat: 'd/m/Y',
    monthSelectorType: 'dropdown',
    yearSelectorType: 'dropdown',
    minDate: '01/01/1940',
    maxDate: endStr,
    defaultDate: startStr,
    onChange: function(selectedDates) {
      if (selectedDates.length && fpEnd) {
        fpEnd.set('minDate', dateOnly(selectedDates[0]));
      }
    }
  });

  fpEnd = flatpickr(dateEndInput, {
    dateFormat: 'd/m/Y',
    monthSelectorType: 'dropdown',
    yearSelectorType: 'dropdown',
    minDate: '01/01/1940',
    maxDate: endStr,
    defaultDate: endStr,
    onChange: function(selectedDates) {
      if (selectedDates.length && fpStart) {
        fpStart.set('maxDate', dateOnly(selectedDates[0]));
      }
    }
  });

  // Tema claro/oscuro
  inicializarTema();

  // Event Listeners
  fetchBtn.addEventListener('click', fetchHistoricalData);
  document.getElementById('theme-toggle').addEventListener('click', toggleTema);

  // Atajos rápidos de rango
  document.querySelectorAll('.hist-range-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const range = btn.dataset.range;
      const end = dateOnly(ayer);
      const start = new Date(end);

      switch (range) {
        case '7d':
          start.setDate(start.getDate() - 7);
          break;
        case '30d':
          start.setDate(start.getDate() - 30);
          break;
        case '3m':
          start.setMonth(start.getMonth() - 3);
          break;
        case '1y':
          start.setFullYear(start.getFullYear() - 1);
          break;
        case '5y':
          start.setFullYear(start.getFullYear() - 5);
          break;
      }

      fpStart.setDate(start, true);
      fpEnd.setDate(end, true);

      // Actualizar estado activo
      document.querySelectorAll('.hist-range-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  // Cargar datos automáticamente al entrar
  fetchHistoricalData();
});


// --- FORMATEAR FECHA PARA MOSTRAR ---
function formatDateDisplay(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
}

// --- CACHÉ LOCAL ---
const CACHE_PREFIX = 'hist-cache-';
const CACHE_MAX = 15;

function getCacheKey(lat, lon, start, end) {
  return `${CACHE_PREFIX}${lat}_${lon}_${start}_${end}`;
}

function getFromCache(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveToCache(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    cleanOldCache();
  } catch {}
}

function cleanOldCache() {
  const keys = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && k.startsWith(CACHE_PREFIX)) keys.push(k);
  }
  if (keys.length > CACHE_MAX) {
    keys.sort();
    for (let i = 0; i < keys.length - CACHE_MAX; i++) {
      localStorage.removeItem(keys[i]);
    }
  }
}

// --- CONSULTAR DATOS HISTÓRICOS ---
async function fetchHistoricalData() {
  const startDate = getApiDate(fpStart);
  const endDate = getApiDate(fpEnd);

  if (!startDate || !endDate) {
    showError('Selecciona ambas fechas para consultar los datos.');
    return;
  }

  if (new Date(startDate) > new Date(endDate)) {
    showError('La fecha de inicio debe ser anterior a la fecha de fin.');
    return;
  }

  // Validar que no se pida un rango excesivo (más de 50 años)
  const diffMs = new Date(endDate) - new Date(startDate);
  const diffYears = diffMs / (1000 * 60 * 60 * 24 * 365.25);
  if (diffYears > 50) {
    showError('El rango máximo permitido es de 50 años. Por favor, reduce el intervalo.');
    return;
  }

  // Estado: cargando
  setLoading(true);
  hideError();
  chartEmpty.classList.add('hidden');

  const cacheKey = getCacheKey(currentLocation.lat, currentLocation.lon, startDate, endDate);
  const cached = getFromCache(cacheKey);

  try {
    let daily;

    if (cached) {
      daily = cached;
    } else {
      const url = `https://archive-api.open-meteo.com/v1/archive?latitude=${currentLocation.lat}&longitude=${currentLocation.lon}&start_date=${startDate}&end_date=${endDate}&daily=temperature_2m_max,temperature_2m_min&timezone=auto`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Error HTTP ${response.status}`);
      }

      const data = await response.json();

      if (!data.daily || !data.daily.time || data.daily.time.length === 0) {
        throw new Error('No se encontraron datos para el rango seleccionado.');
      }

      daily = data.daily;
      saveToCache(cacheKey, daily);
    }

    lastDailyData = daily;
    renderChart(daily);
    renderStats(daily);

  } catch (err) {
    showError(err.message || 'Error al cargar los datos históricos. Inténtalo de nuevo.');
    if (tempChart) {
      tempChart.destroy();
      tempChart = null;
    }
    statsSection.style.display = 'none';
  } finally {
    setLoading(false);
  }
}

// --- AGREGAR DATOS PARA MÓVIL ---
function aggregateData(daily, targetPoints) {
  const time = daily.time;
  const max = daily.temperature_2m_max;
  const min = daily.temperature_2m_min;
  const total = time.length;
  const groupSize = Math.ceil(total / targetPoints);

  const aggTime = [];
  const aggMax = [];
  const aggMin = [];

  for (let i = 0; i < total; i += groupSize) {
    const sliceMax = max.slice(i, i + groupSize).filter(v => v !== null);
    const sliceMin = min.slice(i, i + groupSize).filter(v => v !== null);

    aggTime.push(time[i]);
    aggMax.push(sliceMax.length ? Math.round((sliceMax.reduce((a, b) => a + b, 0) / sliceMax.length) * 10) / 10 : null);
    aggMin.push(sliceMin.length ? Math.round((sliceMin.reduce((a, b) => a + b, 0) / sliceMin.length) * 10) / 10 : null);
  }

  return { time: aggTime, temperature_2m_max: aggMax, temperature_2m_min: aggMin };
}

// --- RENDERIZAR GRÁFICO CON CHART.JS ---
function renderChart(daily) {
  const ctx = document.getElementById('temp-chart').getContext('2d');

  // Destruir gráfico anterior si existe
  if (tempChart) {
    tempChart.destroy();
  }

  // Obtener colores del tema
  const styles = getComputedStyle(document.body);
  const colorMax = styles.getPropertyValue('--chart-max').trim();
  const colorMin = styles.getPropertyValue('--chart-min').trim();
  const textColor = styles.getPropertyValue('--text-main').trim();
  const gridColor = styles.getPropertyValue('--glass-border').trim();

  // Agregar datos en móvil para reducir barras
  const isMobile = window.innerWidth <= 768;
  const displayDaily = isMobile && daily.time.length > 30 ? aggregateData(daily, 30) : daily;

  // Preparar labels con formato legible
  const labels = displayDaily.time;
  const totalPoints = labels.length;

  tempChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Máxima (°C)',
          data: displayDaily.temperature_2m_max,
          borderColor: colorMax,
          backgroundColor: hexToRgba(colorMax, 0.1),
          borderWidth: 2,
          fill: '+1',
          tension: 0.35,
          pointRadius: totalPoints <= 60 ? 3 : 0,
          pointHoverRadius: 5,
          pointBackgroundColor: colorMax,
          order: 1
        },
        {
          label: 'Mínima (°C)',
          data: displayDaily.temperature_2m_min,
          borderColor: colorMin,
          backgroundColor: hexToRgba(colorMin, 0.1),
          borderWidth: 2,
          fill: false,
          tension: 0.35,
          pointRadius: totalPoints <= 60 ? 3 : 0,
          pointHoverRadius: 5,
          pointBackgroundColor: colorMin,
          order: 2
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false
      },
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          backgroundColor: 'rgba(15, 20, 30, 0.92)',
          titleColor: '#fff',
          bodyColor: 'rgba(255,255,255,0.85)',
          borderColor: 'rgba(255,255,255,0.15)',
          borderWidth: 1,
          cornerRadius: 12,
          padding: 14,
          titleFont: { family: 'Outfit', size: 13, weight: '600' },
          bodyFont: { family: 'Outfit', size: 12.5 },
          displayColors: true,
          boxWidth: 10,
          boxHeight: 10,
          boxPadding: 4,
          callbacks: {
            title: function(tooltipItems) {
              const date = tooltipItems[0].label;
              return formatDateDisplay(date);
            },
            label: function(context) {
              const value = context.parsed.y;
              return ` ${context.dataset.label}: ${value !== null ? value.toFixed(1) + '°C' : 'Sin datos'}`;
            }
          }
        }
      },
      scales: {
        x: {
          title: {
            display: true,
            text: 'Fecha',
            color: textColor,
            font: { family: 'Outfit', size: 12, weight: '500' },
            padding: { top: 8 }
          },
          ticks: {
            color: textColor,
            font: { family: 'Outfit', size: 11 },
            maxTicksLimit: getMaxTicks(totalPoints),
            maxRotation: 45,
            callback: function(value, index) {
              return formatTickLabel(labels[index], totalPoints);
            }
          },
          grid: {
            color: gridColor,
            drawBorder: false
          }
        },
        y: {
          title: {
            display: true,
            text: 'Temperatura (°C)',
            color: textColor,
            font: { family: 'Outfit', size: 12, weight: '500' },
            padding: { bottom: 8 }
          },
          ticks: {
            color: textColor,
            font: { family: 'Outfit', size: 11 },
            callback: function(value) {
              return value + '°';
            }
          },
          grid: {
            color: gridColor,
            drawBorder: false
          }
        }
      },
      animation: {
        duration: 1200,
        easing: 'easeOutQuart'
      }
    }
  });
}

// --- RENDERIZAR ESTADÍSTICAS ---
function renderStats(daily) {
  statsSection.style.display = '';
  statsSection.style.animation = 'histFadeIn 0.5s ease forwards';

  let maxTemp = -Infinity, maxDate = '';
  let minTemp = Infinity, minDate = '';
  let sumMax = 0, sumMin = 0, countMax = 0, countMin = 0;

  for (let i = 0; i < daily.time.length; i++) {
    const tMax = daily.temperature_2m_max[i];
    const tMin = daily.temperature_2m_min[i];

    if (tMax !== null && tMax > maxTemp) {
      maxTemp = tMax;
      maxDate = daily.time[i];
    }
    if (tMin !== null && tMin < minTemp) {
      minTemp = tMin;
      minDate = daily.time[i];
    }
    if (tMax !== null) { sumMax += tMax; countMax++; }
    if (tMin !== null) { sumMin += tMin; countMin++; }
  }

  const avgTemp = (countMax > 0 && countMin > 0) ? ((sumMax + sumMin) / (countMax + countMin)) : 0;
  const rangeTemp = maxTemp - minTemp;

  document.getElementById('stat-max').textContent = `${maxTemp.toFixed(1)}°C`;
  document.getElementById('stat-max-date').textContent = `📅 ${formatDateDisplay(maxDate)}`;

  document.getElementById('stat-min').textContent = `${minTemp.toFixed(1)}°C`;
  document.getElementById('stat-min-date').textContent = `📅 ${formatDateDisplay(minDate)}`;

  document.getElementById('stat-avg').textContent = `${avgTemp.toFixed(1)}°C`;

  document.getElementById('stat-range').textContent = `${rangeTemp.toFixed(1)}°C`;
}

// --- UTILIDADES ---
function setLoading(show) {
  if (show) {
    chartLoading.classList.add('visible');
    document.querySelector('.hist-chart-container').style.display = 'none';
    fetchBtn.disabled = true;
    fetchBtn.innerHTML = `
      <div class="hist-spinner" style="width:20px;height:20px;border-width:2px;"></div>
      Cargando...
    `;
  } else {
    chartLoading.classList.remove('visible');
    document.querySelector('.hist-chart-container').style.display = '';
    fetchBtn.disabled = false;
    fetchBtn.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
      Consultar Datos
    `;
  }
}

function showError(msg) {
  chartError.textContent = msg;
  chartError.classList.add('visible');
}

function hideError() {
  chartError.classList.remove('visible');
}

function hexToRgba(hex, alpha) {
  // Handle named colors or already-rgb formats
  if (!hex.startsWith('#')) {
    return `rgba(128, 128, 128, ${alpha})`;
  }
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function getMaxTicks(totalPoints) {
  const isMobile = window.innerWidth <= 768;
  if (isMobile) {
    if (totalPoints <= 7) return totalPoints;
    if (totalPoints <= 30) return 6;
    if (totalPoints <= 90) return 5;
    if (totalPoints <= 365) return 6;
    return 8;
  }
  if (totalPoints <= 14) return totalPoints;
  if (totalPoints <= 60) return 10;
  if (totalPoints <= 365) return 12;
  return 15;
}

function formatTickLabel(dateStr, totalPoints) {
  const d = new Date(dateStr + 'T00:00:00');
  if (totalPoints <= 31) {
    return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  }
  if (totalPoints <= 365) {
    return d.toLocaleDateString('es-ES', { month: 'short', year: '2-digit' });
  }
  return d.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' });
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
  themeBtn.innerHTML = isLight ? SVG_MOON : SVG_SUN;
  themeBtn.title = isLight ? 'Cambiar a modo oscuro' : 'Cambiar a modo claro';
}

function toggleTema() {
  const themeBtn = document.getElementById('theme-toggle');
  const isLight = document.body.classList.toggle('light-mode');

  try { localStorage.setItem('eltiempo-theme', isLight ? 'light' : 'dark'); } catch {}
  themeBtn.innerHTML = isLight ? SVG_MOON : SVG_SUN;
  themeBtn.title = isLight ? 'Cambiar a modo oscuro' : 'Cambiar a modo claro';

  // Re-renderizar gráfico con nuevos colores del tema (sin re-fetch)
  if (tempChart && lastDailyData) {
    renderChart(lastDailyData);
  }
}
