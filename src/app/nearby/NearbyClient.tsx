"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { StarIcon } from "@/components/Icons";
import type { Toilet } from "@/lib/mockData";

type Coordinates = {
  lat: number;
  lng: number;
};

type NearbyClientProps = {
  toilets: Toilet[];
};

type NearbyToilet = Toilet & {
  distanceKm: number;
  distanceLabel: string;
};

const toRadians = (value: number) => (value * Math.PI) / 180;

const distanceKm = (
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
) => {
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

export default function NearbyClient({ toilets }: NearbyClientProps) {
  const [status, setStatus] = useState<"idle" | "locating" | "ready" | "error">(
    "idle"
  );
  const [coords, setCoords] = useState<Coordinates | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setStatus("error");
      setErrorMessage("Location is not supported on this device.");
      return;
    }

    setStatus("locating");
    setErrorMessage(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setStatus("ready");
      },
      (error) => {
        const message =
          error.code === 1
            ? "Enable location to see toilets near you."
            : "Location unavailable. Please try again.";
        setStatus("error");
        setErrorMessage(message);
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 }
    );
  }, []);

  useEffect(() => {
    requestLocation();
  }, [requestLocation]);

  const sortedToilets = useMemo<NearbyToilet[]>(() => {
    if (!coords) {
      return [];
    }

    return toilets
      .map((toilet) => {
        const distance = distanceKm(
          coords.lat,
          coords.lng,
          toilet.lat,
          toilet.lng
        );
        return {
          ...toilet,
          distanceKm: distance,
          distanceLabel: formatDistance(distance),
        };
      })
      .sort((a, b) => a.distanceKm - b.distanceKm);
  }, [coords, toilets]);

  const actionLabel =
    status === "locating"
      ? "Locating..."
      : status === "ready"
        ? "Refresh location"
        : "Enable location";

  return (
    <main className="page list-page with-back">
      <nav className="subpage-nav">
        <Link className="btn ghost back-link" href="/">
          Back to home
        </Link>
      </nav>

      <header className="list-hero">
        <p className="eyebrow">Nearby list</p>
        <h1 className="list-title">Toilets near you</h1>
        <p className="list-subtitle">
          Sorted from closest to farthest based on your current location.
        </p>
        <div className="nearby-actions">
          <button
            className="btn primary"
            disabled={status === "locating"}
            onClick={requestLocation}
            type="button"
          >
            {actionLabel}
          </button>
          <Link className="btn ghost" href="/latest">
            Browse all
          </Link>
        </div>
        {status === "locating" ? (
          <p className="nearby-note">Finding your location...</p>
        ) : null}
        {status === "error" ? (
          <p className="nearby-note">{errorMessage}</p>
        ) : null}
      </header>

      {status !== "ready" ? (
        <section className="panel nearby-empty">
          <h2>Location needed</h2>
          <p className="panel-body">
            Allow location access to show toilets sorted by distance.
          </p>
        </section>
      ) : (
        <div className="list-view">
          {sortedToilets.map((toilet) => (
            <Link className="list-item" href={`/toilet/${toilet.id}`} key={toilet.id}>
              <div className="list-thumb" data-tone={toilet.tone} />
              <div className="list-body">
                <div className="list-title-row">
                  <div className="list-item-title">{toilet.name}</div>
                  <div className="list-score">
                    <StarIcon className="icon-star" />
                    <span>{toilet.rating.toFixed(1)}</span>
                  </div>
                </div>
                <div className="list-meta">
                  {toilet.district} · {toilet.distanceLabel} away ·{" "}
                  {toilet.reviewCount} reviews
                </div>
                <div className="list-tags">
                  {toilet.tags.slice(0, 3).map((tag) => (
                    <span className="tag" key={tag}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
