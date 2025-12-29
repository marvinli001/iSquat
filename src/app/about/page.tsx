import Link from "next/link";
import FindNearestButton from "@/components/FindNearestButton";

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

const highlights = [
  {
    title: "Approved locations only",
    body: "Every submission is verified by admins before it appears on the map.",
  },
  {
    title: "Ratings with context",
    body: "Scores come with quick notes so you know what to expect.",
  },
  {
    title: "Lightweight photo sets",
    body: "Up to three photos per location keeps pages fast to browse.",
  },
];

export default function AboutPage() {
  const addMissingHref = "/auth?redirectTo=/dashboard/add";

  return (
    <main className="page list-page with-back">
      <nav className="subpage-nav">
        <Link className="btn ghost back-link" href="/">
          Back to home
        </Link>
      </nav>

      <header className="list-hero" data-tone="sherbet">
        <p className="eyebrow">About iSquat</p>
        <h1 className="list-title">How it works</h1>
        <p className="list-subtitle">
          Auckland-only toilet reviews with verified locations and community
          ratings.
        </p>
      </header>

      <section className="section">
        <div className="section-head">
          <div>
            <h2 className="section-title">The flow</h2>
            <p className="section-sub">Three quick steps, no extra noise.</p>
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

      <section className="section">
        <div className="section-head">
          <div>
            <h2 className="section-title">What you will see</h2>
            <p className="section-sub">Focused info that stays quick to scan.</p>
          </div>
        </div>
        <div className="card-grid">
          {highlights.map((item) => (
            <div className="panel" key={item.title}>
              <div className="card-title">{item.title}</div>
              <p className="panel-body">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="cta-panel" data-tone="mango">
        <div>
          <h2>Ready to try iSquat?</h2>
          <p>Find a nearby restroom or add a missing one in minutes.</p>
        </div>
        <div className="footer-actions">
          <FindNearestButton
            className="btn primary"
            label="Find nearest toilet"
          />
          <Link className="btn outline" href={addMissingHref}>
            Add missing toilet
          </Link>
        </div>
      </section>
    </main>
  );
}
