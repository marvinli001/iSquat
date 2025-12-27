import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { signOut } from "@/app/auth/actions";
import { toilets } from "@/lib/mockData";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  const sampleToiletId = toilets[0]?.id ?? "t1";

  if (!user) {
    redirect("/auth");
  }

  if (user.role === "admin") {
    redirect("/admin");
  }

  return (
    <main className="page">
      <header className="sub-hero">
        <div>
          <p className="eyebrow">Member dashboard</p>
          <h1 className="hero-title">Welcome back, {user.name ?? "friend"}</h1>
          <p className="hero-subtitle">
            Submit missing toilets, upload photos, and track review approvals.
          </p>
        </div>
        <div className="sub-hero-actions">
          <Link className="btn ghost" href="/">
            Back to home
          </Link>
          <form action={signOut}>
            <button className="btn ghost" type="submit">
              Sign out
            </button>
          </form>
        </div>
      </header>

      <section className="section">
        <div className="section-head">
          <div>
            <h2 className="section-title">Your next actions</h2>
            <p className="section-sub">
              Everything you submit is reviewed before it appears publicly.
            </p>
          </div>
        </div>
        <div className="card-grid">
          <div className="rating-card">
            <div className="rating-card-title">Submit a missing toilet</div>
            <div className="rating-card-meta">
              Add location details and optional photos.
            </div>
            <button className="btn primary" type="button">
              Start submission
            </button>
          </div>
          <div className="rating-card">
            <div className="rating-card-title">Write a review</div>
            <div className="rating-card-meta">
              Rate a toilet and add up to 3 photos.
            </div>
            <button className="btn outline" type="button">
              Add review
            </button>
          </div>
          <div className="rating-card">
            <div className="rating-card-title">Photo approvals</div>
            <div className="rating-card-meta">
              Track photos waiting on admin review.
            </div>
            <Link className="btn ghost" href={`/toilet/${sampleToiletId}`}>
              View pending
            </Link>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <div>
            <h2 className="section-title">Status overview</h2>
            <p className="section-sub">
              Summary of your recent submissions and reviews.
            </p>
          </div>
        </div>
        <div className="card-grid">
          <div className="rating-card">
            <div className="rating-card-title">2 location submissions</div>
            <div className="rating-card-meta">1 approved · 1 pending</div>
          </div>
          <div className="rating-card">
            <div className="rating-card-title">3 reviews</div>
            <div className="rating-card-meta">2 approved · 1 pending</div>
          </div>
          <div className="rating-card">
            <div className="rating-card-title">5 photos uploaded</div>
            <div className="rating-card-meta">3 approved · 2 pending</div>
          </div>
        </div>
      </section>
    </main>
  );
}
