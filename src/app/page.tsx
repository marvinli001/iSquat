import Link from "next/link";
import { StarIcon } from "@/components/Icons";
import DistrictLatestSection from "@/components/DistrictLatestSection";
import FindNearestButton from "@/components/FindNearestButton";
import SessionControls from "@/components/SessionControls";
import { districts, topRatedToilets, toilets } from "@/lib/mockData";

const heroStats = [
  { value: "1,248", label: "Approved toilets" },
  { value: "4.6", label: "Avg rating across Auckland" },
];

const steps = [
  {
    title: "Mark a missing toilet",
    body: "Drop a pin, add a short note, and upload optional photos.",
  },
  {
    title: "Admins review",
    body: "Our team checks location details before anything goes live.",
  },
  {
    title: "Rate your visit",
    body: "Share a score and notes so the next person knows what to expect.",
  },
];

export default function Home() {
  const addMissingHref = "/auth?redirectTo=/dashboard/add";

  return (
    <main className="page home-page">
      <header className="hero">
        <nav className="top-nav">
          <div className="brand">
            <span className="brand-mark">iSquat</span>
            <span className="brand-sub">Auckland toilet ratings</span>
          </div>
          <div className="nav-actions">
            <FindNearestButton className="btn ghost" label="Find nearest" />
            <SessionControls />
          </div>
        </nav>

        <div className="hero-grid">
          <div className="hero-copy">
            <p className="eyebrow">Verified by admins, powered by locals</p>
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
              <Link className="btn outline" href={addMissingHref}>
                Add missing toilet
              </Link>
            </div>
            <div className="hero-stats">
              {heroStats.map((stat) => (
                <div className="stat" key={stat.label}>
                  <div className="stat-value">{stat.value}</div>
                  <div className="stat-label">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="hero-card" data-tone="sunset">
            <div className="hero-card-header">Auckland snapshot</div>
            <div className="hero-card-rating">
              <StarIcon className="icon-star" />
              <div>
                <div className="hero-card-score">4.6</div>
                <div className="hero-card-meta">Average rating today</div>
              </div>
            </div>
            <div className="hero-card-list">
              <div className="hero-card-row">
                <span>CBD</span>
                <span>4.7</span>
              </div>
              <div className="hero-card-row">
                <span>Waterfront</span>
                <span>4.8</span>
              </div>
              <div className="hero-card-row">
                <span>North Shore</span>
                <span>4.6</span>
              </div>
            </div>
            <div className="hero-card-footer">
              Only approved toilets appear on iSquat.
            </div>
          </div>
        </div>
      </header>

      <DistrictLatestSection districts={districts} toilets={toilets} />

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
        <div className="card-grid">
          {topRatedToilets.map((toilet) => (
            <Link
              className="rating-card"
              href={`/toilet/${toilet.id}`}
              key={toilet.id}
            >
              <div className="rating-card-head">
                <div className="rating-card-title">{toilet.name}</div>
                <div className="rating-card-score">
                  <StarIcon className="icon-star" />
                  {toilet.rating.toFixed(1)}
                </div>
              </div>
              <div className="rating-card-meta">
                {toilet.district} - {toilet.reviewCount} reviews
              </div>
              <div className="rating-card-tags">
                {toilet.tags.slice(0, 2).map((tag) => (
                  <span className="tag" key={tag}>
                    {tag}
                  </span>
                ))}
              </div>
              <div className="rating-card-distance">{toilet.distance} away</div>
            </Link>
          ))}
        </div>
      </section>

      <section className="cta-panel" data-tone="mango">
        <div>
          <h2>Missing a restroom nearby?</h2>
          <p>
            Submit a new toilet location with optional photos. Admins verify
            details before it appears on iSquat.
          </p>
        </div>
        <Link className="btn primary" href={addMissingHref}>
          Submit a location
        </Link>
      </section>

      <section className="section">
        <div className="section-head">
          <div>
            <h2 className="section-title">How it works</h2>
            <p className="section-sub">Simple steps for better restroom stops.</p>
          </div>
        </div>
        <div className="steps-grid">
          {steps.map((step) => (
            <div className="step-card" key={step.title}>
              <div className="step-title">{step.title}</div>
              <p className="step-body">{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="footer">
        <div className="footer-brand">iSquat</div>
        <div className="footer-note">
          Built for Auckland. Reviews require a verified account.
        </div>
        <div className="footer-actions">
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
