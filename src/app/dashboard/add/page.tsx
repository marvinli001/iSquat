import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getDistricts } from "@/lib/toiletData";
import AddToiletForm from "./AddToiletForm";

export default async function AddToiletPage() {
  const user = await getCurrentUser();
  const districts = await getDistricts();

  if (!user) {
    redirect("/auth?redirectTo=/dashboard/add");
  }

  if (user.role === "admin") {
    redirect("/admin");
  }

  return (
    <main className="page with-back">
      <nav className="subpage-nav">
        <Link className="btn ghost back-link" href="/">
          Back to home
        </Link>
      </nav>

      <header className="sub-hero">
        <div>
          <p className="eyebrow">Submission</p>
          <h1 className="hero-title">Add a missing toilet</h1>
          <p className="hero-subtitle">
            Share location details so admins can verify and publish it.
          </p>
        </div>
        <div className="sub-hero-actions">
          <Link className="btn ghost" href="/dashboard">
            Back to dashboard
          </Link>
        </div>
      </header>

      <section className="section">
        <div className="section-head">
          <div>
            <h2 className="section-title">Location details</h2>
            <p className="section-sub">
              Include helpful notes like access codes or landmark tips.
            </p>
          </div>
        </div>
        <div className="auth-grid">
          <AddToiletForm districts={districts} />

          <div className="panel">
            <h2>Helpful details</h2>
            <p className="panel-body">
              Add anything that helps people locate the entrance quickly,
              including codes, gates, or nearby signage.
            </p>
            <div className="chip-row">
              <span className="chip">Access code</span>
              <span className="chip">Opening hours</span>
              <span className="chip">Nearby landmark</span>
              <span className="chip">Family friendly</span>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
