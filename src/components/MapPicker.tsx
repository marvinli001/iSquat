"use client";

import { useEffect, useRef } from "react";
import type { Map as LeafletMap, Marker } from "leaflet";

type MapPickerProps = {
  value: { lat: number; lng: number } | null;
  onChange: (value: { lat: number; lng: number }) => void;
  className?: string;
};

const defaultCenter = { lat: -36.8485, lng: 174.7633 };

export default function MapPicker({
  value,
  onChange,
  className = "map-preview",
}: MapPickerProps) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<LeafletMap | null>(null);
  const markerRef = useRef<Marker | null>(null);

  useEffect(() => {
    let active = true;

    if (!mapRef.current || mapInstance.current) {
      return;
    }

    const init = async () => {
      const { default: L } = await import("leaflet");
      if (!active || !mapRef.current) {
        return;
      }

      const map = L.map(mapRef.current, {
        zoomControl: true,
        scrollWheelZoom: true,
      });
      mapInstance.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
      }).addTo(map);

      const start = value ?? defaultCenter;
      map.setView([start.lat, start.lng], 14);

      if (value) {
        markerRef.current = L.marker([value.lat, value.lng]).addTo(map);
      }

      map.on("click", (event) => {
        const { lat, lng } = event.latlng;
        if (markerRef.current) {
          markerRef.current.setLatLng([lat, lng]);
        } else {
          markerRef.current = L.marker([lat, lng]).addTo(map);
        }
        onChange({ lat, lng });
      });

      requestAnimationFrame(() => {
        map.invalidateSize();
      });
    };

    void init();

    return () => {
      active = false;
      mapInstance.current?.remove();
      mapInstance.current = null;
      markerRef.current = null;
    };
  }, [onChange, value]);

  useEffect(() => {
    const map = mapInstance.current;
    const marker = markerRef.current;
    if (!map || !value) {
      return;
    }

    map.setView([value.lat, value.lng], map.getZoom());
    if (marker) {
      marker.setLatLng([value.lat, value.lng]);
    }
  }, [value]);

  return (
    <div className={className}>
      <div className="map-canvas" ref={mapRef} />
      <div className="map-overlay">Tap map to drop a pin</div>
    </div>
  );
}
