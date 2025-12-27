import Link from "next/link";
import ToiletList from "@/components/ToiletList";
import { topRatedToilets } from "@/lib/mockData";

export default function TopPage() {
  return (
    <main className="page list-page with-back">
      <nav className="subpage-nav">
        <Link className="btn ghost back-link" href="/">
          Back to home
        </Link>
      </nav>

      <header className="list-hero" data-tone="amber">
        <p className="eyebrow">Ranked list</p>
        <h1 className="list-title">Top rated across Auckland</h1>
        <p className="list-subtitle">
          Ten of the highest rated toilets right now.
        </p>
      </header>

      <ToiletList items={topRatedToilets} showRank />
    </main>
  );
}
