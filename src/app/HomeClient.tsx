"use client";

import { useState } from "react";
import Link from "next/link";
import FindNearestButton from "@/components/FindNearestButton";
import TopRatedSection from "@/components/TopRatedSection";
import { MapPinIcon } from "@/components/Icons";
import type { Toilet } from "@/lib/mockData";

type Coordinates = {
  lat: number;
  lng: number;
};

type LocationStatus = "idle" | "locating" | "ready" | "error";

type HomeClientProps = {
  topRatedToilets: Toilet[];
  addMissingHref: string;
};

export default function HomeClient({
  topRatedToilets,
  addMissingHref,
}: HomeClientProps) {
  const [status, setStatus] = useState<LocationStatus>("idle");
  const [coords, setCoords] = useState<Coordinates | null>(null);

  const requestLocation = () => {
    if (status === "locating") {
      return;
    }

    if (!navigator.geolocation) {
      setStatus("error");
      return;
    }

    setStatus("locating");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setStatus("ready");
      },
      () => {
        setStatus("error");
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 }
    );
  };

  const statusLabel =
    status === "ready"
      ? "Located"
      : status === "locating"
        ? "Locating..."
        : status === "error"
          ? "Location failed"
          : "Not located";

  const statusTitle =
    status === "ready" ? "Refresh location" : "Click to enable location";

  return (
    <main className="page home-page">
      <header className="hero">
        <nav className="top-nav">
          <div className="brand">
            <span className="brand-mark">iSquat</span>
            <span className="brand-sub">Auckland toilet ratings</span>
          </div>
          <div className="nav-actions">
            <button
              className="location-pill"
              data-status={status}
              onClick={requestLocation}
              disabled={status === "locating"}
              title={statusTitle}
              type="button"
            >
              <MapPinIcon className="location-pill-icon" />
              <span className="location-pill-label">{statusLabel}</span>
            </button>
          </div>
        </nav>

        <div className="hero-grid">
          <div className="hero-copy">
            <p className="eyebrow">Verified by admins. Powered by locals.</p>
            <h1 className="hero-title">Find the cleanest toilet in seconds.</h1>
            <p className="hero-subtitle">
              iSquat is an Auckland only review map for toilets. Rate visits,
              upload up to 3 photos, and help the community keep it fresh.
            </p>
            <div className="hero-actions">
              <FindNearestButton
                className="btn primary"
                label="Find nearest toilet"
              />
            </div>
            <div className="hero-links">
              <Link className="link-inline" href="/latest">
                See latest additions
              </Link>
              <span className="hero-links-sep">·</span>
              <Link className="link-inline" href="/about">
                How it works
              </Link>
            </div>
          </div>
        </div>
      </header>

      <section className="section">
        <div className="section-head">
          <div>
            <h2 className="section-title">Top rated across Auckland</h2>
            <p className="section-sub">
              Ten of the highest rated toilets right now.
            </p>
          </div>
          <Link className="btn ghost" href="/top">
            See top 10
          </Link>
        </div>
        <TopRatedSection items={topRatedToilets} coords={coords} status={status} />
      </section>

      <footer className="footer">
        <div className="footer-brand">iSquat</div>
        <div className="footer-note">
          Built for Auckland. Reviews require a verified account.
        </div>
        <div className="footer-actions">
          <Link className="btn ghost" href="/about">
            How it works
          </Link>
          <Link className="btn outline" href={addMissingHref}>
            Add missing toilet
          </Link>
          <Link className="btn ghost" href="/auth">
            Sign in
          </Link>
          <Link className="btn outline" href="/admin">
            Admin console
          </Link>
        </div>
      </footer>
    </main>
  );
}
