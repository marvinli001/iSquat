import Link from "next/link";
import { notFound } from "next/navigation";
import { MapPinIcon, StarIcon } from "@/components/Icons";
import SessionControls from "@/components/SessionControls";
import {
  defaultReviews,
  nearbyToilets,
  reviewsBySlug,
  toilets,
} from "@/lib/mockData";

type PageProps = {
  params: { id: string };
};

export default function ToiletDetail({ params }: PageProps) {
  const toilet = toilets.find((item) => item.id === params.id);

  if (!toilet) {
    notFound();
  }

  const reviews = reviewsBySlug[toilet.slug] ?? defaultReviews;
  const mapQuery = encodeURIComponent(`${toilet.name} ${toilet.address}`);
  const googleMaps = `https://maps.google.com/?q=${mapQuery}`;
  const appleMaps = `https://maps.apple.com/?q=${mapQuery}`;
  const nearby = nearbyToilets
    .filter((item) => item.slug !== toilet.slug)
    .slice(0, 3);

  return (
    <main className="page detail-page">
      <header className="detail-hero" data-tone={toilet.tone}>
        <nav className="detail-nav">
          <Link className="btn ghost" href="/">
            Back to home
          </Link>
          <div className="nav-actions">
            <SessionControls />
          </div>
        </nav>

        <div className="detail-header">
          <div>
            <p className="eyebrow">Auckland - {toilet.district}</p>
            <h1 className="detail-title">{toilet.name}</h1>
            <div className="rating-line">
              <StarIcon className="icon-star" />
              <span className="rating-score">{toilet.rating.toFixed(1)}</span>
              <span className="rating-count">
                ({toilet.reviewCount} reviews)
              </span>
              <span className="rating-sep">|</span>
              <span className="rating-distance">{toilet.distance} away</span>
            </div>
            <div className="detail-address">
              <MapPinIcon className="icon-pin" />
              <span>{toilet.address}</span>
              <details className="map-actions">
                <summary>Open in maps</summary>
                <div className="map-links">
                  <a href={googleMaps} rel="noreferrer" target="_blank">
                    Google Maps
                  </a>
                  <a href={appleMaps} rel="noreferrer" target="_blank">
                    Apple Maps
                  </a>
                </div>
              </details>
            </div>
          </div>
          <div className="detail-actions">
            <button className="btn primary" type="button">
              Find nearest toilet
            </button>
            <button className="btn outline" type="button">
              Add a review
            </button>
            <p className="note">
              Sign in required to submit reviews or upload photos.
            </p>
          </div>
        </div>
      </header>

      <section className="detail-body">
        <div className="detail-grid">
          <div className="detail-main">
            <div className="panel">
              <div className="panel-head">
                <h2>Map preview</h2>
                <span className="panel-note">Tap address to navigate</span>
              </div>
              <div className="map-preview" data-tone={toilet.tone}>
                <div className="map-overlay">
                  {toilet.name} - {toilet.district}
                </div>
              </div>
            </div>

            <div className="panel">
              <div className="panel-head">
                <h2>Photos</h2>
                <span className="panel-note">
                  Max 3 approved photos per member, per location
                </span>
              </div>
              <div className="photo-grid">
                <div className="photo-tile" data-tone={toilet.tone} />
                <div className="photo-tile" data-tone="citrus" />
                <div className="photo-tile" data-tone="amber" />
              </div>
            </div>

            <div className="panel">
              <div className="panel-head">
                <h2>Reviews</h2>
                <span className="panel-note">Newest first</span>
              </div>
              <div className="review-list">
                {reviews.map((review) => (
                  <div className="review-card" key={review.id}>
                    <div className="review-head">
                      <div className="review-name">{review.name}</div>
                      <div className="review-rating">
                        <StarIcon className="icon-star" />
                        <span>{review.rating.toFixed(1)}</span>
                      </div>
                    </div>
                    <p className="review-body">{review.body}</p>
                    <div className="review-date">{review.date}</div>
                  </div>
                ))}
              </div>
              <div className="review-cta">
                <button className="btn primary" type="button">
                  Sign in to review
                </button>
                <button className="btn ghost" type="button">
                  Upload photos
                </button>
              </div>
            </div>
          </div>

          <aside className="detail-sidebar">
            <div className="panel">
              <h3>Access notes</h3>
              <p className="panel-body">{toilet.accessNotes}</p>
            </div>
            <div className="panel">
              <h3>Facilities</h3>
              <div className="chip-row">
                {toilet.tags.map((tag) => (
                  <span className="chip" key={tag}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <div className="panel">
              <h3>Admin status</h3>
              <p className="panel-body">
                Approved location. New reviews and photos are moderated.
              </p>
              <button className="btn outline" type="button">
                Report an issue
              </button>
            </div>
            <div className="panel">
              <h3>Nearby picks</h3>
              <div className="nearby-list">
                {nearby.map((item) => (
                  <Link className="nearby-item" href={`/toilet/${item.id}`} key={item.id}>
                    <div className="nearby-name">{item.name}</div>
                    <div className="nearby-meta">
                      {item.district} - {item.rating.toFixed(1)}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
