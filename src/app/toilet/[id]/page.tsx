import Link from "next/link";
import { notFound } from "next/navigation";
import { AppleLogoIcon, GoogleMapsIcon, MapPinIcon, StarIcon } from "@/components/Icons";
import FindNearestButton from "@/components/FindNearestButton";
import MapPreview from "@/components/MapPreview";
import SessionControls from "@/components/SessionControls";
import {
  getNearbyToilets,
  getReviewsForToilet,
  getToiletById,
  getToiletPhotos,
  getToilets,
  isDatabaseMode,
} from "@/lib/toiletData";

type PageProps = {
  params: Promise<{ id: string }> | { id: string };
};

export default async function ToiletDetail({ params }: PageProps) {
  const resolvedParams = await params;
  const toilet = await getToiletById(resolvedParams.id);

  if (!toilet) {
    if (process.env.NODE_ENV !== "production" && !isDatabaseMode) {
      const toilets = await getToilets();
      return (
        <main className="page detail-page with-back">
          <nav className="subpage-nav">
            <Link className="btn ghost back-link" href="/">
              Back to home
            </Link>
          </nav>
          <section className="panel">
            <h2>Toilet not found</h2>
            <p className="panel-body">
              Try a sample toilet ID from the list below.
            </p>
            <div className="chip-row">
              {toilets.map((item) => (
                <Link className="chip" href={`/toilet/${item.id}`} key={item.id}>
                  {item.name}
                </Link>
              ))}
            </div>
          </section>
        </main>
      );
    }

    notFound();
  }

  const reviews = await getReviewsForToilet(toilet.id, toilet.slug);
  const mapQuery = encodeURIComponent(`${toilet.name} ${toilet.address}`);
  const googleMaps = `https://www.google.com/maps/dir/?api=1&destination=${mapQuery}`;
  const appleMaps = `https://maps.apple.com/?daddr=${mapQuery}`;
  const nearby = await getNearbyToilets(toilet);
  const photos = await getToiletPhotos(toilet.id);
  const visiblePhotos = photos.slice(0, 3);
  const placeholders = Math.max(0, 3 - visiblePhotos.length);
  const placeholderTones = [toilet.tone, "citrus", "amber"];
  const reviewHref = `/toilet/${toilet.id}/review`;

  return (
    <main className="page detail-page with-back">
      <header className="detail-hero" data-tone={toilet.tone}>
        <nav className="detail-nav">
          <Link className="btn ghost back-link" href="/">
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
              <div className="map-actions">
                <div className="map-address">{toilet.address}</div>
                <div className="map-links">
                  <a
                    className="map-link"
                    href={appleMaps}
                    rel="noreferrer"
                    target="_blank"
                  >
                    <AppleLogoIcon className="map-link-icon" />
                    Apple Maps
                  </a>
                  <a
                    className="map-link"
                    href={googleMaps}
                    rel="noreferrer"
                    target="_blank"
                  >
                    <GoogleMapsIcon className="map-link-icon" />
                    Google Maps
                  </a>
                </div>
              </div>
            </div>
          </div>
          <div className="detail-actions">
            <FindNearestButton
              className="btn primary"
              label="Find nearest toilet"
            />
            <Link className="btn outline" href={reviewHref}>
              Add a review
            </Link>
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
                <span className="panel-note">Tap a pin for nearby toilets</span>
              </div>
              <MapPreview toilet={toilet} nearby={nearby} />
            </div>

            <div className="panel">
              <div className="panel-head">
                <h2>Photos</h2>
                <span className="panel-note">
                  Max 3 approved photos per member, per location
                </span>
              </div>
              <div className="photo-grid">
                {visiblePhotos.map((photoUrl) => (
                  <div
                    className="photo-tile"
                    key={photoUrl}
                    style={{ backgroundImage: `url(${photoUrl})` }}
                  />
                ))}
                {Array.from({ length: placeholders }).map((_, index) => (
                  <div
                    className="photo-tile"
                    data-tone={placeholderTones[index % placeholderTones.length]}
                    key={`placeholder-${index}`}
                  />
                ))}
              </div>
            </div>

            <div className="panel">
              <div className="panel-head">
                <h2>Reviews</h2>
                <span className="panel-note">Newest first</span>
              </div>
              {reviews.length === 0 ? (
                <p className="panel-body">No reviews yet.</p>
              ) : (
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
              )}
              <div className="review-cta">
                <Link className="btn primary" href={reviewHref}>
                  Write a review
                </Link>
                <Link className="btn ghost" href={reviewHref}>
                  Upload photos
                </Link>
              </div>
            </div>
          </div>

          <aside className="detail-sidebar">
            <div className="panel">
              <h3>Location notes</h3>
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
