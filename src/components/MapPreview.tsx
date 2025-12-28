"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { LayerGroup, Map as LeafletMap } from "leaflet";
import type { Toilet } from "@/lib/mockData";

const TILE_URL = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
const TILE_ATTR =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

type MapPreviewProps = {
  toilet: Toilet;
  nearby: Toilet[];
};

type LeafletModule = typeof import("leaflet");

export default function MapPreview({ toilet, nearby }: MapPreviewProps) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<LeafletMap | null>(null);
  const markerLayer = useRef<LayerGroup | null>(null);
  const leafletRef = useRef<LeafletModule | null>(null);
  const initializing = useRef(false);
  const [mapReady, setMapReady] = useState(false);
  const router = useRouter();

  useEffect(() => {
    let active = true;

    if (!mapRef.current || mapInstance.current || initializing.current) {
      return;
    }

    initializing.current = true;

    const init = async () => {
      try {
        const { default: L } = await import("leaflet");
        if (!active || !mapRef.current) {
          return;
        }

        leafletRef.current = L;

        const map = L.map(mapRef.current, {
          zoomControl: false,
          scrollWheelZoom: false,
        });

        mapInstance.current = map;

        L.tileLayer(TILE_URL, {
          attribution: TILE_ATTR,
          maxZoom: 19,
        }).addTo(map);

        markerLayer.current = L.layerGroup().addTo(map);

        requestAnimationFrame(() => {
          map.invalidateSize();
        });

        setMapReady(true);
        initializing.current = false;
      } catch (error) {
        initializing.current = false;
        console.error("Failed to load Leaflet.", error);
      }
    };

    init();

    return () => {
      active = false;
      initializing.current = false;
      mapInstance.current?.remove();
      mapInstance.current = null;
      markerLayer.current = null;
      leafletRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapInstance.current;
    const layer = markerLayer.current;
    const L = leafletRef.current;
    if (!map || !layer || !L || !mapReady) {
      return;
    }

    layer.clearLayers();

    const bounds = L.latLngBounds([]);
    const mainPoint = L.latLng(toilet.lat, toilet.lng);
    bounds.extend(mainPoint);

    const mainMarker = L.circleMarker(mainPoint, {
      radius: 10,
      color: "#1d1a17",
      weight: 2,
      fillColor: "#ff7a45",
      fillOpacity: 0.9,
    }).addTo(layer);

    mainMarker.bindTooltip(toilet.name, {
      direction: "top",
      offset: [0, -10],
      className: "map-tooltip map-tooltip-main",
    });

    nearby.forEach((item) => {
      const point = L.latLng(item.lat, item.lng);
      bounds.extend(point);

      const marker = L.circleMarker(point, {
        radius: 8,
        color: "#1d1a17",
        weight: 2,
        fillColor: "#fff4e8",
        fillOpacity: 0.95,
      }).addTo(layer);

      marker.bindTooltip(item.name, {
        direction: "top",
        offset: [0, -8],
        className: "map-tooltip",
      });

      marker.on("click", () => {
        router.push(`/toilet/${item.id}`);
      });
    });

    if (nearby.length > 0) {
      map.fitBounds(bounds.pad(0.2), { maxZoom: 16 });
    } else {
      map.setView(mainPoint, 16);
    }
  }, [mapReady, nearby, toilet, router]);

  return (
    <div className="map-preview" data-tone={toilet.tone}>
      <div
        className="map-canvas"
        ref={mapRef}
        aria-label={`Map preview for ${toilet.name}`}
      />
      <div className="map-overlay">
        {toilet.name} - {toilet.district}
      </div>
    </div>
  );
}
