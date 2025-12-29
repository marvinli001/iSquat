"use client";

import { useMemo } from "react";
import Link from "next/link";
import { StarIcon } from "@/components/Icons";

type TopRatedItem = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  rating: number;
  tone: string;
  photoUrl?: string;
};

type Coordinates = {
  lat: number;
  lng: number;
};

type TopRatedSectionProps = {
  items: TopRatedItem[];
  coords: Coordinates | null;
  status: "idle" | "locating" | "ready" | "error";
};

const toRadians = (value: number) => (value * Math.PI) / 180;

const distanceKm = (lat1: number, lng1: number, lat2: number, lng2: number) => {
  const earthRadiusKm = 6371;
  const deltaLat = toRadians(lat2 - lat1);
  const deltaLng = toRadians(lng2 - lng1);

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(deltaLng / 2) *
      Math.sin(deltaLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadiusKm * c;
};

const formatDistance = (kmValue: number) => {
  if (!Number.isFinite(kmValue)) {
    return "";
  }
  const meters = kmValue * 1000;
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  if (kmValue < 10) {
    return `${kmValue.toFixed(1)} km`;
  }
  return `${Math.round(kmValue)} km`;
};

export default function TopRatedSection({
  items,
  coords,
  status,
}: TopRatedSectionProps) {
  const distances = useMemo(() => {
    if (!coords) {
      return new Map<string, string>();
    }

    return new Map(
      items.map((item) => {
        const distance = distanceKm(coords.lat, coords.lng, item.lat, item.lng);
        return [item.id, formatDistance(distance)];
      })
    );
  }, [coords, items]);

  return (
    <div className="card-grid">
      {items.map((toilet) => {
        const distanceLabel = distances.get(toilet.id);
        const showDistance = status === "ready" && distanceLabel;

        return (
          <div className="rating-card" key={toilet.id}>
            <Link className="rating-card-link" href={`/toilet/${toilet.id}`}>
              <div
                className="card-media"
                data-tone={toilet.tone}
                style={
                  toilet.photoUrl
                    ? { backgroundImage: `url(${toilet.photoUrl})` }
                    : undefined
                }
              >
                <div className="card-rating">
                  <StarIcon className="icon-star" />
                  <span>{toilet.rating.toFixed(1)}</span>
                </div>
              </div>
              <div className="rating-card-title">{toilet.name}</div>
              {showDistance ? (
                <div className="rating-card-distance">
                  {distanceLabel} away
                </div>
              ) : null}
            </Link>
          </div>
        );
      })}
    </div>
  );
}
