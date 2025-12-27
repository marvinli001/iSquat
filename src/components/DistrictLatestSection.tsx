"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { StarIcon } from "@/components/Icons";
import type { Toilet } from "@/lib/mockData";

type DistrictLatestSectionProps = {
  districts: string[];
  toilets: Toilet[];
};

export default function DistrictLatestSection({
  districts,
  toilets,
}: DistrictLatestSectionProps) {
  const defaultDistrict = districts[0] ?? "";
  const [selectedDistrict, setSelectedDistrict] = useState(defaultDistrict);

  const latestToilets = useMemo(() => {
    if (!selectedDistrict) {
      return toilets.slice(0, 4);
    }

    const filtered = toilets.filter(
      (toilet) => toilet.district === selectedDistrict
    );
    const source = filtered.length > 0 ? filtered : toilets;
    return source.slice(0, 4);
  }, [selectedDistrict, toilets]);

  const subtitle = selectedDistrict
    ? `Recently added toilets in ${selectedDistrict}.`
    : "Recently added toilets across Auckland.";

  return (
    <>
      <section className="section">
        <div className="section-head">
          <div>
            <h2 className="section-title">Filter by district</h2>
            <p className="section-sub">
              Pick an Auckland area to see the latest additions.
            </p>
          </div>
          <button
            className="btn ghost"
            type="button"
            onClick={() => setSelectedDistrict(defaultDistrict)}
          >
            Reset
          </button>
        </div>
        <div className="chip-row">
          {districts.map((district) => (
            <button
              className="chip"
              data-active={district === selectedDistrict ? "true" : "false"}
              key={district}
              type="button"
              onClick={() => setSelectedDistrict(district)}
            >
              {district}
            </button>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <div>
            <h2 className="section-title">Latest in the area</h2>
            <p className="section-sub">{subtitle}</p>
          </div>
          <button className="btn ghost" type="button">
            See more
          </button>
        </div>
        <div className="latest-grid">
          {latestToilets.map((toilet) => (
            <Link
              className="toilet-card"
              href={`/toilet/${toilet.id}`}
              key={toilet.id}
            >
              <div className="card-media" data-tone={toilet.tone}>
                <div className="card-chip">Approved</div>
                <div className="card-rating">
                  <StarIcon className="icon-star" />
                  <span>{toilet.rating.toFixed(1)}</span>
                  <span className="card-rating-count">
                    ({toilet.reviewCount})
                  </span>
                </div>
              </div>
              <div className="card-body">
                <div className="card-title">{toilet.name}</div>
                <div className="card-meta">
                  {toilet.district} - {toilet.distance}
                </div>
                <div className="card-tags">
                  {toilet.tags.map((tag) => (
                    <span className="tag" key={tag}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
