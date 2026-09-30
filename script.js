// ==========================================
// FLOODWATCH — Rapid Flood Mapping
// East Siang, Arunachal Pradesh
// ==========================================

// ── Tile layers ───────────────────────────────
const tileLayers = {
  satellite: L.tileLayer(
    'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    { maxZoom: 19, attribution: '© Esri World Imagery' }
  ),
  terrain: L.tileLayer(
    'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    { maxZoom: 17, attribution: '© OpenTopoMap' }
  ),
  dark: L.tileLayer(
    'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    { maxZoom: 19, attribution: '© CartoDB' }
  ),
  light: L.tileLayer(
    'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    { maxZoom: 19, attribution: '© CartoDB' }
  )
};

const map = L.map('map', {
  zoomControl: false,
  attributionControl: true
}).setView([28.05, 95.45], 9);

tileLayers.satellite.addTo(map);
let activeLayer = 'satellite';

// ── View toggle buttons ────────────────────────
document.querySelectorAll('.view-btn').forEach((btn, i) => {
  const keys = ['satellite', 'terrain', 'dark', 'light'];
  btn.addEventListener('click', () => {
    document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    map.removeLayer(tileLayers[activeLayer]);
    activeLayer = keys[i];
    tileLayers[activeLayer].addTo(map);
  });
});

// ── Custom zoom controls ───────────────────────
document.getElementById('zoomIn')?.addEventListener('click', () => map.zoomIn());
document.getElementById('zoomOut')?.addEventListener('click', () => map.zoomOut());
document.getElementById('zoomLocate')?.addEventListener('click', () => {
  if (floodLayer.getBounds().isValid()) {
    map.fitBounds(floodLayer.getBounds(), { padding: [45, 45] });
  }
});

// ── Nav tabs ──────────────────────────────────
document.querySelectorAll('.nav-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  });
});

// ── Flood layer ───────────────────────────────
const floodLayer = L.geoJSON(null, {
  style: {
    color: '#f43f5e',
    fillColor: '#f43f5e',
    fillOpacity: 0.42,
    weight: 1.2
  },
  onEachFeature(feature, layer) {
    layer.bindPopup(`
      <div style="font-family:Inter,sans-serif;line-height:1.6">
        <div style="font-weight:700;font-size:13px;margin-bottom:6px">🌊 Flood Detected</div>
        <div style="color:#6b8aaa;font-size:10px;margin-bottom:4px">REGION</div>
        <div style="margin-bottom:6px">East Siang, Arunachal Pradesh</div>
        <div style="color:#6b8aaa;font-size:10px;margin-bottom:4px">SOURCE</div>
        <div style="margin-bottom:6px">Sentinel-1 SAR (VV polarisation)</div>
        <div style="display:flex;gap:16px;margin-top:8px">
          <div><div style="color:#6b8aaa;font-size:9px">PRE-FLOOD</div><div>23 Jun 2026</div></div>
          <div><div style="color:#6b8aaa;font-size:9px">POST-FLOOD</div><div>28 Jun 2026</div></div>
        </div>
      </div>
    `);
  }
}).addTo(map);

// ── Agriculture layer ─────────────────────────
const agricultureLayer = L.geoJSON(null, {
  style: {
    color: '#fb923c',
    fillColor: '#fb923c',
    fillOpacity: 0.55,
    weight: 1
  },
  onEachFeature(feature, layer) {
    layer.bindPopup(`
      <div style="font-family:Inter,sans-serif;line-height:1.6">
        <div style="font-weight:700;font-size:13px;margin-bottom:6px">🌾 Flooded Agriculture</div>
        <div style="color:#6b8aaa;font-size:10px;margin-bottom:4px">SOURCE</div>
        <div>Dynamic World + Sentinel-1</div>
      </div>
    `);
  }
}).addTo(map);

// ── Settlement layer ──────────────────────────
const settlementLayer = L.geoJSON(null, {
  style: {
    color: '#fbbf24',
    fillColor: '#fbbf24',
    fillOpacity: 0.65,
    weight: 1
  },
  onEachFeature(feature, layer) {
    layer.bindPopup(`
      <div style="font-family:Inter,sans-serif;line-height:1.6">
        <div style="font-weight:700;font-size:13px;margin-bottom:6px">🏘️ Affected Settlement</div>
        <div style="color:#6b8aaa;font-size:10px;margin-bottom:4px">SOURCE</div>
        <div>WSF 2015 + Sentinel-1</div>
      </div>
    `);
  }
}).addTo(map);

// ── Load GeoJSON ──────────────────────────────
async function loadGeoJSON(file, layer, label) {
  try {
    const res = await fetch(file);
    if (!res.ok) throw new Error(`${file} not found`);
    const data = await res.json();
    layer.addData(data);
    console.log(`✅ ${label}: ${data.features.length} features`);
    return data;
  } catch (err) {
    console.warn(`⚠️ ${label}:`, err.message);
    return null;
  }
}

Promise.all([
  loadGeoJSON('east_siang_flood_2026.geojson', floodLayer, 'Flood'),
  loadGeoJSON('east_siang_flooded_agriculture_2026.geojson', agricultureLayer, 'Agriculture'),
  loadGeoJSON('east_siang_affected_settlements_2026.geojson', settlementLayer, 'Settlement')
]).then(() => {
  if (floodLayer.getBounds().isValid()) {
    map.fitBounds(floodLayer.getBounds(), { padding: [45, 45] });
  }
});

// ── Toggle checkboxes (sidebar layer switches) ─
const floodCb      = document.getElementById('floodLayer');
const settleCb     = document.getElementById('settlementLayer');
const agriCb       = document.getElementById('agricultureLayer');
const roadCb       = document.getElementById('roadLayer');

floodCb?.addEventListener('change', function() {
  this.checked ? floodLayer.addTo(map) : map.removeLayer(floodLayer);
});
settleCb?.addEventListener('change', function() {
  this.checked ? settlementLayer.addTo(map) : map.removeLayer(settlementLayer);
});
agriCb?.addEventListener('change', function() {
  this.checked ? agricultureLayer.addTo(map) : map.removeLayer(agricultureLayer);
});
roadCb?.addEventListener('change', function() {
  if (this.checked) {
    this.checked = false; // revert
    showToast('Road layer coming soon — OSM extraction pending.');
  }
});

// ── Focus / zoom helpers ───────────────────────
function focusLayer(layer, checkbox, label) {
  if (!layer.getBounds().isValid()) {
    showToast(`${label} data not yet loaded.`);
    return;
  }
  if (checkbox && !checkbox.checked) {
    checkbox.checked = true;
    layer.addTo(map);
  }
  if (map.hasLayer(floodLayer)) map.removeLayer(floodLayer);
  map.fitBounds(layer.getBounds(), { padding: [90, 90], maxZoom: 15 });
  layer.bringToFront();
}

document.getElementById('focusSettlements')?.addEventListener('click', () =>
  focusLayer(settlementLayer, settleCb, 'Settlement'));
document.getElementById('focusAgriculture')?.addEventListener('click', () =>
  focusLayer(agricultureLayer, agriCb, 'Agriculture'));

// Dbl-click flood checkbox → restore overview
floodCb?.addEventListener('dblclick', () => {
  floodLayer.addTo(map);
  if (floodLayer.getBounds().isValid()) {
    map.fitBounds(floodLayer.getBounds(), { padding: [45, 45] });
  }
});

// ── Stats ─────────────────────────────────────
const statsData = {
  floodedArea: '28.46 km²',
  affectedRoads: '--',
  affectedSettlements: '0.00141 km²',
  affectedAgriculture: '0.00795 km²'
};

document.getElementById('floodedArea').textContent         = statsData.floodedArea;
document.getElementById('affectedRoads').textContent       = statsData.affectedRoads;
document.getElementById('affectedSettlements').textContent = statsData.affectedSettlements;
document.getElementById('affectedAgriculture').textContent = statsData.affectedAgriculture;

// ── Toast helper ──────────────────────────────
function showToast(msg) {
  let t = document.getElementById('fw-toast');
  if (!t) {
    t = document.createElement('div');
    t.id = 'fw-toast';
    t.style.cssText = `
      position:fixed;bottom:24px;left:50%;transform:translateX(-50%);
      background:rgba(7,18,34,0.95);border:1px solid rgba(56,189,248,0.3);
      color:#e2eaf5;padding:10px 20px;border-radius:10px;font-size:12px;
      font-family:Inter,sans-serif;z-index:9999;pointer-events:none;
      box-shadow:0 4px 20px rgba(0,0,0,0.5);transition:opacity 0.3s;
      backdrop-filter:blur(16px);
    `;
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.style.opacity = '1';
  clearTimeout(t._timer);
  t._timer = setTimeout(() => { t.style.opacity = '0'; }, 3500);
}

console.log('🌊 FLOODWATCH loaded — East Siang 2026 Monsoon Event');
