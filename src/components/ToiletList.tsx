import Link from "next/link";
import { StarIcon } from "@/components/Icons";
import type { Toilet } from "@/lib/mockData";

type ToiletListProps = {
  items: Toilet[];
  showRank?: boolean;
};

export default function ToiletList({ items, showRank = false }: ToiletListProps) {
  return (
    <div className="list-view">
      {items.map((toilet, index) => (
        <Link className="list-item" href={`/toilet/${toilet.id}`} key={toilet.id}>
          <div className="list-thumb" data-tone={toilet.tone}>
            {showRank ? (
              <div className="list-rank">#{index + 1}</div>
            ) : null}
          </div>
          <div className="list-body">
            <div className="list-title-row">
              <div className="list-item-title">{toilet.name}</div>
              <div className="list-score">
                <StarIcon className="icon-star" />
                <span>{toilet.rating.toFixed(1)}</span>
              </div>
            </div>
            <div className="list-meta">
              {toilet.district} · {toilet.distance} · {toilet.reviewCount} reviews
            </div>
            <div className="list-tags">
              {toilet.tags.slice(0, 3).map((tag) => (
                <span className="tag" key={tag}>
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
