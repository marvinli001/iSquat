import Link from "next/link";
import ToiletList from "@/components/ToiletList";
import { districts, toilets } from "@/lib/mockData";

type LatestPageProps = {
  searchParams?: { district?: string };
};

export default function LatestPage({ searchParams }: LatestPageProps) {
  const selected = searchParams?.district ?? "All";
  const isValidDistrict = districts.includes(selected);
  const activeDistrict = isValidDistrict ? selected : "All";
  const filteredToilets = isValidDistrict
    ? toilets.filter((toilet) => toilet.district === selected)
    : toilets;

  const subtitle =
    activeDistrict === "All"
      ? "Recently added toilets across Auckland."
      : `Recently added toilets in ${activeDistrict}.`;

  return (
    <main className="page list-page">
      <nav className="subpage-nav">
        <Link className="btn ghost" href="/">
          Back to home
        </Link>
      </nav>

      <header className="list-hero">
        <p className="eyebrow">List view</p>
        <h1 className="list-title">Latest in the area</h1>
        <p className="list-subtitle">{subtitle}</p>
        <div className="chip-row">
          {["All", ...districts].map((district) => {
            const href =
              district === "All"
                ? "/latest"
                : `/latest?district=${encodeURIComponent(district)}`;
            return (
              <Link
                className="chip"
                data-active={district === activeDistrict ? "true" : "false"}
                href={href}
                key={district}
              >
                {district}
              </Link>
            );
          })}
        </div>
      </header>

      <ToiletList items={filteredToilets} />
    </main>
  );
}
