import { useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { WebView, type WebViewMessageEvent } from 'react-native-webview';
import { colors, typography } from '@/theme';

export type OpenStreetMapPoint = {
  id: string | number;
  latitude: number;
  longitude: number;
  title: string;
  subtitle?: string;
};

type Coordinate = { latitude: number; longitude: number };

type Props = {
  points: OpenStreetMapPoint[];
  center: Coordinate;
  selectedId?: string | number;
  userLocation?: Coordinate;
  userAccuracy?: number;
  focusUser?: boolean;
  onSelect?: (id: string) => void;
  height?: number;
};

const DEFAULT_TILE_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const LEAFLET_CSS_URLS = [
  'https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.css',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
  'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.css',
];
const LEAFLET_JS_URLS = [
  'https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.js',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
  'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.js',
];

function safeJson(value: unknown) {
  return JSON.stringify(value).replace(/<\//g, '<\\/');
}

function buildHtml() {
  const tileUrl = process.env.EXPO_PUBLIC_NINIBU_MAP_TILE_URL?.trim() || DEFAULT_TILE_URL;
  return `<!doctype html>
<html lang="fa" dir="rtl">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
${LEAFLET_CSS_URLS.map((url) => `<link rel="stylesheet" href="${url}" />`).join('\n')}
<style>
  html, body, #map { width:100%; height:100%; margin:0; padding:0; background:#f3f1f6; }
  body { overflow:hidden; font-family:sans-serif; -webkit-tap-highlight-color:transparent; }
  .leaflet-container { background:#f3f1f6; touch-action:none; }
  .leaflet-control-attribution { font-size:9px !important; direction:ltr; background:rgba(255,255,255,.82) !important; }
  .leaflet-control-zoom a { color:#5f45c7 !important; }
  .ninibu-div-icon, .ninibu-user-icon { background:transparent !important; border:0 !important; }
  .ninibu-map-marker {
    display:block; width:22px; height:22px; box-sizing:border-box;
    border:4px solid #fff; border-radius:50% 50% 50% 0;
    background:#6846D6; box-shadow:0 4px 12px rgba(54,42,96,.28);
    transform:rotate(-45deg); transform-origin:50% 50%;
  }
  .ninibu-map-marker.is-selected { width:28px; height:28px; background:#23896f; box-shadow:0 5px 15px rgba(35,137,111,.30); }
  .ninibu-user-dot {
    display:block; width:16px; height:16px; border:3px solid #fff; border-radius:50%;
    background:#1683F3; box-shadow:0 2px 9px rgba(22,131,243,.45);
  }
  .ninibu-tooltip { direction:rtl; text-align:right; min-width:110px; max-width:220px; }
  .ninibu-tooltip strong { font-size:12px; }
  .ninibu-tooltip span { display:block; margin-top:3px; color:#726b79; font-size:10px; line-height:1.6; }
  #fallback { position:absolute; inset:0; z-index:9999; display:none; align-items:center; justify-content:center; padding:24px; text-align:center; color:#665f6d; background:#f8f7fb; font-size:13px; line-height:1.9; }
</style>
</head>
<body>
<div id="map"></div>
<div id="fallback">نقشه در حال حاضر بارگذاری نشد. فهرست مراکز همچنان در پایین صفحه در دسترس است.</div>
<script>
const tileUrl = ${safeJson(tileUrl)};
const jsUrls = ${safeJson(LEAFLET_JS_URLS)};
let map = null;
let pointMarkers = {};
let userMarker = null;
let accuracyCircle = null;
let selectedId = null;
let pendingState = null;

function showFallback() {
  document.getElementById('fallback').style.display = 'flex';
}

function loadScript(index) {
  if (index >= jsUrls.length) { showFallback(); return; }
  const script = document.createElement('script');
  script.src = jsUrls[index];
  script.onload = initMap;
  script.onerror = function(){ loadScript(index + 1); };
  document.head.appendChild(script);
}

function escapeHtml(value) {
  return String(value || '').replace(/[&<>"']/g, function(char){
    return ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#039;' })[char];
  });
}

function markerIcon(active) {
  const size = active ? 34 : 28;
  const pinSize = active ? 28 : 22;
  return L.divIcon({
    className: 'ninibu-div-icon',
    html: '<span class="ninibu-map-marker' + (active ? ' is-selected' : '') + '"></span>',
    iconSize: [size, size],
    iconAnchor: [Math.round(size / 2), pinSize],
    tooltipAnchor: [0, -pinSize]
  });
}

function userIcon() {
  return L.divIcon({ className:'ninibu-user-icon', html:'<span class="ninibu-user-dot"></span>', iconSize:[20,20], iconAnchor:[10,10], tooltipAnchor:[0,-12] });
}

function setSelected(id, notify) {
  selectedId = id == null ? null : String(id);
  Object.keys(pointMarkers).forEach(function(key){ pointMarkers[key].setIcon(markerIcon(key === selectedId)); });
  const marker = selectedId ? pointMarkers[selectedId] : null;
  if (marker) {
    map.panTo(marker.getLatLng(), { animate:false });
    marker.openTooltip();
  }
  if (notify && selectedId && window.ReactNativeWebView) {
    window.ReactNativeWebView.postMessage(JSON.stringify({ type:'select', id:selectedId }));
  }
}

function syncState(state) {
  if (!map) { pendingState = state; return; }
  const points = Array.isArray(state.points) ? state.points : [];
  const nextIds = {};

  points.forEach(function(point){
    const id = String(point.id);
    nextIds[id] = true;
    let marker = pointMarkers[id];
    if (!marker) {
      marker = L.marker([point.lat, point.lng], { icon:markerIcon(id === selectedId), keyboard:false, riseOnHover:true }).addTo(map);
      marker.on('click', function(){ setSelected(id, true); });
      pointMarkers[id] = marker;
    } else {
      marker.setLatLng([point.lat, point.lng]);
      marker.setIcon(markerIcon(id === selectedId));
    }
    marker.bindTooltip('<div class="ninibu-tooltip"><strong>' + escapeHtml(point.title) + '</strong>' + (point.subtitle ? '<span>' + escapeHtml(point.subtitle) + '</span>' : '') + '</div>', { direction:'top', opacity:.96, className:'ninibu-tooltip-shell' });
  });

  Object.keys(pointMarkers).forEach(function(id){
    if (!nextIds[id]) { map.removeLayer(pointMarkers[id]); delete pointMarkers[id]; }
  });

  if (userMarker) { map.removeLayer(userMarker); userMarker = null; }
  if (accuracyCircle) { map.removeLayer(accuracyCircle); accuracyCircle = null; }
  if (state.userLocation) {
    const latlng = [state.userLocation.latitude, state.userLocation.longitude];
    if (Number.isFinite(state.userAccuracy) && state.userAccuracy > 0) {
      accuracyCircle = L.circle(latlng, { radius:Math.max(12, state.userAccuracy), color:'#1683F3', weight:1, opacity:.38, fillColor:'#1683F3', fillOpacity:.08, interactive:false }).addTo(map);
    }
    userMarker = L.marker(latlng, { icon:userIcon(), keyboard:false, zIndexOffset:1000 }).addTo(map).bindTooltip('موقعیت شما', { direction:'top' });
  }

  const all = points.map(function(point){ return [point.lat, point.lng]; });
  if (state.userLocation && state.focusUser) {
    map.setView([state.userLocation.latitude, state.userLocation.longitude], 14, { animate:false });
  } else if (all.length > 1) {
    map.fitBounds(all, { padding:[34,34], maxZoom:14, animate:false });
  } else if (all.length === 1) {
    map.setView(all[0], 15, { animate:false });
  } else if (state.center) {
    map.setView([state.center.latitude, state.center.longitude], 12, { animate:false });
  }
}

window.NinibuMap = {
  update: syncState,
  select: function(id){ setSelected(id == null ? null : String(id), false); }
};

function initMap() {
  if (!window.L || map) return;
  try {
    map = L.map('map', {
      zoomControl:true,
      attributionControl:true,
      preferCanvas:true,
      zoomAnimation:false,
      fadeAnimation:false,
      markerZoomAnimation:false,
      inertia:true,
      worldCopyJump:false
    }).setView([35.6892, 51.389], 11);
    L.tileLayer(tileUrl, {
      maxZoom:19,
      minZoom:3,
      tileSize:256,
      detectRetina:false,
      updateWhenIdle:true,
      updateWhenZooming:false,
      keepBuffer:5,
      attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
    }).addTo(map);
    if (pendingState) { const state = pendingState; pendingState = null; syncState(state); }
    setTimeout(function(){ map.invalidateSize(false); }, 60);
    if (window.ReactNativeWebView) window.ReactNativeWebView.postMessage(JSON.stringify({ type:'ready' }));
  } catch (error) {
    showFallback();
    if (window.ReactNativeWebView) window.ReactNativeWebView.postMessage(JSON.stringify({ type:'error', message:String(error) }));
  }
}

loadScript(0);
</script>
</body>
</html>`;
}

export function OpenStreetMap({ points, center, selectedId, userLocation, userAccuracy, focusUser = false, onSelect, height = 330 }: Props) {
  const webView = useRef<WebView>(null);
  const [loadError, setLoadError] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const html = useMemo(() => buildHtml(), []);
  const statePayload = useMemo(() => ({
    points: points.map((point) => ({ id:String(point.id), lat:point.latitude, lng:point.longitude, title:point.title, subtitle:point.subtitle || '' })),
    center,
    userLocation: userLocation || null,
    userAccuracy: userAccuracy ?? null,
    focusUser,
  }), [points, center.latitude, center.longitude, userLocation?.latitude, userLocation?.longitude, userAccuracy, focusUser]);

  function pushState() {
    webView.current?.injectJavaScript(`window.NinibuMap && window.NinibuMap.update(${safeJson(statePayload)}); true;`);
  }

  useEffect(() => {
    if (!mapReady) return;
    pushState();
  }, [mapReady, statePayload]);

  useEffect(() => {
    if (!mapReady) return;
    const selected = selectedId === undefined || selectedId === null ? 'null' : JSON.stringify(String(selectedId));
    webView.current?.injectJavaScript(`window.NinibuMap && window.NinibuMap.select(${selected}); true;`);
  }, [mapReady, selectedId]);

  function handleMessage(event: WebViewMessageEvent) {
    try {
      const message = JSON.parse(event.nativeEvent.data) as { type?: string; id?: string };
      if (message.type === 'ready') {
        setMapReady(true);
        setLoadError(false);
        setTimeout(pushState, 0);
      }
      if (message.type === 'select' && message.id) onSelect?.(message.id);
      if (message.type === 'error') setLoadError(true);
    } catch {
      // Ignore messages that are not emitted by the embedded map.
    }
  }

  if (loadError) {
    return <View style={[styles.fallback, { height }]}><Text style={styles.fallbackText}>نقشه در حال حاضر بارگذاری نشد. فهرست مراکز همچنان قابل استفاده است.</Text></View>;
  }

  return <View style={[styles.wrap, { height }]}>
    <WebView
      ref={webView}
      originWhitelist={['*']}
      source={{ html, baseUrl: 'https://ninibu.com' }}
      javaScriptEnabled
      domStorageEnabled
      cacheEnabled
      nestedScrollEnabled
      overScrollMode="never"
      androidLayerType="hardware"
      showsHorizontalScrollIndicator={false}
      showsVerticalScrollIndicator={false}
      onMessage={handleMessage}
      onLoadStart={() => { setMapReady(false); setLoadError(false); }}
      onError={() => setLoadError(true)}
      onShouldStartLoadWithRequest={(request) => request.url === 'about:blank' || request.url.startsWith('https://ninibu.com')}
      style={styles.webView}
    />
  </View>;
}

const styles = StyleSheet.create({
  wrap: { width:'100%', overflow:'hidden', borderRadius:18, borderWidth:StyleSheet.hairlineWidth, borderColor:colors.border, backgroundColor:'#F3F1F6', marginTop:8, marginBottom:8 },
  webView: { flex:1, backgroundColor:'#F3F1F6' },
  fallback: { width:'100%', alignItems:'center', justifyContent:'center', borderRadius:18, borderWidth:StyleSheet.hairlineWidth, borderColor:colors.border, backgroundColor:'#F8F7FB', paddingHorizontal:24, marginTop:8, marginBottom:8 },
  fallbackText: { fontFamily:typography.regular, fontSize:11.5, lineHeight:20, color:colors.muted, textAlign:'center', writingDirection:'rtl' },
});
