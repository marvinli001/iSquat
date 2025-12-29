import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getToiletById } from "@/lib/toiletData";
import ReviewForm from "./ReviewForm";

type PageProps = {
  params: Promise<{ id: string }> | { id: string };
};

export default async function ReviewPage({ params }: PageProps) {
  const resolvedParams = await params;
  const toiletId = resolvedParams.id;
  const user = await getCurrentUser();

  if (!user) {
    redirect(`/auth?redirectTo=/toilet/${toiletId}/review`);
  }

  const toilet = await getToiletById(toiletId);
  if (!toilet) {
    notFound();
  }

  return (
    <main className="page with-back">
      <nav className="subpage-nav">
        <Link className="btn ghost back-link" href={`/toilet/${toilet.id}`}>
          Back to toilet
        </Link>
      </nav>

      <header className="sub-hero">
        <div>
          <p className="eyebrow">Review</p>
          <h1 className="hero-title">Share your visit</h1>
          <p className="hero-subtitle">
            Help others with a quick rating and optional photos.
          </p>
        </div>
      </header>

      <section className="section">
        <div className="auth-grid">
          <ReviewForm toiletId={toilet.id} toiletName={toilet.name} />
          <div className="panel">
            <h2>Review tips</h2>
            <p className="panel-body">
              Mention cleanliness, queues, lighting, and any access notes. Keep
              it short and helpful.
            </p>
            <div className="chip-row">
              <span className="chip">Cleanliness</span>
              <span className="chip">Queue time</span>
              <span className="chip">Accessibility</span>
              <span className="chip">Hours</span>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
