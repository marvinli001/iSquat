import Link from "next/link";
import ToiletList from "@/components/ToiletList";
import { getDistricts, getToilets } from "@/lib/toiletData";

type LatestPageProps = {
  searchParams?:
    | Promise<{ district?: string | string[] }>
    | { district?: string | string[] };
};

export default async function LatestPage({ searchParams }: LatestPageProps) {
  const [districts, toilets] = await Promise.all([getDistricts(), getToilets()]);
  const resolvedParams = await searchParams;
  const districtParam = Array.isArray(resolvedParams?.district)
    ? resolvedParams?.district[0]
    : resolvedParams?.district;
  const selected = districtParam ?? "All";
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
    <main className="page list-page with-back">
      <nav className="subpage-nav">
        <Link className="btn ghost back-link" href="/">
          Back to home
        </Link>
      </nav>

      <header className="list-hero" data-tone="apricot">
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
