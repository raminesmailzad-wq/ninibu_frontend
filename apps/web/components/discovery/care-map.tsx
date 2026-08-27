"use client";

import { useEffect, useRef } from "react";
import maplibregl, { type Map as MapLibreMap, type Marker } from "maplibre-gl";
import type { CareLocation } from "@ninibu/types";

const defaultCenter: [number, number] = [51.389, 35.6892];

export function CareMap({ locations, selectedId, onSelect }: { locations: CareLocation[]; selectedId?: number; onSelect: (id: number) => void }) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const markersRef = useRef<Marker[]>([]);

  useEffect(() => {
    if (!hostRef.current || mapRef.current) return;
    const tileURL = process.env.NEXT_PUBLIC_NINIBU_MAP_TILE_URL || "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
    const map = new maplibregl.Map({
      container: hostRef.current,
      center: defaultCenter,
      zoom: 10.5,
      attributionControl: false,
      style: {
        version: 8,
        sources: { osm: { type: "raster", tiles: [tileURL], tileSize: 256, attribution: "© OpenStreetMap contributors" } },
        layers: [{ id: "osm", type: "raster", source: "osm" }]
      }
    });
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-left");
    map.addControl(new maplibregl.AttributionControl({ compact: true }), "bottom-left");
    mapRef.current = map;
    return () => { markersRef.current.forEach((marker) => marker.remove()); markersRef.current = []; map.remove(); mapRef.current = null; };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];
    const points = locations.filter((item) => typeof item.latitude === "number" && typeof item.longitude === "number");
    const bounds = new maplibregl.LngLatBounds();
    for (const item of points) {
      const el = document.createElement("button");
      el.type = "button";
      el.className = `ninibu-map-marker${item.id === selectedId ? " is-selected" : ""}`;
      el.title = item.name;
      el.setAttribute("aria-label", item.name);
      el.addEventListener("click", () => onSelect(item.id));
      const marker = new maplibregl.Marker({ element: el }).setLngLat([item.longitude!, item.latitude!]).addTo(map);
      markersRef.current.push(marker);
      bounds.extend([item.longitude!, item.latitude!]);
    }
    if (points.length === 1) map.easeTo({ center: [points[0].longitude!, points[0].latitude!], zoom: 14 });
    else if (points.length > 1 && !bounds.isEmpty()) map.fitBounds(bounds, { padding: 44, maxZoom: 14, duration: 500 });
  }, [locations, selectedId, onSelect]);

  return <div className="care-map-shell"><div ref={hostRef} className="care-map" /><span className="care-map-attribution">© OpenStreetMap contributors</span></div>;
}
