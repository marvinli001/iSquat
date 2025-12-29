import Link from "next/link";
import { StarIcon } from "@/components/Icons";
import FindNearestButton from "@/components/FindNearestButton";
import { getTopRatedToilets } from "@/lib/toiletData";

export default async function Home() {
  const addMissingHref = "/auth?redirectTo=/dashboard/add";
  const topRatedToilets = await getTopRatedToilets();

  return (
    <main className="page home-page">
      <header className="hero">
        <nav className="top-nav">
          <div className="brand">
            <span className="brand-mark">iSquat</span>
            <span className="brand-sub">Auckland toilet ratings</span>
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
              <div className="rating-card-distance">{toilet.distance} away</div>
              {toilet.tags[0] ? (
                <div className="rating-card-tags">
                  <span className="tag" key={toilet.tags[0]}>
                    {toilet.tags[0]}
                  </span>
                </div>
              ) : null}
            </Link>
          ))}
        </div>
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
