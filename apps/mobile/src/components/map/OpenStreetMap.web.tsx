import { createElement, useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { colors } from '@/theme';
import type { OpenStreetMapPoint } from './OpenStreetMap';

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

function safeJson(value: unknown) { return JSON.stringify(value).replace(/<\//g, '<\\/'); }

function mapHtml(props: Props) {
  const tileUrl = process.env.EXPO_PUBLIC_NINIBU_MAP_TILE_URL?.trim() || DEFAULT_TILE_URL;
  const points = props.points.map((point) => ({ id:String(point.id), lat:point.latitude, lng:point.longitude, title:point.title, subtitle:point.subtitle || '' }));
  const state = { points, center:props.center, selectedId:props.selectedId == null ? null : String(props.selectedId), userLocation:props.userLocation || null, userAccuracy:props.userAccuracy || null, focusUser:!!props.focusUser };
  return `<!doctype html><html lang="fa" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no"><link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.css"><style>html,body,#map{width:100%;height:100%;margin:0;background:#f3f1f6}.leaflet-container{font-family:sans-serif}.pin{display:block;width:22px;height:22px;border:4px solid #fff;border-radius:50% 50% 50% 0;background:#6846D6;box-shadow:0 4px 12px rgba(54,42,96,.28);transform:rotate(-45deg)}.pin.sel{width:28px;height:28px;background:#23896f}.user{display:block;width:16px;height:16px;border:3px solid #fff;border-radius:50%;background:#1683F3;box-shadow:0 2px 9px rgba(22,131,243,.45)}</style></head><body><div id="map"></div><script src="https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.js"></script><script>
const state=${safeJson(state)}; const map=L.map('map',{zoomControl:true,attributionControl:true}).setView([state.center.latitude,state.center.longitude],12); L.tileLayer(${safeJson(tileUrl)},{maxZoom:19,attribution:'&copy; OpenStreetMap contributors'}).addTo(map);
const icon=(sel)=>L.divIcon({className:'',html:'<span class="pin '+(sel?'sel':'')+'"></span>',iconSize:[sel?34:28,sel?34:28],iconAnchor:[14,24]});
const markerPoints=[]; state.points.forEach(p=>{const m=L.marker([p.lat,p.lng],{icon:icon(String(p.id)===state.selectedId)}).addTo(map);m.bindTooltip('<strong>'+String(p.title).replace(/[<>]/g,'')+'</strong>',{direction:'top'});m.on('click',()=>parent.postMessage({source:'ninibu-map',id:String(p.id)},'*'));markerPoints.push([p.lat,p.lng]);});
if(state.userLocation){const ll=[state.userLocation.latitude,state.userLocation.longitude];if(state.userAccuracy)L.circle(ll,{radius:state.userAccuracy,color:'#1683F3',weight:1,fillOpacity:.08}).addTo(map);L.marker(ll,{icon:L.divIcon({className:'',html:'<span class="user"></span>',iconSize:[20,20],iconAnchor:[10,10]})}).addTo(map);if(state.focusUser)map.setView(ll,14);}
if(!state.focusUser&&markerPoints.length>1)map.fitBounds(markerPoints,{padding:[34,34],maxZoom:14});else if(!state.focusUser&&markerPoints.length===1)map.setView(markerPoints[0],15);
</script></body></html>`;
}

export function OpenStreetMap(props: Props) {
  const onSelectRef = useRef(props.onSelect);
  onSelectRef.current = props.onSelect;
  useEffect(() => {
    const handler = (event: MessageEvent) => {
      const data = event.data as { source?: string; id?: string } | undefined;
      if (data?.source === 'ninibu-map' && data.id) onSelectRef.current?.(data.id);
    };
    globalThis.addEventListener?.('message', handler as EventListener);
    return () => globalThis.removeEventListener?.('message', handler as EventListener);
  }, []);
  const html = mapHtml(props);
  return <View style={[styles.wrap,{height:props.height ?? 330}]}>{createElement('iframe', { title:'نقشه نینیبو', srcDoc:html, style:{border:0,width:'100%',height:'100%',display:'block'}, sandbox:'allow-scripts allow-same-origin', referrerPolicy:'no-referrer' })}</View>;
}

const styles=StyleSheet.create({wrap:{width:'100%',overflow:'hidden',borderRadius:18,borderWidth:StyleSheet.hairlineWidth,borderColor:colors.border,backgroundColor:'#F3F1F6',marginTop:8,marginBottom:8}});
