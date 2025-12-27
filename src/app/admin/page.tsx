import Link from "next/link";
import { redirect } from "next/navigation";
import { StarIcon } from "@/components/Icons";
import { getCurrentUser } from "@/lib/auth";
import { signOut } from "@/app/auth/actions";

const pendingLocations = [
  {
    id: "p1",
    name: "Albert Park Gate WC",
    district: "CBD",
    submittedBy: "Ava",
    photos: 2,
    note: "Access code after 6pm. Entry near the east gate.",
  },
  {
    id: "p2",
    name: "Point Chevalier Foreshore WC",
    district: "West",
    submittedBy: "Liam",
    photos: 1,
    note: "Signage is small. Best landmark is the lifeguard hut.",
  },
  {
    id: "p3",
    name: "Sylvia Park Upper Level WC",
    district: "East",
    submittedBy: "Mia",
    photos: 3,
    note: "Located behind the food court elevators.",
  },
];

const pendingReviews = [
  {
    id: "r1",
    location: "Wynyard Wharf Restrooms",
    rating: 4.6,
    submittedBy: "Noah",
    photos: 2,
    snippet: "Clean floors, fresh scent, and short line.",
  },
  {
    id: "r2",
    location: "Aotea Square Facilities",
    rating: 4.2,
    submittedBy: "Harper",
    photos: 1,
    snippet: "Crowded after events but staff restock quickly.",
  },
  {
    id: "r3",
    location: "Takapuna Beach Pavilion",
    rating: 4.9,
    submittedBy: "Theo",
    photos: 3,
    snippet: "Showers are spotless. Great for beach days.",
  },
];

export default async function AdminPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth");
  }

  if (user.role !== "admin") {
    redirect("/dashboard");
  }

  return (
    <main className="page admin-page with-back">
      <nav className="subpage-nav">
        <Link className="btn ghost back-link" href="/">
          Back to home
        </Link>
      </nav>
      <header className="sub-hero">
        <div>
          <p className="eyebrow">Admin console</p>
          <h1 className="hero-title">Approve toilets and reviews</h1>
          <p className="hero-subtitle">
            Only approved locations, photos, and ratings appear on iSquat.
          </p>
        </div>
        <div className="sub-hero-actions">
          <form action={signOut}>
            <button className="btn ghost" type="submit">
              Sign out
            </button>
          </form>
          <button className="btn primary" type="button">
            Approve all clean items
          </button>
        </div>
      </header>

      <section className="section">
        <div className="section-head">
          <div>
            <h2 className="section-title">Pending toilet locations</h2>
            <p className="section-sub">
              Review new submissions before they appear on the map.
            </p>
          </div>
        </div>
        <div className="admin-grid">
          {pendingLocations.map((item) => (
            <div className="admin-card" key={item.id}>
              <div className="admin-card-head">
                <div>
                  <div className="admin-card-title">{item.name}</div>
                  <div className="admin-card-meta">
                    {item.district} - Submitted by {item.submittedBy}
                  </div>
                </div>
                <div className="admin-card-badge">{item.photos} photos</div>
              </div>
              <p className="admin-card-note">{item.note}</p>
              <div className="admin-actions">
                <button className="btn primary" type="button">
                  Approve
                </button>
                <button className="btn outline" type="button">
                  Edit details
                </button>
                <button className="btn ghost" type="button">
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <div>
            <h2 className="section-title">Pending reviews and photos</h2>
            <p className="section-sub">
              Approve new ratings before they affect the average score.
            </p>
          </div>
        </div>
        <div className="admin-grid">
          {pendingReviews.map((review) => (
            <div className="admin-card" key={review.id}>
              <div className="admin-card-head">
                <div>
                  <div className="admin-card-title">{review.location}</div>
                  <div className="admin-card-meta">
                    Submitted by {review.submittedBy}
                  </div>
                </div>
                <div className="admin-card-rating">
                  <StarIcon className="icon-star" />
                  {review.rating.toFixed(1)}
                </div>
              </div>
              <p className="admin-card-note">{review.snippet}</p>
              <div className="admin-card-meta">{review.photos} photos</div>
              <div className="admin-actions">
                <button className="btn primary" type="button">
                  Approve
                </button>
                <button className="btn outline" type="button">
                  Request edit
                </button>
                <button className="btn ghost" type="button">
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
