"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toilets } from "@/lib/mockData";

type FindNearestButtonProps = {
  className?: string;
  label?: string;
};

const RESET_DELAY_MS = 2500;

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

const findNearestToilet = (lat: number, lng: number) => {
  let nearest = null as (typeof toilets)[number] | null;
  let nearestDistance = Number.POSITIVE_INFINITY;

  for (const toilet of toilets) {
    const distance = distanceKm(lat, lng, toilet.lat, toilet.lng);
    if (distance < nearestDistance) {
      nearest = toilet;
      nearestDistance = distance;
    }
  }

  return nearest;
};

export default function FindNearestButton({
  className = "btn ghost",
  label = "Find nearest",
}: FindNearestButtonProps) {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "locating" | "error">("idle");
  const resetTimer = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (resetTimer.current) {
        window.clearTimeout(resetTimer.current);
      }
    };
  }, []);

  const scheduleReset = () => {
    if (resetTimer.current) {
      window.clearTimeout(resetTimer.current);
    }
    resetTimer.current = window.setTimeout(() => {
      setStatus("idle");
    }, RESET_DELAY_MS);
  };

  const handleClick = () => {
    if (status === "locating") {
      return;
    }

    if (!navigator.geolocation) {
      setStatus("error");
      scheduleReset();
      return;
    }

    setStatus("locating");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const nearest = findNearestToilet(
          position.coords.latitude,
          position.coords.longitude
        );
        if (nearest) {
          router.push(`/toilet/${nearest.id}`);
          return;
        }
        setStatus("error");
        scheduleReset();
      },
      () => {
        setStatus("error");
        scheduleReset();
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  const labelText =
    status === "locating"
      ? "Finding nearest..."
      : status === "error"
        ? "Enable location"
        : label;

  return (
    <button
      className={className}
      data-status={status}
      disabled={status === "locating"}
      onClick={handleClick}
      type="button"
    >
      {labelText}
    </button>
  );
}
